---
layer: technique
type: technique
subject: embedded-tracing-collector
technique: derived-trace-with-escape-hatches
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [adding a heap-allocated type to an engine with a tracing collector, a heap type needs cleanup code and the author reaches for a destructor, reviewing a hand-written trace implementation]
---

# Derived trace with escape hatches

Every cell in a traced heap must answer one question on demand: which handles
do you contain? The collector asks it three times per cycle - to count
internal references, to mark, and to run finalizers - and an answer that omits
one field is not a bug the tests find. It is a cell that survives the count,
reads as unrooted, is swept, and is dereferenced later through the handle the
answer forgot. The technique is to stop asking authors the question at all:
the answer is derived from the type definition, and the only way to deviate
from it is through a small closed set of named escape hatches, each of which
puts the burden of proof on the author who used it.

## The derive is the single authority for a type's edges

**The trace implementation is generated from the type's fields, not written
beside them.** A type declares its fields once; the generated trace visits
every one of them, delegating to each field's own trace. The set of edges the
collector sees and the set of fields the type holds are the same set by
construction, because they are the same declaration
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A hand-maintained trace is a second copy of the field list, and the two drift
exactly when someone adds a field and finds only one of them.

The generated protocol has more than one method, and the derive must generate
all of them from the same field list. The mark pass visits every handle. The
counting pass visits every handle and increments its internal count. The
finalizer pass runs the type's finalizer and then each field's. When the
protocol grows a method, the derive grows with it; a manual implementation
that predates the method is silently incomplete, which is the second reason
manual implementations are spelled unsafe.

## The escape hatches, and what each one asserts

Four deviations are legitimate, and each is a distinct assertion the author
is making to the collector. The naming convention carries the trust model:
a hatch the compiler can check is spelled plainly, and a hatch that rests on
the author's word is spelled `unsafe`, so that a reviewer grepping for the
word finds every place the derive stopped being the authority.

**Plain data, checked.** A type that holds no handles at all - a number, a
flag, a small value struct - has an empty trace, and the derive should not
have to enumerate fields to discover it. The checked marker generates the
empty implementation *and adds a bound the compiler enforces*: the type must
be copyable. A handle is never copyable - copying one would skip the count -
so a copyable type provably contains none, and the assertion "this type can
never contain a handle" is proved by the type system rather than by the
author. This is the hatch to reach for first, and it is safe by construction.

**Plain data, asserted.** A type that holds no handles but is not copyable -
it owns a buffer, a string, a native resource - cannot carry the bound, so
the same empty implementation is generated under an `unsafe`-spelled marker.
The assertion is the same; only the prover has changed, from the compiler to
the author, and the spelling says so.

**Untraced field.** A field that holds handles the collector must *not* follow.
The legitimate cases are narrow: a back-reference the type keeps alive by
other means, a cache that must not root what it caches, a field that is a
weak structure with its own protocol. The marker asserts *following this field
is wrong, and I know why*, and it is spelled unsafe. It is the hatch that
dangles when misused, so the rule is: an untraced field carries a comment
naming the reason, and a review that finds one without a reason treats it as
a defect.

**Manual trace.** A type whose edges the derive cannot see - the handle type
itself, whose "field" is a raw pointer to a cell; an erased cell viewed
through a header; a container generic over a traceable element - implements
the protocol by hand, through a macro that takes one body and generates all
three methods from it, so that even the manual path cannot implement the mark
and forget the count. The body is written inside an `unsafe` block, because
the collector's soundness now rests on a human keeping the type's real edges
and its stated edges aligned, and the compiler cannot see both.

There is a fifth marker that is not a trace hatch but a destructor one, and
it is covered below.

The hatches are a closed set. When an author wants another - "trace this
field only sometimes", "trace through this integer that is secretly a
pointer" - the answer is a new heap type with a derivable shape, not a new
hatch, because every hatch is a place the derive stops being the authority.

## The derive replaces the destructor with a finalizer

A heap type in a language with destructors has a second, subtler problem: the
destructor runs when the last handle to the type drops, and in a traced heap
that moment is the sweep. A destructor that touches another cell - releases a
resource it shares, removes itself from a registry held by a neighbour,
notifies an owner - dereferences a handle during the sweep, and its target may
already be gone.

So **the derive forbids a destructor on a traced type and generates one of its
own, which runs the finalizer only when the collector is not sweeping.** The
type's cleanup code moves to a *finalizer*, a method the collector calls in
its own finalization pass, on every unreachable cell, while the whole heap is
still intact. The generated destructor consults a thread-local flag the
collector raises for the duration of a sweep. Outside a sweep - the type was
held by value on a native stack, or inside a host structure, and dropped in
the ordinary way - the destructor runs the finalizer, because that value was
never in the heap and the collector will never finalize it. Inside a sweep,
the destructor runs *nothing*: the finalizer already ran in the finalization
pass, and the cell's neighbours may already be freed. The polarity is easy to
get backwards, and getting it backwards either finalizes twice or never
finalizes a value that lived outside the heap.

The handle type follows the same rule for its own drop: a handle dropped
during a sweep does not decrement its target's count, because the target may
be gone. This is the one place a count is deliberately left stale, and it is
harmless only because the sweep is freeing both ends of the edge.

A type that must opt out of the generated destructor entirely - it needs a
hand-written one, and accepts the burden - does so through an `unsafe`-spelled
marker, so the reviewer sees the destructor and the trace side by side.

This is the moment at which the type names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): not "the
destructor, whenever the last handle drops", which in a traced heap is a
statement about a time nobody controls, but "the finalizer, in the collector's
finalization pass". The finalizer's contract is correspondingly narrow: it may
read its own fields and it may store a handle somewhere reachable (that is
resurrection, and the cycle accounts for it), but it may not assume any
*other* unmarked cell is still meaningful, because that cell's finalizer may
already have run.

## Decision rules

- Derive the trace for every heap type; never accept a hand-written trace on a
  type that has a derivable shape.
- Bind the checked plain-data marker to a property the compiler proves
  (copyability); spell the unchecked variant unsafe.
- Require a reason beside every untraced field, and review an untraced field
  without one as a defect.
- Generate all three protocol methods from one body on the manual path, and
  spell that path unsafe.
- Forbid a destructor on a traced type; generate one that runs the finalizer
  outside a sweep and nothing inside one; spell the opt-out unsafe.
- Leave a handle's target count untouched when the handle drops during a
  sweep.
- Keep the finalizer's contract narrow: own fields and reachable stores only;
  no assumption about other unmarked cells.

## When not to use it

A heap whose cells are all plain data - a bump allocator for tokens, a string
arena - has no edges to trace and no finalizers to run, and a derive is a
ceremony around an empty method. And a runtime whose heap types are few, fixed
and owned by one author can hand-write the protocol and keep it correct by
review; the derive earns its place when heap types are added by many hands,
including the host's, and the reviewer of the type is not the author of the
collector.
