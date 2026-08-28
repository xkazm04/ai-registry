---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: judge-selection-by-spread
status: forged
laws: [quality-apparatus-stays-unbudgeted, the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [choosing which model judges, a cheaper judge candidate looks almost as accurate, verifying a judging-method change like batching]
---

# Judge selection by spread

The concern: which model gets to be the judge. The trap is choosing by
headline accuracy or by price. The technique is to choose by
**discrimination**: the gap between the judge's average score on known-good
outputs and its average on known-bad ones. A judge that scores everything
similarly discriminates nothing — and no threshold, however carefully
placed, can recover separation the judge never produced. Every scorecard,
gate verdict, and aggregate downstream inherits exactly the discrimination
the judge has, and none that it lacks.

## The bake-off

Run each candidate judge over the same stratified golden set — one that
deliberately contains clear passes, clear failures, and the expensive
middle (half-answers, confident wrong answers, polite deflections). For
each candidate, tabulate:

| Column | Why |
|---|---|
| agreement error (MAE) vs human | headline closeness — necessary, not sufficient |
| correlation | ranking fidelity |
| mean score on known-good | ceiling behavior |
| mean score on known-bad | floor behavior |
| **spread** (good mean − bad mean) | the decision column |
| cost per set | the tiebreaker |

Read the table with these rules:

- **Spread is disqualifying, not merely ranking.** A candidate whose spread
  is materially narrower than the field cannot be rescued by threshold
  placement: with good answers around 0.80 and bad around 0.35, any bar
  either fails real quality or passes deflection. Small-model judges fail
  this way characteristically — one was observed scoring a correct,
  complete answer *below its own pass line* while giving evasive
  non-answers substantial credit.
- **Healthy extremes can hide a rotten middle.** A judge can post the
  widest spread in the table and still be the most dangerous: generous
  precisely in the middle band, passing half-answers and factually wrong
  answers with confident scores. Spread is computed from the extremes, so
  it cannot see this — which is why the *per-item* table over the middle
  strata is mandatory reading, not an appendix. An aggregate cannot show
  the shape of a failure.
- **Price is a tiebreaker among discriminators only.** The quality
  apparatus is unbudgeted by construction — judge spend is segregated from
  product cost and never throttled by usage caps — so "the cheap judge is
  80% as good" is not an available trade. Between two judges that both
  discriminate, take the cheaper; a judge that does not discriminate is
  not cheap at any price, because every decision made on its scores is
  the real cost.
- **Beware same-family judging.** A judge scoring candidates from its own
  model family carries a measured self-preference bias; where the pairing
  is unavoidable, prefer pairwise comparison with randomized position for
  those evaluations, and say so in the selection record.
- **State the measurement's own limits.** A bake-off over a dozen items,
  one rubric, one domain is a strong prior, not a theorem; record n and
  scope with the decision so the next reader knows what it does and does
  not cover.

## A panel is a candidate too

The bake-off's rows need not all be single models. A **panel of smaller
judges drawn from disjoint model families**, aggregated by vote or mean,
enters as one candidate — and published measurement found such a panel
outperforming a single frontier judge on human correlation at roughly a
seventh of the cost, with less same-family bias, because no single
family's taste dominates the aggregate. Rules that keep a panel honest:

- **Members must span families.** A panel drawn from one family multiplies
  its self-preference instead of cancelling it; diversity of provenance is
  the mechanism, not the headcount.
- **The panel is one instrument.** Its spread and agreement are computed on
  the aggregated verdict; membership is part of the method, so adding or
  swapping a member is a method change that re-opens paired verification,
  exactly as batching does.
- **Within-panel disagreement is signal.** Report it beside the aggregate
  rather than averaging it away — items the panel splits on are the middle
  strata the per-item table exists to expose.

## Reasoning effort is part of the judge's identity

Judge capability is not only *which* model but *how hard it reasons*: the
same model at higher reasoning effort is, for calibration purposes, a
different instrument, with its own spread and its own cost. Include effort
tiers as separate rows in the bake-off. A mid-tier model reasoning
normally often beats a small model at any setting, and a frontier model
reasoning hard is frequently worth the premium precisely because judge
spend is not product spend.

## Re-verify after any method change

Selection is not a one-time rite. Any change to the *transport or method*
of judging — batching several cases into one call, a new sampling scheme,
a rubric restructure — re-opens the question, because method changes move
scores. The verification is paired: the same items judged both ways, with
per-case deltas, aggregate delta, and — most decisive — **pass/fail
flips** at the rubric's threshold. A tiny mean shift matters only if cases
crossed the line. Batching in particular is dose-dependent and
judge-dependent: a strong judge may flip nothing at moderate batch sizes,
while a weak judge collapses batched scores onto a curve — grading tiers
relative to batchmates despite explicit instruction not to. That collapse
is invisible in the aggregate and obvious in the per-item table. Never
compare a batched run against an unbatched baseline: the difference is
method wearing a quality costume — re-baseline once, then hold the method
constant.

## When not to use this

Skip the full bake-off for throwaway, human-reviewed triage where scores
never leave the room — a default strong judge is fine. And do not re-run
selection on every calibration cycle: selection answers "which
instrument", calibration answers "does the instrument still agree" —
churning judges chasing small bake-off deltas resets every trust history
and every windowed baseline you have.
