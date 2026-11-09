import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { rank, inspect } from '../scripts/pick-projects.mjs';

const cov = (pairs, judged) => ({ pairs, judged, deviations: 0 });
const row = (slug, o = {}) => ({ slug, root: slug, coverage: cov(10, 10), lastCensus: null, lastSweep: null, frozen: false, reasons: [], ...o });

test('a never-censused project ranks before a censused one, whatever its coverage', () => {
  const out = rank([row('done', { lastCensus: '2030-01-01T00:00:00Z', coverage: cov(100, 0) }), row('fresh')]);
  assert.deepEqual(out.map((r) => r.slug), ['fresh', 'done']);
});

test('the least known ranks first, and no map outranks any map', () => {
  const out = rank([row('small', { coverage: cov(10, 8) }), row('big', { coverage: cov(100, 10) }), row('nomap', { coverage: undefined })]);
  assert.deepEqual(out.map((r) => r.slug), ['nomap', 'big', 'small']);
});

test('older sweep breaks a coverage tie; never-swept before swept', () => {
  const out = rank([
    row('new', { lastSweep: '2030-02-01T00:00:00Z' }),
    row('old', { lastSweep: '2030-01-01T00:00:00Z' }),
    row('never'),
  ]);
  assert.deepEqual(out.map((r) => r.slug), ['never', 'old', 'new']);
});

test('frozen projects are skipped', () => {
  const out = rank([row('a', { frozen: true }), row('b')]);
  assert.deepEqual(out.map((r) => r.slug), ['b']);
});

test('inspect measures coverage and never reports a project as synced', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dbk-pick-'));
  const proj = { slug: 'x', relPath: 'x', exists: true, path: dir };
  const now = Date.now();
  const bare = inspect(proj, { now });
  assert.equal(bare.coverage, undefined);
  assert.ok(bare.reasons.includes('no-registry-map'));
  fs.mkdirSync(path.join(dir, '.ai'));
  fs.writeFileSync(path.join(dir, '.ai', 'registry-map.json'), JSON.stringify({ contexts: [{ subjects: [{ state: 'conformant' }, { state: 'deviation' }, { state: 'unknown' }, {}] }] }));
  fs.writeFileSync(path.join(dir, '.ai', 'consults.jsonl'), '{}\n');
  const r = inspect(proj, { now, censuses: { x: '2030-01-01T00:00:00Z' } });
  assert.deepEqual(r.coverage, { pairs: 4, judged: 2, deviations: 1 });
  assert.equal('synced' in r, false);
  assert.equal(r.lastCensus, '2030-01-01T00:00:00Z');
  assert.ok(inspect(proj, { now: now + 40 * 86400000 }).reasons.some((x) => x.startsWith('consults-')));
  fs.writeFileSync(path.join(dir, '.ai', 'FREEZE'), 'later');
  assert.equal(inspect(proj, { now }).frozen, true);
});
