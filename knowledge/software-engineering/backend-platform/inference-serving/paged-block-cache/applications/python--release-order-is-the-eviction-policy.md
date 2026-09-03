---
layer: application
type: application
subject: paged-block-cache
technique: release-order-is-the-eviction-policy
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# An intrusive free queue whose order is set by the caller of `free` (vLLM v1 KV cache manager)

Read at `vllm-project/vllm` @ `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. The
technique's claim — that the eviction order is decided at release, by the party
releasing, and that this is a tie-break inside a coarse recency policy rather
than a replacement for it — is stated almost verbatim in this tree's own class
docstring, which is the strongest form of confirmation available.

## The ordering contract lives in the queue's docstring

`FreeKVCacheBlockQueue` (`vllm/v1/core/kv_cache_utils.py:229-246`) documents a
two-level order:

> 1. The least recent used block is at the front (LRU).
> 2. If two blocks have the same last accessed time (allocated by the same
>    sequence), the one with more hash tokens (the tail of a block chain) is at
>    the front.
>
> Note that we maintain this order by reversing the block order when free blocks
> of a request. **This operation is outside of this class.**

That last sentence is the technique. The queue is a plain FIFO and knows
nothing about prefixes; the prediction is injected by whoever calls free, and
the pool's job is only to preserve the order it was handed.

## The reversal is one word

`SingleTypeKVCacheManager.free` (`vllm/v1/core/single_type_kv_cache_manager.py:533-541`)
is the whole implementation:

```python
# Free blocks in reverse order so that the tail blocks are freed first.
self.block_pool.free_blocks(reversed(self.pop_blocks_for_free(request_id)))
```

The partial-range variant reaches the same order differently and says why:
`free_block_range` iterates backwards (`:620-640`) so that "newly-evictable tail
blocks are reached even after earlier blocks in the range were nulled in a prior
call" — the reverse walk is load-bearing for correctness there, not only for
ranking.

## `free_blocks` takes an ordered sequence, and splits it two ways

`BlockPool.free_blocks` (`vllm/v1/core/block_pool.py:723-747`) declares the
contract the technique asks for — *"The blocks should be ordered by their
eviction priority, where the first block will be evicted first"* — and then
partitions on whether a block is cacheable at all:

- blocks with no hash, or with caching disabled, go to `blocks_to_evict_first`
  and are **prepended** to the queue front, commented "LIFO reuse of non-cached
  blocks for better GPU locality";
- cached blocks go to `blocks_to_evict_last` and are **appended** to the tail,
  commented "FIFO reuse of cached blocks for LRU eviction behavior".

This is the technique's "where a released block goes when it is not reusable"
rule realized with both directions present in eight lines, and it is what
corrected the draft of this subject: the intuition that worthless pages belong
at the *back* is exactly backwards, because the back is where the longest
remaining life is.

## Why the list is intrusive

`KVCacheBlock` carries `prev_free_block` / `next_free_block` inline
(`vllm/v1/core/kv_cache_utils.py:163-220`), and the queue's docstring gives both
reasons the technique claims: O(1) removal from the middle, and "this class does
not allocate any Python objects when manipulating the linked list" — a
`collections.deque` would wrap every queued block. `remove`
(`:351-363`) is the four-pointer splice this buys. Sentinel head and tail nodes
(`fake_free_list_head` / `fake_free_list_tail`) remove the empty-list and
end-of-list branches from every splice.

The whole pool is pre-allocated at manager construction rather than created on
demand (`docs/design/prefix_caching.md:129-136`), so "allocate a block" is a
`popleft_n` and never an object construction.

## A hit removes a block from the ranking entirely

`BlockPool.touch` (`vllm/v1/core/block_pool.py:702-717`) is called when a new
request's prefix matches a block that is sitting in the free queue: if
`ref_cnt == 0` the block is removed from the queue outright and then the count is
incremented. It is not moved to the tail. A block with a live user is not an
eviction candidate, so it leaves the ranking and re-enters only at its next
release, at the position that release chooses — which is why the queue never
needs a "touch" order at all.

The end-to-end trace in `docs/design/prefix_caching.md:236-240` shows both
mechanisms interacting: a free queue standing at `7-8-9-4-3-2-6-5-1-0` becomes
`7-8-9-4-3-6-5` when blocks 0, 1 and 2 are touched by an incoming request, and
allocation then proceeds from the front, evicting block 3.

## Deviation worth noting

The tree's `free_blocks` decrements `ref_cnt` for every block in the sequence
and enqueues only those reaching zero — so the caller's ordering survives
partially-shared releases correctly, but the ordering contract is documented on
the pool and the *reversal* is documented at each call site independently. There
is no single place asserting that every caller of `free_blocks` orders by
eviction priority, and a new caller that passes an unordered list produces no
error and no test failure — only a slightly worse hit rate. The technique's rule
that the premise be stated where the loop lives is met; an enforcing check is
not present.
