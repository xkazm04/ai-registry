#!/usr/bin/env node
/**
 * Shared validation plan for local development and .github/workflows/registry.yml.
 * --all runs the complete deterministic chain; --lane selects a declared subset;
 * --changed selects the rows a change touches.
 *
 * Check mode keeps going: every step runs, concurrently up to --jobs, and the run ends
 * with one verdict row per step. It used to stop at the first red, and a red step hid
 * every step behind it (19 on 2026-10-06, 15 on 2026-11-09 - the second one red purely
 * by the calendar). --fail-fast restores stop-at-first-red, sequentially.
 *
 * --write validates source before regenerating derived views, so it stays sequential and
 * fail-fast: a red checker must stop the generators behind it. Shared skill clauses
 * remain check-only because restamping needs an explicit version-bump decision.
 * Version-history checks run separately, against the PR base or the push's prior head
 * (registry.yml, every event); external currency/liveness reports remain advisory.
 * Legacy workflows retain their existing status names.
 *
 * A child execution failure is distinct from a content violation. Each step has a
 * ceiling (15 min, GATE_STEP_TIMEOUT_MS to override); a hung step is "timed out".
 * The runner and plan derivation live in scripts/lib/gate-plan.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import {
  STATUS, stepId, validatePlan, deriveLanes, unionRows, readRegistryLanes, selectRows, runSteps, runExit,
} from './lib/gate-plan.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'scripts');

// ---------------------------------------------------------------- the plan
// ONE table. Each step is declared once, with the lanes whose row it belongs to; its
// position here is its position in `--all` and in every lane row (each row is this table
// filtered to the lane). `check` is the CI form; `write` is what a contributor runs to
// regenerate. A step with no `write` entry is a checker - it has no write mode, and
// `--write` leaves it alone.
//
// Flags: `slow` launches first when running wide (it bounds the wall time); `calendar`
// marks a step that can go red with no change in the tree; `exclusive` runs a step with
// nothing beside it. No step needs it for correctness: every check-mode step leaves the
// tree untouched (`git status --short` unchanged after three full runs) and writes only
// under os.tmpdir() (check-hash-stability's mkdtemp; the tests' own temp fixtures). The one
// exclusive step, run-tests, is exclusive for CPU, not for a shared file.
const step = (script, { check = [], write = null, lanes = [], ...flags } = {}) => ({ script, check, write, lanes, ...flags });

// The catalog job's path filter covers knowledge/, skills/, practices/, memory/ and
// usage/ - build-catalog hashes those five lanes - so those five rows end with it.
// signals/ is genuinely outside the catalog's inputs and its row correctly stops early.
const CATALOG_LANES = ['knowledge', 'skills', 'practices', 'memory', 'usage'];
// No machine's home directory in a published lane (AGENTS.md: absolute roots live only in
// .machine.local.json). Self-test first, so a green run is a detector that can see, not silence.
// recipes/publications carry no public-paths step: registry.yml runs --all on every PR.
const PUBLIC_LANES = ['knowledge', 'skills', 'practices', 'memory', 'librarian'];

// The lane names, in the order `--list` prints them.
const LANE_NAMES = ['knowledge', 'skills', 'recipes', 'publications', 'usage', 'signals', 'practices', 'memory', 'scripts', 'librarian'];

// Order is the order CI reaches each job: skills.yml's shape job first, then
// knowledge.yml's bundles, index, usage, signals and catalog.
const PLAN = [
  // skills.yml `shape` job.
  step('check-skills.mjs', { lanes: ['skills'] }),
  // Stamper, not a generator: --check here even under --write. See the header.
  step('apply-skill-clauses.mjs', { check: ['--check'], lanes: ['skills'] }),
  step('build-marketplace.mjs', { check: ['--check'], write: [], lanes: ['skills'] }),
  // knowledge.yml: bundles -> index (+ the generated rules view) -> catalog.
  step('check-bundles.mjs', { lanes: ['knowledge'] }),
  step('check-public-paths.mjs', { check: ['--self-test'], lanes: PUBLIC_LANES }),
  step('check-public-paths.mjs', { lanes: PUBLIC_LANES }),
  step('build-index.mjs', { check: ['--check'], write: [], lanes: ['knowledge'] }),
  step('build-knowledge-rules.mjs', { check: ['--check'], write: [], lanes: ['knowledge'] }),
  step('review-coverage.mjs', { lanes: ['knowledge', 'librarian'] }),
  // The run-results lane (librarian/runs/*/result.json): every record validates, except the
  // grandfathered ones in librarian/runs/.grandfathered.json, which may only shrink.
  step('check-run-results.mjs', { lanes: ['librarian'] }),
  // The fleet cannot be measured from CI: every instrument that walks it resolves through
  // the gitignored machine bridge, and publishing that to satisfy a gate would trade a real
  // privacy rule for a green tick. So the gate checks the AGE of the last measurement
  // instead - `converge.mjs` runs where the fleet is visible and commits a public-safe
  // report, and this fails when nobody has looked recently. A red row here never means the
  // fleet is broken; it means it is unobserved, which is the drift that went unnoticed for
  // three weeks and produced 13 stale maps and 193 uncollected leads at once.
  step('check-coverage-age.mjs', { lanes: ['librarian'], calendar: true }),
  // Validate content before regenerating; the default checker also checks index
  // freshness, which would prevent --write from ever repairing a stale recipe index.
  // The gate first, then the index it presupposes - an index built over a lane that
  // failed its shape check describes a tree nobody has. recipes/ is NOT one of
  // build-catalog's five hashed lanes, so this row correctly stops before the tail.
  step('check-recipes.mjs', { check: ['--shape-only'], lanes: ['recipes'] }),
  step('render-recipes.mjs', { check: ['--check'], write: [], lanes: ['recipes'] }),
  step('build-recipes-index.mjs', { check: ['--check'], write: [], lanes: ['recipes'] }),
  // The publications lane (docs/publications-lane.md): the mechanical gate first, then the
  // index it presupposes, exactly as the recipes row orders its pair. Written by the
  // article pipeline's approved write-back and by hand; posts leave the registry, so the
  // gate runs before the index and a red gate never reaches a PR. publications/ is not
  // one of build-catalog's hashed lanes, so its row stops before the catalog tail.
  step('check-publications.mjs', { lanes: ['publications'] }),
  step('build-publications-index.mjs', { check: ['--check'], write: [], lanes: ['publications'] }),
  step('check-simple-lanes.mjs', { lanes: ['practices', 'memory'] }),
  step('check-usage.mjs', { lanes: ['usage'] }),
  // The skill run log under usage/runs/ (contract: scripts/lib/runs.mjs). Same job as
  // check-usage in knowledge.yml, run right after it.
  step('check-runs.mjs', { lanes: ['usage'] }),
  step('check-signals.mjs', { lanes: ['signals'] }),
  // Tooling contracts (knowledge.yml `tooling` job; scripts/** and librarian/standard.md
  // trigger it): the exit-code vocabulary every script declares against, and the
  // standard's weight table stamped from the scan.
  step('check-projects.mjs', { lanes: ['scripts'] }),
  step('check-exit-contract.mjs', { lanes: ['scripts'] }),
  step('librarian-scan.mjs', { check: ['--check-weights'], write: ['--stamp-weights'], lanes: ['scripts', 'librarian'] }),
  // Exclusive: run-tests already runs its ~150 test files in parallel across every core
  // (`node --test`), so anything beside it competes for CPU. Measured 2026-11-09, --all on
  // a 20-core box: with no exclusivity, run-tests took 234-390 s beside the other steps
  // against 146 s alone, check-bundles 98-160 s against 21 s, and the wide run (234-390 s
  // wall) lost to --jobs 1 (245 s). It runs first and alone; the rest run wide after it.
  // With that: 227 / 197 / 251 s wide against 327 s --jobs 1 in the same session (a
  // shared, noisy machine; the gain is the ~80 s of non-test steps collapsing to 20-50 s).
  step('run-tests.mjs', { lanes: ['scripts'], slow: true, exclusive: true }),
  // Asks whether "current" means the same thing here as on the machine that wrote the
  // catalog, so it runs immediately BEFORE the catalog check, exactly as knowledge.yml
  // orders them. A CRLF checkout used to fail the catalog check indistinguishably from
  // real staleness.
  step('check-hash-stability.mjs', { lanes: CATALOG_LANES }),
  step('build-catalog.mjs', { check: ['--check'], write: [], lanes: CATALOG_LANES }),
];

const LANES = deriveLanes(PLAN, LANE_NAMES);

// ---------------------------------------------------------------- --changed routing
// Which row a changed path selects. registry.yaml's lane `path:` lines are read at run
// time; these routes come first and cover what registry.yaml does not declare as a lane.
// A path no route matches selects the whole chain, and the output says which path did it.
const STEP_LANES = new Map();   // script file -> every lane whose row runs it
for (const s of PLAN) STEP_LANES.set(s.script, [...new Set([...(STEP_LANES.get(s.script) ?? []), ...s.lanes])]);
const topScript = (p) => (/^scripts\/[^/]+$/.test(p) ? p.slice('scripts/'.length) : null);

function routesFrom(registryLanes) {
  const routes = [
    { match: (p) => p.startsWith('scripts/tests/'), lanes: ['scripts'] },
    // A gate script itself: every row that runs it, plus the tooling row (tests, exit contract).
    { match: (p) => STEP_LANES.has(topScript(p)), lanes: (p) => [...STEP_LANES.get(topScript(p)), 'scripts'] },
    { match: (p) => p.startsWith('scripts/lib/'), all: true, why: 'a shared library under scripts/lib/ can change what any gate reports' },
    { match: (p) => topScript(p) !== null, lanes: ['scripts'] },
    // Generated or stamped views of the skills lane that registry.yaml does not list as paths.
    { match: (p) => p.startsWith('.claude-plugin/'), lanes: ['skills'] },
    { match: (p) => p.startsWith('docs/skill-clauses/'), lanes: ['skills'] },
  ];
  for (const [name, decl] of Object.entries(registryLanes)) {
    if (!Object.prototype.hasOwnProperty.call(LANES, name)) continue;
    for (const p of decl.paths) {
      routes.push({ match: (x) => (p.endsWith('/') ? x.startsWith(p) : x === p), lanes: [name] });
    }
  }
  return routes;
}
const selectChanged = (paths, registryLanes) => selectRows(paths, routesFrom(registryLanes));

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const LANE_LIST = Object.keys(LANES).join('|');

const usage = () => {
  console.error('Usage: node scripts/gate.mjs --all [--write] [--jobs <n>] [--fail-fast] [--json]');
  console.error(`       node scripts/gate.mjs --lane <${LANE_LIST}> [--write] [--jobs <n>] [--fail-fast] [--json]`);
  console.error('       node scripts/gate.mjs --changed [<base>] [--write] [--jobs <n>] [--fail-fast] [--json]');
  console.error('       node scripts/gate.mjs --list      print the plan (every row and --all) as JSON, run nothing');
  console.error('');
  console.error('Runs the gate chain CI enforces. Check mode runs every step (concurrently, --jobs, default');
  console.error('half the cores) and ends with a verdict table; exit 1 if any step found violations, else 2');
  console.error('if any step could not run or timed out, else 0. --fail-fast stops at the first red, one');
  console.error('step at a time. --write is always sequential and stops at the first red.');
  console.error('--changed [<base>] runs only the rows the change touches (committed since the merge base,');
  console.error('dirty and untracked); base defaults to the branch upstream, else origin/main, else HEAD.');
  console.error('--json prints one gate-result/1 object on stdout; step output goes to stderr.');
  console.error('registry.yml executes this same plan; version checks (--since <base>) run separately, on every push and PR.');
  console.error('Each step is stopped after 15 minutes ("timed out"); set GATE_STEP_TIMEOUT_MS=<ms> to change that.');
};

const fatal = (lines) => {
  for (const l of [].concat(lines)) console.error(l);
  process.exit(EXIT.FATAL);
};

if (argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(EXIT.OK); }

// Closed flag set: a typo'd `--wirte` used to be ignored, so the check row ran, printed
// green, and the contributor believed they had regenerated.
const opt = { all: false, write: false, list: false, json: false, failFast: false, lane: null, changed: false, base: null, jobs: null };
const stray = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--all') opt.all = true;
  else if (a === '--write') opt.write = true;
  else if (a === '--list') opt.list = true;
  else if (a === '--json') opt.json = true;
  else if (a === '--fail-fast') opt.failFast = true;
  else if (a === '--lane') { opt.lane = argv[i + 1] ?? ''; i += 1; }
  else if (a === '--jobs') { opt.jobs = argv[i + 1] ?? ''; i += 1; }
  else if (a === '--changed') {
    opt.changed = true;
    if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) { opt.base = argv[i + 1]; i += 1; }
  } else stray.push(a);
}
if (stray.length) {
  console.error(`FATAL: unknown argument(s) ${stray.map((a) => JSON.stringify(a)).join(', ')}.`);
  usage();
  process.exit(EXIT.FATAL);
}

{
  const problems = validatePlan(PLAN, LANE_NAMES);
  if (problems.length) fatal(['FATAL: the gate plan is inconsistent:', ...problems.map((p) => `  - ${p}`)]);
}

// The plan as data, run nothing: each step as "<script> <check args>". Both `all` and the
// lane rows are derived from the one PLAN table; scripts/tests/validation-plan.test.mjs
// reads them without running 26 gates.
if (opt.list) {
  const lanes = Object.fromEntries(Object.entries(LANES).map(([name, row]) => [name, row.map(stepId)]));
  console.log(JSON.stringify({ all: PLAN.map(stepId), lanes }, null, 2));
  process.exit(EXIT.OK);
}

const selectors = [opt.all, opt.lane !== null, opt.changed].filter(Boolean).length;
if (selectors > 1) fatal('FATAL: --all, --lane and --changed are exclusive. Pick the whole chain, one row, or the changed rows.');
if (selectors === 0) { usage(); process.exit(EXIT.FATAL); }
if (opt.lane !== null && !Object.prototype.hasOwnProperty.call(LANES, opt.lane)) {
  fatal([
    `FATAL: unknown lane ${JSON.stringify(opt.lane)}. Declared lanes: ${Object.keys(LANES).join(', ')}.`,
    'Refusing to report a green chain from a row that does not exist.',
  ]);
}

// --jobs: a positive integer. Default: half the cores, at least 1 - run-tests.mjs already
// runs its own test files in parallel, so the gate leaves it room.
let jobs = Math.max(1, Math.floor(os.availableParallelism() / 2));
if (opt.jobs !== null) {
  jobs = Number(opt.jobs);
  if (!/^\d+$/.test(String(opt.jobs)) || !Number.isInteger(jobs) || jobs < 1) {
    fatal(`FATAL: --jobs ${JSON.stringify(opt.jobs)} is not a positive integer.`);
  }
}
// --write and --fail-fast are sequential by definition: order is the point.
if (opt.write || opt.failFast) jobs = 1;
const failFast = opt.write || opt.failFast;

// ---------------------------------------------------------------- per-step ceiling
// A deadlocked child prints nothing and never exits, so without a ceiling it holds the CI
// job until GitHub's 360-minute default. Expiry is "timed out" (could not finish), never a
// content verdict. The slowest step (run-tests.mjs) takes about three minutes; 15 is
// generous. GATE_STEP_TIMEOUT_MS overrides it, mainly so a test can use a short one. A
// malformed value is refused rather than silently falling back to "no ceiling".
const STEP_TIMEOUT_ENV = 'GATE_STEP_TIMEOUT_MS';
const DEFAULT_STEP_TIMEOUT_MS = 15 * 60 * 1000;
const rawTimeout = process.env[STEP_TIMEOUT_ENV];
const STEP_TIMEOUT_MS = rawTimeout === undefined || rawTimeout === '' ? DEFAULT_STEP_TIMEOUT_MS : Number(rawTimeout);
if (!Number.isInteger(STEP_TIMEOUT_MS) || STEP_TIMEOUT_MS <= 0) {
  fatal(`FATAL: ${STEP_TIMEOUT_ENV}=${JSON.stringify(rawTimeout)} is not a positive integer number of milliseconds.`);
}

// Human output goes to stdout, unless --json reserves stdout for the one result object.
const log = opt.json ? process.stderr : process.stdout;
const say = (line = '') => log.write(`${line}\n`);

// ---------------------------------------------------------------- --changed selection
// The base resolves the way check-skills.mjs resolves its flagless --since: the branch's
// upstream, else origin/main, else HEAD (each must share history with HEAD), and the base
// used is printed. An explicit base that does not resolve is could-not-run.
let chain;
let label;
let changedInfo = null;
if (opt.changed) {
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  const paths = (args) => git(args).split('\0').filter(Boolean);
  let ref;
  let how;
  let base;
  if (opt.base !== null) {
    ref = opt.base;
    how = 'given';
    try {
      git(['rev-parse', '--verify', `${ref}^{commit}`]);
      base = git(['merge-base', ref, 'HEAD']).trim();
    } catch (e) {
      fatal([
        `FATAL: --changed base "${ref}" does not resolve to a commit sharing history with HEAD (${String(e.message).split('\n')[0].trim()}).`,
        'Refusing to select rows from a comparison that never ran.',
      ]);
    }
  } else {
    const candidates = [
      { label: 'branch upstream', name: () => git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']).trim() },
      { label: 'origin/main', name: () => 'origin/main' },
    ];
    ref = 'HEAD';
    how = 'no upstream and no origin/main resolve';
    for (const cand of candidates) {
      let name;
      try { name = cand.name(); } catch { continue; }
      if (!name) continue;
      try {
        git(['rev-parse', '--verify', `${name}^{commit}`]);
        base = git(['merge-base', name, 'HEAD']).trim();
      } catch { continue; }
      ref = name;
      how = cand.label;
      break;
    }
    if (!base) {
      try { base = git(['rev-parse', 'HEAD']).trim(); } catch (e) {
        fatal(`FATAL: --changed could not resolve HEAD (${String(e.message).split('\n')[0].trim()}).`);
      }
    }
  }
  let changed;
  try {
    changed = [...new Set([
      ...paths(['diff', '--name-only', '-z', base]),
      ...paths(['ls-files', '-z', '--others', '--exclude-standard']),
    ])].sort();
  } catch (e) {
    fatal(`FATAL: --changed could not read the change against ${ref} (${String(e.message).split('\n')[0].trim()}).`);
  }
  let registryLanes;
  try {
    registryLanes = readRegistryLanes(fs.readFileSync(path.join(ROOT, 'registry.yaml'), 'utf8'));
  } catch (e) {
    fatal(`FATAL: --changed could not read registry.yaml (${e.message}).`);
  }
  const sel = selectChanged(changed, registryLanes);
  say(`gate --changed: base ${ref} (${how}), merge base ${base.slice(0, 12)}; ${changed.length} changed path(s).`);
  if (sel.all) {
    chain = PLAN;
    say(`Whole chain selected, because ${sel.why.length} path(s) map to no single lane:`);
    for (const w of sel.why.slice(0, 10)) say(`  - ${w}`);
    if (sel.why.length > 10) say(`  - ... and ${sel.why.length - 10} more`);
    label = 'changed (all)';
  } else {
    const order = LANE_NAMES.filter((l) => sel.lanes.includes(l));
    chain = unionRows(PLAN, order);
    say(`Rows selected: ${order.length ? order.join(', ') : 'none (no changed path)'}.`);
    label = `changed (${order.join(', ') || 'none'})`;
  }
  say('');
  changedInfo = { base: ref, how, mergeBase: base, paths: changed.length, all: sel.all, lanes: sel.all ? LANE_NAMES : LANE_NAMES.filter((l) => sel.lanes.includes(l)), why: sel.why };
} else {
  chain = opt.all ? PLAN : LANES[opt.lane];
  label = opt.all ? 'all' : `lane ${opt.lane}`;
}

// ---------------------------------------------------------------- assert the instrument
// A missing gate script is FATAL, never a skipped step. A chain that quietly runs four
// of five gates and prints OK is the exact failure this file was written to remove.
const missing = [...new Set(chain.map((s) => s.script))].filter((s) => !fs.existsSync(path.join(SCRIPTS, s)));
if (missing.length) {
  fatal([
    `FATAL: ${missing.length} gate script(s) named by this chain are not in scripts/:`,
    ...missing.map((m) => `  - scripts/${m}`),
    'Either a script moved and this file was not updated, or the checkout is incomplete.',
    'Reporting nothing is not the same as finding nothing - refusing to exit 0.',
  ]);
}

// ---------------------------------------------------------------- run
const mode = opt.write ? 'write' : 'check';
say(`gate: ${chain.length} step(s), ${label}, ${opt.write ? 'WRITE' : 'check'} mode, ${jobs === 1 ? 'sequential' : `${jobs} jobs`}${failFast ? ', fail-fast' : ''}`);
say('registry.yml executes this same validation plan.\n');

const t0 = Date.now();
const results = await runSteps(chain, {
  root: ROOT, scriptsDir: SCRIPTS, mode, jobs, failFast, timeoutMs: STEP_TIMEOUT_MS,
  out: log, err: process.stderr,
});
const wall = Date.now() - t0;
const code = runExit(results, { failFast });

// ---------------------------------------------------------------- verdict table
const count = (st) => results.filter((r) => r.status === st).length;
const ok = count(STATUS.OK);
const violations = count(STATUS.VIOLATIONS);
const incomplete = results.filter((r) => r.status === STATUS.COULD_NOT_RUN || r.status === STATUS.TIMED_OUT);
const notRun = count(STATUS.NOT_RUN);

say(`gate verdict (${label}, ${mode} mode, wall ${(wall / 1000).toFixed(1)}s):`);
say(`  ${'status'.padEnd(14)}${'exit'.padStart(5)}${'ms'.padStart(9)}  step`);
chain.forEach((s, i) => {
  const r = results[i];
  const tag = s.calendar ? '  [calendar]' : '';
  say(`  ${r.status.padEnd(14)}${String(r.exit ?? '-').padStart(5)}${String(r.ms ?? '-').padStart(9)}  ${[r.script, ...r.args].join(' ')}${tag}`);
});
for (const [i, s] of chain.entries()) {
  const r = results[i];
  if (!s.calendar || r.status === STATUS.OK || r.status === STATUS.NOT_RUN) continue;
  say(`  [calendar] scripts/${s.script} can go red with no change in the tree: red here means "unobserved" (nobody has`);
  say(`             measured recently), not that this change broke something. It still fails the gate.`);
  say(failFast
    ? `             Under ${opt.write ? '--write' : '--fail-fast'}, ${notRun} later step(s) were not run.`
    : '             No other step was hidden by it: this run kept going.');
}
say('');
say(`gate: ${ok} ok, ${violations} violations, ${incomplete.length} incomplete (could-not-run/timed-out), ${notRun} not run - exit ${code}.`);
if (code === EXIT.VIOLATIONS && incomplete.length) {
  say(`Exit 1 does not mean every other step completed: ${incomplete.length} step(s) did not reach a verdict: ${incomplete.map((r) => r.script).join(', ')}.`);
}
const red = results.filter((r) => r.status !== STATUS.OK && r.status !== STATUS.NOT_RUN);
if (red.length) {
  if (failFast) {
    const first = red[0];
    // stderr, as the stop-at-first-red gate always printed it.
    console.error(`gate FAILED at scripts/${first.script} - ${first.status}${first.exit !== null ? `, exit ${first.exit}` : ''}; ${ok} step(s) passed before it; ${notRun} not run.`);
  }
  for (const r of red) say(`Re-run: node scripts/${r.script}${r.args.length ? ` ${r.args.join(' ')}` : ''}`);
} else if (code === EXIT.OK) {
  say(`gate OK - ${ok}/${chain.length} step(s) green (${label}).`);
}
if (chain !== PLAN) say('This is not the whole chain. `--all` runs the whole chain CI enforces.');
say('NOT run here: check-skills.mjs / check-recipes.mjs --since <base> (CI runs them on every push and PR), and the');
say('report-only jobs check-currency / librarian-scan --top / check-citations / check-citation-dates / compression-scan.');

if (opt.json) {
  const doc = {
    schema: 'gate-result/1',
    label,
    mode,
    jobs,
    exit: code,
    steps: results.map((r) => ({ script: r.script, args: r.args, status: r.status, exit: r.exit, ms: r.ms })),
  };
  if (changedInfo) doc.changed = changedInfo;
  process.stdout.write(`${JSON.stringify(doc, null, 2)}\n`);
}
process.exitCode = code;
