---
layer: technique
type: technique
subject: paged-block-cache
technique: release-order-is-the-eviction-policy
status: forged
laws: [creation-names-reaper, limits-are-derived]
shared_with: []
use_when: [choosing an eviction rule for a block pool, a cache is paying for recency bookkeeping on the hot path, deciding the order freed resources return to a pool, evicted entries leave unreachable descendants behind]
---

# Release order is the eviction policy

Most caches decide what to evict by *observing*: a recency stamp per access, a
frequency counter, a periodic scoring sweep. All three pay on the hot path or
in a background pass, and all three answer the question from the cache's own
narrow evidence — who touched what, when.

There is a cheaper moment and a better-informed witness, and they are the same
one.

> **The cheapest moment to rank a freed resource is the moment it is freed, and
> the party doing the freeing knows something the cache does not.**

A releasing request holds *structural* knowledge about the resources it is
handing back — where each one sat in its own work, how much history it
incorporates, whether it was incidental or foundational. The cache sees none of
that; it sees a page becoming available. So instead of a policy that recovers a
weak signal expensively later, hand freed resources back **in an order that
already encodes the prediction**. Allocation drains the front of the queue.
Eviction is now a pop, and the prediction cost zero.

This is [creation-names-reaper](../../../../_laws.md#creation-names-reaper) at
its sharpest: the allocation site names the reaper, and the release site tells
the reaper what order to work in.

**Put the ordering in the interface.** The release entry point takes an
*ordered sequence*, and its contract says in one line that the order is the
eviction priority — first in the sequence, first to be evicted. That signature
is what makes the technique real rather than a convention: the pool stops owning
a policy it has no information for, each caller supplies the ordering only it
knows, and a caller with no opinion passes its natural order and gets the coarse
behaviour. A pool whose only release entry point takes one item at a time has
thrown the information away before anyone could use it.

## This does not replace recency; it is the tie-break inside it

A queue drained at the front and filled at the back is already a coarse recency
policy — whichever request released longest ago sits closest to eviction — and
release ordering does not remove it. It orders blocks *within one release*,
which is precisely the population recency cannot rank: they were freed in the
same instant, so their access histories are identical and their structure is
not. Reading this technique as a replacement for recency produces the wrong
implementation (a stack, or a periodic re-sort) and misses that the two compose
for free.

## The ordering in a prefix cache: reverse, deepest first

For a chained prefix cache the structural predictor is exact rather than
heuristic. A block's key covers every element before it
([chained-block-identity](./chained-block-identity.md)), so:

- **Block 0 incorporates almost nothing.** Every input that begins the same way
  shares it. It is the single most valuable block in the request.
- **The last block incorporates the most.** For anyone else to reuse it, their
  input must match every element from the beginning through the end of that
  block. It is the least likely block in the request to be anyone's prefix.

Reuse probability is therefore monotonically decreasing in depth, by
construction — not by measurement, not by workload assumption. So a request
releasing its blocks hands them back **in reverse order**: last block first, so
it lands nearest the front of the queue and is taken first; block 0 last, so it
survives longest. One loop, backwards, at a point in the code where the request
is already walking its own block table — the implementation is a single
`reversed` around an existing list.

That ordering also discharges a correctness obligation. Because lookup is a
forward walk that stops at the first miss, reclaiming a block strands every
descendant of it — they stay resident and no future lookup can ever compute
their keys. Freeing children before parents is the only order in which a
partially reclaimed chain leaves no unreachable residue. Getting the prediction
and the invariant from one line is why this is worth writing down rather than
treating as a micro-optimization.

## The list has to be intrusive

A queued block is still *live*: it is on the free list because nobody is using
it, but it is still in the shared index, and a new request whose prefix matches
will hit it. On that hit the block is **removed from the queue outright**, not
moved within it — a block with a live user is not an eviction candidate at all,
so it leaves the ranking until its last user releases it and it re-enters at the
position that release chooses. Removal is therefore from an arbitrary interior
position, and it has to be constant time or the whole saving evaporates.

So the reclaim list is a **doubly-linked list whose pointers live inside the
block object**, not a queue holding references to blocks. The consequences are
the ones you want:

- **Removal from the middle is O(1)** with no search, because the block already
  knows its neighbours.
- **No wrapper allocation per queued block.** A pool of a hundred thousand
  blocks does not allocate a hundred thousand node objects on every release
  cycle, and the reclaim path stops producing garbage in proportion to traffic.
- **There is one representation of "queued".** A block cannot be in the list and
  believe it is not; membership is a property of the object itself.

The cost is that the block type now carries list pointers it does not
semantically own, and that only one such list may exist per field. Both are
acceptable; the second is worth checking before a second reclaim tier is added.

## Where a released block goes when it is *not* reusable

Not every freed resource carries a prediction. A block that was never inserted
into the shared index — a partial block, a block released while caching was
disabled, one whose key was invalidated — has **no option value at all**: no
future lookup can ever hit it, so keeping it alive buys nothing.

The correct destination is counter-intuitive and the reasoning is worth
following, because the "safe" answer is wrong in both directions. It does not go
to the back of the queue: that is where entries with the *longest* remaining
life sit, and parking worthless pages there displaces cacheable ones toward
eviction. It goes to the **front**, ahead of everything cacheable — recycled
first, immediately, before anything with reuse value is touched. The two
disciplines are opposite by design: cacheable blocks are queued first-in
first-out so that the ranking survives, worthless blocks are recycled last-in
first-out so the most recently used memory is reused while it is still warm.

The invariant that keeps this readable is one line: *position in this queue is
predicted reuse value, and zero is a position too*. Mixing worthless pages into
the ordered region is what makes a reuse ranking silently part noise.

## Deriving the pool's own sizing from the same insight

The list's ordering is free; the pool's size is not, and it must be derived
rather than chosen ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
The usable derivation for a prefix cache is: total memory budget, minus what the
in-flight work itself requires, divided by the per-page cost — with the
per-element cost and the elements-per-page written beside it (see
[one-page-size-bought-with-padding](./one-page-size-bought-with-padding.md)). A
pool sized by feel is resized by feel, and the resize invalidates the waste
figure nobody recomputed.

## Decision rules

- Order the reclaim list at release. Do not build a scoring pass to recover
  information the releasing party already had.
- Make the release entry point take an ordered sequence and document the order
  as the eviction priority. One-at-a-time release discards the signal.
- In a prefix cache, push in reverse: deepest block to the head.
- Free children before parents wherever a lookup path stops at the first miss.
- Make the reclaim list intrusive so a hit on a queued entry is a constant-time
  removal.
- Give resources with no reuse value a position that cannot be mistaken for a
  ranking.
- State the ordering's premise where the loop lives. "Reverse" is meaningless to
  the next reader; "deepest first, because the deepest block hashes the most
  history and is least likely to be anyone's prefix" survives a refactor.

## What this technique does not own, and its nearest neighbour

This is a **release** policy. It does not decide what enters the cache. The
sibling concern — naming the bet under which an entry is admitted at all, and
checking that eviction's axis matches admission's — is a separate technique in
this corpus and the two answer different questions:

- *Admission*: should this thing be in the cache? Its failure is a store full of
  entries nobody reads twice.
- *Release ordering*: given that everything is in the cache and something must
  go, in what order? Its failure is evicting the block that half the fleet was
  about to share.

A prefix cache has an almost trivial admission answer — completed blocks are
admitted, always, because the work and the page already exist — which is exactly
why its design effort belongs here. Do not read the presence of one as
satisfying the other; a system with a well-argued admission bet and an inherited
recency eviction has left the larger of the two savings on the table.

## When not to use this

- **The releasing party genuinely knows nothing.** If freed resources are
  interchangeable and no structural property predicts reuse, ordering at release
  is theatre. Fall back to recency, and say so.
- **Reuse probability is not monotone in the available structural signal.**
  Where a workload has a long shared *suffix* — a common trailer appended to
  every input — the deep blocks are the shared ones and reverse order is exactly
  backwards. Check the direction of the monotonicity against real traffic before
  inheriting the rule.
- **Pinned or priority-tiered entries.** A cache with explicitly pinned prefixes
  needs an admission-side mechanism to hold them, not a release ordering; a
  pinned block that is never released never reaches this code.
