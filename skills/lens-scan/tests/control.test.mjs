// node --test skills/lens-scan/tests
// Pins control.mjs, the red control of a test-adding item (bp cycle 3: pack qa-4's five test commits all went to the
// store as judgement / control absent though each had a by-hand control): classify splits the diff into test and
// production files; run proves the new test green at the commit, red ON AN ASSERTION under the mutation, and leaves
// the tree as it found it. A temp git repo per test; no product, no network.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classify, run, readFailure, isTestFile } from '../scripts/control.mjs';

const madeDirs = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); });
const SCRIPT = fileURLToPath(new URL('../scripts/control.mjs', import.meta.url));
const git = (dir, ...args) => execFileSync('git', ['-C', dir, '-c', 'user.email=t@example.test', '-c', 'user.name=t', '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8' }).trim();
// the repo's own config, so the script's git apply writes LF here whatever the machine's global core.autocrlf says
const init = (dir) => { git(dir, 'init', '-q'); git(dir, 'config', 'core.autocrlf', 'false'); };
const commit = (dir, msg) => { git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', msg); return git(dir, 'rev-parse', 'HEAD'); };

const LIB = 'export const within = (p) => !p.includes("..");\n';
const CHECK = [
  "import assert from 'node:assert/strict';",
  "import { within } from '../lib.mjs';",
  "assert.equal(within('a/b'), true);",
  "assert.equal(within('../etc'), false, 'a path that leaves the dir is refused');",
  "console.log('1 passed');",
  '',
].join('\n');
/** base: lib only; sha: adds scripts/check-within.mjs (bp's shape: a test-only commit). */
function repo() {
  const dir = tmp('lens-scan-control-');
  init(dir);
  writeFileSync(join(dir, 'lib.mjs'), LIB);
  const base = commit(dir, 'base');
  mkdirSync(join(dir, 'scripts'));
  writeFileSync(join(dir, 'scripts', 'check-within.mjs'), CHECK);
  const sha = commit(dir, 'test: pin within');
  return { dir, base, sha };
}
const TEST = 'node scripts/check-within.mjs';
const patchFile = (body) => { const f = join(tmp('lens-scan-control-patch-'), 'drift.diff'); writeFileSync(f, body); return f; };
const DRIFT = [
  'diff --git a/lib.mjs b/lib.mjs',
  '--- a/lib.mjs',
  '+++ b/lib.mjs',
  '@@ -1 +1 @@',
  '-export const within = (p) => !p.includes("..");',
  '+export const within = (p) => true;',
  '',
].join('\n');
const CRASH = DRIFT.replace('+export const within = (p) => true;', '+export const within = (p) => {;');

test('classify: a diff that adds a test file is method test; a mixed diff names its production files; bp check scripts are tests', () => {
  const { dir, base, sha } = repo();
  const c = classify({ repo: dir, base, sha });
  assert.deepEqual([c.method, c.tests, c.production], ['test', ['scripts/check-within.mjs'], []]);
  assert.match(c.rule, /--patch/);
  assert.equal(classify({ repo: dir, base, sha: base }).method, null, 'no diff, no test');
  for (const f of ['tests/a.mjs', 'src/__tests__/x.ts', 'a.test.tsx', 'b.spec.ts', 'pkg/test_x.py', 'x_test.go', 'scripts/check-lan-door.ts']) assert.ok(isTestFile(f), f);
  for (const f of ['src/route.ts', 'scripts/lens-serve.mjs', 'checks.md']) assert.ok(!isTestFile(f), f);
  assert.ok(isTestFile('qa/drive.py', '^qa/'), 'a project pattern extends the set');
});

test('run --patch: green at the commit, red on an assertion under the drift, the tree clean after; the fields go into the proof as they are', () => {
  const { dir, sha } = repo();
  const r = run({ repo: dir, sha, test: TEST, patch: patchFile(DRIFT) });
  assert.equal(r.red, true, JSON.stringify(r));
  assert.equal(r.green_exit, 0);
  assert.notEqual(r.exit, 0);
  assert.match(r.test_control.assertion, /AssertionError/);
  assert.ok(r.control_value >= 1);
  assert.deepEqual(Object.keys(r.proof_fields), ['method', 'control', 'control_value', 'test_control']);
  assert.deepEqual(Object.keys(r.test_control), ['command', 'mutation', 'exit', 'assertion']);
  assert.match(r.test_control.mutation, /drift\.diff \(lib\.mjs\)/);
  assert.equal(readFileSync(join(dir, 'lib.mjs'), 'utf8'), LIB, 'the drift is undone');
  assert.equal(git(dir, 'status', '--porcelain', '--untracked-files=no'), '');
});

test('run: a mutation that breaks loading is a crash, not a red control; a test that still passes does not guard the line; a test red before the mutation controls nothing', () => {
  const { dir, sha } = repo();
  const crash = run({ repo: dir, sha, test: TEST, patch: patchFile(CRASH) });
  assert.deepEqual([crash.red, crash.control], [false, 'absent']);
  assert.match(crash.why, /crashed before any assertion \(SyntaxError/);
  const blunt = patchFile(DRIFT.replace('+export const within = (p) => true;', '+export const within = (p) => !p.includes("..") ;'));
  const still = run({ repo: dir, sha, test: TEST, patch: blunt });
  assert.equal(still.red, false);
  assert.match(still.why, /still passes/);
  const red = run({ repo: dir, sha, test: 'node -e "process.exit(3)"', patch: patchFile(DRIFT) });
  assert.match(red.why, /fails at .* without any mutation \(exit 3\)/);
  assert.equal(readFileSync(join(dir, 'lib.mjs'), 'utf8'), LIB);
});

test('run --revert-production: a mixed diff (fix + its test) is controlled by undoing its own fix; a test-only diff is refused with what to do', () => {
  const { dir, base, sha } = repo();
  assert.throws(() => run({ repo: dir, sha, test: TEST, revertProduction: true, base }), /changes test files only.*--patch/);
  // a mixed item: lib starts broken, the item fixes it and adds the check
  const d2 = tmp('lens-scan-control-mixed-');
  init(d2);
  writeFileSync(join(d2, 'lib.mjs'), 'export const within = (p) => true;\n');
  const b2 = commit(d2, 'base');
  writeFileSync(join(d2, 'lib.mjs'), LIB);
  mkdirSync(join(d2, 'scripts'));
  writeFileSync(join(d2, 'scripts', 'check-within.mjs'), CHECK);
  const s2 = commit(d2, 'fix: refuse ..');
  assert.deepEqual(classify({ repo: d2, base: b2, sha: s2 }).production, ['lib.mjs']);
  const r = run({ repo: d2, sha: s2, test: TEST, revertProduction: true, base: b2 });
  assert.equal(r.red, true, JSON.stringify(r));
  assert.match(r.test_control.mutation, /reverted the item's production change \(lib\.mjs\)/);
  assert.equal(readFileSync(join(d2, 'lib.mjs'), 'utf8'), LIB);
});

test('run refuses a dirty tree, a tree off the commit, no mutation or two; --scratch runs in a worktree it removes', () => {
  const { dir, base, sha } = repo();
  assert.throws(() => run({ repo: dir, sha, test: TEST }), /name the mutation/);
  assert.throws(() => run({ repo: dir, sha, test: TEST, patch: patchFile(DRIFT), revertProduction: true, base }), /name the mutation/);
  assert.throws(() => run({ repo: dir, sha: base, test: TEST, patch: patchFile(DRIFT) }), /is not at/);
  writeFileSync(join(dir, 'lib.mjs'), LIB + '// wip\n');
  assert.throws(() => run({ repo: dir, sha, test: TEST, patch: patchFile(DRIFT) }), /uncommitted changes/);
  const scratch = join(tmp('lens-scan-control-scratch-'), 'w');
  const r = run({ repo: dir, sha, test: TEST, patch: patchFile(DRIFT), scratch });
  assert.equal(r.red, true, JSON.stringify(r));
  assert.ok(!existsSync(scratch), 'the scratch worktree is removed');
  assert.match(readFileSync(join(dir, 'lib.mjs'), 'utf8'), /\/\/ wip/, 'the home tree was never touched');
});

test('readFailure: node:test summary lines are not counted twice; a CLI exits 0 red, 1 not red, 2 bad input', () => {
  const out = ['✖ refuses .. (2ms)', '  AssertionError [ERR_ASSERTION]: a path that leaves the dir is refused', '✖ failing tests:', '✖ refuses .. (2ms)'].join('\n');
  assert.deepEqual(readFailure(out).asserted, ['✖ refuses .. (2ms)', 'AssertionError [ERR_ASSERTION]: a path that leaves the dir is refused']);
  const { dir, sha } = repo();
  const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  const ok = cli('run', '--repo', dir, '--sha', sha, '--test', TEST, '--patch', patchFile(DRIFT));
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(JSON.parse(ok.stdout).proof_fields.method, 'test');
  assert.equal(cli('run', '--repo', dir, '--sha', sha, '--test', TEST, '--patch', patchFile(CRASH)).status, 1);
  const typo = cli('run', '--repo', dir, '--sha', sha, '--tset', TEST);
  assert.equal(typo.status, 2);
  assert.match(typo.stderr, /unknown flag\(s\) for run: --tset/);
});
