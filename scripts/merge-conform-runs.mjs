#!/usr/bin/env node
/**
 * merge-conform-runs - the single writer that folds parallel /conform verdicts into a
 * project's registry map.
 *
 * ## The gap this closes
 *
 * `/conform` writes verdicts into `<project>/.ai/registry-map.json` in place. That is fine for
 * one worker and a collision for several: N agents judging N subjects cannot share one JSON
 * file. So a parallel wave has each worker write ONE run file to
 * `<project>/.ai/conform-runs/<worker>.json` and never touch the map, and this script is the
 * only thing that writes the map from those files.
 *
 * ## Callers
 *
 * Personas' /curator driver runs it after every conform worker it settles
 * (`.claude/skills/curator/loop.py run-pool`, and `loop.py merge` by hand); a hand-run parallel
 * /conform wave runs it once at the end. Promoted out of scripts/experiments/ on 2026-10-09,
 * when it gained the lock, the ordering rule and scripts/tests/merge-conform-runs.test.mjs.
 *
 * ## The run file (conform-run/1)
 *
 *   { "worker": "<id>", "evaluatedAt": "<ISO timestamp, or YYYY-MM-DD>",
 *     "pairs": [{ "context": "<context id, or its exact name>", "subject": "<slug>", "bundle": "<bundle>",
 *                 "state": "conformant|deviation|not-applicable|unknown", "evidence": "<path>:<line> ...",
 *                 "techniques": [{ "technique", "verdict", "evidence" }], "registryProposal": "..." }],
 *     "declined": [{ "subject", "context", "reason" }],
 *     "consults": [{ ...one .ai/consults.jsonl line per object }] }
 *
 * A pair may carry its own `evaluatedAt`. A file without `pairs[]` (the rkb-run-result that
 * /conform §5 writes into the same directory) is not input and is passed over.
 *
 * ## The rules
 *
 * - **One writer.** `.ai/conform-runs/.merge.lock`, created exclusively and holding the pid. A
 *   lock whose pid is alive is held, whatever its age (a quiet holder is not a dead one); this
 *   script then exits 3 (CONTENDED) after `--wait-lock-ms`. A lock whose pid is dead, or an
 *   unreadable lock older than a few seconds, is taken over by an atomic rename.
 * - **Idempotent.** A verdict identical to the one the map holds (state, evidence, date)
 *   rewrites nothing. A file whose exact bytes already sit in `merged/` is a no-op, and its
 *   consults are not appended twice. So a file merged twice changes nothing.
 * - **Newer wins.** Verdicts are ordered by their own `evaluatedAt` (a date-only stamp counts
 *   as the start of that day). An older verdict never overwrites a newer one. Whichever one
 *   loses is kept in `conform-detail.json` under `pairs[key].superseded`, so a disagreement is
 *   recorded rather than silently resolved.
 * - **Only the conform fields.** `state`, `evidence`, `evaluatedAt` (a date), `evaluatedAgainst`
 *   and `evaluatedRevision` (both from the SAME registry index entry, so `revisionsBehind`
 *   agrees with the digest), and `stale` cleared. The matching fields (`score`, `why`,
 *   `confidence`) are never rewritten, and no pair is ever added: establishing a pairing is a
 *   single-writer /conform run's act, not a merge's.
 * - **The floors.** `unknown` is not a verdict and never overwrites one. Evidence whose first
 *   `path:line` does not exist, or lands on a blank line, is not merged.
 * - **Half-written files wait.** A run file that is not JSON yet is left for the next merge,
 *   never fatal: a sibling worker may be mid-write.
 *
 * Technique-level verdicts do not fit the map's pair row, so they live beside it in
 * `.ai/conform-detail.json`, keyed `<context id>/<subject>`. Consumed run files move to
 * `.ai/conform-runs/merged/`; `--reapply` folds that archive back in (idempotently), which is
 * how a map that something reverted gets its verdicts back.
 *
 * Usage:
 *   node scripts/merge-conform-runs.mjs <project-root> [--dry] [--json] [--only a.json,b.json]
 *        [--wait-lock-ms <n>] [--reapply] [--registry <dir>]
 *
 * Exit 0 = merged, nothing to merge, or dry; 2 = could not run (bad input); 3 = a live merger
 * holds the lock. Prints the funnel, or with --json the whole result.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

export const REGISTRY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STATES = new Set(['conformant', 'deviation', 'not-applicable', 'unknown']);
export const LOCK_NAME = '.merge.lock';
/** An unreadable lock younger than this may be a holder between create and write. */
export const LOCK_UNREADABLE_GRACE_MS = 5000;
/** How many losing verdicts one pair keeps in conform-detail.json. */
export const SUPERSEDED_KEEP = 10;

export class MergeFatal extends Error {}

const sleepMs = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const readJsonOr = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } };

export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/** ms since epoch for an ISO timestamp or a YYYY-MM-DD date (that day's start, UTC); else null. */
export function stampOf(v) {
  if (typeof v !== 'string' || !v.trim()) return null;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Date.parse(`${s}T00:00:00Z`);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}
const dateOf = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Take the merge lock. {ok:true, release} or {ok:false, holder}.
 * A live holder is never broken on age: the registry's run board learned that the hard way
 * (2026-09-07, a quiet holder lost a lock it had taken one second earlier).
 */
export function acquireLock(lockPath, { waitMs = 0, pollMs = 200, alive = pidAlive } = {}) {
  const started = Date.now();
  for (;;) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
      fs.closeSync(fd);
      return {
        ok: true,
        release: () => {
          const h = readJsonOr(lockPath, null);
          if (h?.pid === process.pid) fs.rmSync(lockPath, { force: true });
        },
      };
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
    const holder = readJsonOr(lockPath, null);
    let breakable;
    if (holder && Number.isInteger(holder.pid)) breakable = !alive(holder.pid);
    else {
      let ageMs = Infinity;
      try { ageMs = Date.now() - fs.statSync(lockPath).mtimeMs; } catch { /* gone: retry */ ageMs = Infinity; }
      breakable = ageMs > LOCK_UNREADABLE_GRACE_MS;
    }
    if (breakable) {
      // Rename, not delete: of two takers only one rename can succeed, so a takeover can
      // never remove a lock a second taker has just created.
      const aside = `${lockPath}.stale-${process.pid}-${Date.now()}`;
      try { fs.renameSync(lockPath, aside); fs.rmSync(aside, { force: true }); } catch { /* another taker won */ }
      continue;
    }
    if (Date.now() - started >= waitMs) return { ok: false, holder };
    sleepMs(pollMs);
  }
}

/** Write via a temp file and a rename; a Windows reader can block the rename, so retry, then write in place. */
function writeAtomic(p, text) {
  const tmp = `${p}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text);
  for (let i = 1; i <= 10; i++) {
    try { fs.renameSync(tmp, p); return; } catch (e) {
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) { fs.rmSync(tmp, { force: true }); throw e; }
      sleepMs(50 * i);
    }
  }
  fs.writeFileSync(p, text);
  fs.rmSync(tmp, { force: true });
}

/** `<bundle>/<slug>` -> {digest, revision}, from the registry's own indexes. */
function subjectIndexFor(map, registry) {
  const out = {};
  for (const bundle of Object.keys(map.bundleDigests || {})) {
    const idx = path.join(registry, 'knowledge', bundle, 'index.json');
    const doc = readJsonOr(idx, null);
    for (const [slug, s] of Object.entries(doc?.subjects || {})) out[`${bundle}/${slug}`] = { digest: s.digest, revision: s.revision };
  }
  return out;
}

/**
 * The anchor floor: the evidence's first `path:line` must name a relative path that exists and
 * a line that is not blank. A floor, not the check /conform §3 asks for (does the line SAY what
 * the evidence claims) - that stays the worker's job.
 */
export function anchorProblem(root, evidence) {
  const m = String(evidence || '').match(/([A-Za-z0-9_.@/-]+\.[A-Za-z0-9]+):(\d+)/);
  if (!m) return 'no path:line anchor';
  const file = path.join(root, m[1]);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return `anchor ${m[1]} does not exist`;
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/)[Number(m[2]) - 1];
  if (line === undefined) return `anchor ${m[1]}:${m[2]} is past the end of the file`;
  if (!line.trim()) return `anchor ${m[1]}:${m[2]} is a blank line`;
  return null;
}

function addSuperseded(entry, item) {
  const key = (x) => `${x.state}|${x.evidence}|${x.evaluatedAt}|${x.worker ?? ''}`;
  const list = [...(entry.superseded || [])];
  if (!list.some((x) => key(x) === key(item))) list.push(item);
  entry.superseded = list.slice(-SUPERSEDED_KEEP);
}

/** Read one candidate file. Never throws: an unreadable file is a status, not a crash. */
function loadRun(dir, name) {
  const abs = path.join(dir, name);
  if (!fs.existsSync(abs)) return { name, status: 'missing' };
  const bytes = fs.readFileSync(abs);
  let run;
  try { run = JSON.parse(bytes.toString('utf8')); } catch {
    return { name, status: 'incomplete', note: 'not JSON yet - a writer may still be mid-file; left for the next merge' };
  }
  if (!run || !Array.isArray(run.pairs)) return { name, status: 'not-a-run-file' };
  const ts = stampOf(run.evaluatedAt);
  if (ts === null) return { name, status: 'skipped', note: 'no evaluatedAt - a verdict without a time cannot be ordered against another' };
  return { name, abs, bytes, hash: sha256(bytes), run, ts };
}

/**
 * Merge. Returns the result object; throws MergeFatal on bad input. `{contended, holder}` when a
 * live merger holds the lock past `waitLockMs`.
 */
export function mergeRuns({ root, registry = REGISTRY_ROOT, dry = false, only = null, reapply = false, waitLockMs = 0 } = {}) {
  if (!root) throw new MergeFatal('no project root given');
  const ai = path.join(root, '.ai');
  const mapPath = path.join(ai, 'registry-map.json');
  const runsDir = path.join(ai, 'conform-runs');
  const mergedDir = path.join(runsDir, 'merged');
  const detailPath = path.join(ai, 'conform-detail.json');
  if (!fs.existsSync(mapPath)) throw new MergeFatal(`no registry map at ${mapPath}`);
  if (!fs.existsSync(runsDir)) throw new MergeFatal(`no run directory at ${runsDir}`);
  for (const n of only || []) {
    if (path.basename(n) !== n || !n.endsWith('.json')) throw new MergeFatal(`--only takes bare .json names in ${runsDir}, got ${JSON.stringify(n)}`);
  }

  const lock = dry ? { ok: true, release() {} } : acquireLock(path.join(runsDir, LOCK_NAME), { waitMs: waitLockMs });
  if (!lock.ok) return { contended: true, holder: lock.holder };
  try {
    return mergeLocked({ root, registry, dry, only, reapply, mapPath, runsDir, mergedDir, detailPath, consultsPath: path.join(ai, 'consults.jsonl') });
  } finally {
    lock.release();
  }
}

function mergeLocked({ root, registry, dry, only, reapply, mapPath, runsDir, mergedDir, detailPath, consultsPath }) {
  const mapText = fs.readFileSync(mapPath, 'utf8');
  let map;
  try { map = JSON.parse(mapText); } catch (e) { throw new MergeFatal(`registry map is not JSON: ${e.message}`); }
  if (!Array.isArray(map.contexts) || !map.bundleDigests) throw new MergeFatal('map has no contexts/bundleDigests - not a registry map');
  const detailText = fs.existsSync(detailPath) ? fs.readFileSync(detailPath, 'utf8') : null;
  let detail;
  try { detail = detailText ? JSON.parse(detailText) : { schema: 'conform-detail/1', pairs: {} }; } catch (e) {
    throw new MergeFatal(`conform-detail.json is not JSON: ${e.message}`);
  }
  detail.pairs ||= {};
  const index = subjectIndexFor(map, registry);
  const byId = new Map(map.contexts.map((c) => [c.context, c]));
  const nameCount = new Map();
  for (const c of map.contexts) nameCount.set(c.name, (nameCount.get(c.name) || 0) + 1);
  const byName = new Map(map.contexts.filter((c) => nameCount.get(c.name) === 1).map((c) => [c.name, c]));

  const result = {
    dry, files: [], pairs: 0, merged: 0, unchanged: 0, older: 0, skipped: [], declined: [],
    conflicts: [], states: {}, flips: {}, techniques: {}, deviations: [], proposals: [], consultsAppended: 0,
  };

  // Which files. A pending file whose exact bytes are already archived is a no-op.
  const names = only || fs.readdirSync(runsDir).filter((f) => f.endsWith('.json')).sort();
  const runs = [];
  for (const name of names) {
    const r = loadRun(runsDir, name);
    if (!r.run) {
      if (only || r.status === 'incomplete' || r.status === 'skipped') result.files.push({ file: name, status: r.status, note: r.note });
      continue;
    }
    const archived = path.join(mergedDir, name);
    r.source = 'pending';
    r.already = fs.existsSync(archived) && sha256(fs.readFileSync(archived)) === r.hash;
    runs.push(r);
  }
  if (reapply && fs.existsSync(mergedDir)) {
    for (const name of fs.readdirSync(mergedDir).filter((f) => f.endsWith('.json')).sort()) {
      const r = loadRun(mergedDir, name);
      if (!r.run) continue;
      r.source = 'archive';
      r.already = false;
      runs.push(r);
    }
  }
  // Oldest first, so within one merge the newest verdict on a pair is the one left standing.
  runs.sort((a, b) => a.ts - b.ts || a.name.localeCompare(b.name));

  for (const r of runs) {
    const f = { file: r.name, source: r.source, status: r.already ? 'already-merged' : 'merged', pairs: 0, merged: 0, unchanged: 0, older: 0, declined: 0, skipped: 0 };
    result.files.push(f);
    if (r.already) continue;
    const worker = r.run.worker || r.name.replace(/\.json$/, '');
    const skip = (why) => { result.skipped.push(`${r.name}: ${why}`); f.skipped++; };
    for (const d of r.run.declined || []) {
      result.declined.push(`${r.name}: ${d.subject} @ ${d.context}: ${d.reason}`);
      f.declined++;
    }
    for (const p of r.run.pairs) {
      f.pairs++; result.pairs++;
      const ctx = byId.get(p.context) || byName.get(p.context);
      if (!ctx) { skip(`unknown context ${p.context}`); continue; }
      const row = (ctx.subjects || []).find((s) => s.subject === p.subject && (!p.bundle || !s.bundle || s.bundle === p.bundle));
      if (!row) { skip(`${ctx.name} has no pair for ${p.subject} - a merge never adds a pair; name it in registryProposal`); continue; }
      if (!STATES.has(p.state)) { skip(`${p.subject} state "${p.state}" not in vocabulary`); continue; }
      // Uncertain is not a verdict: an `unknown` must not overwrite a recorded one.
      if (p.state === 'unknown') { result.declined.push(`${r.name}: ${p.subject} @ ${ctx.name}: returned unknown`); f.declined++; continue; }
      if (!p.evidence) { skip(`${p.subject} ${p.state} without evidence`); continue; }
      const bad = anchorProblem(root, p.evidence);
      if (bad) { skip(`${p.subject} @ ${ctx.name}: ${bad}`); continue; }

      const ts = stampOf(p.evaluatedAt) ?? r.ts;
      const bundle = p.bundle || row.bundle;
      const key = `${ctx.context}/${p.subject}`;
      const prior = detail.pairs[key];
      const incoming = { state: p.state, evidence: p.evidence, evaluatedAt: new Date(ts).toISOString(), worker };
      const judged = Boolean(row.state) && row.state !== 'unknown';
      // The detail's timestamp is the precise one, but only while it still describes the row:
      // a later single-writer /conform run may have moved the row without touching the detail.
      const priorTs = prior && prior.evaluatedAt === row.evaluatedAt && prior.state === row.state ? prior.evaluatedTs : null;
      const existingTs = stampOf(priorTs) ?? stampOf(row.evaluatedAt);
      const sameVerdict = row.state === p.state && row.evidence === p.evidence;
      if (sameVerdict && (row.evaluatedAt === dateOf(ts) || (existingTs !== null && ts < existingTs))) {
        f.unchanged++; result.unchanged++;
        continue;
      }
      if (judged && existingTs !== null && ts < existingTs) {
        // Older than what the map holds: recorded, never applied.
        const entry = prior || { context: ctx.name, subject: p.subject, bundle, state: row.state, evaluatedAt: row.evaluatedAt, worker: null, techniques: [] };
        addSuperseded(entry, { ...incoming, reason: 'older than the verdict the map holds' });
        detail.pairs[key] = entry;
        if (row.state !== p.state) result.conflicts.push({ pair: key, context: ctx.name, subject: p.subject, kept: { state: row.state, evaluatedAt: priorTs || row.evaluatedAt }, lost: incoming });
        f.older++; result.older++;
        continue;
      }
      const superseded = { superseded: prior?.superseded || [] };
      if (judged && !sameVerdict) {
        const was = { state: row.state, evidence: row.evidence, evaluatedAt: priorTs || row.evaluatedAt, worker: priorTs ? prior.worker ?? null : null, reason: `replaced by ${worker}` };
        addSuperseded(superseded, was);
        if (row.state !== p.state) result.conflicts.push({ pair: key, context: ctx.name, subject: p.subject, kept: incoming, lost: was });
      }
      const ix = index[`${bundle}/${p.subject}`];
      const was = row.state;
      row.state = p.state;
      row.evidence = p.evidence;
      row.evaluatedAt = dateOf(ts);
      row.evaluatedAgainst = ix?.digest || row.digest || row.evaluatedAgainst;
      const rev = ix ? ix.revision : row.revision;
      if (Number.isInteger(rev)) row.evaluatedRevision = rev; else delete row.evaluatedRevision;
      delete row.stale;
      const flip = `${was || 'unknown'} -> ${p.state}`;
      result.flips[flip] = (result.flips[flip] || 0) + 1;
      result.states[p.state] = (result.states[p.state] || 0) + 1;
      f.merged++; result.merged++;
      for (const t of p.techniques || []) {
        result.techniques[t.verdict] = (result.techniques[t.verdict] || 0) + 1;
        if (t.verdict === 'deviation') result.deviations.push({ context: ctx.name, subject: p.subject, technique: t.technique, evidence: t.evidence });
      }
      if (p.registryProposal) result.proposals.push({ subject: p.subject, context: ctx.name, proposal: p.registryProposal });
      const entry = {
        context: ctx.name, subject: p.subject, bundle, state: p.state, evaluatedAt: row.evaluatedAt,
        evaluatedTs: incoming.evaluatedAt, worker, techniques: p.techniques || [], registryProposal: p.registryProposal,
      };
      if (superseded.superseded.length) entry.superseded = superseded.superseded;
      detail.pairs[key] = entry;
    }
  }

  if (!dry) {
    const nextDetail = JSON.stringify(detail, null, 2) + '\n';
    const nextMap = JSON.stringify(map, null, 2) + '\n';
    if (nextDetail !== detailText) writeAtomic(detailPath, nextDetail);
    if (nextMap !== mapText) writeAtomic(mapPath, nextMap);
    const pending = runs.filter((r) => r.source === 'pending');
    if (pending.length) fs.mkdirSync(mergedDir, { recursive: true });
    for (const r of pending) {
      const dest = path.join(mergedDir, r.name);
      if (r.already) fs.rmSync(r.abs, { force: true });
      else if (!fs.existsSync(dest)) fs.renameSync(r.abs, dest);
      else {
        // Same name, different bytes: keep both, never overwrite an archived run.
        const alt = path.join(mergedDir, `${r.name.replace(/\.json$/, '')}.${r.hash.slice(0, 8)}.json`);
        if (fs.existsSync(alt)) fs.rmSync(r.abs, { force: true }); else fs.renameSync(r.abs, alt);
      }
    }
    // After archiving: a crash here loses a signal line rather than appending it twice.
    const lines = pending.filter((r) => !r.already)
      .flatMap((r) => (Array.isArray(r.run.consults) ? r.run.consults : []))
      .filter((o) => o && typeof o === 'object' && !Array.isArray(o))
      .map((o) => JSON.stringify(o));
    if (lines.length) {
      fs.appendFileSync(consultsPath, lines.join('\n') + '\n');
      result.consultsAppended = lines.length;
    }
  }

  result.judged = map.contexts.reduce((n, c) => n + (c.subjects || []).filter((s) => s.state && s.state !== 'unknown').length, 0);
  result.total = map.contexts.reduce((n, c) => n + (c.subjects || []).length, 0);
  return result;
}

function printFunnel(r) {
  const merged = r.files.filter((f) => f.status === 'merged' || f.status === 'already-merged');
  console.log(`merge-conform-runs${r.dry ? ' (dry)' : ''}: ${merged.length} run file(s) · ${r.pairs} pair verdict(s) · ${r.merged} merged · ${r.unchanged} unchanged · ${r.older} older than the map · ${r.skipped.length} skipped`);
  for (const f of r.files.filter((x) => !['merged', 'already-merged'].includes(x.status))) console.log(`  - ${f.file}: ${f.status}${f.note ? ` (${f.note})` : ''}`);
  for (const f of r.files.filter((x) => x.status === 'already-merged')) console.log(`  - ${f.file}: already merged, no-op`);
  console.log(`  pair states this merge: ${JSON.stringify(r.states)}`);
  console.log(`  verdict movement (was -> now): ${JSON.stringify(r.flips)}`);
  console.log(`  conflicts on one pair (${r.conflicts.length}):`);
  for (const c of r.conflicts) console.log(`  - ${c.subject} @ ${c.context}: kept ${c.kept.state} (${c.kept.evaluatedAt}), recorded ${c.lost.state} (${c.lost.evaluatedAt})`);
  console.log(`  declined, left as they were (${r.declined.length}):`);
  for (const d of r.declined) console.log(`  - ${d}`);
  console.log(`  technique verdicts this merge: ${JSON.stringify(r.techniques)}`);
  console.log(`  map now: ${r.judged}/${r.total} pairs judged${r.consultsAppended ? ` · ${r.consultsAppended} consult line(s) appended` : ''}`);
  for (const s of r.skipped) console.log(`  - skipped: ${s}`);
  if (r.proposals.length) { console.log(`  registry proposals (${r.proposals.length}):`); for (const p of r.proposals) console.log(`  - [${p.subject} @ ${p.context}] ${p.proposal}`); }
  console.log(`  technique deviations (${r.deviations.length}) - the apply backlog:`);
  for (const d of r.deviations) console.log(`  - ${d.subject}/${d.technique} @ ${d.context}: ${d.evidence}`);
}

export function main(argv) {
  const usage = 'usage: scripts/merge-conform-runs.mjs <project-root> [--dry] [--json] [--only a.json,b.json] [--wait-lock-ms <n>] [--reapply] [--registry <dir>]';
  const opts = { dry: false, json: false, only: null, reapply: false, waitLockMs: 0, registry: REGISTRY_ROOT, root: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') opts.dry = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--reapply') opts.reapply = true;
    else if (a === '--only') opts.only = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--wait-lock-ms') opts.waitLockMs = Number(argv[++i]) || 0;
    else if (a === '--registry') opts.registry = path.resolve(String(argv[++i] || ''));
    else if (a.startsWith('--')) { console.error(`unknown flag ${a}\n${usage}`); return EXIT.FATAL; }
    else if (!opts.root) opts.root = path.resolve(a);
    else { console.error(usage); return EXIT.FATAL; }
  }
  if (!opts.root) { console.error(usage); return EXIT.FATAL; }
  if (opts.only && !opts.only.length) { console.error('--only needs at least one file name'); return EXIT.FATAL; }
  let r;
  try { r = mergeRuns(opts); } catch (e) {
    if (e instanceof MergeFatal) {
      if (opts.json) console.log(JSON.stringify({ ok: false, error: e.message }));
      else console.error(`merge-conform-runs: ${e.message}`);
      return EXIT.FATAL;
    }
    throw e;
  }
  if (r.contended) {
    const msg = `the merge lock is held by live pid ${r.holder?.pid} since ${r.holder?.at}`;
    if (opts.json) console.log(JSON.stringify({ ok: false, contended: true, holder: r.holder, error: msg }));
    else console.error(`merge-conform-runs: ${msg}`);
    return EXIT.CONTENDED;
  }
  if (opts.json) console.log(JSON.stringify({ ok: true, ...r }, null, 2));
  else printFunnel(r);
  return EXIT.OK;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
