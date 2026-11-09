import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { rank, inspect } from '../scripts/pick-projects.mjs';

const row = (slug, o = {}) => ({ slug, root: slug, synced: true, lastSweep: null, frozen: false, reasons: [], ...o });

test('unsynced ranks before synced', () => {
  const out = rank([row('s', { synced: true }), row('u', { synced: false })]);
  assert.deepEqual(out.map((r) => r.slug), ['u', 's']);
});

test('older sweep first; never-swept before swept', () => {
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

test('inspect reads a checkout: no map is unsynced, a judged map with fresh consults is synced', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dbk-pick-'));
  const proj = { slug: 'x', relPath: 'x', exists: true, path: dir };
  const now = Date.now();
  assert.equal(inspect(proj, { now }).synced, false);
  fs.mkdirSync(path.join(dir, '.ai'));
  fs.writeFileSync(path.join(dir, '.ai', 'registry-map.json'), JSON.stringify({ contexts: [{ subjects: [{ state: 'covered' }] }] }));
  fs.writeFileSync(path.join(dir, '.ai', 'consults.jsonl'), '{}\n');
  const r = inspect(proj, { now });
  assert.equal(r.synced, true);
  assert.equal(r.root, 'x');
  assert.equal(inspect(proj, { now: now + 40 * 86400000 }).synced, false);
  fs.writeFileSync(path.join(dir, '.ai', 'FREEZE'), 'later');
  assert.equal(inspect(proj, { now }).frozen, true);
});
