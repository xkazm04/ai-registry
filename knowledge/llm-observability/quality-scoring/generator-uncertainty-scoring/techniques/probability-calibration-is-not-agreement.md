---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: probability-calibration-is-not-agreement
status: forged
laws: [estimation-announces-itself, statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [a threshold or floor is set on a confidence score, a score is shown to a reader as a percentage, an agreement or correlation statistic is offered as evidence that a number is trustworthy, choosing between a rank decision and an absolute-level decision]
---

# Probability calibration is not agreement

The concern: everything this category measures about a scorer is a **rank
or concordance** statistic — correlation says the scorer orders cases the
way a human does, mean absolute error says how far individual verdicts sit
from a human's, directional bias says which way it leans, a chance-corrected
agreement coefficient says how often a binarized decision matches. Every
one of them is satisfied by a scorer whose numbers are in the right
*order*. Not one of them asks whether **0.7 means seventy percent**.

And nearly every downstream mechanism in this bundle is an absolute-level
claim on a zero-to-one scale. A gating floor is a claim about a level. A
trust bar is a claim about a level. A regression gate's absolute floor is a
claim about a level. All of them consume a number nothing in the pipeline
has checked the meaning of.

## The measurement, and the refutation inside it

Calibration is measured against outcomes, not against a human's ranking.
Bin the scores, and in each bin compare the mean claimed confidence against
the observed rate of being right. **Expected calibration error** is the
average of those gaps weighted by bin population; **maximum calibration
error** is the largest single gap. The first is an average honesty; the
second is a worst-case honesty, and they are not interchangeable.

On a short-answer open-domain question-answering benchmark — fifteen
hundred prompts, one thousand used to fit and five hundred held out — a raw
multi-sample confidence score carried an expected calibration error of
**0.428**. The number printed on the score was, on average, more than four
tenths of the scale away from what it delivered. Fitting a monotone
rescaling on the held-out protocol pulled expected calibration error to
**0.031**.

That looks like a solved problem until the second statistic is read. Over
the same fit, **maximum calibration error moved 0.511 to 0.500** — from
half the scale to half the scale. Average honesty was bought. Worst-bin
honesty was not.

This is the refutation, and it is the reason the technique exists rather
than a note saying "calibrate your scores." **A floor is a worst-bin
claim.** A gate that fails a case below 0.6 is asserting that the region
just under 0.6 means what it says — and the region just under a bar is
exactly where the population thins, exactly where the fit had least data,
and exactly where the maximum error lives. Fitting a rescaling and reading
the improved average as licence to set a floor is the specific mistake this
document is written to prevent.

## Decision rules

- **When a decision is a comparison, an uncalibrated score is enough.**
  Rank this candidate above that one, escalate the lowest decile, route the
  bottom of today's distribution to review. Ordering is what the score has,
  and these decisions consume only ordering.
- **When a decision is a threshold, the score is uncalibrated until fitted
  against labels from the same generator and the same task** — and the fit
  is re-earned when either moves, because it is a property of the pair and
  not of the scorer.
- **When no fit exists and a threshold is unavoidable, use a percentile
  against a rolling window of the same population, and print it as a
  percentile.** A rank statement dressed as a rank statement survives an
  uncalibrated score; the same decision dressed as "confidence above 0.7"
  does not.
- **When a calibration fit is reported, report both statistics.** Expected
  calibration error alone is the metric that makes a badly-behaved tail
  invisible, and reporting it alone is how a fitted score acquires an
  authority the fit did not buy
  ([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).
- **When the score reaches a reader as a percentage, it must be calibrated
  or it must not be a percentage.** A percent sign is an absolute-level
  claim made to a human who has no way to check it.
- **When the fit's own held-out sample is small, say so beside the fitted
  numbers.** A calibration curve fitted on a few hundred items is a
  measurement with a standard error nobody computed, and a fitted error of
  0.031 read as a fact rather than an estimate is the same unearned
  precision one level up
  ([_laws: statistical-verdicts-or-no-verdict_](../../../_laws.md#statistical-verdicts-or-no-verdict)).

## Why the confusion is structural rather than careless

The two families answer questions that sound identical in English. "Is the
scorer any good?" is answered by concordance. "Does the number mean what it
says?" is answered by calibration. A team that has done thorough work on
the first has a folder of evidence, a defensible methodology and a habit of
citing it — and none of it bears on the second. The failure is not
laziness; it is that the first body of evidence is genuinely good and
genuinely about something else.

The tell is easy to check: **a strictly monotone rescaling of every score
leaves every concordance statistic unchanged and can move calibration
error across its whole range.** If a transformation your evidence cannot
see would change the decision, your evidence is not about that decision.

## Failure modes

- **The floor built on an average.** Expected calibration error improved
  tenfold, a floor set the same afternoon, and the worst bin — the one the
  floor sits in — never moved.
- **Correlation offered as calibration.** A strong correlation with human
  scores cited in the sentence that justifies a threshold.
- **The travelling fit.** A calibration curve fitted for one generator on
  one task, then applied after a model upgrade or on a new workload, where
  it is not merely stale but unvalidated in a direction nobody checked.
- **The percentage in the interface.** A raw score rendered as "84%
  confident" to an operator who reasonably reads it as an error rate.
- **Absence read as calibrated.** No fit was ever performed, no field
  records that, and every downstream threshold assumes one was
  ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).

## When not to use it

Do not fit a calibration curve where the decision was only ever a ranking —
it adds a label dependency, a refresh obligation and a scope condition to
buy a property nothing consumes. And do not read this technique as a
demand that every score be calibrated before it is useful. An uncalibrated
score is a perfectly good instrument for finding the cases worth looking
at, which is most of what a production scorer is for. What it is not is a
number you may compare to a constant.
