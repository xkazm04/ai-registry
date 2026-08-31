---
layer: application
type: application
subject: agent-memory
technique: lane-reconciliation
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A three-store fan-out with no reconciler, in a client store (Node/TypeScript)

The technique is written for a memory store, but its premise — a record plus
derived lanes, no shared transaction, a hand-maintained sync at each call site —
is not a property of memory systems. It is a property of any store with more
than one backend. This realization is a browser-resident content store in a
Next.js app, and it reproduces the whole failure shape at a scale where every
part is visible in one directory.

## The fan-out

`src/stores/backlog/types.ts:70` and `store.ts:56` establish three places the
same items live:

- `state.groups` — the **record**. Owns identity and item contents.
- `state._itemIndex` — an `id → groupIndex` map (`item-index.ts:3`), rebuilt
  wholesale on hydration and maintained incrementally elsewhere.
- `state.cache[key].groups` — a per-category copy of the record.

There is no chokepoint. `_itemIndex` is written at twelve distinct call sites
across `actions-data.ts`, `actions-items.ts` and `actions-utils.ts`; the cache
copy is written through a helper (`cache-utils.ts:42-54`) that each mutating action
must remember to call. Nothing ever compares the three.

## Which lane has a floor under it — the classification inverts

The technique says severity is decided by whether a lane's readers can reach the
record without it, and this tree answers the question in opposite directions for
its two lanes, which is what makes it a useful case:

- **`_itemIndex` is an accelerator.** Both of its readers —
  `actions-utils.ts:63` (`getItemById`) and `actions-items.ts:237`
  (`isItemUsed`) — carry an explicit linear-scan fallback when the lookup misses
  or resolves to the wrong group. Divergence here costs the documented `O(1)`
  its comments advertise and nothing else.
- **`state.cache` looks like an accelerator and is not.** On rehydration the
  cache is promoted *back into* the record: `actions-data.ts:146`, `:166` and
  `:316` all run `state._itemIndex = rebuildItemIndex(cachedData.groups)` and
  serve `cachedData.groups` as the live state. A write that reaches the record
  but misses the cache is therefore not slow to find — it is **gone on next
  load**.

The name is the trap. "Cache" reads as an optional accelerator, and the
technique's own classification would be applied to it wrongly by anyone going on
the identifier alone. What decides the class is that a reader promotes it, which
is three files away from where it is written.

## The divergence, and the A/B

Two components derive the same cache key by different rules:

- `actions-data.ts:110` creates the cache entry under the **UI** category:
  `` `${category}-${subcategory || ''}` ``, deliberately, "to avoid collision".
- `cache-utils.ts:47` looks the entry up under the **group's own** category:
  `` `${group.category}-${group.subcategory || ''}` `` — and the groups were
  fetched from `resolveApiCategory(category)` (`actions-data.ts:107`), which
  lowercases and applies an alias map (`category-config.ts:257-260`).

When those two strings differ, `syncCacheFromGroups` finds no entry and returns
silently (`cache-utils.ts:49`). The mutation lands in the record and never
reaches the lane that will replace the record.

Both arms of the comparison ran the same four category fixtures through the
shipped `syncCacheFromGroups` logic and the shipped key derivations, adding one
item per case, then rehydrating:

| Case | record | cache lane | diverged | items after reload | detected |
| --- | --- | --- | --- | --- | --- |
| `sports` (canonical) | 2 | 2 | no | 2 | — |
| `Sports` (case differs) | 2 | 1 | **yes** | **1** | A: no · B: yes |
| `general` (alias of another) | 2 | 1 | **yes** | **1** | A: no · B: yes |
| `movies/action` | 2 | 2 | no | 2 | — |

**Arm A** (shipped): 2 of 4 cases diverge, both lose the write on reload, **0
detected**. **Arm B** (shipped plus the technique's reconciliation predicate,
read-only, run after the mutation): the same 2 diverge and the same 2 are lost,
**2 detected, 0 false positives** on the non-diverging cases.

The predicate that finds them is the technique's absent-where-declared-present
direction, with the declared key being the one the record was loaded under
rather than one re-derived at check time — which is the whole point: a
reconciler that recomputed the key the same way the buggy writer does would
report clean.

## What the tree says back to the standard

Two things this realization establishes that the memory-system framing does not
make obvious.

**The lane classification is a claim about callers, not about the index.** Here
the two lanes are structurally identical — both are derived projections of
`state.groups` — and they land in opposite severity classes purely because of
what their readers do. The accelerator has fallbacks; the "cache" has a promoter.
Nothing in either lane's own code says which it is.

**The silent-return sync is the defect's carrier.** `syncCacheFromGroups` has
two guard clauses that return without a value, and both are correct in
isolation: no group, nothing to sync; no cache entry for this key, nothing to
sync. The second is indistinguishable from the bug. A sync whose no-op path is
observable — a counter, a dev-mode assertion, anything — would have surfaced
this without a reconciler at all, which is the cheaper half of the technique and
the one worth reaching for first.

## What this realization cannot do

The predicate ran as an out-of-tree experiment against transcribed copies of the
shipped helpers, not as a test inside the app, so it proves the divergence is
reachable from the real key-derivation logic — not that it is reached in
production traffic. How often depends on how many UI category strings differ
from their resolved API form, which is deployment data this comparison does not
have. No product code was changed.
