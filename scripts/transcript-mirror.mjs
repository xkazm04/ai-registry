#!/usr/bin/env node
/**
 * transcript-mirror - keep a copy of the agent harness's transcript files that outlives
 * the harness's own deletion (Claude Code removes a transcript 30 days after its last
 * write by default).
 *
 * Contract:
 *   - Bytes are captured before any parsing and whether or not they parse. Nothing here
 *     ever reads a transcript as JSON.
 *   - Bytes are stored as content-addressed chunks (sha256 of the raw chunk), so an
 *     append-only file recaptured later costs only its new tail plus one re-stored
 *     partial chunk.
 *   - `retire` may retire an older capture of a source only when a newer live capture of
 *     the same source is verified to hold every byte of it as a prefix: chunk-list
 *     prefix, a sha256 over the partial last chunk, and the whole-file sha256 recomputed
 *     over the newer capture's decompressed bytes. The newest capture of a source is never
 *     retired, even when the source file is gone (that is the point of the mirror).
 *   - When the byte budget is reached, new captures pause (exit 3). Nothing is evicted
 *     automatically; making room is an operator decision.
 *   - Source identity is the path relative to --root (forward slashes), never a native
 *     session id.
 *
 * Choices (measured on this machine's transcripts, 2026-10-15, same 80-file sample):
 *   - brotli, not gzip. gzip's 32 KiB window cannot see repeats that sit far apart in a
 *     transcript; its ratio stays ~2.9 at every chunk size. brotli q5 reaches 3.25 at
 *     256 KiB, 4.06 at 1 MiB, 4.41 at 4 MiB and 4.50 on whole files, at ~80 MB/s per
 *     thread (gzip -6 ~65 MB/s). q6 adds <1%; q4 loses ~3%. zstd is close but is an
 *     experimental node:zlib API in Node 24.
 *   - 4 MiB chunks. Aligned cross-file dedupe in a 7-day window (5,109 files) was 0.00% at
 *     256 KiB, 1 MiB and 4 MiB, so small chunks buy nothing there; the only dedupe is a
 *     file against its own earlier capture, which any chunk size gets. A larger chunk
 *     costs at most one re-stored partial chunk per recaptured file, and `retire` reclaims
 *     it. 4 MiB matches brotli's default 4 MiB window (lgwin 22), so each chunk is
 *     compressed with full reach; it keeps 98% of the whole-file ratio.
 *   - Default archive: a per-user, non-roaming, non-temp data dir, outside the harness's
 *     own directory (a reinstall or cleanup there would take both copies) and outside any
 *     git checkout (private bytes must never be one `git add` away):
 *       Windows %LOCALAPPDATA%\transcript-mirror, macOS ~/Library/Application Support/
 *       transcript-mirror, else $XDG_DATA_HOME/transcript-mirror or
 *       ~/.local/share/transcript-mirror.
 *     The script refuses an archive inside a git work tree, inside --root, or inside the
 *     harness config dir.
 *
 * Archive layout:
 *   MIRROR.json        format, chunkSize, codec (written once; later runs use it)
 *   chunks/ab/<sha>.br brotli-compressed raw chunk, named by sha256 of the raw bytes
 *   captures.jsonl     one append-only record per capture
 *   retired.jsonl      one append-only line per retired capture
 *   runs.jsonl         one line per capture, retire or verify run from the CLI: its exit
 *                      code and counts (never content); `notice` reads it
 *   .lock              single writer; a lock whose run is gone, or that is older than any
 *                      run could last (6 h), is stale and the next run breaks it
 *
 * Usage:
 *   node scripts/transcript-mirror.mjs capture [--root <dir>] [--archive <dir>] [--since 7d] [--budget-gb N] [--hook]
 *   node scripts/transcript-mirror.mjs retire  [--archive <dir>] [--dry-run]
 *   node scripts/transcript-mirror.mjs restore [--archive <dir>] --source <rel> [--capture <id>] [--out <file>]
 *   node scripts/transcript-mirror.mjs verify  [--archive <dir>]
 *   node scripts/transcript-mirror.mjs status  [--archive <dir>] [--root <dir>]
 *   node scripts/transcript-mirror.mjs notice  [--archive <dir>] [--max-age-h 36]
 * Output is one JSON object of counts and sizes; it never prints transcript content.
 * Exit codes: 0 ok, 1 failure (verify mismatch, refused path, lock held), 2 usage, 3 paused at budget.
 * restore without --out rebuilds and checks the bytes and writes nothing.
 * capture --hook is for a session-end hook: it reads the hook's JSON on stdin and captures
 * only that session's transcript and its subagent folder (all session-end hooks share a
 * 1.5 s default budget). A whole-store capture on a schedule covers sessions that never end
 * cleanly; without --hook, capture walks the whole --root.
 * notice is for a session-start hook: it prints {"systemMessage": ...} only when the mirror
 * needs the operator (paused at or near the budget, a failed run, a damaged capture, no
 * successful capture within --max-age-h), prints nothing otherwise, and always exits 0.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

export const FORMAT = 1;
export const DEFAULT_CHUNK = 4 * 1024 * 1024;
const BROTLI_QUALITY = 5;
const CONCURRENCY = 4;
const LOCK_STALE_MS = 6 * 3600e3;
const brotli = promisify(zlib.brotliCompress);
const unbrotli = promisify(zlib.brotliDecompress);

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const EMPTY_SHA = sha(Buffer.alloc(0));

export class MirrorError extends Error {
  constructor(message, code = null) { super(message); this.code = code; }
}

// ---------- locations and guards ----------

export function claudeConfigDir(env = process.env) {
  return env.CLAUDE_CONFIG_DIR ? path.resolve(env.CLAUDE_CONFIG_DIR) : path.join(os.homedir(), '.claude');
}

export function defaultRoot(env = process.env) {
  return path.join(claudeConfigDir(env), 'projects');
}

export function defaultArchive(env = process.env, platform = process.platform) {
  if (platform === 'win32') {
    const base = env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(base, 'transcript-mirror');
  }
  if (platform === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', 'transcript-mirror');
  return path.join(env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'transcript-mirror');
}

const norm = (p) => {
  const r = path.resolve(p);
  return process.platform === 'win32' ? r.toLowerCase() : r;
};
const inside = (child, parent) => {
  const c = norm(child), p = norm(parent);
  return c === p || c.startsWith(p.endsWith(path.sep) ? p : p + path.sep);
};

/** Nearest ancestor (or self) holding a `.git` entry, or null. Handles worktrees (.git file). */
export function gitWorkTreeOf(p) {
  let dir = path.resolve(p);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

export function guardArchive(archive, { root, configDir = claudeConfigDir() } = {}) {
  const tree = gitWorkTreeOf(archive);
  if (tree) throw new MirrorError(`refused: archive is inside a git work tree (${tree}); transcripts are private and must not sit one 'git add' away`, 'REFUSED');
  if (root && (inside(archive, root) || inside(root, archive))) throw new MirrorError('refused: archive and --root overlap', 'REFUSED');
  if (configDir && inside(archive, configDir)) throw new MirrorError('refused: archive is inside the harness config dir; the mirror must outlive that directory', 'REFUSED');
}

// ---------- archive state ----------

const P = (archive) => ({
  meta: path.join(archive, 'MIRROR.json'),
  chunks: path.join(archive, 'chunks'),
  captures: path.join(archive, 'captures.jsonl'),
  retired: path.join(archive, 'retired.jsonl'),
  runs: path.join(archive, 'runs.jsonl'),
  lock: path.join(archive, '.lock'),
});
const chunkPath = (archive, h) => path.join(archive, 'chunks', h.slice(0, 2), `${h}.br`);

function openArchive(archive, { create = false, chunkSize } = {}) {
  const p = P(archive);
  if (!fs.existsSync(p.meta)) {
    if (!create) throw new MirrorError('no archive here (run capture first)');
    fs.mkdirSync(p.chunks, { recursive: true });
    const meta = { format: FORMAT, chunkSize: chunkSize || DEFAULT_CHUNK, codec: 'brotli', quality: BROTLI_QUALITY, createdAt: new Date().toISOString() };
    fs.writeFileSync(p.meta, JSON.stringify(meta, null, 2) + '\n');
  }
  const meta = JSON.parse(fs.readFileSync(p.meta, 'utf8'));
  if (meta.format !== FORMAT) throw new MirrorError(`unsupported archive format ${meta.format}`);
  return meta;
}

function readJsonl(file, tailBytes = null) {
  if (!fs.existsSync(file)) return { rows: [], broken: 0 };
  let text;
  const size = fs.statSync(file).size;
  if (tailBytes != null && size > tailBytes) {
    // The run log grows by a line per session; notice runs at every session start and needs only the end.
    const fd = fs.openSync(file, 'r');
    const b = Buffer.alloc(tailBytes);
    fs.readSync(fd, b, 0, tailBytes, size - tailBytes);
    fs.closeSync(fd);
    text = b.toString('utf8');
    text = text.slice(text.indexOf('\n') + 1); // drop the partial first line
  } else text = fs.readFileSync(file, 'utf8');
  const rows = [];
  let broken = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch { broken++; }
  }
  return { rows, broken };
}

/** Append one line; if a crash left a partial last line, terminate it first so it cannot swallow ours. */
function appendLine(file, obj) {
  let prefix = '';
  if (fs.existsSync(file)) {
    const st = fs.statSync(file);
    if (st.size > 0) {
      const fd = fs.openSync(file, 'r');
      const b = Buffer.alloc(1);
      fs.readSync(fd, b, 0, 1, st.size - 1);
      fs.closeSync(fd);
      if (b[0] !== 0x0a) prefix = '\n';
    }
  }
  fs.appendFileSync(file, prefix + JSON.stringify(obj) + '\n');
}

function loadState(archive) {
  const p = P(archive);
  const caps = readJsonl(p.captures);
  const ret = readJsonl(p.retired);
  const retired = new Set(ret.rows.map((r) => r.id));
  const captures = caps.rows.sort((a, b) => a.seq - b.seq);
  const live = captures.filter((c) => !retired.has(c.id));
  const bySrc = new Map();
  for (const c of live) {
    if (!bySrc.has(c.src)) bySrc.set(c.src, []);
    bySrc.get(c.src).push(c);
  }
  const latestAny = new Map(); // newest capture per source, live or not
  for (const c of captures) latestAny.set(c.src, c);
  const nextSeq = captures.length ? captures[captures.length - 1].seq + 1 : 1;
  return { captures, live, retired, bySrc, latestAny, nextSeq, brokenLines: caps.broken + ret.broken };
}

/** Map sha -> compressed size for every chunk file present. */
function scanChunks(archive) {
  const dir = P(archive).chunks;
  const have = new Map();
  if (!fs.existsSync(dir)) return have;
  for (const sub of fs.readdirSync(dir)) {
    const d = path.join(dir, sub);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.br')) continue; // .tmp leftovers are not chunks
      have.set(f.slice(0, -3), fs.statSync(path.join(d, f)).size);
    }
  }
  return have;
}

/** Chunk writes a killed run left half-done (`<sha>.br.<pid>.tmp`). Only safe to delete under the lock. */
function tmpLeftovers(archive) {
  const dir = P(archive).chunks;
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const sub of fs.readdirSync(dir)) {
    const d = path.join(dir, sub);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith('.tmp')) out.push(path.join(d, f));
  }
  return out;
}

export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/**
 * A run killed mid-way (a hook cut off at session exit, a closed terminal) leaves its lock
 * behind, and without this every later run would refuse forever. Stale: the lock's pid is
 * gone, or the lock is older than any run could last. A lock that cannot be read yet (its
 * writer is between open and write) is stale only by age.
 */
export function lockIsStale(lock, now = Date.now()) {
  let st;
  try { st = fs.statSync(lock); } catch { return false; }
  if (now - st.mtimeMs > LOCK_STALE_MS) return true;
  let rec = null;
  try { rec = JSON.parse(fs.readFileSync(lock, 'utf8')); } catch { /* empty or partial */ }
  return Boolean(rec && Number.isInteger(rec.pid) && !pidAlive(rec.pid));
}

function withLock(archive, fn) {
  const lock = P(archive).lock;
  let fd;
  for (let attempt = 0; ; attempt++) {
    try { fd = fs.openSync(lock, 'wx'); break; } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (attempt === 0 && lockIsStale(lock)) {
        try { fs.unlinkSync(lock); } catch { /* another run broke it first; the retry decides */ }
        console.error('transcript-mirror: broke a stale lock (its run is gone or the lock is over 6 h old)');
        continue;
      }
      throw new MirrorError('archive is locked by a live run (.lock present)', 'LOCKED');
    }
  }
  fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
  fs.closeSync(fd);
  const release = () => { try { fs.unlinkSync(lock); } catch { /* already gone */ } };
  let out;
  try { out = fn(); } catch (e) { release(); throw e; }
  if (out && typeof out.then === 'function') return out.finally(release);
  release();
  return out;
}

async function readChunk(archive, h, expectLen) {
  let comp;
  try { comp = await fsp.readFile(chunkPath(archive, h)); } catch { return { ok: false, why: 'missing' }; }
  let raw;
  try { raw = await unbrotli(comp); } catch { return { ok: false, why: 'undecodable' }; }
  if (expectLen != null && raw.length !== expectLen) return { ok: false, why: 'length' };
  if (sha(raw) !== h) return { ok: false, why: 'hash' };
  return { ok: true, raw };
}

const chunkLen = (cap, i) => (i < cap.chunks.length - 1 ? cap.chunkSize : cap.size - i * cap.chunkSize);

// ---------- capture ----------

export function parseSince(s, now = Date.now()) {
  if (s == null) return null;
  const m = /^(\d+(?:\.\d+)?)([dhm])$/.exec(String(s));
  if (m) return now - Number(m[1]) * { d: 86400e3, h: 3600e3, m: 60e3 }[m[2]];
  const t = Date.parse(s);
  if (Number.isNaN(t)) throw new MirrorError(`bad --since ${s} (use 7d, 12h, 30m or a date)`);
  return t;
}

export function listSources(root, sinceMs) {
  const out = [];
  const walk = (dir) => {
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isSymbolicLink()) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.jsonl')) {
        let st;
        try { st = fs.statSync(p); } catch { continue; }
        if (sinceMs != null && st.mtimeMs < sinceMs) continue;
        out.push({ abs: p, src: path.relative(root, p).split(path.sep).join('/'), size: st.size, mtimeMs: st.mtimeMs });
      }
    }
  };
  walk(root);
  // Oldest first: those are nearest the harness's deletion, so a budget pause spares them.
  return out.sort((a, b) => a.mtimeMs - b.mtimeMs || (a.src < b.src ? -1 : 1));
}

/**
 * One session's transcript plus everything under its same-named folder (its subagents), for
 * a session-end hook: the harness gives every session-end hook together 1.5 s by default, so
 * the hook captures the session that ended, not the store. [] unless it is a .jsonl under root.
 */
export function sessionSources(root, transcript) {
  root = path.resolve(root);
  const abs = path.resolve(String(transcript));
  if (!abs.endsWith('.jsonl') || !inside(abs, root) || norm(abs) === norm(root)) return [];
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  const out = [];
  try {
    const st = fs.statSync(abs);
    if (st.isFile()) out.push({ abs, src: rel(abs), size: st.size, mtimeMs: st.mtimeMs });
  } catch { /* already gone */ }
  const dir = abs.slice(0, -'.jsonl'.length);
  if (fs.existsSync(dir)) for (const s of listSources(dir, null)) out.push({ ...s, src: rel(s.abs) });
  return out;
}

export async function capture({ root = defaultRoot(), archive = defaultArchive(), since = null, budgetBytes = null, chunkSize, configDir, session = null } = {}) {
  root = path.resolve(root);
  archive = path.resolve(archive);
  if (!fs.existsSync(root)) throw new MirrorError('--root does not exist');
  guardArchive(archive, { root, configDir });
  fs.mkdirSync(archive, { recursive: true });
  const meta = openArchive(archive, { create: true, chunkSize });
  return withLock(archive, async () => {
    const t0 = performance.now();
    const CH = meta.chunkSize;
    const state = loadState(archive);
    const have = scanChunks(archive);
    let stored = [...have.values()].reduce((a, b) => a + b, 0);
    for (const f of [P(archive).captures, P(archive).retired, P(archive).meta]) { try { stored += fs.statSync(f).size; } catch { /* none yet */ } }
    const sources = session != null ? sessionSources(root, session) : listSources(root, parseSince(since));
    const r = { command: 'capture', scope: session != null ? 'session' : since != null ? 'since' : 'all', filesSeen: sources.length, captured: 0, unchanged: 0, vanished: 0, bytesRead: 0, chunksTotal: 0, chunksNew: 0, chunksReused: 0, bytesNewRaw: 0, bytesNewStored: 0, paused: false, notCapturedAtPause: 0, budgetBytes, storedBytesAfter: 0, seconds: 0 };
    let seq = state.nextSeq;
    for (let fi = 0; fi < sources.length; fi++) {
      const s = sources[fi];
      const prev = state.latestAny.get(s.src);
      if (prev && prev.size === s.size && prev.mtimeMs === s.mtimeMs) { r.unchanged++; continue; }
      let st, fh;
      try { st = fs.statSync(s.abs); fh = await fsp.open(s.abs, 'r'); } catch { r.vanished++; continue; }
      const whole = crypto.createHash('sha256');
      const chunks = [];
      const wroteHere = [];
      const pending = new Map();
      let size = 0, pause = false;
      const store = async (h, buf) => {
        const comp = await brotli(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: meta.quality, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } });
        if (budgetBytes != null && stored + comp.length > budgetBytes) { pause = true; return; }
        stored += comp.length; // reserve before any await so concurrent stores cannot both pass the budget
        const dst = chunkPath(archive, h);
        await fsp.mkdir(path.dirname(dst), { recursive: true });
        const tmp = `${dst}.${process.pid}.tmp`;
        await fsp.writeFile(tmp, comp);
        await fsp.rename(tmp, dst);
        have.set(h, comp.length);
        wroteHere.push(h);
        r.chunksNew++; r.bytesNewRaw += buf.length; r.bytesNewStored += comp.length;
      };
      try {
        for (;;) {
          const buf = Buffer.allocUnsafe(CH);
          let n = 0;
          while (n < CH) {
            const { bytesRead } = await fh.read(buf, n, CH - n, size + n);
            if (bytesRead === 0) break;
            n += bytesRead;
          }
          if (n === 0) break;
          const piece = buf.subarray(0, n);
          size += n;
          whole.update(piece);
          const h = sha(piece);
          chunks.push(h);
          r.chunksTotal++;
          if (have.has(h) || pending.has(h)) { r.chunksReused++; }
          else {
            const pr = store(h, piece).finally(() => pending.delete(h));
            pending.set(h, pr);
            if (pending.size >= CONCURRENCY) await Promise.race(pending.values());
          }
          if (pause) break;
          if (n < CH) break;
        }
        await Promise.all(pending.values());
      } finally { await fh.close(); }
      r.bytesRead += size;
      if (pause) {
        // Abandon this file: its new chunks are unreferenced, so remove them; evict nothing else.
        for (const h of wroteHere) { try { fs.unlinkSync(chunkPath(archive, h)); stored -= have.get(h); have.delete(h); } catch { /* gone */ } }
        r.paused = true;
        r.notCapturedAtPause = sources.length - fi;
        break;
      }
      const rec = { id: `cap-${seq}`, seq, at: new Date().toISOString(), src: s.src, size, mtimeMs: st.mtimeMs, sha256: whole.digest('hex'), chunkSize: CH, chunks };
      appendLine(P(archive).captures, rec);
      state.latestAny.set(s.src, rec);
      seq++;
      r.captured++;
    }
    try { r.storedBytesAfter = [...have.values()].reduce((a, b) => a + b, 0) + fs.statSync(P(archive).captures).size; } catch { r.storedBytesAfter = stored; }
    r.seconds = +((performance.now() - t0) / 1000).toFixed(2);
    return r;
  });
}

// ---------- retire ----------

/**
 * Which of `olds` (all older than `container`, same source) does `container` hold as a
 * verified byte prefix? Returns Map id -> true|reason.
 */
export async function prefixCheck(archive, container, olds) {
  const verdict = new Map();
  const CH = container.chunkSize;
  const want = [];
  for (const o of olds) {
    if (o.chunkSize !== CH) { verdict.set(o.id, 'chunk-size'); continue; }
    if (o.size > container.size) { verdict.set(o.id, 'larger'); continue; }
    if (o.size === 0) { verdict.set(o.id, o.sha256 === EMPTY_SHA ? true : 'hash'); continue; }
    const full = Math.floor(o.size / CH);
    let listOk = true;
    for (let i = 0; i < full; i++) if (o.chunks[i] !== container.chunks[i]) { listOk = false; break; }
    if (!listOk) { verdict.set(o.id, 'chunk-list'); continue; }
    want.push(o);
  }
  if (!want.length) return verdict;
  want.sort((a, b) => a.size - b.size);
  const h = crypto.createHash('sha256');
  let wi = 0;
  const lastIdx = Math.ceil(want[want.length - 1].size / CH) - 1;
  for (let i = 0; i <= lastIdx && wi < want.length; i++) {
    const got = await readChunk(archive, container.chunks[i], chunkLen(container, i));
    if (!got.ok) { while (wi < want.length) verdict.set(want[wi++].id, `container-chunk-${got.why}`); break; }
    const end = (i + 1) * CH;
    while (wi < want.length && want[wi].size <= end) {
      const o = want[wi++];
      const tail = o.size - i * CH;
      const sub = got.raw.subarray(0, tail);
      if (o.size % CH !== 0 && sha(sub) !== o.chunks[i]) { verdict.set(o.id, 'partial-chunk'); continue; }
      if (o.size % CH === 0 && o.chunks[i] !== container.chunks[i]) { verdict.set(o.id, 'chunk-list'); continue; }
      verdict.set(o.id, h.copy().update(sub).digest('hex') === o.sha256 ? true : 'whole-hash');
    }
    h.update(got.raw);
  }
  return verdict;
}

export async function planRetire(archive) {
  const state = loadState(archive);
  const plan = [];
  const kept = {};
  for (const caps of state.bySrc.values()) {
    if (caps.length < 2) continue;
    const done = new Set();
    const reasons = new Map();
    for (let ci = caps.length - 1; ci >= 1; ci--) {
      const container = caps[ci];
      if (done.has(container.id)) continue;
      const olds = caps.slice(0, ci).filter((o) => !done.has(o.id));
      if (!olds.length) break;
      const v = await prefixCheck(archive, container, olds);
      for (const [id, ok] of v) {
        if (ok === true) { done.add(id); plan.push({ id, by: container.id, src: container.src }); reasons.delete(id); }
        else if (!reasons.has(id)) reasons.set(id, ok);
      }
    }
    for (const why of reasons.values()) kept[why] = (kept[why] || 0) + 1;
  }
  return { state, plan, kept };
}

export async function retire({ archive = defaultArchive(), dryRun = false } = {}) {
  archive = path.resolve(archive);
  openArchive(archive);
  return withLock(archive, async () => {
    const { state, plan, kept } = await planRetire(archive);
    const retiring = new Set(plan.map((p) => p.id));
    const liveAfter = state.live.filter((c) => !retiring.has(c.id));
    const referenced = new Set(liveAfter.flatMap((c) => c.chunks));
    const have = scanChunks(archive);
    const drop = [...have.keys()].filter((h) => !referenced.has(h));
    const bytesFreed = drop.reduce((a, h) => a + have.get(h), 0);
    const tmps = tmpLeftovers(archive);
    const r = { command: 'retire', dryRun, liveBefore: state.live.length, retire: plan.length, keptOlderNotPrefix: kept, chunksUnreferenced: drop.length, bytesFreed, liveAfter: liveAfter.length, tmpLeftovers: tmps.length };
    if (dryRun) return r;
    const at = new Date().toISOString();
    for (const p of plan) appendLine(P(archive).retired, { id: p.id, by: p.by, at });
    for (const h of drop) { try { fs.unlinkSync(chunkPath(archive, h)); } catch { /* gone */ } }
    for (const f of tmps) { try { fs.unlinkSync(f); } catch { /* gone */ } }
    return r;
  });
}

// ---------- verify / restore / status ----------

async function rebuild(archive, cap, sink) {
  const whole = crypto.createHash('sha256');
  for (let i = 0; i < cap.chunks.length; i++) {
    const got = await readChunk(archive, cap.chunks[i], chunkLen(cap, i));
    if (!got.ok) return { ok: false, why: `chunk-${got.why}` };
    whole.update(got.raw);
    if (sink) await sink(got.raw);
  }
  const digest = whole.digest('hex');
  if (digest !== cap.sha256) return { ok: false, why: 'whole-hash' };
  return { ok: true, sha256: digest };
}

export async function verify({ archive = defaultArchive() } = {}) {
  archive = path.resolve(archive);
  openArchive(archive);
  const t0 = performance.now();
  const state = loadState(archive);
  const r = { command: 'verify', liveCaptures: state.live.length, ok: 0, failed: 0, failures: {}, bytesVerified: 0, brokenLogLines: state.brokenLines, orphanChunks: 0, seconds: 0 };
  for (const c of state.live) {
    const v = await rebuild(archive, c, null);
    if (v.ok) { r.ok++; r.bytesVerified += c.size; } else { r.failed++; r.failures[v.why] = (r.failures[v.why] || 0) + 1; }
  }
  const referenced = new Set(state.live.flatMap((c) => c.chunks));
  for (const h of scanChunks(archive).keys()) if (!referenced.has(h)) r.orphanChunks++;
  r.seconds = +((performance.now() - t0) / 1000).toFixed(2);
  return r;
}

export async function restore({ archive = defaultArchive(), source, captureId, out, force = false } = {}) {
  archive = path.resolve(archive);
  openArchive(archive);
  if (!source && !captureId) throw new MirrorError('restore needs --source <rel> or --capture <id>');
  const state = loadState(archive);
  let cap;
  if (captureId) cap = state.live.find((c) => c.id === captureId);
  else cap = (state.bySrc.get(source) || []).at(-1);
  if (!cap) throw new MirrorError('no live capture for that source');
  let fh, tmp;
  if (out) {
    out = path.resolve(out);
    if (fs.existsSync(out) && !force) throw new MirrorError('--out exists (pass --force to overwrite)');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    tmp = `${out}.${process.pid}.tmp`;
    fh = await fsp.open(tmp, 'w');
  }
  let v;
  try { v = await rebuild(archive, cap, fh ? (b) => fh.writeFile(b) : null); } finally { if (fh) await fh.close(); }
  if (!v.ok) { if (tmp) fs.rmSync(tmp, { force: true }); throw new MirrorError(`restore failed: ${v.why}`); }
  if (tmp) fs.renameSync(tmp, out);
  return { command: 'restore', capture: cap.id, size: cap.size, sha256: v.sha256, written: Boolean(out) };
}

export function status({ archive = defaultArchive(), root = null } = {}) {
  archive = path.resolve(archive);
  const meta = openArchive(archive);
  const state = loadState(archive);
  const have = scanChunks(archive);
  const chunkBytes = [...have.values()].reduce((a, b) => a + b, 0);
  let metaBytes = 0;
  for (const f of [P(archive).captures, P(archive).retired, P(archive).meta]) { try { metaBytes += fs.statSync(f).size; } catch { /* absent */ } }
  const newest = [...state.bySrc.values()].map((c) => c.at(-1));
  const liveRaw = state.live.reduce((a, c) => a + c.size, 0);
  const newestRaw = newest.reduce((a, c) => a + c.size, 0);
  // Cheap retirable count: structural check only (size and full-chunk list). retire --dry-run verifies bytes.
  let retirableCandidates = 0;
  for (const caps of state.bySrc.values()) {
    const n = caps.at(-1);
    for (const o of caps.slice(0, -1)) {
      const full = Math.floor(o.size / o.chunkSize);
      if (o.chunkSize === n.chunkSize && o.size <= n.size && o.chunks.slice(0, full).every((h, i) => h === n.chunks[i])) retirableCandidates++;
    }
  }
  const r = { command: 'status', chunkSize: meta.chunkSize, codec: meta.codec, storedBytes: chunkBytes + metaBytes, chunkBytes, metaBytes, chunks: have.size, captures: state.captures.length, liveCaptures: state.live.length, retiredCaptures: state.retired.size, sources: state.bySrc.size, newestRawBytes: newestRaw, liveRawBytes: liveRaw, ratioNewestRawToStored: chunkBytes ? +(newestRaw / chunkBytes).toFixed(3) : null, retirableCandidates };
  if (root) {
    const rootAbs = path.resolve(root);
    r.sourcesGoneFromRoot = newest.filter((c) => !fs.existsSync(path.join(rootAbs, ...c.src.split('/')))).length;
  }
  const runs = readJsonl(P(archive).runs, 1 << 20).rows;
  r.lastRuns = {};
  for (const cmd of ['capture', 'retire', 'verify']) {
    const last = runs.filter((x) => x.command === cmd).at(-1);
    if (last) r.lastRuns[cmd] = { at: last.at, exit: last.exit };
  }
  return r;
}

/** Append one CLI run to runs.jsonl. Never creates an archive: a refused or absent path stays untouched. */
export function logRun(archive, row) {
  if (!['capture', 'retire', 'verify'].includes(row.command) || row.code === 'REFUSED') return;
  if (!fs.existsSync(P(archive).meta)) return;
  try { appendLine(P(archive).runs, row); } catch { /* the log is advisory; the run's own exit code still stands */ }
}

const gb = (b) => (b / 1e9).toFixed(1);

/** What the operator needs to know now, as sentences; [] when the mirror is healthy. */
export function notice({ archive = defaultArchive(), maxAgeHours = 36, now = Date.now() } = {}) {
  archive = path.resolve(archive);
  const p = P(archive);
  if (!fs.existsSync(p.meta)) return [`transcript mirror: no archive at ${archive}, so nothing is kept past the harness's transcript deletion.`];
  const out = [];
  const runs = readJsonl(p.runs, 1 << 20).rows;
  // A run refused because a live run held the lock says nothing about the mirror's health.
  const caps = runs.filter((x) => x.command === 'capture' && x.code !== 'LOCKED');
  const last = caps.at(-1);
  if (last?.exit === 3) out.push(`transcript mirror: paused at its budget (${gb(last.storedBytesAfter || 0)} of ${gb(last.budgetBytes || 0)} GB) on ${last.at}; ${last.notCapturedAtPause ?? '?'} transcripts were not kept. Run retire, or raise --budget-gb.`);
  else if (last?.exit === 1) out.push(`transcript mirror: the last capture failed on ${last.at}: ${last.error || 'unknown error'}.`);
  else if (last?.exit === 0 && last.budgetBytes && last.storedBytesAfter >= 0.9 * last.budgetBytes) out.push(`transcript mirror: at ${Math.round((100 * last.storedBytesAfter) / last.budgetBytes)}% of its ${gb(last.budgetBytes)} GB budget; captures pause at 100%.`);
  // Session-end captures skip sessions that never end cleanly (a closed terminal), so only a
  // whole-store capture shows the scheduled sweep is alive.
  let lastSweepAt = caps.filter((x) => x.exit === 0 && x.scope !== 'session').at(-1)?.at;
  if (!runs.length) lastSweepAt = readJsonl(p.captures).rows.at(-1)?.at; // an archive older than the run log
  if (!lastSweepAt) out.push('transcript mirror: no whole-store capture recorded yet.');
  else if (now - Date.parse(lastSweepAt) > maxAgeHours * 3600e3) out.push(`transcript mirror: no whole-store capture since ${lastSweepAt} (over ${maxAgeHours} h); the scheduled capture may not be running.`);
  const v = runs.filter((x) => x.command === 'verify').at(-1);
  if (v?.exit === 1 && v.failed) out.push(`transcript mirror: the last verify (${v.at}) found ${v.failed} damaged captures.`);
  const ret = runs.filter((x) => x.command === 'retire' && x.code !== 'LOCKED').at(-1);
  if (ret?.exit === 1) out.push(`transcript mirror: the last retire failed on ${ret.at}: ${ret.error || 'unknown error'}.`);
  return out;
}

// ---------- CLI ----------

// A closed flag set, and the numeric ones must be numbers: `--budget-gb abc` used to become a
// NaN budget that no store ever exceeds, and `--budget 5` was ignored - either way the one
// limit the operator asked for was silently off.
const BOOL_FLAGS = new Set(['dry-run', 'force', 'hook']);
const VALUE_FLAGS = new Set(['root', 'archive', 'since', 'budget-gb', 'chunk-kib', 'source', 'capture', 'out', 'max-age-h']);
const POSITIVE_FLAGS = new Set(['budget-gb', 'chunk-kib', 'max-age-h']);

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const o = { _: cmd };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith('--')) throw new MirrorError(`unexpected argument ${a}`);
    const k = a.slice(2);
    if (BOOL_FLAGS.has(k)) { o[k] = true; continue; }
    if (!VALUE_FLAGS.has(k)) throw new MirrorError(`unknown flag --${k} (see the header for each command's flags)`);
    const v = rest[++i];
    if (v == null) throw new MirrorError(`--${k} needs a value`);
    if (POSITIVE_FLAGS.has(k) && !(Number.isFinite(Number(v)) && Number(v) > 0)) throw new MirrorError(`--${k} must be a positive number, got ${JSON.stringify(v)}`);
    o[k] = v;
  }
  return o;
}

async function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  const archive = path.resolve(o.archive || defaultArchive());
  if (o._ === 'notice') {
    // A session-start hook: never fail the session, never print when there is nothing to say.
    let msgs;
    try { msgs = notice({ archive, maxAgeHours: o['max-age-h'] != null ? Number(o['max-age-h']) : 36 }); } catch (e) { msgs = [`transcript mirror: notice failed: ${e.message}`]; }
    if (msgs.length) {
      const text = msgs.join(' ');
      // systemMessage is for the operator; the context line makes sure the session's agent can relay it.
      console.log(JSON.stringify({ systemMessage: text, hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: `${text} (Machine notice from the transcript mirror: mention it to the operator once; do not act on it unless asked.)` } }));
    }
    return;
  }
  let session = null;
  if (o._ === 'capture' && o.hook) {
    // A session-end hook pipes {transcript_path, ...} on stdin. Anything unusable is not a failure of the mirror.
    try { session = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^﻿/, '')).transcript_path || null; } catch { session = null; }
    if (!session) return;
  }
  const at = new Date().toISOString();
  let r;
  try {
    switch (o._) {
      case 'capture':
        r = await capture({ root: o.root || defaultRoot(), archive, since: o.since ?? null, session, budgetBytes: o['budget-gb'] != null ? Math.floor(Number(o['budget-gb']) * 1e9) : null, chunkSize: o['chunk-kib'] ? Number(o['chunk-kib']) * 1024 : undefined });
        break;
      case 'retire': r = await retire({ archive, dryRun: Boolean(o['dry-run']) }); break;
      case 'verify': r = await verify({ archive }); break;
      case 'restore': r = await restore({ archive, source: o.source, captureId: o.capture, out: o.out, force: Boolean(o.force) }); break;
      case 'status': r = status({ archive, root: o.root || null }); break;
      default:
        console.error('usage: transcript-mirror.mjs <capture|retire|restore|verify|status|notice> [options] (see header)');
        process.exit(2);
    }
  } catch (e) {
    // Every failure is logged, not only ours: a full disk (ENOSPC) is the one the operator most needs to hear about.
    logRun(archive, { at, command: o._, exit: 1, code: e instanceof MirrorError ? e.code : (e.code || 'ERROR'), error: e.message });
    if (e instanceof MirrorError) { console.error(e.message); process.exit(1); }
    throw e;
  }
  const exit = (r.command === 'verify' && r.failed) ? 1 : (r.command === 'capture' && r.paused) ? 3 : 0;
  if (!(r.command === 'retire' && r.dryRun)) logRun(archive, { at, exit, ...r });
  console.log(JSON.stringify(r, null, 2));
  if (exit) process.exit(exit);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
