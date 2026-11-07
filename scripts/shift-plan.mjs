#!/usr/bin/env node
/**
 * shift-plan - turn the operator's YouTube list into a plan the operator can approve.
 *
 * WHY
 * Mining a list one video at a time spends a full run on what a neighbour already said, and on
 * what a newer video has outdated. So /shift pre-researches: this instrument gathers cheap facts
 * about every video, a planner seat groups them into clusters, and the operator approves. The
 * JUDGEMENT is the planner's. This script only fetches, paces, and refuses a plan whose
 * mechanics are wrong - above all a convergence count that counts videos, not authors.
 *
 * YouTube's 429s, not CPU, are the real limit here (a dead video already costs 3 x 180 s in
 * research-ingest), so everything is serial and paced, and per-video progress is persisted so
 * a kill loses at most the video in flight. The operator's list is read and never rewritten.
 *
 * COMMANDS (state in .ai/shift/)
 *   sync                        list -> queue: expand playlists, park mined and struck ids
 *   meta [--limit n]            yt-dlp metadata per video, at least 8 s apart      new -> meta
 *   transcripts [--limit n]     research-ingest per video, serial      meta -> transcript | no-transcript
 *   brief                       write plans/<planId>/input.json for the planner seat
 *   validate <plan.json>        mechanical schema check; exit 1 lists violations
 *   render <planId>             write plans/<planId>/index.html and print the plan's digest      plan's videos -> planned
 *   approve <planId> [--strike <clusterId>]...     approved, or parked with the reason; stores the
 *                               sha256 of plan.json's bytes, and re-approves a plan changed since
 *   status                      counts per status
 *
 * Nothing here ever records a video as declined: a superseded or struck video was not judged.
 *
 * EXIT 0 ok · 1 violations found (validate, render or approve of a bad plan; unusable list lines)
 *      2 could not run (usage, no yt-dlp, unreadable ledger, YouTube still throttling after backoff)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { minedVideoIds, VIDEO_ID_RE } from './lib/shift-source-ledger.mjs';
import { STATUSES, UNPLANNED, UsageError, atomicWrite, parseArgs, planDigest, readQueue, sleepSync, stateDir, withQueue } from './shift-queue.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const LIST_FILE = path.join('.ai', '.youtube-intake.local.md');
export const PACE_MS = 8000;
const MAX_RETRIES = 4;
const MAX_PACE_MS = 5 * 60 * 1000;
const YT_TIMEOUT_MS = 3 * 60 * 1000;
const INGEST_TIMEOUT_MS = 15 * 60 * 1000; // three caption rungs at 180 s each, plus oEmbed
const DESCRIPTION_STORE_CAP = 4000;
const DESCRIPTION_BRIEF_CAP = DESCRIPTION_STORE_CAP; // A cut description hid the links a source's prompts live behind.
const OPENING_WORDS = 1500;
const THROTTLE_MARK = /HTTP Error 429|Too Many Requests|Sign in to confirm/i;
const GONE = /video unavailable|private video|has been removed|members-only|no longer available/i;
const PLAN_ID_RE = /^[A-Za-z0-9._-]+$/;
const CLUSTER_KEYS = ['id', 'theme', 'videos', 'voices', 'homes', 'yield', 'superseded', 'gpuProofs', 'estSeats'];
const PLAN_KEYS = ['planId', 'createdAt', 'clusters'];
const SUPERSEDED_KEYS = ['video', 'by', 'reason'];

const plansDir = (root) => path.join(stateDir(root), 'plans');
const firstLine = (s) => String(s ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0] ?? '';
const lastLine = (s) => String(s ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop() ?? '';
const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/**
 * Pure. A throttle is what yt-dlp itself reports as an error. Matching all stderr once labelled a
 * captionless video throttled: a word in its metadata or a warning read as a 429, so it was retried
 * every run and doubled the pace. research-ingest relays the same line inside "Last error: ", joined
 * with the line before it, so a warning can share the line and is cut off here.
 */
export function isThrottled(stderr) {
  const errors = String(stderr ?? '').match(/\bERROR:[^\n]*/g) ?? [];
  return errors.some((e) => THROTTLE_MARK.test(e.split(/\bWARNING:/)[0]));
}

/* ---------------------------------------------------------------- the list */

/** What one URL names. Query values stay as written: playlist and video ids are case-sensitive. */
export function classifyUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { return { kind: 'invalid', why: 'not a URL' }; }
  const host = u.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  let id = null;
  if (host === 'youtu.be') id = parts[0];
  else if (host === 'youtube.com') {
    if (parts[0] === 'watch') id = u.searchParams.get('v');
    else if (['shorts', 'live', 'embed'].includes(parts[0])) id = parts[1];
    else if (parts[0] === 'playlist' && u.searchParams.get('list')) {
      return { kind: 'playlist', list: u.searchParams.get('list'), url: `https://www.youtube.com/playlist?list=${u.searchParams.get('list')}` };
    } else return { kind: 'invalid', why: 'a YouTube URL that names neither a video nor a playlist' };
  } else return { kind: 'invalid', why: 'not a YouTube URL' };
  if (!id || !VIDEO_ID_RE.test(id)) return { kind: 'invalid', why: 'no video id in the URL' };
  return { kind: 'video', id, url: watchUrl(id) };
}

/**
 * Pure. Drops the list lines whose row has landed, so the operator's file holds only what is still to
 * do. A repository line matches `gh-<owner>-<name>`, or a landed row whose note names it, as a fork
 * folded into its parent does. A note line stays only while a URL is left below it.
 */
export function pruneList(text, rows) {
  const eol = String(text).includes('\r\n') ? '\r\n' : '\n';
  const landed = rows.filter((r) => r.status === 'landed');
  const ids = new Set(landed.map((r) => String(r.id).toLowerCase()));
  const notes = landed.map((r) => String(r.note ?? '').toLowerCase());
  const urlOf = (line) => /(https?:\/\/\S+)/.exec(line)?.[1] ?? null;
  const isLanded = (url) => {
    const gh = /github\.com\/([^/\s#?]+)\/([^/\s#?]+)/i.exec(url);
    if (gh) {
      const name = gh[2].replace(/\.git$/i, '');
      return ids.has(`gh-${gh[1]}-${name}`.toLowerCase()) || notes.some((n) => n.includes(`${gh[1]}/${name}`.toLowerCase()));
    }
    const c = classifyUrl(url);
    return c.kind === 'video' && ids.has(c.id.toLowerCase());
  };
  const removed = [];
  const kept = [];
  for (const line of String(text).split(/\r?\n/)) {
    const url = urlOf(line);
    if (url && isLanded(url)) removed.push(url);
    else kept.push(line);
  }
  let urlBelow = false;
  const out = [];
  for (const line of kept.reverse()) {
    if (urlOf(line)) urlBelow = true;
    else if (line.trim() && !urlBelow) continue;
    out.unshift(line);
  }
  const body = out.join(eol).replace(/(\r?\n){3,}/g, `${eol}${eol}`).trim();
  return { text: body ? `${body}${eol}` : '', removed };
}

function cmdPrune(argv, ctx) {
  parseArgs(argv);
  const file = path.join(ctx.root, LIST_FILE);
  if (!fs.existsSync(file)) { ctx.log(JSON.stringify({ removed: 0 })); return EXIT.OK; }
  const before = fs.readFileSync(file, 'utf8');
  const { text, removed } = pruneList(before, readQueue(ctx.root));
  if (removed.length) {
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, text);
    // The operator edits this file by hand. If it moved while we read, leave it for the next tick.
    if (fs.readFileSync(file, 'utf8') !== before) { fs.rmSync(tmp, { force: true }); ctx.err('list changed while pruning; left as it was'); return EXIT.OK; }
    fs.renameSync(tmp, file);
  }
  ctx.log(JSON.stringify({ removed: removed.length, left: text.split(/\r?\n/).filter((l) => /https?:\/\//.test(l)).length }));
  return EXIT.OK;
}

/** One URL or playlist per line; trailing `# note`; leading `-` strikes; blank and `#` lines skip. */
export function parseList(text) {
  const entries = [];
  const invalid = [];
  String(text).split(/\r?\n/).forEach((rawLine, i) => {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) return;
    const struck = line.startsWith('-');
    if (struck) line = line.slice(1).trim();
    // A note needs whitespace before its hash: a `#t=30` fragment belongs to the URL.
    const m = /^(\S+)(?:\s+#\s*(.*))?$/.exec(line);
    if (!m) { invalid.push({ line: i + 1, text: rawLine.trim(), why: 'expected one URL and an optional # note' }); return; }
    const c = classifyUrl(m[1]);
    if (c.kind === 'invalid') { invalid.push({ line: i + 1, text: rawLine.trim(), why: c.why }); return; }
    entries.push({ ...c, struck, ...(m[2]?.trim() ? { note: m[2].trim() } : {}) });
  });
  return { entries, invalid };
}

/* ---------------------------------------------------------------- sync */

/** Not yet mined by this shift, so parking it throws no work away. */
const NO_MINING_WORK = [...UNPLANNED, 'planned', 'approved'];

/**
 * Pure. `videos` are this sync's active ids, `struckIds`/`struckLists` what the operator struck.
 * Rows are edited in place, and a row's timestamp moves only when the row changes, so a second
 * sync of the same list writes the same bytes.
 */
export function applySync(rows, { videos, struckIds, struckLists, mined, iso }) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const counts = { added: 0, parked: 0, restored: 0, struckTooLate: [] };
  const park = (r, reason) => {
    if (!NO_MINING_WORK.includes(r.status)) return false;
    Object.assign(r, { status: 'parked', reason, updatedAt: iso });
    counts.parked++;
    return true;
  };
  const isStruck = (v) => struckIds.has(v.id);

  for (const v of videos) {
    const known = byId.get(v.id);
    if (known) {
      if (v.note && known.note !== v.note) Object.assign(known, { note: v.note, updatedAt: iso });
      continue;
    }
    const row = { id: v.id, url: watchUrl(v.id), status: 'new', addedAt: iso, updatedAt: iso,
      ...(v.note ? { note: v.note } : {}), ...(v.list ? { list: v.list } : {}) };
    rows.push(row);
    byId.set(v.id, row);
    counts.added++;
  }
  for (const id of struckIds) {
    if (byId.has(id)) continue;
    const row = { id, url: watchUrl(id), status: 'new', addedAt: iso, updatedAt: iso };
    rows.push(row);
    byId.set(id, row);
  }

  for (const r of rows) {
    const struck = isStruck(r) || (r.list && struckLists.has(r.list));
    if (mined.has(r.id)) {
      if (r.status === 'parked' && r.reason === 'already-mined') continue;
      if (r.status !== 'parked' || r.reason === 'operator-struck') {
        if (r.status === 'parked') Object.assign(r, { reason: 'already-mined', updatedAt: iso });
        else park(r, 'already-mined');
      }
    } else if (struck) {
      if (r.status === 'parked') continue;
      if (!park(r, 'operator-struck')) counts.struckTooLate.push(r.id);
    } else if (r.status === 'parked' && r.reason === 'operator-struck') {
      // The operator took the strike back; the list is theirs.
      r.status = r.channel ? 'meta' : 'new';
      delete r.reason;
      r.updatedAt = iso;
      counts.restored++;
    }
  }
  return counts;
}

function cmdSync(argv, ctx) {
  parseArgs(argv);
  const file = path.join(ctx.root, LIST_FILE);
  if (!fs.existsSync(file)) {
    ctx.log(`no list yet. Create ${LIST_FILE.split(path.sep).join('/')} with one YouTube URL or playlist per line:`);
    ctx.log('  https://www.youtube.com/watch?v=<id>   # optional note');
    ctx.log('  - https://www.youtube.com/watch?v=<id>   # a leading dash strikes the entry');
    return EXIT.OK;
  }
  const { entries, invalid } = parseList(fs.readFileSync(file, 'utf8'));
  const mined = minedVideoIds(ctx.root);

  const videos = [];
  const struckIds = new Set();
  const struckLists = new Set();
  const failedLists = [];
  let expansions = 0;
  for (const e of entries) {
    if (e.kind === 'video') {
      if (e.struck) struckIds.add(e.id);
      else videos.push({ id: e.id, note: e.note });
      continue;
    }
    if (e.struck) { struckLists.add(e.list); continue; }
    if (expansions++ > 0) ctx.sleep(PACE_MS);
    const r = ctx.ytdlp(['--flat-playlist', '--print', '%(id)s', '--no-warnings', '--encoding', 'utf-8', e.url]);
    if (r.status !== 0) { failedLists.push({ url: e.url, why: lastLine(r.stderr) || r.error?.message || `exit ${r.status}` }); continue; }
    for (const id of String(r.stdout).split(/\r?\n/).map((s) => s.trim()).filter((s) => VIDEO_ID_RE.test(s))) {
      videos.push({ id, note: e.note, list: e.list });
    }
  }

  const iso = new Date(ctx.now()).toISOString();
  const counts = withQueue(ctx.root, (rows) => applySync(rows, { videos, struckIds, struckLists, mined, iso }));
  ctx.log(JSON.stringify({ added: counts.added, parked: counts.parked, restored: counts.restored, mined_known: mined.size }));
  if (counts.struckTooLate.length) ctx.log(`struck but mining already started, left as they are: ${counts.struckTooLate.join(', ')}`);
  for (const f of failedLists) ctx.err(`playlist not expanded: ${f.url} (${f.why})`);
  for (const b of invalid) ctx.err(`list line ${b.line} skipped: ${b.why}: ${b.text}`);
  if (failedLists.length) return EXIT.FATAL;
  return invalid.length ? EXIT.VIOLATIONS : EXIT.OK;
}

/* ---------------------------------------------------------------- meta */

const META_ARGS = (url) => ['--skip-download', '--no-warnings', '--no-playlist', '--encoding', 'utf-8', '--print',
  '%(.{id,upload_date,duration,channel,uploader,title,description})j', url];

function limitOf(opts) {
  if (!opts.limit) return Infinity;
  if (!/^[1-9][0-9]*$/.test(opts.limit[0])) throw new UsageError(`--limit must be a positive integer, got "${opts.limit[0]}"`);
  return Number(opts.limit[0]);
}

function requireYtdlp(ctx) {
  const r = ctx.ytdlp(['--version']);
  if (r.error || r.status !== 0) throw new Error('yt-dlp is not runnable; install it or run this on a machine that has it');
}

function metaFields(stdout, id) {
  let j;
  try { j = JSON.parse(lastLine(stdout)); } catch { return null; }
  if (j.id !== id) return null;
  const d = /^(\d{4})(\d{2})(\d{2})$/.exec(String(j.upload_date ?? ''));
  return {
    title: j.title ?? null,
    channel: j.channel ?? j.uploader ?? null,
    date: d ? `${d[1]}-${d[2]}-${d[3]}` : null,
    duration: Number.isFinite(j.duration) ? j.duration : null,
    description: String(j.description ?? '').slice(0, DESCRIPTION_STORE_CAP),
  };
}

function cmdMeta(argv, ctx) {
  const limit = limitOf(parseArgs(argv, { valued: ['limit'] }).opts);
  requireYtdlp(ctx);
  const targets = readQueue(ctx.root).filter((r) => r.status === 'new').slice(0, limit);
  const patch = (id, fields) => withQueue(ctx.root, (rows) => {
    const r = rows.find((x) => x.id === id);
    // A sibling may have parked it while the fetch ran; its decision stands.
    if (r?.status !== 'new') return;
    delete r.metaError;
    Object.assign(r, fields, { updatedAt: new Date(ctx.now()).toISOString() });
  });
  let done = 0;
  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    if (i > 0) ctx.sleep(PACE_MS);
    let backoff = PACE_MS * 2;
    let r = ctx.ytdlp(META_ARGS(v.url));
    for (let retry = 0; r.status !== 0 && isThrottled(r.stderr) && retry < MAX_RETRIES; retry++) {
      ctx.sleep(backoff);
      backoff *= 2;
      r = ctx.ytdlp(META_ARGS(v.url));
    }
    const stderr = String(r.stderr ?? '');
    if (r.status === 0) {
      const fields = metaFields(r.stdout, v.id);
      if (fields) { patch(v.id, { ...fields, status: 'meta' }); done++; ctx.log(`meta ${v.id} ${fields.channel ?? '?'}: ${fields.title ?? '?'}`); }
      else { patch(v.id, { metaError: 'unreadable yt-dlp output' }); ctx.err(`meta ${v.id}: unreadable yt-dlp output`); }
    } else if (isThrottled(stderr)) {
      // More calls only deepen a throttle. Progress is on disk; the filler ladder carries on.
      throw new Error(`YouTube still throttling after ${MAX_RETRIES} retries at ${v.id}; ${done} done this run, re-run later`);
    } else if (GONE.test(stderr)) {
      patch(v.id, { status: 'parked', reason: `unavailable: ${lastLine(stderr).slice(0, 200)}` });
      ctx.log(`meta ${v.id}: parked, unavailable`);
    } else {
      patch(v.id, { metaError: lastLine(stderr).slice(0, 200) || `exit ${r.status}` });
      ctx.err(`meta ${v.id}: ${lastLine(stderr) || `exit ${r.status}`}`);
    }
  }
  ctx.log(`meta: ${done} of ${targets.length} fetched`);
  return EXIT.OK;
}

/* ---------------------------------------------------------------- transcripts */

/** What one research-ingest exit means for the queue. Never blocks the run. */
export function transcriptOutcome(r, root) {
  const stderr = String(r.stderr ?? '');
  if (r.status === 3) return { status: 'no-transcript', reason: 'thin' };
  if (r.status === 0) {
    let j = null;
    try { j = JSON.parse(r.stdout); } catch { /* falls through */ }
    if (!j?.path) return { status: 'no-transcript', reason: 'ingest printed no transcript path' };
    return { status: 'transcript', transcriptPath: path.relative(root, path.resolve(root, j.path)).split(path.sep).join('/'), words: j.words ?? null };
  }
  const why = (r.status === null ? (r.error?.message ?? 'timed out') : firstLine(stderr.replace(/^research-ingest FATAL:\s*/, ''))).slice(0, 200) || `exit ${r.status}`;
  if (isThrottled(stderr)) return { status: 'no-transcript', reason: `throttled: ${why}` };
  // Its answer, not a failure: it is not retried and it does not move the pace.
  if (/wrote no captions/.test(why)) return { status: 'no-transcript', reason: 'no captions' };
  return { status: 'no-transcript', reason: why };
}

function cmdTranscripts(argv, ctx) {
  const limit = limitOf(parseArgs(argv, { valued: ['limit'] }).opts);
  requireYtdlp(ctx);
  // A throttled video was never heard from, so it gets another turn. The others had their answer.
  const targets = readQueue(ctx.root)
    .filter((r) => r.status === 'meta' || (r.status === 'no-transcript' && String(r.reason).startsWith('throttled')))
    .slice(0, limit);
  let pace = PACE_MS;
  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    if (i > 0) ctx.sleep(pace);
    const out = transcriptOutcome(ctx.ingest(v.url, path.join('.ai', 'shift', 'transcripts', v.id)), ctx.root);
    pace = String(out.reason).startsWith('throttled') ? Math.min(pace * 2, MAX_PACE_MS) : PACE_MS;
    withQueue(ctx.root, (rows) => {
      const r = rows.find((x) => x.id === v.id);
      if (r?.status !== 'meta' && r?.status !== 'no-transcript') return;
      if (out.status === 'transcript') delete r.reason;
      Object.assign(r, out, { updatedAt: new Date(ctx.now()).toISOString() });
    });
    ctx.log(`transcript ${v.id}: ${out.status}${out.words ? ` (${out.words} words)` : ''}${out.reason ? ` - ${out.reason}` : ''}`);
  }
  ctx.log(`transcripts: ${targets.length} attempted`);
  return EXIT.OK;
}

/* ---------------------------------------------------------------- brief */

function openingOf(root, row) {
  if (!row.transcriptPath) return null;
  try { return fs.readFileSync(path.join(root, row.transcriptPath), 'utf8').split(/\s+/).filter(Boolean).slice(0, OPENING_WORDS).join(' '); }
  catch { return null; }
}

const pad = (n) => String(n).padStart(2, '0');

function newPlanId(root, ms) {
  const d = new Date(ms);
  const base = `plan-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  let id = base;
  for (let n = 2; fs.existsSync(path.join(plansDir(root), id)); n++) id = `${base}-${n}`;
  return id;
}

const BRIEFABLE = ['meta', 'transcript', 'no-transcript'];

function cmdBrief(argv, ctx) {
  parseArgs(argv);
  const rows = readQueue(ctx.root);
  const chosen = rows.filter((r) => BRIEFABLE.includes(r.status));
  if (!chosen.length) { ctx.log('brief: nothing with metadata to plan; run sync and meta first'); return EXIT.OK; }
  const planId = newPlanId(ctx.root, ctx.now());
  const file = path.join(plansDir(ctx.root), planId, 'input.json');
  atomicWrite(file, `${JSON.stringify({
    planId,
    createdAt: new Date(ctx.now()).toISOString(),
    videos: chosen.map((r) => ({
      id: r.id,
      title: r.title ?? null,
      channel: r.channel ?? null,
      date: r.date ?? null,
      duration: r.duration ?? null,
      status: r.status,
      ...(r.status === 'no-transcript' ? { reason: r.reason ?? null } : {}),
      description: r.description ? r.description.slice(0, DESCRIPTION_BRIEF_CAP) : null,
      transcriptOpening: openingOf(ctx.root, r),
      note: r.note ?? null,
    })),
  }, null, 1)}\n`);
  const left = rows.filter((r) => r.status === 'new').length;
  if (left) ctx.err(`${left} video(s) still have no metadata and are not in this brief`);
  ctx.log(path.relative(ctx.root, file).split(path.sep).join('/'));
  return EXIT.OK;
}

/* ---------------------------------------------------------------- validate */

/** Every file research-map can return as an address, read the way it reads them. */
export function knownHomes(root) {
  const known = new Set();
  const dir = path.join(root, 'knowledge');
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const indexFile = path.join(dir, d.name, 'index.json');
    if (!fs.existsSync(indexFile)) continue;
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    for (const s of Object.values(index.subjects ?? {})) {
      if (s.file) known.add(s.file);
      for (const t of s.techniques ?? []) {
        const tf = t.file ?? (s.file ? s.file.replace(/\/[^/]+\.md$/, `/techniques/${t.slug}.md`) : null);
        if (tf) known.add(tf);
      }
    }
  }
  return known;
}

const exactKeys = (obj, keys, where, out) => {
  for (const k of keys) if (!Object.prototype.hasOwnProperty.call(obj, k)) out.push(`${where}: missing key "${k}"`);
  for (const k of Object.keys(obj)) if (!keys.includes(k)) out.push(`${where}: unknown key "${k}"`);
};
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonBlank = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Pure. Every mechanical reason this plan cannot be approved. `universe` is the set of videos
 * the plan must place, `rows` supply channels, `isHome` answers whether an address is real.
 */
export function validatePlan(plan, { rows, universe, isHome, mined = new Set() }) {
  const out = [];
  if (!isObject(plan)) return ['the plan must be a JSON object'];
  exactKeys(plan, PLAN_KEYS, 'plan', out);
  if (!nonBlank(plan.planId) || !PLAN_ID_RE.test(plan.planId)) out.push('plan.planId must be a plain id');
  if (!nonBlank(plan.createdAt) || Number.isNaN(Date.parse(plan.createdAt))) out.push('plan.createdAt must be a date');
  if (!Array.isArray(plan.clusters)) { out.push('plan.clusters must be an array'); return out; }

  const byId = new Map(rows.map((r) => [r.id, r]));
  const placed = new Map();
  const place = (id, where) => { if (!placed.has(id)) placed.set(id, []); placed.get(id).push(where); };
  const active = new Set();
  const clusterIds = new Set();

  plan.clusters.forEach((c, i) => {
    const where = `cluster[${isObject(c) && c.id ? c.id : i}]`;
    if (!isObject(c)) { out.push(`${where}: must be an object`); return; }
    exactKeys(c, CLUSTER_KEYS, where, out);
    if (!nonBlank(c.id) || !PLAN_ID_RE.test(c.id)) out.push(`${where}: id must be a plain id`);
    else if (clusterIds.has(c.id)) out.push(`${where}: duplicate cluster id`);
    else clusterIds.add(c.id);
    if (!nonBlank(c.theme)) out.push(`${where}: theme must not be blank`);
    if (!nonBlank(c.yield)) out.push(`${where}: yield must not be blank`);
    if (!Number.isInteger(c.estSeats) || c.estSeats < 0) out.push(`${where}: estSeats must be a whole number`);
    if (!Array.isArray(c.gpuProofs)) out.push(`${where}: gpuProofs must be an array`);

    const videos = Array.isArray(c.videos) ? c.videos : [];
    if (!Array.isArray(c.videos)) out.push(`${where}: videos must be an array`);
    for (const id of videos) { place(id, `${where}.videos`); active.add(id); }

    // Convergence counts authors. Three videos from one channel are one voice.
    const channels = new Set();
    for (const id of videos) {
      const ch = byId.get(id)?.channel;
      if (nonBlank(ch)) channels.add(ch.trim().toLowerCase());
      else out.push(`${where}: video ${id} has no recorded channel, so its voices cannot be counted`);
    }
    if (c.voices !== channels.size) out.push(`${where}: voices is ${JSON.stringify(c.voices)} but its videos have ${channels.size} distinct channel(s)`);

    if (!Array.isArray(c.homes)) out.push(`${where}: homes must be an array`);
    else for (const h of c.homes) if (!isHome(h)) out.push(`${where}: home ${JSON.stringify(h)} is not a file any research-map hit returns`);

    if (!Array.isArray(c.superseded)) out.push(`${where}: superseded must be an array`);
    else c.superseded.forEach((s, j) => {
      const sw = `${where}.superseded[${j}]`;
      if (!isObject(s)) { out.push(`${sw}: must be an object`); return; }
      exactKeys(s, SUPERSEDED_KEYS, sw, out);
      if (!nonBlank(s.reason)) out.push(`${sw}: reason must not be blank`);
      place(s.video, sw);
    });
  });

  for (const c of plan.clusters) {
    if (!isObject(c) || !Array.isArray(c.superseded)) continue;
    for (const s of c.superseded) {
      if (isObject(s) && !active.has(s.by) && !mined.has(s.by)) out.push(`cluster[${c.id}]: ${s.video} superseded by ${JSON.stringify(s.by)}, which is neither a kept video in this plan nor already mined`);
    }
  }
  for (const [id, wheres] of placed) {
    if (wheres.length > 1) out.push(`video ${id} appears ${wheres.length} times: ${wheres.join(', ')}`);
    if (!universe.has(id)) out.push(`video ${id} is not a video this plan was asked to place`);
  }
  for (const id of universe) if (!placed.has(id)) out.push(`orphan video ${id}: in no cluster's videos[] or superseded[]`);
  return out;
}

/** The videos a plan must place: its own brief when it has one, so a later sync cannot orphan it. */
function universeFor(root, planId, rows) {
  const inputFile = planId && PLAN_ID_RE.test(planId) ? path.join(plansDir(root), planId, 'input.json') : null;
  if (inputFile && fs.existsSync(inputFile)) return new Set(JSON.parse(fs.readFileSync(inputFile, 'utf8')).videos.map((v) => v.id));
  return new Set(rows.filter((r) => BRIEFABLE.includes(r.status) || (r.status === 'planned' && r.planId === planId)).map((r) => r.id));
}

function violationsOf(plan, ctx) {
  const rows = readQueue(ctx.root);
  const known = knownHomes(ctx.root);
  return validatePlan(plan, {
    rows,
    universe: universeFor(ctx.root, plan?.planId, rows),
    isHome: (h) => typeof h === 'string' && known.has(h) && fs.existsSync(path.join(ctx.root, h)),
    mined: minedVideoIds(ctx.root),
  });
}

function report(violations, ctx) {
  ctx.log(`${violations.length} violation(s):`);
  for (const v of violations) ctx.log(`  ${v}`);
  return EXIT.VIOLATIONS;
}

function cmdValidate(argv, ctx) {
  const { positional: [file] } = parseArgs(argv);
  if (!file) throw new UsageError('validate needs <plan.json>');
  const text = fs.readFileSync(path.resolve(ctx.root, file), 'utf8');
  let plan;
  try { plan = JSON.parse(text); } catch (e) { return report([`not JSON: ${e.message}`], ctx); }
  const violations = violationsOf(plan, ctx);
  if (violations.length) return report(violations, ctx);
  ctx.log(`ok: ${plan.clusters.length} cluster(s), plan ${plan.planId}`);
  return EXIT.OK;
}

function loadPlan(planId, ctx) {
  if (!planId || !PLAN_ID_RE.test(planId)) throw new UsageError('a plain <planId> is required');
  const file = path.join(plansDir(ctx.root), planId, 'plan.json');
  if (!fs.existsSync(file)) throw new UsageError(`no plan at .ai/shift/plans/${planId}/plan.json`);
  // One read, so the digest is of the bytes that were validated.
  const bytes = fs.readFileSync(file);
  let plan;
  try { plan = JSON.parse(bytes.toString('utf8')); } catch (e) { return { violations: [`not JSON: ${e.message}`] }; }
  const violations = violationsOf(plan, ctx);
  if (plan?.planId !== planId) violations.push(`plan.planId is ${JSON.stringify(plan?.planId)} but it sits in ${planId}`);
  return { plan, digest: planDigest(bytes), violations };
}

/* ---------------------------------------------------------------- render */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = (items) => (items.length ? `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>` : '-');
const proofText = (p) => esc(typeof p === 'string' ? p : JSON.stringify(p));

export function renderPlanHtml(plan, rows, digest = null) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const video = (id) => {
    const r = byId.get(id);
    return `<a href="${esc(watchUrl(id))}">${esc(r?.title ?? id)}</a> <span class="dim">${esc(r?.channel ?? '?')}${r?.date ? `, ${esc(r.date)}` : ''}${r?.status === 'no-transcript' ? ', no transcript' : ''}</span>`;
  };
  const body = plan.clusters.map((c) => `<tr>
<td><b>${esc(c.id)}</b><br>${esc(c.theme)}</td>
<td>${list(c.videos.map(video))}</td>
<td class="n">${esc(c.voices)}</td>
<td>${list(c.homes.map((h) => `<code>${esc(h)}</code>`))}</td>
<td>${esc(c.yield)}</td>
<td>${list(c.superseded.map((s) => `${video(s.video)}<br>by <code>${esc(s.by)}</code>: ${esc(s.reason)}`))}</td>
<td>${list(c.gpuProofs.map(proofText))}</td>
<td class="n">${esc(c.estSeats)}</td>
</tr>`).join('\n');
  const kept = plan.clusters.reduce((n, c) => n + c.videos.length, 0);
  const superseded = plan.clusters.reduce((n, c) => n + c.superseded.length, 0);
  const noTranscript = plan.clusters.flatMap((c) => c.videos).filter((id) => byId.get(id)?.status === 'no-transcript').length;
  const seats = plan.clusters.reduce((n, c) => n + c.estSeats, 0);
  const proofs = plan.clusters.reduce((n, c) => n + c.gpuProofs.length, 0);
  const firstId = plan.clusters[0]?.id ?? '<clusterId>';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Shift plan ${esc(plan.planId)}</title>
<style>
body{font:15px/1.45 system-ui,sans-serif;margin:2rem;color:#1a1a1a;background:#fff}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:.5rem;vertical-align:top;text-align:left}
th{background:#f2f2f2}ul{margin:0;padding-left:1.1rem}.n{text-align:right}.dim{color:#666}
code,pre{font:13px ui-monospace,monospace;background:#f6f6f6}pre{padding:.75rem;overflow-x:auto}
@media (prefers-color-scheme:dark){body{background:#161616;color:#e8e8e8}th{background:#262626}th,td{border-color:#444}code,pre{background:#222}.dim{color:#aaa}a{color:#8ab4f8}}
</style></head><body>
<h1>Shift plan ${esc(plan.planId)}</h1>
<table>
<thead><tr><th>Theme</th><th>Videos</th><th>Voices</th><th>Homes</th><th>Expected yield</th><th>Superseded</th><th>Proofs owed</th><th>Est. seats</th></tr></thead>
<tbody>
${body}
</tbody></table>
<h2>Approve</h2>
${digest ? `<p>Plan digest (sha256 of plan.json): <code>${esc(digest)}</code>. Approval stores it, and a later edit to the plan stops its new work until it is approved again.</p>\n` : ''}<pre>node scripts/shift-plan.mjs approve ${esc(plan.planId)}</pre>
<p>To leave a cluster out, add a strike. Its videos are parked, not declined.</p>
<pre>node scripts/shift-plan.mjs approve ${esc(plan.planId)} --strike ${esc(firstId)}</pre>
<h2>Stats</h2>
<p>${plan.clusters.length} cluster(s), ${kept} video(s) to mine, ${superseded} superseded, ${noTranscript} without a transcript, ${proofs} proof(s) owed, ${seats} seat(s) estimated. Created ${esc(plan.createdAt)}.</p>
</body></html>
`;
}

function cmdRender(argv, ctx) {
  const { positional: [planId] } = parseArgs(argv);
  const { plan, digest, violations } = loadPlan(planId, ctx);
  if (violations.length) return report(violations, ctx);
  const iso = new Date(ctx.now()).toISOString();
  const rows = withQueue(ctx.root, (all) => {
    for (const c of plan.clusters) {
      for (const id of [...c.videos, ...c.superseded.map((s) => s.video)]) {
        const r = all.find((x) => x.id === id);
        if (r && UNPLANNED.includes(r.status)) Object.assign(r, { status: 'planned', planId, cluster: c.id, updatedAt: iso });
      }
    }
    return all.map((r) => ({ ...r }));
  });
  const file = path.join(plansDir(ctx.root), planId, 'index.html');
  atomicWrite(file, renderPlanHtml(plan, rows, digest));
  ctx.log(path.relative(ctx.root, file).split(path.sep).join('/'));
  ctx.log(`plan digest: ${digest}`);
  ctx.log(`approve with: node scripts/shift-plan.mjs approve ${planId} [--strike <clusterId>]...`);
  return EXIT.OK;
}

/* ---------------------------------------------------------------- approve */

const APPROVABLE = [...UNPLANNED, 'planned'];

function cmdApprove(argv, ctx) {
  const { positional: [planId], opts } = parseArgs(argv, { valued: ['strike'] });
  const { plan, digest, violations } = loadPlan(planId, ctx);
  if (violations.length) return report(violations, ctx);
  const marker = path.join(plansDir(ctx.root), planId, 'approved.json');
  let earlier = null;
  if (fs.existsSync(marker)) {
    try { earlier = JSON.parse(fs.readFileSync(marker, 'utf8')); } catch { earlier = {}; }
    // Only a changed plan can be approved again; without this, a mismatch could never be cleared.
    if (!earlier?.planDigest || earlier.planDigest === digest) { ctx.log(`plan ${planId} is already approved`); return EXIT.OK; }
  }
  const strikes = new Set([...(earlier?.struck ?? []), ...(opts.strike ?? [])]);
  const unknown = [...strikes].filter((s) => !plan.clusters.some((c) => c.id === s));
  if (unknown.length) throw new UsageError(`--strike names no cluster of this plan: ${unknown.join(', ')}`);

  const iso = new Date(ctx.now()).toISOString();
  const counts = withQueue(ctx.root, (rows) => {
    const n = { approved: 0, parked: 0 };
    const apply = (id, clusterId, fields) => {
      const r = rows.find((x) => x.id === id);
      // A row already parked, mining or landed got there by someone's decision. It stands.
      if (!r || !APPROVABLE.includes(r.status)) return;
      Object.assign(r, { planId, cluster: clusterId, updatedAt: iso }, fields);
      if (fields.status === 'approved') { delete r.reason; n.approved++; } else n.parked++;
    };
    for (const c of plan.clusters) {
      const struck = strikes.has(c.id);
      for (const id of c.videos) apply(id, c.id, struck ? { status: 'parked', reason: 'operator-struck-cluster' } : { status: 'approved' });
      for (const s of c.superseded) apply(s.video, c.id, { status: 'parked', reason: `superseded by ${s.by}: ${s.reason}`, supersededBy: s.by });
    }
    return n;
  });
  // After the queue: a kill between the two only means a re-run, which changes nothing twice.
  atomicWrite(marker, `${JSON.stringify({ approvedAt: iso, struck: [...strikes], planDigest: digest })}\n`);
  ctx.log(JSON.stringify({ planId, ...counts, struck: [...strikes], planDigest: digest }));
  return EXIT.OK;
}

/* ---------------------------------------------------------------- status + entry */

function cmdStatus(argv, ctx) {
  parseArgs(argv);
  const rows = readQueue(ctx.root);
  const status = Object.fromEntries(STATUSES.map((s) => [s, rows.filter((r) => r.status === s).length]));
  ctx.log(JSON.stringify({ total: rows.length, status }, null, 1));
  return EXIT.OK;
}

const USAGE = 'usage: shift-plan.mjs prune | sync | meta [--limit n] | transcripts [--limit n] | brief | validate <plan.json> | render <planId> | approve <planId> [--strike <clusterId>]... | status';

const realYtdlp = (args) => spawnSync('yt-dlp', args, { encoding: 'utf8', timeout: YT_TIMEOUT_MS, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });

export function main(argv, over = {}) {
  const ctx = {
    root: ROOT,
    now: () => Date.now(),
    sleep: sleepSync,
    ytdlp: realYtdlp,
    log: (s) => console.log(s),
    err: (s) => console.error(s),
    ...over,
  };
  ctx.ingest ??= (url, outDir) => spawnSync(process.execPath, [path.join(ctx.root, 'scripts', 'research-ingest.mjs'), url, '--json', '--out', outDir], {
    cwd: ctx.root, encoding: 'utf8', timeout: INGEST_TIMEOUT_MS, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024,
  });
  const table = { prune: cmdPrune, sync: cmdSync, meta: cmdMeta, transcripts: cmdTranscripts, brief: cmdBrief, validate: cmdValidate, render: cmdRender, approve: cmdApprove, status: cmdStatus };
  const cmd = table[argv[0]];
  if (!cmd) { ctx.err(USAGE); return EXIT.FATAL; }
  try { return cmd(argv.slice(1), ctx); } catch (e) {
    ctx.err(e instanceof UsageError ? e.message : `FATAL: ${e.message}`);
    return EXIT.FATAL;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  installCrashDoor();
  process.exitCode = main(process.argv.slice(2));
}
