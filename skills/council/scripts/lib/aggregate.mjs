// aggregate - turn one verdict per dimension into one outcome, by a rule nobody may
// improvise at the end of a long run.
//
// Four properties are the whole point, and each one exists because the obvious
// implementation gets it wrong:
//
//  1. **An unmeasured dimension is never a zero.** It leaves the weighted mean entirely
//     and lowers COVERAGE instead. Scoring it zero would let a council that could not
//     measure the most important thing report a confident low number.
//  2. **The mean is renormalised over the weight actually measured**, so a rubric with
//     one dimension missing still produces a number on the same 0..1 scale - and the
//     coverage figure beside it says how much of the rubric that number rests on.
//  3. **`not_applicable` leaves BOTH sums.** It is not missing evidence; it is a
//     dimension that does not exist for this subject, so it neither scores nor counts
//     against coverage.
//  4. **The outcome set is closed and contains no admitting value.** `ready` means the
//     evidence is clean enough to put in front of a person. The person admits. A skill
//     that could emit `approved` would eventually emit it unattended.
//
// Floors bind differently by kind while the judges are uncalibrated. A MECHANICAL floor
// (robustness, reversibility) is a measurement and fails the run. A JUDGED floor is a
// model's opinion, and until repeatability has been measured it is recorded with
// `advisory: true` and does NOT fail - it is loud in the report and inert in the gate.

export const OUTCOMES = ['ready', 'fail', 'incomplete', 'stalled'];
export const DIMENSION_STATES = ['measured', 'unmeasured', 'not_applicable', 'carried'];
export const DIMENSION_KINDS = ['mechanical', 'judged', 'mixed'];
export const TRUST_STATES = ['uncalibrated', 'untrusted', 'trusted'];
export const CONFIDENCES = ['low', 'med', 'high'];
export const SEVERITIES = ['low', 'med', 'high'];
export const HARD_FAILURE_CODES = ['credential_outside_vault', 'write_outside_door', 'unbounded_foreign_decode'];
export const PROOFS = ['execution', 'inspection', 'claim'];
export const SUBJECT_KINDS = ['use_case', 'architecture'];

// ---------------------------------------------------------------- scenarios
//
// A feature can be certified as a whole and still perform differently by branch: an AI
// interviewer excellent with engineering candidates and poor with marketing ones is
// "approved" by a mean and broken for half its users. So a `use_case` verdict may carry a
// per-scenario view, and an approval becomes an ENVELOPE - where it holds, where it is
// weak, and where nobody looked - rather than a stamp.
//
// The scopes are declared by the product (exported to `<repo>/.personas/council/state.json`),
// never by the member that scores them: a judge that may also decide which branches count
// can always pass by narrowing the question.
export const SCENARIO_SCOPES = ['proposed', 'must_hold', 'tracked', 'out_of_scope'];
export const SCENARIO_STATES = ['measured', 'unmeasured'];
/** The proof ladder, strongest first. `simulated` is a model playing the user - it can
 *  flag a weakness and it cannot, alone, certify a `must_hold` branch. */
export const SCENARIO_PROOFS = ['observed', 'replayed', 'simulated', 'claimed'];
/** Only these two scopes are in scope: the other two never move a number. */
export const IN_SCOPE_SCENARIO_SCOPES = new Set(['must_hold', 'tracked']);
export const DEFAULT_SCENARIO_FLOOR = 0.5;

/** A dimension in one of these states carries a real score into the mean. */
export const SCORING_STATES = new Set(['measured', 'carried']);
/** The method refuses a fourth round; three is the cap. */
export const ROUND_CAP = 3;

const round4 = (n) => Math.round(n * 10000) / 10000;

export function validateRubric(rubric) {
  const problems = [];
  if (!rubric || typeof rubric !== 'object') return ['rubric: not an object'];
  if (typeof rubric.version !== 'string' || !rubric.version) problems.push('rubric: version is required');
  if (!SUBJECT_KINDS.includes(rubric.kind)) problems.push(`rubric: kind must be one of ${SUBJECT_KINDS.join(', ')}`);
  if (typeof rubric.threshold !== 'number') problems.push('rubric: threshold is required');
  if (typeof rubric.coverage_floor !== 'number') problems.push('rubric: coverage_floor is required');
  if (!Array.isArray(rubric.dimensions) || !rubric.dimensions.length) return [...problems, 'rubric: dimensions must be a non-empty array'];
  let total = 0;
  for (const d of rubric.dimensions) {
    if (typeof d.dimension !== 'string') problems.push('rubric: a dimension has no name');
    if (!DIMENSION_KINDS.includes(d.kind)) problems.push(`rubric: ${d.dimension}: kind must be one of ${DIMENSION_KINDS.join(', ')}`);
    if (typeof d.weight !== 'number' || !(d.weight > 0)) problems.push(`rubric: ${d.dimension}: weight must be a positive number`);
    else total += d.weight;
    if (d.floor !== null && typeof d.floor !== 'number') problems.push(`rubric: ${d.dimension}: floor must be a number or null`);
    if (!d.weight_rationale) problems.push(`rubric: ${d.dimension}: weight_rationale is required - a weight nobody can defend is a weight nobody will question`);
  }
  if (Math.abs(total - 1) > 1e-9) problems.push(`rubric: weights sum to ${round4(total)}, not 1`);
  return problems;
}

/**
 * Normalise one member's verdict against its rubric row.
 *
 * Fail-loud, not fail-quiet: a verdict claiming `measured` with no score is a broken
 * member, and inventing a zero for it is how a council reports a number it never had.
 */
export function normalizeDimension(rubricDim, verdict, trustState) {
  const problems = [];
  const v = verdict ?? { state: 'unmeasured', unmeasured_reason: 'no verdict file was produced' };
  const state = DIMENSION_STATES.includes(v.state) ? v.state : 'unmeasured';
  if (!DIMENSION_STATES.includes(v.state)) problems.push(`${rubricDim.dimension}: unknown state ${JSON.stringify(v.state)} - read as unmeasured`);

  let score = typeof v.score === 'number' ? v.score : null;
  if (SCORING_STATES.has(state)) {
    if (score === null) { problems.push(`${rubricDim.dimension}: state ${state} with no score`); }
    else if (score < 0 || score > 1) { problems.push(`${rubricDim.dimension}: score ${score} is outside 0..1`); score = Math.min(1, Math.max(0, score)); }
  } else if (score !== null) {
    problems.push(`${rubricDim.dimension}: state ${state} must carry score null, not ${score}`);
    score = null;
  }
  if (state === 'unmeasured' && !v.unmeasured_reason) problems.push(`${rubricDim.dimension}: unmeasured without a reason - "could not measure" is a finding, not a blank`);

  const floor = rubricDim.floor ?? null;
  const floorHit = floor !== null && score !== null && score < floor;
  // Mechanical floors are measurements and bind now. Judged floors are opinions and bind
  // only once the judges have been shown to repeat themselves.
  const judged = rubricDim.kind !== 'mechanical';
  const advisory = floorHit && judged && trustState !== 'trusted';

  return {
    problems,
    dimension: rubricDim.dimension,
    kind: rubricDim.kind,
    state,
    score,
    confidence: CONFIDENCES.includes(v.confidence) ? v.confidence : 'low',
    floor,
    floor_hit: floorHit,
    advisory,
    unmeasured_reason: state === 'unmeasured' ? (v.unmeasured_reason ?? null) : null,
    findings: Array.isArray(v.findings) ? v.findings : [],
    evidence: Array.isArray(v.evidence) ? v.evidence : [],
    techniques: Array.isArray(v.techniques) ? v.techniques : [],
    delta: typeof v.delta === 'number' ? v.delta : null,
    ...(v.carried_from_run_id ? { carried_from_run_id: v.carried_from_run_id } : {}),
    ...(v.carried_drift ? { carried_drift: v.carried_drift } : {}),
  };
}

/**
 * Fold the product's DECLARED scenarios and the value member's REPORTED ones into one
 * per-scenario view plus the envelope.
 *
 * Pure: same inputs, same output, no clock, no filesystem. A consumer in another language
 * mirrors it by following the rule order below literally - it is the contract, not an
 * implementation detail.
 *
 * THE RULE ORDER (mirrored by the Rust door; do not reorder without changing both):
 *
 *  S1. Index the declared scenarios by `slug` (first wins; a duplicate is a problem, not a
 *      silent overwrite). Index the reported ones the same way.
 *  S2. The scenario set is: every declared slug in declared order, then every reported slug
 *      that was not declared, in reported order. A reported slug with no declaration is
 *      DISCOVERED and is treated as scope `proposed`.
 *  S3. `scope` comes from the declaration only. An unknown or missing scope reads as
 *      `proposed`. A member may propose; it may not promote.
 *  S4. `state` is `measured` only when the report says `measured` AND carries a numeric
 *      score; otherwise `unmeasured`. `measured` clamps the score into 0..1. `unmeasured`
 *      carries `score: null` - never 0, for the same reason an unmeasured dimension does not.
 *  S5. `floor` = the declared floor when it is a number, else DEFAULT_SCENARIO_FLOOR (0.5).
 *  S6. `floor_hit` = scope is `must_hold` AND state is `measured` AND score < floor.
 *      `tracked` never hits a floor; `proposed` and `out_of_scope` never compute one.
 *  S7. `advisory` = `floor_hit` AND trust_state != `trusted` - the same asymmetry a judged
 *      dimension floor has, because a scenario score is a judged opinion too.
 *  S8. Envelope buckets, one scenario in exactly one bucket:
 *        scope `proposed`      -> proposed       (whatever its state)
 *        scope `out_of_scope`  -> out_of_scope   (whatever its state)
 *        in scope, unmeasured  -> unmeasured
 *        in scope, measured    -> holds when score >= the bucket floor, else weak
 *      The bucket floor is the scenario's floor for `must_hold` and a flat 0.5 for
 *      `tracked` (a tracked branch is watched, not governed by a declared floor).
 *  S9. Every `floor_hit` - advisory or binding - produces one `must_address` line:
 *      `Scenario <title> is below its floor (<score> < <floor>)`.
 * S10. The proof ladder is recorded and is NOT enforced here. "This is only simulated"
 *      belongs in the scenario's `summary`, where a person reads it; turning it into a
 *      gate would be this instrument deciding what counts as evidence, which is the
 *      member's job and the person's.
 *
 * @param {Array}  declared  state.json scenarios for this subject: {slug,title,axes,scope,floor}
 * @param {Array}  reported  the value member's scenario reports
 * @param {object} opts      { trustState }
 */
export function aggregateScenarios(declared, reported, opts = {}) {
  const trustState = TRUST_STATES.includes(opts.trustState) ? opts.trustState : 'uncalibrated';
  const problems = [];

  const index = (rows, what) => {                                    // S1
    const m = new Map();
    for (const row of Array.isArray(rows) ? rows : []) {
      const slug = typeof row?.slug === 'string' && row.slug ? row.slug : null;
      if (!slug) { problems.push(`scenarios: a ${what} scenario has no slug`); continue; }
      if (m.has(slug)) { problems.push(`scenarios: ${slug} appears twice in the ${what} list`); continue; }
      m.set(slug, row);
    }
    return m;
  };
  const decl = index(declared, 'declared');
  const rep = index(reported, 'reported');

  const slugs = [...decl.keys(), ...[...rep.keys()].filter((s) => !decl.has(s))];   // S2

  const scenarios = [];
  const envelope = { holds: [], weak: [], unmeasured: [], out_of_scope: [], proposed: [] };
  const mustAddress = [];
  const bindingFloorHits = [];
  const advisoryFloorHits = [];

  for (const slug of slugs) {
    const d = decl.get(slug) ?? null;
    const r = rep.get(slug) ?? null;

    let scope = 'proposed';                                          // S3
    if (d) {
      if (SCENARIO_SCOPES.includes(d.scope)) scope = d.scope;
      else problems.push(`scenarios: ${slug} declares unknown scope ${JSON.stringify(d.scope)} - read as proposed`);
    }

    let state = r && SCENARIO_STATES.includes(r.state) ? r.state : 'unmeasured';   // S4
    if (r && r.state !== undefined && !SCENARIO_STATES.includes(r.state)) {
      problems.push(`scenarios: ${slug} reports unknown state ${JSON.stringify(r.state)} - read as unmeasured`);
    }
    let score = typeof r?.score === 'number' ? r.score : null;
    if (state === 'measured') {
      if (score === null) { problems.push(`scenarios: ${slug} is measured with no score - read as unmeasured`); state = 'unmeasured'; }
      else if (score < 0 || score > 1) { problems.push(`scenarios: ${slug} score ${score} is outside 0..1`); score = Math.min(1, Math.max(0, score)); }
    }
    if (state !== 'measured' && score !== null) {
      problems.push(`scenarios: ${slug} is ${state} and must carry score null, not ${score}`);
      score = null;
    }

    const floor = typeof d?.floor === 'number' ? d.floor : DEFAULT_SCENARIO_FLOOR;  // S5
    const floorHit = scope === 'must_hold' && state === 'measured' && score < floor;  // S6
    const advisory = floorHit && trustState !== 'trusted';           // S7

    const title = (typeof d?.title === 'string' && d.title) || (typeof r?.title === 'string' && r.title) || slug;
    const axesSource = (d && typeof d.axes === 'object' && d.axes) || (r && typeof r.axes === 'object' && r.axes) || {};
    const axes = {};
    for (const [k, val] of Object.entries(axesSource)) {
      if (typeof val === 'string') axes[k] = val;
      else problems.push(`scenarios: ${slug} axis ${k} is not a string - dropped`);
    }
    if (state === 'measured' && !(typeof r?.summary === 'string' && r.summary)) {
      problems.push(`scenarios: ${slug} is measured with no summary - a score with no sentence beside it is a number nobody can read`);
    }

    scenarios.push({
      slug,
      title,
      axes,
      state,
      score,
      confidence: CONFIDENCES.includes(r?.confidence) ? r.confidence : 'low',
      n: Number.isInteger(r?.n) && r.n >= 1 ? r.n : null,
      proof: SCENARIO_PROOFS.includes(r?.proof) ? r.proof : 'claimed',
      summary: typeof r?.summary === 'string' ? r.summary : '',
    });

    if (scope === 'proposed') envelope.proposed.push(slug);          // S8
    else if (scope === 'out_of_scope') envelope.out_of_scope.push(slug);
    else if (state !== 'measured') envelope.unmeasured.push(slug);
    else {
      const bucketFloor = scope === 'must_hold' ? floor : DEFAULT_SCENARIO_FLOOR;
      (score >= bucketFloor ? envelope.holds : envelope.weak).push(slug);
    }

    if (floorHit) {                                                  // S9
      mustAddress.push(`Scenario ${title} is below its floor (${score} < ${floor})`);
      (advisory ? advisoryFloorHits : bindingFloorHits).push(slug);
    }
  }                                                                  // S10: proof is recorded, never gated

  return { scenarios, envelope, must_address: mustAddress, binding_floor_hits: bindingFloorHits, advisory_floor_hits: advisoryFloorHits, problems };
}

/**
 * The pass rule, in one place.
 *
 * @param {object}   rubric
 * @param {object}   verdicts       dimension name -> the member's verdict JSON
 * @param {object}   opts           { trustState, roundNo, hardFailures, mustAddress,
 *                                    scenarios (declared), reportedScenarios }
 */
export function aggregate(rubric, verdicts, opts = {}) {
  const trustState = TRUST_STATES.includes(opts.trustState) ? opts.trustState : 'uncalibrated';
  const roundNo = Number.isInteger(opts.roundNo) ? opts.roundNo : 1;
  const hardFailures = Array.isArray(opts.hardFailures) ? opts.hardFailures : [];
  const problems = [];

  const dimensions = rubric.dimensions.map((rd) => {
    const n = normalizeDimension(rd, (verdicts ?? {})[rd.dimension], trustState);
    problems.push(...n.problems);
    delete n.problems;
    return n;
  });

  let wScored = 0;
  let wApplicable = 0;
  let acc = 0;
  for (const [i, d] of dimensions.entries()) {
    const w = rubric.dimensions[i].weight;
    if (d.state === 'not_applicable') continue;     // property 3: leaves both sums
    wApplicable += w;
    if (!SCORING_STATES.has(d.state)) continue;     // property 1: unmeasured is not a zero
    wScored += w;
    acc += w * d.score;
  }
  const overall = wScored > 0 ? round4(acc / wScored) : null;   // property 2
  const coverage = wApplicable > 0 ? round4(wScored / wApplicable) : 0;

  const bindingFloors = dimensions.filter((d) => d.floor_hit && !d.advisory);
  const advisoryFloors = dimensions.filter((d) => d.floor_hit && d.advisory);

  // Scenarios are optional and additive: a run with neither a declaration nor a report
  // aggregates exactly as it did before they existed, down to the keys in the document.
  const declaredScenarios = Array.isArray(opts.scenarios) ? opts.scenarios : [];
  const reportedScenarios = Array.isArray(opts.reportedScenarios)
    ? opts.reportedScenarios
    : (Array.isArray((verdicts ?? {}).value?.scenarios) ? verdicts.value.scenarios : []);
  const sc = (declaredScenarios.length || reportedScenarios.length)
    ? aggregateScenarios(declaredScenarios, reportedScenarios, { trustState })
    : null;
  if (sc) problems.push(...sc.problems);

  // Order matters and is doctrine, not taste. The round cap is a REFUSAL TO RUN, so it is
  // read before anything the run produced. A hard failure outranks every score after it.
  // A binding SCENARIO floor sits with the binding dimension floors: once the judges are
  // trusted, a must-hold branch below its floor fails the run however good the mean is -
  // which is the whole reason the per-scenario view exists.
  let outcome;
  if (roundNo > ROUND_CAP) outcome = 'stalled';
  else if (hardFailures.length) outcome = 'fail';
  else if (bindingFloors.length) outcome = 'fail';
  else if (sc && sc.binding_floor_hits.length) outcome = 'fail';
  else if (coverage < rubric.coverage_floor) outcome = 'incomplete';
  else if (trustState === 'trusted' && (overall === null || overall < rubric.threshold)) outcome = 'fail';
  else outcome = 'ready';

  const mustAddress = [...(opts.mustAddress ?? [])];
  for (const h of hardFailures) mustAddress.push(`hard failure ${h.code}: ${h.detail ?? ''}`.trim());
  for (const d of bindingFloors) mustAddress.push(`${d.dimension} scored ${d.score} below its floor of ${d.floor}`);
  for (const d of advisoryFloors) mustAddress.push(`${d.dimension} scored ${d.score} below its advisory floor of ${d.floor} (judges are ${trustState}; not gating)`);
  if (sc) mustAddress.push(...sc.must_address);
  for (const d of dimensions) {
    if (d.state === 'unmeasured') mustAddress.push(`${d.dimension} is unmeasured: ${d.unmeasured_reason ?? 'no reason given'}`);
    for (const f of d.findings) if (f?.severity === 'high') mustAddress.push(`${d.dimension}: ${f.title ?? f.id ?? 'high-severity finding'}`);
  }

  return {
    dimensions,
    ...(sc ? { scenarios: sc.scenarios, envelope: sc.envelope } : {}),
    overall,
    coverage,
    outcome,
    must_address: [...new Set(mustAddress.filter(Boolean))],
    weight_scored: round4(wScored),
    weight_applicable: round4(wApplicable),
    problems,
  };
}

/** Compose the full result document from an aggregate plus the run's identity. */
export function buildResult(meta, agg) {
  return {
    schema_version: 1,
    run_id: meta.run_id,
    subject: meta.subject,
    rubric_version: meta.rubric_version,
    round_no: meta.round_no,
    supersedes_run_id: meta.supersedes_run_id ?? null,
    trust_state: meta.trust_state,
    receipt: meta.receipt,
    hard_failures: meta.hard_failures ?? [],
    dimensions: agg.dimensions,
    // Optional and paired: both keys or neither. A result with no scenarios is byte for
    // byte the document this contract produced before scenarios existed.
    ...(agg.scenarios ? { scenarios: agg.scenarios, envelope: agg.envelope } : {}),
    overall: agg.overall,
    coverage: agg.coverage,
    outcome: agg.outcome,
    must_address: agg.must_address,
    summary: meta.summary ?? '',
  };
}
