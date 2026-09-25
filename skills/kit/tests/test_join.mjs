// Deterministic tests for join.mjs: `node --test skills/kit/tests`. Builtins only.
//
// What is worth pinning: the divergence CSV round-trips (JSON-literal fields, commas in
// quotes), dead modules never make the ranked list, and the three orders mean what the
// skill says they mean.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsvLine, parseCsv, parseDivergence, joinInventory, rankInventory, buildInventory } from '../scripts/join.mjs';

test('csv: JSON-literal fields, quoted commas, booleans and numbers', () => {
  assert.deepEqual(parseCsvLine('"a/b",false,2.5,12,"",true,"x, y","say \\"hi\\""'), ['a/b', false, 2.5, 12, '', true, 'x, y', 'say "hi"']);
  const rows = parseCsv('module,score,debt\n"m/one",2.5,10\r\n"m/two",1,3\n');
  assert.deepEqual(rows, [{ module: 'm/one', score: 2.5, debt: 10 }, { module: 'm/two', score: 1, debt: 3 }]);
  assert.deepEqual(parseDivergence('{ "modules": [{ "module": "a" }] }'), [{ module: 'a' }]);
  assert.deepEqual(parseDivergence('[{ "module": "b" }]'), [{ module: 'b' }]);
});

const DIV = [
  { module: 'settings/sub_big', system: false, score: 2, debt: 100, loc: 5000, files: 20, last: '2026-01-02', c30: 4 },
  { module: 'overview/sub_mid', system: false, score: 5, debt: 50, loc: 1000, files: 5, last: '2026-01-01', c30: 1 },
  { module: 'home/sub_small', system: false, score: 4, debt: 4, loc: 100, files: 1, last: '', c30: 0 },
  { module: 'home/sub_clean', system: false, score: 0, debt: 0, loc: 50, files: 1, last: '', c30: 0 },
  { module: 'recipes/sub_dead', system: false, score: 9, debt: 200, loc: 2000, files: 3, last: '', c30: 0 },
  { module: 'shared/components/x', system: 'true', score: 1, debt: 2, loc: 200, files: 2, last: '', c30: 0 },
];
const REACH = [
  { module: 'settings/sub_big', files: 20, reachable: 18 },
  { module: 'overview/sub_mid', files: 5, reachable: 5 },
  { module: 'home/sub_small', files: 1, reachable: 1 },
  { module: 'home/sub_clean', files: 1, reachable: 1 },
  { module: 'recipes/sub_dead', files: 3, reachable: 0 },
];
const LEDGER = { modules: { 'settings/sub_big': { status: 'approved' }, 'overview/sub_mid': { status: 'pending' } } };

test('join: reach ratio, liveness, unknown reach stays live, ledger status', () => {
  const rows = joinInventory(DIV, REACH, LEDGER);
  const by = Object.fromEntries(rows.map((r) => [r.module, r]));
  assert.equal(by['settings/sub_big'].ratio, 0.9);
  assert.equal(by['recipes/sub_dead'].live, false);
  assert.equal(by['shared/components/x'].reachable, null);
  assert.equal(by['shared/components/x'].live, true, 'unknown to reachability is not declared dead');
  assert.equal(by['shared/components/x'].system, true);
  assert.equal(by['settings/sub_big'].status, 'approved');
  assert.equal(by['home/sub_small'].status, 'untracked');
  assert.equal(joinInventory(DIV, REACH, null)[0].status, '-');
});

test('orders: debt, visibility (prefix order, then debt), easy (small non-zero debt first)', () => {
  const rows = joinInventory(DIV, REACH, null).filter((r) => r.live);
  assert.deepEqual(rankInventory(rows, 'debt').map((r) => r.module), ['settings/sub_big', 'overview/sub_mid', 'home/sub_small', 'shared/components/x', 'home/sub_clean']);
  assert.deepEqual(rankInventory(rows, 'visibility', ['home', 'overview']).map((r) => r.module), ['home/sub_small', 'home/sub_clean', 'overview/sub_mid', 'settings/sub_big', 'shared/components/x']);
  assert.deepEqual(rankInventory(rows, 'easy').map((r) => r.module), ['shared/components/x', 'home/sub_small', 'overview/sub_mid', 'settings/sub_big', 'home/sub_clean']);
  // A prefix matches whole path segments only.
  assert.equal(rankInventory(rows, 'visibility', ['home/sub_s'])[0].module, 'settings/sub_big');
  assert.throws(() => rankInventory(rows, 'random'), /unknown/);
});

test('inventory: dead modules are never ranked; --all and status filters', () => {
  const rows = joinInventory(DIV, REACH, LEDGER);
  const inv = buildInventory(rows, { order: 'debt' });
  assert.equal(inv.ranked.some((r) => r.module === 'recipes/sub_dead'), false);
  assert.deepEqual(inv.rest.map((r) => r.module), ['recipes/sub_dead']);
  assert.equal(inv.ranked[0].rank, 1);
  assert.equal(buildInventory(rows, { all: true }).ranked[0].module, 'recipes/sub_dead');
  const pend = buildInventory(rows, { statuses: ['pending'] });
  assert.deepEqual(pend.ranked.map((r) => r.module), ['overview/sub_mid']);
});
