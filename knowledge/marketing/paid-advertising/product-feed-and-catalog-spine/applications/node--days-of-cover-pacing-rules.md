---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: days-of-cover-pacing-rules
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The 7 / 21 / 14 / 45 ladder and the field ownership that feeds it

`src/lib/inventory/compute.ts` at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) is the workspace's stock-pacing module: pure, caller-supplied `now`, and
the source of both the merchant's stock screen and the feed's stock label. It realises
the technique's ladder with four constants and proves the two structural points the
technique makes - that pacing is a proposal, and that pacing is only as honest as the
count it reads.

## The ladder

`DAYS_PAUSE = 7`, `DAYS_LOW = 21` (`:59-60`), `AT_RISK_DAYS = 14` (`:62`) and
`RESTOCK_HORIZON_DAYS = 45` (`:64`). `stockRows` (`:107-146`) computes
`daysOfCover = stock / dailyVelocity` with `Infinity` when velocity is zero (`:110`),
grades `pause` below 7, `low` below 21, else `ok`, and converts a `pause` to `resuming`
when `incomingQty > 0` and a parseable `restockDate` lies 0-45 days ahead (`:117`). The
`atRisk` flag at `:90` is the early-warning band between 7 and 14 days. Each status
carries a Czech action string - pause the ads, cut the budget, run at full - and the
row sorts worst cover first. None of the four numbers is justified in the file beyond
the comments naming their roles; they are practitioner convention, and this
application labels them as such.

`daysUntil` (`:96-102`) returns null for a missing, unparseable or past restock date,
so a stale date never converts a pause into a scheduled resume - the technique's
"in the past is ignored, not arrived" rule.

## Value at risk, with its incident

`coverValue` at `:138-141` is `stock * price * margin`, guarded to zero when velocity
is zero. The comment records the earlier formula `daysOfCover * margin * dailyVelocity`,
which "algebraically cancelled velocity to `stock * margin` - a price-free unit count
the UI then rendered as Kč, understating value at risk by a factor of the SKU's price
(100-500x)." That incident is why the technique states the formula once and pins it.

## Cover caps the seasonal plan; the move is a proposal

`seasonalBudgetPlan` (`:191-230`) converts aggregate cover to `sustainableMonths =
floor(cover / 30)` (`:205`) and caps each upcoming month beyond it at the flat budget
(`:213-215`). `budgetChangeSet` (`:270-304`) takes donors of status `pause`,
`resuming` or `low` (`:283`), moves `shiftFraction` (default 0.5) of an illustrative
spend - `price * dailyVelocity * AD_SPEND_RATIO` with the ratio at `:256` set to 0.15 -
to the highest-velocity `ok` item in the same category, and skips a donor with no such
recipient. The doc comment reads "PURE recommendation only - produces a proposal table,
mutates nothing"; the account write lives behind the workspace's change-set envelope,
which is the gate the technique requires. The spend basis is labelled illustrative in
the file and should be read as a stand-in until a per-SKU spend read-back exists.

## The count pacing may trust

`src/lib/catalog/import.ts` decides which source owns which field. `WAREHOUSE_SOURCES`
(`:14`) - the warehouse and ERP connectors - are authoritative for stock, velocity and
margin; `overlay` (`:51-70`) lets a product feed overwrite name, price, category,
availability and barcode while keeping `stock` from the existing row whenever the
feed's stock is zero (`:63`), and keeps velocity and margin unless the source is
authoritative. The header comment (`:5-9`) states the ownership in one sentence: a
feed "OVERWRITES the former and PRESERVES the latter." This is the structural
guarantee behind the technique's rule that a feed's unknown-zero must never collapse
cover to zero and pause every ad at once.

`src/lib/catalog/events.ts` closes the loop: `CatalogEventActor` (`:30`) distinguishes
`feed-import`, `warehouse-sync` and `manual`; events are keyed `${at}_${key}_${kind}`
so a retried import is idempotent; the ledger is capped at 2000 (`:51`); and the file
header (`:3`) names the purpose - a performance move such as "ROAS fell on the 14th" is
usually explained by a catalog event, and the ledger is where the explanation lives.

## Deviations

Velocity history is not gated: a product with one day of sales gets a daily rate and a
cover figure, where the technique asks for "not yet measurable" below a handful of
days. The `AD_SPEND_RATIO` basis is a notional constant rather than the account's real
per-SKU spend, which the file admits. And the seasonality index in
`monthlySeasonality` (`:19-31`) averages revenue per calendar month over the whole
series without a partial-month flag, so a current month with three days of data enters
the index at full weight. The standard stands on all three; the tree names the first
two as seams and is silent on the third.
