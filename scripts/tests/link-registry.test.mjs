// link-registry writes into every connected project, so its arguments decide how much of
// the fleet a run touches. These cases run a COPY of the script in a temp registry root
// with a one-project fake fleet, so a regression writes into the temp tree and never into
// a real checkout. The 2026-09-14 lesson (`--help` relinked every project) is the class:
// an argument the script does not understand must stop the run, not widen it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(fn) {
  const temp = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temp, 'link-registry-test-'));
  const app = path.join(root, 'work', 'app');
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    for (const f of ['link-registry.mjs', 'lib/projects.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
    fs.mkdirSync(path.join(root, 'skills', 'alpha'), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', 'alpha', 'SKILL.md'), '---\nname: alpha\nversion: 1.0.0\n---\nFixture.\n');
    fs.mkdirSync(path.join(root, 'rules'));
    fs.writeFileSync(path.join(root, 'rules', 'ai-registry-access.md'), 'access rule\n');
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({ schema: 2, machines: { T: {} }, projects: { app: { checkouts: { T: 'work/app' } } } }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    fs.mkdirSync(path.join(app, '.ai'), { recursive: true });
    fs.writeFileSync(path.join(app, '.ai', 'manifest.yaml'), 'skills:\n  - alpha\n');
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'link-registry.mjs'), ...args], { encoding: 'utf8' });
    fn({ root, app, run });
  } finally {
    // Unlink discovery links first: never recurse through a link on Windows.
    const link = path.join(app, '.claude', 'skills', 'alpha');
    try { if (fs.lstatSync(link).isSymbolicLink()) fs.unlinkSync(link); } catch { /* absent */ }
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('link-registry-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('control: --check fails on an unlinked project, a run links it, and --check then passes', () => {
  fixture(({ app, run }) => {
    const failed = run('--check');
    assert.equal(failed.status, 1);
    // The verdict line names the script that ran (it said `link-skills`, a name no file has).
    assert.match(failed.stderr, /link-registry --check FAILED/);
    const linked = run('--project', 'app');
    assert.equal(linked.status, EXIT.OK, linked.stderr);
    assert.ok(fs.lstatSync(path.join(app, '.claude', 'skills', 'alpha')).isSymbolicLink());
    const ok = run('--check', '--project', 'app');
    assert.equal(ok.status, EXIT.OK, ok.stderr);
  });
});

test('an unknown flag is refused before anything is written', () => {
  fixture(({ app, run }) => {
    const r = run('--chek');
    assert.equal(r.status, EXIT.FATAL, r.stdout);
    assert.match(r.stderr, /unknown argument --chek/);
    assert.equal(fs.existsSync(path.join(app, '.claude')), false, 'a typo must not relink the fleet');
  });
});

test('--project with no slug is refused, not read as "every project"', () => {
  fixture(({ app, run }) => {
    const r = run('--project');
    assert.equal(r.status, EXIT.FATAL, r.stdout);
    assert.match(r.stderr, /--project needs a slug/);
    assert.equal(fs.existsSync(path.join(app, '.claude')), false);
  });
});

test('--check --project <slug the fleet does not resolve> cannot pass', () => {
  fixture(({ run }) => {
    const r = run('--check', '--project', 'nosuch');
    assert.equal(r.status, EXIT.FATAL, r.stdout);
    assert.match(r.stderr, /no project "nosuch" resolves on this machine/);
  });
});
