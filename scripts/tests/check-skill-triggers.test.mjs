// check-skill-triggers --strict exit contract, against a throwaway registry.
//
// The report floors are tunable from the environment (TRIGGER_FLOOR, TRIGGER_MIN_SHARED) so an
// operator can widen or narrow what is PRINTED. Until 2026-10-25 the --strict verdict was read
// off the printed list, so the same knobs disarmed the gate: TRIGGER_FLOOR=0.99 hid a 0.60
// collision, and a non-numeric value (NaN) hid every collision - each with exit 0. Each case
// plants a known collision and asserts the exit code directly; the control asserts 0.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

const skill = (name, description) => `---\nname: ${name}\ndescription: "${description}"\ncategory: other\nmemory: none\nversion: 1.0.0\n---\n\n# ${name}\n`;

function registry(t, skills) {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-skill-triggers-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/check-skill-triggers.mjs'), path.join(dir, 'scripts/check-skill-triggers.mjs'));
  for (const [name, description] of Object.entries(skills)) {
    fs.mkdirSync(path.join(dir, 'skills', name), { recursive: true });
    fs.writeFileSync(path.join(dir, 'skills', name, 'SKILL.md'), skill(name, description));
  }
  return (args, env = {}) => spawnSync(process.execPath, [path.join(dir, 'scripts/check-skill-triggers.mjs'), ...args], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, TRIGGER_FLOOR: '', TRIGGER_MIN_SHARED: '', ...env },
  });
}

const COLLIDING = {
  'release-notes': 'Draft release notes from merged pull requests, changelog entries and version tags for a release.',
  'changelog-writer': 'Write changelog entries from merged pull requests and version tags before each release.',
};
const DISTINCT = {
  'release-notes': 'Draft release notes from merged pull requests, changelog entries and version tags for a release.',
  'gpu-profiler': 'Profile shader occupancy, memory bandwidth and frame pacing on a graphics card under load.',
};

test('control: --strict fails a planted collision and passes distinct skills', (t) => {
  const r = registry(t, COLLIDING)(['--strict']);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /COLLISION/);
  assert.equal(registry(t, DISTINCT)(['--strict']).status, 0);
});

test('a raised TRIGGER_FLOOR narrows the report but cannot disarm --strict', (t) => {
  const run = registry(t, COLLIDING);
  const r = run(['--strict'], { TRIGGER_FLOOR: '0.99' });
  assert.equal(r.status, 1, r.stdout);
  assert.equal(run(['--strict'], { TRIGGER_MIN_SHARED: '999' }).status, 1);
});

test('a non-numeric or out-of-range floor is a usage error (exit 2), not an empty report', (t) => {
  const run = registry(t, COLLIDING);
  for (const env of [{ TRIGGER_FLOOR: 'abc' }, { TRIGGER_FLOOR: '1.5' }, { TRIGGER_MIN_SHARED: 'many' }]) {
    const r = run([], env);
    assert.equal(r.status, 2, `${JSON.stringify(env)}: ${r.stdout}`);
  }
});

test('an unknown argument exits 2 before any read (a typo of --strict must not run advisory); --help exits 0', (t) => {
  const go = registry(t, COLLIDING);
  assert.equal(go([]).status, 0, 'plain advisory run keeps its current exit');
  for (const bad of [['--bogus'], ['--strct'], ['--strict=1'], ['--since', 'x'], ['extra'], ['--strict', '--bogus']]) {
    const r = go(bad);
    assert.equal(r.status, 2, `${bad.join(' ')} -> ${r.status}: ${r.stdout}${r.stderr}`);
  }
  const h = go(['--help']);
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/check-skill-triggers\.mjs/);
});
