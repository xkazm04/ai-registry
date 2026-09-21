---
layer: application
type: application
subject: search-term-mining
technique: never-mine-demo-data
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The degraded-sync refusal - two halves in the workspace's campaign sync

At commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08) the Czech-first
adtech workspace runs search-term mining as a third best-effort fetch inside the
campaign sync, `src/lib/campaigns/sync.ts:139-161`, and stores the result through
`src/lib/campaigns/store/search-terms.ts`. Together they realize both halves of the
technique - skip the step, and make the sample source unable to overwrite - and the
structural fact the tree proves is that the two halves are independent guards on the
same write.

## Half one: the step is skipped, not labelled

`sync.ts:151` gates the whole step on the campaign fetch's degradation flag:

```ts
if (!degradation.campaigns && connector.fetchSearchTerms) {
  try {
    const terms = await connector.fetchSearchTerms(period);
    if (terms.length > 0) {
      await saveSearchTerms(tenant, terms, { period });
      searchTermsOk = true;
    }
  } catch (err) { ... }
}
```

The comment above it (`:144-149`) is the technique's reasoning verbatim: "a degraded
campaign fetch means this connector is serving SAMPLE data, and a negative keyword is
a permanent change to a real account. Mining demo queries for it would put a
fabricated term one approval click away from the live account, so the step is skipped
outright rather than labelled." The same `!degradation.campaigns` condition suppresses
critical-campaign alerting (`:172`) and the money verdict, so the three near-writes on
a tenant share one provenance gate.

## Half two: the sample source answers with nothing

The `rows.length > 0` check at `:154` is described in the same comment as "the second
half of the same rule: the sample provider answers `[]` by design, so it can never
overwrite real stored terms." `saveSearchTerms` (`store/search-terms.ts:70-80`)
replaces a tenant's stored terms for a period wholesale - there is no merge - so an
empty write would erase the last good real rows. The store's own doc comment (`:68-69`)
restates the contract: "Callers must only reach this after a genuinely live,
non-degraded fetch." The cap applied before the write (`:64-66`) is by cost, so the
tail that falls off is always the cheapest, matching the golden path's reading of a
partial report.

## Why the two halves matter separately

If the skip at `:151` were lost in a refactor, the sample provider's empty answer
still fails the `length > 0` check and the store is untouched. If the sample provider
were changed to return fixture rows, the skip still prevents the fetch from being
issued on a degraded tenant. Neither guard alone survives both changes; the pair does.

## Where the recommender's projection agrees

Downstream, `src/lib/campaigns/simulate.ts:153-158` skips criterion moves before the
donor lookup so a terms-sourced change-set projects as an exact identity, with the
comment that "pretending otherwise would put a fabricated lift on the approval
screen". That is the golden path's value semantics (a negative saves spend and creates
no value; a promote's value is already realized) enforced where the number would be
shown. The change-set envelope those moves ride - simulate, guardrail, approval,
ledger - is owned by `budget-reallocation-prescription` and is not restated here.

## Deviation

The sync writes only on a live, non-degraded read and the store never merges, so the
technique's "keep the last good rows on an empty sync" rule holds by construction. What
the tree does not do is stamp the stored terms document with a provenance field of its
own; provenance is inferred from the sync having reached the write at all. A reader of
the store cannot tell a period that was never synced from one that was synced while
degraded (both read as `[]`, `store/search-terms.ts:86-92`), which is a "not measured
versus zero" ambiguity the surface must resolve from the sync record rather than the
terms document.
