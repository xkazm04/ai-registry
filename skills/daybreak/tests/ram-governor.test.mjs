import test from 'node:test';
import assert from 'node:assert/strict';
import { slots } from '../scripts/ram-governor.mjs';

test('slots math across free RAM', () => {
  assert.equal(slots({ freeGb: 4 }), 0);
  assert.equal(slots({ freeGb: 8 }), 0);
  assert.equal(slots({ freeGb: 12.4 }), 1);
  assert.equal(slots({ freeGb: 18 }), 4);
  assert.equal(slots({ freeGb: 64 }), 4);
});

test('non-finite input gives zero slots', () => {
  for (const v of [NaN, Infinity, -Infinity, undefined, null]) assert.equal(slots({ freeGb: v }), 0);
});

test('cap and reserve are honoured', () => {
  assert.equal(slots({ freeGb: 64, cap: 2 }), 2);
  assert.equal(slots({ freeGb: 20, reserveGb: 10, perSlotGb: 5 }), 2);
});
