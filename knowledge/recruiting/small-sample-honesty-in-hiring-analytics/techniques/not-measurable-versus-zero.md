---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: not-measurable-versus-zero
status: forged
laws: [absence-of-evidence-is-not-evidence, inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
use_when: [a metric has no data to compute from, choosing a return type for an analytics function, reviewing a dashboard full of zeros]
shared_with: []
---

# Not measurable versus zero

An unmeasurable quantity must not be represented by a number — and in hiring
analytics the number it is almost always represented by is zero, because zero
is what an empty sum returns, what an unset column holds, and what a division
guard falls back to.

Zero is a measurement. It says *we counted, and there were none*. Zero hires.
Zero days in stage. Zero adverse impact. Every one of those is a strong,
specific, actionable claim, and every one of them is false when what actually
happened is that nothing was counted. The failure is not cosmetic: a zero-filled
dashboard reads as a failing pipeline, a zero dwell time reads as an instant
stage, and a zero disparity reads as a clean fairness check. Teams have made
staffing decisions off all three.

## The typed-state rule

The claim's return type carries the state. Not a sentinel value, not a negative
number, not null-and-hope, not a boolean flag beside a number that some caller
will read without the flag. A metric returns *either* a value with its basis
*or* a refusal with its reason, and the shape of the type makes it impossible
for a consumer to render the second as if it were the first.

Sentinels fail for a reason worth stating: they survive one hop. The function
that returns -1 for unknown is correct until someone sums a column, averages a
series, sorts descending or feeds it to a chart library, and each of those
operations turns the sentinel into a plausible value with no trace of where it
came from. A typed refusal breaks at the summing, which is exactly where you
want it to break.

## Procedure

1. **Enumerate the ways the claim can have no basis.** Empty population;
   population present but the required event never recorded; denominator zero;
   the field the claim reads never populated for this workspace; the
   computation depends on an upstream claim that itself refused.
2. **Give each one the same typed refusal**, carrying a reason string that
   names what is missing in the domain's words — "no resolved outcomes yet",
   not "null pointer". The reason is what turns a refusal into a plan.
3. **Guard every denominator explicitly at the site of the division**, and make
   the guard return the refusal rather than a zero or a NaN. A guard that
   returns zero has replaced one lie with another.
4. **Forbid coercion at the boundary.** Serialization, storage and aggregation
   layers must carry the state through. The moment a refusal is written to a
   numeric column it is indistinguishable from a measurement forever.
5. **Test the empty workspace as a first-class case.** A brand-new hiring team
   is the most common state a metric will ever be evaluated in, and it is the
   state most likely to have been tested least.

## Decision rules

- When a sum has no addends, the result is *not measurable*, not zero. Empty
  sums returning zero is the single most productive source of this bug in every
  codebase that has it.
- When a denominator is zero, refuse; never clamp, never substitute one, never
  return the numerator.
- When a metric depends on another metric that refused, it refuses too, and it
  names the upstream reason rather than inventing its own. Refusals propagate;
  they do not get absorbed.
- When a chart needs a point and the period has no basis, the point is absent —
  a gap in the line — not a point at zero. A line drawn to zero and back is a
  narrative about a collapse that did not happen.
- When the unmeasurable quantity feeds a decision about a person and the
  decision is adverse, the refusal resolves toward them
  ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)):
  an unscored candidate is held for review, never ranked last on a zero nobody
  computed.
- When a model or heuristic could not determine something, that is a refusal in
  this exact sense and must not render in the grammar of a finding
  ([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
  "Could not assess" is not "no concern found".

## The three readings of an empty cell

Distinguish them, because they need different words and different follow-ups:

- **No population.** Nobody has entered this stage/segment/period at all. The
  honest reading is *nothing has happened here yet*.
- **Population without the required event.** People are here, but the
  transition, score or outcome the claim needs was never recorded. The honest
  reading is *we are not capturing what this needs* — an instrumentation
  finding, and often the more valuable one.
- **Event recorded but structurally unusable.** Every observation identical,
  every candidate in one group, one item in a comparison. The honest reading is
  *this question cannot be asked of this data* — no amount of waiting fixes it.

Collapsing these into one empty state is defensible in a first version.
Collapsing the second into "no data" is how a broken pipeline stays broken for
a year, because the message told the team to wait when it should have told them
to instrument.

## When not to use this

Do not turn a genuine zero into a refusal. If a stage was measured and nobody
passed through it, zero is the truth and hiding it behind "not measurable"
suppresses a real finding — a stage nobody uses, a source that produces
nothing. The test is whether the counting happened, not whether the count is
large.

Do not use a refusal where a *thin* state is correct. Two observations are not
zero observations, and refusing on them discards the only evidence a young team
has; that case has its own labelled state and its own presentation grammar.
Refusal is for no basis or an unusable basis, not for a small one.
