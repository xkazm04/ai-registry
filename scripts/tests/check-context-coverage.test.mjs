// check-context-coverage reads every project on this machine; `--project` and `--uncovered`
// each name ONE. The two must agree on what an unknown slug is. These cases run a COPY of
// the script in a temp registry root over a one-project fake fleet.
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
  const root = fs.mkdtempSync(path.join(temp, 'context-coverage-test-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
    for (const f of ['check-context-coverage.mjs', 'lib/projects.mjs', 'lib/exit-codes.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
    fs.writeFileSync(path.join(root, 'projects.json'), JSON.stringify({ schema: 2, machines: { T: {} }, projects: { app: { checkouts: { T: 'work/app' } } } }));
    fs.writeFileSync(path.join(root, '.machine.local.json'), JSON.stringify({ machine: 'T', root }));
    fs.mkdirSync(path.join(root, 'work', 'app'), { recursive: true });
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'check-context-coverage.mjs'), ...args], { encoding: 'utf8' });
    fn({ run, app: path.join(root, 'work', 'app') });
  } finally {
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('context-coverage-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('control: --project <a resolvable slug> reports that project', () => {
  fixture(({ run }) => {
    const r = run('--project', 'app', '--json');
    assert.equal(r.status, EXIT.OK, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout).map((x) => x.slug), ['app']);
  });
});

test('a non-ASCII file name is counted as the file it is, not as a quoted string', () => {
  fixture(({ run, app }) => {
    // git ls-files quotes such names by default ("caf\303\251.ts"), which matched neither the
    // source pattern nor the context's claim: the file left the denominator and the claim
    // read as a dead path.
    const git = (...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-C', app, ...a], { encoding: 'utf8' });
    git('init', '-q');
    fs.writeFileSync(path.join(app, 'café.ts'), 'export const x = 1;\n');
    fs.writeFileSync(path.join(app, 'plain.ts'), 'export const y = 1;\n');
    fs.writeFileSync(path.join(app, 'context-map.json'), JSON.stringify({ contexts: [{ name: 'c', file_paths: ['café.ts', 'plain.ts'] }] }));
    git('add', '-A');
    const r = run('--project', 'app', '--json');
    assert.equal(r.status, EXIT.OK, r.stderr);
    const [row] = JSON.parse(r.stdout);
    assert.deepEqual({ source: row.source, covered: row.covered, dead: row.dead }, { source: 2, covered: 2, dead: 0 });
  });
});

test('--project <slug this machine does not resolve> is refused, as --uncovered already was', () => {
  fixture(({ run }) => {
    assert.equal(run('--uncovered', 'nosuch').status, EXIT.FATAL, 'the sibling flag this one must agree with');
    for (const args of [['--project', 'nosuch'], ['--project', 'nosuch', '--json']]) {
      const r = run(...args);
      assert.equal(r.status, EXIT.FATAL, `${args.join(' ')}: ${r.stdout}`);
      assert.match(r.stderr, /no project "nosuch" resolves on this machine/);
    }
  });
});
