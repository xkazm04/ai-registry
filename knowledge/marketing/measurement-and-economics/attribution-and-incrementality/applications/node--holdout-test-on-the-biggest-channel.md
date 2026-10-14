---
layer: application
type: application
subject: attribution-and-incrementality
technique: holdout-test-on-the-biggest-channel
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# Holdout test on the biggest channel - the budget recommender that reads attributed ROAS as causal

The workspace at commit `16d2269e` has no incrementality input anywhere: the campaign
record carries spend, clicks, conversions and "value of conversions = revenue
attributed to the campaign" (`src/lib/campaigns/types.ts`), and nothing records
whether any channel was ever held out. The consumer that matters is the budget
recommender (`src/lib/campaigns/budget-moves.ts`), which ranks donors and recipients
by attributed ROAS against a portfolio target and prices each shift as
`amount * (recipientRoas - donorRoas)`, labelled "incremental" in its own comments.
That arithmetic is incremental only if the attributed average equals the causal
marginal return, which is exactly what a holdout exists to check.

## The experiment: same inputs, one variable

The workspace's deterministic demo portfolio is the input (30-day period, seeded
generator, no product code changed). The brand-search campaign shows 13.7x attributed
ROAS against a target of about 5.6x; the demand-generation prospecting campaign shows
1.7x. Arm A is the recommender as shipped. Arm B multiplies only the brand campaign's
attributed value by a hypothetical incrementality factor and re-runs the same function.

- **Arm A**: one shift, 26,500 from prospecting into brand search, claimed gain about
  318,000.
- **Arm B**, factor 0.6: the same shift, claimed gain about 173,000.
- **Arm B**, factor 0.4 and 0.25: **no move at all** - the recipient falls below the
  target and stops qualifying. The decision flips at a factor near 0.41.
- The factor at which the claimed gain reaches zero is the donor ROAS over the
  recipient ROAS, 0.125: the shift stays "profitable" on paper unless more than 87 %
  of brand-search conversions would have happened anyway.

So the sole recommendation of the shipped logic is the one most exposed to the
technique's warning: the recipient is the channel whose attributed read is most
flattered, and the donor is the prospecting channel a last-click view under-credits.

## What the technique adds that the tree cannot supply

Two facts the demo portfolio also shows. The brand campaign is deliberately
budget-capped near its expected spend (the generator says so), so extra budget may not
be spendable at all. And it is the smallest spender of the three channels the
recommender touches; the technique's "biggest channel first" would test the
non-brand search or performance-max campaign, not the recipient. A holdout result
would enter the recommender as a per-campaign factor with its interval and date, absent
meaning 1.0 and byte-identical output, the same opt-in shape the recommender already
uses for margin.

## Verdict and bound

`unmeasurable`. The sensitivity is real and computed on the tree's own function, but
the factor is hypothetical: no holdout exists, the portfolio is the demo seed and not a
live account, and the experiment changes no product behaviour. Target (does the
recommendation depend on the unmeasured causal share) moved from stable to flipped at
0.41; the floor (factor 1.0 reproduces the shipped output) held. What would make it
measurable: one stored lift result for one real campaign. Nothing was shipped because a
factor with no producer would be an input nobody can fill.
