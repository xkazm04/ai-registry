// check-agent-guidance exit contract, against a throwaway registry with its own fleet bridge.
//
// The gate reports, per fleet project, whether the agent guidance reaches a session. A
// project whose checkout is not on this machine prints `(checkout not found)` and is skipped -
// a normal state on a secondary box - but until 2026-10-25 a fleet where EVERY named checkout
// was missing printed "every project's guidance reaches a session through one canonical file"
// and exited 0, a verdict over zero projects. Each case below plants one shape and asserts the
// exit code directly; the controls assert 0 and 1 so a gate red on everything also fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

/**
 * A registry copy holding the script, its libs and a bridge naming `present` (checkouts
 * that exist, as {slug: files}) and `missing` (slugs whose checkout is not on this machine).
 */
function registry(t, { present = {}, missing = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-agent-guidance-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/check-agent-guidance.mjs'), path.join(dir, 'scripts/check-agent-guidance.mjs'));
  const fleet = path.join(dir, 'fleet');
  const projects = {};
  for (const [slug, files] of Object.entries(present)) {
    for (const [rel, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(fleet, slug, rel)), { recursive: true });
      fs.writeFileSync(path.join(fleet, slug, rel), body);
    }
    projects[slug] = { checkouts: { box: slug } };
  }
  for (const slug of missing) projects[slug] = { checkouts: { box: slug } };
  fs.mkdirSync(fleet, { recursive: true });
  fs.writeFileSync(path.join(dir, '.machine.local.json'), JSON.stringify({ machine: 'box', root: fleet }));
  fs.writeFileSync(path.join(dir, 'projects.json'), JSON.stringify({ projects }));
  return (...args) => spawnSync(process.execPath, [path.join(dir, 'scripts/check-agent-guidance.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
}

const NATIVE = { 'AGENTS.md': '# a\n' };
const FORK = { 'CLAUDE.md': '# rules\n', 'AGENTS.md': '# commands\n- Test: x\n' };

test('every named checkout missing is could-not-run (exit 2), not a clean verdict', (t) => {
  const run = registry(t, { missing: ['gone', 'away'] });
  const r = run();
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /every project's guidance reaches a session/);
  assert.match(r.stderr, /walked 0/);
});

test('--project naming a slug whose checkout is missing is could-not-run (exit 2)', (t) => {
  const run = registry(t, { present: { here: NATIVE }, missing: ['gone'] });
  assert.equal(run('--project', 'gone').status, 2);
});

test('control: one present clean project beside a missing one exits 0 and says what it skipped', (t) => {
  const run = registry(t, { present: { here: NATIVE }, missing: ['gone'] });
  const r = run();
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /1 of 2 project\(s\) checked/);
  assert.match(r.stdout, /1 not on this machine/);
});

test('control: a FORK in a present project exits 1', (t) => {
  const run = registry(t, { present: { here: FORK }, missing: ['gone'] });
  assert.equal(run().status, 1);
});
