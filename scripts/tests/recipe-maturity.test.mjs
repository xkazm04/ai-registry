/**
 * The recipe maturity ladder (scripts/lib/recipe-maturity.mjs): the gate rule in
 * check-recipes.mjs, the report and `--apply` in scripts/recipe-maturity.mjs.
 *
 * Every case runs against a throwaway copy of the lane scripts and one or two real recipes,
 * never against the real lane: promotion is an adoption decision, and a test that wrote a
 * real recipe's status would be one. Evidence is planted as LESSONS.md entries and version
 * moves, exactly the fields the rule reads. No clock is read.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assess, parseLessonEntries, projectOf, MATURITY_RULE } from '../lib/recipe-maturity.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const A = 'recipes/software_engineering/engineering-records/skill-library-audit';
const B = 'recipes/creative_design/audio/audio-briefing-production';
const SCRIPTS = ['gate.mjs', 'check-recipes.mjs', 'render-recipes.mjs', 'build-recipes-index.mjs', 'recipe-maturity.mjs'];

function fixture(t) {
  const tmp = fs.realpathSync(os.tmpdir());
  const dir = fs.mkdtempSync(path.join(tmp, 'recipe-maturity-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  for (const f of SCRIPTS) fs.copyFileSync(path.join(ROOT, 'scripts', f), path.join(dir, 'scripts', f));
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const rel of [A, B]) fs.cpSync(path.join(ROOT, rel), path.join(dir, rel), { recursive: true });
  const node = (...args) => spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8' });
  const json = (rel) => JSON.parse(fs.readFileSync(path.join(dir, rel, 'recipe.json'), 'utf8'));
  const setJson = (rel, patch) => fs.writeFileSync(path.join(dir, rel, 'recipe.json'), `${JSON.stringify({ ...json(rel), ...patch }, null, 2)}\n`);
  const addLessons = (rel, ...heads) => fs.appendFileSync(path.join(dir, rel, 'LESSONS.md'), heads.map((h) => `\n## ${h}\n- planted fixture lesson\n`).join(''));
  const regenerate = () => {
    for (const g of ['render-recipes.mjs', 'build-recipes-index.mjs']) {
      const r = node(`scripts/${g}`);
      assert.equal(r.status, 0, `${g}: ${r.stderr}`);
    }
  };
  regenerate();
  return { dir, node, json, setJson, addLessons, regenerate };
}

test('the rule: maintenance entries are not use, a patch bump is not a craft change, proven needs projects, 1.0.0 and examples', () => {
  const L = (...h) => h.map((x) => `## ${x}\n- x`).join('\n');
  const fenced = '```markdown\n## 0.1.0 - 2026-01-01 - template\n```\n';
  assert.deepEqual(parseLessonEntries(fenced), [], 'a fenced template is not an entry');
  assert.equal(projectOf('gravitone-gcloud (second full run, judge calibration)'), 'gravitone-gcloud');
  const migrated = assess({ version: '0.3.1', status: 'seed', connector_types: ['x'] }, L(`0.3.0 - 2026-09-09 - ${MATURITY_RULE.REGISTRY_PROJECT}`), ['a.md']);
  assert.equal(migrated.supported, 'seed');
  assert.equal(migrated.evidence.maintenanceLessons, 1);
  assert.equal(migrated.evidence.useLessons, 0);
  const runs = L('0.1.0 - 2026-10-01 - acme', '0.1.0 - 2026-10-05 - acme');
  assert.equal(assess({ version: '0.1.9', status: 'seed' }, runs, []).supported, 'seed', 'patch bumps do not move the craft');
  assert.equal(assess({ version: '0.2.0', status: 'seed' }, runs, []).supported, 'maturing');
  const m = assess({ version: '1.0.0', status: 'proven', connector_types: ['x'] }, runs, ['a.md', 'b.md']);
  assert.equal(m.supported, 'maturing');
  assert.equal(m.declaredAboveEvidence, true);
  assert.match(m.missingForDeclared.join(' '), /2 distinct projects/);
  const two = L('0.1.0 - 2026-10-01 - acme', '0.1.0 - 2026-10-05 - globex');
  assert.equal(assess({ version: '1.0.0', status: 'proven', connector_types: ['x'] }, two, ['a.md', 'b.md']).supported, 'proven');
  assert.equal(assess({ version: '1.0.0', status: 'seed', connector_types: [] }, two, []).supported, 'proven', 'no connector type: the example threshold does not apply');
  assert.equal(assess({ version: '1.0.0', status: 'seed', connector_types: ['x'] }, two, ['a.md']).supported, 'maturing');
  assert.equal(assess({ version: '0.1.0', status: 'seed' }, null, []).missingForNext.length, 2);
});

test('check-recipes: proven or maturing without evidence is red, the missing evidence is named; backed status and seed are green', (t) => {
  const f = fixture(t);
  const check = () => f.node('scripts/check-recipes.mjs', '--shape-only');
  let r = check();
  assert.equal(r.status, 0, r.stdout + r.stderr);

  f.setJson(A, { status: 'proven' });
  r = check();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /status "proven" is above what the evidence in this directory supports \("seed"\)/);
  assert.match(r.stderr, /ai-registry maintenance entr/, 'the migration entry is named as not counting');

  f.setJson(A, { status: 'maturing' });
  r = check();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /status "maturing" is above .*missing for maturing: 2 dated LESSONS\.md entries/);

  // Plant the evidence maturing asks for: two use runs at 0.3.1, then a minor bump.
  f.addLessons(A, '0.3.1 - 2026-10-01 - acme', '0.3.1 - 2026-10-08 - acme (second run)');
  f.setJson(A, { status: 'maturing', version: '0.3.2' });
  r = check();
  assert.equal(r.status, 1, 'a patch bump past the used version is not a craft change');
  f.setJson(A, { status: 'maturing', version: '0.4.0' });
  r = check();
  assert.equal(r.status, 0, r.stdout + r.stderr);

  // Proven on maturing evidence is still red, and names what proven lacks.
  f.setJson(A, { status: 'proven' });
  r = check();
  assert.equal(r.status, 1);
  assert.match(r.stderr, /version at or above 1\.0\.0/);
  assert.match(r.stderr, /2 distinct projects \(has 1: acme\)/);

  // Below the evidence is fine: the gate does not nag about an unpromoted recipe.
  f.setJson(A, { status: 'seed' });
  assert.equal(check().status, 0);
});

test('recipe-maturity: summary, --json, --slug and exit codes', (t) => {
  const f = fixture(t);
  f.addLessons(A, '0.3.1 - 2026-10-01 - acme', '0.3.1 - 2026-10-08 - acme');
  f.setJson(A, { version: '0.4.0' });
  f.regenerate();

  let r = f.node('scripts/recipe-maturity.mjs');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /declared: {2}seed:2 maturing:0 proven:0/);
  assert.match(r.stdout, /supported: seed:1 maturing:1 proven:0/);
  assert.match(r.stdout, /skill-library-audit .*\n {2}declared seed, evidence supports maturing/);
  assert.doesNotMatch(r.stdout, /audio-briefing-production/, 'default output lists only recipes whose evidence differs');

  r = f.node('scripts/recipe-maturity.mjs', '--json');
  assert.equal(r.status, 0);
  const all = JSON.parse(r.stdout);
  assert.equal(all.recipes.length, 2);
  const a = all.recipes.find((x) => x.slug === 'skill-library-audit');
  assert.equal(a.supported, 'maturing');
  assert.equal(a.next, 'proven');
  assert.equal(a.evidence.useLessons, 2);
  assert.equal(a.evidence.maintenanceLessons, 1);

  r = f.node('scripts/recipe-maturity.mjs', '--slug', 'audio-briefing-production');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /declared seed, evidence supports seed/);
  assert.match(r.stdout, /missing for maturing:/);
  r = f.node('scripts/recipe-maturity.mjs', '--slug', 'audio-briefing-production', '--json');
  assert.equal(JSON.parse(r.stdout).supported, 'seed');

  assert.equal(f.node('scripts/recipe-maturity.mjs', '--slug', 'no-such-recipe').status, 2);
  assert.equal(f.node('scripts/recipe-maturity.mjs', '--bogus').status, 2);
  assert.equal(f.node('scripts/recipe-maturity.mjs', '--slug').status, 2);
  fs.rmSync(path.join(f.dir, 'recipes'), { recursive: true, force: true });
  assert.equal(f.node('scripts/recipe-maturity.mjs').status, 2, 'an unreadable lane is could-not-run');
});

test('recipe-maturity --apply: promotes with a patch bump, regenerates view and index, refuses unsupported slugs, never demotes', (t) => {
  const f = fixture(t);
  f.addLessons(A, '0.3.1 - 2026-10-01 - acme', '0.3.1 - 2026-10-08 - acme');
  f.setJson(A, { version: '0.4.0' });
  f.regenerate();
  const gate = () => f.node('scripts/gate.mjs', '--lane', 'recipes');
  assert.equal(gate().status, 0, 'fixture lane starts consistent');
  const snapshot = () => [A, B].map((rel) => fs.readFileSync(path.join(f.dir, rel, 'recipe.json'), 'utf8'));

  // All or nothing: one unsupported slug refuses the whole call.
  const before = snapshot();
  let r = f.node('scripts/recipe-maturity.mjs', '--apply', 'skill-library-audit', 'audio-briefing-production');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /audio-briefing-production: declared seed, evidence supports seed - nothing to promote/);
  assert.deepEqual(snapshot(), before, 'a refused apply writes nothing');
  assert.equal(f.node('scripts/recipe-maturity.mjs', '--apply', 'no-such-recipe').status, 2);
  assert.equal(f.node('scripts/recipe-maturity.mjs', '--apply').status, 2);

  r = f.node('scripts/recipe-maturity.mjs', '--apply', 'skill-library-audit');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /promoted skill-library-audit: seed -> maturing, version 0\.4\.0 -> 0\.4\.1/);
  const obj = f.json(A);
  assert.equal(obj.status, 'maturing');
  assert.equal(obj.version, '0.4.1');
  const view = fs.readFileSync(path.join(f.dir, A, 'RECIPE.md'), 'utf8');
  assert.match(view, /^status: maturing$/m);
  assert.match(view, /^version: 0\.4\.1$/m);
  const index = JSON.parse(fs.readFileSync(path.join(f.dir, 'recipes/index.json'), 'utf8'));
  assert.equal(index.recipes['skill-library-audit'].status, 'maturing');
  assert.equal(index.recipes['skill-library-audit'].version, '0.4.1');
  r = gate();
  assert.equal(r.status, 0, `view and index agree after apply: ${r.stdout}${r.stderr}`);

  // Already at its rung: refused, unchanged.
  r = f.node('scripts/recipe-maturity.mjs', '--apply', 'skill-library-audit');
  assert.equal(r.status, 1);
  assert.equal(f.json(A).version, '0.4.1');

  // Declared above its evidence: --apply refuses rather than demoting.
  f.setJson(A, { status: 'proven' });
  r = f.node('scripts/recipe-maturity.mjs', '--apply', 'skill-library-audit');
  assert.equal(r.status, 1);
  assert.equal(f.json(A).status, 'proven', 'never demotes');
});
