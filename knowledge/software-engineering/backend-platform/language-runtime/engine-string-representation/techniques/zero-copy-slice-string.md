---
layer: technique
type: technique
subject: engine-string-representation
technique: zero-copy-slice-string
status: forged
laws: []
shared_with: []
use_when: [substring is a hot operation on immutable strings and each copy is an allocation, a slice may keep a large owner alive longer than the program expects, deciding between a sharing slice and a deferred-concatenation rope]
---

# Zero-copy slice string

A substring of an immutable string need not copy. The owner's units will never change,
so a view that holds the owner strongly, a start offset and a length reads exactly the
units a copy would have held, at the cost of one small allocation instead of one
proportional to the range. Guest programs slice constantly and the ranges are often a
large fraction of a large owner; the technique is the view, the rules that keep it a
view, and the honest account of what it retains.

## The view

A slice is a string kind like any other under the shared header: it has its own
reference count, its own length, and its owner's encoding flag, inherited without a
scan because a sub-range of narrow units is narrow and a sub-range of wide storage
stays wide. Its body is a strong handle to the owner plus the start offset. Reading its
units dispatches through the kind table to the owner's storage at the offset; length
is a header field and does not dispatch. Its release drops the owner handle, and the
owner is freed when the last slice and the last direct handle are gone.

A slice of a slice points at the root owner with a combined offset, never at the
intermediate slice. Chaining views builds a linked list that every unit read walks,
and retains every intermediate allocation; flattening the chain at construction costs
one addition and keeps every read one hop deep.

## Degenerate ranges do not allocate

A slice of zero length returns the static empty string, and a slice that covers the
entire owner returns the owner itself. Both are cheap to detect and both avoid an
allocation whose only content is a pointer to something else. The zero-length case is
also where a slice must not retain: an empty view that holds its owner keeps a possibly
large allocation alive for nothing, which is the retention cost in its purest form.

Below some small length a copy is cheaper than a view - the view is a header plus two
words, and a copy of a handful of units fits in the same space and does not retain the
owner. A runtime may set a threshold below which slicing copies; if it does, the
threshold is derived from the header size and stated beside it, not chosen by feel.

## Retention is the cost, and it is real

The one-character slice of a megabyte string keeps the megabyte alive until the slice
dies. In a short-lived computation that is nothing; in a long-lived structure - a map
keyed by tokens sliced from a large input, a cache of prefixes - it is the entire
input, retained many times over by name. The runtime cannot know which case a slice is
in. What it can do is state the rule for its consumers: when a slice is stored in
anything that outlives the computation that produced it, flatten it (copy the range
into a fresh owner) at that boundary, and treat a stored slice as a retention of its
owner rather than of its own length. A collector that reports string memory by handle
length will under-report retention by exactly this mechanism, and an engine that
exposes memory statistics should count the owner.

## When a rope beats a slice

A slice defers nothing; it is a cheaper way to take a range. A rope defers
concatenation: an append produces a node holding both operands, and the contiguous
units are materialised only when a consumer needs them - indexing, a foreign-interface
call, a hash. The two answer different workloads. A program that builds a long string by
appending in a loop is quadratic under a flat representation and linear under a rope;
a program that takes ranges of an existing string is served by the slice and gains
nothing from the rope. Ropes lose on short strings, where the node overhead and the
pointer chase cost more than copying a few bytes, and the common string is short.

The decision rule: when the hot operation is substring on existing text, use the slice;
when the hot operation is repeated append producing long text, add a rope kind above a
length threshold and flatten on the first contiguous read; when both matter, use both
under the same kind table, and slice a rope by flattening it first rather than by
holding a view into an unflattened tree. A runtime that must pick one picks the slice,
because short-string workloads dominate and a slice never has to be flattened.

## Decision rules

- When the owner is immutable, make a substring a view holding the owner strongly plus
  an offset and a length; inherit the encoding, never re-scan.
- Point a slice of a slice at the root owner with a combined offset; never chain views.
- Return the static empty for a zero-length range and the owner for a full range; if a
  small-range copy threshold exists, derive it from the header size.
- State the retention rule to consumers: flatten at any boundary that outlives the
  producing computation, and count the owner in memory statistics.
- Add a rope only for an append-heavy workload, above a length threshold, flattening
  on the first contiguous read; prefer the slice when one representation must serve.

## When not to use it

A mutable owner cannot be sliced by view, because the view would observe writes or
would have to copy-on-write, which is a different technique with a different cost. A
runtime whose slices are overwhelmingly short (a tokeniser that takes two- and
three-unit ranges) should copy below the threshold and may not need the view kind at
all. And a runtime that hands strings across a foreign interface expecting contiguous
storage must flatten at that boundary regardless; if every string crosses it, the view
saves nothing.
