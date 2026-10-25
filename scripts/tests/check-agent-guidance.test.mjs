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

// `--project` with no value used to fall through to the whole fleet, and a slug the fleet
// does not hold blamed the machine ("no fleet project resolved on this machine").
test('--project with no value is a usage error (exit 2), not a whole-fleet run', (t) => {
  const run = registry(t, { present: { here: FORK } });
  const r = run('--project');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /--project needs a project slug/);
});

test('--project naming a slug the fleet does not hold says so (exit 2)', (t) => {
  const run = registry(t, { present: { here: NATIVE } });
  const r = run('--project', 'nope');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /"nope" is not a project in the fleet/);
  assert.match(r.stderr, /here/, 'the refusal lists the slugs it does know');
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

// A pointer AGENTS.md whose links go to `.claude/CLAUDE.md`. Shaped like the fleet's personas
// (a table of "you are touching / read" rows, and the sentence "This file points; it does not
// restate") with synthetic content. Until 2026-10-25 only a root CLAUDE.md link plus the word
// "canonical" counted as a pointer, so this shape read as FORK and failed the whole gate.
const DOT_CLAUDE_POINTER = {
  '.claude/CLAUDE.md': '# repo law\n\nCommands, gates and conventions live here.\n',
  'AGENTS.md': [
    '# AGENTS.md',
    '',
    'Instruction sources for any agent harness. This file points; it',
    'does not restate. Where a pointed-to file and this one disagree, the pointed-to file wins.',
    '',
    '| You are touching | Read |',
    '|---|---|',
    '| anything in this repo | `.claude/CLAUDE.md` (repo law) |',
    '| user-facing strings | `.claude/rules/i18n.md` |',
    '',
  ].join('\n'),
};
// Same files, but the AGENTS.md restates commands and merely mentions the file: a genuine fork.
const DOT_CLAUDE_FORK = {
  '.claude/CLAUDE.md': '# repo law\n',
  'AGENTS.md': '# commands\n\n- Test: npm test\n- Lint: npm run lint\n\nSee `.claude/CLAUDE.md` for more.\n',
};

test('a .claude/CLAUDE.md pointer that declares itself a pointer is not a FORK (exit 0)', (t) => {
  const run = registry(t, { present: { here: DOT_CLAUDE_POINTER } });
  const r = run();
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /here\s+pointer\s/);
});

test('a genuine fork beside .claude/CLAUDE.md stays FORK (exit 1)', (t) => {
  const run = registry(t, { present: { here: DOT_CLAUDE_FORK } });
  const r = run();
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /here\s+FORK\s/);
});

test('--self-test pins the pointer and fork shapes and reports its case count', (t) => {
  const run = registry(t, { present: { here: NATIVE } });
  const r = run('--self-test');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /self-test: (\d+)\/\1 topologies classified/);
});
