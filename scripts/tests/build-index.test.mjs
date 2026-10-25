// build-index's arguments. It read only `includes('--check')`, so every other argument -
// a typo'd `--chek`, an exploratory `--help` - was WRITE mode: an intake worker reported
// `--help` regenerating every bundle index inside a parallel wave (.claude/skills/intake/
// LESSONS.md). Now `--help` prints usage and writes nothing, and anything but `--check` is
// a usage error (2) before the lane is read. A copy of the script runs in a temp tree with
// no knowledge/ lane, so a run that got past argument parsing would say so.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-index-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(path.join(SCRIPTS, 'lib'), path.join(root, 'scripts', 'lib'), { recursive: true });
  fs.copyFileSync(path.join(SCRIPTS, 'build-index.mjs'), path.join(root, 'scripts', 'build-index.mjs'));
  return (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'build-index.mjs'), ...args], { encoding: 'utf8' });
}

test('--help prints usage and exits 0 without reading or writing the lane', (t) => {
  const r = fixture(t)('--help');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /usage: node scripts\/build-index\.mjs \[--check\]/);
});

for (const args of [['--chek'], ['--check', 'extra'], ['-c']]) {
  test(`${args.join(' ')} is a usage error (2), never a write`, (t) => {
    const r = fixture(t)(...args);
    assert.equal(r.status, 2, r.stdout);
    assert.match(r.stderr, /unknown argument/);
  });
}

test('control: --check alone gets past argument parsing (and here meets the empty lane)', (t) => {
  const r = fixture(t)('--check');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no knowledge\/ lane/);
});
