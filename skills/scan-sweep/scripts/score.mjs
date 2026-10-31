// score - scan-score/1, the one ranking number of the scan-finding/1 contract (## Finding contract).
//
// Why: three scanners ranked their backlogs three ways - a client-side "value" sort in Personas, an
// invented ev in bp's UI (twice), and none in Dowser - so the same finding ranked differently in every
// app and no consumer could explain its own order. The producer now stores ONE number with its
// breakdown; consumers sort by it and never recompute. lens-scan imports this file by relative path
// (../../scan-sweep/scripts/score.mjs); Dowser carries a copy whose tests pin the same reference values.
//
// Contract: scanScore({ impact, confidence, effort, risk }) -> { score, score_parts } | null.
// impact and effort are required (1-10 integers): without either the finding is UNSCORED and the
// function returns null - never 0, because unmeasured is not a measurement. confidence absent counts
// as low (0.5); risk absent as the midpoint factor 0.75. Out-of-range input throws: a scale bug must
// fail at the producer, not rank silently. sizeToEffort maps XS..XL when only a size is known.

export const FORMULA = 'scan-score/1';
const CONFIDENCE_W = { low: 0.5, medium: 0.75, high: 0.95 };
const SIZE_EFFORT = { XS: 1, S: 2, M: 4, L: 7, XL: 10 };

const scale = (name, v) => {
  if (!Number.isInteger(v) || v < 1 || v > 10) throw new RangeError(`${name} must be an integer 1-10 (got ${JSON.stringify(v)})`);
  return v;
};

/** @param {string | undefined} size */
export function sizeToEffort(size) {
  return size && Object.hasOwn(SIZE_EFFORT, size) ? SIZE_EFFORT[size] : undefined;
}

/**
 * @param {{ impact?: number, confidence?: 'low'|'medium'|'high', effort?: number, risk?: number }} f
 * @returns {{ score: number, score_parts: { impact: number, confidence_w: number, effort_div: number, risk_factor: number, formula: string } } | null}
 */
export function scanScore({ impact, confidence, effort, risk } = {}) {
  if (impact === undefined || impact === null || effort === undefined || effort === null) return null;
  scale('impact', impact);
  scale('effort', effort);
  if (risk !== undefined && risk !== null) scale('risk', risk);
  if (confidence !== undefined && confidence !== null && !Object.hasOwn(CONFIDENCE_W, confidence)) {
    throw new RangeError(`confidence must be low|medium|high (got ${JSON.stringify(confidence)})`);
  }
  const confidence_w = CONFIDENCE_W[confidence ?? 'low'];
  const effort_div = 1 + (effort - 1) / 9;
  const risk_factor = risk === undefined || risk === null ? 0.75 : 1 - (risk - 1) / 20;
  const score = Math.round(((10 * impact * confidence_w) / effort_div) * risk_factor * 10) / 10;
  return {
    score,
    score_parts: { impact, confidence_w, effort_div: Math.round(effort_div * 1000) / 1000, risk_factor, formula: FORMULA },
  };
}
