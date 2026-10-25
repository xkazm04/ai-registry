#!/usr/bin/env node
/**
 * run-tests - the TOOL_TESTS step of gate.mjs: run every test file in the checkout.
 *
 * Why this exists in this shape. It used to read its population from
 * `readdirSync(scripts/tests)`, and that ran 34 of the 76 test files in the tree. The two
 * `scripts/*.test.mjs` files and every skill's `tests/` folder were outside the
 * directory it listed, so a skill test could go red with no gate noticing (gates
 * validation scan, 2026-10-25). The population is now derived the way the tree itself
 * is known: `git ls-files --cached --others --exclude-standard` (tracked, plus untracked
 * and not ignored, so a new test runs before it is committed), filtered by the two
 * naming patterns the tree uses:
 *
 *   <anything>.test.mjs          scripts/tests/, scripts/, some skills
 *   <dir>/tests/test_<name>.mjs  the skills lane convention (docs/skills-lane.md)
 *
 * scripts/tests/run-tests-population.test.mjs is the canary: it walks the tree on its
 * own, with a broader net, and fails if a file that looks like a test is not here.
 *
 * Optional dependencies. A few skill tests need something the registry's own gate does
 * not: a package from a skill's private package.json (zod, for demo-film), or a newer
 * runtime than CI's pinned Node 20 (TypeScript type stripping, node:sqlite). Those files
 * are listed in NEEDS below, each with the dependency it needs, and the dependency is
 * PROBED every run. When it is present the file runs like any other. When it is absent
 * the file is reported as `could-not-run: <file> (<dep> absent)` on stderr and does not
 * fail the gate: the dependency is optional for the registry, and the line keeps the
 * gap visible instead of silent. A file needing a dependency that is not declared here
 * simply fails, which is the point - an undeclared need is a finding.
 *
 * Floors (exit 2, could-not-run): git unavailable, 0 test files found, or 0 runnable
 * after the declared skips. Reporting nothing is not finding nothing.
 *
 * Usage:
 *   node scripts/run-tests.mjs              run the population (what gate.mjs does)
 *   node scripts/run-tests.mjs --list       print the population as JSON, run nothing
 *   node scripts/run-tests.mjs --root <dir> use another checkout (seeded tests only)
 *
 * Exits 0 when every runnable file passes, 1 when a test fails, 2 when it could not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { EXIT } from './lib/exit-codes.mjs';
import { classifyCheckResult, requirePopulation } from './lib/check-result.mjs';

const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const TEST_FILE = /(^|\/)[^/]+\.test\.mjs$|(^|\/)tests\/test_[^/]+\.mjs$/;

// Each optional dependency: why it is optional, and a live probe for it.
const DEPS = {
  zod: {
    why: 'skills/demo-film keeps its own package.json; `npm ci` there installs it',
    present: (root) => {
      try {
        createRequire(path.join(root, 'skills', 'demo-film', 'package.json')).resolve('zod');
        return true;
      } catch {
        return false;
      }
    },
  },
  'node type stripping': {
    why: 'imports .ts sources; Node >= 23.6 (demo-film engines), CI pins Node 20',
    present: () => Boolean(process.features?.typescript),
  },
  'node:sqlite': {
    why: 'the lens-scan store; Node >= 22.13 unflagged, CI pins Node 20',
    // In a child so the probe's ExperimentalWarning does not land in the gate log.
    present: () =>
      spawnSync(process.execPath, ['--input-type=module', '-e', "await import('node:sqlite')"], {
        stdio: 'ignore',
      }).status === 0,
  },
};

const DEMO_FILM = ['zod', 'node type stripping'];
const LENS_STORE = ['node:sqlite'];
// Measured 2026-10-25: Node 24 without zod fails exactly the demo-film five; Node 20
// fails those five (.ts) and these seven lens-scan files (node:sqlite).
const NEEDS = {
  'skills/demo-film/tests/test_collisions.mjs': DEMO_FILM,
  'skills/demo-film/tests/test_contract.mjs': DEMO_FILM,
  'skills/demo-film/tests/test_narrate.mjs': DEMO_FILM,
  'skills/demo-film/tests/test_seek_lint.mjs': DEMO_FILM,
  'skills/demo-film/tests/test_timeline.mjs': DEMO_FILM,
  'skills/lens-scan/tests/drive.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/footprint.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/steps.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/store-v2.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/store-v4.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/store.test.mjs': LENS_STORE,
  'skills/lens-scan/tests/structure.test.mjs': LENS_STORE,
};

function fail(reason) {
  console.error(`run-tests: could-not-run: ${reason}`);
  process.exit(EXIT.FATAL);
}

function parseArgs(argv) {
  const opts = { list: false, root: DEFAULT_ROOT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') opts.list = true;
    else if (a === '--root') {
      if (!argv[i + 1]) fail('--root needs a directory');
      opts.root = path.resolve(argv[++i]);
    } else fail(`unknown argument ${a} (expected --list or --root <dir>)`);
  }
  return opts;
}

function population(root) {
  const r = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (r.error) fail(`git ls-files did not start (${r.error.message})`);
  if (r.status !== 0) fail(`git ls-files exited ${r.status}: ${String(r.stderr).trim()}`);
  const listed = new Set(r.stdout.split('\0').filter(Boolean));
  // A tracked file deleted from the working tree is still in the index; it is not a test.
  return [...listed].filter((f) => TEST_FILE.test(f) && fs.existsSync(path.join(root, f))).sort();
}

function plan(root, files) {
  const seen = new Map();
  const isPresent = (dep) => {
    if (!seen.has(dep)) seen.set(dep, DEPS[dep].present(root));
    return seen.get(dep);
  };
  const run = [];
  const couldNotRun = [];
  for (const file of files) {
    const missing = (NEEDS[file] || []).filter((dep) => !isPresent(dep));
    if (missing.length) couldNotRun.push({ file, missing });
    else run.push(file);
  }
  return { run, couldNotRun };
}

const opts = parseArgs(process.argv.slice(2));
if (!fs.existsSync(opts.root)) fail(`root ${opts.root} does not exist`);
const files = population(opts.root);
const floor = requirePopulation(files.length, 'test files');
if (floor.code !== EXIT.OK) fail(floor.reason);
const { run, couldNotRun } = plan(opts.root, files);
const notices = couldNotRun.map(
  ({ file, missing }) => `could-not-run: ${file} (${missing.map((d) => `${d} absent`).join(', ')})`,
);

if (opts.list) {
  const declared = Object.fromEntries(
    Object.entries(NEEDS).map(([file, deps]) => [file, deps.map((d) => ({ dep: d, why: DEPS[d].why }))]),
  );
  console.log(JSON.stringify({ patterns: String(TEST_FILE), total: files.length, run, couldNotRun, declared }, null, 2));
  process.exit(EXIT.OK);
}

const runnable = requirePopulation(run.length, 'runnable test files');
if (runnable.code !== EXIT.OK) {
  for (const n of notices) console.error(n);
  fail(runnable.reason);
}
// Repo-relative, against cwd = root: Windows caps a command line at 32,767 characters, and
// absolute paths spent ~100 of them per file (10,207 for 102 files in a worktree checkout).
const result = classifyCheckResult(
  spawnSync(process.execPath, ['--test', ...run], {
    cwd: opts.root,
    stdio: 'inherit',
  }),
);
// After the test output, so the gap is the last thing in the log, not buried above it.
console.error(`run-tests: ${run.length} of ${files.length} test files run, ${couldNotRun.length} could not run`);
for (const n of notices) console.error(n);
if (result.reason) console.error(result.reason);
process.exitCode = result.code;
