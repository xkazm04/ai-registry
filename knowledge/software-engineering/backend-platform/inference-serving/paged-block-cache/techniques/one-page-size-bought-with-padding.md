---
layer: technique
type: technique
subject: paged-block-cache
technique: one-page-size-bought-with-padding
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [one pool must serve consumers with different per-unit memory costs, deciding between one allocator and one per class, choosing a page size, a pool-per-class design is starving one pool while another sits idle]
---

# One page size, bought with padding

A block pool has one page size. That is not a limitation to work around; it is
the property that makes a single free list, a single reclaim ordering and a
single eviction policy possible. The moment there are two page sizes there are
two of everything else, and the interaction between them is owned by nobody.

The tension appears when the consumers are heterogeneous — when different
classes of derived state cost different amounts of memory *per element*. A page
of fixed byte size then holds a different number of elements for each class, so
block boundaries stop lining up across classes. Boundaries must line up: block
identity is defined over element ranges, and a chain whose links disagree about
where they end is not a chain.

## The fork, stated honestly

**Option A — a pool per class.** Each class gets its natural occupancy and
wastes nothing. It buys: N free lists, N reclaim orderings, N eviction
decisions, and a starvation mode with no arbiter — a request stalls for want of
a page in one pool while another pool is half empty, and nothing in the system
is permitted to move capacity between them. Add a class and you add a pool and
a new pairwise interaction. This is the option that looks efficient in a
capacity spreadsheet and costs the most in operations.

**Option B — one pool, one page size, elements-per-block taken from the most
expensive class.** Cheap classes fill part of their page and pad the rest. It
buys: one allocator, one free list, one policy, one number to tune, and the
ability for any class to consume any free page. It costs real, permanent,
measurable memory.

Take B, and **publish the bill**. The discipline that makes B defensible is not
that the waste is small — sometimes it is not — but that it is derived,
measured, and stated, so the day it stops being acceptable is a day somebody can
name rather than a slow degradation nobody attributes.

## Two axes of mismatch, and a different remedy on each

Heterogeneity arrives in two independent ways, and conflating them is why the
unification looks impossible on first inspection.

**Axis one: the classes have different *counts* of sub-units.** Each class
contributes some number of per-element slices to a page, and those counts do not
divide evenly. Splitting into one group per class in the exact ratio is the
"efficient" answer and it is wrong at scale: an awkward ratio explodes into many
tiny groups, and a group is not free — it carries its own allocation
bookkeeping. The workable rule is to **group by the smallest count across
classes** and pad the remainder group with empty slots. Fewer, larger groups;
one bounded remainder; a padding bill that is computable in advance.

**Axis two: the classes have different *per-element costs*.** Here the knob is
not the group but the block. Raise the cheap class's `elements_per_block` until
its page reaches the expensive class's per-element footprint, then pad the
expensive class up to that page. This works and it has a hard ceiling, which is
the most useful thing to know about it: the granularity cost is real, and past
a few hundred elements per block the cache is quantizing reuse so coarsely that
ordinary shared prefixes stop landing on a boundary. **The unification knob and
the reuse-granularity knob are the same constant.** When the cost ratio pushes
the block size past what reuse tolerates, the answer is not a larger block; it
is a different grouping, or a second pool.

## Deriving the page size

The number is derived, never chosen ([limits-are-derived](../../../../_laws.md#limits-are-derived)),
and the derivation is written beside it:

```
elements_per_block  = chosen granularity     (the reuse/bookkeeping trade)
group_size          = min over classes of sub_unit_count
page_bytes          = elements_per_block × group_size × max per_element_bytes
padding_fraction(c) = 1 − (what class c actually occupies) / page_bytes
```

Two of those lines are the ones that get skipped. `elements_per_block` is a
genuine trade — smaller blocks find more partial overlaps and cost more index
entries and more hashing per unit of work; larger blocks are cheaper to manage
and quantize reuse more coarsely, so a shared prefix that ends mid-block yields
nothing. Pick it from the measured overlap distribution of real inputs, not from
a round number — and note that axis two above can *override* your choice, which
is a coupling to state explicitly rather than discover.

And `padding_fraction` is the bill. Weight it by each class's share of the pool
to get the pool-wide waste. That figure carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): "8%
waste" is not a finding — "8% of pool bytes, measured over the deployed class
mix at the current page size" is, because the same design wastes a different
amount the moment the mix or the page size changes.

## When the unification stops being worth it

State the threshold in advance, so the answer is not improvised under pressure:

- **The cost ratio.** Waste grows with the ratio of the most expensive class's
  per-element cost to the cheapest's. At small ratios the padding is noise; as
  the ratio grows the cheap class is paying most of its footprint for alignment.
- **The mix.** A rare expensive class dragging the page size up for a common
  cheap one is the worst case: almost all of the pool pays the padding and
  almost none of it benefits. If the expensive class is a small fraction of
  traffic, revisit.
- **Whether the classes can be grouped instead.** Between A and B there is a
  middle: group classes with *similar* per-element cost, take the smallest count
  within each group, and accept a small number of pools rather than one per
  class. This keeps the arbiter problem small and cuts the worst padding.

Choose B by default, publish the number, and name the ratio at which you would
revisit. A design that admits its own waste and asks to be told when it becomes
unacceptable is stronger than one that hides it — and asking is not a formality:
the failure mode is not the waste, it is that nobody outside the team can tell
whether their workload is the pathological one. The strongest form of this,
observed in the field, is a grouping heuristic shipped with the sentence *this
is not perfect; report cases where the padding overhead becomes unacceptable* —
and with the class shape that would falsify it named as a worked example. That
converts an unknown from a latent regression into an inbound report, and it is
the only mechanism that scales when new consumer classes arrive faster than the
team can characterize them.

## Decision rules

- One pool, one page size, unless a measured padding figure says otherwise.
- Derive the page size from the *maximum* per-element cost across classes and
  the chosen granularity; write the formula beside the constant.
- Recompute the waste when the class mix changes, the page size changes, or a
  class is added — a formula in a comment beside a constant that no longer
  tracks its inputs is the failure in its most convincing disguise.
- Report padding waste as a metric, not as a design note. It is the only
  early warning that the unification has stopped paying.
- If a per-class pool is unavoidable, define the arbiter that rebalances them
  *in the same change*. A second pool without a rebalancing rule is a starvation
  mode with a schedule nobody has read.

## When not to use this

- **A single consumer class.** There is nothing to unify; the page size is just
  the granularity trade and this technique collapses to that one line.
- **Classes whose per-element costs differ by an order of magnitude or more.**
  Padding to the largest is no longer a rounding error; group them or split the
  pool, and pay the arbiter cost deliberately.
- **Elastic backing memory.** The unification's payoff is a fixed pool with
  contention. Where capacity can be added per class on demand, the starvation
  argument that motivates B weakens considerably.
