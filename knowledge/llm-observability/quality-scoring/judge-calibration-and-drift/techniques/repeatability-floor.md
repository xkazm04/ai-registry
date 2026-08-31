---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: repeatability-floor
status: forged
laws: [statistical-verdicts-or-no-verdict, the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [a per-cycle calibration drop has triggered an alert, setting the minimum detectable change for a judge trend, a single judge verdict gates a release or reaches a customer, a rubric weights a subjective dimension heavily]
---

# Repeatability floor

Every number this subject produces — the agreement coefficient, the trust
verdict, the per-cycle drop, the windowed regression against a baseline — is
computed from **one judge score per item**. That is the unstated assumption
underneath the whole apparatus: that a judge's score on an item is a
*value*.

It is a draw. And because it is a draw, the agreement coefficient computed
from it is itself a random variable, with a spread nobody in this pipeline
has measured. A calibration cycle does not report kappa; it reports one
sample of kappa.

## The measurement, and what makes it a third thing

Re-score a frozen slice of the golden set **N times with everything held
identical** — same judge model, same parameters, same contract version, same
rubric, same day, same items. Nothing changed between the runs, so every
difference observed is the instrument disagreeing with itself. That number
is the **repeatability floor**.

It is a distinct quantity from the two this subject already measures, and
the three answer different questions:

| Measurement | Compares | Answers |
| --- | --- | --- |
| Agreement | judge vs. human | is the judge right? |
| Drift | judge now vs. judge then | has the judge changed? |
| **Repeatability** | **judge vs. itself, same moment** | **is the judge a measurement?** |

Neither of the first two can be read without the third, which is the point
of the technique.

## The magnitude is not small

Measured on a public grading pipeline that scores code changes against a
rubric: re-grading a **single fixed artifact** ten times per condition, with
the same judge model at the same settings, flipped the published pass/fail
verdict 23% of the time. The published verdict differed from the median of
the re-scores 21% of the time. Re-grading the same artifacts under a
different judge model more than halved the number of passes.

None of that is run-to-run variance in the thing being graded. The artifact
was fixed. That is the instrument, alone, on an unchanged input.

## Two consequences, and the second is the one this subject was missing

**A single-shot verdict from a judge with a floor that high is not a
measurement.** Where the verdict gates anything — a release, a ticket
closure, a number a customer reads as fact — either aggregate over re-scores
and declare the aggregation, or move the dimension to a mechanical kind
where the question admits one
([_laws: statistical-verdicts-or-no-verdict_](../../../_laws.md#statistical-verdicts-or-no-verdict)).

**The floor is the minimum detectable effect for every downstream
comparison.** This is the load-bearing consequence. The per-cycle check
compares this cycle's agreement against the last one's and treats a large
drop as an early warning; the windowed detector alarms on relative
regression against a baseline mean. Neither has any notion of how much of
that movement is the judge disagreeing with itself, so both will fire on
re-score noise — reliably, on a schedule, forever.

The operational cost is worse than the false alarm itself. A detector that
cries wolf on a cadence gets muted, and the genuine drift it was built for
then arrives into a muted channel. A drift alert without a repeatability
floor beneath it does not merely mis-fire; it disarms the alert that would
have worked.

So the floor is published *with* the thresholds it governs: a per-cycle drop
smaller than the floor is not an early warning, it is a draw, and the
detector says so rather than paging someone.

## Repeatability is measured per dimension, never per judge

The single most useful thing the measurement returns is its decomposition,
and a composite number throws it away.

In the same grading run, the three scored dimensions did not share a
repeatability at all. The subjective comparative dimension flipped 32% of
the time; the two closer to a checkable property flipped 5% and 3%. A single
composite figure would have reported roughly one in five and concealed that
one dimension was very nearly deterministic while another was close to a
weighted coin.

This matters because dimensions carry weights and gating floors:

> **A composite's repeatability is dominated by its least repeatable
> dimension — and that is reliably the subjective one the rubric was
> written to capture.**

A rubric that puts its heaviest weight on its noisiest dimension is a common
design and an invisible one, because every artifact the rubric produces
looks the same whether the weighting is sound or inverted. The
per-dimension floor is what makes it visible, and it is the input to the
decision the contract subject owns: which dimensions genuinely require
reading, and which were sent to the judge out of habit.

## A threshold multiplies the floor rather than absorbing it

Where a continuous dimension is binarized at a cutoff — pass above, fail
below — the verdict is noisier than the score that produced it, and the
noise concentrates exactly at the bar. Items far from the cutoff are
decided by the artifact; items near it are decided by the draw.

Binarizing does not remove the arbitrariness of a continuous weighting, it
hides it: the cutoff is every bit as arbitrary as the formula it replaced,
and unlike the formula it is not written anywhere as a formula, so nobody
confronts how arbitrary it is. Read the floor before choosing a bar, and
keep a band around the bar wide enough to hold the floor in which the
verdict is reported as **indeterminate** rather than resolved — the same
third state this bundle already insists on everywhere else
([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).

## Cadence and cost

The floor is re-measured whenever any element of the judge packet changes —
model, parameters, rubric version, exemplars — because it is a property of
the packet and not of the model. It needs **no human labels**, only repeated
calls over a slice already owned, which makes it the cheapest thing in this
subject and the only one that requires no annotator time at all. It is
therefore measured before the first trust verdict is issued, not after the
first suspicious alert.

## Boundary

The builder-side offline harness discipline reached this rule first and
states it as a ceiling on *candidate* differences: a score gap between two
candidates means nothing if the judge disagrees with itself by more. That is
the right framing there, where the question is whether a comparison
resolves and where a suspicious result can simply be re-run.

The operator-side question is a different one, and it is the one this
technique answers: **can a change in the instrument's own agreement mean
anything?** Here the instrument's trend line *is* the product — it is what
the trust verdict, the recalibration schedule and the drift alerts are all
made of — and the live path has no re-run to average over. Same measurement,
two consumers, two thresholds it feeds. A team that has taken the builder's
version is not covered for this one, because the builder's version never
needed to bound a drift detector.
