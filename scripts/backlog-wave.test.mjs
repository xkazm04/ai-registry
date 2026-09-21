import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildUnits, parseLedger, pickWave } from './backlog-wave.mjs';

const row = (o) => ({ note: `n-${o.id}`, score: 5, home: '', status: 'queued', convergence: [], tension: '', ...o });

test('a convergence cluster from two notes is one unit with the +2 bonus', () => {
  const rows = [row({ id: 'a', score: 7, convergence: ['c1'] }), row({ id: 'b', score: 6, convergence: ['c1'] })];
  const { units } = buildUnits(rows);
  assert.equal(units.length, 1);
  assert.deepEqual(units[0].ids, ['a', 'b']);
  assert.equal(units[0].priority, 9);
});

test('a cluster whose members share ONE note gets no convergence bonus', () => {
  const rows = [row({ id: 'a', note: 'same', score: 7, convergence: ['c1'] }), row({ id: 'b', note: 'same', score: 6, convergence: ['c1'] })];
  assert.equal(buildUnits(rows).units[0].priority, 7);
});

test('a tension group is never split, even when members score far apart', () => {
  const rows = [row({ id: 'hi', score: 10, tension: 't1' }), row({ id: 'lo', score: 1, tension: 't1' })];
  const wave = pickWave(rows, { size: 1 });
  assert.deepEqual(wave[0].ids, ['hi', 'lo']);
});

test('two units with the same home never share a wave', () => {
  const rows = [row({ id: 'a', score: 9, home: 'se/agent-memory' }), row({ id: 'b', score: 8, home: 'se/agent-memory' }), row({ id: 'c', score: 7, home: 'se/other' })];
  assert.deepEqual(pickWave(rows, { size: 8 }).map((u) => u.unit), ['a', 'c']);
});

test('unhomed items do not block each other', () => {
  const rows = [row({ id: 'a', score: 9 }), row({ id: 'b', score: 8 })];
  assert.equal(pickWave(rows, { size: 8 }).length, 2);
});

test('only queued rows are picked', () => {
  const rows = [row({ id: 'a', score: 10, status: 'landed' }), row({ id: 'b', score: 2 })];
  assert.deepEqual(pickWave(rows).map((u) => u.unit), ['b']);
});

test('the ledger parser refuses a status outside the closed set and duplicate ids', () => {
  assert.throws(() => parseLedger(JSON.stringify(row({ id: 'a', status: 'accepted' }))), /closed set/);
  const dup = [row({ id: 'a' }), row({ id: 'a' })].map((r) => JSON.stringify(r)).join('\n');
  assert.throws(() => parseLedger(dup), /duplicate/);
});
