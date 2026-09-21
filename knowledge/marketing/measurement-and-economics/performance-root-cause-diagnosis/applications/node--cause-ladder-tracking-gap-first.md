---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: cause-ladder-tracking-gap-first
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Cause ladder, tracking gap first - the paid-portfolio diagnosis tool

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) diagnoses a tenant's whole
paid portfolio - the union of its Google Ads and Sklik accounts - in
`src/lib/ai/tools/ads-diagnosis.ts`, with the request built by
`src/lib/diagnoses/ads-request.ts`. The tree proves the ladder structurally: a closed
cause enum, a deterministic picker that walks the rungs in order, named thresholds
that sit beside the prompt wording, and a measurement-gap rung that fires before waste
with a comment saying why.

## The closed set, twice

`ADS_DIAGNOSIS_SYSTEM` (`ads-diagnosis.ts:41-59`) defines six causes in Czech prose
for the model: `waste-zero-conv`, `budget-misallocation`, `efficiency-drift`,
`tracking-gap`, `platform-imbalance`, `healthy`. The prompt line at `:138` repeats the
allowed values from `ADS_DIAGNOSIS_CAUSES`, and the schema at `:154-157` describes
`likelyCause` as "one of" the same list. The same set is then walked by
`pickAdsCause` (`:205-236`), whose docstring says it "mirrors the prompt's rules, in
the order a PPC manager would rule them out".

## The gap rung and its reason

`pickAdsCause` opens with the technique's rule in the tree's own words (`:207-209`):

> Spend with nothing measured coming back reads as a measurement gap first: an action
> ("fix conversion tracking") that a waste verdict would send the wrong way.

The predicate is `totals.cost > 0 && totals.conversions <= 0`. The templated fallback
for that cause (`:321-324`) makes the lever explicit: check conversion measurement -
tag, import, account link - "before you switch anything off; without data every budget
intervention is shooting blind". This is the upward lesson the draft took from the
tree: the ladder's top rung is justified by the asymmetry of the wrong action, not by
frequency.

## The remaining rungs and this tree's constants

Lines `:190-194` declare the thresholds, commented "Deterministic thresholds mirroring
the qualitative CAUSE definitions in ADS_DIAGNOSIS_SYSTEM. Named + commented so the TS
floor and the prompt wording move in lockstep (edit both together). Currency-free by
construction - every one is a ratio":

| rung | constant | value | predicate |
|---|---|---|---|
| waste | `WASTE_SHARE_HIGH` | 0.25 | zero-conversion spend / total spend >= 0.25 (`:211-214`) |
| drift | `DRIFT_COST_RISE`, `DRIFT_VALUE_LAG` | 0.15, 0.5 | cost rise >= 15% and value rise < 50% of it (`:216-223`) |
| imbalance | `IMBALANCE_ROAS_RATIO`, `IMBALANCE_COST_SHARE` | 0.6, 0.25 | a network below 60% of the best ROAS carrying >= 25% of spend (`:225-232`) |
| healthy | - | - | `targetPno` present and `totals.pno <= targetPno` (`:234`) |
| misallocation | - | - | the remainder (`:235`) |

These are this tree's constants and the technique labels them as convention; nothing
in the tree measures them. Two structural facts the tree confirms: the drift rung is
skipped unless `req.prior` exists with positive cost (`:216`), and
`priorWindowTotals` in `ads-request.ts:206-221` returns `null` unless the daily series
reaches back a full second window - "a partial prior would understate the comparison,
and a fabricated zero would read as a collapse". The imbalance rung requires both
halves (`:229`), so a small laggard network does not fire it.

## Severity follows the displayed cause

`normalizeAdsDiagnosis` (`:250-281`) coerces the model's cause to the enum and, when
the model omits severity, derives it from the cause actually shown via `severityFor`
(`:238-242`) - the comment at `:275-276` says so a model `waste-zero-conv` "can never
render beside a green 'low' pill". Severity's *values* are the triage subject's; the
diagnosis only guarantees they agree with the cause.

## Where the tree falls short of the standard

- `coerceCause` (`:178-181`) defaults an *unrecognised* cause string to
  `budget-misallocation`, the "neutral, always-actionable catch-all", while an *empty*
  cause falls to the deterministic pick (`:256-257`). The technique's rule is that an
  unknown label falls to the ladder's pick as well; a fixed catch-all answers "what if
  nothing fires", not "what if the model said something unknown". Deviation.
- The ladder is first-match, so a portfolio with both waste and drift reports waste
  only. The tree does not tell the reader that; the standard says it should.
- The drift rung reads `deltaCostPct` / `deltaValuePct` from the sync-over-sync diff
  and `prior` from a raw 30-day slice (`ads-request.ts:206-221`); neither is
  weekday-balanced. Whether that delta is significant is the period-comparison
  subject's concern and the tree does not consult it here.

## Verification

Run from the workspace root on Node 24: `npm run test:unit` exercises
`test-unit/llm-adversarial.test.mjs`, which asserts from the hostile side that
`normalizeAdsDiagnosis` cannot be steered to a cause or an id outside the request
(docstring at `ads-diagnosis.ts:244-249`). The picker itself is pure and can be driven
with an object literal: a request with `totals.cost > 0`, `totals.conversions = 0`
returns `"tracking-gap"` before any waste computation runs.
