/**
 * runs — the contract of the skill run log (`usage/runs/`).
 *
 * Every lane skill, at the end of every run that started work, appends ONE row to
 * `usage/runs/<device>.jsonl` through `scripts/log-run.mjs`: what ran, where, on which
 * model, how it ended, how hard it was, and a free self-reflection comment. The log is
 * read by exactly one consumer, `/librarian skills` (via `scripts/runs-report.mjs`), and
 * never by the skill that is running - a trace produced while the executor can read the
 * diagnosis observes the diagnosis, not the skill (agent-memory /
 * diagnosis-withheld-from-the-executor).
 *
 * Two files per device, and the split is the point:
 *
 *   usage/runs/<device>.jsonl        APPEND-ONLY. Written by the agent at run end. Its
 *                                    token figure is an ESTIMATE (the harness counter's
 *                                    drop) and its model/effort are SELF-REPORTED.
 *   usage/runs/<device>.exact.jsonl  SIDECAR, keyed by run id. Written by
 *                                    `scripts/runs-backfill.mjs` from the harness
 *                                    transcript: measured tokens, observed model and
 *                                    effort. Never rewrites the log - parallel sessions
 *                                    append to it, so a rewrite would race them.
 *
 * Estimate and measurement are stored side by side and never mixed; a reader states
 * which one it used. Self-rated fields (difficulty, outcome) are weak evidence - the
 * anchors below exist so different models rate alike, not to make them strong.
 *
 * Builtins only: a consuming project's agent runs `node <registry>/scripts/log-run.mjs`
 * with whatever Node it has, and nothing is installed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadFleet } from './projects.mjs';

export const SCHEMA = 'rkb-run/1';
export const EXACT_SCHEMA = 'rkb-run-exact/1';

/** Closed key set of a log row, in write order. */
export const RUN_KEYS = [
  'schema', 'id', 'ts', 'started', 'project', 'skill', 'version', 'device', 'contributor',
  'provider', 'model', 'effort', 'outcome', 'difficulty', 'result', 'comment', 'tokensEst',
];

/** Closed key set of a sidecar row, in write order. */
export const EXACT_KEYS = [
  'schema', 'id', 'session', 'model', 'effort', 'input', 'cacheWrite', 'cacheRead', 'output', 'matched',
];

export const OUTCOMES = ['shipped', 'partial', 'no-op', 'parked', 'failed', 'aborted'];
export const PROVIDERS = ['claude', 'openai', 'xai', 'qwen', 'google', 'other'];
/** How the backfill tied a row to its transcript span, strongest first. */
export const MATCHED = ['skill-call', 'command-tag', 'window'];

/** The anchors the clause prints. Keys are the only legal difficulty values. */
export const DIFFICULTY = {
  1: 'trivial - mechanical, no judgment needed',
  2: 'routine - the method applied as written',
  3: 'demanding - real judgment calls, or one detour',
  4: 'hard - several dead ends, rework, or an operator course-correction',
  5: 'at the edge - partial or failed on the merits, not on tooling',
};

/** The project name the registry's own runs log under. */
export const REGISTRY_PROJECT = 'ai-registry';

export const LIMITS = { result: 240, comment: 2000 };

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;
const SEMVER_RE = /^\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?$/;
const DEVICE_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/**
 * The leak floor for free text. The file is committed by operator choice, free text and
 * all; what it may still never carry is a machine's filesystem or a person's address.
 * URLs are allowed - a run's source link is legitimate evidence.
 */
export const LEAKY = [
  // The lookbehind keeps `https://` (its `s:/`) from reading as a drive letter.
  { re: /(?<![A-Za-z])[A-Za-z]:[\\/]/, what: 'a Windows path', control: 'C:\\Users\\x' },
  { re: /(^|[\s"'`(])\/(?:home|users|Users|var|etc|opt|tmp)\//, what: 'a POSIX home/system path', control: ' /home/x/y' },
  { re: /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, what: 'an email address', control: 'a@b.co' },
];

/** Throws if a leak pattern no longer fires on its own control - a dead scanner reads as a clean lane. */
export function assertLeakScanner() {
  for (const { re, what, control } of LEAKY) {
    if (!re.test(control)) throw new Error(`the ${what} pattern did not match its control ${JSON.stringify(control)} - the leak scanner is broken`);
  }
}

export function leaksIn(text) {
  return LEAKY.filter(({ re }) => re.test(text)).map(({ what }) => what);
}

/** `<device>-<YYYYMMDDTHHMMSSZ>-<skill>` - stable, sortable, unique enough per device. */
export function runId(row) {
  const t = new Date(row.ts).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return `${row.device}-${t}-${row.skill}`;
}

const isNonNegInt = (v) => Number.isInteger(v) && v >= 0;

/** Returns a list of problems; empty means the row is valid. */
export function validateRun(row) {
  const p = [];
  if (!row || typeof row !== 'object' || Array.isArray(row)) return ['row is not an object'];
  for (const k of Object.keys(row)) if (!RUN_KEYS.includes(k)) p.push(`unknown key "${k}"`);
  for (const k of RUN_KEYS) if (!(k in row)) p.push(`missing key "${k}"`);
  if (row.schema !== SCHEMA) p.push(`schema must be "${SCHEMA}"`);
  if (typeof row.ts !== 'string' || !ISO_RE.test(row.ts)) p.push('ts must be an ISO timestamp with zone');
  if (row.started !== null && (typeof row.started !== 'string' || !ISO_RE.test(row.started))) p.push('started must be an ISO timestamp or null');
  if (typeof row.started === 'string' && typeof row.ts === 'string' && Date.parse(row.started) > Date.parse(row.ts)) p.push('started is after ts');
  if (typeof row.project !== 'string' || !SLUG_RE.test(row.project)) p.push('project must be a lowercase slug');
  if (typeof row.skill !== 'string' || !SLUG_RE.test(row.skill)) p.push('skill must be a lowercase slug');
  if (typeof row.version !== 'string' || !SEMVER_RE.test(row.version)) p.push('version must be semver');
  if (typeof row.device !== 'string' || !DEVICE_RE.test(row.device)) p.push('device must be a machine name');
  if (row.contributor !== null && (typeof row.contributor !== 'string' || !SLUG_RE.test(row.contributor))) p.push('contributor must be a slug or null');
  if (!PROVIDERS.includes(row.provider)) p.push(`provider must be one of ${PROVIDERS.join('|')}`);
  if (typeof row.model !== 'string' || !row.model.trim() || row.model.length > 80) p.push('model must be a non-empty string (<= 80)');
  if (row.effort !== null && (typeof row.effort !== 'string' || !row.effort.trim() || row.effort.length > 20)) p.push('effort must be a short string or null');
  if (!OUTCOMES.includes(row.outcome)) p.push(`outcome must be one of ${OUTCOMES.join('|')}`);
  if (!Object.hasOwn(DIFFICULTY, String(row.difficulty)) || !Number.isInteger(row.difficulty)) p.push('difficulty must be an integer 1-5');
  for (const f of ['result', 'comment']) {
    const v = row[f];
    if (typeof v !== 'string' || !v.trim()) { p.push(`${f} must be non-empty text`); continue; }
    if (v.length > LIMITS[f]) p.push(`${f} is ${v.length} chars (limit ${LIMITS[f]})`);
    for (const what of leaksIn(v)) p.push(`${f} contains ${what}`);
  }
  if (typeof row.result === 'string' && /\n/.test(row.result)) p.push('result must be one line');
  if (row.tokensEst !== null && !isNonNegInt(row.tokensEst)) p.push('tokensEst must be a non-negative integer or null');
  if (typeof row.id !== 'string' || (p.length === 0 && row.id !== runId(row))) p.push('id must equal runId(row)');
  return p;
}

/** Returns a list of problems; empty means the sidecar row is valid. */
export function validateExact(row) {
  const p = [];
  if (!row || typeof row !== 'object' || Array.isArray(row)) return ['row is not an object'];
  for (const k of Object.keys(row)) if (!EXACT_KEYS.includes(k)) p.push(`unknown key "${k}"`);
  for (const k of EXACT_KEYS) if (!(k in row)) p.push(`missing key "${k}"`);
  if (row.schema !== EXACT_SCHEMA) p.push(`schema must be "${EXACT_SCHEMA}"`);
  if (typeof row.id !== 'string' || !row.id) p.push('id must be a run id');
  if (typeof row.session !== 'string' || !row.session) p.push('session must be the transcript session id');
  if (row.model !== null && typeof row.model !== 'string') p.push('model must be a string or null');
  if (row.effort !== null && typeof row.effort !== 'string') p.push('effort must be a string or null');
  for (const f of ['input', 'cacheWrite', 'cacheRead', 'output']) if (!isNonNegInt(row[f])) p.push(`${f} must be a non-negative integer`);
  if (!MATCHED.includes(row.matched)) p.push(`matched must be one of ${MATCHED.join('|')}`);
  return p;
}

/** The headline figure: tokens the run actually paid for fresh. Cache reads are reported apart. */
export const freshTokens = (x) => x.input + x.cacheWrite + x.output;

export const runsDir = (registryRoot) => path.join(registryRoot, 'usage', 'runs');
export const runsFile = (registryRoot, device) => path.join(runsDir(registryRoot), `${device}.jsonl`);
export const exactFile = (registryRoot, device) => path.join(runsDir(registryRoot), `${device}.exact.jsonl`);
/** Where a consumer writes when the registry cannot be reached; drained by runs-backfill. */
export const PENDING_REL = path.join('.ai', 'skill-runs.pending.jsonl');

/** Parse a jsonl file tolerantly: { rows, bad } where bad counts unparseable lines. */
export function readJsonl(file) {
  if (!fs.existsSync(file)) return { rows: [], bad: 0 };
  const rows = []; let bad = 0;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); } catch { bad++; }
  }
  return { rows, bad };
}

function manifestName(dir) {
  const f = path.join(dir, '.ai', 'manifest.yaml');
  if (!fs.existsSync(f)) return null;
  // `repo:` block, first `name:` inside it. No YAML dependency - the shape is fixed.
  const m = fs.readFileSync(f, 'utf8').match(/^repo:\s*\r?\n(?:[ \t]+.*\r?\n)*?[ \t]+name:\s*["']?([^"'\r\n#]+?)["']?\s*(?:#.*)?$/m);
  return m ? m[1].trim().toLowerCase() : null;
}

const within = (child, parent) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

/**
 * Who and where, resolved mechanically so no agent types it: the device and contributor
 * from the registry's machine identity, the project from the fleet (longest checkout that
 * contains cwd - so a worktree under a project resolves to that project), else the cwd's
 * `.ai/manifest.yaml` repo.name, else the directory name.
 */
export function resolveIdentity({ cwd = process.cwd(), registryRoot }) {
  const fleet = loadFleet(registryRoot);
  const abs = path.resolve(cwd);
  let project = null; let best = -1;
  for (const p of Object.values(fleet.projects)) {
    if (p.exists && within(abs, p.path) && p.path.length > best) { project = p.slug; best = p.path.length; }
  }
  // The registry is not a fleet project, and its checkout may be a worktree with any name.
  if (!project && within(abs, registryRoot)) project = REGISTRY_PROJECT;
  if (!project) {
    let dir = abs;
    for (;;) {
      project = manifestName(dir);
      if (project) break;
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  if (!project) project = path.basename(abs).toLowerCase();
  return { device: fleet.machine, contributor: fleet.contributor, project, problems: fleet.problems };
}
