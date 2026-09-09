---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: spend-spike-without-return
status: forged
laws: [efficiency-is-not-profitability, label-convention-as-convention]
shared_with: []
use_when: [judging whether a rise in spend is a problem, catching efficiency dilution on a campaign whose return still looks acceptable, deciding which sync-over-sync changes are material enough to diff]
---

# Spend spike without return

Spend rising is not an anomaly. A campaign that was budget-capped and got more
budget, a seasonal peak, a new product line - all raise cost, and all are fine
if value rose with them. The anomaly is a spend rise that value did not follow:
the marginal money bought much less than the average money did, and the
campaign's efficiency is being diluted even while its headline return sits above
the critical bar.

## The rule

Inputs: the prior and current sync's cost and conversion value for one campaign,
as relative deltas. Fire when:

1. Cost rose by at least a set fraction (convention: 50%), and
2. Conversion value rose by less than a set share of the cost rise (convention:
   half of it).

Severity warning. The detail quotes both deltas: "cost +62% against the last
sync, conversion value only +11%".

The second clause is the whole technique. "Value grew less than cost" would fire
on every campaign whose return dipped a fraction; "value grew less than half as
fast" names dilution that a manager would act on, and leaves a campaign that
scaled at a slightly worse marginal rate alone.

## Why it is a warning and not a critical

A spend spike is a movement, not a state. The campaign's snapshot rules already
judge its current return against the target; if the dilution has pushed it below
the critical bar, that rule fires and outranks this one. The spike rule exists
for the campaign that is still above target and heading the wrong way - the one a
manager would otherwise not open for a fortnight.

## Materiality before the diff

A sync-over-sync diff lists every campaign whose cost or value moved by at least
a small share (convention: 5%) or whose status flipped; the rest are unchanged
and produce no change record. A campaign added since the prior sync carries a
cost delta of "new" rather than a computed percentage, so the spike rule - which
reads a relative rise - does not fire on it; a launch is not a spike. A removed
campaign likewise. The movers list is ranked by absolute value delta then by
current cost, and capped for display; the rule runs on every changed record, not
only the displayed ones.

## Decision rules

- When cost rose and value rose proportionally or better, nothing fires; growth
  is not an anomaly.
- When cost rose from zero, the relative delta is undefined; treat the campaign
  as newly spending and let the snapshot rules judge it. Never compute a delta
  against a zero base as a percentage.
- When the prior period is a degraded or sample sync, do not diff; a change
  against illustrative data is not a change.
- When the spike coincides with a known budget change the manager made, the rule
  still fires and the detail still quotes the numbers. Triage does not know the
  manager's intent, and an intended spend rise that did not return is still worth
  a look.
- When the campaign is prospecting by funnel role, label the role beside the
  warning; a prospecting campaign scaling up will show last-click dilution by
  construction.

## What is convention here

The 50% cost jump, the "less than half the cost rise" value lag and the 5%
materiality floor are practitioner conventions. The first is coarse on purpose:
below it, ordinary period-to-period spend variance would fire the rule weekly.
The lag fraction is where teams differ most - a margin-rich business tolerates
more dilution than a thin one - and a team that supplies a margin should consider
replacing the fixed fraction with "marginal return below break-even", which
belongs to the profitability subject.

## When not to use this

Do not use the rule to judge a deliberate scale-up in its first days. Delayed
conversions and learning periods lag value behind cost for a while on some
platforms; the rule will fire, the badge is honest about the numbers, but the
manager's decision belongs to the reallocation subject with its own confidence
caps.

Do not run the rule on a whole-account total. Mix shifts between campaigns make
the total's deltas meaningless as a dilution signal; the rule is per campaign.

Do not treat a spike rule as a substitute for pacing. A campaign that spends its
budget faster is a pacing fact for the goal-pacing subject; this rule speaks only
when the extra spend did not return.
