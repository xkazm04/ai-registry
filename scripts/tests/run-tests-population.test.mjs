// The canary for run-tests' population. run-tests once listed scripts/tests/ and ran 34 of
// the tree's 76 test files; the rest (scripts/*.test.mjs, every skill's tests/) could go
// red with no gate noticing. These tests keep that from coming back: the real tree's
// population must equal an independent, broader walk, and a seeded tree proves a failing
// skill test turns the gate red, and that an empty or unlistable tree is could-not-run.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const RUN_TESTS = path.join(ROOT, 'scripts', 'run-tests.mjs');

// Files the broad net catches that are not tests. Adding to this list is a decision.
const NOT_TESTS = new Set([
  'scripts/run-tests.mjs', // the runner itself
  'skills/lens-scan/tests/legacy-ddl.mjs', // a DDL helper imported by the store tests
]);

// A nested test runner reads NODE_TEST_CONTEXT and would report to us instead of itself.
function cleanEnv(overrides = {}) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return { ...env, ...overrides };
}

function runTests(args, { env } = {}) {
  return spawnSync(process.execPath, [RUN_TESTS, ...args], { encoding: 'utf8', env: env || cleanEnv() });
}

// Independent of run-tests' pattern: any script whose basename carries a test/tests/spec
// word, or that sits in a tests/ dir, outside fixtures.
function broadNet(root) {
  const r = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  assert.equal(r.status, 0, r.stderr);
  return new Set(
    r.stdout
      .split('\0')
      .filter(Boolean)
      .filter((f) => /\.(m?js|cjs)$/.test(f) && !/(^|\/)fixtures\//.test(f))
      .filter((f) => /(^|[._-])(test|tests|spec)([._-]|$)/i.test(path.posix.basename(f)) || /(^|\/)tests?\//.test(f))
      .filter((f) => fs.existsSync(path.join(root, f))),
  );
}

function seed(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-run-tests-'));
  const init = spawnSync('git', ['init', '-q'], { cwd: root, encoding: 'utf8' });
  assert.equal(init.status, 0, init.stderr);
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  }
  return root;
}

const PASS = "import test from 'node:test';\ntest('passes', () => {});\n";
const FAIL = "import test from 'node:test';\nimport assert from 'node:assert';\ntest('fails', () => assert.fail('planted'));\n";

test('the real population is every file an independent walk calls a test', () => {
  const r = runTests(['--list']);
  assert.equal(r.status, EXIT.OK, r.stderr);
  const listed = JSON.parse(r.stdout);
  const population = new Set([...listed.run, ...listed.couldNotRun.map((c) => c.file)]);
  assert.equal(population.size, listed.total);
  const expected = [...broadNet(ROOT)].filter((f) => !NOT_TESTS.has(f)).sort();
  assert.deepEqual([...population].sort(), expected, 'a file that looks like a test is not in run-tests');
  // The skills lane and the loose scripts/*.test.mjs files are the regions the old runner missed.
  assert.ok([...population].some((f) => f.startsWith('skills/')), 'no skill test in the population');
  assert.ok(population.has('scripts/run-board.test.mjs'));
  for (const f of NOT_TESTS) assert.ok(fs.existsSync(path.join(ROOT, f)), `stale NOT_TESTS entry ${f}`);
});

test('every declared optional-dependency file exists and is in the population', () => {
  const listed = JSON.parse(runTests(['--list']).stdout);
  const population = new Set([...listed.run, ...listed.couldNotRun.map((c) => c.file)]);
  for (const [file, deps] of Object.entries(listed.declared)) {
    assert.ok(population.has(file), `declared ${file} is not a test file in the tree`);
    for (const d of deps) assert.ok(d.why, `${file}: ${d.dep} has no reason`);
  }
  for (const c of listed.couldNotRun) assert.ok(listed.declared[c.file], `${c.file} skipped without a declaration`);
});

test('a failing skill test turns the gate red; the clean control is green', () => {
  const red = seed({
    'scripts/tests/ok.test.mjs': PASS,
    'skills/x/tests/test_x.mjs': FAIL,
  });
  const loose = seed({ 'scripts/tests/ok.test.mjs': PASS, 'scripts/x.test.mjs': FAIL });
  const green = seed({
    'scripts/tests/ok.test.mjs': PASS,
    'skills/x/tests/test_x.mjs': PASS,
    'skills/y/tests/y.test.mjs': PASS,
    'skills/y/tests/helper.mjs': FAIL, // not a test name: never run
  });
  try {
    assert.equal(runTests(['--root', red]).status, EXIT.VIOLATIONS);
    assert.equal(runTests(['--root', loose]).status, EXIT.VIOLATIONS);
    const ok = runTests(['--root', green]);
    assert.equal(ok.status, EXIT.OK, ok.stderr);
    assert.match(ok.stderr, /3 of 3 test files run, 0 could not run/);
  } finally {
    for (const d of [red, loose, green]) fs.rmSync(d, { recursive: true, force: true });
  }
});

test('an empty population, a non-repo and a missing git are could-not-run (exit 2)', () => {
  const empty = seed({ 'scripts/tool.mjs': 'export {};\n' });
  const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-run-tests-bare-'));
  const noPath = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-run-tests-nopath-'));
  try {
    const e = runTests(['--root', empty]);
    assert.equal(e.status, EXIT.FATAL);
    assert.match(e.stderr, /walked 0 test files/);
    const b = runTests(['--root', bare], { env: cleanEnv({ GIT_CEILING_DIRECTORIES: path.dirname(bare) }) });
    assert.equal(b.status, EXIT.FATAL, b.stderr);
    const env = cleanEnv();
    for (const k of Object.keys(env)) if (/^path$/i.test(k)) delete env[k];
    env.PATH = noPath;
    const g = runTests(['--root', empty], { env });
    assert.equal(g.status, EXIT.FATAL);
    assert.match(g.stderr, /git ls-files did not start/);
    assert.equal(runTests(['--bogus']).status, EXIT.FATAL);
  } finally {
    for (const d of [empty, bare, noPath]) fs.rmSync(d, { recursive: true, force: true });
  }
});

test('a declared-dependency file is reported could-not-run when its dependency is absent, and runs when present', () => {
  const file = 'skills/demo-film/tests/test_contract.mjs';
  const root = seed({ 'scripts/tests/ok.test.mjs': PASS, [file]: FAIL });
  try {
    const absent = runTests(['--root', root]);
    assert.equal(absent.status, EXIT.OK, absent.stderr);
    assert.match(absent.stderr, /could-not-run: skills\/demo-film\/tests\/test_contract\.mjs \(zod absent/);
    // Only declared-dependency files, all skipped: nothing ran, which is not a pass.
    fs.rmSync(path.join(root, 'scripts'), { recursive: true });
    assert.equal(runTests(['--root', root]).status, EXIT.FATAL);
    // Install a stub zod: the probe is live, so the file now runs (and its planted failure shows)
    // wherever this Node can strip types; on Node 20 it stays could-not-run for that reason.
    const zod = path.join(root, 'skills', 'demo-film', 'node_modules', 'zod');
    fs.mkdirSync(zod, { recursive: true });
    fs.writeFileSync(path.join(zod, 'package.json'), '{"name":"zod","version":"3.25.0","main":"index.js"}');
    fs.writeFileSync(path.join(zod, 'index.js'), 'module.exports = {};\n');
    fs.writeFileSync(path.join(root, 'skills', 'demo-film', 'package.json'), '{"name":"demo-film-skill","private":true}');
    fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules/\n');
    fs.mkdirSync(path.join(root, 'scripts', 'tests'), { recursive: true });
    fs.writeFileSync(path.join(root, 'scripts', 'tests', 'ok.test.mjs'), PASS);
    const present = runTests(['--root', root]);
    if (process.features?.typescript) {
      assert.equal(present.status, EXIT.VIOLATIONS, present.stderr);
      assert.doesNotMatch(present.stderr, /could-not-run: skills\/demo-film/);
    } else {
      assert.equal(present.status, EXIT.OK, present.stderr);
      assert.match(present.stderr, /\(node type stripping absent\)/);
      assert.doesNotMatch(present.stderr, /zod absent/);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
