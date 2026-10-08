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

/** The fixed block appended to every cloud prompt. Exported so the docs can quote it. */
export function LANDING_CONTRACT(id, branch, label = '<one-line summary of the task>') {
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

export function composePrompt(body, id, branch, label) {
  return `${String(body ?? '').trim()}\n\n${LANDING_CONTRACT(id, branch, label)}\n`;
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
  if (fetch.code !== 0) return refuse(`git fetch origin failed: ${fetch.stderr.trim() || `exit ${fetch.code}`}`, { origin, slug });

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

export const LEDGER_KEYS = ['ts', 'id', 'repo', 'origin', 'base_sha', 'label', 'from', 'model', 'mode', 'brief_sha256', 'prompt_chars', 'allow_ahead'];
/** A ledger row with every key present; absent values are null. */
export function ledgerRow(fields) {
  const row = {};
  for (const k of LEDGER_KEYS) row[k] = fields[k] ?? null;
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
 * deps: { git, spawn, now, registryDir, platform, rand, launchPath, execPath }
 */
export function dispatchBrief({ briefPath, repo, model, label, from, mode = 'explicit', go = false, allowAhead = false, deps = {} }) {
  const git = deps.git ?? realGit;
  const spawn = deps.spawn ?? nodeSpawn;
  const now = deps.now ?? (() => new Date());
  const reg = deps.registryDir ?? registryDir();
  const platform = deps.platform ?? process.platform;
  const launchPath = deps.launchPath ?? LAUNCH_PATH;
  const execPath = deps.execPath ?? process.execPath;

  const briefAbs = path.resolve(briefPath);
  const raw = fs.readFileSync(briefAbs, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  // a frontmatter repo is relative to the brief, so a queued brief resolves the same from any cwd
  const repoAbs = repo ? path.resolve(repo) : (meta.repo ? path.resolve(path.dirname(briefAbs), String(meta.repo)) : null);
  const at = now();
  const id = newId(at, deps.rand);
  const branch = branchFor(id);
  const theLabel = String(label ?? meta.label ?? firstHeading(body) ?? path.basename(briefAbs).replace(/\.[^.]+$/, ''));
  const theFrom = from ?? meta.from ?? null;
  const theModel = model ?? DEFAULT_MODEL;
  const plan = { id, branch, repo: repoAbs, label: theLabel, from: theFrom, model: theModel, mode, brief: briefAbs, cloud_ok: meta.cloud_ok, allow_ahead: Boolean(allowAhead) };
  const refuse = (reason, exit = EXIT_REFUSED) => ({ ok: false, refused: true, reason, exit, id, branch, plan });

  if (!repoAbs) return refuse('no repo: pass --repo or set `repo:` in the brief frontmatter', EXIT_USAGE);
  if (!body.trim()) return refuse('the brief body is empty');

  const gate = syncGate(repoAbs, git, { allowAhead: Boolean(allowAhead) });
  Object.assign(plan, { unpushed: gate.unpushed ?? [], origin: gate.origin ?? null, slug: gate.slug ?? null, defaultBranch: gate.defaultBranch ?? null, ahead: gate.ahead ?? null, base_sha: gate.base_sha ?? null, dirty: gate.dirty ?? null, warnings: gate.warnings });
  if (!gate.ok) return refuse(gate.reason);

  const prompt = composePrompt(body, id, branch, theLabel);
  plan.prompt_chars = prompt.length;
  plan.prompt = prompt;
  if (!promptWithinLimit(prompt)) return refuse(`the composed prompt is ${prompt.length} characters; the limit is ${MAX_PROMPT_CHARS}`);

  const promptFile = promptFileFor(reg, id);
  const statusFile = statusFileFor(reg, id);
  plan.launch = launchCommand({ id, execPath, launchPath, promptFile, statusFile, model: theModel, cwd: repoAbs });
  if (!go) return { ok: true, id, branch, plan };

  if (platform !== 'win32') {
    return refuse('cloud-dispatch launches need a Windows console; run claude --cloud yourself', EXIT_USAGE);
  }
  ensureDir(queueDir(reg));
  fs.writeFileSync(promptFile, prompt);
  const child = spawn(plan.launch.command, plan.launch.args, plan.launch.options);
  // an async spawn error must not become an uncaught exception (the overflow hook must never throw)
  if (child && typeof child.on === 'function') child.on('error', (e) => { try { fs.writeFileSync(statusFile, JSON.stringify({ exit: null, error: `spawn: ${e.message}`, ended: new Date().toISOString() })); } catch { /* ignore */ } });
  if (child && typeof child.unref === 'function') child.unref();

  appendJsonl(ledgerPath(reg), ledgerRow({
    ts: at.toISOString(), id, repo: repoAbs, origin: gate.origin, base_sha: gate.base_sha, label: theLabel,
    from: theFrom, model: theModel, mode, brief_sha256: sha256(raw), prompt_chars: prompt.length,
    allow_ahead: Boolean(allowAhead),
  }));
  return { ok: true, id, branch, plan, promptFile, statusFile };
}

// ---------------------------------------------------------------- status
/**
 * State of one dispatched run from local + remote evidence. Remote evidence wins (a PR or a
 * branch proves the cloud ran even if the launcher window was closed); a failed launcher is
 * local proof; with no remote answer the state is `unknown`.
 *   status: parsed status file or null; branchExists: true|false|null(unknown); pr: {number,state,url}|null
 */
export function runState({ status, branchExists, pr }) {
  if (pr) return `pr#${pr.number} ${String(pr.state).toLowerCase()}`;
  if (branchExists === true) return 'branch';
  if (status && status.exit !== 0) return `failed(${status.exit ?? status.error ?? 'null'})`;
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
  const rows = readLedger(reg).slice().reverse();
  const ghOk = rows.length > 0 && (() => { try { return hasGh(); } catch { return false; } })();
  return rows.map((row) => {
    const branch = branchFor(row.id);
    let status = null;
    try { const f = statusFileFor(reg, row.id); if (fs.existsSync(f)) status = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { status = { exit: null, error: 'unreadable status file' }; }
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
    return { ...row, branch, launcher: status, branch_exists: branchExists, pr, state: runState({ status, branchExists, pr }) };
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
