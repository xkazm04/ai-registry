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
 * The pass rule, in one place.
 *
 * @param {object}   rubric
 * @param {object}   verdicts       dimension name -> the member's verdict JSON
 * @param {object}   opts           { trustState, roundNo, hardFailures, mustAddress }
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

  // Order matters and is doctrine, not taste. The round cap is a REFUSAL TO RUN, so it is
  // read before anything the run produced. A hard failure outranks every score after it.
  let outcome;
  if (roundNo > ROUND_CAP) outcome = 'stalled';
  else if (hardFailures.length) outcome = 'fail';
  else if (bindingFloors.length) outcome = 'fail';
  else if (coverage < rubric.coverage_floor) outcome = 'incomplete';
  else if (trustState === 'trusted' && (overall === null || overall < rubric.threshold)) outcome = 'fail';
  else outcome = 'ready';

  const mustAddress = [...(opts.mustAddress ?? [])];
  for (const h of hardFailures) mustAddress.push(`hard failure ${h.code}: ${h.detail ?? ''}`.trim());
  for (const d of bindingFloors) mustAddress.push(`${d.dimension} scored ${d.score} below its floor of ${d.floor}`);
  for (const d of advisoryFloors) mustAddress.push(`${d.dimension} scored ${d.score} below its advisory floor of ${d.floor} (judges are ${trustState}; not gating)`);
  for (const d of dimensions) {
    if (d.state === 'unmeasured') mustAddress.push(`${d.dimension} is unmeasured: ${d.unmeasured_reason ?? 'no reason given'}`);
    for (const f of d.findings) if (f?.severity === 'high') mustAddress.push(`${d.dimension}: ${f.title ?? f.id ?? 'high-severity finding'}`);
  }

  return {
    dimensions,
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
    overall: agg.overall,
    coverage: agg.coverage,
    outcome: agg.outcome,
    must_address: agg.must_address,
    summary: meta.summary ?? '',
  };
}
