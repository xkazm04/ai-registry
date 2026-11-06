#!/usr/bin/env node
/**
 * shift-queue - the /shift supervisor's memory and its one question: what do I start now?
 *
 * WHY
 * /shift is a long-lived session that must survive context compaction and a dead terminal, so
 * every fact it acts on lives in files, and the choice of what to start is a pure function a test
 * can pin rather than a judgement a tired session re-derives. This instrument does not judge
 * content and does not sample the machine: the sensor hands it a sense JSON, and it answers with
 * everything to start at once. Width comes from that sensor, so resources can only lower the
 * attention cap.
 *
 * WHY LANES, NOT A LADDER
 * The first real run answered with one action at a time and resumed any mining cluster first, so a
 * cluster waiting on the operator's ear held the whole box idle at 7 % CPU. Each lane now fills
 * independently, and nothing the operator owes blocks anything: it is listed, never waited on.
 *
 * COMMANDS
 *   next --sense <file|->      print one JSON plan {width, free, running, actions, waitingOnOperator}
 *   mark <videoId|clusterId|planId/clusterId> <status> [--reason r]
 *   list [--status s] [--json]
 *   seat <kind> [--key k] [--cluster c]   count a seat in seats.jsonl; --key also records it running
 *   done <key>                 a running seat finished
 *   list-running [--json]      live and stale records of the running ledger
 *
 * THE PLAN (next)
 *   every width zero   no actions, a reason naming any mining cluster; running seats are never cancelled
 *   gpu lane           gpu-proof: a held media row for this machine with estGpuMin, not device cpu,
 *                      not already sealed or judged; over reviewCapGb it says proofsPaused instead
 *   build lane         cpu-proof: a held media row with device cpu, one at a time
 *   research lane, one slot per action:
 *     1 mining clusters   mine each video with no report and no live seat; land when all reported
 *     2 pre-research      unplanned > 5 or older than 24 h, no draft waiting, no live planner
 *     3 approved clusters mine with startCluster, in queue order
 *     4 filler            harvest evaluate (debt >= 3, build free) > harvest backlog > deepen --loop
 *
 * STATE  .ai/shift/queue.jsonl (one row per video) and running.jsonl (one row per live seat), each
 * published by temp + rename under one short file lock, because a background `shift-plan meta` and
 * a foreground `mark` run at once and a bare rewrite would lose one of them. A miner's report at
 * .ai/shift/runs/<clusterId>/<videoId>.md is what says that video is mined.
 *
 * EXIT 0 ok · 2 could not run (usage, a double dispatch, malformed sense, unreadable ledger or queue)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { loadFleet } from './lib/projects.mjs';
import { NOT_AGENT_SEATS, RUNNING_STALE_MS, SEAT_LANES, laneCounts, readRunning, runningFile, seatsMb, serializeRunning, splitRunning } from './lib/shift-running.mjs';
import { pendingRuns, reviewSize, verdictRuns } from './lib/shift-review-state.mjs';
import { parseLedger } from './backlog-wave.mjs';

export { RUNNING_STALE_MS, SEAT_LANES, laneCounts, seatsMb, splitRunning };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const STATUSES = ['new', 'meta', 'transcript', 'no-transcript', 'planned', 'approved', 'mining', 'waiting', 'landed', 'parked'];
/** Awaiting a plan. `planned` and later have already been through one. */
export const UNPLANNED = ['new', 'meta', 'transcript', 'no-transcript'];
const GPU_STATES = ['busy', 'settling', 'idle', 'absent', 'unknown'];

const EVAL_DEBT_LIMIT = 3;
/** Repositories supplement the plan: the operator's rule is "when enough RAM to spare". Unmeasured. */
const REPO_SPARE_AVAILABLE_MB = 20000;
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

/** The running ledger's read-modify-write, under the queue's lock. `fn` edits the records in place. */
export function withRunning(root, fn, { fsImpl = fs } = {}) {
  return withFileLock(`${queuePath(root)}.lock`, () => {
    const records = readRunning(stateDir(root));
    const before = serializeRunning(records);
    const result = fn(records);
    const after = serializeRunning(records);
    if (after !== before) atomicWrite(runningFile(stateDir(root)), after, { fsImpl });
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

/**
 * Every report a miner has finished, as `<clusterId>/<videoId>`. A row with no cluster files under
 * its own id. Presence is the signal: a miner writes this one file and nothing else.
 */
export function readReports(root) {
  const dir = path.join(stateDir(root), 'runs');
  const reports = new Set();
  let clusters;
  try { clusters = fs.readdirSync(dir); } catch (e) {
    if (e.code === 'ENOENT') return reports;
    throw e;
  }
  for (const c of clusters) {
    let files;
    try { files = fs.readdirSync(path.join(dir, c)); } catch { continue; /* a stray file, not a cluster */ }
    for (const f of files) if (f.endsWith('.md')) reports.add(`${c}/${f.slice(0, -3)}`);
  }
  return reports;
}

/* ---------------------------------------------------------------- the plan */

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

const clusterKey = (r) => (r.cluster ? `${r.planId}/${r.cluster}` : r.id);

/** Pure. width minus live seats per lane, never below zero. A plan's own actions do not change it. */
export function freeSlots(width, running) {
  const live = laneCounts(running);
  return {
    research: Math.max(0, width.research - live.research),
    build: Math.max(0, width.build - live.build),
    gpuProof: Math.max(0, width.gpuProof - live.gpu),
  };
}

/** Pure. What the operator owes. Information only: nothing here holds any lane back. */
export function operatorOwes({ plans, rows, pendingVerdicts }) {
  const out = plans.filter((p) => !p.approved).map((p) => ({ kind: 'plan', id: p.planId, reason: 'draft plan awaiting approval' }));
  for (const run of pendingVerdicts) out.push({ kind: 'verdict', id: run, reason: 'sealed, awaiting the blind pick' });
  const seen = new Set();
  for (const r of rows.filter((x) => x.status === 'waiting')) {
    const id = clusterKey(r);
    if (seen.has(`${id}\n${r.reason}`)) continue;
    seen.add(`${id}\n${r.reason}`);
    out.push({ kind: 'cluster', id, reason: r.reason ?? 'no reason recorded' });
  }
  return out;
}

/**
 * Pure. Everything it reads arrives as an argument, so the plan is pinned by fixtures.
 * `running` is the live seats. `reports` comes from readReports. `pendingVerdicts` and `verdicts`
 * are run ids: a sealed proof never re-runs, and never holds another row back.
 */
export function nextPlan({
  sense, rows, plans, backlog, evalDebt, machine, now, reviewOverCap = false,
  running = [], reports = new Set(), pendingVerdicts = [], verdicts = [],
}) {
  const { width, gpu } = sense;
  const free = freeSlots(width, running);
  const plan = { width, free, running, actions: [], waitingOnOperator: operatorOwes({ plans, rows, pendingVerdicts }) };
  const miningRows = rows.filter((r) => r.status === 'mining');
  const mining = uniqueClusters(miningRows, plans, rows);

  if (width.research <= 0 && width.build <= 0 && width.gpuProof <= 0) {
    const why = sense.pressure?.length ? `pressure: ${sense.pressure.join(', ')}` : 'all width is zero';
    const named = mining.map((c) => (c.id ? `${c.planId}/${c.id}` : c.videos[0]));
    plan.reason = named.length ? `${why}; mining clusters left as they are: ${named.join(', ')}` : why;
    return plan;
  }

  const liveKeys = new Set(running.map((r) => r.key));
  const liveKind = (kind) => running.some((r) => r.kind === kind);

  /* ---- proofs. The review cap pauses both kinds: unreviewed renders are disk nobody reclaims. */
  const judged = new Set([...pendingVerdicts, ...verdicts]);
  const proofRow = (r) => r.status === 'held' && r.queue === 'media' && !judged.has(r.render?.runId)
    && machine && String(r.render?.machine ?? '').toLowerCase() === String(machine).toLowerCase();
  const proofKey = (r) => `proof:${r.render?.runId ?? r.id}`;
  let paused = false;

  if (free.gpuProof >= 1 && gpu?.state === 'idle' && !liveKind('proof')) {
    const row = backlog.find((r) => proofRow(r) && r.render?.device !== 'cpu' && Number.isFinite(r.render?.estGpuMin));
    if (row && reviewOverCap) paused = true;
    else if (row) plan.actions.push({ action: 'gpu-proof', kind: 'proof', key: proofKey(row), row });
  }

  let buildLeft = free.build;
  if (buildLeft >= 1 && !liveKind('cpu-proof')) {
    const row = backlog.find((r) => proofRow(r) && r.render?.device === 'cpu');
    if (row && reviewOverCap) paused = true;
    else if (row) { plan.actions.push({ action: 'cpu-proof', kind: 'cpu-proof', key: proofKey(row), row }); buildLeft -= 1; }
  }

  /* ---- research, one slot per action */
  let slots = free.research;
  // Repositories come after every video, and only with RAM to spare. A null reading is not spare.
  const repoIds = new Set(rows.filter((r) => r.kind === 'repo').map((r) => r.id));
  const repoRam = Number.isFinite(sense.availableMb) && sense.availableMb >= REPO_SPARE_AVAILABLE_MB;
  const videosFirst = (list) => [...list.filter((c) => !repoIds.has(c.videos[0])), ...list.filter((c) => repoIds.has(c.videos[0]))];
  const take = (action) => { plan.actions.push(action); slots -= 1; };
  const fill = (cluster, extra) => {
    const reportOf = (v) => `${cluster.id ?? v}/${v}`;
    const unreported = cluster.videos.filter((v) => !reports.has(reportOf(v)));
    for (const video of unreported) {
      if (slots <= 0) return;
      if (repoIds.has(video) && !repoRam) continue;
      if (!liveKeys.has(video)) take({ action: 'mine', kind: 'miner', key: video, cluster, video, ...extra });
    }
    // A live miner may still be writing, so a report's presence alone does not open the landing.
    const landKey = `land:${cluster.planId ?? 'none'}/${cluster.id ?? cluster.videos[0]}`;
    if (slots > 0 && !unreported.length && !liveKeys.has(landKey) && !cluster.videos.some((v) => liveKeys.has(v))) {
      take({ action: 'land', kind: 'lander', key: landKey, cluster, ...extra });
    }
  };

  for (const cluster of videosFirst(mining)) fill(cluster, {});

  const unplanned = rows.filter((r) => UNPLANNED.includes(r.status));
  const tooOld = unplanned.filter((r) => now - Date.parse(r.addedAt) > UNPLANNED_MAX_AGE_MS);
  const draftWaiting = plans.some((p) => !p.approved);
  if (slots > 0 && (unplanned.length > UNPLANNED_LIMIT || tooOld.length) && !draftWaiting && !liveKind('planner')) {
    take({ action: 'pre-research', kind: 'planner', key: 'plan:new', unplanned: unplanned.length, olderThan24h: tooOld.length });
  }

  const startedKeys = new Set(miningRows.map(clusterKey));
  const notStarted = rows.filter((r) => r.status === 'approved' && !startedKeys.has(clusterKey(r)));
  for (const cluster of videosFirst(uniqueClusters(notStarted, plans, rows))) {
    if (repoIds.has(cluster.videos[0]) && !repoRam) continue;
    fill(cluster, { startCluster: true });
  }

  if (slots > 0 && !liveKind('filler')) {
    const filler = (skill, extra = {}) => ({ action: 'filler', kind: 'filler', key: `filler:${skill}`, skill, width: slots, ...extra });
    const evaluateDue = evalDebt >= EVAL_DEBT_LIMIT;
    if (evaluateDue && buildLeft >= 1) plan.actions.push(filler('harvest evaluate', { debt: evalDebt }));
    else {
      const skill = backlog.some((r) => r.status === 'queued') ? 'harvest backlog' : 'deepen --loop';
      plan.actions.push(filler(skill, evaluateDue ? { evaluateHeld: 'no build width' } : {}));
    }
  }

  if (!plan.actions.length) plan.reason = width.research <= 0 ? 'no research seat at this width' : 'every lane is full or has nothing to start';
  if (paused) plan.proofsPaused = 'review-over-cap';
  return plan;
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

const USAGE = 'usage: shift-queue.mjs next --sense <file|-> | mark <videoId|clusterId|planId/clusterId> <status> [--reason r] | list [--status s] [--json] | seat <kind> [--key k] [--cluster c] | done <key> | list-running [--json]';

function cmdNext(argv, ctx) {
  const { opts } = parseArgs(argv, { valued: ['sense'] });
  if (!opts.sense) throw new UsageError('next needs --sense <file|->');
  const raw = opts.sense[0] === '-' ? ctx.stdin() : fs.readFileSync(opts.sense[0], 'utf8');
  let sense;
  try { sense = JSON.parse(raw); } catch { throw new UsageError('--sense is not JSON'); }
  const problems = senseProblems(sense);
  if (problems.length) throw new UsageError(`sense refused: ${problems.join('; ')}`);
  const now = ctx.now();
  const plan = nextPlan({
    sense,
    rows: readQueue(ctx.root),
    plans: readPlans(ctx.root),
    backlog: parseLedger(fs.readFileSync(path.join(ctx.root, 'librarian', 'harvest', 'backlog.jsonl'), 'utf8')),
    evalDebt: evaluationDebt(fs.readFileSync(path.join(ctx.root, 'librarian', 'harvest', 'evaluations.md'), 'utf8')),
    machine: ctx.machine !== undefined ? ctx.machine : loadFleet(ctx.root).machine,
    now,
    reviewOverCap: reviewSize(ctx.root).overCap,
    running: splitRunning(readRunning(stateDir(ctx.root)), now).live,
    reports: readReports(ctx.root),
    pendingVerdicts: pendingRuns(ctx.root),
    verdicts: verdictRuns(ctx.root),
  });
  ctx.log(JSON.stringify(plan));
  return EXIT.OK;
}

function cmdMark(argv, ctx) {
  const { positional: [token, status], opts } = parseArgs(argv, { valued: ['reason'] });
  if (!token || !STATUSES.includes(status)) throw new UsageError(`usage: mark <videoId|clusterId> <${STATUSES.join('|')}> [--reason r]`);
  const reason = opts.reason?.[0];
  if (status === 'parked' && !reason?.trim()) throw new UsageError('a parked item needs --reason: parked with no reason is re-proposed forever');
  if (status === 'waiting' && !reason?.trim()) throw new UsageError('a waiting item needs --reason: the operator is shown it as what they owe');
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

const appendSeat = (ctx, kind, iso) => {
  fs.mkdirSync(stateDir(ctx.root), { recursive: true });
  fs.appendFileSync(path.join(stateDir(ctx.root), 'seats.jsonl'), `${JSON.stringify({ ts: iso, kind })}\n`);
};

function cmdSeat(argv, ctx) {
  const { positional: [kind], opts } = parseArgs(argv, { valued: ['key', 'cluster'] });
  if (!kind?.trim()) throw new UsageError('seat needs a kind');
  const key = opts.key?.[0];
  const cluster = opts.cluster?.[0];
  const iso = new Date(ctx.now()).toISOString();
  const agentSeat = !NOT_AGENT_SEATS.includes(kind);
  if (key === undefined) {
    if (cluster !== undefined) throw new UsageError('--cluster describes a running seat, so it needs --key');
    if (!agentSeat) throw new UsageError(`a ${kind} seat is not counted, so without --key it would record nothing`);
    appendSeat(ctx, kind, iso);
    ctx.log(`seat ${kind}`);
    return EXIT.OK;
  }
  if (!key.trim()) throw new UsageError('--key is empty');
  if (!Object.hasOwn(SEAT_LANES, kind)) throw new UsageError(`a running seat's kind must be one of ${Object.keys(SEAT_LANES).join('|')}`);
  withRunning(ctx.root, (records) => {
    const at = records.findIndex((r) => r.key === key);
    if (at >= 0) {
      if (splitRunning([records[at]], ctx.now()).live.length) throw new UsageError(`double dispatch: ${key} has been running since ${records[at].startedAt}`);
      records.splice(at, 1); // a dead record must not stop the work being picked up again
    }
    records.push({ key, kind, cluster: cluster ?? null, startedAt: iso });
    if (agentSeat) appendSeat(ctx, kind, iso);
  });
  ctx.log(`seat ${kind} ${key}`);
  return EXIT.OK;
}

function cmdDone(argv, ctx) {
  const { positional: [key] } = parseArgs(argv);
  if (!key?.trim()) throw new UsageError('done needs a key');
  withRunning(ctx.root, (records) => {
    const at = records.findIndex((r) => r.key === key);
    if (at < 0) throw new UsageError(`done: no running seat has the key ${key} (see list-running)`);
    records.splice(at, 1);
  });
  ctx.log(`done ${key}`);
  return EXIT.OK;
}

function cmdListRunning(argv, ctx) {
  const { opts } = parseArgs(argv, { bool: ['json'] });
  const { live, stale } = splitRunning(readRunning(stateDir(ctx.root)), ctx.now());
  if (opts.json) { ctx.log(JSON.stringify({ live, stale })); return EXIT.OK; }
  const line = (r, state) => [r.key, r.kind, r.cluster ?? '-', r.startedAt, state].join('\t');
  for (const r of live) ctx.log(line(r, 'live'));
  for (const r of stale) ctx.log(line(r, 'stale'));
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
  const table = { next: cmdNext, mark: cmdMark, list: cmdList, seat: cmdSeat, done: cmdDone, 'list-running': cmdListRunning };
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
