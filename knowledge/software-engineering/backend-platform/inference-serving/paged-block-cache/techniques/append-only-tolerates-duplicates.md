---
layer: technique
type: technique
subject: paged-block-cache
technique: append-only-tolerates-duplicates
status: forged
laws: [identity-survives-reuse, one-validation-door]
shared_with: []
use_when: [deciding whether to deduplicate a cache entry discovered after the fact, a per-request reference table is append-only and a late duplicate appears, choosing between a rewrite path and a bounded waste, two concurrent requests compute the same block]
---

# Append-only tolerates duplicates

Two rules that look like separate hygiene decisions are actually one design,
and it is worth stating them together because the second is a *consequence* of
the first and is otherwise read as sloppiness.

**Rule one: only a complete block is admitted.** A partially filled block's
identity is not final — its key is a function of its contents, and its contents
are still growing. Publishing a key for a block that will change is publishing
a reference that will silently stop describing its referent, which is the exact
failure [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
forbids. So a block enters the shared index at the moment it fills, and not
before. The last, partial block of every in-flight request is private to that
request until it completes.

**Rule two: the per-request reference table is append-only.** A request holds
an ordered list of the blocks its prefix occupies. Entries are appended as
blocks are allocated and are never re-pointed. This is a strong invariant and
it is the one worth defending, because it means no reader of that list — the
running computation, a checkpointer, a preemption handler, a metrics pass —
ever observes an entry change under it, and therefore none of them needs a
lock, a version, or a retry.

## The duplicate the two rules produce

Put them together and a specific, benign anomaly appears. A request allocates
a fresh block, fills it, and at the moment it completes discovers that an equal
block — same chained key, same contents, same derived state — is already in the
shared index, placed there by a concurrent request that filled its copy first.

The tempting fix is to detect the duplicate on insert and retro-point this
request's table entry at the older, already-shared block, so both requests
reference one copy. **Do not.** That is precisely the rewrite the append-only
invariant exists to forbid, and buying it back costs more than the duplicate:

- **A rewrite path is a race.** The entry being re-pointed may be actively read
  by the computation that is still running over it. Now it needs
  synchronization, on the hot path, to reclaim a page.
- **The reference counts move too.** Re-pointing means decrementing one block's
  users and incrementing another's, atomically with the swap, which turns a
  free-list push into a small transaction.
- **The window is short and the cost is bounded.** The duplicate lives exactly
  as long as the request that owns it. Worst-case waste is
  (concurrent requests) × (blocks that raced), and it is reclaimed with the rest
  of the request's blocks at the end.

So the duplicate is *tolerated*. Both blocks exist, both are correct, and both
are reachable: the index is a map from key to *one or more* blocks, a lookup
returns any of them, and each returns to the free list when its own request
ends. Keeping both under the key rather than dropping one costs a slightly
richer index type and buys the property that matters — the reachability of a
block never depends on who won a race. Nothing is corrupted, nothing is leaked,
and no mutation path was introduced.

The index's shape is worth one sentence of design attention, because the
multi-block case is rare and the single-block case is the whole hot path. A map
whose value is *either* a block or a small collection of blocks keeps the common
case free of an inner container, which matters when the pool holds hundreds of
thousands of entries and the container would be allocated for every one of them.
The general rule: when a data structure's degenerate case is overwhelmingly the
common one, pay for the general case only where it occurs.

This is the trade in general form: **when a rewrite exists only to reclaim a
bounded, self-healing waste, the waste is cheaper than the rewrite.** The
rewrite's cost is permanent and structural (a mutation path everyone must now
reason about); the waste's cost is transient and arithmetic (a number you can
compute and cap).

## Admission runs through one door

The rules only hold if there is exactly one place a block can enter the shared
index and exactly one place it can leave —
[one-validation-door](../../../../_laws.md#one-validation-door). The allocator
owns both: allocation, fill-completion (which computes the key and inserts),
reference-count changes, and release. A second code path that inserts a block
"because it already had one" is how a population of entries appears that never
passed the completeness check, and it is invisible afterwards because a
malformed entry looks like every other entry.

Two invariants the door enforces, both cheap and both worth asserting rather
than documenting:

- **A block in the shared index has a final key and a non-negative user count.**
- **A block on the free list has zero users**, and may still be in the index —
  that is not a contradiction, it is the reclaimable-but-still-useful state that
  makes a cache hit on a freed block possible.

## Decision rules

- Insert on completion, never before. A key that can still change is not a key.
- Never re-point an existing reference. Append, or allocate.
- When a duplicate is discovered on insert, keep both objects under the key;
  each is reclaimed by its own owner's release.
- Bound the duplicate before accepting it: compute worst-case simultaneous
  duplicates from the concurrency limit and confirm it is a small fraction of
  the pool. If it is not, this technique is the wrong trade (below).
- Route every insert, release and reference-count change through the allocator.
  No second door, not even for a special case.

## When not to use this

- **Unbounded or long-lived duplicates.** The trade is priced on the duplicate
  dying with its request. A cache whose entries outlive their creators, or whose
  duplicate count is not bounded by a concurrency limit, needs real
  deduplication with a proper handoff — and then it also needs the
  synchronization this technique avoided.
- **Units too large to duplicate even briefly.** If one block is a meaningful
  fraction of the pool, a transient double allocation is a stall, not a waste.
  Either shrink the block or dedupe on insert with the rewrite path built
  deliberately.
- **When the reference table is not append-only for other reasons.** If entries
  are already mutable — because blocks migrate between tiers, say — the
  invariant this technique defends does not exist, and dedupe-on-insert costs
  much less than it does here. Do not carry the rule across; carry the question.
