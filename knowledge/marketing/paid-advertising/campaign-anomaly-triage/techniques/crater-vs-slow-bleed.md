---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: crater-vs-slow-bleed
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero, platform-reported-is-not-causal]
shared_with: []
use_when: [deciding whether a campaign's decline is a step or a slide, gating a multi-week decline on the campaign's own noise, explaining why a still-above-target campaign carries a badge]
---

# Crater versus slow bleed

A campaign can fail in two shapes. A crater is a step: between one sync and the
next it loses a large share of its return and lands below target. A slow bleed is
a slope: a few percent a week, never enough to move a step rule, until it is
quietly below target after two months. Each needs its own detector, and a triage
layer with only the first is blind to the shape that costs the most money over a
quarter.

## The crater rule

Inputs: the prior sync's return and the current sync's return for one campaign.
Fire when all four hold:

1. The campaign was meaningfully healthy before - prior return at or above the
   critical multiple of target. This is the tiny-base guard: a campaign that was
   already critical did not crater, it stayed critical.
2. The current return is positive - a fall to exactly zero is the
   spending-without-conversions rule's territory and is reported there.
3. The current return retained less than a set share of the prior return
   (convention: below 0.6, i.e. lost more than 40%).
4. The current return is below target. A campaign that lost 40% and still clears
   target is a watch item for the spend-spike rule, not a crater.

Severity critical. The detail quotes both returns.

## The slow-bleed rule

Inputs: the campaign's daily cost and conversion value series. Procedure:

1. Sort ascending by date, keep the most recent whole weeks, drop a leading
   remainder so every bucket is a full seven days. Refuse below a minimum number
   of whole weeks (convention: three, i.e. 21 days).
2. Compute each week's return as the ratio of sums - total value over total cost -
   not the mean of daily returns. A week with zero cost has no return; refuse the
   whole verdict rather than guess a direction.
3. Estimate the per-move noise floor from the campaign's own de-seasonalised
   daily return: the standard error of a difference between two seven-day means,
   using the one shared variance estimator.
4. Walk the weekly moves backward from the latest bucket. Count the run of
   consecutive same-direction moves that each clear the noise floor by a set
   number of standard errors (convention: one). Stop at the first move that is
   flat, within noise or in the other direction.
5. Fire when the run is at least the minimum, its direction is down, and the
   cumulative loss from the bucket just before the run to the latest bucket is at
   least a set share (convention: 25%).

Severity warning. The detail says how many weeks and from what to what.

## Why the variance gate, not a rebound tolerance

The crude version - "down 25% over the window, allowing a small rebound" - has two
failure modes that the gate fixes in one move. A noisy series whose weekly means
happen to descend fires the crude rule though no move clears the campaign's own
noise; the gate stays silent. A genuine slide with one within-noise uptick is
thrown away by the crude rule's rebound clause; the gate walks through the blip
because it is not a move at all. Where the two agree - a clean whole-window
slide - the badge is identical, so adopting the gate changes only the verdicts
that were wrong.

## Decision rules

- When the prior return was already critical, do not call a crater; the campaign
  is reported by the snapshot rule it already matches.
- When any week in the window has no spend, the slow-bleed verdict is silent.
  "Not measured" is not a data point.
- When the run reaches the minimum but the loss is shallow, stay silent: a
  significant wobble is not a bleed.
- When the latest move points up, there is no bleed, however deep the earlier
  slide; the run must reach "now".
- When both a crater and a bleed match, report both; they are different facts
  about different windows.
- When the badge is rendered, it says what moved and by how much, and never why.
  The prior sync's changes are the manager's to correlate; a step after a bid
  change is a description of timing, not a proof of cause.

## What is convention here

The 0.6 retained share, the three-week minimum, the one-standard-error per-move
bar and the 25% cumulative loss are practitioner conventions. The retained share
is deliberately the same number as the critical multiple so a reader holds one
"lost forty percent" in their head, not two; nothing requires it. The whole-week
bucketing and the ratio-of-sums are not convention: a partial bucket or a mean of
daily ratios would violate weekday balance and weight the quiet days as much as
the busy ones.

## When not to use this

Do not run the crater rule between two syncs a few hours apart on a period
metric that overlaps almost entirely; the "prior" and "current" must be distinct
enough that a diff is a movement. Sync-over-sync works when the period window
rolls; a mid-day re-sync of the same window produces a noise diff.

Do not run the slow-bleed rule on a portfolio total when the campaign mix
changed. A new high-volume, low-return campaign drags the total down in a shape
indistinguishable from a bleed; the rule is per campaign, and mix effects belong
to the root-cause diagnosis subject.

Do not treat a bleed on a prospecting campaign as a verdict on that campaign
alone. Last-click return on demand-generating campaigns falls when their assisted
conversions move elsewhere; label the funnel role and let the manager read it.
