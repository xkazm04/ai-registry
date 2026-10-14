// node --test skills/lens-scan/tests
// Pins the steps scan (references/lens-manifest-scan.md) and onboarding's write (references/lens-onboarding.md):
// a script step's rows become static measurements with the manifest's unit, a metric the step does not yield is
// refused and never written, rows outside the scope are ignored, applicable:false lands on the map, {registry}
// with no checkout skips the step with a note; lens-add appends atomically, refuses a duplicate id and a taken look.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openStore, runStart, latest } from '../scripts/store.mjs';
import { main as structureMain, checkManifest, glyphPathProblem, takenLooks, lensMethod } from '../scripts/structure.mjs';
import { runScriptStep, manifestRegistryLocal, resolveRegistry, fillPlaceholders, classifyRows } from '../scripts/steps.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REGISTRY_LENS = JSON.parse(readFileSync(join(HERE, 'fixtures', 'registry-lens.manifest.json'), 'utf8'));
const SKILL_DIR = join(HERE, '..');

const BASE = (id, presentation, scan, fields) => ({
  $schema: 'lens-manifest/1', id, version: '1.0.0', name: id, reader: { density: 'simple' },
  fields: fields ?? [{ key: 'hits', label: 'Hits', type: 'integer', unit: 'hits', metric: { better: 'down', method: 'static' } }],
  health: { rules: [{ when: { field: 'hits', gt: 0 }, health: 'watch', reason: '{hits} hits' }], default: 'good', rollup: { method: 'worst-of' } },
  presentation, scan: scan ?? { method: 'judgement', instructions: 'Count hits.' },
});

/** A product dir with a structure holding a steps lens whose first step runs rows.mjs. */
function product({ run = 'node rows.mjs "{features}"', rows, extraSteps = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'lens-scan-steps-'));
  const lens = BASE('com.example.steps', { glyph: 'check', line: 'solid' }, { method: 'steps', steps: [{ kind: 'script', run, yields: ['hits', 'sites'] }, ...extraSteps] }, [
    { key: 'hits', label: 'Hits', type: 'integer', unit: 'hits', metric: { better: 'down', method: 'static' } },
    { key: 'sites', label: 'Sites', type: 'integer', unit: 'sites', metric: { better: 'down', method: 'static' } },
    { key: 'other', label: 'Other', type: 'integer', unit: 'x', metric: { better: 'down', method: 'judgement' } },
    { key: 'note', label: 'Note', type: 'string' },
  ]);
  const structure = {
    $schema: 'app-structure/3', version: 3, project: { slug: 'x', name: 'X' },
    features: [{ slug: 'a', name: 'A' }, { slug: 'b', name: 'B' }, { slug: 'c', name: 'C' }],
    lenses: [{ id: 'development', source: 'builtin', enabled: true, manifest: BASE('development', { glyph: 'brackets', line: 'comb' }) },
      { id: lens.id, source: 'project', enabled: true, manifest: lens }],
    facets: { b: { [lens.id]: { applicable: false, reason: 'old judgement', source: 'lens-scan' } } },
  };
  mkdirSync(join(root, '.ai', 'lens-scan'), { recursive: true });
  writeFileSync(join(root, '.ai', 'lens-scan', 'app-structure.json'), JSON.stringify(structure, null, 2));
  writeFileSync(join(root, 'rows.mjs'), `process.stdout.write(JSON.stringify(${JSON.stringify(rows ?? [])}.concat(process.argv[2] ? [{ feature: 'a', metric: 'sites', value: process.argv[2].split(',').length, evidence: 'features arg' }] : [])));\n`);
  const db = openStore(join(root, '.ai', 'lens-scan', 'scan.db'));
  return { root, lens, db, structurePath: join(root, '.ai', 'lens-scan', 'app-structure.json') };
}
const activities = (db, run) => db.prepare('SELECT kind, text FROM activity WHERE run_id = ? ORDER BY id').all(run).map((r) => ({ ...r }));

test('lens --id: a steps lens prints its steps and the numeric metric fields with their units; a built-in prints its fields too', () => {
  const m = lensMethod({ id: 'com.example.registry', source: 'project', manifest: REGISTRY_LENS });
  assert.equal(m.method, 'steps');
  assert.equal(m.steps.length, 3);
  assert.deepEqual(m.fields.map((f) => [f.key, f.unit]), [['registered', undefined], ['topicsMapped', 'topics'], ['judgedPct', '%'], ['deviations', 'pairs']]);
  const bad = { ...REGISTRY_LENS, scan: { method: 'steps', steps: [{ kind: 'skill', skill: 'forge' }] } };
  assert.deepEqual(lensMethod({ id: bad.id, manifest: bad }), { id: bad.id, enabled: true, method: 'invalid', why: 'step skill forge is not allowed' });
  const yieldsText = { ...REGISTRY_LENS, scan: { method: 'steps', steps: [{ kind: 'script', run: 'x', yields: ['name'] }] } };
  assert.match(lensMethod({ id: 'x.y.z', manifest: yieldsText }).why, /not a numeric metric field/);
  assert.equal(lensMethod({ id: 'operations', source: 'builtin', manifest: { ...REGISTRY_LENS, id: 'operations' } }).method, 'steps', 'operations has no built-in method: its scan block decides');
  assert.deepEqual(lensMethod({ id: 'development', manifest: BASE('development', { glyph: 'brackets', line: 'comb' }) }).fields.map((f) => f.unit), ['hits']);
});

test('steps: a script step writes static rows with the manifest unit; refuses a non-yielded metric; ignores out-of-scope rows; applicable:false lands on the map', () => {
  const rows = [
    { feature: 'a', metric: 'hits', value: 3, evidence: 'src/a.ts:4' },
    { feature: 'a', metric: 'other', value: 9 }, // a metric field the step does not yield
    { feature: 'a', metric: 'note', value: 1 }, // not in yields, not numeric
    { feature: 'b', metric: 'hits', value: 0 }, // b was not applicable: measuring it clears the mark
    { feature: 'c', applicable: false, reason: 'c has no registry topics' },
    { feature: 'zz', metric: 'hits', value: 1 }, // not in the scope at all
    { feature: 'a', metric: 'sites', value: 'many' },
  ];
  const p = product({ rows });
  const { id: run } = runStart(p.db, { phase: 'measure', lenses: p.lens.id });
  const out = runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root });
  assert.deepEqual(out, { lens: p.lens.id, step: 0, written: 2, not_applicable: ['c'], refused: 3, ignored: 1, structure_written: true });
  const got = latest(p.db, { lens: p.lens.id }).map((r) => [r.feature, r.metric, r.value, r.unit, r.method, r.evidence]);
  assert.deepEqual(got, [['a', 'hits', 3, 'hits', 'static', 'src/a.ts:4'], ['b', 'hits', 0, 'hits', 'static', 'node rows.mjs "{features}"']]);
  assert.equal(got.some((r) => r[1] === 'other' || r[1] === 'note'), false, 'a refused row is never written');
  const notes = activities(p.db, run).filter((x) => x.kind === 'note').map((x) => x.text);
  assert.equal(notes.filter((t) => t.includes('refused a row')).length, 3);
  assert.ok(notes.some((t) => /not in the step's yields/.test(t)));
  const s = JSON.parse(readFileSync(p.structurePath, 'utf8'));
  assert.deepEqual(s.facets.c[p.lens.id], { source: 'lens-scan', applicable: false, reason: 'c has no registry topics' });
  assert.equal(s.facets.b, undefined, 'a measured feature is no longer marked not applicable');
  assert.deepEqual(readdirSync(join(p.root, '.ai', 'lens-scan')).filter((f) => f.endsWith('.tmp')), [], 'atomic');
  p.db.close();
});

test('steps: {features} is the scope; the run scope is used when --scope is absent; an unknown slug is refused', () => {
  const p = product({ rows: [{ feature: 'b', metric: 'hits', value: 2 }] });
  const { id: run } = runStart(p.db, { phase: 'measure', lenses: p.lens.id, features: 'a,c', knownFeatures: new Set(['a', 'b', 'c']) });
  const out = runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root });
  assert.equal(out.written, 1, 'b is outside the run scope; a gets sites = 2 (the features arg named two slugs)');
  assert.deepEqual(latest(p.db, { lens: p.lens.id }).map((r) => [r.feature, r.metric, r.value]), [['a', 'sites', 2]]);
  assert.throws(() => runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root, scope: ['nope'] }), /unknown feature/);
  p.db.close();
});

test('steps: {registry} with no checkout skips the step with a note; a resolvable one is filled in', () => {
  const p = product({ run: 'node "{registry}/x.mjs"' });
  const { id: run } = runStart(p.db, { phase: 'measure', lenses: p.lens.id });
  const out = runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root, env: { AI_REGISTRY_DIR: join(p.root, 'missing') } });
  assert.deepEqual(out, { lens: p.lens.id, step: 0, skipped: 'no registry checkout', written: 0 });
  assert.ok(activities(p.db, run).some((x) => x.kind === 'note' && /no registry checkout/.test(x.text)));
  assert.equal(latest(p.db).length, 0);

  mkdirSync(join(p.root, 'reg'));
  writeFileSync(join(p.root, 'reg', 'x.mjs'), "process.stdout.write(JSON.stringify({ rows: [{ feature: 'a', metric: 'hits', value: 1 }] }));\n");
  mkdirSync(join(p.root, '.ai'), { recursive: true });
  writeFileSync(join(p.root, '.ai', 'manifest.yaml'), 'schema: ai-manifest\nregistry:\n  remote: github:x/y\n  local: ./reg   # this machine\nknowledge:\n  domains: [a]\n');
  assert.equal(resolveRegistry(p.root, {}), join(p.root, 'reg'));
  assert.equal(runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root, env: {} }).written, 1, 'a { rows } object is read too');
  p.db.close();
});

test('steps: a failing command is an error activity and nothing is written; non-script steps are the agent\'s', () => {
  const p = product({ run: 'node -e "process.exit(3)"', extraSteps: [{ kind: 'skill', skill: 'conform', budget: 6 }] });
  const { id: run } = runStart(p.db, { phase: 'measure', lenses: p.lens.id });
  assert.throws(() => runScriptStep({ lens: p.lens.id, step: 0, runId: run, root: p.root }), (e) => e.code === 1 && /exit 3/.test(e.message));
  assert.ok(activities(p.db, run).some((x) => x.kind === 'error'));
  assert.throws(() => runScriptStep({ lens: p.lens.id, step: 1, runId: run, root: p.root }), /skill step/);
  assert.throws(() => runScriptStep({ lens: p.lens.id, step: 5, runId: run, root: p.root }), /--step must be/);
  p.db.close();
});

test('steps helpers: placeholders, registry.local, row sorting', () => {
  assert.equal(fillPlaceholders('a {root} {structure} {features} {registry}', { root: 'R', structure: 'S', features: ['x', 'y'], registry: 'G' }), 'a R S x,y G');
  assert.equal(fillPlaceholders('{features}', { root: '', structure: '', features: [] }), '');
  assert.equal(manifestRegistryLocal('registry:\n  remote: r\n  local: "../ai-registry"\n'), '../ai-registry');
  assert.equal(manifestRegistryLocal('repo:\n  local: no\n'), undefined);
  const c = classifyRows([{ feature: 'a', metric: 'hits', value: 1 }, { feature: 'a', applicable: false, reason: 'r' }, { feature: 'a', applicable: false }],
    { lens: 'l', step: { yields: ['hits'] }, scope: new Set(['a']), fields: [{ key: 'hits', unit: 'hits' }], command: 'cmd' });
  assert.equal(c.measurements.length, 0, 'measured and not applicable in one output: the mark wins');
  assert.equal(c.refused.length, 2);
});

test('checkManifest: the fixture registry lens passes; ids by mode; the free icon rules; a taken look is refused', () => {
  assert.equal(checkManifest(REGISTRY_LENS, { mode: 'project' }), null);
  assert.match(checkManifest(REGISTRY_LENS, { mode: 'temporary' }), /tmp\./);
  assert.match(checkManifest({ ...REGISTRY_LENS, id: 'tmp.reg' }, { mode: 'project' }), /reverse-DNS/);
  assert.equal(checkManifest({ ...REGISTRY_LENS, id: 'tmp.reg' }, { mode: 'temporary' }), null);
  assert.equal(glyphPathProblem('M2 2 L14 14 M14 2 L2 14'), null);
  assert.match(glyphPathProblem('M2 2 l4 4 L8 8'), /relative/);
  assert.match(glyphPathProblem('M2 2 L18 4 L3 3'), /16x16 box/);
  assert.match(glyphPathProblem('M2 2 L8 8'), /fewer than 2/);
  assert.match(glyphPathProblem('M2 8 A6 6 0 0 1 14 8'), /fewer than 2/, 'one arc is one segment');
  assert.equal(glyphPathProblem('M2 8 A6 6 90 0 1 14 8 L8 14'), null, 'an arc radius or rotation is not a coordinate');
  const taken = takenLooks({ lenses: [{ id: 'quality', enabled: true, manifest: { presentation: { glyph: 'check', line: 'dimension' } } },
    { id: 'com.x.off', enabled: false, manifest: { presentation: { glyph: { path: 'M3 2 L3 14 M3 2 L10 2 L13 5 L10 8 L3 8 M8 8 L13 14' }, line: 'solid' } } },
    { id: 'com.x.on', enabled: true, manifest: { presentation: { glyph: { path: 'M3 2  L3 14 M3 2 L10 2 L13 5 L10 8 L3 8 M8 8 L13 14' }, line: 'solid' } } }] });
  assert.match(checkManifest(REGISTRY_LENS, { mode: 'project', taken }), /same glyph and line as com\.x\.on/, 'spacing does not hide a duplicate path; a disabled lens frees its look');
  assert.equal(checkManifest({ ...REGISTRY_LENS, presentation: { ...REGISTRY_LENS.presentation, line: 'dotted' } }, { mode: 'project', taken }), null, 'same glyph, other line: a different look');
  assert.match(checkManifest({ ...REGISTRY_LENS, scan: { method: 'steps', steps: [{ kind: 'skill', skill: 'harvest' }] } }, { mode: 'project' }), /^step skill harvest is not allowed$/);
});

test('lens-add: appends atomically with the blueprint entry shape; refuses a duplicate id, a bad manifest and a taken look', async () => {
  const p = product();
  p.db.close();
  const file = join(p.root, 'm.json');
  writeFileSync(file, JSON.stringify(REGISTRY_LENS));
  const before = JSON.parse(readFileSync(p.structurePath, 'utf8'));
  const out = await structureMain(['lens-add', '--structure', p.structurePath, '--manifest', file]);
  assert.equal(out.written, true);
  assert.equal(out.added.id, 'com.example.registry');
  const s = JSON.parse(readFileSync(p.structurePath, 'utf8'));
  const e = s.lenses.at(-1);
  assert.deepEqual(Object.keys(e), ['id', 'version', 'source', 'enabled', 'created_at', 'manifest']);
  assert.deepEqual([e.source, e.enabled, 'temporary' in e], ['project', true, false]);
  assert.deepEqual(s.lenses.slice(0, -1), before.lenses, 'the other lenses are kept as they were');
  assert.deepEqual(s.facets, before.facets);
  assert.deepEqual(readdirSync(join(p.root, '.ai', 'lens-scan')).filter((f) => f.endsWith('.tmp')), []);

  await assert.rejects(structureMain(['lens-add', '--structure', p.structurePath, '--manifest', file]), (err) => err.code === 1 && /already exists/.test(err.message));
  writeFileSync(file, JSON.stringify({ ...REGISTRY_LENS, id: 'com.example.registry-two' }));
  await assert.rejects(structureMain(['lens-add', '--structure', p.structurePath, '--manifest', file]), (err) => err.code === 2 && /same glyph and line/.test(err.message));
  writeFileSync(file, JSON.stringify({ ...REGISTRY_LENS, id: 'tmp.reg-check', presentation: { ...REGISTRY_LENS.presentation, line: 'double' } }));
  const tmp = await structureMain(['lens-add', '--structure', p.structurePath, '--manifest', file]);
  assert.equal(tmp.added.temporary, true, 'a tmp.<kebab> id is added as a temporary lens');
  writeFileSync(file, JSON.stringify({ ...REGISTRY_LENS, id: 'Registry' }));
  await assert.rejects(structureMain(['lens-add', '--structure', p.structurePath, '--manifest', file]), (err) => err.code === 2 && /reverse-DNS/.test(err.message));
  assert.equal(JSON.parse(readFileSync(p.structurePath, 'utf8')).lenses.length, 4, 'refusals write nothing');
});

test('onboarding: the contract file exists, SKILL.md references both new references, and is at least 1.3.0', () => {
  const skill = readFileSync(join(SKILL_DIR, 'SKILL.md'), 'utf8');
  assert.match(skill, /^version: 1\.([3-9]|\d{2,})\.\d+$/m);
  for (const ref of ['references/lens-onboarding.md', 'references/lens-manifest-scan.md']) {
    assert.ok(existsSync(join(SKILL_DIR, ref)), `${ref} exists`);
    assert.ok(skill.includes(`](${ref})`), `SKILL.md links ${ref}`);
  }
  const contract = readFileSync(join(SKILL_DIR, 'references', 'lens-onboarding.md'), 'utf8');
  for (const must of ['```lens-manifest', '--draft-only', 'lens-add', 'AT MOST 3', '16x16']) assert.ok(contract.includes(must), `the contract says ${must}`);
});
