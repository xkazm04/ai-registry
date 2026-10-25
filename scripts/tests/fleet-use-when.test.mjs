// fleet-use-when defaulted to --propose, which calls a model endpoint for every technique, so
// a missing mode flag or a typo (`--aply`) silently started a paid dispatch. These cases run a
// COPY of the script in a temp registry root holding one technique with no use_when (the
// worklist is therefore non-empty and --propose WOULD dispatch). Network dispatch is made
// impossible twice over: FLEET_ENDPOINT points at a closed localhost port (discard, 9), and
// the copied lib/fleet.mjs is a stub whose dispatch() only writes a sentinel file. A refused
// invocation must exit 2 with the sentinel, the checkpoint and the proposals file all absent;
// the --propose control must reach the stub, so the sentinel check can actually go red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const STUB_FLEET = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const extractJson = () => null;
export async function dispatch({ items }) {
  fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'DISPATCH-STARTED'), String(items.length));
  return [];
}
`;

function fixture(fn) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'fleet-use-when-test-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'experiments'), { recursive: true });
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, 'experiments', 'fleet-use-when.mjs'), path.join(root, 'scripts', 'experiments', 'fleet-use-when.mjs'));
    fs.copyFileSync(path.join(SCRIPTS, 'lib', 'taxonomy.mjs'), path.join(root, 'scripts', 'lib', 'taxonomy.mjs'));
    fs.writeFileSync(path.join(root, 'scripts', 'lib', 'fleet.mjs'), STUB_FLEET);
    const subj = path.join(root, 'knowledge', 'dom', 'subj');
    fs.mkdirSync(path.join(subj, 'techniques'), { recursive: true });
    fs.writeFileSync(path.join(subj, 'subj.md'), '---\nsubject: Subj\n---\nBody.\n');
    fs.writeFileSync(path.join(subj, 'techniques', 'tech.md'), '---\nname: tech\n---\nBody.\n');
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'experiments', 'fleet-use-when.mjs'), ...args], {
      encoding: 'utf8',
      cwd: root,
      timeout: 30000,
      env: { ...process.env, FLEET_ENDPOINT: 'http://127.0.0.1:9', FLEET_API_KEY: '' },
    });
    const left = () => fs.readdirSync(root).filter((n) => n === 'DISPATCH-STARTED' || n.startsWith('fleet-use-when.proposals'));
    return fn({ run, left });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('no mode flag exits 2 before any dispatch or file write', () => fixture(({ run, left }) => {
  const r = run();
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /exactly one of --propose, --review, --apply/);
  assert.deepEqual(left(), []);
}));

test('a mode typo (--aply) exits 2 before any dispatch or file write', () => fixture(({ run, left }) => {
  const r = run('--aply');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /got none/);
  assert.deepEqual(left(), []);
}));

test('two modes at once exit 2 before any dispatch or file write', () => fixture(({ run, left }) => {
  const r = run('--propose', '--apply');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.deepEqual(left(), []);
}));

test('control: --propose still reaches dispatch (the sentinel check can go red)', () => fixture(({ run, left }) => {
  const r = run('--propose');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(left().includes('DISPATCH-STARTED'), 'the stub dispatch must have been reached');
}));

test('control: --review runs without dispatching', () => fixture(({ run, left }) => {
  const r = run('--review');
  assert.notEqual(r.status, 2, r.stdout + r.stderr);
  assert.ok(!left().includes('DISPATCH-STARTED'));
}));
