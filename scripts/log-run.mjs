#!/usr/bin/env node
/**
 * log-run - the writer of a skill run's row, into the PROJECT that ran it.
 *
 * Every lane skill calls this at the end of every run that started work, usually from a
 * CONSUMING project's cwd, as `node <registry>/scripts/log-run.mjs ...`. The contract -
 * row shape, anchors, limits, leak floor, identity - lives in scripts/lib/runs.mjs; this
 * file only turns flags into one validated row and appends it.
 *
 * WHERE: always <checkout root>/.ai/skill-runs.local.jsonl (LOCAL_REL; checkout root = the
 * nearest ancestor of cwd holding .ai/manifest.yaml or .git), never usage/runs/. The
 * registry pulls the file into usage/runs/<device>.jsonl with runs-backfill.mjs. Why the
 * project writes and the registry pulls:
 *   - scope: the shared reflection clause says a skill run grants no additional permission
 *     to edit another repository, and appending to the registry's committed log from a
 *     consumer's run is exactly that;
 *   - release installs (docs/installations.md) carry a skill snapshot and nothing else -
 *     no registry checkout, no scripts - so the one path that works everywhere is a line in
 *     the project's own .ai/. An agent without this script writes that line itself (at
 *     least LOCAL_REQUIRED, ts ISO with Z); this script is the convenience that stamps more.
 *
 * Why a script at all: the agent would otherwise type its own device, contributor, project,
 * version and id, and every one of those is a place for drift and for a leaked absolute
 * path. Here they are resolved mechanically, the row is built in RUN_KEYS order, and it is
 * validated (validateLocal, plus validateRun when fully stamped) BEFORE anything touches
 * disk - a bad line in an append-only file cannot be taken back.
 *
 * Stamped here when resolvable: schema, ts, skill (bare name after the last ':'), project,
 * device + contributor (this registry's .machine.local.json), id, and version (--version,
 * else the checkout's installation receipt, else the registry lane's SKILL.md frontmatter).
 * With no machine identity the row is written with device/contributor/id null; the drain
 * stamps them. runs-backfill always re-stamps device/contributor/id with its own machine.
 *
 * Tests: no destination hook. The destination follows cwd, so tests run this with cwd in a
 * temp directory holding a .git dir; identity still comes from this registry checkout.
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 logged (or dry run), 1 the row is invalid
 * and nothing was written, 2 could not run (bad flag, --pending, unreadable --json).
 *
 * Builtins only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import {
  SCHEMA, RUN_KEYS, OUTCOMES, PROVIDERS, DIFFICULTY, LIMITS, LOCAL_REL, LOCAL_REQUIRED,
  validateRun, validateLocal, runId, resolveIdentity, receiptVersion, laneVersion,
} from './lib/runs.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SHOWN_REL = LOCAL_REL.split(path.sep).join('/');

// flag -> row key. Value flags only; booleans are handled apart.
const FLAGS = {
  '--skill': 'skill', '--version': 'version', '--outcome': 'outcome', '--difficulty': 'difficulty',
  '--result': 'result', '--comment': 'comment', '--provider': 'provider', '--model': 'model',
  '--effort': 'effort', '--started': 'started', '--tokens-est': 'tokensEst', '--project': 'project',
};
const BOOLS = new Set(['--dry-run', '--help', '-h']);
// What a caller may supply. schema/id/ts/device/contributor are stamped, never supplied.
const INPUT_KEYS = new Set(Object.values(FLAGS));
// ts is stamped here; every other key a local row must carry is the caller's to give.
const REQUIRED = LOCAL_REQUIRED.filter((k) => k !== 'ts');

function usage() {
  console.log(`Usage: node <registry>/scripts/log-run.mjs --skill <name> --outcome <o> --difficulty <1-5>
         --result "<one line>" --comment "<self-reflection>" --provider <p> --model <m>
         [--version <semver>] [--effort <e>] [--started <ISO>] [--tokens-est <n>]
         [--project <slug>] [--json <file>] [--dry-run]

Appends ONE row to <checkout root>/${SHOWN_REL} in the project the run happened in
(checkout root = nearest ancestor of cwd holding .ai/manifest.yaml or .git). Never writes
the registry: runs-backfill pulls the file into usage/runs/. device, contributor and project
are resolved from the machine identity and the cwd (--project overrides). --version defaults
to the checkout's installation receipt, else the skill's SKILL.md frontmatter. --json reads a
JSON object with the same fields under their row key names (skill, version, outcome,
difficulty, result, comment, provider, model, effort, started, tokensEst, project); flags
override it.

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
  if (a === '--pending') {
    console.error(`FATAL: --pending is gone - every row is now local. log-run always writes <checkout root>/${SHOWN_REL} and runs-backfill pulls it into the registry. Drop the flag.`);
    process.exit(EXIT.FATAL);
  }
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
// bad value still reaches validation and is reported by name.
const intish = (v) => (typeof v === 'string' && /^-?\d+$/.test(v.trim()) ? Number(v) : v);
const orNull = (v) => (v === undefined || v === '' ? null : v);

const problems = [];
for (const k of REQUIRED) if (given[k] === undefined || given[k] === '') problems.push(`missing ${k} (--${k})`);

// Scoped/plugin names log as the bare skill.
const skill = typeof given.skill === 'string' ? given.skill.slice(given.skill.lastIndexOf(':') + 1) : given.skill;

// The local file belongs at the checkout root, where runs-backfill looks for it: the
// nearest ancestor holding .ai/manifest.yaml or .git (a worktree's .git is a file, which
// counts), else cwd.
function checkoutRoot(start) {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'manifest.yaml')) || fs.existsSync(path.join(dir, '.git'))) return dir;
    if (path.dirname(dir) === dir) return path.resolve(start);
  }
}
const checkout = checkoutRoot(process.cwd());

// Same order the drain uses: explicit, then what this checkout installed, then the lane.
let version = orNull(given.version);
if (version === null && skill) {
  version = receiptVersion(checkout, skill, given.provider) ?? laneVersion(ROOT, skill);
  if (version === null) problems.push(`version: no installation receipt or SKILL.md frontmatter version found for "${skill}" - pass --version`);
}

// ---------------------------------------------------------------- the row
const id = resolveIdentity({ cwd: process.cwd(), registryRoot: ROOT });
const values = {
  schema: SCHEMA,
  id: null,
  ts: new Date().toISOString(),
  started: orNull(given.started),
  project: typeof given.project === 'string' && given.project ? given.project : id.project,
  skill: orNull(skill),
  version,
  device: id.device ?? null,
  contributor: id.device ? (id.contributor ?? null) : null,
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
if (row.device) row.id = runId(row);

// Missing-flag problems first, then the contract's own; a missing field produces both,
// which names the flag AND the rule. A fully stamped row must also pass the committed-row
// gate, so what the drain appends is what was checked here.
problems.push(...validateLocal(row));
if (row.device) problems.push(...validateRun(row));
const unique = [...new Set(problems)];
if (unique.length) {
  console.error(`log-run: ${unique.length} problem(s) - nothing written:`);
  for (const p of unique) console.error(`  - ${p}`);
  process.exit(EXIT.VIOLATIONS);
}

const target = path.join(checkout, LOCAL_REL);
const line = JSON.stringify(row) + '\n';

if (bools.has('--dry-run')) {
  console.log(`dry run - would append to ${target}:`);
  console.log(line.trimEnd());
  process.exit(EXIT.OK);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.appendFileSync(target, line);
console.log(`run logged: ${row.id ?? row.skill} -> ${target}`);
if (!row.device) console.log('  (this machine has no identity - device, contributor and id are stamped when runs-backfill drains the file)');
