---
layer: application
type: application
subject: eval-harness
technique: resolution-precondition
stack: node
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A ranking that is measurably part sample size

## The seam

A desktop agent-orchestration app runs a conformance pipeline whose output
is a ranking: LLM workers judge the project's code against a knowledge
bundle's techniques, emit `conformant` / `deviation` / `not-applicable` per
technique, and the resulting deviation counts per subject decide where
remediation effort goes. The shipped `.ai/conform-detail.json` holds 142
judged (context, subject) pairs covering **1,031 technique verdicts across
66 subjects** with four or more techniques judged.

That is a between-condition comparison with a published order, which is
exactly what this technique gates.

## Arm A — the ranking as computed

Deviation rate per subject, ranked descending. The spread is wide:

| | |
| --- | --- |
| subjects (≥4 techniques judged) | 66 |
| deviation rate, mean | 0.440 |
| deviation rate, SD across subjects | 0.282 |
| range | 0.00 – 1.00 |

A between-condition spread that runs the full width of the scale looks like
a ranking that resolves easily. The precondition asks for the other number
before agreeing.

## Arm B — the same data, stratified by how much was judged

The within-subject standard deviation is **unobtainable from this corpus**:
not one (subject, technique) key in all 142 pairs was judged by more than
one worker, so the pipeline's own repeatability is unmeasured. In its
absence, the cheapest available check on whether the order means anything is
whether it correlates with something it must not.

It does.

| | |
| --- | --- |
| Pearson r (techniques judged, deviation rate) | **−0.378** |
| subjects judged on ≤6 techniques | 27 — mean rate **0.577**, 8 saturated at exactly 0.0 or 1.0 |
| subjects judged on ≥12 techniques | 29 — mean rate **0.329**, 1 saturated |

**A subject looks worse the less of it was judged.** The five subjects
sitting at a perfect 1.00 deviation rate were each judged on six techniques;
the two largest samples in the corpus — 48 and 33 techniques — both land at
0.12. Under arm A those two are among the healthiest subjects in the project
and the six-technique subjects are the emergency. Under arm B, roughly a
seventh of the rank ordering's variance is explained by sample size, and the
saturated extremes at the top of the list are the least-sampled cells rather
than the worst ones.

Arm A publishes a sorted list. Arm B publishes a sorted list plus the
statement that its top band is confounded — a different artifact, and the
one that survives a reader asking why.

## What the tree says about the standard

Two things this technique claims turn out to be inseparable in practice, and
this tree is why.

First, the small-n saturation is the same pathology this subject already
names elsewhere: a comparison in which most cells are unanimous, so a small
subset of cells decides the ordering. Here it arrives through the back door
— not because scenarios were easy or hard, but because the *denominators
differ per condition*. A rate over six trials can only take seven values and
two of them are the extremes; a rate over 48 cannot reach either. Ranking
rates over unequal denominators ranks the denominators too.

Second, and the reason the precondition is stated as a gate rather than a
reporting rule: the honest verdict here is **not** "the ranking is noise."
The between-subject spread may well exceed the within-subject SD. Nobody
knows, because the within-subject SD was never measured, and the pipeline's
partition-for-coverage design means it can never be recovered from this
corpus. The precondition's real output on this tree is that **the check
cannot be performed**, which is a distinct and more useful state than either
"resolved" or "noise" — and it is invisible from a sorted list, which is
what makes it worth gating on rather than mentioning.

## What this realization cannot do

The size confound is measured; the within-subject SD is not, and the two do
not substitute for each other. Removing the confound would leave a ranking
that is *less* wrong, not one that is known to resolve. A −0.378 correlation
also leaves most of the variance unexplained: real quality differences
between subjects almost certainly exist in this data, and this measurement
does not locate them, it only shows that the published order is not purely
about them.

The correlation is observational over one snapshot of one project. It cannot
say whether workers rate small samples more harshly, whether small samples
are drawn from subjects that genuinely deviate more, or whether the sampler
preferentially judged fewer techniques where it found problems early. All
three produce this correlation and they call for different fixes.

## The proposed change

Not committed — the project tree was read, not edited. Two changes, both
cheap and independent:

1. **Report the denominator beside the rate**, and do not rank subjects with
   fewer than some floor of judged techniques against subjects with many.
   Bands, not a single sorted list.
2. **Overlap ~5% of pairs across two workers in the next run**, which is the
   only way this pipeline will ever obtain the within-subject number the
   precondition actually wants. Until it exists, the deviation ranking is a
   lead about where to look and not a measurement of where things are worst.
