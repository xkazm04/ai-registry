---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: wasted-spend-ranking
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The money pit could not name a campaign that converted nothing

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`), Node 24 per `package.json` engines. Anchors: `wastedSpend` and
the worst/best picks in `src/lib/diagnoses/ads-request.ts`, the "money pit" pattern in
`minePatterns` (`src/lib/patterns/extract.ts`), and the donor ranking in
`recommendBudgetMoves` (`src/lib/campaigns/budget-moves.ts`).

## What the tree already did right

The ads diagnosis is the tree this technique was reconciled against, and it still
matches the procedure step by step. Waste is all of the spend for a campaign with no
conversions or no value. For a converting campaign it is the spend above value times
target cost share, floored at zero. The ranking sorts by waste with ties by cost and
takes six. If nothing wastes, it takes the single highest cost share. The best set comes
from the remainder. Under mixed currency it is scoped to the primary network. The target
comes from the tenant's agreed goal, through the same resolver the badges use. A seam
chosen there could only confirm the technique, so it was not the seam.

## Where it broke the rule

The same tree ranks waste in three places, with three definitions. The pattern miner's
"money pit" ("what not to repeat") ranked by `cost × (1 − roas/targetRoas)`, which is the
same number for a converting campaign. But it admitted only `roas > 0`. A campaign that
spent and converted nothing is the largest waste by construction, and it could never be
the pit. The pattern named a smaller partial waste instead and quoted that smaller sum as
the "wasted estimate". The budget recommender admits zero-return spenders only on
request. It ranks them first when it does, but it measures against the module's
portfolio target rather than the tenant's goal.

The seam was chosen to falsify the technique's zero-conversion rule. A zero-conversion
row can be a tracking gap rather than waste. If excluding it had been a deliberate guard,
the rule would need a boundary. The history shows no such reason: the filter arrived with
the pattern library, and a later change that threaded the tenant's target through the same
line kept it without comment. The tree's one deliberate exclusion is
somewhere else. The budget recommender treats "conversions but no value" as not measured,
not as zero return. B keeps that exclusion, because a pattern has no field to say why,
and the technique's rule for that case is to say why.

## Proof

Paired A/B through the real `minePatterns`, with arm B calling the ads diagnosis's own
`wastedSpend`, so the two surfaces share one definition.

| Measure | A (roas > 0 only) | B (wasted spend) |
| --- | --- | --- |
| pit is not the top waster, adversarial fixture (8 000 at zero conversions vs a 2 800 partial waste) | 1 / 1 | 0 / 1 |
| pit is not the top waster, 120 sample spines (3 periods × 5 types × 8 seeds) | 0 / 120 | 0 / 120 |
| value-less converter or paused row named (floor) | 0 / 2 | 0 / 2 |

The sample row is the honest limit. The illustrative spine carries no zero-conversion
campaign, so the defect never showed on demo data and only fires on a live portfolio
with a non-converting spender. For converting rows the waste number is unchanged, and
the existing target tests pass untouched. Floor: typecheck and lint are green. The unit
suite passed 4389 of 4393; the only red file was `patterns-embeddings`, which also fails
on the base. Project commit `688013d4` is on branch `cur/wsr-moneypit` (pushed). The
pre-push gate on master is red on the base suite (`patterns-embeddings` and the
generated-instruction drill), so the fast-forward waits on that.

## What this realization cannot do

It does not run the cause ladder. A zero-conversion pit may be a tracking gap, and the
pattern's text says "burns budget" either way. The ads diagnosis can tell those apart;
the pattern cannot. The live rate of zero-conversion pits is not measured. The budget
recommender still ranks against the portfolio constant rather than the tenant's goal,
and that is not changed here.
