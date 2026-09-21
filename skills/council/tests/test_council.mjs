// Deterministic tests for the pure half of the /council instrument:
//
//   node --test skills/council/tests
//
// Builtins only; nothing here spawns a model, reads a repository or writes a database.
//
// What is pinned is the arithmetic a reader could not re-derive by reading the code
// without running a council: the pass rule's four properties, the floor asymmetry between
// mechanical and judged members, the round cap, the drift carry, the cross-language
// receipt digest, and the one negative property the whole method rests on - that the
// closed outcome set holds no value that admits anything.
//
// NOTE FOR ANYONE RUNNING THIS BY HAND: scrub NODE_TEST_CONTEXT from the environment
// first. An inherited value makes `node --test` report failures and still exit 0, which
// is a green gate that checked nothing.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  aggregate, buildResult, validateRubric, aggregateScenarios,
  OUTCOMES, ROUND_CAP, DEFAULT_SCENARIO_FLOOR,
} from '../scripts/lib/aggregate.mjs';
import { validateResult } from '../scripts/lib/schema.mjs';
import { buildReceipt, spanDigest, sha256Hex, normalizeSpanPath } from '../scripts/lib/receipt.mjs';
import { drift, carryForward } from '../scripts/lib/drift.mjs';

const SKILL_DIR = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const rubricOf = (name) => JSON.parse(fs.readFileSync(path.join(SKILL_DIR, 'rubric', `${name}.json`), 'utf8'));

/** A minimal well-formed verdict. Every test states only the fields it is about. */
const v = (score, over = {}) => ({ state: 'measured', score, confidence: 'med', findings: [], evidence: [], techniques: [], ...over });
const unmeasured = (reason) => ({ state: 'unmeasured', score: null, confidence: 'low', unmeasured_reason: reason });
const na = () => ({ state: 'not_applicable', score: null, confidence: 'high' });

// ------------------------------------------------------------------ rubrics

test('both shipped rubrics are valid and their weights sum to exactly 1', () => {
  for (const name of ['feature-v1', 'architecture-v1']) {
    const r = rubricOf(name);
    assert.deepEqual(validateRubric(r), [], `${name} must validate`);
    const sum = r.dimensions.reduce((a, d) => a + d.weight, 0);
    assert.equal(Math.round(sum * 1e9) / 1e9, 1);
    assert.equal(r.totals.weights_sum, 1);
    assert.equal(r.totals.dimension_count, r.dimensions.length);
    assert.equal(r.threshold, 0.7);
    assert.equal(r.coverage_floor, 0.6);
    for (const d of r.dimensions) {
      assert.ok(d.weight_rationale, `${name}/${d.dimension} must defend its weight`);
      for (const anchor of ['1.0', '0.5', '0']) assert.ok(d.levels[anchor], `${name}/${d.dimension} must anchor ${anchor}`);
    }
  }
  // The architecture rubric is the one the Director fixed by decision; pin its shape.
  const arch = rubricOf('architecture-v1');
  assert.deepEqual(arch.dimensions.map((d) => [d.dimension, d.weight, d.floor]), [
    ['craft', 0.35, null], ['robustness', 0.3, 0.5], ['reversibility', 0.25, 0.5], ['economics', 0.1, null],
  ]);
  assert.ok(!arch.dimensions.some((d) => d.dimension === 'value' || d.dimension === 'rivalry'),
    'a redesign has no users of its own: no value member, no rivalry member');
});

// ---------------------------------------------------------------- pass rule

test('the mean renormalises over the weight actually measured', () => {
  const r = rubricOf('feature-v1');
  // value .30 and craft .25 measured, the other .45 unmeasured.
  const a = aggregate(r, {
    value: v(0.8), craft: v(0.6),
    rivalry: unmeasured('no comparable product was reachable in the web budget'),
    robustness: unmeasured('the repo declares no gate over this span'),
    economics: unmeasured('no telemetry for this feature yet'),
  }, { trustState: 'trusted', roundNo: 1 });
  // (.30*.8 + .25*.6) / .55 = .39/.55
  assert.equal(a.overall, Math.round((0.39 / 0.55) * 10000) / 10000);
  assert.equal(a.coverage, 0.55);
  // A plain weighted mean over the whole rubric would have been .39 - which is what
  // scoring the unmeasured dimensions zero produces. That number is the bug.
  assert.notEqual(a.overall, 0.39);
});

test('unmeasured never counts as a zero: it lowers coverage, not the mean', () => {
  const r = rubricOf('feature-v1');
  const all = aggregate(r, { value: v(0.9), craft: v(0.9), rivalry: v(0.9), robustness: v(0.9), economics: v(0.9) }, { trustState: 'trusted' });
  const some = aggregate(r, {
    value: v(0.9), craft: v(0.9), rivalry: v(0.9), robustness: v(0.9),
    economics: unmeasured('no price book entry for this provider'),
  }, { trustState: 'trusted' });
  assert.equal(all.overall, 0.9);
  assert.equal(some.overall, 0.9, 'dropping a dimension must not move the mean');
  assert.equal(all.coverage, 1);
  assert.equal(some.coverage, 0.9, 'it must move coverage instead');
  assert.equal(some.dimensions.find((d) => d.dimension === 'economics').score, null);
  assert.match(some.must_address.join(' '), /economics is unmeasured/);
});

test('not_applicable leaves both sums: coverage stays whole', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, {
    value: v(0.8), craft: v(0.8), rivalry: v(0.8), robustness: v(0.8), economics: na(),
  }, { trustState: 'trusted' });
  assert.equal(a.coverage, 1, 'a dimension that does not exist for this subject cannot be missing evidence');
  assert.equal(a.overall, 0.8);
  assert.equal(a.weight_applicable, 0.9);
  assert.equal(a.weight_scored, 0.9);
});

test('coverage below the rubric floor is incomplete, never a low pass', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, {
    value: v(1), craft: unmeasured('x'), rivalry: unmeasured('x'), robustness: unmeasured('x'), economics: unmeasured('x'),
  }, { trustState: 'uncalibrated' });
  assert.equal(a.coverage, 0.3);
  assert.equal(a.outcome, 'incomplete');
  assert.equal(a.overall, 1, 'the mean is still reported - it just does not carry the decision');
});

// -------------------------------------------------------------------- floors

test('a mechanical floor hit fails the run at any trust state', () => {
  const r = rubricOf('feature-v1');
  for (const trustState of ['uncalibrated', 'untrusted', 'trusted']) {
    const a = aggregate(r, {
      value: v(1), craft: v(1), rivalry: v(1), robustness: v(0.2), economics: v(1),
    }, { trustState });
    const rob = a.dimensions.find((d) => d.dimension === 'robustness');
    assert.equal(rob.floor_hit, true);
    assert.equal(rob.advisory, false, 'a measurement is never advisory');
    assert.equal(a.outcome, 'fail', `robustness floor must bind while ${trustState}`);
  }
});

test('a judged floor hit is advisory while the judges are uncalibrated, and binds once trusted', () => {
  const r = rubricOf('feature-v1');
  const verdicts = { value: v(0.2), craft: v(1), rivalry: v(1), robustness: v(1), economics: v(1) };

  const soft = aggregate(r, verdicts, { trustState: 'uncalibrated' });
  const valSoft = soft.dimensions.find((d) => d.dimension === 'value');
  assert.equal(valSoft.floor_hit, true);
  assert.equal(valSoft.advisory, true);
  assert.equal(soft.outcome, 'ready', 'an uncalibrated opinion is loud in the report and inert in the gate');
  assert.match(soft.must_address.join(' '), /advisory floor/);

  const hard = aggregate(r, verdicts, { trustState: 'trusted' });
  const valHard = hard.dimensions.find((d) => d.dimension === 'value');
  assert.equal(valHard.advisory, false);
  assert.equal(hard.outcome, 'fail', 'once the judges repeat themselves, the value floor binds');
});

test('the threshold binds only when trusted; until then overall only orders the queue', () => {
  const r = rubricOf('feature-v1');
  const verdicts = { value: v(0.6), craft: v(0.6), rivalry: v(0.6), robustness: v(0.6), economics: v(0.6) };
  assert.equal(aggregate(r, verdicts, { trustState: 'uncalibrated' }).outcome, 'ready');
  assert.equal(aggregate(r, verdicts, { trustState: 'untrusted' }).outcome, 'ready');
  const t = aggregate(r, verdicts, { trustState: 'trusted' });
  assert.equal(t.overall, 0.6);
  assert.equal(t.outcome, 'fail', '0.6 is below the 0.70 threshold');
});

// ------------------------------------------------------- hard failure, rounds

test('a hard failure fails the run regardless of every score', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, { value: v(1), craft: v(1), rivalry: v(1), robustness: v(1), economics: v(1) }, {
    trustState: 'trusted',
    hardFailures: [{ code: 'credential_outside_vault', detail: 'an API key is read from an environment variable at the call site' }],
  });
  assert.equal(a.overall, 1);
  assert.equal(a.coverage, 1);
  assert.equal(a.outcome, 'fail');
  assert.match(a.must_address.join(' '), /credential_outside_vault/);
});

test('a fourth round is refused as stalled, before anything the round produced is read', () => {
  const r = rubricOf('feature-v1');
  const perfect = { value: v(1), craft: v(1), rivalry: v(1), robustness: v(1), economics: v(1) };
  assert.equal(ROUND_CAP, 3);
  assert.equal(aggregate(r, perfect, { trustState: 'trusted', roundNo: 3 }).outcome, 'ready');
  assert.equal(aggregate(r, perfect, { trustState: 'trusted', roundNo: 4 }).outcome, 'stalled');
  // Even a hard failure does not change the refusal: at round 4 the method stops asking.
  assert.equal(aggregate(r, perfect, { roundNo: 4, hardFailures: [{ code: 'write_outside_door', detail: 'x' }] }).outcome, 'stalled');
});

test('the outcome set is closed and contains nothing that admits', () => {
  assert.deepEqual(OUTCOMES, ['ready', 'fail', 'incomplete', 'stalled']);
  for (const admitting of ['approved', 'accepted', 'pass', 'passed', 'shipped', 'ok']) {
    assert.ok(!OUTCOMES.includes(admitting), `${admitting} must not be emittable by the skill`);
  }
  const r = rubricOf('architecture-v1');
  const seen = new Set();
  for (const trustState of ['uncalibrated', 'untrusted', 'trusted']) {
    for (const roundNo of [1, 4]) {
      for (const hf of [[], [{ code: 'unbounded_foreign_decode', detail: 'x' }]]) {
        for (const score of [0, 0.45, 1]) {
          for (const missing of [false, true]) {
            const verdicts = {
              craft: v(score), robustness: v(score), reversibility: v(score),
              economics: missing ? unmeasured('not measured') : v(score),
            };
            seen.add(aggregate(r, verdicts, { trustState, roundNo, hardFailures: hf }).outcome);
          }
        }
      }
    }
  }
  for (const o of seen) assert.ok(OUTCOMES.includes(o), `${o} is outside the closed set`);
});

// ------------------------------------------------------------- result schema

test('a result built by aggregate validates field for field', () => {
  const r = rubricOf('feature-v1');
  const agg = aggregate(r, {
    value: v(0.8, {
      findings: [{ id: 'v1', severity: 'med', title: 'the second character never reaches the entry point', detail: 'd', recurrence: 1 }],
      evidence: [{ kind: 'file', ref: 'src/a.ts:12', caption: 'the entry point' }],
      techniques: [{ subject: 'async-ui-states', technique: 'ghost-under-chrome', proof: 'inspection' }],
    }),
    craft: v(0.7), rivalry: v(0.6), robustness: v(0.9), economics: na(),
  }, { trustState: 'uncalibrated', roundNo: 2 });

  const result = buildResult({
    run_id: '2026-09-20-council-example-r2',
    subject: { kind: 'use_case', slug: 'example-feature', title: 'Example feature', summary: 'What it does.' },
    rubric_version: 'feature-v1',
    round_no: 2,
    supersedes_run_id: '2026-09-20-council-example-r1',
    trust_state: 'uncalibrated',
    receipt: { head_sha: 'a'.repeat(40), spanned_paths: ['src/a.ts'], span_digest: '0'.repeat(64) },
    hard_failures: [],
    summary: 'Ready for a decision.',
  }, agg);

  assert.deepEqual(validateResult(result), []);
  assert.equal(result.schema_version, 1);
  assert.equal(result.outcome, 'ready');
});

test('the validator refuses an admitting outcome, a zero for an unmeasured dimension, and an escaping span', () => {
  const base = {
    schema_version: 1, run_id: 'r', subject: { kind: 'use_case', slug: 's', title: 't', summary: 'u' },
    rubric_version: 'feature-v1', round_no: 1, supersedes_run_id: null, trust_state: 'uncalibrated',
    receipt: { head_sha: null, spanned_paths: ['src/a.ts'], span_digest: '0'.repeat(64) },
    hard_failures: [],
    dimensions: [{ dimension: 'value', kind: 'judged', state: 'measured', score: 0.5, confidence: 'med', floor: 0.4, floor_hit: false, advisory: false, unmeasured_reason: null, findings: [], evidence: [], techniques: [], delta: null }],
    overall: 0.5, coverage: 1, outcome: 'ready', must_address: [], summary: '',
  };
  assert.deepEqual(validateResult(base), []);

  const admitting = validateResult({ ...base, outcome: 'approved' });
  assert.ok(admitting.some((x) => /outcome must be one of/.test(x)));

  const zeroed = validateResult({
    ...base,
    dimensions: [{ ...base.dimensions[0], state: 'unmeasured', score: 0 }],
  });
  assert.ok(zeroed.some((x) => /never a zero/.test(x)));

  const escaping = validateResult({ ...base, receipt: { ...base.receipt, spanned_paths: ['../../etc/passwd'] } });
  assert.ok(escaping.some((x) => /escapes the root/.test(x)));

  const unknownCode = validateResult({ ...base, hard_failures: [{ code: 'vibes', detail: 'd' }] });
  assert.ok(unknownCode.some((x) => /unknown code/.test(x)));
});

// ----------------------------------------------------------------- scenarios
//
// What is pinned here is the envelope: where an approval holds, where it is weak, and
// where nobody looked. A mean that hides a failing must-hold branch is the defect this
// exists to stop, so every test below is about a number NOT being allowed to hide one.

const decl = (slug, over = {}) => ({ subject_slug: 'subject', slug, title: `${slug} branch`, axes: { domain: slug }, scope: 'must_hold', floor: null, ...over });
const rep = (slug, over = {}) => ({ slug, state: 'measured', score: 0.9, confidence: 'med', n: 3, proof: 'simulated', summary: 'a sentence', ...over });

test('the envelope puts every scenario in exactly one bucket', () => {
  const a = aggregateScenarios(
    [
      decl('it', { floor: 0.6 }),
      decl('marketing'),
      decl('hr', { scope: 'tracked' }),
      decl('legal', { scope: 'out_of_scope' }),
      decl('night', { scope: 'proposed' }),
    ],
    [rep('it', { score: 0.85 }), rep('marketing', { score: 0.3 }), rep('legal', { score: 0 }), rep('night', { score: 0 }), rep('found', { state: 'unmeasured', score: null, summary: 'the question bank is 80% engineering' })],
    { trustState: 'uncalibrated' },
  );
  assert.deepEqual(a.envelope, {
    holds: ['it'], weak: ['marketing'], unmeasured: ['hr'], out_of_scope: ['legal'], proposed: ['night', 'found'],
  });
  assert.deepEqual(a.problems, []);
  // Every scenario appears once, and in declared order with the discovered one last.
  assert.deepEqual(a.scenarios.map((s) => s.slug), ['it', 'marketing', 'hr', 'legal', 'night', 'found']);
  const buckets = Object.values(a.envelope).flat();
  assert.equal(new Set(buckets).size, buckets.length, 'a scenario in two buckets is an envelope that says nothing');
  // An unmeasured branch carries null, never a zero - the same rule a dimension has.
  assert.equal(a.scenarios.find((s) => s.slug === 'hr').score, null);
});

test('a tracked branch is watched at a flat 0.5 and never hits a floor', () => {
  const a = aggregateScenarios([decl('hr', { scope: 'tracked', floor: 0.9 })], [rep('hr', { score: 0.6 })], { trustState: 'trusted' });
  assert.equal(DEFAULT_SCENARIO_FLOOR, 0.5);
  assert.deepEqual(a.envelope.holds, ['hr'], 'tracked buckets at 0.5, whatever floor the declaration carries');
  assert.deepEqual(a.binding_floor_hits, []);
  assert.deepEqual(a.must_address, []);
});

test('a must-hold floor hit is advisory while uncalibrated: loud in the report, inert in the gate', () => {
  const r = rubricOf('feature-v1');
  const opts = {
    scenarios: [decl('marketing')],
    reportedScenarios: [rep('marketing', { score: 0.3 })],
  };
  const a = aggregate(r, { value: v(0.9), craft: v(0.9), rivalry: v(0.9), robustness: v(0.9), economics: v(0.9) }, { trustState: 'uncalibrated', ...opts });
  assert.equal(a.outcome, 'ready', 'an uncalibrated scenario opinion does not move the outcome');
  assert.equal(a.overall, 0.9, 'and it does not touch the mean either');
  assert.ok(a.must_address.includes('Scenario marketing branch is below its floor (0.3 < 0.5)'),
    'the failing branch is named in the work list even while it cannot fail the run');
  assert.deepEqual(a.envelope.weak, ['marketing']);
});

test('once trusted, a must-hold branch below its floor fails the run however good the mean is', () => {
  const r = rubricOf('feature-v1');
  const perfect = { value: v(1), craft: v(1), rivalry: v(1), robustness: v(1), economics: v(1) };
  const a = aggregate(r, perfect, {
    trustState: 'trusted',
    scenarios: [decl('it', { floor: 0.6 }), decl('marketing')],
    reportedScenarios: [rep('it', { score: 1 }), rep('marketing', { score: 0.3 })],
  });
  assert.equal(a.overall, 1);
  assert.equal(a.coverage, 1);
  assert.equal(a.outcome, 'fail', 'a perfect mean over a failing must-hold branch is the exact failure this exists to stop');
  assert.ok(a.must_address.includes('Scenario marketing branch is below its floor (0.3 < 0.5)'));
});

test('proposed and out_of_scope branches never move anything, at any score or trust state', () => {
  const r = rubricOf('feature-v1');
  const perfect = { value: v(1), craft: v(1), rivalry: v(1), robustness: v(1), economics: v(1) };
  for (const scope of ['proposed', 'out_of_scope']) {
    const a = aggregate(r, perfect, {
      trustState: 'trusted',
      scenarios: [decl('x', { scope })],
      reportedScenarios: [rep('x', { score: 0 })],
    });
    assert.equal(a.outcome, 'ready', `a ${scope} branch at zero must not fail the run`);
    assert.deepEqual(a.must_address, [], `a ${scope} branch must not add work`);
    assert.deepEqual(a.envelope.weak, []);
  }
});

test('a member may propose a branch but never promote one', () => {
  // The report claims must_hold; the declaration is what decides, and there is none.
  const a = aggregateScenarios([], [{ ...rep('discovered', { score: 0 }), scope: 'must_hold' }], { trustState: 'trusted' });
  assert.deepEqual(a.envelope.proposed, ['discovered']);
  assert.deepEqual(a.binding_floor_hits, [], 'a scope a member wrote for itself cannot fail a run');
});

test('a measured scenario with no score is read as unmeasured and says so, rather than scoring zero', () => {
  const a = aggregateScenarios([decl('it')], [{ slug: 'it', state: 'measured', score: null, confidence: 'high', n: 2, proof: 'observed', summary: 's' }], {});
  assert.equal(a.scenarios[0].state, 'unmeasured');
  assert.equal(a.scenarios[0].score, null);
  assert.match(a.problems.join(' '), /measured with no score/);
  assert.deepEqual(a.envelope.unmeasured, ['it']);
});

// -------------------------------------------------- scenarios in the contract

const scenarioBase = () => ({
  schema_version: 1, run_id: 'r', subject: { kind: 'use_case', slug: 's', title: 't', summary: 'u' },
  rubric_version: 'feature-v1', round_no: 1, supersedes_run_id: null, trust_state: 'uncalibrated',
  receipt: { head_sha: null, spanned_paths: ['src/a.ts'], span_digest: '0'.repeat(64) },
  hard_failures: [],
  dimensions: [{ dimension: 'value', kind: 'judged', state: 'measured', score: 0.5, confidence: 'med', floor: 0.4, floor_hit: false, advisory: false, unmeasured_reason: null, findings: [], evidence: [], techniques: [], delta: null }],
  scenarios: [
    { slug: 'it', title: 'IT candidates', axes: { domain: 'it' }, state: 'measured', score: 0.85, confidence: 'high', n: 12, proof: 'replayed', summary: 'holds' },
    { slug: 'hr', title: 'HR candidates', axes: {}, state: 'unmeasured', score: null, confidence: 'low', n: null, proof: 'claimed', summary: 'never measured' },
  ],
  envelope: { holds: ['it'], weak: [], unmeasured: ['hr'], out_of_scope: [], proposed: [] },
  overall: 0.5, coverage: 1, outcome: 'ready', must_address: [], summary: '',
});

test('the contract accepts a scenario view and refuses the six ways it goes wrong', () => {
  assert.deepEqual(validateResult(scenarioBase()), []);

  const arch = validateResult({ ...scenarioBase(), subject: { kind: 'architecture', slug: 's', title: 't', summary: 'u' }, rubric_version: 'architecture-v1' });
  assert.ok(arch.some((x) => /only a use_case subject may carry scenarios/.test(x)));

  const zeroed = scenarioBase();
  zeroed.scenarios[1] = { ...zeroed.scenarios[1], score: 0 };
  assert.ok(validateResult(zeroed).some((x) => /never a zero/.test(x)));

  const scoreless = scenarioBase();
  scoreless.scenarios[0] = { ...scoreless.scenarios[0], score: null };
  assert.ok(validateResult(scoreless).some((x) => /needs a score in 0\.\.1/.test(x)));

  const badProof = scenarioBase();
  badProof.scenarios[0] = { ...badProof.scenarios[0], proof: 'vibes' };
  assert.ok(validateResult(badProof).some((x) => /proof must be one of observed, replayed, simulated, claimed/.test(x)));

  const badAxis = scenarioBase();
  badAxis.scenarios[0] = { ...badAxis.scenarios[0], axes: { domain: 3 } };
  assert.ok(validateResult(badAxis).some((x) => /axis domain must be a string/.test(x)));

  const { scenarios: _drop, ...noScenarios } = scenarioBase();
  assert.ok(validateResult(noScenarios).some((x) => /envelope without scenarios/.test(x)));
  const { envelope: _drop2, ...noEnvelope } = scenarioBase();
  assert.ok(validateResult(noEnvelope).some((x) => /scenarios without an envelope/.test(x)));

  const badBucket = scenarioBase();
  badBucket.envelope = { ...badBucket.envelope, sideways: [] };
  assert.ok(validateResult(badBucket).some((x) => /unknown bucket sideways/.test(x)));
});

test('a run that declares no scenarios produces the pre-scenario document, byte for byte', () => {
  const r = rubricOf('feature-v1');
  const agg = aggregate(r, {
    value: v(0.8, {
      findings: [{ id: 'v1', severity: 'med', title: 'the second character never reaches the entry point', detail: 'd', recurrence: 1 }],
      evidence: [{ kind: 'file', ref: 'src/a.ts:12', caption: 'the entry point' }],
      techniques: [{ subject: 'async-ui-states', technique: 'ghost-under-chrome', proof: 'inspection' }],
    }),
    craft: v(0.7), rivalry: v(0.6), robustness: v(0.9), economics: na(),
  }, { trustState: 'uncalibrated', roundNo: 2 });

  const result = buildResult({
    run_id: '2026-09-20-council-example-r2',
    subject: { kind: 'use_case', slug: 'example-feature', title: 'Example feature', summary: 'What it does.' },
    rubric_version: 'feature-v1',
    round_no: 2,
    supersedes_run_id: '2026-09-20-council-example-r1',
    trust_state: 'uncalibrated',
    receipt: { head_sha: 'a'.repeat(40), spanned_paths: ['src/a.ts'], span_digest: '0'.repeat(64) },
    hard_failures: [],
    summary: 'Ready for a decision.',
  }, agg);

  const fixture = path.join(SKILL_DIR, 'tests', 'fixtures', 'result-no-scenarios.json');
  assert.equal(`${JSON.stringify(result, null, 2)}\n`, fs.readFileSync(fixture, 'utf8'),
    'an additive field that changes a document nobody asked to change is not additive');
  assert.ok(!('scenarios' in result) && !('envelope' in result), 'absent, not empty: an empty envelope is a claim');
});

// ----------------------------------------------------------------- receipt

test('the span digest is the documented cross-language vector', () => {
  // a.txt = "alpha\n", b/c.txt = "beta\n" - the vector a port must reproduce.
  const entries = [
    { path: 'a.txt', sha256: sha256Hex(Buffer.from('alpha\n')) },
    { path: 'b/c.txt', sha256: sha256Hex(Buffer.from('beta\n')) },
  ];
  assert.equal(entries[0].sha256, 'b6a98d9ce9a2d9149288fa3df42d377c3e42737afdcdaf714e33c0a100b51060');
  assert.equal(entries[1].sha256, 'f2c82decdd7181cf98945929a62598db7e6b477e11f6e0eb0ae97020eff151ad');
  assert.equal(spanDigest(entries), '5af9f997a477dcc29084a755099b65288e13751fa3436d69482e6dacb00f4081');
  assert.equal(spanDigest([...entries].reverse()), spanDigest(entries), 'the lines are sorted, so input order cannot matter');
});

test('a receipt over a real tree reproduces the vector, and an escaping span is refused', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-receipt-'));
  try {
    fs.writeFileSync(path.join(root, 'a.txt'), 'alpha\n');
    fs.mkdirSync(path.join(root, 'b'));
    fs.writeFileSync(path.join(root, 'b', 'c.txt'), 'beta\n');
    const r = buildReceipt({ root, paths: ['a.txt', 'b'], headSha: 'deadbeef' });
    assert.equal(r.span_digest, '5af9f997a477dcc29084a755099b65288e13751fa3436d69482e6dacb00f4081');
    assert.equal(r.file_count, 2);
    assert.deepEqual(r.spanned_paths, ['a.txt', 'b']);
    // The declaration is published; the file list behind it is not part of the contract.
    assert.deepEqual(r.files.map((f) => f.path), ['a.txt', 'b/c.txt']);
    // One changed byte must move the digest.
    fs.writeFileSync(path.join(root, 'b', 'c.txt'), 'beta!\n');
    assert.notEqual(buildReceipt({ root, paths: ['a.txt', 'b'] }).span_digest, r.span_digest);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  assert.throws(() => normalizeSpanPath('../secrets'), /escapes the root/);
  assert.throws(() => normalizeSpanPath('/etc/passwd'), /repo-relative/);
  assert.throws(() => normalizeSpanPath('C:\\Users\\x'), /repo-relative/);
  assert.throws(() => buildReceipt({ root: '.', paths: [] }), /empty span/);
});

// -------------------------------------------------------------------- drift

test('drift: none and grown carry a verdict forward, changed re-judges, absent is unknown', () => {
  const f = (p, h) => ({ path: p, sha256: h });
  const mk = (files) => ({ files, span_digest: spanDigest(files) });

  const r1 = mk([f('a.ts', 'aa'), f('b.ts', 'bb')]);
  const same = mk([f('a.ts', 'aa'), f('b.ts', 'bb')]);
  const grown = mk([f('a.ts', 'aa'), f('b.ts', 'bb'), f('c.ts', 'cc')]);
  const edited = mk([f('a.ts', 'aa'), f('b.ts', 'ZZ')]);
  const shrunk = mk([f('a.ts', 'aa')]);

  assert.equal(drift(r1, same), 'none');
  assert.equal(drift(r1, grown), 'grown');
  assert.equal(drift(r1, edited), 'changed');
  assert.equal(drift(r1, shrunk), 'changed', 'a file that left the span is a change, not a shrink');
  assert.equal(drift(null, r1), 'unknown', 'nothing to compare is never the same fact as nothing changed');
});

test('carryForward keeps the original score, marks it carried, and never carries under change', () => {
  const prior = [
    { dimension: 'value', kind: 'judged', state: 'measured', score: 0.8, confidence: 'med' },
    { dimension: 'rivalry', kind: 'judged', state: 'unmeasured', score: null, confidence: 'low' },
    { dimension: 'economics', kind: 'mechanical', state: 'not_applicable', score: null, confidence: 'high' },
  ];
  const carried = carryForward(prior, 'none', { fromRunId: 'r1' });
  const value = carried.find((d) => d.dimension === 'value');
  assert.equal(value.state, 'carried');
  assert.equal(value.score, 0.8, 'a carried verdict keeps its score - a rescore without a re-read is fabricated');
  assert.equal(value.carried_from_run_id, 'r1');
  assert.ok(!carried.some((d) => d.dimension === 'rivalry'), 'an unmeasured dimension carries no measurement');
  assert.equal(carried.find((d) => d.dimension === 'economics').state, 'not_applicable');

  assert.deepEqual(carryForward(prior, 'changed', { fromRunId: 'r1' }), [], 'changed re-judges everything');
  const partial = carryForward(prior, 'grown', { fromRunId: 'r1', reJudge: ['value'] });
  assert.ok(!partial.some((d) => d.dimension === 'value'), 'a dimension the round re-judges is not carried stale');
});

test('a carried dimension scores like a measured one', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, {
    value: { state: 'carried', score: 0.8, confidence: 'med', carried_from_run_id: 'r1', carried_drift: 'grown' },
    craft: v(0.8), rivalry: v(0.8), robustness: v(0.8), economics: v(0.8),
  }, { trustState: 'trusted' });
  assert.equal(a.coverage, 1);
  assert.equal(a.overall, 0.8);
  assert.equal(a.dimensions.find((d) => d.dimension === 'value').state, 'carried');
});
