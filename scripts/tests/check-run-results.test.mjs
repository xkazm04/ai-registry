// check-run-results: the run-results lane gate. Fixtures live in temp dirs and the script
// is pointed at them with --root, so nothing here depends on the real librarian/runs tree
// except the last test, which is the committed state the gate exists to hold.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateRunResult } from '../lib/run-result.mjs';

const SCRIPT = fileURLToPath(new URL('../check-run-results.mjs', import.meta.url));
const REAL_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const valid = (id) => ({
  schema: 'rkb-run-result/1',
  run_id: id,
  skill: 'librarian',
  skill_version: '1.0.0',
  mode: 'sweep',
  domain: 'software-engineering',
  started_at: '2026-10-01T10:00:00Z',
  ended_at: '2026-10-01T10:05:00Z',
  exit: 0,
  counts: { dispatched: 0, landed: 0, declined: 0, idled: 1, contended: 0 },
  subjects: [],
  verdicts: [],
  files: [],
  commits: [],
  pr: null,
  declined: [],
  failure_signature: null,
  notes: 'fixture',
});
// One undeclared top-level field: the "unknown fields are rejected" rule.
const invalid = (id) => ({ ...valid(id), surprise: true });

function fixture(t, results, listed) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'run-results-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const runs = path.join(root, 'librarian', 'runs');
  fs.mkdirSync(runs, { recursive: true });
  for (const [id, body] of Object.entries(results)) {
    fs.mkdirSync(path.join(runs, id), { recursive: true });
    fs.writeFileSync(path.join(runs, id, 'result.json'), JSON.stringify(body));
  }
  if (listed) fs.writeFileSync(path.join(runs, '.grandfathered.json'), JSON.stringify({ _note: 'fixture list', ids: listed }));
  return root;
}
const run = (root) => spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });

test('the fixtures mean what the tests say: valid validates, invalid does not', () => {
  assert.deepEqual(validateRunResult(valid('fixture-ok')), []);
  assert.ok(validateRunResult(invalid('fixture-bad')).length > 0);
});

test('an invalid result that is not on the list exits 1 and names the run', (t) => {
  const r = run(fixture(t, { 'run-good': valid('run-good'), 'run-bad': invalid('run-bad') }, []));
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /run-bad/);
  assert.doesNotMatch(r.stderr, /run-good/);
});

test('an invalid result that is on the list is grandfathered and exits 0', (t) => {
  const r = run(fixture(t, { 'run-good': valid('run-good'), 'run-bad': invalid('run-bad') }, ['run-bad']));
  assert.equal(r.status, 0, r.stderr);
});

test('a listed id that now validates exits 1 with "delist <id>"', (t) => {
  const r = run(fixture(t, { 'run-good': valid('run-good') }, ['run-good']));
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /delist run-good/);
});

test('a listed id whose result no longer exists exits 1 with "delist <id>"', (t) => {
  const r = run(fixture(t, { 'run-good': valid('run-good') }, ['run-gone']));
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /delist run-gone/);
});

test('a result that is not JSON is invalid, not a crash', (t) => {
  const root = fixture(t, { 'run-good': valid('run-good') }, []);
  fs.mkdirSync(path.join(root, 'librarian', 'runs', 'run-torn'));
  fs.writeFileSync(path.join(root, 'librarian', 'runs', 'run-torn', 'result.json'), '{ not json');
  const r = run(root);
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stderr, /run-torn/);
});

test('an empty lane exits 2: reporting nothing is not finding nothing', (t) => {
  const r = run(fixture(t, {}, []));
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /floor 1/);
});

test('a malformed allowlist exits 2, never a silent empty list', (t) => {
  const root = fixture(t, { 'run-good': valid('run-good') }, []);
  fs.writeFileSync(path.join(root, 'librarian', 'runs', '.grandfathered.json'), JSON.stringify({ ids: 'run-good' }));
  const r = run(root);
  assert.equal(r.status, 2, r.stderr);
});

test('an unknown flag exits 2', (t) => {
  const r = spawnSync(process.execPath, [SCRIPT, '--nope'], { encoding: 'utf8' });
  assert.equal(r.status, 2, r.stderr);
});

test('gate.mjs runs it in the librarian row and in --all', () => {
  const src = fs.readFileSync(new URL('../gate.mjs', import.meta.url), 'utf8');
  assert.match(src, /const RUN_RESULTS = step\('check-run-results\.mjs'\)/);
  assert.match(src, /librarian: \[[^\]]*\bRUN_RESULTS\b[^\]]*\]/);
  const all = /const ALL = \[([\s\S]*?)\];/.exec(src)[1];
  assert.match(all, /\bRUN_RESULTS\b/);
});

test('the real tree exits 0', () => {
  const r = run(REAL_ROOT);
  assert.equal(r.status, 0, r.stderr + r.stdout);
});
