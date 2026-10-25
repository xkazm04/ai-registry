// build-catalog's could-not-run floors. The 2026-10-25 gates probe found an empty skills
// lane written as `skills: []` with exit 0, and an unparseable catalog.json crashing with
// exit 1 (this repo's "violations" code). Both are broken preconditions: exit 2, in check
// AND write mode, and nothing written. The script resolves its lanes from its own
// location, so each case runs a copy of it in a temp registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

function registry(t, { catalog = '{}\n', skill = false, bundle = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-floor-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/build-catalog.mjs'), path.join(dir, 'scripts/build-catalog.mjs'));
  fs.mkdirSync(path.join(dir, 'knowledge'));
  fs.mkdirSync(path.join(dir, 'skills'));
  if (skill) {
    fs.mkdirSync(path.join(dir, 'skills/demo'));
    fs.writeFileSync(path.join(dir, 'skills/demo/SKILL.md'), '---\nname: demo\nversion: 1.0.0\ndescription: a demo\n---\n\n# Demo\n');
  }
  if (bundle) {
    fs.mkdirSync(path.join(dir, 'knowledge/demo'));
    fs.writeFileSync(path.join(dir, 'knowledge/demo/index.json'), JSON.stringify({ meta: { subjects: 0, techniques: 0, applications: 0 }, subjects: {} }));
    fs.writeFileSync(path.join(dir, 'identity-aliases.json'), JSON.stringify({ schema: 1 }));
  }
  fs.writeFileSync(path.join(dir, 'catalog.json'), catalog);
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [path.join(dir, 'scripts/build-catalog.mjs'), ...args], { encoding: 'utf8' });

test('clean control: one skill and one bundle build (exit 0), then check fresh (exit 0)', (t) => {
  const dir = registry(t, { skill: true, bundle: true });
  const w = run(dir);
  assert.equal(w.status, 0, w.stdout + w.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')).skills.length, 1);
  const c = run(dir, '--check');
  assert.equal(c.status, 0, c.stdout + c.stderr);
});

for (const mode of [[], ['--check']]) {
  const label = mode.length ? 'check' : 'write';
  test(`an empty skills lane exits 2 in ${label} mode and writes nothing`, (t) => {
    const dir = registry(t);
    const r = run(dir, ...mode);
    assert.equal(r.status, 2, r.stdout);
    assert.match(r.stderr, /walked 0 skills/);
    assert.equal(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'), '{}\n');
  });
  test(`an empty knowledge lane exits 2 in ${label} mode`, (t) => {
    const dir = registry(t, { skill: true });
    const r = run(dir, ...mode);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /walked 0 bundles/);
  });
  test(`an unparseable catalog.json exits 2 in ${label} mode`, (t) => {
    const dir = registry(t, { catalog: '{"skills": [', skill: true });
    const r = run(dir, ...mode);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /catalog\.json does not parse/);
  });
}
