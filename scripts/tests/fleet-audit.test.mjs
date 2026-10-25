// fleet-audit --write-adopters rewrites catalog.json's per-skill `adopters` from what THIS
// machine can see. The fleet spans machines (projects.json `checkouts` is a map), so a
// project checked out only on another box is invisible here - and "invisible" must not be
// written as "not an adopter". These cases run a COPY of the script in a temp registry
// root with a fake two-machine fleet and a temp HOME, so nothing real is read or written.
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
  const root = fs.mkdtempSync(path.join(temp, 'fleet-audit-test-'));
  const here = path.join(root, 'work', 'here');
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    for (const f of ['fleet-audit.mjs', 'lib/skills-lane.mjs', 'lib/projects.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
    fs.mkdirSync(path.join(root, 'skills', 'alpha'), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', 'alpha', 'SKILL.md'), '---\nname: alpha\nversion: 1.0.0\ndescription: Fixture\n---\nFixture.\n');
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({
      schema: 2, machines: { T: {}, U: {} },
      projects: {
        here: { checkouts: { T: 'work/here' } },        // on this machine
        away: { checkouts: { U: 'elsewhere/away' } },   // only on another machine
        missing: { checkouts: { T: 'work/missing' } },  // declared here, not cloned
      },
    }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    fs.writeFileSync(path.join(root, 'catalog.json'), `${JSON.stringify({ skills: [{ name: 'alpha', adopters: ['away@link', 'gone@1.0.0', 'here@0.9.0', 'missing@link'] }] }, null, 2)}\n`);
    fs.mkdirSync(path.join(here, '.claude', 'skills'), { recursive: true });
    fs.symlinkSync(path.join(root, 'skills', 'alpha'), path.join(here, '.claude', 'skills', 'alpha'), process.platform === 'win32' ? 'junction' : 'dir');
    const home = path.join(root, 'home');
    fs.mkdirSync(home);
    const env = { ...process.env, HOME: home, USERPROFILE: home };
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'fleet-audit.mjs'), ...args], { encoding: 'utf8', env });
    fn({ root, run, adopters: () => JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8')).skills[0].adopters });
  } finally {
    const link = path.join(here, '.claude', 'skills', 'alpha');
    try { if (fs.lstatSync(link).isSymbolicLink()) fs.unlinkSync(link); } catch { /* absent */ }
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('fleet-audit-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('control: a project audited here gets its adopter entry recomputed from what is on disk', () => {
  fixture(({ run, adopters }) => {
    const r = run('--write-adopters', '--json');
    assert.equal(r.status, 0, r.stderr);
    assert.ok(adopters().includes('here@link'));
    assert.ok(!adopters().includes('here@0.9.0'), 'the stale entry for an audited project is replaced');
  });
});

test('--write-adopters keeps entries for projects this machine cannot see, and drops undeclared ones', () => {
  fixture(({ run, adopters }) => {
    const r = run('--write-adopters', '--json');
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(adopters(), ['away@link', 'here@link', 'missing@link']);
  });
});
