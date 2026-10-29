/**
 * cloud-dispatch core - the pure rules and the file IO every cloud-dispatch entry point shares.
 *
 * Why one module: dispatch.mjs (explicit), overflow.mjs (the StopFailure hook) and queue.mjs
 * must agree on the id format, the sync gate, the landing contract and where state lives, or
 * a queued brief ships under rules the operator never planned with. The skill directory is
 * symlinked into other repos, so this file imports node builtins only - never the registry's
 * scripts/lib. Every side effect (git, spawn, clock, registry root, platform) is injectable
 * so the tests never start a real `claude`, never touch the network and never leave a temp dir.
 *
 * Why it exists at all: a cloud-session credit is spent only by `claude --cloud` sessions,
 * and a cloud session clones the repo's GitHub origin - it never sees unpushed local commits.
 * The sync gate below is the one guard that keeps a cloud run from working on a stale base.
 *
 * Since 1.2.0 a second engine, `key`, spends a time-limited API key on local headless
 * `claude -p` workers (keyworker.mjs). They branch from origin too, so the same sync gate
 * applies; the key lane adds per-lane budget, expiry and concurrency refusals, and a child env
 * that carries the lane's key and nothing else (see "key lane" below).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn as nodeSpawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- exit codes
export const EXIT_OK = 0;
export const EXIT_REFUSED = 1;
export const EXIT_USAGE = 2;

// ---------------------------------------------------------------- constants
export const DEFAULT_MODEL = 'opus';
export const MAX_PROMPT_CHARS = 24000;
export const AUTO_CAP_PER_DAY = 6;
export const OVERFLOW_LOCK_STALE_MS = 10 * 60 * 1000;
export const ID_RE = /^\d{6}-[0-9a-f]{6}$/;

const HERE = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)));
export const SCRIPTS_DIR = path.resolve(HERE, '..');
export const LAUNCH_PATH = path.join(SCRIPTS_DIR, 'launch.mjs');
export const KEYWORKER_PATH = path.join(SCRIPTS_DIR, 'keyworker.mjs');
export const ENGINES = ['cloud', 'key'];

/** The registry checkout that holds the machine-local ledger and queue. lib/ is four levels below it. */
export function registryDir() {
  return process.env.AI_REGISTRY_DIR || path.resolve(HERE, '../../../..');
}
export const ledgerPath = (reg) => path.join(reg, '.ai', 'cloud-dispatch.local.jsonl');
export const queueDir = (reg) => path.join(reg, '.ai', 'cloud-queue');
export const overflowLogPath = (reg) => path.join(queueDir(reg), 'overflow.log.jsonl');
export const promptFileFor = (reg, id) => path.join(queueDir(reg), `${id}.prompt.txt`);
export const statusFileFor = (reg, id) => path.join(queueDir(reg), `${id}.status.json`);
export const itemFileFor = (reg, id) => path.join(queueDir(reg), `${id}.json`);
// `<id>.key.json` never matches listItems' `<id>.json` pattern, so a key worker's item is not a queue item.
export const keyItemFileFor = (reg, id) => path.join(queueDir(reg), `${id}.key.json`);
export const lanesPath = (reg) => path.join(reg, '.ai', 'credit-lanes.local.json');

// ---------------------------------------------------------------- pure helpers
const pad2 = (n) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (the cap and the id both use the operator's day, not UTC's). */
export function localDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** id = YYMMDD-<6 lowercase hex>, local date. */
export function newId(now = new Date(), rand = () => crypto.randomBytes(3).toString('hex')) {
  const yymmdd = `${pad2(now.getFullYear() % 100)}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  return `${yymmdd}-${String(rand()).toLowerCase()}`;
}
export const branchFor = (id) => `claude/cloud-${id}`;
export const keyBranchFor = (id) => `claude/key-${id}`;
/** Ledger rows written before 1.2.0 carry no engine; every one of them was a cloud launch. */
export const rowEngine = (row) => row?.engine ?? 'cloud';
export const branchForRow = (row) => (rowEngine(row) === 'key' ? keyBranchFor(row.id) : branchFor(row.id));

/**
 * Tiny frontmatter reader: a leading `---` block of `key: value` lines. Values `true`/`false`
 * become booleans, surrounding quotes are stripped, everything else stays a string.
 * Returns { meta, body } with the block removed from body.
 */
export function parseFrontmatter(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const lines = src.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return { meta: {}, body: src };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) return { meta: {}, body: src };
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    meta[m[1]] = v;
  }
  return { meta, body: lines.slice(end + 1).join('\n') };
}

/** owner/name from a GitHub remote URL (https, ssh or scp form), else null. */
export function parseGithubOrigin(url) {
  const m = String(url ?? '').trim().match(/github\.com[:/]+([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

/**
 * The fixed block appended to every prompt. Exported so the docs can quote it. The cloud text is
 * unchanged since 1.0.0; the key engine's worker runs in a local worktree that keyworker.mjs has
 * already put on its branch, and it bills a real API key with full permissions on this machine,
 * so its contract also fences it inside that worktree.
 */
export function LANDING_CONTRACT(id, branch, label = '<one-line summary of the task>', engine = 'cloud') {
  if (engine === 'key') {
    return [
      '---',
      `LANDING CONTRACT (cloud-dispatch key-lane run ${id}) - binding; it overrides anything above that conflicts.`,
      `You are working in a local git worktree of this repository, already on branch \`${branch}\`, created from`,
      'the GitHub origin\'s default branch. Treat it as a fresh clone: nothing else on this machine is yours.',
      `Where the brief above calls you a cloud session or names a \`claude/cloud-<id>\` branch, read it as this worktree and \`${branch}\`.`,
      `1. Do all work on \`${branch}\`. Never write outside this worktree, and never read or change any other checkout on this machine.`,
      '2. Never push to the default branch, never force-push, never merge anything.',
      `3. Write \`.cloud-runs/${id}/RESULT.md\` - what was done, files changed, open questions, and a`,
      '   "Handoff" section listing anything left for a local session - and commit it on the branch.',
      `4. Push with \`git push -u origin ${branch}\` and open ONE pull request with \`gh pr create\`, titled \`key(${id}): ${label}\`.`,
      '5. If the task cannot be done, still commit and push RESULT.md explaining why (steps 1-4 still apply).',
    ].join('\n');
  }
  return [
    '---',
    `LANDING CONTRACT (cloud-dispatch run ${id}) - binding; it overrides anything above that conflicts.`,
    'You are working in a fresh clone of this repository\'s GitHub origin.',
    `1. Create a new branch \`${branch}\` from the default branch and do all work on it.`,
    '2. Never push to the default branch, never force-push, never merge anything.',
    `3. Write \`.cloud-runs/${id}/RESULT.md\` - what was done, files changed, open questions, and a`,
    '   "Handoff" section listing anything left for a local session - and commit it on the branch.',
    `4. Push the branch and open ONE pull request titled \`cloud(${id}): ${label}\`.`,
    '5. If the task cannot be done, still commit and push RESULT.md explaining why (steps 1-4 still apply).',
  ].join('\n');
}

export function composePrompt(body, id, branch, label, engine = 'cloud') {
  return `${String(body ?? '').trim()}\n\n${LANDING_CONTRACT(id, branch, label, engine)}\n`;
}
export const promptWithinLimit = (prompt) => prompt.length <= MAX_PROMPT_CHARS;

/** First markdown heading, for a label when neither --label nor frontmatter gives one. */
export function firstHeading(body) {
  const m = String(body ?? '').match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/m);
  return m ? m[1] : null;
}

export const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// ---------------------------------------------------------------- git (injectable)
/** Default git runner: git -C <repo> <args>, never through a shell. */
export function realGit(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', windowsHide: true });
  return { code: r.error ? null : r.status, stdout: r.stdout ?? '', stderr: r.error ? String(r.error.message) : (r.stderr ?? '') };
}

/**
 * The sync gate. The cloud clones origin only, so the DEFAULT branch's local ref must not be
 * ahead of origin (HEAD may be any branch; it is compared too, but only as a warning).
 * allowAhead turns that refusal into a warning and lists the unpushed commits in `unpushed`
 * (at most UNPUSHED_SHOWN lines plus "and N more") - the operator's explicit acceptance that
 * the cloud works without them.
 * Returns { ok, reason?, origin, slug, defaultBranch, ahead, base_sha, dirty, warnings, unpushed }.
 */
export const UNPUSHED_SHOWN = 10;
export const UNPUSHED_HEADING = 'the cloud will NOT see these commits';
export function syncGate(repo, git = realGit, { allowAhead = false } = {}) {
  const warnings = [];
  const out = (args) => git(repo, args);
  const refuse = (reason, extra = {}) => ({ ok: false, reason, warnings, ...extra });

  const top = out(['rev-parse', '--show-toplevel']);
  if (top.code !== 0) return refuse(`${repo} is not a git repository`);
  const originR = out(['remote', 'get-url', 'origin']);
  if (originR.code !== 0) return refuse('the repo has no `origin` remote; the cloud clones origin only');
  const origin = originR.stdout.trim();
  const slug = parseGithubOrigin(origin);
  if (!slug) return refuse(`origin is not a GitHub URL (${origin}); cloud sessions clone from GitHub only`, { origin });

  const fetch = out(['fetch', 'origin', '--quiet']);
  // `transient`: the network or the remote failed, not the brief or the repo's state - an unattended
  // caller keeps the item and tries again rather than refusing it for good.
  if (fetch.code !== 0) return refuse(`git fetch origin failed: ${fetch.stderr.trim() || `exit ${fetch.code}`}`, { origin, slug, transient: true });

  let defaultBranch = null;
  const sym = out(['symbolic-ref', 'refs/remotes/origin/HEAD']);
  if (sym.code === 0 && sym.stdout.trim().startsWith('refs/remotes/origin/')) {
    defaultBranch = sym.stdout.trim().slice('refs/remotes/origin/'.length);
  } else {
    const hasMain = out(['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main']).code === 0;
    defaultBranch = hasMain ? 'main' : 'master';
  }
  const baseR = out(['rev-parse', `refs/remotes/origin/${defaultBranch}`]);
  if (baseR.code !== 0) return refuse(`origin/${defaultBranch} does not exist after fetch`, { origin, slug, defaultBranch });
  const base_sha = baseR.stdout.trim();

  let ahead = 0;
  const local = out(['rev-parse', '--verify', '--quiet', `refs/heads/${defaultBranch}`]);
  if (local.code === 0) {
    const cnt = out(['rev-list', '--count', `refs/remotes/origin/${defaultBranch}..refs/heads/${defaultBranch}`]);
    if (cnt.code !== 0) return refuse(`could not count ${defaultBranch} against origin/${defaultBranch}`, { origin, slug, defaultBranch, base_sha });
    ahead = Number.parseInt(cnt.stdout.trim(), 10) || 0;
  } else {
    warnings.push(`no local ${defaultBranch} branch; nothing to compare, origin/${defaultBranch} is the base`);
  }
  const facts = { origin, slug, defaultBranch, ahead, base_sha, unpushed: [] };
  if (ahead > 0 && !allowAhead) {
    return refuse(`local ${defaultBranch} is ${ahead} commit(s) ahead of origin/${defaultBranch} - push first; the cloud clones origin only`, facts);
  }
  if (ahead > 0) {
    const log = out(['log', '--oneline', `refs/remotes/origin/${defaultBranch}..refs/heads/${defaultBranch}`]);
    const lines = log.code === 0 ? log.stdout.split(/\r?\n/).filter((l) => l.trim()) : [];
    facts.unpushed = lines.slice(0, UNPUSHED_SHOWN);
    if (ahead > facts.unpushed.length) facts.unpushed.push(`and ${ahead - facts.unpushed.length} more`);
    warnings.push(`--allow-ahead: local ${defaultBranch} is ${ahead} commit(s) ahead of origin/${defaultBranch}; ${UNPUSHED_HEADING}`);
  }

  const head = out(['symbolic-ref', '--quiet', '--short', 'HEAD']);
  const headBranch = head.code === 0 ? head.stdout.trim() : null;
  if (headBranch && headBranch !== defaultBranch) {
    const hc = out(['rev-list', '--count', `refs/remotes/origin/${defaultBranch}..HEAD`]);
    const n = hc.code === 0 ? Number.parseInt(hc.stdout.trim(), 10) || 0 : 0;
    if (n > 0) warnings.push(`HEAD (${headBranch}) has ${n} commit(s) not on origin/${defaultBranch}; the cloud branches from origin/${defaultBranch} and will not see them`);
  }
  const st = out(['status', '--porcelain']);
  const dirty = st.code === 0 && st.stdout.trim().length > 0;
  if (dirty) warnings.push('working tree is dirty; uncommitted changes stay local and the cloud will not see them');
  return { ok: true, warnings, dirty, headBranch, ...facts };
}

// ---------------------------------------------------------------- ledger + queue IO
const ensureDir = (d) => fs.mkdirSync(d, { recursive: true });

export function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const rows = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch { /* a torn line is skipped, never fatal */ }
  }
  return rows;
}
export function appendJsonl(file, row) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
}
export const readLedger = (reg) => readJsonl(ledgerPath(reg));

export const LEDGER_KEYS = ['ts', 'id', 'repo', 'origin', 'base_sha', 'label', 'from', 'model', 'mode', 'brief_sha256', 'prompt_chars', 'allow_ahead', 'engine'];
/** A cloud ledger row with every key present; absent values are null (the 1.0.0 shape, plus engine). */
export function ledgerRow(fields) {
  const row = {};
  for (const k of LEDGER_KEYS) row[k] = fields[k] ?? null;
  return row;
}
/** Key and manual rows (1.2.0) follow the absent-value convention: an unknown key is omitted, never null. */
export function compactRow(fields) {
  const row = {};
  for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null) row[k] = v;
  return row;
}

export function readItem(reg, id) {
  const f = itemFileFor(reg, id);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
export function writeItem(reg, item) {
  ensureDir(queueDir(reg));
  fs.writeFileSync(itemFileFor(reg, item.id), `${JSON.stringify(item, null, 2)}\n`);
}
/** All queue items, oldest first (queued_at, then id). Prompt, status and log files are not items. */
export function listItems(reg) {
  const dir = queueDir(reg);
  if (!fs.existsSync(dir)) return [];
  const items = [];
  for (const name of fs.readdirSync(dir)) {
    const m = name.match(/^(\d{6}-[0-9a-f]{6})\.json$/);
    if (!m) continue;
    try { items.push(JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))); } catch { /* skip a torn item */ }
  }
  return items.sort((a, b) => String(a.queued_at).localeCompare(String(b.queued_at)) || String(a.id).localeCompare(String(b.id)));
}

// ---------------------------------------------------------------- key lane
/**
 * The key engine spends an Anthropic API key on LOCAL headless `claude -p` workers. The fleet
 * strips ANTHROPIC_API_KEY almost everywhere to stay on the subscription: an exported key
 * silently moves the registry's contest seats (seat.mjs passes the parent env), and the pumper
 * and pof judge scripts, onto API billing. So a lane's key lives in its own
 * ANTHROPIC_KEY_LANE_<LANE> variable that nothing else reads, and keyChildEnv hands it to the
 * worker child alone, as ANTHROPIC_API_KEY. No function here ever returns or prints a key value.
 */
export const KEY_ENV_PREFIX = 'ANTHROPIC_KEY_LANE_';
export const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];
export const INIT_LANES = ['registry', 'cloud', 'overlord'];
export const LANE_DEFAULTS = { budgetUsd: 0, expires: '', perRunUsd: 15, maxConcurrent: 3, model: 'claude-opus-5-5', effort: 'high' };
/** Short on purpose: Windows path length bites deep repos (C:/t/<run> is the fleet's convention). */
export const KEY_WORKTREE_ROOT = 'C:/t';
export const keyWorktreeFor = (id, root = KEY_WORKTREE_ROOT) => path.join(root, `cd-${id}`);
const LANE_FILE_NAME = '.ai/credit-lanes.local.json';
const notConfigured = (name) => `lane ${name} not configured in ${LANE_FILE_NAME}`;

/** The file --lanes-init writes: three lanes, zero budget, no expiry until the operator fills them in. */
export function initialLanesConfig() {
  const lanes = {};
  for (const name of INIT_LANES) {
    const { budgetUsd, expires, perRunUsd, maxConcurrent, model, effort } = LANE_DEFAULTS;
    lanes[name] = { keyEnv: `${KEY_ENV_PREFIX}${name.toUpperCase()}`, budgetUsd, expires, perRunUsd, maxConcurrent, model, effort };
  }
  return { lanes };
}

/** --lanes-init: refuses when the file exists, so an operator's budgets are never overwritten. */
export function initLanes({ registryDir: reg = registryDir() } = {}) {
  const file = lanesPath(reg);
  if (fs.existsSync(file)) return { ok: false, reason: `${LANE_FILE_NAME} already exists; edit it by hand`, file };
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(initialLanesConfig(), null, 2)}\n`, { flag: 'wx' });
  return { ok: true, file };
}

/** { ok, lanes } or { ok:false, reason }. A missing file is ok with no lanes - every lane then reads "not configured". */
export function readLanes(reg) {
  const file = lanesPath(reg);
  if (!fs.existsSync(file)) return { ok: true, lanes: {}, missing: true };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const lanes = parsed && typeof parsed.lanes === 'object' && parsed.lanes ? parsed.lanes : null;
    if (!lanes) return { ok: false, reason: `${LANE_FILE_NAME} has no "lanes" object` };
    return { ok: true, lanes };
  } catch (e) {
    return { ok: false, reason: `${LANE_FILE_NAME} is not valid JSON: ${e.message}` };
  }
}

/** One lane's config, validated. A malformed lane is refused, never defaulted: these fields bound real spend. */
export function laneConfig(reg, name) {
  const r = readLanes(reg);
  if (!r.ok) return r;
  const lane = Object.prototype.hasOwnProperty.call(r.lanes, String(name)) ? r.lanes[name] : null;
  if (!lane || typeof lane !== 'object') return { ok: false, reason: notConfigured(name) };
  const bad = (what) => ({ ok: false, reason: `lane ${name} in ${LANE_FILE_NAME}: ${what}` });
  if (typeof lane.keyEnv !== 'string' || !lane.keyEnv.startsWith(KEY_ENV_PREFIX) || lane.keyEnv.length === KEY_ENV_PREFIX.length) {
    return bad(`keyEnv must name an ${KEY_ENV_PREFIX}* variable (never ANTHROPIC_API_KEY)`);
  }
  if (typeof lane.budgetUsd !== 'number' || !Number.isFinite(lane.budgetUsd) || lane.budgetUsd < 0) return bad('budgetUsd must be a number >= 0');
  if (typeof lane.perRunUsd !== 'number' || !Number.isFinite(lane.perRunUsd) || lane.perRunUsd <= 0) return bad('perRunUsd must be a number > 0');
  if (!Number.isInteger(lane.maxConcurrent) || lane.maxConcurrent < 1) return bad('maxConcurrent must be an integer >= 1');
  if (typeof lane.model !== 'string' || !lane.model.trim()) return bad('model must be a non-empty string');
  if (!EFFORTS.includes(lane.effort)) return bad(`effort must be one of ${EFFORTS.join(', ')}`);
  const expires = lane.expires ?? '';
  if (typeof expires !== 'string' || (expires !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(expires))) return bad('expires must be "" or YYYY-MM-DD');
  return { ok: true, lane: { ...lane, expires } };
}

const finiteCost = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const round4 = (n) => Math.round(n * 10000) / 10000;

/** A row's cost: its own cost_usd (manual rows), else the cost its worker wrote into the status file. */
export function rowCost(row, status) {
  return finiteCost(row?.cost_usd) ?? finiteCost(status?.cost_usd);
}

/**
 * One lane's spend and its refusals. Pure: the ledger rows and a statusOf(id) reader are passed in.
 * spent sums cost_usd over the lane's key and manual rows. remaining = budgetUsd - spent. running
 * counts key rows with no status file yet (the worker writes one when it ends). Each running worker
 * may still spend up to perRunUsd, so `available` = remaining - running * perRunUsd is what a new
 * run may count on; the budget refusal reads `available`, which equals remaining when nothing runs.
 * A key row with no status file older than KEY_LOST_AFTER_MS is `lost` (its window was killed, so it
 * will never write one): it stops holding a concurrency slot and is charged its full perRunUsd, the
 * most it could have spent, rather than holding the lane hostage forever.
 */
export const KEY_LOST_AFTER_MS = 6 * 60 * 60 * 1000;
export const isLostKeyRow = (row, status, now) =>
  !status && Number.isFinite(Date.parse(row?.ts)) && now - Date.parse(row.ts) > KEY_LOST_AFTER_MS;

export function laneState({ name, lane, rows, statusOf = () => null, env = process.env, today, now = Date.now() }) {
  const mine = rows.filter((r) => r && r.lane === name && (rowEngine(r) === 'key' || rowEngine(r) === 'manual'));
  let spent = 0;
  let running = 0;
  let lost = 0;
  for (const r of mine) {
    const status = rowEngine(r) === 'key' ? statusOf(r.id) : null;
    if (rowEngine(r) === 'key' && isLostKeyRow(r, status, now)) { lost += 1; spent += lane.perRunUsd; continue; }
    spent += rowCost(r, status) ?? 0;
    if (rowEngine(r) === 'key' && !status) running += 1;
  }
  spent = round4(spent);
  const remaining = round4(lane.budgetUsd - spent);
  const reserved = round4(running * lane.perRunUsd);
  const available = round4(remaining - reserved);
  const keyEnvSet = typeof env[lane.keyEnv] === 'string' && env[lane.keyEnv].length > 0;
  const expired = Boolean(lane.expires) && Boolean(today) && lane.expires < today;
  const refusals = [];
  if (!keyEnvSet) refusals.push(`${lane.keyEnv} is unset or empty; the key lane spends only a key held in its own variable`);
  if (expired) refusals.push(`lane ${name} expired on ${lane.expires} (today is ${today})`);
  if (available < lane.perRunUsd) {
    const held = running ? ` minus $${reserved} held for ${running} running worker(s)` : '';
    refusals.push(`lane ${name} has $${available} available (budget $${lane.budgetUsd} - spent $${spent}${held}); one run may spend up to perRunUsd $${lane.perRunUsd}`);
  }
  if (running >= lane.maxConcurrent) refusals.push(`lane ${name} has ${running} running worker(s); maxConcurrent is ${lane.maxConcurrent}`);
  return {
    lane: name, keyEnv: keyEnvSet ? 'set' : 'unset', keyEnvName: lane.keyEnv, budgetUsd: lane.budgetUsd, spent, remaining,
    running, lost, reserved, available, perRunUsd: lane.perRunUsd, maxConcurrent: lane.maxConcurrent, expires: lane.expires, expired,
    model: lane.model, effort: lane.effort, refusals,
  };
}

function readStatus(reg, id) {
  try {
    const f = statusFileFor(reg, id);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  } catch {
    return { exit: null, error: 'unreadable status file' };
  }
}

/** --lanes: every configured lane's state. Never carries a key value - only `keyEnv: set|unset`. */
export function lanesReport({ registryDir: reg = registryDir(), env = process.env, now = () => new Date() } = {}) {
  const r = readLanes(reg);
  if (!r.ok) return r;
  const rows = readLedger(reg);
  const at = now();
  const today = localDate(at);
  const lanes = [];
  const invalid = [];
  for (const name of Object.keys(r.lanes)) {
    const c = laneConfig(reg, name);
    if (!c.ok) { invalid.push({ lane: name, reason: c.reason }); continue; }
    lanes.push(laneState({ name, lane: c.lane, rows, statusOf: (id) => readStatus(reg, id), env, today, now: at.getTime() }));
  }
  return { ok: true, missing: Boolean(r.missing), lanes, invalid };
}

/** --record: a manual spend row for a lane this script did not launch (overlord, cloud). */
export function recordSpend({ lane, cost, label, registryDir: reg = registryDir(), now = () => new Date() } = {}) {
  const c = laneConfig(reg, lane);
  if (!c.ok) return c;
  const cost_usd = typeof cost === 'number' ? cost : Number(String(cost ?? '').trim() || NaN);
  if (!Number.isFinite(cost_usd) || cost_usd < 0) return { ok: false, reason: `--cost must be a number >= 0 (got ${JSON.stringify(cost)})` };
  if (typeof label !== 'string' || !label.trim()) return { ok: false, reason: '--label <s> is required: it says what the spend was' };
  const row = compactRow({ engine: 'manual', lane, cost_usd, label: label.trim(), ts: now().toISOString() });
  appendJsonl(ledgerPath(reg), row);
  return { ok: true, row };
}

/**
 * The worker child's environment: a copy of `env` minus ANTHROPIC_AUTH_TOKEN, ANTHROPIC_BASE_URL,
 * every ANTHROPIC_KEY_LANE_* variable and NODE_TEST_CONTEXT (an inherited one makes a nested
 * `node --test` exit 0 on red), plus ANTHROPIC_API_KEY = env[keyEnv]. Names compare upper-cased,
 * because Windows environment names are case-insensitive. Pure; the caller never logs the result.
 */
/**
 * The one list of names the worker child never inherits: every other credential or provider switch
 * that could decide which account pays (an OAuth token outranks nothing it should not, a
 * CLAUDE_CODE_USE_* switch reroutes the call to a cloud provider's bill), plus NODE_TEST_CONTEXT.
 * Every ANTHROPIC_KEY_LANE_* name is dropped too. One constant, so a new name is added once.
 */
export const KEY_CHILD_STRIP = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_OAUTH_TOKEN',
  'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDE_CODE_USE_FOUNDRY', 'NODE_TEST_CONTEXT'];

export function keyChildEnv(env, keyEnv) {
  const value = env[keyEnv];
  const out = {};
  for (const [k, v] of Object.entries(env)) {
    const K = k.toUpperCase();
    if (KEY_CHILD_STRIP.includes(K) || K.startsWith(KEY_ENV_PREFIX)) continue;
    out[k] = v;
  }
  out.ANTHROPIC_API_KEY = value;
  return out;
}

/** The worker's `claude` argv. The prompt goes on stdin, never in argv. --max-budget-usd caps one run at perRunUsd. */
export function keyWorkerArgv(lane) {
  return ['-p', '--model', String(lane.model), '--effort', String(lane.effort), '--max-budget-usd', String(lane.perRunUsd),
    '--output-format', 'json', '--permission-mode', 'bypassPermissions'];
}

/** total_cost_usd, session_id and is_error from `claude -p --output-format json` stdout; unknown keys are absent. */
export function parseClaudeResult(stdout) {
  const text = String(stdout ?? '').trim();
  let obj = null;
  try { obj = JSON.parse(text); } catch {
    for (const line of text.split(/\r?\n/).reverse()) {
      try { const o = JSON.parse(line); if (o && typeof o === 'object') { obj = o; break; } } catch { /* next line */ }
    }
  }
  if (Array.isArray(obj)) obj = obj.findLast((o) => o && o.type === 'result') ?? obj.at(-1) ?? null;
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  if (finiteCost(obj.total_cost_usd) !== undefined) out.cost_usd = obj.total_cost_usd;
  if (typeof obj.session_id === 'string' && obj.session_id) out.session_id = obj.session_id;
  if (typeof obj.is_error === 'boolean') out.is_error = obj.is_error;
  return out;
}

/** The key worker's status file: {exit, error, cost_usd, session_id, ended}, unknown keys omitted. */
export function keyStatus({ exit, error, cost_usd, session_id, ended, cleanup_error }) {
  return compactRow({ exit, error, cost_usd, session_id, ended, cleanup_error });
}

/** How the key worker is started: the same `cmd /d /c start` console as launch.mjs, so it outlives the agent session. */
export function keyLaunchCommand({ id, execPath, workerPath, itemFile, cwd }) {
  return {
    command: 'cmd.exe',
    args: ['/d', '/c', 'start', `"key-${id}"`, execPath, workerPath, itemFile],
    options: { cwd, detached: true, stdio: 'ignore', windowsHide: true },
  };
}

// ---------------------------------------------------------------- dispatch
/**
 * How the launcher is started. `claude --cloud` needs a real console on stdin/stdout.
 * Measured 2026-10-06: spawn(node, [...], { detached: true, stdio: 'ignore' }) DOES give the child
 * its own console, but its std handles are NUL (a probe child saw stdoutTTY/stdinTTY false), so
 * `claude --cloud` would refuse every time. `cmd /d /c start "<title>" ...` creates a fresh
 * console whose handles ARE that console (the probe saw both true, also with spaced paths).
 * The first quoted argument to `start` is the window title; no /min, so a failure stays readable.
 * cmd.exe itself is hidden and exits at once; detached + unref lets the caller exit too.
 */
export function launchCommand({ id, execPath, launchPath, promptFile, statusFile, model, cwd }) {
  return {
    command: 'cmd.exe',
    args: ['/d', '/c', 'start', `"cloud-${id}"`, execPath, launchPath, promptFile, statusFile, model],
    options: { cwd, detached: true, stdio: 'ignore', windowsHide: true },
  };
}

/**
 * Plan (go=false) or launch (go=true) one brief. Returns
 * { ok, id, branch, refused?, reason?, exit?, plan }. Never throws for a refusal; it throws only
 * when the brief file cannot be read.
 * engine 'cloud' (the default) is the 1.0.0 path. engine 'key' needs a configured lane, runs the
 * same sync gate (its worker branches from origin), adds the lane's refusals (key unset, lane
 * expired, budget, concurrency) and on --go opens keyworker.mjs instead of launch.mjs.
 * deps: { git, spawn, now, registryDir, platform, rand, launchPath, workerPath, execPath, env, worktreeRoot }
 */
export function dispatchBrief({ briefPath, repo, model, effort, label, from, mode = 'explicit', go = false, allowAhead = false, engine = 'cloud', lane: laneName, deps = {} }) {
  const git = deps.git ?? realGit;
  const spawn = deps.spawn ?? nodeSpawn;
  const now = deps.now ?? (() => new Date());
  const reg = deps.registryDir ?? registryDir();
  const platform = deps.platform ?? process.platform;
  const launchPath = deps.launchPath ?? LAUNCH_PATH;
  const workerPath = deps.workerPath ?? KEYWORKER_PATH;
  const execPath = deps.execPath ?? process.execPath;
  const env = deps.env ?? process.env;

  const briefAbs = path.resolve(briefPath);
  const raw = fs.readFileSync(briefAbs, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  // a frontmatter repo is relative to the brief, so a queued brief resolves the same from any cwd
  const repoAbs = repo ? path.resolve(repo) : (meta.repo ? path.resolve(path.dirname(briefAbs), String(meta.repo)) : null);
  const at = now();
  const id = newId(at, deps.rand);
  const isKey = engine === 'key';
  const branch = isKey ? keyBranchFor(id) : branchFor(id);
  const theLabel = String(label ?? meta.label ?? firstHeading(body) ?? path.basename(briefAbs).replace(/\.[^.]+$/, ''));
  const theFrom = from ?? meta.from ?? null;
  const theModel = model ?? DEFAULT_MODEL;
  const plan = { id, branch, engine, repo: repoAbs, label: theLabel, from: theFrom, model: theModel, mode, brief: briefAbs, cloud_ok: meta.cloud_ok, allow_ahead: Boolean(allowAhead) };
  const refuse = (reason, exit = EXIT_REFUSED) => ({ ok: false, refused: true, reason, exit, id, branch, plan });

  if (!ENGINES.includes(engine)) return refuse(`unknown engine ${JSON.stringify(engine)}; use ${ENGINES.join(' or ')}`, EXIT_USAGE);
  let laneCfg = null;
  if (isKey) {
    if (!laneName) return refuse('--engine key needs --lane <lane>', EXIT_USAGE);
    const c = laneConfig(reg, laneName);
    if (!c.ok) return refuse(c.reason);
    laneCfg = { ...c.lane, model: model ?? c.lane.model, effort: effort ?? c.lane.effort };
    if (!EFFORTS.includes(laneCfg.effort)) return refuse(`--effort must be one of ${EFFORTS.join(', ')}`, EXIT_USAGE);
    plan.model = laneCfg.model;
    plan.effort = laneCfg.effort;
    plan.lane = laneState({ name: laneName, lane: laneCfg, rows: readLedger(reg), statusOf: (rid) => readStatus(reg, rid), env, today: localDate(at), now: at.getTime() });
    plan.worktree = keyWorktreeFor(id, deps.worktreeRoot);
  }

  if (!repoAbs) return refuse('no repo: pass --repo or set `repo:` in the brief frontmatter', EXIT_USAGE);
  if (!body.trim()) return refuse('the brief body is empty');

  const gate = syncGate(repoAbs, git, { allowAhead: Boolean(allowAhead) });
  Object.assign(plan, { unpushed: gate.unpushed ?? [], origin: gate.origin ?? null, slug: gate.slug ?? null, defaultBranch: gate.defaultBranch ?? null, ahead: gate.ahead ?? null, base_sha: gate.base_sha ?? null, dirty: gate.dirty ?? null, warnings: gate.warnings });
  // the lane's refusals come first and all of them are named, so one plan shows every reason
  if (isKey && plan.lane.refusals.length) return refuse([...plan.lane.refusals, ...(gate.ok ? [] : [gate.reason])].join('; '));
  if (!gate.ok) return gate.transient ? { ...refuse(gate.reason), transient: true } : refuse(gate.reason);

  const prompt = composePrompt(body, id, branch, theLabel, engine);
  plan.prompt_chars = prompt.length;
  plan.prompt = prompt;
  if (!promptWithinLimit(prompt)) return refuse(`the composed prompt is ${prompt.length} characters; the limit is ${MAX_PROMPT_CHARS}`);

  const promptFile = promptFileFor(reg, id);
  const statusFile = statusFileFor(reg, id);
  const itemFile = keyItemFileFor(reg, id);
  plan.launch = isKey
    ? keyLaunchCommand({ id, execPath, workerPath, itemFile, cwd: repoAbs })
    : launchCommand({ id, execPath, launchPath, promptFile, statusFile, model: theModel, cwd: repoAbs });
  if (!go) return { ok: true, id, branch, plan };

  if (platform !== 'win32') {
    return refuse(isKey ? 'key-lane launches need a Windows console; run keyworker.mjs yourself' : 'cloud-dispatch launches need a Windows console; run claude --cloud yourself', EXIT_USAGE);
  }
  ensureDir(queueDir(reg));
  fs.writeFileSync(promptFile, prompt);
  if (isKey) {
    // the item names the key's VARIABLE, never its value; the worker reads the value from its own env
    fs.writeFileSync(itemFile, `${JSON.stringify({
      id, engine: 'key', lane: laneName, keyEnv: laneCfg.keyEnv, repo: repoAbs, defaultBranch: gate.defaultBranch, branch,
      worktree: plan.worktree, model: laneCfg.model, effort: laneCfg.effort, perRunUsd: laneCfg.perRunUsd, label: theLabel,
      promptFile, statusFile, registryDir: reg,
    }, null, 2)}\n`);
  }
  const child = spawn(plan.launch.command, plan.launch.args, plan.launch.options);
  // an async spawn error must not become an uncaught exception (the overflow hook must never throw)
  if (child && typeof child.on === 'function') child.on('error', (e) => { try { fs.writeFileSync(statusFile, JSON.stringify({ exit: null, error: `spawn: ${e.message}`, ended: new Date().toISOString() })); } catch { /* ignore */ } });
  if (child && typeof child.unref === 'function') child.unref();

  appendJsonl(ledgerPath(reg), isKey
    ? compactRow({
      ts: at.toISOString(), id, engine: 'key', lane: laneName, repo: repoAbs, origin: gate.origin, base_sha: gate.base_sha,
      label: theLabel, from: theFrom, model: laneCfg.model, effort: laneCfg.effort, per_run_usd: laneCfg.perRunUsd, mode,
      brief_sha256: sha256(raw), prompt_chars: prompt.length, allow_ahead: Boolean(allowAhead),
    })
    : ledgerRow({
      ts: at.toISOString(), id, repo: repoAbs, origin: gate.origin, base_sha: gate.base_sha, label: theLabel,
      from: theFrom, model: theModel, mode, brief_sha256: sha256(raw), prompt_chars: prompt.length,
      allow_ahead: Boolean(allowAhead), engine: 'cloud',
    }));
  return { ok: true, id, branch, plan, promptFile, statusFile, ...(isKey ? { itemFile } : {}) };
}

// ---------------------------------------------------------------- status
/**
 * State of one dispatched run from local + remote evidence. Remote evidence wins (a PR or a
 * branch proves the cloud ran even if the launcher window was closed); a failed launcher is
 * local proof; with no remote answer the state is `unknown`.
 *   status: parsed status file or null; branchExists: true|false|null(unknown); pr: {number,state,url}|null
 */
export function runState({ status, branchExists, pr, engine = 'cloud', lost = false }) {
  if (pr) return `pr#${pr.number} ${String(pr.state).toLowerCase()}`;
  if (branchExists === true) return 'branch';
  if (status && status.exit !== 0) return `failed(${status.exit ?? status.error ?? 'null'})`;
  // a key worker is local: no status file means its window is still working, and a status file
  // means it ended - pushed nothing if the branch is absent. Neither needs the remote to say so.
  if (engine === 'key') return status ? 'ended' : lost ? 'lost' : 'running';
  if (branchExists === null) return 'unknown';
  if (!status) return 'launching';
  return 'running';
}

export function hasGhOnPath() {
  const r = spawnSync('gh', ['--version'], { encoding: 'utf8', windowsHide: true });
  return !r.error && r.status === 0;
}
export function realGh(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8', windowsHide: true });
  return { code: r.error ? null : r.status, stdout: r.stdout ?? '', stderr: r.error ? String(r.error.message) : (r.stderr ?? '') };
}

/** Ledger rows newest first, each joined with its remote state. Never throws on remote failure. */
export function statusRows({ registryDir: reg = registryDir(), git = realGit, gh = realGh, hasGh = hasGhOnPath } = {}) {
  // manual spend rows record money, not runs: --lanes reads them, --status has nothing to join
  const rows = readLedger(reg).filter((r) => rowEngine(r) !== 'manual').reverse();
  const ghOk = rows.length > 0 && (() => { try { return hasGh(); } catch { return false; } })();
  return rows.map((row) => {
    const engine = rowEngine(row);
    const branch = branchForRow(row);
    const status = readStatus(reg, row.id);
    let branchExists = null;
    try {
      if (row.repo && fs.existsSync(row.repo)) {
        const r = git(row.repo, ['ls-remote', 'origin', `refs/heads/${branch}`]);
        if (r.code === 0) branchExists = r.stdout.trim().length > 0;
      }
    } catch { branchExists = null; }
    let pr = null;
    const slug = parseGithubOrigin(row.origin);
    if (ghOk && slug) {
      try {
        const r = gh(['pr', 'list', '--repo', slug, '--head', branch, '--state', 'all', '--json', 'number,state,url']);
        if (r.code === 0) { const list = JSON.parse(r.stdout || '[]'); pr = list[0] ?? null; }
      } catch { pr = null; }
    }
    const out = { ...row, engine, branch, launcher: status, branch_exists: branchExists, pr, state: runState({ status, branchExists, pr, engine, lost: engine === 'key' && isLostKeyRow(row, status, Date.now()) }) };
    const cost = engine === 'key' ? rowCost(row, status) : undefined;
    if (cost !== undefined) out.cost_usd = cost;
    return out;
  });
}

// ---------------------------------------------------------------- queue
/** Queue a brief for overflow. Refuses (ok:false) unless its frontmatter says cloud_ok: true. */
export function queueAdd({ briefPath, repo, from, allowAhead = false, registryDir: reg = registryDir(), now = () => new Date(), rand } = {}) {
  const briefAbs = path.resolve(briefPath);
  if (!fs.existsSync(briefAbs)) return { ok: false, reason: `brief not found: ${briefAbs}` };
  const { meta } = parseFrontmatter(fs.readFileSync(briefAbs, 'utf8'));
  if (meta.cloud_ok !== true) return { ok: false, reason: 'the brief frontmatter must say `cloud_ok: true` before it may ship to the cloud unattended' };
  const repoAbs = repo ? path.resolve(repo) : (meta.repo ? path.resolve(path.dirname(briefAbs), String(meta.repo)) : null);
  if (!repoAbs) return { ok: false, reason: 'no repo: pass --repo or set `repo:` in the brief frontmatter' };
  if (!fs.existsSync(repoAbs)) return { ok: false, reason: `repo not found: ${repoAbs}` };
  const at = now();
  let id = newId(at, rand);
  while (fs.existsSync(itemFileFor(reg, id))) id = newId(at);
  const item = { id, repo: repoAbs, brief_path: briefAbs, from: from ?? meta.from ?? null, queued_at: at.toISOString(), state: 'queued' };
  if (allowAhead) item.allow_ahead = true;
  writeItem(reg, item);
  return { ok: true, id, item };
}

export function queueDone({ id, registryDir: reg = registryDir(), now = () => new Date() } = {}) {
  // The id becomes a file name: `../x` would read and rewrite <reg>/.ai/x.json as a "done" item.
  if (!ID_RE.test(String(id ?? ''))) return { ok: false, reason: `${JSON.stringify(id)} is not a queue id (YYMMDD-xxxxxx, from queue.mjs --list)` };
  const item = readItem(reg, id);
  if (!item) return { ok: false, reason: `no queue item ${id}` };
  if (item.state === 'dispatched') return { ok: false, reason: `${id} was already dispatched as ${item.dispatch_id}; close its pull request instead` };
  item.state = 'done';
  item.done_at = now().toISOString();
  writeItem(reg, item);
  return { ok: true, item };
}

// ---------------------------------------------------------------- overflow
function acquireLock(file, nowMs) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, String(nowMs), { flag: 'wx' });
    return true;
  } catch {
    try {
      const age = nowMs - fs.statSync(file).mtimeMs;
      if (age > OVERFLOW_LOCK_STALE_MS) { fs.writeFileSync(file, String(nowMs)); return true; }
    } catch { /* fall through */ }
    return false;
  }
}

/**
 * The StopFailure hook body. Ships queued items FIFO up to AUTO_CAP_PER_DAY overflow
 * dispatches per local calendar date. Never throws; returns a summary for the tests.
 */
export function runOverflow({ input, deps = {} } = {}) {
  let event;
  try { event = typeof input === 'string' ? JSON.parse(input) : input; } catch { return { acted: false }; }
  if (!event || event.hook_event_name !== 'StopFailure' || event.error !== 'rate_limit') return { acted: false };

  const reg = deps.registryDir ?? registryDir();
  const now = deps.now ?? (() => new Date());
  const lock = path.join(queueDir(reg), 'overflow.lock');
  const shipped = [];
  const refused = [];
  const deferred = [];
  let capped = 0;
  let error = null;
  let locked = false;
  try {
    locked = acquireLock(lock, now().getTime());
    if (!locked) return { acted: false, reason: 'another overflow run holds the lock' };
    const today = localDate(now());
    const usedToday = readLedger(reg).filter((r) => r.mode === 'overflow' && r.ts && localDate(new Date(r.ts)) === today).length;
    let remaining = Math.max(0, AUTO_CAP_PER_DAY - usedToday);
    for (const item of listItems(reg).filter((i) => i.state === 'queued')) {
      if (remaining <= 0) { capped += 1; continue; }
      let res;
      try {
        res = dispatchBrief({ briefPath: item.brief_path, repo: item.repo, from: item.from ?? undefined, allowAhead: item.allow_ahead === true, mode: 'overflow', go: true, deps: { ...deps, registryDir: reg } });
      } catch (e) {
        res = { ok: false, refused: true, exit: EXIT_REFUSED, reason: e.message };
      }
      if (res.ok) {
        Object.assign(item, { state: 'dispatched', dispatch_id: res.id, dispatched_at: now().toISOString() });
        writeItem(reg, item);
        shipped.push(item.id);
        remaining -= 1;
      } else if (res.exit === EXIT_USAGE) {
        // an environment problem (no Windows console), not this item's fault: keep it queued, stop
        error = res.reason;
        break;
      } else if (res.transient) {
        // the fetch failed (network, remote): this item stays queued for the next rate-limit stop
        deferred.push(item.id);
      } else {
        Object.assign(item, { state: 'refused', reason: res.reason, refused_at: now().toISOString() });
        writeItem(reg, item);
        refused.push(item.id);
      }
    }
  } catch (e) {
    error = e.message;
  } finally {
    if (locked) { try { fs.unlinkSync(lock); } catch { /* ignore */ } }
  }
  const line = { ts: now().toISOString(), session_id: event.session_id ?? null, shipped, refused, capped };
  if (deferred.length) line.deferred = deferred;
  if (error) line.error = error;
  try { appendJsonl(overflowLogPath(reg), line); } catch { /* a hook must not break the session */ }
  return { acted: true, ...line };
}

// ---------------------------------------------------------------- argv
/** --key value / --flag parser shared by the CLIs. */
export function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    opts[key] = next === undefined || next.startsWith('--') ? true : (i += 1, next);
  }
  return opts;
}
