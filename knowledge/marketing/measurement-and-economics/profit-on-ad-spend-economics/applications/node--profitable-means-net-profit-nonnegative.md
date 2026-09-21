---
layer: application
type: application
subject: profit-on-ad-spend-economics
technique: profitable-means-net-profit-nonnegative
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Break-even and the net-profit rule in a per-channel profit engine

The Czech-market adtech workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) realizes this technique as a pair of pure modules: `src/lib/profit/core.ts`
holds the profit primitives and the break-even formulas, `src/lib/profit/compute.ts`
holds the one row computation that every consumer of a profit verdict calls. Neither
imports anything with I/O; both run under plain `node` and are the modules the profit
tests pin.

## The structural fact: the verdict is not the ratio test

`compute.ts:29-47`, `computeMarginRow(revenue, cost, marginPct)`, returns
`grossProfit`, `netProfit`, `poas`, `breakEvenRoas` and `profitable` from one call.
The verdict line is

```ts
// Profitable ⇔ netProfit ≥ 0 (revenue·margin ≥ cost). This equals the
// ROAS ≥ break-even test for paid channels, but stays correct for a
// zero-cost channel (organic/direct), whose guarded roas=0 would
// otherwise read as a false "loses money after margin".
profitable: netProfit >= 0,
```

The comment records the incident the technique is built on. The guarded divide in
`src/lib/metrics/ratios.ts:8` (`den > 0 ? num / den : 0`) returns zero for a zero-cost
channel; `breakEvenRoas` (`core.ts:69-71`) is `1 / margin`, so any ratio test would
place the organic channel below break-even. The predicate reads `netProfit`, computed
by `core.ts:53-60` as `gross - adCost - overhead - fulfil`, so a channel with revenue
and no cost has net profit equal to gross profit and is profitable. The tree proves the
standard's central claim structurally: the ratio and the verdict are computed side by
side from the same inputs and the verdict deliberately ignores the ratio.

## One predicate, three consumers

`computeProfit` (`compute.ts:49-86`) spreads `computeMarginRow` into every row and
derives `unprofitableCount` (line 83) as `out.filter((r) => !r.profitable).length`,
so the count reads the same flag the row carries. `src/lib/profit/overhead.ts:35`
calls `computeMarginRow` for the gross fields and then adds the loaded predicate at
line 44, `contributionProfitable = contributionProfit >= r.cost`, with a comment
stating why it exists in one place: "unprofitableCount and the row colour both read
this so they can never disagree." The overhead summary's count (`overhead.ts:91`)
reads that flag. The module header at `core.ts:1-8` says what the shared primitives
were introduced to stop: "One drifting copy = the 'profitable' verdict silently
disagreeing between the report and the /zisk module."

## Break-even is derived, and the degenerate case is handled at the boundary

`core.ts:69-78` derives both break-evens from the margin and returns `Infinity` for a
non-positive margin ("a channel with no margin never breaks even"). The reciprocal
relation is stated in the doc comment of `breakEvenPno` (line 73-75): at break-even
cost equals gross profit so cost / revenue = margin = 1 / breakEvenRoas. The
serialisation rule the technique gives - map the infinite case to absent - is
implemented downstream in `src/lib/cost-model/compute.ts:87-92`, which omits the
loaded fields when `loadedRoas` is non-finite because "JSON.stringify(Infinity)
becomes null, breaking the `number` contract downstream"; `core.ts:66-68` carries the
same note as a caller obligation.

## Where the tree matches the standard, and where it stops short

Confirmed: the inclusive boundary (`>= 0`), the single shared row, the zero-cost guard,
the derived and reciprocal break-evens. The tree's inputs are platform-reported
revenue per channel (`ChannelRow` from `@/lib/metrics`) and a per-channel margin from
`src/lib/margins.ts:23-34` with a `FALLBACK_MARGIN` for unknown channels
(`compute.ts:56`). That fallback is a deviation from the standard's rule that an
absent margin withholds the verdict: a channel missing from the margin table is judged
at 45 percent rather than left unjudged. The workspace's own header at `margins.ts:10-12`
names the fix ("replace all of these with COGS/margin pulled from ... the ERP"), and
`src/lib/catalog/blended-margin.ts:32-43` already returns `null` rather than a fake
margin when nothing revenue-bearing resolves - the null-not-zero discipline exists in
the tree, one module away from the verdict that still defaults.
