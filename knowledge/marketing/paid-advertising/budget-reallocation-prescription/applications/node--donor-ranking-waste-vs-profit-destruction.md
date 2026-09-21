---
layer: application
type: application
subject: budget-reallocation-prescription
technique: donor-ranking-waste-vs-profit-destruction
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Donor ranking with and without a margin - a pure recommender in a Czech adtech workspace

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08)
realizes the ranking as one pure function, `recommendBudgetMoves` in
`src/lib/campaigns/budget-moves.ts:85-213`, with no I/O and no model call, reusing
the same `TARGET_ROAS` constant and the same `simulateBudgetShift` model as the
campaign table so that a prescription reconciles with the table by construction
(the file's own header, lines 1-4). Node is the runtime the unit suite runs under
(`package.json` engines `node: 24.x`).

## The structural fact the tree proves

The margin is opt-in and changes only the order and the price, never the set. The
donor filter at `budget-moves.ts:121-128` reads the same four predicates under
both metrics - enabled, `cost >= minSpend`, `roas < TARGET_ROAS`, and `roas > 0`
unless pauses are admitted - and only the `waste` closure at lines 117-120
branches on the margin:

```ts
const waste = (c: CampaignRow) =>
  marginPct !== undefined
    ? c.cost - grossProfit(c.cost * c.roas, marginPct)
    : c.cost * (1 - c.roas / TARGET_ROAS);
```

`grossProfit` is imported from the profit core (`@/lib/profit/core`, line 8) rather
than re-derived, which is the boundary with `profit-on-ad-spend-economics` made
literal: the ranking cannot disagree with the profit table because it calls the
profit table's arithmetic. The comment block at lines 64-83 states the two
formulas and the reason - "it doesn't know a 3x ROAS channel at a 20% margin loses
money while the same ROAS at a 60% margin prints it".

The unit suite pins the claim that the margin re-orders without adding or dropping.
`test-unit/campaigns-budget-moves.test.mjs:103` ("no margin -> margin-blind revenue
scoring, byte-identical shape") and `:112` ("high blended margin flips which
under-target donor is the worst") are the two halves; `:122` pins profit gain as
margin times value gain on a shift, `:131` pins a pause recovering its full spend
as profit, and `:147` pins that a degenerate margin (zero or below, or above one)
falls back to revenue scoring rather than producing a ranking on garbage.

## Reject, do not coerce

The margin guard at `budget-moves.ts:100-103` accepts only a number in (0, 1]:

```ts
const marginPct =
  typeof opts.marginPct === "number" && opts.marginPct > 0 && opts.marginPct <= 1
    ? opts.marginPct
    : undefined;
```

An absent or corrupt cost model therefore cannot flip the recommender; the
margin-blind path is the fallback, and the comment says why ("a blank/corrupt
model can never flip the recommender into nonsense"). The workspace learned this
the hard way in a sibling module - a margin typed as "45 000" coerced through NaN
to 0 once produced a rosier profit (`src/lib/cost-model/compute.ts:12,55-113`, per
the measurement scout).

## Move pricing from the same inputs

A shift's `estValueGain` at line 185 is `amount * (recipient.roas - donor.roas)`
on the *floored* amount (the comment at 182-184 insists on this so the stated gain
reconciles with the applied move), and `estProfitGain` at line 199 is
`grossProfit(estValueGain, marginPct)`, spread only when a margin is present so a
margin-blind change set stays byte-identical. The `marginPct` is echoed on the
result at line 211 for the display ("při marži 42 %").

## Recipients

`budget-moves.ts:134-136`: enabled, `roas >= TARGET_ROAS`, `cost > 0`, best ratio
first; consumed once each via `usedRecipient` (lines 139, 170-172). The
recipient's *average* ratio is what prices the gain - the linear optimism the
projection technique labels.

## Deviation to record

The ranking is structure-blind, exactly as the paid scout's F item 2 says: the
shift is a flat `shiftFraction` of 0.4 (line 90), there is no read of whether the
recipient is budget-capped (that pacing predicate exists in
`src/lib/campaigns/types.ts:320-381` but is not consulted here), no learning-period
guard, and no seasonality term. The standard in the technique stands: the flat
fraction is a defensible first move on a small share and is not a restructuring
plan. The workspace's own `SIM_LOW_CONFIDENCE_DONOR_SHARE` of 0.5 in
`src/lib/campaigns/simulate.ts:89` is deliberately placed above 0.4 so that every
auto-recommendation reads high-confidence - which is the same structure-blindness
expressed as a label rather than cured.

## Conventions, as the tree labels them

`maxMoves` 3, `shiftFraction` 0.4 and `minSpend` 1000 CZK are defaults at lines
89-91 with no derivation from data; the technique labels all three as convention.
