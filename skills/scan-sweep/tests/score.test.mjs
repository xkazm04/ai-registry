// node --test skills/scan-sweep/tests/score.test.mjs
// Pins scan-score/1 to the reference values the finding contract publishes: every implementation
// (this file, lens-scan through it, Dowser's copy) must print the same four numbers, or the three
// backlogs rank one finding three ways again.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanScore, sizeToEffort, FORMULA } from '../scripts/score.mjs';

test('reference values from the contract', () => {
  assert.equal(scanScore({ impact: 10, confidence: 'high', effort: 1, risk: 1 }).score, 95);
  assert.equal(scanScore({ impact: 8, confidence: 'medium', effort: 4, risk: 3 }).score, 40.5);
  assert.equal(scanScore({ impact: 3, confidence: 'high', effort: 1, risk: 1 }).score, 28.5);
  assert.equal(scanScore({ impact: 5, confidence: 'low', effort: 10, risk: 10 }).score, 6.9);
});

test('impact leads: a trivial low-impact fix never outranks an impact-8 M', () => {
  const trivial = scanScore({ impact: 3, confidence: 'high', effort: 1, risk: 1 }).score;
  const real = scanScore({ impact: 8, confidence: 'medium', effort: 4, risk: 3 }).score;
  assert.ok(real > trivial);
});

test('unmeasured is never zero: no impact or no effort means unscored (null)', () => {
  assert.equal(scanScore({ effort: 2, confidence: 'high', risk: 1 }), null);
  assert.equal(scanScore({ impact: 7, confidence: 'high', risk: 1 }), null);
  assert.equal(scanScore(), null);
});

test('absent confidence counts as low, absent risk as the 0.75 factor', () => {
  const r = scanScore({ impact: 10, effort: 1 });
  assert.equal(r.score_parts.confidence_w, 0.5);
  assert.equal(r.score_parts.risk_factor, 0.75);
  assert.equal(r.score, 37.5);
});

test('the breakdown ships with the number', () => {
  const r = scanScore({ impact: 8, confidence: 'medium', effort: 4, risk: 3 });
  assert.deepEqual(r.score_parts, { impact: 8, confidence_w: 0.75, effort_div: 1.333, risk_factor: 0.9, formula: FORMULA });
});

test('a scale bug fails at the producer', () => {
  assert.throws(() => scanScore({ impact: 0, effort: 1 }), RangeError);
  assert.throws(() => scanScore({ impact: 11, effort: 1 }), RangeError);
  assert.throws(() => scanScore({ impact: 5, effort: 2.5 }), RangeError);
  assert.throws(() => scanScore({ impact: 5, effort: 2, confidence: 'certain' }), RangeError);
});

test('sizeToEffort maps XS..XL and leaves anything else undefined', () => {
  assert.deepEqual(['XS', 'S', 'M', 'L', 'XL'].map(sizeToEffort), [1, 2, 4, 7, 10]);
  assert.equal(sizeToEffort('XXL'), undefined);
  assert.equal(sizeToEffort(undefined), undefined);
});
