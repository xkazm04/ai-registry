#!/usr/bin/env node
/**
 * shift-queue - the /shift supervisor's memory and its one question: what do I do next?
 *
 * WHY
 * /shift is a long-lived session that must survive context compaction and a dead terminal, so
 * every fact it acts on lives in files, and the choice of next action is a pure function a test
 * can pin rather than a judgement a tired session re-derives. This instrument does not judge
 * content and does not sample the machine: WP1's sensor hands it a sense JSON, and it answers
 * with ONE action. Width comes from that sensor, so resources can only lower the attention cap.
 *
 * COMMANDS
 *   next --sense <file|->                     print ONE action JSON {action, width, ...}
 *   mark <videoId|clusterId|planId/clusterId> <status> [--reason r]
 *   list [--status s] [--json]
 *   seat <kind>                               append one seat to .ai/shift/seats.jsonl
 *
 * THE LADDER (next)
 *   every width zero  wait, naming any mining cluster so nothing reads as forgotten
 *   mining item       resume: a restart never leaves half-mined work behind
 *   gpu idle + width  gpu-proof, from a held queue:media row for this machine with estGpuMin;
 *                     over reviewCapGb it falls through, and the action says proofsPaused
 *   no research seat  wait
 *   unplanned > 5 or older than 24 h, no draft waiting   pre-research
 *   approved cluster  mine
 *   filler            harvest evaluate (debt >= 3) > harvest backlog > deepen --loop
 *
 * STATE  .ai/shift/queue.jsonl, one row per video, published by temp + rename under a short
 * file lock, because a background `shift-plan meta` and a foreground `mark` run at once and a
 * bare rewrite would lose one of them.
 *
 * EXIT 0 ok · 2 could not run (usage, malformed sense, unreadable ledger or queue)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { loadFleet } from './lib/projects.mjs';
import { reviewSize } from './lib/shift-review-state.mjs';
import { parseLedger } from './backlog-wave.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const STATUSES = ['new', 'meta', 'transcript', 'no-transcript', 'planned', 'approved', 'mining', 'landed', 'parked'];
/** Awaiting a plan. `planned` and later have already been through one. */
export const UNPLANNED = ['new', 'meta', 'transcript', 'no-transcript'];
const GPU_STATES = ['busy', 'settling', 'idle', 'absent', 'unknown'];

const EVAL_DEBT_LIMIT = 3;
const UNPLANNED_LIMIT = 5;
const UNPLANNED_MAX_AGE_MS = 24 * 3600 * 1000;
const LOCK_WAIT_MS = 10000;
const LOCK_STALE_MS = 30000;
const TEMP_STALE_MS = 10 * 60 * 1000;

export const stateDir = (root) => path.join(root, '.ai', 'shift');
export const queuePath = (root) => path.join(stateDir(root), 'queue.jsonl');
export const sleepSync = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };

/* ---------------------------------------------------------------- the one writer */

let tempCounter = 0;

/**
 * Publish a file whole or not at all. A failed rename leaves the temp: it is what a crash
 * leaves anyway, and the original is intact either way. Later writes sweep old temps.
 */
export function atomicWrite(file, text, { fsImpl = fs } = {}) {
  fsImpl.mkdirSync(path.dirname(file), { recursive: true });
  const base = path.basename(file);
  for (const f of fsImpl.readdirSync(path.dirname(file))) {
    if (!f.startsWith(`${base}.`) || !f.endsWith('.tmp')) continue;
    const old = path.join(path.dirname(file), f);
    try { if (Date.now() - fsImpl.statSync(old).mtimeMs > TEMP_STALE_MS) fsImpl.unlinkSync(old); } catch { /* a sibling swept it */ }
  }
  const tmp = `${file}.${process.pid}.${++tempCounter}.tmp`;
  fsImpl.writeFileSync(tmp, text);
  for (let attempt = 0; ; attempt++) {
    try { fsImpl.renameSync(tmp, file); return; } catch (e) {
      // Windows refuses a rename while a reader holds the target open, for a moment.
      if (attempt >= 5 || !['EPERM', 'EACCES', 'EBUSY'].includes(e.code)) throw e;
      sleepSync(50);
    }
  }
}

export function parseQueue(text) {
  const rows = [];
  const ids = new Set();
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    let r;
    try { r = JSON.parse(line); } catch { throw new Error(`queue line ${i + 1}: not JSON`); }
    if (!r.id) throw new Error(`queue line ${i + 1}: no id`);
    if (!STATUSES.includes(r.status)) throw new Error(`queue ${r.id}: status "${r.status}" not in closed set`);
    if (ids.has(r.id)) throw new Error(`queue: duplicate id ${r.id}`);
    ids.add(r.id);
    rows.push(r);
  });
  return rows;
}

const serializeQueue = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');

export function readQueue(root) {
  let text;
  try { text = fs.readFileSync(queuePath(root), 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  return parseQueue(text);
}

function withFileLock(lock, fn) {
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  const deadline = Date.now() + LOCK_WAIT_MS;
  for (;;) {
    try { fs.closeSync(fs.openSync(lock, 'wx')); break; } catch (e) {
      if (e.code !== 'EEXIST' && e.code !== 'EPERM') throw e;
      // The lock is held across a few file operations only, so an old one is a crashed writer.
      try { if (Date.now() - fs.statSync(lock).mtimeMs > LOCK_STALE_MS) fs.unlinkSync(lock); } catch { /* released meanwhile */ }
      if (Date.now() > deadline) throw new Error(`queue lock held past ${LOCK_WAIT_MS} ms: ${lock}`);
      sleepSync(25);
    }
  }
  try { return fn(); } finally { try { fs.unlinkSync(lock); } catch { /* already gone */ } }
}

/**
 * The shared read-modify-write. `fn` edits the rows in place. Never call it across a network
 * request: it holds the lock, so per-video progress takes it once per video.
 */
export function withQueue(root, fn, { fsImpl = fs } = {}) {
  return withFileLock(`${queuePath(root)}.lock`, () => {
    const rows = readQueue(root);
    const before = serializeQueue(rows);
    const result = fn(rows);
    const after = serializeQueue(rows);
    if (after !== before) atomicWrite(queuePath(root), after, { fsImpl });
    return result;
  });
}

/* ---------------------------------------------------------------- plans on disk */

/** Every plan directory that holds a plan.json. A plan with no approved.json is a draft. */
export function readPlans(root) {
  const dir = path.join(stateDir(root), 'plans');
  let names;
  try { names = fs.readdirSync(dir); } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  const plans = [];
  for (const planId of names.sort()) {
    const file = path.join(dir, planId, 'plan.json');
    if (!fs.existsSync(file)) continue;
    let plan = null;
    // An unreadable draft is still a draft waiting on someone; shift-plan validate says why.
    try { plan = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* plan stays null */ }
    plans.push({ planId, plan, approved: fs.existsSync(path.join(dir, planId, 'approved.json')) });
  }
  return plans;
}

/* ---------------------------------------------------------------- the ladder */

/** How /harvest status reads debt: rows of the evaluations table whose verdict is `pending`. */
export function evaluationDebt(text) {
  let col = -1;
  let debt = 0;
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (col < 0) { col = cells.indexOf('verdict'); continue; }
    if (cells[col] === 'pending') debt++;
  }
  return debt;
}

function clusterOf(row, plans, rows) {
  // Only what is still to be mined: a superseded sibling carries the cluster id too, parked.
  const members = rows.filter((r) => row.cluster && r.planId === row.planId && r.cluster === row.cluster
    && (r.status === 'approved' || r.status === 'mining'));
  if (!members.length) return { id: null, planId: row.planId ?? null, videos: [row.id] };
  const found = plans.find((p) => p.planId === row.planId)?.plan?.clusters?.find((c) => c.id === row.cluster);
  return {
    id: row.cluster,
    planId: row.planId,
    videos: members.map((m) => m.id),
    ...(found ? { theme: found.theme, homes: found.homes, yield: found.yield, gpuProofs: found.gpuProofs, estSeats: found.estSeats } : {}),
  };
}

function uniqueClusters(selected, plans, rows) {
  const seen = new Set();
  const out = [];
  for (const r of selected) {
    const key = r.cluster ? `${r.planId}/${r.cluster}` : r.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clusterOf(r, plans, rows));
  }
  return out;
}

/** Pure. Everything it reads arrives as an argument, so the ordering is pinned by fixtures. */
export function nextAction({ sense, rows, plans, backlog, evalDebt, machine, now, reviewOverCap = false }) {
  const { width, gpu } = sense;
  const mining = uniqueClusters(rows.filter((r) => r.status === 'mining'), plans, rows);

  if (width.research <= 0 && width.build <= 0 && width.gpuProof <= 0) {
    const why = sense.pressure?.length ? `pressure: ${sense.pressure.join(', ')}` : 'all width is zero';
    return { action: 'wait', width, reason: why, ...(mining.length ? { resumePending: mining } : {}) };
  }
  if (mining.length) return { action: 'resume', width, cluster: mining[0] };

  // Set only when a proof would have run: the flag means "the cap stopped this", not "over cap".
  let paused = {};
  if (gpu?.state === 'idle' && width.gpuProof >= 1) {
    const row = backlog.find((r) => r.status === 'held' && r.queue === 'media'
      && Number.isFinite(r.render?.estGpuMin)
      && machine && String(r.render?.machine ?? '').toLowerCase() === String(machine).toLowerCase());
    if (row && !reviewOverCap) return { action: 'gpu-proof', width, row };
    if (row) paused = { proofsPaused: 'review-over-cap' };
  }

  // Everything below spends a research seat, and a width of {build:1} does not grant one.
  if (width.research < 1) return { action: 'wait', width, reason: 'no research seat at this width', ...paused };

  const unplanned = rows.filter((r) => UNPLANNED.includes(r.status));
  const tooOld = unplanned.filter((r) => now - Date.parse(r.addedAt) > UNPLANNED_MAX_AGE_MS);
  const draftWaiting = plans.some((p) => !p.approved);
  if ((unplanned.length > UNPLANNED_LIMIT || tooOld.length) && !draftWaiting) {
    return { action: 'pre-research', width, unplanned: unplanned.length, olderThan24h: tooOld.length, ...paused };
  }

  const approved = uniqueClusters(rows.filter((r) => r.status === 'approved'), plans, rows);
  if (approved.length) return { action: 'mine', width, cluster: approved[0], ...paused };

  if (evalDebt >= EVAL_DEBT_LIMIT) return { action: 'filler', width, skill: 'harvest evaluate', debt: evalDebt, ...paused };
  if (backlog.some((r) => r.status === 'queued')) return { action: 'filler', width, skill: 'harvest backlog', ...paused };
  return { action: 'filler', width, skill: 'deepen --loop', ...paused };
}

/** Every reason this sense cannot be acted on. Absent numbers are never read as zero. */
export function senseProblems(s) {
  if (!s || typeof s !== 'object') return ['sense must be a JSON object'];
  const out = [];
  for (const k of ['research', 'build', 'gpuProof']) {
    if (!Number.isFinite(s.width?.[k]) || s.width[k] < 0) out.push(`width.${k} must be a number >= 0`);
  }
  if (!GPU_STATES.includes(s.gpu?.state)) out.push(`gpu.state must be one of ${GPU_STATES.join('|')}`);
  return out;
}

/* ---------------------------------------------------------------- mark */

/** A video id wins; a cluster id reaches its members that are not already finished. */
export function resolveTargets(rows, token) {
  const video = rows.filter((r) => r.id === token);
  if (video.length) return { rows: video };
  const [planId, clusterId] = token.includes('/') ? token.split('/') : [null, token];
  const members = rows.filter((r) => r.cluster === clusterId && (!planId || r.planId === planId)
    && r.status !== 'landed' && r.status !== 'parked');
  if (!members.length) return { error: `unknown video or cluster: ${token}` };
  const plansHit = [...new Set(members.map((r) => r.planId))];
  if (plansHit.length > 1) return { error: `cluster ${token} is in several plans (${plansHit.join(', ')}); write <planId>/${clusterId}` };
  return { rows: members };
}

/* ---------------------------------------------------------------- cli */

/** Closed flag sets: an unread flag used to mean a silently ignored instruction in this repo. */
export function parseArgs(argv, { valued = [], bool = [] } = {}) {
  const positional = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { positional.push(a); continue; }
    const name = a.slice(2);
    if (bool.includes(name)) opts[name] = true;
    else if (valued.includes(name)) {
      if (argv[i + 1] === undefined) throw new UsageError(`${a} needs a value`);
      (opts[name] ??= []).push(argv[++i]);
    } else throw new UsageError(`unknown flag ${a}`);
  }
  return { positional, opts };
}

export class UsageError extends Error {}

const USAGE = 'usage: shift-queue.mjs next --sense <file|-> | mark <videoId|clusterId|planId/clusterId> <status> [--reason r] | list [--status s] [--json] | seat <kind>';

function cmdNext(argv, ctx) {
  const { opts } = parseArgs(argv, { valued: ['sense'] });
  if (!opts.sense) throw new UsageError('next needs --sense <file|->');
  const raw = opts.sense[0] === '-' ? ctx.stdin() : fs.readFileSync(opts.sense[0], 'utf8');
  let sense;
  try { sense = JSON.parse(raw); } catch { throw new UsageError('--sense is not JSON'); }
  const problems = senseProblems(sense);
  if (problems.length) throw new UsageError(`sense refused: ${problems.join('; ')}`);
  const action = nextAction({
    sense,
    rows: readQueue(ctx.root),
    plans: readPlans(ctx.root),
    backlog: parseLedger(fs.readFileSync(path.join(ctx.root, 'librarian', 'harvest', 'backlog.jsonl'), 'utf8')),
    evalDebt: evaluationDebt(fs.readFileSync(path.join(ctx.root, 'librarian', 'harvest', 'evaluations.md'), 'utf8')),
    machine: ctx.machine !== undefined ? ctx.machine : loadFleet(ctx.root).machine,
    now: ctx.now(),
    reviewOverCap: reviewSize(ctx.root).overCap,
  });
  ctx.log(JSON.stringify(action));
  return EXIT.OK;
}

function cmdMark(argv, ctx) {
  const { positional: [token, status], opts } = parseArgs(argv, { valued: ['reason'] });
  if (!token || !STATUSES.includes(status)) throw new UsageError(`usage: mark <videoId|clusterId> <${STATUSES.join('|')}> [--reason r]`);
  const reason = opts.reason?.[0];
  if (status === 'parked' && !reason?.trim()) throw new UsageError('a parked item needs --reason: parked with no reason is re-proposed forever');
  const iso = new Date(ctx.now()).toISOString();
  const marked = withQueue(ctx.root, (rows) => {
    const t = resolveTargets(rows, token);
    if (t.error) throw new UsageError(t.error);
    for (const r of t.rows) {
      r.status = status;
      r.updatedAt = iso;
      if (reason !== undefined) r.reason = reason; else delete r.reason;
    }
    return t.rows;
  });
  if (status === 'landed') {
    // Transcripts are run inputs: a landed cluster has no more use for its own.
    for (const r of marked) fs.rmSync(path.join(stateDir(ctx.root), 'transcripts', r.id), { recursive: true, force: true });
  }
  ctx.log(`marked ${marked.length} -> ${status}`);
  return EXIT.OK;
}

function cmdList(argv, ctx) {
  const { opts } = parseArgs(argv, { valued: ['status'], bool: ['json'] });
  const want = opts.status?.[0];
  if (want && !STATUSES.includes(want)) throw new UsageError(`--status must be one of ${STATUSES.join('|')}`);
  for (const r of readQueue(ctx.root)) {
    if (want && r.status !== want) continue;
    ctx.log(opts.json ? JSON.stringify(r) : [r.id, r.status, r.cluster ?? '-', r.reason ?? '-', r.title ?? '-'].join('\t'));
  }
  return EXIT.OK;
}

function cmdSeat(argv, ctx) {
  const { positional: [kind] } = parseArgs(argv);
  if (!kind?.trim()) throw new UsageError('seat needs a kind');
  fs.mkdirSync(stateDir(ctx.root), { recursive: true });
  fs.appendFileSync(path.join(stateDir(ctx.root), 'seats.jsonl'), `${JSON.stringify({ ts: new Date(ctx.now()).toISOString(), kind })}\n`);
  ctx.log(`seat ${kind}`);
  return EXIT.OK;
}

export function main(argv, over = {}) {
  const ctx = {
    root: ROOT,
    now: () => Date.now(),
    stdin: () => fs.readFileSync(0, 'utf8'),
    log: (s) => console.log(s),
    err: (s) => console.error(s),
    ...over,
  };
  const table = { next: cmdNext, mark: cmdMark, list: cmdList, seat: cmdSeat };
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
