---
layer: technique
type: technique
subject: reference-parity-gating
technique: no-average-hides-a-failure
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [choosing how a parity gate aggregates per-sample deviations, a score is high and one region is clearly broken, a fix moves nothing and the change is about to be reverted, setting a pass threshold for a comparison gate]
---

# Choose every summary statistic for what it cannot hide

A parity gate reduces thousands of per-position deviations to a few numbers. Every
reduction is a chance to conceal a defect, and the choices are usually made for
readability. Make them adversarially instead: assume something will eventually optimise
against the number rather than toward the target, and pick statistics that do not reward
it.

## The three defaults

**The minimum is the headline.** Aggregate across views, components or artifacts with
`min`, never a mean. A strong region must not be able to pay for a broken one, because the
broken one is the finding. A gate reporting "every component at or above the bar" states a
property; a gate reporting an average states a mood.

**A high percentile beats the maximum.** A raw worst-case is dominated by single aliased
samples and produces findings that are measurement noise — expensive, because producers
learn that the worst row is often fictional and stop reading it. A p95 cannot be moved by
one bad sample, and equally cannot be gamed by concealing a defective region: hiding a bad
area requires it to be narrower than the tail, and a real defect rarely is. Keep the
maximum in the payload as a locator; keep it out of the score.

**Coverage counts in both directions.** Count reference positions the candidate fails to
occupy *and* candidate positions the reference does not — otherwise extra material is free.
A candidate can then satisfy every deviation term while carrying volume that is not
supposed to exist, which is a common generation artifact and an obvious defect to any
viewer.

A worked composition, for a row of per-position band deviations normalised by the
governing dimension:

```
score = 100 − 12·mean% − 0.6·p95% − 1.5·coverage%
```

The weights encode the intent rather than a calibration: the mean term dominates so that
tracking the reference closely is the only way to a high score, the percentile term adds a
systematic-region penalty that one sample cannot trigger, and coverage is priced high
enough that excess and absence both cost.

## The honest exception

Not every softening is a retreat. Cross-section rows drop the two worst slices before
averaging, because a single legitimate overhang would otherwise dominate every other
slice, while a *systematic* width error — the defect the row exists to catch — still fails
comfortably. The rule is not "never trim". It is that **every trim names the defect class
it is deliberately admitting**, in the report, next to the number. A trim without that
sentence is an unexamined concession that will be widened the next time the row is
inconvenient.

## The floor destroys the gradient

The reverse failure costs more time than the gaming does, and it looks like evidence.

When a candidate is far enough off that the dominant term saturates the score at its floor,
the headline reads zero before a fix and zero after it. A real improvement is
indistinguishable from a no-op, and the natural conclusion — "that change did nothing,
revert it" — is wrong. A normalisation correction was once disabled on exactly that
reasoning; re-reading the component terms showed it had collapsed one-sided coverage from
5.29 to 1.12 and trued the comparison frame. The headline had no room left to move.

**Judge a saturated score by its terms, never by its headline.** A floored score is not a
measurement of the change; it is a statement that the artifact is outside the range where
the score carries information.

The same caution applies to any downstream clamp. Where a consuming stage normalises an
artifact by the minimum of several dimensions, an improvement along one axis is absorbed
until a different axis releases the clamp — so verify which term is binding before
concluding that a change did nothing.

## Procedure

1. **Write the score as an explicit weighted sum of named terms**, and emit every term
   alongside the total. A score whose components are not recoverable cannot be
   re-adjudicated, and re-adjudication is how saturated results get read correctly.
2. **Aggregate across anything with `min`.** Views, components, artifacts, families.
3. **Use a high percentile in the score and the maximum only as a locator.**
4. **Make coverage symmetric**, with a small tolerance so sub-sample edge jitter does not
   register as missing volume.
5. **Record the tolerance and the normalising dimension with the number**, per
   [a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
   A deviation percentage means nothing without the quantity it is a percentage of.
6. **Set the threshold from the target, not from the population.** Publish it before the
   line can hit it, and expect the current best to sit far below — see
   [grade against what ships, not on a curve](../../../_laws.md#grade-against-what-ships-not-on-a-curve).
7. **Flag saturated rows explicitly** so a reader knows the headline has no gradient, rather
   than discovering it by reverting a good change.

## Decision rules

- **When a threshold is proposed as an average of components, refuse.** It is the same
  request as "let a good view pay for a broken one".
- **When a producer reports that a fix did nothing, check whether the row was floored
  before believing it.**
- **When a statistic is softened for a legitimate reason, write the reason next to it.** An
  unlabelled trim is indistinguishable from a concession, and it will be widened.
- **When the current best artifact is far below the bar, that is the gate working.** A
  threshold retuned to the population is a description of the population.
- **When a defect is narrower than the percentile tail, it is a locator finding, not a score
  finding.** Report it in the payload; do not re-weight the score to catch it, or one
  aliased sample will own the number again.

## When not to use this

- **Where the aggregate is genuinely a portfolio quantity** — cost, throughput, total
  spend. A minimum over those is not conservatism, it is the wrong question.
- **Where the samples are independent draws from a distribution you are estimating** rather
  than positions on one artifact. A mean is the correct estimator there, and a minimum is
  an extreme-value statistic with an unstable basis.
- **Where a single scalar is required by a consumer that cannot take a payload.** Then the
  minimum is still the right scalar, but expect the terms to be requested the first time
  someone disputes a result, and keep them retrievable.
