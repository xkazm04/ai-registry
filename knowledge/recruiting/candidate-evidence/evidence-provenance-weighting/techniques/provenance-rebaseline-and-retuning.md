---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: provenance-rebaseline-and-retuning
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, a-predictor-cannot-grade-its-own-labels, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [changing an evidence weight or threshold, swapping the extraction or matching model, comparing scores computed at different times]
---

# Re-baselining after a weight change

Provenance weights, match thresholds and the extractor behind them are tuned against a
cohort at a point in time. Change any of them and every score already stored stops
being comparable to every score computed afterwards — silently, because a score is a
number and numbers look comparable. This technique makes a weighting change an
**event** with a procedure, rather than a commit.

## What breaks, precisely

- **Cross-vintage ranking.** A shortlist holding candidates scored under two regimes
  orders people partly by when their file happened to be processed. Nothing in the
  list says so.
- **Percentiles and bands.** "Top quartile" computed over a mixed cohort is a
  statement about processing dates as much as about candidates.
- **Stored verdicts.** A recommendation persisted under the old weights is a verdict
  bound to a scale that no longer exists — [a verdict is bound to what it
  judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged). It is superseded, not
  silently re-meant.
- **Trend lines.** A step change in average fit at the release boundary reads as a
  change in candidate quality and will be explained as one by whoever sees it first.

Note that the same breakage occurs with *no* change to your weights at all, when the
underlying extraction or matching model is swapped. The scale is the whole
pipeline, not just the multipliers.

## The procedure

1. **Date the change and record what changed** — which rungs, which thresholds, which
   model or extractor version, and the reason. The record is what lets a later reader
   explain a step in the numbers.
2. **Decide recompute or mark, and do one of them.** Either recompute the affected
   population, or stamp every stored score with its regime and treat the two as
   incomparable. Doing neither is the default failure and it is invisible.
3. **Refuse cross-boundary comparisons.** Comparative surfaces — rankings, percentile
   bands, cohort averages — either span one regime or state that they do not, per [a
   claim carries its sample and its
   basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis). A mixed cohort is
   a labelled state, not a silent one.
4. **Re-tune rather than assume carry-over.** Thresholds calibrated against the old
   distribution are not calibrated against the new one. A change that shifts the mean
   fit by a few points moves every fixed cutoff that reads it.
5. **Communicate the boundary to the humans who read the numbers.** A recruiter who
   watched average fit drop overnight needs to know it was the scale, or they will act
   on a candidate-quality story that is not true.
6. **Keep a fixed reference set.** A small, stable set of candidate files scored
   before and after every change is the cheapest instrument in the whole subject: it
   converts "did this get better?" from an argument into a diff.

## A green fixture suite is not evidence the change is safe

The sharpest trap in this technique: curated evaluation fixtures are usually *hand
authored with real provenance on every claim*, because that is what a good fixture
looks like. A change to the **default** therefore barely touches them, and the suite
comes back byte-identical. That result is genuinely informative — it confirms the
change bites only unevidenced data — but it is the opposite of a safety signal. The
population it will move is production intake, where the extractor omits provenance
most of the time, and no fixture in the suite represents that population.

So a default change is validated on two corpora, and the second is not optional:

- **The curated suite**, to prove nothing broke structurally.
- **A sample of real, unevidenced intake**, to measure how far scores actually move.
  The number this produces — the share of claims that land on the default rung, and
  the resulting shift in the score distribution — is what the re-tuning in step 4 is
  calibrated against.

State the operational consequence explicitly in the change record: which saved
filters, cutoffs and score-based rules were calibrated against the old numbers and now
need re-tuning. A change that is correct and unannounced still breaks every threshold
someone else set.

## Re-tuning cannot use the outcomes the old weights caused

The tempting validation — check the new weights against who was hired — is circular.
The old weights determined who reached an interview, so the outcome pool is the old
scoring function's own output. A perfectly biased weighting draws a perfect validation
curve; [a predictor cannot grade its own
labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels).

The honest options, in order of strength:

- A **held-back arm**: a deterministic, pre-declared slice of candidates the score did
  not act on, advanced by human review alone. Deterministic matters — a re-rolled
  membership makes the holdout a control for sparing individuals.
- **Recruiter-anchored comparison**: a blind set independently ranked by experienced
  humans before the weights are shown. Measures agreement, not truth, and should say
  so.
- **Internal consistency only**, explicitly labelled as such. Where no clean arm
  exists, say what was actually measured rather than borrowing the vocabulary of
  validation.

## Decision rules

- **When the change is a ladder reorder rather than a re-weight, recompute.** Reorders
  change which bucket claims fall into, not just their magnitude; marking is not
  enough.
- **When only the floor moves, recompute the floored population first.** It is
  usually the largest group and the one whose ranking moves most.
- **When you cannot recompute — cost, volume, immutable records — mark and expire.**
  State a horizon after which old-regime scores are not shown in comparative surfaces
  at all. An unbounded mixed cohort never resolves.
- **When a weight change is proposed to make one cohort rank better, stop.** Tuning
  toward a desired distribution is not calibration, and the resulting ladder no longer
  measures evidential strength.

## When not to use this

- **For extraction bug fixes that restore intended behaviour.** A parser that was
  losing origins and now retains them changes the input, not the scale. Recompute the
  affected files; do not declare a new regime, or you will have a regime boundary
  every sprint.
- **For per-role weighting differences.** Two roles legitimately weighting evidence
  differently are two scales by design, not a baseline change. They must simply never
  be compared to each other.
- **Before the ladder is stable.** During initial construction, everything is moving
  and the ceremony is noise. Start the regime record at the first release that scores
  a real candidate.
