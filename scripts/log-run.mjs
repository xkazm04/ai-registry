#!/usr/bin/env node
/**
 * log-run - the ONE writer of the skill run log (`usage/runs/<device>.jsonl`).
 *
 * Every lane skill calls this at the end of every run that started work, usually from a
 * CONSUMING project's cwd, as `node <registry>/scripts/log-run.mjs ...`. The contract -
 * row shape, anchors, limits, leak floor, identity - lives in scripts/lib/runs.mjs; this
 * file only turns flags into one validated row and appends it.
 *
 * Why a script and not "the agent appends a line": the agent would have to type its own
 * device, contributor, project and id, and every one of those is a place for drift and
 * for a leaked absolute path. Here they are resolved mechanically (resolveIdentity), the
 * row is built in RUN_KEYS order, and it is validated BEFORE anything touches disk. A row
 * that fails validation is never written - the gate (check-runs.mjs) would reject it
 * anyway, and a bad line in an append-only file cannot be taken back without a rewrite
 * that races parallel sessions.
 *
 * Registry root = this script's own parent directory, whatever the cwd is.
 *
 * --version is optional: the harness strips frontmatter when it loads a skill, so the
 * running agent often cannot see its own version. When omitted it is read from the
 * `version:` frontmatter of skills/<skill>/SKILL.md, else .claude/skills/<skill>/SKILL.md.
 * --skill accepts a scoped/plugin name ("ai-registry:spark", "spark:spark"); the bare
 * name after the last ':' is what is logged.
 *
 * PENDING MODE (--pending, or automatically when this machine has no identity, i.e. no
 * device): the row goes to <checkout root>/.ai/skill-runs.pending.jsonl instead of the registry,
 * with `device: null` and `id: null` - runs-backfill.mjs stamps both when it drains the
 * file. The row is validated with a stand-in device ("pending") and its derived id, so
 * every OTHER field is held to the full contract; the stand-ins are then replaced by
 * null. A pending row therefore never passes validateRun as-is, deliberately: it is not a
 * log row until it has been stamped.
 *
 * Test hook: REGISTRY_RUNS_ROOT, if set, replaces the registry root for the DESTINATION
 * only (<it>/usage/runs/...). Identity and SKILL.md lookup still use the real registry.
 * It exists so scripts/tests/ can exercise real appends without touching usage/runs/.
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 logged (or dry run), 1 the row is invalid
 * and nothing was written, 2 could not run (bad flag, unreadable --json).
 *
 * Builtins only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import {
  SCHEMA, RUN_KEYS, OUTCOMES, PROVIDERS, DIFFICULTY, LIMITS,
  validateRun, runId, resolveIdentity, runsDir, runsFile, PENDING_REL,
} from './lib/runs.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DEST_ROOT = process.env.REGISTRY_RUNS_ROOT ? path.resolve(process.env.REGISTRY_RUNS_ROOT) : ROOT;
const PENDING_DEVICE = 'pending';

// flag -> row key. Value flags only; booleans are handled apart.
const FLAGS = {
  '--skill': 'skill', '--version': 'version', '--outcome': 'outcome', '--difficulty': 'difficulty',
  '--result': 'result', '--comment': 'comment', '--provider': 'provider', '--model': 'model',
  '--effort': 'effort', '--started': 'started', '--tokens-est': 'tokensEst', '--project': 'project',
};
const BOOLS = new Set(['--pending', '--dry-run', '--help', '-h']);
// What a caller may supply. schema/id/ts/device/contributor are stamped, never supplied.
const INPUT_KEYS = new Set(Object.values(FLAGS));
const REQUIRED = ['skill', 'outcome', 'difficulty', 'result', 'comment', 'provider', 'model'];

function usage() {
  console.log(`Usage: node <registry>/scripts/log-run.mjs --skill <name> --outcome <o> --difficulty <1-5>
         --result "<one line>" --comment "<self-reflection>" --provider <p> --model <m>
         [--version <semver>] [--effort <e>] [--started <ISO>] [--tokens-est <n>]
         [--project <slug>] [--json <file>] [--pending] [--dry-run]

Appends ONE row to usage/runs/<device>.jsonl in the registry. device, contributor and
project are resolved from the machine identity and the cwd (--project overrides).
--version defaults to the skill's SKILL.md frontmatter. --json reads a JSON object with the
same fields under their row key names (skill, version, outcome, difficulty, result, comment,
provider, model, effort, started, tokensEst, project); flags override it.
--pending writes to <checkout root>/${PENDING_REL.split(path.sep).join('/')} (device/id stamped later by runs-backfill).

outcome:    ${OUTCOMES.join(' | ')}
provider:   ${PROVIDERS.join(' | ')}
difficulty:`);
  for (const [k, v] of Object.entries(DIFFICULTY)) console.log(`  ${k}  ${v}`);
  console.log(`limits:     result <= ${LIMITS.result} chars, one line; comment <= ${LIMITS.comment} chars.
            No filesystem paths or email addresses in free text (URLs are fine).`);
}

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const flags = {};
const bools = new Set();
let jsonFile = null;
for (let i = 0; i < argv.length; i++) {
  let a = argv[i];
  let inline = null;
  const eq = a.indexOf('=');
  if (a.startsWith('--') && eq > 0) { inline = a.slice(eq + 1); a = a.slice(0, eq); }
  if (BOOLS.has(a)) { bools.add(a); continue; }
  if (a !== '--json' && !(a in FLAGS)) {
    console.error(`FATAL: unknown argument ${JSON.stringify(a)}. See --help.`);
    process.exit(EXIT.FATAL);
  }
  const v = inline ?? argv[++i];
  if (v === undefined) {
    console.error(`FATAL: ${a} needs a value.`);
    process.exit(EXIT.FATAL);
  }
  if (a === '--json') jsonFile = v; else flags[FLAGS[a]] = v;
}
if (bools.has('--help') || bools.has('-h')) { usage(); process.exit(EXIT.OK); }

let input = {};
if (jsonFile) {
  try {
    input = JSON.parse(fs.readFileSync(path.resolve(jsonFile), 'utf8'));
  } catch (e) {
    console.error(`FATAL: --json ${jsonFile} could not be read as JSON (${e.message}).`);
    process.exit(EXIT.FATAL);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    console.error('FATAL: --json must hold a JSON object.');
    process.exit(EXIT.FATAL);
  }
  const extra = Object.keys(input).filter((k) => !INPUT_KEYS.has(k));
  if (extra.length) {
    console.error(`FATAL: --json carries key(s) a caller may not supply: ${extra.join(', ')}. Allowed: ${[...INPUT_KEYS].join(', ')}.`);
    process.exit(EXIT.FATAL);
  }
}
const given = { ...input, ...flags };

// Flags arrive as strings; numbers are coerced only when they look like integers, so a
// bad value still reaches validateRun and is reported by name.
const intish = (v) => (typeof v === 'string' && /^-?\d+$/.test(v.trim()) ? Number(v) : v);
const orNull = (v) => (v === undefined || v === '' ? null : v);

const problems = [];
for (const k of REQUIRED) if (given[k] === undefined || given[k] === '') problems.push(`missing ${k} (--${k})`);

// Scoped/plugin names log as the bare skill.
const skill = typeof given.skill === 'string' ? given.skill.slice(given.skill.lastIndexOf(':') + 1) : given.skill;

function frontmatterVersion(name) {
  if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(name)) return null;
  for (const dir of [path.join(ROOT, 'skills'), path.join(ROOT, '.claude', 'skills')]) {
    const f = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(f)) continue;
    const fm = fs.readFileSync(f, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const m = fm && fm[1].match(/^version:\s*["']?([^"'\s#]+)["']?\s*(?:#.*)?$/m);
    if (m) return m[1];
  }
  return null;
}
let version = orNull(given.version);
if (version === null && skill) {
  version = frontmatterVersion(skill);
  if (version === null) problems.push(`version: no SKILL.md frontmatter version found for "${skill}" - pass --version`);
}

// ---------------------------------------------------------------- identity
const pending = bools.has('--pending');
// The pending file belongs at the checkout root, where runs-backfill looks for it: the
// nearest ancestor holding .ai/manifest.yaml or .git (a worktree's .git is a file, which
// counts), else cwd.
function checkoutRoot(start) {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'manifest.yaml')) || fs.existsSync(path.join(dir, '.git'))) return dir;
    if (path.dirname(dir) === dir) return path.resolve(start);
  }
}

const id = resolveIdentity({ cwd: process.cwd(), registryRoot: ROOT });
const toPending = pending || !id.device;

// ---------------------------------------------------------------- the row
const values = {
  schema: SCHEMA,
  id: null,
  ts: new Date().toISOString(),
  started: orNull(given.started),
  project: typeof given.project === 'string' && given.project ? given.project : id.project,
  skill: orNull(skill),
  version,
  device: toPending ? PENDING_DEVICE : id.device,
  contributor: id.contributor ?? null,
  provider: orNull(given.provider),
  model: orNull(given.model),
  effort: orNull(given.effort),
  outcome: orNull(given.outcome),
  difficulty: intish(given.difficulty ?? null),
  result: orNull(given.result),
  comment: orNull(given.comment),
  tokensEst: intish(orNull(given.tokensEst)),
};
const row = {};
for (const k of RUN_KEYS) row[k] = values[k];
row.id = runId(row);

// Missing-flag problems first, then the contract's own; a missing field produces both,
// which names the flag AND the rule.
problems.push(...validateRun(row));
if (problems.length) {
  console.error(`log-run: ${problems.length} problem(s) - nothing written:`);
  for (const p of [...new Set(problems)]) console.error(`  - ${p}`);
  process.exit(EXIT.VIOLATIONS);
}

let target;
let shown;
if (toPending) {
  row.device = null;
  row.id = null;
  target = path.join(checkoutRoot(process.cwd()), PENDING_REL);
  shown = PENDING_REL.split(path.sep).join('/');
} else {
  target = runsFile(DEST_ROOT, row.device);
  shown = `usage/runs/${row.device}.jsonl`;
}
const line = JSON.stringify(row) + '\n';

if (bools.has('--dry-run')) {
  console.log(`dry run - would append to ${toPending ? `<checkout root>/${shown}` : shown}:`);
  console.log(line.trimEnd());
  process.exit(EXIT.OK);
}

fs.mkdirSync(toPending ? path.dirname(target) : runsDir(DEST_ROOT), { recursive: true });
fs.appendFileSync(target, line);
if (toPending) {
  const why = pending ? '--pending' : 'this machine has no identity (no .machine.local.json machine)';
  console.log(`run pending: ${row.skill} -> <checkout root>/${shown} (${why}); device and id will be stamped by runs-backfill`);
} else {
  console.log(`run logged: ${row.id} -> ${shown}`);
}
