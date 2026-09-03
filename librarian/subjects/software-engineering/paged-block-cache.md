---
subject: paged-block-cache
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# paged-block-cache

First touch: [[2026-09-03-vllm]]. NEW subject, 5 techniques, 3 applications.

## What the gap actually was

Three files in the entire corpus mentioned this class of cache before today, all in
`prompt-assembly`, all client-side. Nothing modelled a cache whose unit is a fixed-size
block of a SEQUENCE, where a block's identity depends on everything before it.

The load-bearing correction of the run happened here, and it was a worker correcting the
DIRECTOR. The design record said "blocks are pushed in reverse so the last block evicts
first". Too coarse: allocation drains the front and release appends the tail, so the queue
is already coarse recency, and reverse order is the tie-break WITHIN one release where
recency cannot discriminate. Two things the record missed entirely - non-cacheable blocks
are PREPENDED (the intuitive answer is inverted; the back of the queue holds the longest
remaining life), and the release call TAKES an ordered sequence whose order IS the
eviction priority. The policy is a parameter of the release call, not a convention around it.

## Still open

`salt-as-a-cache-partition` was carried to the fleet and found no home: the one candidate
tree keys its cache on every request header, so nothing is shared across a trust boundary
and the decision's forces are absent. The technique is unapplied and honestly so. Return
when a project deliberately shares a cache between callers who are not the same principal.
