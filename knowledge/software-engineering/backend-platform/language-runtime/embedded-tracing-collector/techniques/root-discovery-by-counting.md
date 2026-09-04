---
layer: technique
type: technique
subject: embedded-tracing-collector
technique: root-discovery-by-counting
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value, derivation-names-recomputation]
shared_with: []
use_when: [a tracing collector must find roots in a host that will never register them, choosing between root registration and root inference for an embedded engine, sizing the reference counters in a heap cell's header]
---

# Root discovery by counting

A tracing collector starts from its roots, and an embedded engine does not
know where they are. Handles to guest objects sit in the host's structs, on
the host's stack, inside closures the host queued for later, in fields of
native objects the host handed to the guest. A registry of roots asks every
one of those sites to announce itself, and a site that forgets is not an error
anyone sees: it is a cell that reads as garbage at the next collection and a
crash at the next use. The technique replaces the announcement with an
inference the collector makes on its own, from two numbers in every cell.

## Two counts, and the difference between them

Each heap cell's header carries a **total** count and an **internal** count.

The total is the number of handles to the cell alive anywhere. The handle type
maintains it exactly as a reference count is maintained: cloning a handle
increments, dropping one decrements. It is always current, because the handle
is the only way to hold the cell.

The internal count is the number of those handles held *by other heap cells*.
The collector computes it in a pass before marking: it walks every cell in the
heap, asks each to visit the handles it contains, and increments the internal
count of each visited cell. After the pass, a cell is a **root exactly when
its internal count is less than its total** - some handle to it lives
somewhere the heap walk did not reach, and everything the heap walk does not
reach is, by definition, the host.

The inference has a property a registry lacks: it is recomputed every cycle
from the heap as it actually is, with the recomputation written into the
collector rather than remembered by the host
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
A handle that moved from a guest object into a host struct is a root at the
next collection with nobody doing anything. A registry would still list it
where it was, or not at all.

The other property is that the guard cannot be absent. A registry is an
optional guard: it protects the sites that registered. Counting protects every
site that holds a handle, because holding the handle *is* the registration
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
failure mode moves from "a site forgot" - silent, distant - to "a site holds a
raw pointer instead of a handle", which is a type-level choice that is visible
where it is made and is spelled unsafe.

## The two arithmetic rules that keep the inference safe

The inference is a comparison between two integers, and both can be wrong in
the direction that matters if the arithmetic is careless. The safe direction
is fixed: **a live cell must never read as unrooted.** A dead cell that reads
as rooted is a leak until the next cycle; a live cell that reads as unrooted is
a use-after-free. So the two counts are governed by two different rules.

**The internal count saturates at the total.** The pre-pass increments the
internal count once per internal reference it finds, and it stops
incrementing the moment the internal count reaches the total. The ceiling is
not the counter's width; it is the other counter. An internal count that
exceeded the total would be a contradiction - more references from inside the
heap than references in existence - and it is reachable only through
corrupted state, but a counter that *could* exceed the total, and then wrap,
would make the most-referenced cell in the heap read as having no internal
references and every handle to it look like a host root. Saturating at the
total keeps the comparison meaningful at every value: a saturated cell reads
as unrooted, which is exactly what a cell whose every reference is internal
should read as. A debug assertion beside the saturation catches the
contradiction when unsafe code writes the field directly.

**The total count refuses to overflow.** The total is maintained by the handle
type, incrementally, and a wrap here is the dangerous direction: a cell with
one more handle than the counter holds reads as having none, and the
comparison says it is unrooted. There is no safe value to substitute, so the
operation that would overflow *fails*, loudly, at the clone that caused it. A
counter that must not wrap and cannot saturate has exactly one honest
behaviour at its ceiling, and it is not a number
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Size
the counter so the failure is theoretical - a cell with more handles than a
wide integer holds has already exhausted memory - and keep the check anyway,
because the cost is a compare per clone and the alternative is silent
corruption.

The ceiling on the total is set by the *internal* counter's width, not its
own, and the reason is a packing decision: the mark bit lives in the same
word as the internal count, so the internal count has one bit fewer. A total
that exceeded the internal count's maximum could never be matched by
saturation, the cell would read as rooted forever, and the failure would be a
leak rather than a crash. The check on the total therefore fails at the
internal counter's maximum, one bit below its own - the derivation is the
packing, and it is written beside the constant.

The internal counts are reset during the sweep, on every cell that survived,
so the next cycle's pass starts clean. Cells being swept are freed and carry
no count into the future.

## The cost, and what it buys

The pass is a full heap walk that runs before the mark, so every collection
touches every cell twice before it sweeps. That is the price, and it is paid
in exchange for the host doing nothing. The alternatives that avoid the walk
all move the cost to the host: a registered root set (the host must register),
a shadow stack (the host must push and pop around every handle it holds),
conservative stack scanning (the host's stack must be scannable, which
excludes handles in heap-allocated host structures and in other threads'
frames). For an engine whose host is not the engine's author, the walk is the
cheapest of these, because the others are not cheaper - they are just billed
to somebody else, and that somebody will not pay.

There is a fourth alternative that looks like it avoids both the walk and the
host's cooperation, and it is the one a collector of this shape usually ships
first: **rooting tracked at runtime**, where each handle carries a rooted bit
and every move of a handle into or out of a heap cell flips it. It is a
registry in disguise. The flip is a discipline on every container type and
every manual trace implementation, it costs a branch on every store, and a
missed flip is the same silent dangling pointer as a missed registration.
Moving the question from "is this handle rooted right now" (answered at every
store, by everyone) to "how many references live outside the heap" (answered
at collection, by the collector) is the whole technique, and a collector that
has made that move should not keep the rooted bit around for old times' sake.

The cost also bounds the design: the walk is linear in the heap, so the
threshold policy is what keeps collections rare enough that the walk is not
the engine's dominant cost. A collector that counts roots and collects every
few kilobytes of allocation has chosen two things that do not go together.

## Decision rules

- Keep a total count in the handle and an internal count in the header; never
  keep a root registry beside them.
- Compute the internal count in a pre-pass over the whole heap, every cycle;
  never carry it across cycles.
- Treat a cell as a root iff internal < total; never invert the comparison
  into "root iff a registry says so".
- Saturate the internal count at the total; fail the operation that would
  push the total past the internal counter's maximum.
- Keep the mark bit and the internal count in one word if it saves a word
  per cell, and derive the total's ceiling from the packing.
- Reset internal counts on every surviving cell during the sweep.
- Do not track rootedness at runtime alongside the count; one mechanism, at
  collection time.
- Make any way of holding a cell without a handle a spelled-unsafe operation,
  because it is the only way to defeat the inference.

## When not to use it

A runtime that owns its threads and its stack can scan the stack and walk a
registry, and does not need the pre-pass. A host that is the engine's own
author, holds handles in a handful of well-known places and will keep a
registry correct by review can register them and skip the walk. Counting earns
its cost when the host is a stranger: many authors, handles in arbitrary
native structures, no discipline the collector can enforce.
