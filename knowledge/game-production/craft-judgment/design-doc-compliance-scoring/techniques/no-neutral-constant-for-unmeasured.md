---
layer: technique
type: technique
subject: design-doc-compliance-scoring
technique: no-neutral-constant-for-unmeasured
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient, no-gate-self-certifies]
shared_with: []
use_when: [a scoring function needs a value for something nobody measured, auditing a metric for hidden defaults, designing the record type a score is computed from]
---

# No neutral constant for the unmeasured

## The concern

Every scoring function eventually meets a hole. Something in the surface has no verdict, and
the arithmetic demands a number. The author supplies one that feels fair — a mid-range
default, a small bonus, a zero — and imputation enters the report wearing the costume of
observation. The reader has no way to tell the invented values from the observed ones,
because by the time the number is rendered they are the same type.

## The measurement that settles the argument

On one real surface the scoring function used three innocuous defaults: an area with no scan
took a flat 60 out of 100 as "neutral", an area with no checklist took a flat +30, and zero
detected gaps added +10. An area nobody had ever evaluated therefore rendered **70 — exactly
the same as a fully scanned area that genuinely scored 70.** In the same run, areas whose
every row was explicitly marked unknown rendered **10**. Twelve areas at 70 with no evidence;
fifteen areas at 10 in the identical epistemic state. A sixty-point spread, in opposite
directions, produced by nothing but which code path the emptiness travelled through.

That is the argument. Imputation does not merely add error — it adds error whose sign and
magnitude are determined by implementation accident, so it cannot be corrected for, bounded,
or explained to the person acting on it.

## The procedure

1. **Enumerate every hole.** Walk the scoring path and list each branch where a value is
   produced without a measurement behind it. Include the sneaky ones: `?? 0`, `|| 50`,
   default parameters, a status enumeration member meaning "nobody looked", an empty
   collection reducing to an identity, a percentage of zero items rendering as 100.
2. **Make absence unrepresentable as a number.** The record carries a measured flag and an
   optional score, not a score with a sentinel. If the type permits a number to stand for
   absence, it will, within two refactors.
3. **Remove the hole from the denominator** rather than filling the numerator. This is the
   only honest arithmetic move: an unjudged item is excluded from the quality ratio and
   counted in the coverage ratio.
4. **Propagate absence upward.** A parent whose children are all unmeasured is unmeasured.
   Absence must never be laundered into green by an aggregation step.
5. **Emit absence as a finding**, with its own category and its own direction, so it appears
   in the same list as the conformance findings and competes for attention with them.
6. **Aggregate the absence finding, do not fan it out.** One finding per area saying "34 of
   61 items were never evaluated" beats 34 identical per-item findings, which bury the real
   conformance findings under copies of a single fact.

## Adjacent forms of the same error

- **Structural presence read as a verdict.** An artifact that exists, parses and has its
  fields set has been *found*, not *judged*. Counting existence as conformance is the
  neutral constant with extra steps.
- **A producer's self-report counted as evidence.** The process that made the change
  asserting the change is good is an input to a verdict, not a verdict. Record it, label it
  as self-reported, and keep it out of any figure that claims independent measurement.
- **Back-filling provenance.** Records written before a provenance field existed must read
  as unknown provenance, not be back-dated into a source nobody observed — that is the
  neutral constant applied to metadata.
- **A default that only appears at the edges.** Zero items measured yielding 100% is the
  same bug as 60-for-unscanned; check the empty case of every ratio explicitly.

## Decision rules

- When a stakeholder asks for "a number, any number, so the chart has no gaps": the chart
  gets a gap. A gap in a chart is survivable; a fabricated point is not, because it will be
  compared against a real one next quarter.
- When a default is genuinely load-bearing for an internal computation (a sort key, a
  layout), confine it to that computation and never let it reach a reported field.
- When migrating from an imputing metric, publish both for one cycle and publish the delta.
  The delta is the size of the lie you were operating under, and it is the most persuasive
  artifact you will produce.
- When an unmeasured item must be prioritised against real failures, prioritise it by the
  *cost of finding out*, not by a placeholder score. Going and looking is usually trivial,
  which is why the finding belongs at the top of a triage list rather than in the middle of
  a score.

## When not to use this

- **Statistical models built to impute**, where the imputation is the deliverable, is
  labelled as such, and carries an interval. The sin is unlabelled imputation, not
  estimation.
- **Genuinely constant-by-definition values** — a rule that cannot fail because it has no
  applicable surface is not unmeasured, it is inapplicable, and deserves its own third state
  rather than either a score or an absence.
- **Hot paths that cannot afford a nullable** — but if such a path feeds a report, convert
  at the boundary and keep the sentinel out of the record type.
