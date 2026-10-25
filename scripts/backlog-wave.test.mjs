import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { buildUnits, foldHome, parseLedger, pickWave } from './backlog-wave.mjs';

const SCRIPT = fileURLToPath(new URL('./backlog-wave.mjs', import.meta.url));
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('next refuses a --size that is not a positive integer, before reading the ledger', () => {
  // Before: Number('abc') is NaN, `wave.length >= NaN` is never true, and the "wave" was the
  // whole queue - 473 units on 2026-10-25 - printed as if it were a wave of 8.
  for (const bad of ['abc', '0', '-3', '2.5', '']) {
    const r = cli('next', '--size', bad);
    assert.equal(r.status, 2, `--size "${bad}": ${r.stdout.slice(0, 200)}${r.stderr}`);
    assert.match(r.stderr, /--size must be a positive integer/);
    assert.equal(r.stdout, '', 'no wave printed');
  }
  const missing = cli('next', '--size');
  assert.equal(missing.status, 2, 'a --size with no value is refused too');
  // positive control: a real size bounds the wave
  const ok = cli('next', '--size', '2');
  assert.equal(ok.status, 0, ok.stderr);
  assert.ok(JSON.parse(ok.stdout).wave.length <= 2);
});

test('every usage or validation error exits FATAL (2), never 1: nothing was found, nothing could run', () => {
  // Before these exited 1, the code scripts/lib/exit-codes.mjs reserves for "ran and found
  // something", so a caller could not tell a mistyped call from a finding.
  for (const args of [[], ['bogus'], ['mark'], ['mark', 'x', 'bogus-status'], ['mark', 'x', 'landed', '--mode', 'nope'], ['mark', 'x', 'landed', '--verdict', 'nope'], ['mark', 'no-such-id-zz', 'landed']]) {
    const r = cli(...args);
    assert.equal(r.status, 2, JSON.stringify(args) + ': ' + r.stdout.slice(0, 100) + r.stderr);
  }
  assert.equal(cli('status').status, 0);
});

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

test('REGRESSION: a row on two convergence clusters joins them into ONE unit, never two', () => {
  // Before: the unit for c1 took x and y, the unit for c2 took y and z - y travelled in two
  // units of one wave, so two workers would draft the same landing (rule 1). The ledger
  // already carries such a row (1-001: c15,c31); today it is landed, the next one may not be.
  for (const order of [['x', 'y', 'z'], ['y', 'z', 'x'], ['z', 'x', 'y']]) {
    const byId = { x: row({ id: 'x', convergence: ['c1'] }), y: row({ id: 'y', convergence: ['c1', 'c2'] }), z: row({ id: 'z', convergence: ['c2'] }) };
    const { units } = buildUnits(order.map((id) => byId[id]));
    const ids = units.flatMap((u) => u.ids);
    assert.equal(ids.length, new Set(ids).size, `order ${order}: no row in two units (${JSON.stringify(units.map((u) => u.ids))})`);
    assert.equal(units.length, 1, `order ${order}: one unit`);
    assert.deepEqual([...units[0].ids].sort(), ['x', 'y', 'z']);
    assert.equal(units[0].kind, 'convergence');
  }
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

test('foldHome: annotation dropped, ";" and "," split, knowledge/ and .md folded, prose yields nothing', () => {
  assert.deepEqual(foldHome('a/b (embedding-lifecycle)'), foldHome('a/b'));
  assert.deepEqual(foldHome('a/b'), ['a/b']);
  assert.deepEqual(foldHome('x/1; y/2'), ['x/1', 'y/2']);
  assert.deepEqual(foldHome('x/1, y/2 (note, with comma)'), ['x/1', 'y/2']);
  assert.deepEqual(foldHome('x/1 (a (nested) note)'), ['x/1']);
  assert.deepEqual(foldHome('Knowledge/X/Y.md'), ['x/y']);
  assert.deepEqual(foldHome('x/1; x/1'), ['x/1'], 'a repeated component is one component');
  // Prose is not an address: a component holding whitespace is dropped, so it blocks nothing.
  assert.deepEqual(foldHome('strong in recruiting, civic and media bundles; thin in software-engineering'), []);
  assert.deepEqual(foldHome('game-production engine-integration-safety'), []);
  assert.deepEqual(foldHome('se/a/b (probe-design) + failure-direction'), [], 'a "+" joined prose tail makes the whole component prose');
  assert.deepEqual(foldHome('x/y, applied to librarian/harvest/evaluations.md'), ['x/y']);
  for (const empty of ['', null, undefined, '   ']) assert.deepEqual(foldHome(empty), []);
});

test('REGRESSION: an annotated or multi-home unit does not share a wave with the bare home it names', () => {
  // Before: homeKey only lowercased and stripped whitespace, so 'se/y (retry half)' and
  // 'se/y; se/z' never matched 'se/y' and one wave dispatched overlapping drafts to one subject.
  const cases = [
    ['se/y (retry half)', 'se/y'],
    ['se/y; se/z', 'se/y'],
    ['se/z; se/y', 'se/y'],
    ['se/y', 'se/q, se/y (b)'],
    ['se/y', 'knowledge/se/y.md'],
    ['se/y/leaf', 'se/y'],                    // prefix containment, the way run-board's touches reads claims
    ['se/y', 'se/y/leaf (note)'],
  ];
  for (const [first, second] of cases) {
    const rows = [row({ id: 'a', score: 9, home: first }), row({ id: 'b', score: 8, home: second }), row({ id: 'c', score: 7, home: 'se/other' })];
    assert.deepEqual(pickWave(rows, { size: 8 }).map((u) => u.unit), ['a', 'c'], `${first} | ${second}`);
  }
  // positive control: siblings that merely share a parent do not touch
  const sib = [row({ id: 'a', score: 9, home: 'se/y/one' }), row({ id: 'b', score: 8, home: 'se/y/two (note)' })];
  assert.deepEqual(pickWave(sib).map((u) => u.unit), ['a', 'b']);
  // ... and a prefix that is not on a path boundary is not containment
  const edge = [row({ id: 'a', score: 9, home: 'se/y' }), row({ id: 'b', score: 8, home: 'se/yy' })];
  assert.deepEqual(pickWave(edge).map((u) => u.unit), ['a', 'b']);
});

test('prose-only homes block nothing, including each other', () => {
  const rows = [row({ id: 'a', score: 9, home: 'skills lane' }), row({ id: 'b', score: 8, home: 'docs-sync / machine-authored-documentation' }), row({ id: 'c', score: 7, home: 'se/y' })];
  assert.equal(pickWave(rows).length, 3);
});

// The instrument the finding rests on: drain a ledger wave by wave (every picked unit lands)
// and ask each wave whether two of its units touch. A synthetic ledger carries every shape the
// real one does; the tracked ledger is then drained read-only as the property that must hold
// whatever it contains.
function drain(rows, size = 8) {
  let pool = rows.map((r) => ({ ...r }));
  const waves = [];
  for (;;) {
    const w = pickWave(pool, { size });
    if (!w.length) return waves;
    waves.push(w);
    const done = new Set(w.flatMap((u) => u.ids));
    pool = pool.map((r) => (done.has(r.id) ? { ...r, status: 'landed' } : r));
  }
}
function touchingPairs(wave) {
  const comps = wave.map((u) => foldHome(u.home));
  const bad = [];
  for (let i = 0; i < wave.length; i++) for (let j = i + 1; j < wave.length; j++) {
    for (const a of comps[i]) for (const b of comps[j]) if (a === b || a.startsWith(b + '/') || b.startsWith(a + '/')) bad.push([a, b]);
  }
  return bad;
}

test('simulation: draining a ledger of annotated, multi-home and prose homes never puts touching units in one wave', () => {
  const homes = ['se/a/b', 'se/a/b (note)', 'se/a/b; se/c/d', 'se/c/d', 'se/c/d/leaf', 'se/c', 'strong in x, thin in y', 'se/e', '', 'se/e; se/f (g)', 'se/f'];
  const rows = Array.from({ length: 44 }, (_, i) => row({ id: `r${i}`, score: 10 - (i % 7), home: homes[i % homes.length], note: `n${i}` }));
  const waves = drain(rows, 4);
  assert.equal(waves.flat().length, 44, 'every unit is eventually picked');
  assert.deepEqual(waves.flatMap(touchingPairs), []);
  // positive control: the same predicate does see the overlap in a hand-built wave
  assert.equal(touchingPairs([{ home: 'se/a/b (note)' }, { home: 'se/a/b' }]).length, 1);
});

test('simulation: the tracked backlog ledger, drained read-only, yields no wave holding touching units', (t) => {
  const file = fileURLToPath(new URL('../librarian/harvest/backlog.jsonl', import.meta.url));
  if (!fs.existsSync(file)) return t.skip('no ledger in this checkout');
  const rows = parseLedger(fs.readFileSync(file, 'utf8'));
  const waves = drain(rows);
  assert.equal(waves.flat().length, buildUnits(rows).units.length, 'every queued unit is eventually picked');
  assert.deepEqual(waves.flatMap(touchingPairs), []);
});

test('the ledger parser refuses a status outside the closed set and duplicate ids', () => {
  assert.throws(() => parseLedger(JSON.stringify(row({ id: 'a', status: 'accepted' }))), /closed set/);
  const dup = [row({ id: 'a' }), row({ id: 'a' })].map((r) => JSON.stringify(r)).join('\n');
  assert.throws(() => parseLedger(dup), /duplicate/);
});
