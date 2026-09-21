---
layer: application
type: application
subject: profit-on-ad-spend-economics
technique: overhead-and-fulfilment-loading
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Reject-don't-coerce cost-model inputs and revenue-share overhead in a report engine

The Czech-market adtech workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) loads overhead and fulfilment in two engines that share primitives:
`src/lib/cost-model/compute.ts` (one blended margin, whole overhead charged once) and
`src/lib/profit/overhead.ts` (per-channel margin, overhead split by revenue share).
`src/lib/profit/core.ts:10-19` documents the seam between them under the heading
"THE SEAM - what deliberately DIFFERS between the two engines, and stays theirs".

## The incident and the boundary rule

`sanitizeCostModel` (`cost-model/compute.ts:103-113`) validates the three inputs with
one policy, and the doc comment at `:95-102` records why:

> Every field uses the SAME reject-don't-coerce policy — previously an invalid overhead
> or per-order cost (e.g. a thousands-separated "45 000" → NaN, or a negative) was
> quietly coerced to 0, so the report showed a rosier "true net profit" that omitted
> the overhead the model exists to capture.

The predicates: margin must be finite and in `(0, 1]` (`:109`; zero rejected because
"a zero-margin model earns nothing", one accepted as 100 percent); overhead and
per-order cost must each be finite and `>= 0` (`:110-111`). Any failure returns `null`
so the API route "can 400 rather than silently persist a wrong number" (`:95-96`).
This is the structural form of the technique's input-hygiene rule: a lie about a cost
is refused at the boundary where it can still be corrected by a person.

Inside the arithmetic the opposite rule holds, and the tree says so: `core.ts:26-32`
`overheadForPeriod` and `:43-48` `fulfilment` collapse non-positive inputs to zero
"so a disabled/blank model degrades to the pre-overhead view rather than producing a
negative overhead". Degrade-to-zero is right for a disabled model and wrong for a
mistyped one; the boundary decides which is which before the primitives see the value.

## Whole versus split, in code

`periodProfit` (`cost-model/compute.ts:37-53`) computes gross profit at one blended
margin, prorates monthly overhead by `PERIOD_MONTHS` (`:12`, 30d→1, 90d→3, 12m→12),
charges fulfilment per conversion, and subtracts all of it from one net profit; its
comment at `:38-40` names the contrast: "the per-channel /zisk engine splits overhead
by revenue share instead". `applyOverhead` (`overhead.ts:19-94`) takes the same
`overheadForPeriod` total (`:31`) and allocates it at `:37-38`:

```ts
const revShare = totalRevenue > 0 ? r.revenue / totalRevenue : 0;
const allocatedOverhead = periodOverhead * revShare;
```

Fulfilment is charged per row at `:39` from `r.conversions`. Contribution profit,
the loaded verdict (`contributionProfit >= r.cost`, `:44`) and the contribution ratio
(`:47`) follow, and `loadedBreakEvenRoas` (`core.ts:85-93`) is called at `:52-57` with
the row's allocated overhead so each channel gets its own loaded break-even.

## The deviation to record

The allocation key is revenue share and nothing on the surface labels it as a
convention. The technique's warning applies exactly: the channel earning the most
revenue receives the most overhead, so a business's best channel can read as its
worst contributor. The workspace's own scouting noted a second consequence in the
product view - product-level ad cost is itself allocated by revenue share, so a
category's profit on ad spend is computed partly from a number derived from its own
revenue, and the ratio is partly circular. The standard stays: name the key, keep the
whole-portfolio profit-and-loss as the figure of record, and never cut a channel on an
allocated-overhead loss when its contribution before allocation is positive. The tree
gets the first two structurally (the seam comment, and the report's whole-overhead
charge) and the third by silence.

## Reconciliation of the two margin bases

`src/lib/profit/reconcile.ts:9-14` sets `MARGIN_DIVERGENCE_PP = 2` with its footing
("≈ the smallest gap that moves a mid-six-figure revenue's net profit by a noticeable
amount while staying above per-channel rounding jitter") and `:49-52` rounds to one
decimal before comparing so an exact-boundary gap "isn't tipped under the threshold by
binary-float error (0.42 − 0.4 ≈ 0.01999…)". An absent or non-finite persisted margin
returns `diverged: false` (`:40-48`): no model, nothing to reconcile. The default the
report offers for that model comes from `src/lib/catalog/blended-margin.ts:32-43`, a
revenue-weighted (price × daily velocity) mean of per-SKU margins that returns `null`
when nothing revenue-bearing resolves - "never a fake 0 %" (`:16-18`).

## Serialisation of the loaded break-even

`deriveBreakEven` (`cost-model/compute.ts:76-93`) omits the loaded fields when
overhead and fulfilment are both zero (they would duplicate the gross figure) and when
the loaded value is non-finite, because "JSON.stringify(Infinity) becomes null,
breaking the `number` contract downstream" - the boundary rule of the break-even
technique realised at the report's edge.
