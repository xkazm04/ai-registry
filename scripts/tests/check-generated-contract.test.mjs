// check-generated-contract: the fields other repositories read out of our generated files.
// Every verdict is proven on a fixture tree through the CLI (exit code + message), plus the
// recorded incident (laws techniques dropped from a knowledge index) on a copy of a real index.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { derive, presence, splitPath, shapeHints, check, applyAdditions, SCHEMA } from '../check-generated-contract.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-generated-contract.mjs');
const CONTRACT = 'contract.json';

function run(args, cwd = ROOT) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-contract-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const write = (rel, obj) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), typeof obj === 'string' ? obj : `${JSON.stringify(obj, null, 2)}\n`);
  };
  const read = (rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
  const cli = (...args) => run(['--root', dir, '--contract', CONTRACT, ...args]);
  return { dir, write, read, cli };
}

const CATALOG = () => ({
  registry: { fullName: 'acme/registry' },
  skills: [
    { name: 'a', invokes30d: 3, usageContributors: ['x'], note: 'n' },
    { name: 'b', invokes30d: 0, usageContributors: [] },
  ],
  bundles: [{ name: 'demo', contentHash: 'sha256:aa' }],
});

/** Seed a contract from the fixture tree, then attribute consumers. */
function seeded(f, catalog = CATALOG()) {
  f.write('catalog.json', catalog);
  f.write(CONTRACT, { schema: SCHEMA, files: { 'catalog.json': { fields: {} } } });
  const w = f.cli('--write');
  assert.equal(w.code, 0, w.err);
  const c = f.read(CONTRACT);
  const fields = c.files['catalog.json'].fields;
  fields['skills[].invokes30d'].consumers = ['personas'];
  fields['bundles[].contentHash'].consumers = ['personas', 'gravitone-gcloud'];
  f.write(CONTRACT, c);
  return c;
}

test('the real tree satisfies the committed contract, and the self-test sees a planted drop', () => {
  const r = run([]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /generated contract OK: \d+ declared path\(s\) over 5 glob\(s\)/);
  const s = run(['--self-test']);
  assert.equal(s.code, 0, s.err);
  assert.match(s.out, /laws\{\}\.techniques is absent - read by self-test-consumer/);
});

test('the committed contract covers every generated JSON file', () => {
  const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'contracts', 'generated-fields.json'), 'utf8'));
  assert.deepEqual(Object.keys(c.files).sort(), [
    '.claude-plugin/marketplace.json', 'catalog.json', 'knowledge/*/index.json', 'publications/index.json', 'recipes/index.json',
  ]);
});

test('a dropped declared field exits 1 and names its consumer', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  for (const s of cat.skills) delete s.invokes30d;
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /skills\[\]\.invokes30d is absent - read by personas/);
});

test('a field dropped from only some elements is a violation (partial)', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  delete cat.skills[1].invokes30d;
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /skills\[\]\.invokes30d is missing on 1 of 2 objects - read by personas/);
});

test('a renamed field exits 1 naming the old field\'s consumers, and notes the new name', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  for (const b of cat.bundles) { b.hash = b.contentHash; delete b.contentHash; }
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /bundles\[\]\.contentHash is absent - read by personas, gravitone-gcloud/);
  assert.match(r.out, /note: catalog\.json: bundles\[\]\.hash \(string\) is not declared/);
});

test('a changed type exits 1 and names the consumers', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  cat.skills[0].invokes30d = '3';
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /skills\[\]\.invokes30d is string\|number, contract says number - read by personas/);
});

test('an added field exits 0 with a note; --write declares it with no consumers', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  cat.skills[0].fresh = true;
  cat.skills[1].fresh = false;
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /note: catalog\.json: skills\[\]\.fresh \(boolean\) is not declared/);
  assert.equal(f.cli('--write').code, 0);
  assert.deepEqual(f.read(CONTRACT).files['catalog.json'].fields['skills[].fresh'], { type: 'boolean', consumers: [] });
});

test('an optional field (seeded from present-on-some) may be absent everywhere; a wrong type still fails', (t) => {
  const f = fixture(t);
  const c = seeded(f);
  assert.equal(c.files['catalog.json'].fields['skills[].note'].optional, true);
  const cat = CATALOG();
  delete cat.skills[0].note;
  f.write('catalog.json', cat);
  assert.equal(f.cli().code, 0);
  cat.skills[0].note = 7;
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /skills\[\]\.note is number, contract says string/);
});

test('an empty container is vacuous: its element fields are not "absent"', (t) => {
  const f = fixture(t);
  seeded(f);
  const cat = CATALOG();
  for (const s of cat.skills) s.usageContributors = [];
  f.write('catalog.json', cat);
  const r = f.cli();
  assert.equal(r.code, 0, r.err);
});

test('a glob that matches no file, and a contract that does not parse, exit 2', (t) => {
  const f = fixture(t);
  seeded(f);
  const c = f.read(CONTRACT);
  c.files['knowledge/*/index.json'] = { fields: {} };
  f.write(CONTRACT, c);
  const r = f.cli();
  assert.equal(r.code, 2);
  assert.match(r.err, /glob knowledge\/\*\/index\.json matches no file/);
  f.write(CONTRACT, '{ not json');
  const p = f.cli();
  assert.equal(p.code, 2);
  assert.match(p.err, /does not parse/);
  f.write(CONTRACT, { schema: SCHEMA, files: { 'catalog.json': { fields: { x: { type: 'text', consumers: [] } } } } });
  assert.equal(f.cli().code, 2);
});

test('a generated file that does not parse is could-not-run, not a verdict', (t) => {
  const f = fixture(t);
  seeded(f);
  f.write('catalog.json', '{ broken');
  const r = f.cli();
  assert.equal(r.code, 2);
  assert.match(r.err, /catalog\.json does not parse/);
});

test('the recorded incident: techniques dropped from a real index laws map names personas', (t) => {
  const f = fixture(t);
  const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'knowledge', 'technical-writing', 'index.json'), 'utf8'));
  assert.ok(Object.keys(real.laws ?? {}).length > 0, 'the fixture index carries laws');
  for (const law of Object.values(real.laws)) delete law.techniques;
  f.write('knowledge/technical-writing/index.json', real);
  const committed = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'contracts', 'generated-fields.json'), 'utf8'));
  f.write(CONTRACT, { schema: SCHEMA, files: { 'knowledge/*/index.json': committed.files['knowledge/*/index.json'] } });
  const r = f.cli();
  assert.equal(r.code, 1);
  assert.match(r.err, /laws\{\}\.techniques is absent - read by personas/);
});

test('--write is idempotent and never removes a declared path or a consumer', (t) => {
  const f = fixture(t);
  const c = seeded(f);
  c.files['catalog.json'].fields['legacy.kept'] = { type: 'string', optional: true, consumers: ['personas'] };
  f.write(CONTRACT, c);
  const cat = CATALOG();
  cat.extra = 1;
  f.write('catalog.json', cat);
  assert.equal(f.cli('--write').code, 0);
  const once = fs.readFileSync(path.join(f.dir, CONTRACT), 'utf8');
  assert.equal(f.cli('--write').code, 0);
  const twice = fs.readFileSync(path.join(f.dir, CONTRACT), 'utf8');
  assert.equal(twice, once, 'a second --write changes nothing');
  const after = JSON.parse(twice).files['catalog.json'].fields;
  for (const [p, entry] of Object.entries(c.files['catalog.json'].fields)) {
    assert.ok(after[p], `${p} survives --write`);
    assert.deepEqual(after[p].consumers, entry.consumers, `${p} keeps its consumers`);
  }
  assert.ok(after.extra);
});

test('a sparse enum-keyed object is one map everywhere, not a record on some elements', () => {
  const docs = [{ s: [{ o: { shipped: 1 } }, { o: { 'no-op': 2, shipped: 1 } }] }];
  const c = { schema: SCHEMA, files: { 'x.json': { fields: {} } } };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-contract-map-'));
  try {
    fs.writeFileSync(path.join(dir, 'x.json'), JSON.stringify(docs[0]));
    const r = check(dir, c);
    assert.deepEqual(Object.keys(r.additions['x.json']).sort(), ['s', 's[]', 's[].o', 's[].o{}']);
    applyAdditions(c, r.additions);
    assert.deepEqual(check(dir, c).violations, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('path helpers: split, hints, presence', () => {
  assert.deepEqual(splitPath('subjects{}.techniques[].slug'), { parent: 'subjects{}.techniques[]', step: 'key', key: 'slug' });
  assert.deepEqual(splitPath('laws{}'), { parent: 'laws', step: 'elem', key: '{}' });
  const h = shapeHints(['laws{}.techniques[]', 'meta.bundle']);
  assert.ok(h.maps.has('laws'));
  assert.ok(h.records.has('meta'));
  const stats = derive({ laws: { a: { statement: 's' } }, meta: { bundle: 'b' } }, h);
  assert.equal(presence(stats, 'laws{}.techniques').state, 'missing');
  assert.equal(presence(stats, 'laws{}.statement').state, 'ok');
});

test('--consumers prints leads for unattributed fields and writes nothing', (t) => {
  const f = fixture(t);
  seeded(f);
  f.write('consumer/src/read.mjs', "const c = JSON.parse(read('catalog.json'));\nfor (const s of c.skills) use(s.usageContributors);\n");
  const before = fs.readFileSync(path.join(f.dir, CONTRACT), 'utf8');
  const r = f.cli('--consumers', path.join(f.dir, 'consumer'), '--slug', 'demo-app');
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /TEXT SCAN, not a proof/);
  assert.match(r.out, /catalog\.json {2}skills\[\]\.usageContributors {2}<- 1 file\(s\): src\/read\.mjs/);
  assert.equal(fs.readFileSync(path.join(f.dir, CONTRACT), 'utf8'), before);
  assert.equal(f.cli('--consumers', path.join(f.dir, 'nope'), '--slug', 'x').code, 2);
  assert.equal(f.cli('--consumers', path.join(f.dir, 'consumer')).code, 2);
});
