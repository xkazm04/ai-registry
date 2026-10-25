// Tests for scripts/lib/map-churn.mjs - reconcileContexts, the function that decides which
// paid /conform verdicts survive a context-map rebuild.
//
// Why this exists: a wrong decision here is silent. A verdict dropped (or attached to the
// wrong context) leaves the map looking fine, and the loss is weeks of judged pairs. The
// rename threshold, the orphan parking lot and the tie-break are all single-line rules in a
// function with no other coverage, so each state gets one case and the boundary cases sit
// exactly on the boundary (0.6 in, 0.59 out).
//
// `node --test scripts/tests/map-churn.test.mjs` - pure function, no files, builtins only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileContexts, RENAME_OVERLAP, isKeptPair } from '../lib/map-churn.mjs';

/** n distinct paths named `<tag>0 .. <tag>n-1`. */
const paths = (tag, n) => Array.from({ length: n }, (_, i) => `${tag}${i}`);

/** A judged pair: kept across regenerations because it has a real state. */
const judged = (subject, extra = {}) => ({ subject, state: 'conform', source: 'conform', ...extra });

/** A previous-map context row. */
const prevRow = (context, ps, subjects = [judged('s1')]) => ({
  context, name: context.split('/').pop(), group: context.split('/')[0], paths: ps, subjects,
});

/** A current-map row, before verdicts are carried. */
const row = (context, ps) => ({ context, name: context.split('/').pop(), group: context.split('/')[0], paths: ps });

const keys = (m) => [...m.keys()].sort();

test('a first build (no previous map) is born whole: nothing carried, orphaned or arrived', () => {
  const r = reconcileContexts(null, [row('g/a', ['p'])], false);
  assert.equal(r.prevPairs.size, 0);
  assert.deepEqual(r.orphans, []);
  assert.deepEqual(r.renames, []);
  assert.equal(r.arrived.size, 0);
});

test('matched: a key present on both sides carries its kept pairs and strips the arrived mark', () => {
  const prev = {
    contexts: [prevRow('g/a', ['p1'], [
      judged('keep', { arrived: true }),
      { subject: 'drop', state: 'unknown', source: 'auto' },   // not a paid verdict, not a conform pairing
      { subject: 'paired', state: 'unknown', source: 'conform' }, // established by reading code: kept
    ])],
  };
  const r = reconcileContexts(prev, [row('g/a', ['p1'])], false);
  assert.deepEqual(keys(r.prevPairs), ['g/a|keep', 'g/a|paired']);
  assert.equal('arrived' in r.prevPairs.get('g/a|keep'), false, 'arrived is a one-generation mark');
  assert.equal(r.prevPairs.get('g/a|keep').source, 'conform', 'a matched pair is not rewritten to renamed');
  assert.deepEqual(r.orphans, []);
  assert.deepEqual(r.renames, []);
  assert.equal(r.arrived.size, 0);
});

test('rename at overlap 0.6 is IN: 3 of 5 recorded paths shared, verdicts carry onto the new key', () => {
  const old = paths('o', 5);
  const prev = { contexts: [prevRow('g/old', old, [judged('s1'), judged('s2')])] };
  const fresh = row('g/new', [...old.slice(0, 3), 'x1', 'x2', 'x3']);
  assert.equal(3 / 5, RENAME_OVERLAP, 'the boundary case must sit exactly on the threshold');
  const r = reconcileContexts(prev, [fresh], false);
  assert.deepEqual(r.renames, [{ from: 'g/old', to: 'g/new', by: 'paths', overlap: 0.6 }]);
  assert.deepEqual(keys(r.prevPairs), ['g/new|s1', 'g/new|s2']);
  for (const p of r.prevPairs.values()) {
    assert.equal(p.source, 'renamed');
    assert.equal(p.renamedFrom, 'g/old');
  }
  assert.deepEqual(r.orphans, []);
  assert.equal(r.arrived.size, 0, 'a rename target is not an arrival');
});

test('rename at overlap 0.59 is OUT: the old context is orphaned and the new one arrives', () => {
  const old = paths('o', 100);
  const prev = { contexts: [prevRow('g/old', old, [judged('s1')])] };
  const fresh = row('g/new', old.slice(0, 59));
  const r = reconcileContexts(prev, [fresh], false);
  assert.deepEqual(r.renames, []);
  assert.equal(r.prevPairs.size, 0);
  assert.deepEqual(r.orphans.map((o) => o.context), ['g/old']);
  assert.deepEqual([...r.arrived], ['g/new']);
  // and the same shape one path higher is in, so 0.59 is the live edge, not an arbitrary miss
  const at60 = reconcileContexts(prev, [row('g/new', old.slice(0, 60))], false);
  assert.equal(at60.renames.length, 1);
});

test('orphan parked: a vanished context with kept pairs moves to orphans[] with only its kept pairs', () => {
  const prev = {
    contexts: [prevRow('g/gone', ['p1', 'p2'], [
      judged('s1', { arrived: true }),
      { subject: 'noise', state: 'unknown', source: 'auto' },
    ])],
  };
  const r = reconcileContexts(prev, [row('g/other', ['zzz'])], false);
  assert.equal(r.prevPairs.size, 0);
  assert.equal(r.orphans.length, 1);
  const o = r.orphans[0];
  assert.equal(o.context, 'g/gone');
  assert.equal(o.name, 'gone');
  assert.equal(o.group, 'g');
  assert.deepEqual(o.paths, ['p1', 'p2']);
  assert.deepEqual(o.subjects.map((s) => s.subject), ['s1']);
  assert.equal('arrived' in o.subjects[0], false);
  assert.deepEqual([...r.arrived], ['g/other']);
});

test('a vanished context with nothing paid for on it is just gone, not parked', () => {
  const prev = { contexts: [prevRow('g/gone', ['p1'], [{ subject: 'noise', state: 'unknown', source: 'auto' }])] };
  const r = reconcileContexts(prev, [], false);
  assert.deepEqual(r.orphans, []);
  assert.equal(r.prevPairs.size, 0);
});

test('orphan stays parked across regenerations while its key is still absent', () => {
  const prev = {
    contexts: [],
    orphans: [{ context: 'g/gone', name: 'gone', group: 'g', paths: ['p1'], subjects: [judged('s1')] }],
  };
  const r = reconcileContexts(prev, [row('g/other', ['zzz'])], false);
  assert.deepEqual(r.orphans.map((o) => o.context), ['g/gone']);
  assert.deepEqual(r.orphans[0].subjects.map((s) => s.subject), ['s1']);
  assert.equal('_orphan' in r.orphans[0], false, 'the internal marker never leaks into the document');
  assert.deepEqual([...r.arrived], ['g/other']);
});

test('orphan back by key: its verdicts re-attach and it is not an arrival', () => {
  const prev = {
    contexts: [],
    orphans: [{ context: 'g/back', name: 'back', group: 'g', paths: ['p1'], subjects: [judged('s1'), judged('s2')] }],
  };
  const r = reconcileContexts(prev, [row('g/back', ['p9'])], false);
  assert.deepEqual(keys(r.prevPairs), ['g/back|s1', 'g/back|s2']);
  assert.equal(r.prevPairs.get('g/back|s1').source, 'conform', 'back by key is a carry, not a rename');
  assert.deepEqual(r.orphans, []);
  assert.deepEqual(r.renames, []);
  assert.equal(r.arrived.size, 0);
});

test('orphan adopted by rename: a parked orphan whose paths reappear under a new key moves there', () => {
  const old = paths('o', 4);
  const prev = {
    contexts: [],
    orphans: [{ context: 'g/old', name: 'old', group: 'g', paths: old, subjects: [judged('s1')] }],
  };
  const r = reconcileContexts(prev, [row('g/new', old)], false);
  assert.deepEqual(r.renames, [{ from: 'g/old', to: 'g/new', by: 'paths', overlap: 1 }]);
  assert.equal(r.prevPairs.get('g/new|s1').renamedFrom, 'g/old');
  assert.deepEqual(r.orphans, []);
  assert.equal(r.arrived.size, 0);
});

test('a row listed as both context and orphan is a context first', () => {
  const prev = {
    contexts: [prevRow('g/a', ['p1'], [judged('fromContext')])],
    orphans: [{ context: 'g/a', name: 'a', group: 'g', paths: ['p1'], subjects: [judged('fromOrphan')] }],
  };
  const r = reconcileContexts(prev, [row('g/a', ['p1'])], false);
  assert.deepEqual(keys(r.prevPairs), ['g/a|fromContext']);
  assert.deepEqual(r.orphans, []);
});

test('ids on both sides skip the path heuristic: a vanished id is a deletion, exactly', () => {
  const old = paths('o', 4);
  const prev = { contextKey: 'id', contexts: [prevRow('ctx-old', old)] };
  const mapped = [row('ctx-new', old)];   // identical paths - the heuristic WOULD adopt it
  const withIds = reconcileContexts(prev, mapped, true);
  assert.deepEqual(withIds.renames, []);
  assert.deepEqual(withIds.orphans.map((o) => o.context), ['ctx-old']);
  assert.deepEqual([...withIds.arrived], ['ctx-new']);
  // Controls: drop either half of the condition and the same input is a rename.
  const currentLacksIds = reconcileContexts(prev, mapped, false);
  assert.equal(currentLacksIds.renames.length, 1);
  const prevWasNameKeyed = reconcileContexts({ contexts: prev.contexts }, mapped, true);
  assert.equal(prevWasNameKeyed.renames.length, 1, 'a document written before contextKey existed used <group>/<name>');
});

test('arrived marks only a current key with no previous row and no rename', () => {
  const old = paths('o', 3);
  const prev = { contexts: [prevRow('g/kept', ['k1']), prevRow('g/old', old)] };
  const mapped = [row('g/kept', ['k1']), row('g/renamed', old), row('g/fresh', ['f1'])];
  const r = reconcileContexts(prev, mapped, false);
  assert.deepEqual([...r.arrived], ['g/fresh']);
  assert.deepEqual(r.renames.map((x) => `${x.from}>${x.to}`), ['g/old>g/renamed']);
});

test('the highest overlap wins, not the first or the lexically smaller candidate', () => {
  const old = paths('o', 5);
  const prev = { contexts: [prevRow('g/old', old)] };
  const mapped = [
    row('g/a-eighty', old.slice(0, 4)),   // 0.8, sorts first
    row('g/b-full', old),                 // 1.0
  ];
  const r = reconcileContexts(prev, mapped, false);
  assert.deepEqual(r.renames.map((x) => `${x.from}>${x.to}:${x.overlap}`), ['g/old>g/b-full:1']);
  assert.deepEqual([...r.arrived], ['g/a-eighty']);
});

test('lexical tie-break: equal overlap goes to the smaller OLD key regardless of insertion order', () => {
  const shared = paths('s', 3);
  // Two old contexts both fully overlap the one new context; "z" is listed before "a".
  const prev = { contexts: [prevRow('g/z-old', shared, [judged('zs')]), prevRow('g/a-old', shared, [judged('as')])] };
  const r = reconcileContexts(prev, [row('g/new', shared)], false);
  assert.deepEqual(r.renames.map((x) => x.from), ['g/a-old']);
  assert.deepEqual(keys(r.prevPairs), ['g/new|as']);
  assert.deepEqual(r.orphans.map((o) => o.context), ['g/z-old'], 'the loser is parked, not dropped');
});

test('lexical tie-break: equal overlap goes to the smaller NEW key regardless of insertion order', () => {
  const shared = paths('s', 3);
  const prev = { contexts: [prevRow('g/old', shared)] };
  // "z" is listed before "a" in the current map.
  const r = reconcileContexts(prev, [row('g/z-new', shared), row('g/a-new', shared)], false);
  assert.deepEqual(r.renames.map((x) => x.to), ['g/a-new']);
  assert.deepEqual([...r.arrived], ['g/z-new']);
});

test('adoption is one-to-one: each old context adopts at most one new one and vice versa', () => {
  const shared = paths('s', 3);
  const prev = { contexts: [prevRow('g/a-old', shared), prevRow('g/b-old', shared)] };
  const r = reconcileContexts(prev, [row('g/x-new', shared), row('g/y-new', shared)], false);
  assert.deepEqual(r.renames.map((x) => `${x.from}>${x.to}`), ['g/a-old>g/x-new', 'g/b-old>g/y-new']);
  assert.deepEqual(r.orphans, []);
  assert.equal(r.arrived.size, 0);
});

test('isKeptPair keeps a verdict, a conform pairing and a rename; drops an unjudged auto pair', () => {
  assert.equal(isKeptPair({ state: 'conform' }), true);
  assert.equal(isKeptPair({ state: 'unknown', source: 'conform' }), true);
  assert.equal(isKeptPair({ state: 'unknown', source: 'renamed' }), true);
  assert.equal(isKeptPair({ state: 'unknown', source: 'auto' }), false);
  assert.equal(isKeptPair({}), false);
});
