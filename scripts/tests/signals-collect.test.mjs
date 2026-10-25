// Tests for scripts/signals-collect.mjs - the operator-side writer of `signals/<contributor>.json`.
//
// `node --test scripts/tests/` - builtins only. Every run points --root at a fixture registry
// (its own projects.json, .machine.local.json and one consumer checkout), so the real fleet is
// never read and the real `signals/` lane is never written. The flag-set tests assert on the
// refusal MESSAGE as well as the exit code: exit 2 also means "no machine identity" here, and
// a test that only looked at the code would pass for the wrong reason.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../signals-collect.mjs', import.meta.url));
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

/** A registry root with a one-project fleet on machine Testbox whose contributor is `test-box`. */
function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-collect-'));
  made.push(base);
  const reg = path.join(base, 'registry');
  const proj = path.join(base, 'work', 'demo');
  fs.mkdirSync(reg, { recursive: true });
  fs.mkdirSync(path.join(proj, '.ai'), { recursive: true });
  fs.writeFileSync(path.join(reg, 'projects.json'), JSON.stringify({ schema: 2, machines: { Testbox: {} }, projects: { demo: { checkouts: { Testbox: 'work/demo' } } } }));
  fs.writeFileSync(path.join(reg, '.machine.local.json'), JSON.stringify({ machine: 'Testbox', root: base, contributor: 'test-box' }));
  fs.writeFileSync(path.join(proj, 'package.json'), JSON.stringify({ dependencies: { react: '^18.2.0' } }));
  return { reg, signals: path.join(reg, 'signals') };
}
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
const written = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);

test('--root folds the fixture fleet into that root\'s signals/ under the machine contributor', () => {
  const { reg, signals } = fixture();
  const r = run('--root', reg);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(written(signals), ['test-box.json']);
  const doc = JSON.parse(fs.readFileSync(path.join(signals, 'test-box.json'), 'utf8'));
  assert.equal(doc.contributor, 'test-box');
  assert.equal(doc.stack.react, 18, 'the fixture project\'s package.json was the one read');
});

test('--contributor in the space form is honoured, never dropped for the machine contributor', () => {
  const { reg, signals } = fixture();
  const spaced = run('--root', reg, '--contributor', 'other-c');
  assert.equal(spaced.status, 0, spaced.stdout + spaced.stderr);
  assert.deepEqual(written(signals), ['other-c.json'], 'the machine\'s test-box.json must not be written');
  const eq = run('--root', reg, '--contributor=third-c');
  assert.equal(eq.status, 0, eq.stdout + eq.stderr);
  assert.deepEqual(written(signals), ['other-c.json', 'third-c.json']);
});

test('an unknown flag exits 2 and writes nothing', () => {
  const { reg, signals } = fixture();
  const r = run('--root', reg, '--contributer', 'other-c');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /unknown argument "--contributer"/);
  assert.deepEqual(written(signals), []);
});

test('a value-flag with no value exits 2 and writes nothing', () => {
  const { reg, signals } = fixture();
  const noContributor = run('--root', reg, '--contributor');
  assert.equal(noContributor.status, 2, noContributor.stdout + noContributor.stderr);
  assert.match(noContributor.stderr, /--contributor needs a value/);
  const swallowed = run('--contributor', '--root', reg);
  assert.equal(swallowed.status, 2, swallowed.stdout + swallowed.stderr);
  assert.match(swallowed.stderr, /--contributor needs a value/);
  // A trailing --root must not fall back to this checkout's registry.
  const noRoot = run('--contributor=other-c', '--root');
  assert.equal(noRoot.status, 2, noRoot.stdout + noRoot.stderr);
  assert.match(noRoot.stderr, /--root needs a value/);
  assert.deepEqual(written(signals), []);
});

test('a contributor id that is not [a-z0-9-] exits 2 and writes nothing', () => {
  const { reg, signals } = fixture();
  const r = run('--root', reg, '--contributor', 'Not Valid');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /contributor id is required/);
  assert.deepEqual(written(signals), []);
});
