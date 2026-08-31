---
layer: application
type: application
subject: eval-harness
technique: reliability-aggregation
stack: react
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# React — a prompt leaderboard that ranks on means alone

How the Personas prompt-lab grid stands against
[reliability-aggregation](../techniques/reliability-aggregation.md).
*Verified against the project tree at `dd9517376`.*

## The seam

`evalAggregation.ts` (`buildEvalGridData`) is the whole aggregation layer for
the prompt lab: it walks the run's `LabEvalResult` rows once, accumulates
three judge metrics per prompt version and per version×model cell, finalizes
them as **means**, computes `compositeScore(avgTA, avgOQ, avgPC)`, sorts the
version leaderboard by that composite, and returns `winnerId` as the top row.

Every number it produces is a mean. There is no second aggregation rule
anywhere in the module, so the trial-level distribution that produced each
mean is discarded at the accumulate step and cannot be recovered downstream.
The operator picking a prompt version reads the composite and the count.

The scenario name is on every row (`scenarioName`), so the trials *are*
groupable by scenario — the data needed for an all-of-N figure is present and
simply not used.

## The A/B

Both arms consume the identical trial set, through the shipped
`buildEvalGridData` for arm A and an added reliability pass for arm B, run in
the project's own vitest under a temporary probe that was deleted after the
reading. Two prompt versions, one model, three scenarios × three trials each,
pass bar 60:

- **steady** — every trial scores 70.
- **spiky** — one scenario at (100, 100, 100), one at (100, 100, 40), one at
  (40, 40, 40).

| | arm A: composite (mean) | any-of-N | all-of-N |
| --- | --- | --- | --- |
| steady | 70 | 1.00 | 1.00 |
| spiky | **73** | 0.67 | 0.33 |

**Arm A ranks `spiky` first and returns it as `winnerId`. Arm B ranks
`steady` first. The winner flips on the same trials.**

`spiky` is precisely the technique's third reading — high any-of-N, low
all-of-N — and the shipped harness cannot express it. Averaging makes an
unusable third of the runs look like a three-point advantage, and the row
that would have said otherwise was thrown away one step before the number
was formed.

**Verdict: better.** The measurable named first was the leaderboard's winner
selection, and it moved.

## The second finding, which the A/B did not go looking for

The finalize step reads `avgTA = count > 0 ? sum / count : 0`, and the same
guard appears for all three metrics in both the version and the cell path. A
metric with **no scored samples averages to zero**, and that zero flows
straight into `compositeScore` and the sort.

So an unscored version does not rank last because it performed badly. It
ranks last because nothing scored it, and the leaderboard renders those two
as the same number — which is the corpus's
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
exact boundary the law describes, an optional score meeting a non-optional
average. The module is careful about this one step earlier: its own comment
notes that null scores are excluded from averages, and the `…Count` fields
exist precisely to do that correctly. The care is real and it stops at the
empty case.

## What this realization cannot do

The pass bar of 60 is the probe's, not the product's. This grid scores 0–100
on judge metrics and has no pass predicate at all, so all-of-N cannot be
computed here without someone first declaring what counts as a pass — which
is the metric-role-contract question, and it is genuinely unanswered in this
tree rather than merely unimplemented. The A/B shows the ranking is
sensitive to that declaration; it does not show which bar is right.

That also bounds the adoption: adding reliability aggregation to this module
is not a pure addition, because it forces a threshold decision the product
has so far avoided by reporting means. The cheap intermediate — report the
per-scenario spread beside the mean, no threshold needed — carries most of
the signal and is the change this application would file first.
