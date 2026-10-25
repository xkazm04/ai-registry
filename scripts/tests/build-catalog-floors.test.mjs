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

// The usage fold promises that one bad contributor file is skipped and named, never thrown
// on. A file that parses to a non-object (`null`, a number) used to reach `doc.contributor`
// and die with an uncaught TypeError - exit 1, which this repo reads as "violations".
test('a usage file that parses to a non-object is skipped and named, not a crash', (t) => {
  const dir = registry(t, { skill: true, bundle: true });
  fs.mkdirSync(path.join(dir, 'usage'));
  fs.writeFileSync(path.join(dir, 'usage', 'a-null.json'), 'null\n');
  fs.writeFileSync(path.join(dir, 'usage', 'b-number.json'), '7\n');
  fs.writeFileSync(path.join(dir, 'usage', 'c-good.json'), JSON.stringify({ contributor: 'box', windowDays: 30, skills: { demo: { invokes: 4 } } }));
  const w = run(dir);
  assert.equal(w.status, 0, w.stdout + w.stderr);
  assert.match(w.stdout + w.stderr, /usage\/a-null\.json[^\n]*skipped/);
  assert.match(w.stdout, /usage from 1 of 3 contributor file\(s\) — 2 skipped/);
  const demo = JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')).skills.find((s) => s.name === 'demo');
  assert.equal(demo.invokes30d, 4, 'the good contributor still counts');
});

// --check diagnosed only `bundles`; any other drift printed "the difference is elsewhere in
// the file (formatting or another key)" - true, and no help finding it.
test('--check names the top-level key and the skill that drifted', (t) => {
  const dir = registry(t, { skill: true, bundle: true });
  assert.equal(run(dir).status, 0);
  const file = path.join(dir, 'catalog.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  doc.skills[0].category = 'hand-edited';
  fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
  const r = run(dir, '--check');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /differing key\(s\): skills/);
  assert.match(r.stderr, /skills\[demo\]: category/);
});

// Only `--check` was read; `--chek` or `--help` rewrote catalog.json.
test('an unknown argument is a usage error (2) and writes nothing; --help prints usage (0)', (t) => {
  const dir = registry(t, { skill: true, bundle: true });
  for (const args of [['--chek'], ['--check', 'now']]) {
    const r = run(dir, ...args);
    assert.equal(r.status, 2, `${args}: ${r.stdout}`);
    assert.match(r.stderr, /unknown argument/);
    assert.match(r.stderr, /usage: node scripts\/build-catalog\.mjs \[--check\]/);
  }
  const h = run(dir, '--help');
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/build-catalog\.mjs \[--check\]/);
  assert.equal(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'), '{}\n', 'catalog.json untouched');
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

// generatedAt used to be carried forward from the previous catalog and sat frozen at
// 2026-08-18 while consumers read it as "when was this built". It is now the newest instant
// in committed data (a subject changedAt, a usage report generatedAt, a run ts, a LESSONS
// heading date): deterministic, so --check stays a pure function of the tree, and it works
// in a depth-1 clone because no git is consulted.
const FROZEN = '2026-08-18T00:00:00Z';
const frozenCatalog = `${JSON.stringify({ generatedAt: FROZEN }, null, 2)}\n`;
const writeIndex = (dir, changedAts) => {
  const subjects = Object.fromEntries(changedAts.map((c, i) => [`s${i}`, { file: `knowledge/demo/s${i}/s${i}.md`, changedAt: c }]));
  fs.writeFileSync(path.join(dir, 'knowledge/demo/index.json'), JSON.stringify({ meta: { subjects: 0, techniques: 0, applications: 0 }, subjects }));
};
const stamp = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')).generatedAt;

test('generatedAt: a newer subject changedAt moves it off the frozen carried-forward value', (t) => {
  const dir = registry(t, { catalog: frozenCatalog, skill: true, bundle: true });
  writeIndex(dir, ['2026-09-01', '2026-10-23', '2026-10-02']);
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), '2026-10-23T00:00:00Z');
  writeIndex(dir, ['2026-09-01', '2026-10-24']);
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), '2026-10-24T00:00:00Z', 'a newer changedAt must move it');
});

test('generatedAt: the newest of changedAt, usage report and LESSONS heading wins; --check is pure', (t) => {
  const dir = registry(t, { catalog: frozenCatalog, skill: true, bundle: true });
  writeIndex(dir, ['2026-09-01']);
  fs.mkdirSync(path.join(dir, 'usage'));
  fs.writeFileSync(path.join(dir, 'usage/box.json'), JSON.stringify({ contributor: 'box', windowDays: 30, generatedAt: '2026-09-10T08:00:00Z', skills: {} }));
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), '2026-09-10T08:00:00Z', 'usage report beats the older changedAt');
  fs.writeFileSync(path.join(dir, 'skills/demo/LESSONS.md'), '# Lessons\n\n## 1.0.0 - 2026-09-20 - proj\nbody\n');
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), '2026-09-20T00:00:00Z', 'a LESSONS heading date beats the usage report');
  // An unchanged tree rebuilds to the same value and checks fresh, whatever the clock says.
  const again = run(dir, '--check');
  assert.equal(again.status, 0, again.stdout + again.stderr);
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), '2026-09-20T00:00:00Z');
});

test('generatedAt: with no dated evidence anywhere the committed value is kept, not invented', (t) => {
  const dir = registry(t, { catalog: frozenCatalog, skill: true, bundle: true });
  { const r = run(dir); assert.equal(r.status, 0, r.stdout + r.stderr); }
  assert.equal(stamp(dir), FROZEN);
});
