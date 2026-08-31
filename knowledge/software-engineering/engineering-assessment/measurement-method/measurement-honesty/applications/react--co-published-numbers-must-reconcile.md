---
layer: application
type: application
subject: measurement-honesty
technique: co-published-numbers-must-reconcile
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Two implementations of one percentage, and only one of them needs a clamp

A collection panel in a React app shows a grid the user fills by placing items,
and a side panel listing the items still available. The panel publishes a small
system of numbers — `totalItems`, `placedCount`, `remainingCount`,
`completionPercentage`, `isComplete` — computed in a single memo in
`src/app/features/Collection/hooks/useVisibleCollectionItems.ts:140-159`.

The same app computes the same quantity a second time, in the store that owns
the grid, at `src/stores/grid-store.ts:237-250`.

## The tell was a clamp

Read the two side by side and one difference does all the work:

```ts
// useVisibleCollectionItems.ts — the consumer
const completionTarget = maxGridSize ?? totalItems;
const completionPercentage = completionTarget > 0
  ? Math.round((placedCount / completionTarget) * 100) : 0;
return { completionPercentage: Math.min(completionPercentage, 100), /* Cap at 100% */ ... };

// grid-store.ts — the owner
const percentage = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
```

The store's version has no clamp and needs none: `matchedCount` and `total` are
both counted over `gridItems`, so the ratio cannot leave `[0, 1]` by
construction. The consumer's version needs a clamp because its numerator and
its denominator are counted over **different populations**, which is the last
constraint in the technique's list — *two counts compared to each other carry
the same predicate*.

Tracing the two inputs settles it. `placedCount` is `placedItemIds.size`,
derived from `getPlacedItemIdsFromGrid(state)` over the **whole grid**, across
every page and group. `totalItems` is `items.length`, and `items` is
`rawItems` — `paginatedData?.data`, i.e. **one page** of results
(`useCollection.ts:305-320`). The denominator is worse still: the hook is
called with `maxGridSize: pageSize`, under a comment that says what it is —
`// Use page size as proxy for grid size`.

A clamp written as caution is the shape this technique predicts. The impossible
value is computed, detected by `Math.min`, and then destroyed at the point of
detection, leaving a well-formed number that renders exactly like one that
earned its digits. That is the sixth datum state — *refuted* — being coerced
into *measured*.

## The A/B

Both computations are pure functions of their inputs, so the paired comparison
ran in a harness with **no product code changed**. Arm A is the hook's memo
transcribed verbatim; arm B is arm A plus the technique's reconciliation
assertions; the store's `computeGridStatistics` supplied a **ground truth arm**,
because the app already contains the correct answer for the same quantity.

The state space was enumerated from the tree's own parameters rather than
invented: grid capacities across `GRID_LIMITS.MIN_SIZE`–`MAX_SIZE` (5–50, from
`src/lib/grid/constants.ts`), page sizes 50 (the value the shipped panel passes)
and 20 (the value the hook's own usage-example documents), and page fill states
for a partial last page, a partial page and a full page.

| | arm A (as shipped) | arm B (with reconciliation) |
| --- | --- | --- |
| states exercised | 120 | 120 |
| states rendering a well-formed percentage | **120** | 19 |
| states flagged as refuted | 0 | **101 (84%)** |
| of those, hidden by the `Math.min` clamp | — | 9 |
| displayed % disagreeing with the store's own figure | **66 (55%)** | 0 published |
| `isComplete` disagreeing with the store | **21** | 0 published |

Verdict: **better**. Arm A never refuses; it publishes a number in every
reachable state, and in 55% of them that number contradicts the figure the same
application computes for the same thing. The disagreements are not marginal — a
five-slot grid with one item placed shows **2%** in the panel while the store
says **20%**.

## What the clamp was and was not doing

Worth recording, because the first prediction was wrong and the correction is
the useful part. The clamp looked like the headline defect; it is not. With the
shipped `pageSize` of 50 and a maximum grid capacity of 50, the raw ratio can
never exceed 100%, so **the clamp never fires in the shipped configuration** —
it accounted for 9 of 101 flagged states, all of them under the documented
`pageSize: 20`.

The defect is the denominator, and the clamp is only its fingerprint. That
distinction matters for the fix: removing the clamp would change nothing in
production, and would have looked like a fix.

## The structural fact

Nobody designed this, and it is better evidence than the arithmetic. The hook
subscribes to the grid store directly — `useGridStore.subscribe((state) => ...)`
— and reads `getPlacedItemIdsFromGrid(state)` off it. The same `state` object
carries `maxGridSize` (the grid's real capacity) and `gridStatistics` (the
already-correct percentage). **The correct denominator, and in fact the entire
correct answer, was on the object the consumer already held**, and the consumer
reached past it for a page size imported from somewhere else.

That is the general shape worth carrying: a second implementation of a published
quantity does not usually appear because someone disagreed about the definition.
It appears because the consumer did not have the denominator at hand, and the
clamp is where that shows.

## What this realization cannot do

The harness proves the two figures disagree and that arm B catches it; it does
not decide **which** figure the panel should show. "Grid fullness" (the store's
answer) and "progress through my collection" are both defensible things for that
label to mean, and the code's own comment — page size as a *proxy* — suggests
the author wanted the former and did not have it. Choosing between them is a
product decision, not a reconciliation result, and this application deliberately
stops at the pair.

A second finding sits one function away and is left recorded rather than tested:
`cowGridUpdate` (`grid-store.ts:259-290`) maintains `matchedCount`
**incrementally** as `stats.matchedCount + matchedDelta` rather than rescanning,
while `computeGridStatistics` — the full recomputation — exists in the same file
and is never used to re-verify it. That is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
with the recomputation path present but unwired: the arbiter exists and nothing
calls it.
