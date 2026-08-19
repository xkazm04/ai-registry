---
layer: application
type: application
subject: public-money-attribution
technique: entity-level-deduplication
stack: node
status: forged
---

# Node: one shared reachable-money module

The politicas repo realizes entity-level deduplication — and with it the
owner/steward split and the floor discipline — as a single plain TypeScript
module, `features/money/reachableMoney.ts`, deliberately free of server
imports so the route loaders, the client console, and the colocated test all
share it.

## The incident that forced it

The module header (`reachableMoney.ts:1-11`) records why it exists: the phrase
"reachable public money" used to mean two different numbers. `/penize`
de-duplicated per company and split steward money out of the headline;
`/penize/kontrola` summed per TIE across all classes — so the 14 companies
tied to more than one MP were double-counted and a hospital's own contracting
sat in the same total as a supplier an MP owns. The per-MP case file did a
third thing: three tiles, no source, no class split. All three called the
result the same words. The fix was structural: one definition, one
implementation, three importers.

## The fold

`reachableMoney()` (`reachableMoney.ts:152-188`) implements rules 1 and 3 of
the header in one pass:

- Ties collapse into a `Map` keyed by `companyId` before any aggregation, so
  every company contributes its `contractCzk` / `subsidiesCzk` /
  `donatedToPartyCzk` exactly once.
- The bucket decision reads ALL of a company's ties: `else if (attributable)
  prev.attributable = true;` — a mixed-class company is attributable if ANY
  tie is owner-operator or manager. The comment at `reachableMoney.ts:23-26`
  names the two live mixed companies (PRaK a.s. v likvidaci at 0 CZK,
  AGROFERT a.s. at 8.7M CZK) and the rule this replaced: "whichever tie the
  relation scan happened to return first, which is not a rule."
- Only after the fold do the `attributable` and `steward` buckets sum, and the
  coverage verdict is computed from the per-company counts collected during
  the same pass.

The attributability predicate is exported separately as `isAttributable()`
(`reachableMoney.ts:76-78`) with its own doc: it had been re-implemented three
times (here, `features/dashboard/stateSlice.ts`,
`features/denik/getDenikData.ts`) — "three copies of a rule is three chances
for one of them to drift into calling a hospital's contracting an MP's money."

## Single-row rendering through the same function

`tieReach()` (`reachableMoney.ts:197-201`) routes a ledger cell through
`reachableMoney([tie])` — a one-tie population — rather than re-adding
`contractCzk + subsidiesCzk` at the cell, "which is how the page grew a fourth
definition of reachable money, unlabelled, sitting in the alarm colour under a
steward's hospital."

## Consumers

`ReviewStats.reachable` (`features/money/reviewTypes.ts:99-104`) documents the
migration on the consumer side: it replaces `totalReachableCzk`, "which summed
per TIE across all classes — double-counting the companies tied to more than
one MP and merging a public body's own contracting into the same figure as a
firm an MP owns." The claim-minting layer (`features/money/moneyClaims.ts`,
rule 1 of its header) then mints citations from `tieReach` / `bucketReachCzk`
only — no fifth sum.
