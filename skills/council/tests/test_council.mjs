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

import { spawnSync } from 'node:child_process';

import {
  aggregate, buildResult, validateRubric, aggregateScenarios,
  OUTCOMES, ROUND_CAP, DEFAULT_SCENARIO_FLOOR, MUST_ADDRESS_MAX, clampLine, firstSentence,
  MODES, LITE_SCOPES, liteScopeFor, liteSkipReason,
} from '../scripts/lib/aggregate.mjs';
import { validateResult, validateVerdict } from '../scripts/lib/schema.mjs';
import {
  buildReceipt, spanDigest, sha256Hex, normalizeSpanPath, isTestFile, spanDisclosures,
} from '../scripts/lib/receipt.mjs';
import { drift, carryForward } from '../scripts/lib/drift.mjs';
import { nextRound, runDirName } from '../scripts/lib/rounds.mjs';
import { parseMarkdown } from '../scripts/lib/report/mdparse.mjs';

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
    overall: 0.5, coverage: 1, outcome: 'ready', must_address: [], summary: 'The synthesis, in a paragraph.',
  };
  assert.deepEqual(validateResult(base), []);

  // summary is required, and an empty one is the defect a consuming door papers over.
  assert.ok(validateResult({ ...base, summary: '' }).some((x) => /summary is required/.test(x)));

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
  overall: 0.5, coverage: 1, outcome: 'ready', must_address: [], summary: 'The synthesis, in a paragraph.',
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

  // The fixture moved ONCE on purpose: 0.4.0 writes `"mode": "full"` on every result, so a
  // reader never infers the mode from an absence. That key was asked for; scenarios were not.
  const fixture = path.join(SKILL_DIR, 'tests', 'fixtures', 'result-no-scenarios.json');
  assert.equal(`${JSON.stringify(result, null, 2)}\n`, fs.readFileSync(fixture, 'utf8'),
    'an additive field that changes a document nobody asked to change is not additive');
  assert.equal(result.mode, 'full');
  assert.ok(!('skipped_dimensions' in result), 'a full council skips nothing by design');
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

// ------------------------------------------------------- must_address is a row
//
// The contract calls a must_address entry "one line of work". The instrument itself broke
// it: an unmeasured dimension contributed its whole `unmeasured_reason`, which the member
// brief correctly requires to be a full argument - 1,269 characters in the first real run,
// unrenderable in a row and unactionable as work.

test('every generated must_address entry is one renderable line, and the full reason survives', () => {
  const r = rubricOf('feature-v1');
  const reason = `Two span files originate metered model calls one hop out, so not_applicable would be literally false. ${'There is no local price book for chat tokens anywhere in this checkout; pricing is delegated to a remote service. '.repeat(8)}`;
  const longTitle = `the eight second flush retries forever with no attempt cap and no backoff, ${'resending the whole file tree each time '.repeat(10)}`;
  assert.ok(reason.length > 800 && longTitle.length > 400, 'the fixture must actually be too long');

  const a = aggregate(r, {
    value: v(0.6, { findings: [{ id: 'v1', severity: 'high', title: longTitle, detail: 'd', recurrence: 1 }] }),
    craft: v(0.7), rivalry: v(0.5), robustness: v(0.7),
    economics: unmeasured(reason),
  }, { trustState: 'uncalibrated' });

  assert.equal(MUST_ADDRESS_MAX, 200);
  for (const line of a.must_address) {
    assert.ok(line.length <= MUST_ADDRESS_MAX, `a must_address entry of ${line.length} chars is not a row`);
    assert.ok(!/\n/.test(line), 'a must_address entry is one line');
  }
  // The unmeasured entry keeps the FIRST SENTENCE, and the whole reason stays on the
  // dimension - nothing is lost, it just stops being in the work list.
  const entry = a.must_address.find((m) => m.startsWith('economics is unmeasured'));
  assert.match(entry, /not_applicable would be literally false/);
  assert.equal(a.dimensions.find((d) => d.dimension === 'economics').unmeasured_reason, reason);
  // And the high finding contributes its title, clamped, with the detail left in the verdict.
  assert.ok(a.must_address.some((m) => m.startsWith('value: the eight second flush retries forever')));
});

test("a carried-in human rejection is verbatim, however long - it is not the instrument's to edit", () => {
  const r = rubricOf('feature-v1');
  const human = `I rejected this because ${'the timebox table hands seniors the longest case and nobody explained why '.repeat(6)}`;
  const a = aggregate(r, { value: v(0.8), craft: v(0.8), rivalry: v(0.8), robustness: v(0.8), economics: v(0.8) }, {
    trustState: 'uncalibrated', mustAddress: [human],
  });
  assert.ok(a.must_address.includes(human), "a person's own words go in as they were written");
});

test('clampLine and firstSentence do the two jobs they claim', () => {
  assert.equal(clampLine('a b c', 20), 'a b c');
  const long = clampLine('x'.repeat(300), 50);
  assert.equal(long.length, 50);
  assert.ok(long.endsWith('...'));
  assert.equal(clampLine('  multi\n  line\ttext  ', 40), 'multi line text', 'whitespace collapses to one line');
  assert.equal(firstSentence('First one. Second one. Third one.', 160), 'First one.');
  assert.equal(firstSentence('No terminator here', 160), 'No terminator here');
});

test('a low finding never enters must_address - only high does', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, {
    value: v(0.8, {
      findings: [
        // The fence artefact the first real run manufactured: imperative grammar in the
        // repo's OWN declared overlay, which needs no product change. It is `low` now, and
        // a low finding is not next round's work.
        { id: 'v-fence', severity: 'low', title: 'imperative grammar in the declared uat/ overlay, addressed to the repo, not to me', detail: 'd', recurrence: 8 },
        { id: 'v-xref', severity: 'low', title: 'unbounded event buffer (cross-reference: economics owns this)', detail: 'd', recurrence: 1 },
        { id: 'v-med', severity: 'med', title: 'a med finding is not work either', detail: 'd', recurrence: 1 },
      ],
    }),
    craft: v(0.8), rivalry: v(0.8), robustness: v(0.8), economics: v(0.8),
  }, { trustState: 'uncalibrated' });
  assert.deepEqual(a.must_address, [], 'nothing below high is promoted');

  const promoted = aggregate(r, {
    value: v(0.8, { findings: [{ id: 'v-real', severity: 'high', title: 'instruction inside candidate text', detail: 'd', recurrence: 1 }] }),
    craft: v(0.8), rivalry: v(0.8), robustness: v(0.8), economics: v(0.8),
  }, { trustState: 'uncalibrated' });
  assert.deepEqual(promoted.must_address, ['value: instruction inside candidate text'], 'and high still is');
});

// ------------------------------------------------------------ verdict contract

test('validate --verdict catches a missing recurrence before aggregate ever runs', () => {
  const good = {
    dimension: 'robustness', state: 'measured', score: 0.68, confidence: 'med', unmeasured_reason: null,
    findings: [{ id: 'rob-1', severity: 'med', title: 'typecheck exits 2 outside the span', detail: 'd', recurrence: 1 }],
    evidence: [{ kind: 'metric', ref: 'npm run typecheck', caption: 'exit 2, 0 span-attributable findings' }],
    techniques: [{ subject: 'quality-gates', technique: 'metric-gates', proof: 'execution' }],
    delta: null,
  };
  assert.deepEqual(validateVerdict(good, { dimension: 'robustness' }), []);

  // The exact shape the first real run shipped: three of eleven findings with no
  // `recurrence`, caught only at aggregation, after every member had already spent.
  const missing = { ...good, findings: [{ id: 'rob-2', severity: 'high', title: 'no test in the span covers the failure paths', detail: 'd' }] };
  const problems = validateVerdict(missing, { dimension: 'robustness' });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /finding rob-2: recurrence must be an integer >= 1/);

  assert.ok(validateVerdict({ ...good, dimension: 'value' }, { dimension: 'robustness' })
    .some((x) => /filed under the wrong dimension/.test(x)));
  assert.ok(validateVerdict({ ...good, state: 'unmeasured', score: null }, {})
    .some((x) => /unmeasured needs unmeasured_reason/.test(x)));
  assert.ok(validateVerdict({ ...good, state: 'unmeasured', score: 0, unmeasured_reason: 'r' }, {})
    .some((x) => /never a zero/.test(x)));
  assert.ok(validateVerdict({ ...good, confidence: 'vibes' }, {}).some((x) => /confidence must be one of/.test(x)));
  assert.ok(validateVerdict('not an object', {}).some((x) => /not a JSON object/.test(x)));
});

// --------------------------------------------------------- receipt disclosures
//
// A span is inherited from the consuming repo's own feature map, and in the first real run
// that map was wrong twice - 454 lines of tests pinning a module NOT in the span, and a
// declared API surface with no route behind it. The digest gave both the authority of a
// measurement. These are disclosures, never refusals.

test('the receipt discloses an orphan test and a test-heavy span, without refusing either', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-orphan-'));
  try {
    fs.mkdirSync(path.join(root, 'app'), { recursive: true });
    fs.writeFileSync(path.join(root, 'app', 'in-span.ts'), 'export const a = 1;\n');
    fs.writeFileSync(path.join(root, 'app', 'out-of-span.ts'), 'export const b = 2;\n');
    // Two test files: one tests a module inside the span, one tests a module outside it.
    fs.writeFileSync(path.join(root, 'app', 'in-span.test.ts'), "import { a } from './in-span';\n");
    fs.writeFileSync(path.join(root, 'app', 'orphan.test.ts'), "import { b } from './out-of-span';\n");

    const span = ['app/in-span.ts', 'app/in-span.test.ts', 'app/orphan.test.ts'];
    const r = buildReceipt({ root, paths: span, headSha: 'deadbeef' });

    assert.deepEqual(r.orphan_tests, [{ path: 'app/orphan.test.ts', subjects: ['app/out-of-span.ts'] }]);
    assert.equal(r.test_file_count, 2);
    assert.equal(r.source_file_count, 1);
    assert.equal(r.tests_outnumber_sources, true);
    assert.deepEqual(r.missing, [], 'a disclosure is not a refusal: the receipt still built');
    assert.match(r.span_digest, /^[0-9a-f]{64}$/);

    // A test whose specifiers resolve to nothing is NOT an orphan: absence of evidence is
    // not evidence, and a false orphan sends a Director hunting a map error that is not there.
    fs.writeFileSync(path.join(root, 'app', 'opaque.test.ts'), "import { z } from 'some-package';\n");
    const r2 = buildReceipt({ root, paths: [...span, 'app/opaque.test.ts'] });
    assert.deepEqual(r2.orphan_tests.map((o) => o.path), ['app/orphan.test.ts']);

    // And the disclosures are additive: they do not move the digest.
    assert.equal(buildReceipt({ root, paths: span }).span_digest, r.span_digest);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('the test-file heuristic recognises the conventions it documents, and nothing else', () => {
  for (const p of ['tests/a.mjs', 'src/__tests__/a.ts', 'spec/a.rb', 'a/b/foo.test.ts', 'foo.spec.tsx', 'test_foo.py', 'foo_test.go']) {
    assert.equal(isTestFile(p), true, `${p} is a test file`);
  }
  for (const p of ['src/testimonials.ts', 'app/latest.ts', 'src/contest/a.ts', 'specimen.py']) {
    assert.equal(isTestFile(p), false, `${p} is not a test file`);
  }
  // With no files at all the disclosure is honest rather than alarming.
  assert.deepEqual(spanDisclosures('.', []), {
    test_file_count: 0, source_file_count: 0, orphan_tests: [], tests_outnumber_sources: false,
  });
});

// ---------------------------------------------------------------- lite mode
//
// Lite is ONE pass over value, craft and robustness of feature-v1, written in the council's
// own result document so it reaches the same door. What is pinned: the skipped rows are
// unmeasured (never not_applicable, never zero), they lower coverage and add no work, the
// mean is over what was scored, and the validator holds a lite result to its scope.

const COUNCIL = path.join(SKILL_DIR, 'scripts', 'council.mjs');
const liteVerdicts = (over = {}) => ({ value: v(0.8), craft: v(0.6), robustness: v(0.9), ...over });
const liteMeta = (over = {}) => ({
  mode: 'lite',
  run_id: '2026-10-07-example-feature-lite-r1',
  subject: { kind: 'use_case', slug: 'example-feature', title: 'Example feature', summary: 'What it does.' },
  rubric_version: 'feature-v1',
  round_no: 1,
  supersedes_run_id: null,
  trust_state: 'uncalibrated',
  receipt: { head_sha: 'a'.repeat(40), spanned_paths: ['src/a.ts'], span_digest: '0'.repeat(64) },
  hard_failures: [],
  summary: 'Lite pass: value and robustness hold; craft has one unrecorded gap.',
  ...over,
});

test('the lite scope is exactly the rubric, split in two, and only feature-v1 has one', () => {
  assert.deepEqual(MODES, ['full', 'lite']);
  const r = rubricOf('feature-v1');
  const scope = liteScopeFor(r);
  assert.deepEqual([...scope.judged], ['value', 'craft', 'robustness']);
  assert.deepEqual([...scope.skipped], ['rivalry', 'economics']);
  assert.deepEqual([...scope.judged, ...scope.skipped].sort(), r.dimensions.map((d) => d.dimension).sort(),
    'judged + skipped must be the rubric, or the validator and the instrument disagree on what lite owes');
  assert.deepEqual(Object.keys(LITE_SCOPES), ['feature-v1']);
  assert.throws(() => liteScopeFor(rubricOf('architecture-v1')), /no lite scope/);
  assert.throws(() => aggregate(rubricOf('architecture-v1'), {}, { mode: 'lite' }), /a redesign goes to the full council/);
  assert.throws(() => aggregate(r, {}, { mode: 'quick' }), /mode must be one of/);
});

test('lite: skipped rows are unmeasured, lower coverage, leave the mean, and add no work', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, liteVerdicts(), { trustState: 'uncalibrated', mode: 'lite' });
  assert.equal(a.mode, 'lite');
  assert.deepEqual(a.skipped_dimensions, ['rivalry', 'economics']);
  for (const name of ['rivalry', 'economics']) {
    const d = a.dimensions.find((x) => x.dimension === name);
    assert.equal(d.state, 'unmeasured', `${name} exists for this subject and nobody looked - never not_applicable`);
    assert.equal(d.score, null, 'and never a zero');
    assert.equal(d.unmeasured_reason, liteSkipReason(name));
  }
  // (.30*.8 + .25*.6 + .15*.9) / .70 - the mean is over what was scored
  assert.equal(a.overall, Math.round(((0.3 * 0.8 + 0.25 * 0.6 + 0.15 * 0.9) / 0.7) * 10000) / 10000);
  // coverage stays over the whole rubric: a complete lite rests on 70% of it, and says so
  assert.equal(a.coverage, 0.7);
  assert.equal(a.outcome, 'ready');
  assert.ok(!a.must_address.some((m) => /rivalry|economics/.test(m)),
    'the scope of the review is not work an implementer can do');
  assert.deepEqual(a.must_address, []);
});

test('lite: a verdict for a skipped row is ignored loudly, and the pass rule is the council one', () => {
  const r = rubricOf('feature-v1');
  const a = aggregate(r, liteVerdicts({ rivalry: v(0.1), economics: v(0.1) }), { mode: 'lite' });
  assert.equal(a.dimensions.find((d) => d.dimension === 'rivalry').state, 'unmeasured');
  assert.equal(a.problems.filter((p) => /lite run does not judge/.test(p)).length, 2);

  // The mechanical floor still binds; a missing judged row still adds work.
  assert.equal(aggregate(r, liteVerdicts({ robustness: v(0.3) }), { mode: 'lite' }).outcome, 'fail');
  const noCraft = aggregate(r, liteVerdicts({ craft: unmeasured('no governing pairs and no recognisable category of work') }), { mode: 'lite' });
  assert.equal(noCraft.coverage, 0.45);
  assert.equal(noCraft.outcome, 'incomplete', 'a lite pass that could not judge craft rests on 45% of the rubric');
  assert.ok(noCraft.must_address.some((m) => m.startsWith('craft is unmeasured')));
  // Lite rounds share the cap's NUMBER, counted in their own mode.
  assert.equal(aggregate(r, liteVerdicts(), { mode: 'lite', roundNo: 4 }).outcome, 'stalled');
});

test('lite and full results both validate; a lite result is held to its scope', () => {
  const r = rubricOf('feature-v1');
  const lite = buildResult(liteMeta(), aggregate(r, liteVerdicts(), { mode: 'lite' }));
  assert.deepEqual(validateResult(lite), []);
  assert.equal(lite.mode, 'lite');
  assert.deepEqual(lite.skipped_dimensions, ['rivalry', 'economics']);
  assert.equal(lite.dimensions.length, 5, 'the door requires every rubric row, the skipped ones included');

  const full = buildResult(liteMeta({ mode: undefined, run_id: '2026-10-07-example-feature-r1' }),
    aggregate(r, { ...liteVerdicts(), rivalry: v(0.5), economics: na() }, {}));
  assert.deepEqual(validateResult(full), []);
  assert.equal(full.mode, 'full');
  const { mode: _m, ...legacy } = full;
  assert.deepEqual(validateResult(legacy), [], 'a result written before modes existed reads as full');

  const refuses = (doc, re) => assert.ok(validateResult(doc).some((x) => re.test(x)), `expected ${re}`);
  refuses({ ...lite, summary: '' }, /summary is required/);
  refuses({ ...lite, summary: '   \n ' }, /summary is required/);
  refuses({ ...lite, must_address: undefined }, /must_address is required/);
  refuses({ ...lite, mode: 'quick' }, /mode must be one of full, lite/);
  const { skipped_dimensions: _s, ...noSkipped } = lite;
  refuses(noSkipped, /skipped_dimensions must be an array/);
  refuses({ ...lite, skipped_dimensions: ['rivalry'] }, /must be exactly rivalry, economics/);
  refuses({ ...lite, skipped_dimensions: ['rivalry', 'value'] }, /must be exactly rivalry, economics/);
  refuses({ ...lite, dimensions: lite.dimensions.filter((d) => d.dimension !== 'economics') }, /must carry economics/);
  refuses({ ...lite, dimensions: lite.dimensions.filter((d) => d.dimension !== 'craft') }, /must carry craft/);
  refuses({
    ...lite,
    dimensions: lite.dimensions.map((d) => (d.dimension === 'rivalry' ? { ...d, state: 'measured', score: 0.9, unmeasured_reason: null } : d)),
  }, /rivalry is skipped in lite and must be unmeasured/);
  refuses({ ...lite, subject: { ...lite.subject, kind: 'architecture' }, rubric_version: 'architecture-v1' }, /only a use_case subject/);
  refuses({ ...full, skipped_dimensions: ['rivalry', 'economics'] }, /belongs to a lite result only/);
  assert.throws(() => buildResult(liteMeta(), aggregate(r, liteVerdicts(), {})), /run says mode lite/);
});

test('validate --verdict in lite refuses a row lite does not judge', () => {
  const good = { dimension: 'craft', state: 'measured', score: 0.6, confidence: 'med', unmeasured_reason: null, findings: [], evidence: [], techniques: [], delta: null };
  assert.deepEqual(validateVerdict(good, { dimension: 'craft', mode: 'lite' }), []);
  assert.ok(validateVerdict({ ...good, dimension: 'rivalry' }, { dimension: 'rivalry', mode: 'lite' })
    .some((x) => /lite pass does not judge rivalry/.test(x)));
  assert.deepEqual(validateVerdict({ ...good, dimension: 'rivalry' }, { dimension: 'rivalry', mode: 'full' }), []);
  assert.ok(validateVerdict(good, { mode: 'lite', rubricVersion: 'architecture-v1' }).some((x) => /no lite scope/.test(x)));
});

// ------------------------------------------------------------------- rounds

test('rounds are counted per mode, capped per mode, and chained per mode', () => {
  const dirs = [
    '2026-10-01-checkout-r1', '2026-10-02-checkout-r2',
    '2026-10-01-checkout-lite-r1', '2026-10-03-checkout-lite-r2', '2026-10-04-checkout-lite-r3',
    '2026-10-01-other-checkout-r1', // a different subject whose slug ENDS in "checkout"
    '2026-10-01-checkout-r1-notes', // not a run directory
  ];
  const full = nextRound(dirs, 'checkout', 'full');
  assert.deepEqual([full.round_no, full.supersedes_run_id, full.stalled], [3, '2026-10-02-checkout-r2', false]);
  const lite = nextRound(dirs, 'checkout', 'lite');
  assert.deepEqual([lite.round_no, lite.supersedes_run_id, lite.stalled], [4, '2026-10-04-checkout-lite-r3', true],
    'three lite passes did not converge - a person looks, and no full round was burned');
  assert.deepEqual(nextRound([], 'checkout', 'lite'), { mode: 'lite', round_no: 1, supersedes_run_id: null, stalled: false, prior_rounds: [] });
  assert.equal(runDirName('2026-10-07', 'checkout', 'lite', 2), '2026-10-07-checkout-lite-r2');
  assert.equal(runDirName('2026-10-07', 'checkout', 'full', 2), '2026-10-07-checkout-r2');

  // The one ambiguous name: a full run of slug `checkout-lite` looks like a lite run of
  // `checkout`. The run's own started.json decides.
  const ambiguous = [{ name: '2026-10-01-checkout-lite-r1', started: { subject: { slug: 'checkout-lite' }, mode: 'full' } }];
  assert.equal(nextRound(ambiguous, 'checkout', 'lite').round_no, 1);
  assert.equal(nextRound(ambiguous, 'checkout-lite', 'full').round_no, 2);
  assert.throws(() => nextRound(dirs, 'checkout', 'quick'), /mode must be one of/);
});

// ---------------------------------------------------------- the CLI, end to end

const runCli = (args) => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, [COUNCIL, ...args], { encoding: 'utf8', env });
};

test('CLI: a lite run aggregates from started.json, validates, and an empty summary is refused', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-lite-'));
  try {
    const runs = path.join(root, 'runs');
    const round = runCli(['round', '--runs-dir', runs, '--slug', 'example-feature', '--mode', 'lite', '--date', '2026-10-07']);
    assert.equal(round.status, 0, round.stderr);
    const next = JSON.parse(round.stdout);
    assert.equal(next.run_id, '2026-10-07-example-feature-lite-r1');

    const dir = path.join(runs, next.run_id);
    fs.mkdirSync(dir, { recursive: true });
    const meta = liteMeta();
    fs.writeFileSync(path.join(dir, 'started.json'), JSON.stringify({
      run_id: next.run_id, mode: 'lite', subject: meta.subject, rubric_version: 'feature-v1',
      round_no: next.round_no, supersedes_run_id: next.supersedes_run_id, trust_state: 'uncalibrated', receipt: meta.receipt,
    }));
    for (const [name, verdict] of Object.entries(liteVerdicts())) {
      fs.writeFileSync(path.join(dir, `verdict-${name}.json`), JSON.stringify({ dimension: name, unmeasured_reason: null, delta: null, ...verdict }));
      const vr = runCli(['validate', '--verdict', path.join(dir, `verdict-${name}.json`), '--mode', 'lite']);
      assert.equal(vr.status, 0, vr.stdout);
    }
    // A stale rivalry verdict in the directory is not read in lite.
    fs.writeFileSync(path.join(dir, 'verdict-rivalry.json'), JSON.stringify({ dimension: 'rivalry', ...v(0.1) }));

    const noSummary = runCli(['aggregate', '--run-dir', dir]);
    assert.equal(noSummary.status, 2, 'aggregate refuses to write a lite result with no summary');
    assert.ok(!fs.existsSync(path.join(dir, 'result.json')));

    const contradicted = runCli(['aggregate', '--run-dir', dir, '--summary', 's', '--mode', 'full']);
    assert.equal(contradicted.status, 2);
    assert.match(contradicted.stderr, /contradicts started\.json/);

    const agg = runCli(['aggregate', '--run-dir', dir, '--summary', meta.summary]);
    assert.equal(agg.status, 0, agg.stderr);
    const out = JSON.parse(agg.stdout);
    assert.deepEqual([out.mode, out.outcome, out.coverage, out.skipped_dimensions], ['lite', 'ready', 0.7, ['rivalry', 'economics']]);
    assert.deepEqual(out.problems, []);

    const resultFile = path.join(dir, 'result.json');
    const ok = runCli(['validate', '--result', resultFile]);
    assert.equal(ok.status, 0, ok.stdout);
    assert.equal(JSON.parse(ok.stdout).mode, 'lite');

    const written = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
    fs.writeFileSync(resultFile, JSON.stringify({ ...written, summary: '' }));
    const refused = runCli(['validate', '--result', resultFile]);
    assert.equal(refused.status, 1, 'validate refuses a lite result with an empty summary');
    assert.match(refused.stdout, /summary is required/);

    const rv = runCli(['validate', '--verdict', path.join(dir, 'verdict-rivalry.json'), '--mode', 'lite']);
    assert.equal(rv.status, 1);

    const second = JSON.parse(runCli(['round', '--runs-dir', runs, '--slug', 'example-feature', '--mode', 'lite', '--date', '2026-10-08']).stdout);
    assert.deepEqual([second.round_no, second.supersedes_run_id], [2, next.run_id]);
    const firstFull = JSON.parse(runCli(['round', '--runs-dir', runs, '--slug', 'example-feature', '--date', '2026-10-08']).stdout);
    assert.deepEqual([firstFull.round_no, firstFull.supersedes_run_id, firstFull.run_id], [1, null, '2026-10-08-example-feature-r1'],
      'a lite pass does not burn a full round');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------------------------------- report

/**
 * A run directory built from tests/fixtures/report-run in a temp dir, so rendering never
 * writes into the tree. The fixture keeps its markdown as report-md.txt and this places
 * it as report.md, the name a real run uses.
 */
function reportRun(root, { withReport = true, withResult = true } = {}) {
  const src = path.join(SKILL_DIR, 'tests', 'fixtures', 'report-run');
  const dir = path.join(root, 'runs', '2026-10-09-example-feature-r1');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ['verdict-value.json', 'verdict-robustness.json']) fs.copyFileSync(path.join(src, f), path.join(dir, f));
  if (withResult) fs.copyFileSync(path.join(src, 'result.json'), path.join(dir, 'result.json'));
  if (withReport) fs.copyFileSync(path.join(src, 'report-md.txt'), path.join(dir, 'report.md'));
  return dir;
}

test('report writes one self-contained page: the verdict, every member, a contents landmark', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-report-'));
  try {
    const dir = reportRun(root);
    const r = runCli(['report', '--run-dir', dir]);
    assert.equal(r.status, 0, r.stderr);
    const out = path.join(dir, 'report.html');
    assert.deepEqual(JSON.parse(r.stdout), { written: out });
    const html = fs.readFileSync(out, 'utf8');

    assert.match(html, /^<!doctype html>/);
    assert.ok(html.includes('Example Feature Under Review'), 'the subject title');
    for (const name of ['value', 'craft', 'rivalry', 'robustness', 'economics']) {
      assert.ok(html.includes(`id="m-${name}"`), `a section for ${name}`);
      assert.ok(html.includes(`>${name[0].toUpperCase()}${name.slice(1)}</h2>`), `${name} named in its heading`);
    }
    assert.match(html, /<span class="k-n">0\.60<\/span>/, 'the overall, as the hero tile shows it');
    assert.match(html, /<nav class="rail" aria-label="Contents">/, 'the contents rail is a nav landmark');
    assert.ok(html.includes('id="f-value-1"'), 'a finding from a verdict file the result does not carry');
    assert.ok(html.includes('href="#f-value-1"'), 'the must-address line links to the finding it came from');
    // Self-contained: no network, and nothing names the machine it was rendered on.
    assert.doesNotMatch(html, /<(?:link|img|iframe)\b|src="https?:/);
    assert.ok(!html.includes(root) && !html.includes(dir), 'no machine path in the page');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('report prints markup from report.md as text: a <script> never runs, a javascript: link loses its href', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-report-'));
  try {
    const dir = reportRun(root);
    assert.equal(runCli(['report', '--run-dir', dir]).status, 0);
    const html = fs.readFileSync(path.join(dir, 'report.html'), 'utf8');
    assert.ok(!html.includes('<script>alert('), 'the injected script is not a script');
    assert.ok(html.includes('&lt;script&gt;alert(&quot;council-fixture-injection&quot;)&lt;/script&gt;'), 'it is printed, escaped');
    assert.equal(html.match(/<script\b/g).length, 1, "the page's one script is its own");
    assert.ok(!/<img\b/.test(html), 'an inline <img> is text');
    assert.ok(!/href="javascript:/i.test(html), 'a javascript: link keeps its words and loses its href');
    assert.ok(html.includes('href="https://example.com/docs"'), 'an https link survives');
    assert.ok(html.includes('&lt;b&gt;not markup&lt;/b&gt;'), 'fenced code is escaped');
    assert.ok(html.includes('<del>a retracted claim</del>') && html.includes('<blockquote class="quote">'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('report is deterministic: a re-render of the same run is byte-identical', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-report-'));
  try {
    const dir = reportRun(root);
    assert.equal(runCli(['report', '--run-dir', dir]).status, 0);
    const first = fs.readFileSync(path.join(dir, 'report.html'));
    assert.equal(runCli(['report', '--run-dir', dir]).status, 0);
    assert.ok(first.equals(fs.readFileSync(path.join(dir, 'report.html'))));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('report refuses a run without report.md or result.json, with exit 2 and no file written', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'council-report-'));
  try {
    for (const [opts, missing] of [[{ withReport: false }, 'report.md'], [{ withResult: false }, 'result.json']]) {
      const dir = reportRun(fs.mkdtempSync(path.join(root, 'r-')), opts);
      const r = runCli(['report', '--run-dir', dir]);
      assert.equal(r.status, 2, `missing ${missing}`);
      assert.ok(r.stderr.includes(`no ${missing} in`), r.stderr);
      assert.ok(!fs.existsSync(path.join(dir, 'report.html')));
    }
    assert.equal(runCli(['report']).status, 2, 'no --run-dir');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('the dependency-free markdown parser yields the shapes the page is designed over', () => {
  const md = [
    '| A | B |', '|:--|--:|', '| `x\\|y` | 2 |', '',
    '1. one', '   - nested', '2. two', '', '   loose', '',
    'tight **bold** and *em* <b>raw</b> https://example.com/x.',
  ].join('\n');
  const [table, list, para] = parseMarkdown(md).children;
  assert.equal(table.type, 'table');
  assert.deepEqual(table.align, ['left', 'right']);
  assert.deepEqual(table.children[1].children[0].children, [{ type: 'inlineCode', value: 'x|y' }], 'an escaped pipe inside code');
  assert.equal(list.type, 'list');
  assert.equal(list.ordered, true);
  assert.equal(list.children[0].children[1].type, 'list', 'nested list');
  assert.deepEqual(list.children.map((i) => i.spread), [false, true], 'only the item with a blank line inside is loose');
  assert.deepEqual(para.children.map((c) => c.type), ['text', 'strong', 'text', 'emphasis', 'text', 'html', 'text', 'html', 'text', 'link', 'text']);
  assert.equal(para.children[9].url, 'https://example.com/x', 'a literal autolink, its trailing period left out');
});
