---
layer: technique
type: technique
subject: index-free-random-access
technique: sorted-data-as-a-read-only-index
status: forged
laws: [silent-state-is-ungoverned, limits-are-derived]
shared_with: []
use_when: [looking up a record by a key the artifact is already ordered on, deciding whether a lookup justifies building an index, a search structure that must be rebuilt every time the data changes, bisecting a stream that can only be positioned approximately]
---

# Sorted data as a read-only index

An artifact already sorted on the key you are searching **is** a search index.
It needs no auxiliary structure, no build step, no invalidation, and nothing to
ship alongside it. What it needs is a bisection that tolerates the one
limitation of index-free addressing: you can jump *near* a record, never *onto*
one.

That is the whole technique, and the reason it is not obvious is that
textbook bisection assumes exact addressing — it computes the middle element,
not the middle byte. Here the midpoint of a byte range lands inside some
arbitrary record, and the boundary-recovery step returns the start of the
*next* one, which is a different and unpredictable distance away each time.

## Maintain the invariant against the approximation

A bisection is correct because of an invariant: the target, if present, lies
within the current range. Approximate positioning does not weaken that
invariant, but it does change what may be assigned to the range bounds, and
this is where implementations go wrong.

The rule is: **narrow the range using the position you actually resolved, not
the position you asked for.** Having probed byte *m* and recovered a record
beginning at *r ≥ m*, compare that record's key and then:

- if the target is greater, the new lower bound is the offset *after* that
  record — not *m*, and not *r*;
- if the target is smaller or equal, the new upper bound is *r* — the recovered
  boundary, not *m*, because the interval between *m* and *r* has now been
  examined and excluded.

Assigning a bound the probe offset rather than the resolved offset is the
defect that produces a loop which neither terminates nor errors: the range
stops shrinking once it is smaller than a typical record, because every probe
inside it resolves to the same boundary and re-derives the same bound.

## Terminate on a bounded linear finish

The corollary of the above is that **the range cannot be narrowed below the
size of one record**, so a bisection that runs until the range is empty will
not terminate. Two things follow, and both are non-optional:

- Stop bisecting when the range falls under a threshold and finish with a
  linear scan of what remains. The threshold is derived, not chosen: it is a
  small multiple of the sampled maximum record size, from the same head sample
  every other constant here comes from
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
- The recovery step may **refuse** near the end of the stream, where there is
  not enough remaining data to decide. A bisection must treat a refusal as a
  signal to fall back to the linear finish, never as "not found" — the two are
  indistinguishable to the caller and only one of them is true.

The linear finish is not a wart. It is what makes the whole thing
logarithmic-plus-a-constant rather than incorrect, and it is also where an
implementation naturally handles duplicate keys: to enumerate every record
matching a key, bisect to the first one and then scan forward while the key
holds.

## Sortedness is a precondition nobody enforces

This is the trade, and it is the half most adoptions understate. The technique
does not remove the cost of an index; it **moves that cost to write time** and
converts it into an ordering obligation on every producer.

The obligation is unusual in that violating it is silent. A bisection over
data that is not sorted does not fail — it returns *a* record, confidently and
fast, and it is wrong. There is no structural check the search can perform
that is cheaper than the linear scan it is replacing, so the search cannot
defend itself. That makes sortedness
[silent state that is ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
unless something else governs it, and the something else has to be one of:

- a **producer** that is the only writer and sorts by construction;
- a **gate** that verifies order once, when the artifact is produced or
  published, and refuses to publish otherwise — cheap, because the producer
  is already streaming the records past in order;
- a **stamp** on the artifact recording which key it is ordered by, so a
  reader bisecting on the wrong key discovers it rather than getting a
  plausible answer. An artifact sorted on one key and searched on another is
  the failure this stamp exists for, and it is common wherever an artifact
  has more than one plausible key.

An implementation offering bisection without one of those three is offering a
fast wrong answer to anyone who has not read its documentation.

## When to build the index anyway

The technique loses, and should be dropped, when:

- **the search key is not the sort key**, and re-sorting a large artifact per
  query is obviously worse than one build;
- **more than one key is searched**, since an artifact has one order and an
  index can have many;
- **the artifact is mutated in place**, because maintaining sortedness under
  arbitrary insertion is what a real index structure is *for*, and emulating
  it with a rewrite is quadratic;
- **the lookups are frequent enough that the per-lookup probe count matters**
  — bisection over approximate positions makes several reads that a built
  index resolves in one or two.

Its territory is the common opposite of all four: a large, immutable,
already-ordered artifact, read occasionally, on one key. That case is frequent
enough to be worth naming, and it is routinely served by building and shipping
an index nobody needed.

## Decision rules

1. Narrow bounds using the *resolved* boundary, never the probe offset.
2. Stop bisecting at a threshold derived from the sampled record size and
   finish linearly; a range cannot shrink below one record.
3. Treat a refusal from the recovery step as "fall back to linear", never as
   "not found".
4. Enumerate duplicates by bisecting to the first match and scanning forward.
5. Govern sortedness explicitly — single writer, publish gate, or a stamp
   naming the ordering key — because a violation is silent and fast.
6. Build a real index when the search key is not the sort key, when there is
   more than one, or when the artifact is mutable.
