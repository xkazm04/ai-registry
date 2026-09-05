#!/usr/bin/env node
/**
 * gate - runs the gate chain this repository enforces, in the order CI runs it.
 *
 * THE WORKFLOWS ARE THE ENFORCEMENT; this is the local mirror. `.github/workflows/`
 * is what decides whether a change lands, and it is the only copy of the order that
 * can fail a pull request. This script exists because the order lived in three other
 * places at once - the CONTRIBUTING table, the two workflow files, and registry.yaml's
 * `gate:` keys - and only one of them was checked by anything. Three lists that drift
 * independently is one list nobody can trust; a contributor who ran the documented row
 * still found out from a red pipeline. So the order is encoded ONCE, here, and
 * CONTRIBUTING points at it.
 *
 * That makes this a MIRROR, with the failure mode a mirror has: when a workflow gains
 * a step and this file does not, this file is wrong and green. Nothing detects that
 * automatically today (a workflow parser would be the fix, and it is not worth a YAML
 * reader in a zero-dependency toolchain yet). The mitigation is that CI still fails -
 * the local pass was optimistic, never authoritative.
 *
 * Usage:
 *   node scripts/gate.mjs --all
 *   node scripts/gate.mjs --lane knowledge|skills|usage|signals|practices|memory
 *   node scripts/gate.mjs --lane knowledge --write
 *
 * `--all` runs every gate CI can fail on, in CI order, and stops at the FIRST red,
 * printing the script name and its exit code. Stopping is deliberate: the gates are
 * ordered by what they presuppose (an index must be current before the catalog that
 * hashes it means anything), so everything after the first failure is answering a
 * question about a tree that is already known to be inconsistent.
 *
 * `--write` swaps the generators from `--check` to write mode, preserving regeneration
 * order (build-index writes a file inside a bundle; build-catalog's hash covers it, so
 * the reverse order produces a catalog that is stale the moment it is written).
 *
 * Two deliberate omissions:
 *
 *  - The REPORT-ONLY jobs (`check-currency`, `librarian-scan`, `check-citations`) are
 *    not here. They never fail a build by design - a stale document must not block an
 *    unrelated pull request - so putting them in a chain that stops at the first red
 *    would give them a power CI deliberately withholds.
 *  - `check-skills.mjs --since <ref>` is not here either. It runs on PULL REQUESTS
 *    only, against the merge base, which a local checkout does not have a canonical
 *    value for. Run it by hand: `node scripts/check-skills.mjs --since origin/main`.
 *  - `apply-skill-clauses.mjs` stays at `--check` even under `--write`. Its write mode
 *    restamps the shared clauses into every SKILL.md body, which is a content change to
 *    the whole lane and needs the `--bump` decision that comes with it. A flag whose
 *    job is "regenerate the generated views" must not quietly rewrite 25 skills.
 *
 * Exit codes are scripts/lib/exit-codes.mjs: 0 clean, 1 a gate found what it looks
 * for, 2 this script could not run (unknown lane, missing gate script, unlaunchable
 * child). A child's own code is propagated when it is one the declaration names, so
 * "could not run" never arrives as "found violations".
 *
 * Zero dependencies, like every script here.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT, nameOf } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'scripts');

// A step is a script plus the arguments it takes in each mode. `check` is the CI form;
// `write` is what a contributor runs to regenerate. A step with no `write` entry is a
// checker - it has no write mode, and `--write` leaves it alone.
const step = (script, { check = [], write = null } = {}) => ({ script, check, write });

const CHECK_SKILLS = step('check-skills.mjs');
// Stamper, not a generator: --check here even under --write. See the header.
const CLAUSES = step('apply-skill-clauses.mjs', { check: ['--check'] });
const MARKETPLACE = step('build-marketplace.mjs', { check: ['--check'], write: [] });
const CHECK_BUNDLES = step('check-bundles.mjs');
const INDEX = step('build-index.mjs', { check: ['--check'], write: [] });
const KNOWLEDGE_RULES = step('build-knowledge-rules.mjs', { check: ['--check'], write: [] });
const CHECK_USAGE = step('check-usage.mjs');
const CHECK_SIGNALS = step('check-signals.mjs');
// Asks whether "current" means the same thing here as on the machine that wrote the
// catalog, so it runs immediately BEFORE the catalog check, exactly as knowledge.yml
// orders them. A CRLF checkout used to fail the catalog check indistinguishably from
// real staleness.
const HASH_STABILITY = step('check-hash-stability.mjs');
const CATALOG = step('build-catalog.mjs', { check: ['--check'], write: [] });
// Tooling contracts (knowledge.yml `tooling` job): the exit-code vocabulary every
// script declares against, and the standard's weight table stamped from the scan.
const EXIT_CONTRACT = step('check-exit-contract.mjs');
const WEIGHTS = step('librarian-scan.mjs', { check: ['--check-weights'], write: ['--stamp-weights'] });

// The catalog job's path filter covers knowledge/, skills/, practices/, memory/ and
// usage/ - build-catalog hashes those five lanes - so those five rows end with it.
// signals/ is genuinely outside the catalog's inputs and its row correctly stops early.
const CATALOG_TAIL = [HASH_STABILITY, CATALOG];

const LANES = {
  // knowledge.yml: bundles -> index (+ the generated rules view) -> catalog.
  knowledge: [CHECK_BUNDLES, INDEX, KNOWLEDGE_RULES, ...CATALOG_TAIL],
  // skills.yml `shape` job, then the catalog job skills/** also triggers.
  skills: [CHECK_SKILLS, CLAUSES, MARKETPLACE, ...CATALOG_TAIL],
  usage: [CHECK_USAGE, ...CATALOG_TAIL],
  signals: [CHECK_SIGNALS],
  practices: [...CATALOG_TAIL],
  memory: [...CATALOG_TAIL],
  // knowledge.yml `tooling` job: scripts/** and librarian/standard.md trigger it.
  scripts: [EXIT_CONTRACT, WEIGHTS],
  librarian: [WEIGHTS],
};

// --all is not the concatenation of the lane rows: the shared tail would run five
// times. It is the union, in the order CI reaches each job - skills.yml's shape job
// first, then knowledge.yml's bundles, index, usage, signals and catalog.
const ALL = [
  CHECK_SKILLS, CLAUSES, MARKETPLACE,
  CHECK_BUNDLES, INDEX, KNOWLEDGE_RULES,
  CHECK_USAGE, CHECK_SIGNALS,
  EXIT_CONTRACT, WEIGHTS,
  HASH_STABILITY, CATALOG,
];

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const write = argv.includes('--write');
const all = argv.includes('--all');
const laneIdx = argv.indexOf('--lane');
const lane = laneIdx === -1 ? null : argv[laneIdx + 1];

const usage = () => {
  console.error('Usage: node scripts/gate.mjs --all [--write]');
  console.error(`       node scripts/gate.mjs --lane <${Object.keys(LANES).join('|')}> [--write]`);
  console.error('');
  console.error('Runs the gate chain CI enforces, in CI order, stopping at the first red.');
  console.error('The workflows in .github/workflows/ remain the enforcement; this mirrors them.');
};

if (argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(EXIT.OK); }
if (all && lane) {
  console.error('FATAL: --all and --lane are exclusive. Pick the whole chain or one row.');
  process.exit(EXIT.FATAL);
}
if (!all && !lane) { usage(); process.exit(EXIT.FATAL); }
if (lane && !Object.prototype.hasOwnProperty.call(LANES, lane)) {
  console.error(`FATAL: unknown lane ${JSON.stringify(lane ?? '')}. Declared lanes: ${Object.keys(LANES).join(', ')}.`);
  console.error('Refusing to report a green chain from a row that does not exist.');
  process.exit(EXIT.FATAL);
}

const chain = all ? ALL : LANES[lane];

// ---------------------------------------------------------------- assert the instrument
// A missing gate script is FATAL, never a skipped step. A chain that quietly runs four
// of five gates and prints OK is the exact failure this file was written to remove.
const missing = chain.map((s) => s.script).filter((s) => !fs.existsSync(path.join(SCRIPTS, s)));
if (missing.length) {
  console.error(`FATAL: ${missing.length} gate script(s) named by this chain are not in scripts/:`);
  for (const m of missing) console.error(`  - scripts/${m}`);
  console.error('Either a script moved and this file was not updated, or the checkout is incomplete.');
  console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

// ---------------------------------------------------------------- run
const label = all ? 'all' : `lane ${lane}`;
console.log(`gate: ${chain.length} step(s), ${label}, ${write ? 'WRITE' : 'check'} mode`);
console.log('The workflows in .github/workflows/ are the enforcement; this is the local mirror.\n');

let ranClean = 0;
for (const s of chain) {
  const args = write && s.write ? s.write : s.check;
  const shown = ['node', `scripts/${s.script}`, ...args].join(' ');
  console.log(`--- ${shown}`);
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, s.script), ...args], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (r.error) {
    console.error(`\ngate FATAL: could not launch scripts/${s.script} (${r.error.message}).`);
    process.exit(EXIT.FATAL);
  }
  if (r.signal) {
    console.error(`\ngate FATAL: scripts/${s.script} was killed by ${r.signal} - it did not finish, so it reported nothing.`);
    process.exit(EXIT.FATAL);
  }
  if (r.status !== EXIT.OK) {
    // Propagate a declared code so "could not run" (2) never arrives as "found
    // violations" (1); an undeclared code from a child collapses to VIOLATIONS,
    // because this chain's own vocabulary is the one in exit-codes.mjs.
    const named = nameOf(r.status);
    const code = named ? r.status : EXIT.VIOLATIONS;
    console.error(`\ngate FAILED at scripts/${s.script} - exit ${r.status}${named ? ` (${named})` : ' (undeclared code)'}`);
    console.error(`${ranClean} step(s) passed before it; ${chain.length - ranClean - 1} not run.`);
    console.error(`Re-run just this one: node scripts/${s.script}${args.length ? ` ${args.join(' ')}` : ''}`);
    process.exit(code);
  }
  ranClean += 1;
  console.log('');
}

console.log(`gate OK - ${ranClean}/${chain.length} step(s) green (${label}).`);
if (!all) console.log('This is one lane\'s row. `--all` runs the whole chain CI enforces.');
console.log('NOT run here: check-skills.mjs --since <base> (pull requests only), and the');
console.log('report-only jobs check-currency / librarian-scan / check-citations.');
