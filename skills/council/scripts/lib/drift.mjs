// drift - has the subject moved since the verdict that judged it?
//
// A council round is expensive, so the second round must not re-judge what did not
// change. Drift is computed between two receipts and has exactly three answers plus an
// honest fourth:
//
//   none     - identical span digest. Every prior verdict carries forward untouched.
//   grown    - every path the prior receipt hashed is still present with the same bytes,
//              and there are new files. The subject gained surface; the prior verdicts
//              still describe what they judged, so they carry with the growth recorded.
//   changed  - a file the prior receipt hashed is gone or now hashes differently.
//              Every judged verdict is stale; the round re-judges.
//   unknown  - there is no prior receipt, or one of them cannot be compared.
//              Never reported as `none`: "nothing to compare" and "nothing changed"
//              are different facts and only one of them lets a verdict carry.
//
// A carried verdict keeps its ORIGINAL score, confidence and findings and gains
// `state: 'carried'` plus the run it came from. It is not re-scored, because a rescore
// without a re-read is a fabricated measurement.

export const DRIFT_STATES = ['none', 'grown', 'changed', 'unknown'];
/** Drift states under which a prior verdict may be carried instead of re-judged. */
export const CARRYABLE = new Set(['none', 'grown']);

const fileMap = (receipt) => {
  const m = new Map();
  for (const f of receipt?.files ?? []) m.set(f.path, f.sha256);
  return m;
};

/**
 * @param {object|null} prior   a receipt as `buildReceipt` returns it (needs `files`)
 * @param {object|null} current the same, for the tree as it is now
 * @returns {'none'|'grown'|'changed'|'unknown'}
 */
export function drift(prior, current) {
  if (!prior || !current) return 'unknown';
  if (prior.span_digest && prior.span_digest === current.span_digest) return 'none';
  const a = fileMap(prior);
  const b = fileMap(current);
  // Without both file lists the digests are all there is, and they already differ.
  if (!a.size || !b.size) return prior.span_digest === current.span_digest ? 'none' : 'changed';
  for (const [p, h] of a) {
    const now = b.get(p);
    if (now === undefined || now !== h) return 'changed';
  }
  return b.size > a.size ? 'grown' : 'none';
}

/**
 * Carry a prior run's dimensions forward under a carryable drift state.
 * `reJudge` names the dimensions this round judges anyway (the ones whose `must_address`
 * work touched them); they are dropped from the carry set rather than carried stale.
 */
export function carryForward(priorDimensions, driftState, { fromRunId = null, reJudge = [] } = {}) {
  if (!CARRYABLE.has(driftState)) return [];
  const skip = new Set(reJudge);
  const out = [];
  for (const d of priorDimensions ?? []) {
    if (skip.has(d.dimension)) continue;
    if (d.state === 'unmeasured') continue; // an unmeasured dimension carries no measurement
    if (d.state === 'not_applicable') { out.push({ ...d }); continue; }
    out.push({ ...d, state: 'carried', carried_from_run_id: fromRunId, carried_drift: driftState });
  }
  return out;
}
