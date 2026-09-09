---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: cause-ladder-tracking-gap-first
status: forged
laws: [not-measured-is-not-zero, label-convention-as-convention]
shared_with: []
use_when: [classifying why a portfolio or cohort misses target, ordering a closed cause set, a zero-conversion account is about to be diagnosed as waste]
---

# Cause ladder, tracking gap first

A diagnosis classifies a miss into one cause from a closed set, and it does so by
walking the causes in a fixed order and stopping at the first that fires. The order is
the technique: it encodes which misclassification is most expensive, and it puts the
cheapest-to-fix, most-often-misread cause at the top. For a paid portfolio that cause
is the measurement gap - spend and clicks with no conversions recorded - and it is
checked before waste, because the two look identical in the numbers and imply opposite
actions.

## Why the gap comes first

A campaign that spent and recorded zero conversions is either burning money or
unmeasured. The numbers cannot distinguish the two; only the pattern across the
portfolio can. When *every* campaign spent and *nothing* converted, the likelihood that
the whole account simultaneously stopped working is far below the likelihood that the
conversion tag, the import or the account link broke. A waste verdict there sends the
owner to pause campaigns that may be performing; a gap verdict sends them to check
measurement first and touch nothing until the numbers return. The asymmetry of harm
puts the gap on the top rung, and the rule is:

**When total spend is positive and total recorded conversions are zero, diagnose a
measurement gap, because spend with nothing measured coming back is absence, not
zero, and pausing on absence destroys working campaigns.** This is
[not measured is not zero](../../../_laws.md#not-measured-is-not-zero) applied to a
verdict rather than a cell.

## The ladder for a paid portfolio

Each rung is a predicate over already-computed numbers; the first true rung is the
cause. The thresholds below are the practitioner conventions this subject was
reconciled against, not measured constants, and a technique that copies them says so.

1. **Measurement gap.** Spend > 0 and conversions = 0 across the portfolio.
2. **Waste on zero-conversion campaigns.** The spend of campaigns with no conversions,
   as a share of total spend, at or above a quarter. Convention: 25%.
3. **Efficiency drift.** With a prior window present and fully covered: cost rose by
   at least a stated fraction while conversion value grew by less than half of that
   rise. Convention: cost +15%, value lagging below 50% of the cost rise. A missing or
   partial prior skips the rung rather than fabricating a zero prior.
4. **Network imbalance.** With more than one spending network: some network retains
   less than a stated fraction of the best network's return while carrying at least a
   stated share of spend. Convention: below 60% of the best return, at or above 25% of
   spend. Both halves are required - a small laggard is not an imbalance.
5. **Healthy.** A target exists and the portfolio's cost share of revenue is at or
   under it.
6. **Misallocation.** The remainder: money sits in weaker campaigns while stronger
   ones could absorb it. The neutral, always-actionable catch-all.

The cohort and lead-source instances have the same shape with their own rungs: too few
observations to blame anything but volume, then the cause the ratios point to, then
"ok". The lead-source rungs and their floors belong to the lead-quality subject; what
this technique fixes is that *volume comes first there for the same reason the gap
comes first here* - the top rung is the one whose misreading does the most damage.

## Predicates are ratios

Every rung compares a share, a ratio or a relative change, never an absolute amount.
That is what lets the same ladder read a foreign-currency account without an exchange
rate, and it is why the drift rung compares growth rates rather than the money gap. A
ladder with a currency-denominated rung has silently assumed a market.

## Decision rules

- When the prior window does not reach back a full second period, skip the drift rung
  and say so; do not compare against a partial prior, because it reads as a collapse.
- When more than one rung would fire, report the first only, and tell the reader that
  the ladder reports one cause at a time - the next cause surfaces once this one is
  fixed. Do not return two causes; the diagnosis is about what to do first.
- When the model returns a cause outside the closed set, fall back to the
  deterministic pick from the same ladder, not to a fixed default - the ladder already
  knows what the numbers say.
- When the ladder reaches "healthy", still hand the reader the weakest spender, so a
  clean bill of health has a subject to watch.
- When severity is required and the model omitted it, derive it from the cause that
  will actually be displayed, so the two can never contradict.

## When NOT to use

- For a single campaign in isolation. The gap rung reads the portfolio pattern; one
  campaign with zero conversions is a triage finding, not a diagnosis.
- On illustrative or sample data. The ladder will happily classify a fixture; the
  verdict is about nobody.
- When the closed set has grown past six or seven causes. At that point the ladder has
  become a taxonomy, and the ordering argument - which misread is most expensive - no
  longer has a clear answer. Split the diagnosis instead.
- As a severity engine. The ladder says what is wrong; how urgent it is belongs to the
  triage discipline.
