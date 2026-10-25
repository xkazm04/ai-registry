// surface-snapshot --diff. Its header promises exit 2 for an "unreadable snapshot", but it
// only checked that the file parsed: any JSON at all was flattened through `?? []`, so a
// wrong file (`{}`, a catalog, an index.json) diffed as an EMPTY surface. Two such files
// reported "surface unchanged", exit 0 - a false green from the instrument that exists to
// catch a dropped address - and one of them against the live tree reported every live
// address as "added". The script reads knowledge/ from its own location, so each case runs
// a copy of it over a one-bundle fixture.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t, { technique = '---\ntechnique: rule\nuse_when:\n  - a decision is near\n---\n# rule\n' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'surface-snapshot-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  fs.copyFileSync(path.join(SCRIPTS, 'surface-snapshot.mjs'), path.join(root, 'scripts', 'surface-snapshot.mjs'));
  fs.copyFileSync(path.join(SCRIPTS, 'lib', 'taxonomy.mjs'), path.join(root, 'scripts', 'lib', 'taxonomy.mjs'));
  const put = (rel, body) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  };
  put('knowledge/demo/taxonomy.json', JSON.stringify({
    schema: 'rkb-taxonomy/1', bundle: 'demo', layout: 'nested',
    categories: [{ id: 'core', title: 'Core', order: 1, subjects: ['topic'] }],
  }));
  put('knowledge/demo/_laws.md', '<a id="one-law"></a>\n**One law.**\n');
  put('knowledge/demo/core/topic/topic.md', '---\nsubject: topic\n---\n# topic\n');
  put('knowledge/demo/core/topic/techniques/rule.md', technique);
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'surface-snapshot.mjs'), ...args], { encoding: 'utf8', cwd: root });
  return { root, run, put };
}

test('control: a capture diffed against the live tree is unchanged (0)', (t) => {
  const { run } = fixture(t);
  assert.equal(run('--out', 'snap.json').status, 0);
  const r = run('--diff', 'snap.json');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /surface unchanged/);
});

for (const [label, body] of [['an empty object', '{}'], ['an array', '[]'], ['another schema', '{"schema":"rkb-taxonomy/1","bundles":[]}']]) {
  test(`${label} is not a snapshot: --diff exits 2 instead of diffing an empty surface`, (t) => {
    const { run, put } = fixture(t);
    put('a.json', body);
    put('b.json', body);
    for (const args of [['--diff', 'a.json', 'b.json'], ['--diff', 'a.json']]) {
      const r = run(...args);
      assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}`);
      assert.match(r.stderr, /is not an rkb-surface\/1 snapshot/);
    }
  });
}
