// fleet-deps --min is a GATE: exit 0 must mean "every project is at or above the floor".
// Two ways it lied before this test existed: a misspelt --dep matched no project, `below`
// stayed empty and the floor "passed" over zero projects; and the fleet was resolved from
// process.cwd(), so the answer depended on where the operator stood. These cases run a COPY
// of the script inside a temp registry root holding a one-project fleet, and spawn it from a
// DIFFERENT, empty cwd, so nothing real is read and the root-resolution rule is exercised.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(fn) {
  const temp = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temp, 'fleet-deps-test-'));
  const elsewhere = fs.mkdtempSync(path.join(temp, 'fleet-deps-cwd-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'experiments'), { recursive: true });
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, 'experiments', 'fleet-deps.mjs'), path.join(root, 'scripts', 'experiments', 'fleet-deps.mjs'));
    fs.copyFileSync(path.join(SCRIPTS, 'lib', 'projects.mjs'), path.join(root, 'scripts', 'lib', 'projects.mjs'));
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({
      schema: 2, machines: { T: {} },
      projects: { solo: { checkouts: { T: 'work/solo' } } },
    }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    const solo = path.join(root, 'work', 'solo');
    fs.mkdirSync(solo, { recursive: true });
    fs.writeFileSync(path.join(solo, 'package.json'), JSON.stringify({ name: 'solo', dependencies: { next: '^16.3.0' } }));
    fs.writeFileSync(path.join(solo, 'package-lock.json'), JSON.stringify({
      lockfileVersion: 3,
      packages: { '': {}, 'node_modules/next': { version: '16.3.5' } },
    }));
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'experiments', 'fleet-deps.mjs'), ...args], { encoding: 'utf8', cwd: elsewhere });
    return fn({ run });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(elsewhere, { recursive: true, force: true });
  }
}

test('--dep typo with --min exits 2, never 0 (text and --json)', () => fixture(({ run }) => {
  const text = run('--dep', 'nxt', '--min', '1.0.0');
  assert.equal(text.status, 2, text.stdout + text.stderr);
  assert.match(text.stderr, /no project declares "nxt"/);
  const json = run('--dep', 'nxt', '--min', '1.0.0', '--json');
  assert.equal(json.status, 2, json.stdout + json.stderr);
}));

test('control: a real --dep over the floor exits 0, under the floor exits 1', () => fixture(({ run }) => {
  const ok = run('--dep', 'next', '--min', '16.3.3');
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /at or above next@16\.3\.3/);
  const low = run('--dep', 'next', '--min', '16.4.0');
  assert.equal(low.status, 1, low.stdout + low.stderr);
  assert.match(low.stdout, /BELOW FLOOR/);
}));

test('without --min a --dep typo is still a report, not a failure', () => fixture(({ run }) => {
  const r = run('--dep', 'nxt');
  assert.equal(r.status, 0, r.stdout + r.stderr);
}));

test('the fleet is resolved from the script root, not from process.cwd()', () => fixture(({ run }) => {
  // cwd is an empty directory with no projects.json; the script's own root holds the fleet.
  const r = run('--dep', 'next');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /solo/);
  assert.doesNotMatch(r.stderr, /resolves no projects/);
}));
