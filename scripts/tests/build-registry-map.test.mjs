// build-registry-map's default run WRITES each project's .ai/registry-map.json, and
// `--check` is the form other tools trust. These cases run a COPY of the script in a temp
// registry root over a one-project fake fleet, so nothing reaches a real checkout, and pin
// the arguments that used to widen or empty the run without saying so.
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
  const root = fs.mkdtempSync(path.join(temp, 'registry-map-test-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    for (const f of ['build-registry-map.mjs', 'lib/projects.mjs', 'lib/map-churn.mjs']) {
      fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
    }
    fs.mkdirSync(path.join(root, 'knowledge'));
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({ schema: 2, machines: { T: {} }, projects: { app: { checkouts: { T: 'work/app' } } } }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    const app = path.join(root, 'work', 'app');
    fs.mkdirSync(path.join(app, '.ai'), { recursive: true });
    fs.writeFileSync(path.join(app, '.ai', 'manifest.yaml'), 'knowledge:\n  domains: []\n');
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'build-registry-map.mjs'), ...args], { encoding: 'utf8' });
    fn({ root, app, run });
  } finally {
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('registry-map-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('control: --check over a resolvable project that has a problem is not a pass', () => {
  fixture(({ run }) => {
    const r = run('--check', '--project', 'app');
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /app: /);
  });
});

test('the messages name the mechanisms that exist: manifest domains, and the weak floor the code applies', () => {
  fixture(({ run }) => {
    const r = run('--check', '--project', 'app');
    // Domains come from the project's own manifest; the bridge's `domains` field was removed
    // (scripts/lib/projects.mjs, "Where domains come from"). Naming it sends a reader to edit
    // a file that is no longer read.
    assert.match(r.stderr, /app: \.ai\/manifest\.yaml declares no knowledge\.domains/);
    assert.doesNotMatch(r.stderr, /bridge/);
    // WEAK_FRACTION is 0.6, so "under half" understated the floor by ten points.
    assert.match(r.stdout, /scores under 60% of its own project median/);
    assert.doesNotMatch(r.stdout, /under half/);
  });
});

test('--check / --churn --project <slug this machine does not resolve> cannot pass', () => {
  fixture(({ run }) => {
    for (const mode of ['--check', '--churn']) {
      const r = run(mode, '--project', 'nosuch');
      assert.equal(r.status, 2, `${mode}: ${r.stdout}`);
      assert.match(r.stderr, /no project "nosuch" resolves on this machine/);
    }
  });
});

test('an unknown flag, or a value flag with no value, is refused before any project is read', () => {
  fixture(({ run }) => {
    for (const args of [['--dryrun'], ['--project'], ['--out'], ['--project', 'app', '--top']]) {
      const r = run(...args);
      assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}`);
      assert.match(r.stderr, /FATAL: /);
    }
  });
});

test('--help prints usage and builds nothing (it once rebuilt every map in the fleet)', () => {
  fixture(({ app, run }) => {
    const r = run('--help');
    assert.equal(r.status, 0);
    assert.match(r.stdout, /^usage: /);
    assert.equal(fs.existsSync(path.join(app, '.ai', 'registry-map.json')), false);
  });
});
