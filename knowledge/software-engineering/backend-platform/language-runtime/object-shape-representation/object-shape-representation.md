---
layer: golden-path
type: golden-path
subject: object-shape-representation
status: forged
use_when: [designing how a dynamic-language engine lays out objects so that property access does not hash on every read, deciding when a shared layout descriptor must give way to a per-object dictionary, adding an inline cache to a property-access instruction and deciding what it may key on, choosing a storage representation for indexed elements that widens without ever narrowing]
techniques:
  - transition-tree-with-shared-table
  - weak-forward-transitions-with-counted-prune
  - dictionary-mode-fallback
  - polymorphic-inline-cache-with-weak-shapes
  - monotonic-typed-element-storage
---

# Object shape representation

A dynamic language lets a program add, delete and redefine properties on any
object at any time, and a specification written in that language's terms
describes every object as a map from keys to attribute records. An engine that
implements the specification literally - one hash table per object - is
correct and slow in the one operation programs perform most, because every
read hashes a key, probes a table and copies an attribute record, and nothing
learned on the last read survives to the next. This subject owns the
representation that makes the literal reading unnecessary without making it
false: objects carry a **shape**, a shared, immutable layout descriptor that
says which keys live at which slots with which attributes, and the engine
arranges that objects built the same way carry the *same* shape, so that
"is this the object I saw last time" becomes a pointer compare and "where is
the property" becomes an index the compare already validated.

The subject begins when an object is created and ends at the slot where its
property's value lives. It owns the shape and the tree that mints shapes, the
storage those shapes index into, the fallback for objects that outgrow
sharing, the cache a bytecode instruction keeps about the shapes it has seen,
and the separate representation of indexed elements. It does not own the
collector that decides when a shape dies, the compiler that decides which
instructions get a cache, or the limits an engine enforces on the guest; those
are the siblings' concerns and this document names the seam to each where it
arises.

## Where this stops, and the neighbours start

The word *cache* is the one likely to draw a reader to the wrong document.
[Client-fetch-cache](../../../client-architecture/client-fetch-cache/client-fetch-cache.md)
owns a cache that stands between a surface and an authority it fetched from:
what admits an entry, how long it is believable, who evicts it, and how two
callers asking for the same key share one flight. Nothing in that subject
shares *layout*, and nothing in this one admits or ages a fetched value. The
discriminating question is what a hit saves: a round trip to an authority is
that neighbour's; a hash probe into a table the engine already holds in
memory is this one's. The inline cache here has no admission policy and no
staleness clock - it is invalidated by identity, never by time.

The sibling [guest-execution-bounding](../guest-execution-bounding/guest-execution-bounding.md) owns every ceiling the engine enforces
on the guest - recursion depth, stack slots, loop iterations - and the rule
that a breached ceiling is a failure the guest cannot catch. The constants in
this subject look like limits and are not: the transition count at which a
shape leaves the tree, the size at which a cache turns megamorphic, the
counter on which weak edges are pruned are **representation choices** that
change how fast a program runs, never whether it runs. A guest that adds ten
thousand properties to one object does not fail; it gets a dictionary. When a
number here starts to decide whether a program completes, it has become that
sibling's concern and should move there.

## Layout is a value objects share, not a property objects own

The load-bearing decision is that a shape is a shared, immutable value with an
identity, and an object holds a pointer to one rather than a description of
its own. Two consequences follow and everything else in the subject serves
them. First, two objects that went through the same sequence of property
additions hold the same shape pointer, so the engine can learn something about
one and apply it to the other without re-deriving it. Second, an object's
layout never changes in place - a property addition moves the object to a
*different* shape - so anything that recorded a shape pointer recorded a fact
that stays true for as long as the pointer compares equal.

Shapes are minted by a **transition tree** rooted at an empty shape. Each edge
is a property key with its attribute flags; a child shape is the parent plus
that one property at the next slot. Adding a property to an object walks one
edge, and walks it *without allocating* when the edge already exists, because
an earlier object took it first. The tree is the engine's memory of how
programs build objects, and its shape is the program's: a constructor that
assigns five fields in one order produces one path of five shapes that every
instance of it shares. [Transition-tree-with-shared-table](./techniques/transition-tree-with-shared-table.md)
owns the tree, the rule for when an edge is reused, and the property table
that sibling shapes share until one of them inserts something the others did
not - the point at which the table forks so that a lookup bounded by a shape's
own property count still reads only that shape's entries.

The attributes on the edge are part of the key. Two objects that add the same
name, one writable and one read-only, have different layouts in every sense
that matters to a cache, because a store that the cached slot would accept is
one the specification forbids. Keying an edge on the name alone is the most
common way a young engine ships a cache that lies.

## A tree that remembers everything remembers garbage

A transition tree that holds strong forward edges is a leak with a good
excuse: every shape a program ever produced stays reachable from the root for
the life of the engine, including the thousands a test harness minted once and
the object-literal shapes of a request handler that finished an hour ago.
Forward edges - parent to child - are therefore **weak**, so that a shape no
object holds is collected like anything else, and back edges - child to
parent - are strong, so that a live shape's ancestry stays intact for the
rollback that deletion needs.

A weak edge that has died still occupies its slot in the parent's transition
table until something removes it, and removing it on every insertion turns
the hot path into a sweep. The rule is that pruning runs on a **counter**,
not on the operation: a small wrapping counter on each parent advances per
insertion, and the dead edges are swept when it wraps and on any lookup that
misses the shape it was hoping to upgrade to.
[Weak-forward-transitions-with-counted-prune](./techniques/weak-forward-transitions-with-counted-prune.md)
owns the edge polarity and the prune cadence; the constants that follow from
an eight-bit counter are stated there and the reasoning is that the counter
width is the derivation, not the number.

## Sharing has a depth past which it stops paying

An object used as a map - keys added in data-dependent order, deleted,
re-added - takes a path nobody else will take, and every shape on it is
minted for one object and shared with none. Past some depth the tree is a
per-object linked list with worse constants than a hash table, and the
honest answer is the hash table the literal reading started with: a
**unique shape**, owned by one object, whose table is mutated in place.

[Dictionary-mode-fallback](./techniques/dictionary-mode-fallback.md) owns the
conversion, its trigger and what changes on the far side. The trigger is a
transition count from the root, which the tree makes cheap to know, because
every shape carries its own, and it is checked after every transition kind,
so the replay a deletion performs is bounded by the same number that bounds
the path. Unique mode is also the right *start* for an object the host builds
once through the public constructor, because a layout only one object will
ever carry gains nothing from a tree; the shared-shape entrance belongs to
the engine's own literal and constructor paths, where layouts recur. What
changes on conversion is the identity rule: a shared
shape never mutates, so its identity is stable by construction; a unique
shape mutates on insertion, and the engine must decide which mutations keep
the identity and which mint a new one. The answer follows from what the
caches key on. Insertion appends a slot and invalidates no cached (shape, slot)
pair, so it keeps the identity. Deletion, a change to an existing property's
width or attributes, and a change of prototype each make some cached pair
wrong, so each mints a fresh identity that no cache has seen
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse) -
identity is minted when the thing it names changes, never reused across a
meaning change).

## The site remembers, the object does not

Shapes make sharing possible; they do not by themselves make access fast. The
second half is a cache at the **access site** - the bytecode instruction that
reads or writes one named property - holding the shapes it has seen and the
slot each resolved to. On the next execution the instruction compares the
receiver's shape pointer to its cached entries, and on a match reads the slot
without touching the property table at all. A site that has seen one shape is
monomorphic and costs one compare; one that has seen a few is polymorphic and
costs a short scan; one that has seen more than the cache holds is
megamorphic and falls back to the lookup for good, because a cache that
thrashes is slower than no cache.

[Polymorphic-inline-cache-with-weak-shapes](./techniques/polymorphic-inline-cache-with-weak-shapes.md)
owns the cache, and three of its rules are the ones engines get wrong. The
cache holds its shapes **weakly**, because a strong reference from a code
block to every shape it ever saw is the leak the weak transitions were built
to avoid, reintroduced one instruction at a time; a dead entry simply never
matches again. The cache compares shapes **by address**, never by structural
equality, because the whole point of a shared shape is that address equality
*is* structural equality and anything more expensive would give the saving
back. And the decision whether an access is cacheable at all is made **during
the lookup that fills the cache**, not before it: a property found on the
receiver is cacheable; one found on the immediate prototype is cacheable with
a second shape to check - the prototype's own, because the receiver's shape
fixes which object the prototype is and says nothing about that object's
slots; one found deeper is not, because the chain of identities to validate
grows past the entry; a store whose holder is not the receiver is not,
because the write lands on the receiver; and one that passed through an
object whose lookup is intercepted by guest code is never cacheable, because
no shape describes what such an object will answer next time.

The cache is a derived value and the lookup is its recomputation, which is
what lets it be dropped at any time: an engine that could not fall back to the
lookup at any site would have a cache with no arbiter
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).

## Indexed elements are a different problem with a different answer

Integer-keyed properties are the specification's ordinary properties and a
program's arrays, and the two readings pull in opposite directions. The
specification allows a hole, a getter at index three and a non-writable index
seven; programs overwhelmingly build dense vectors of one scalar kind. An
engine that represents every array as a map of descriptors pays a boxed
value and an attribute record per element for the common case; one that
represents every array as a dense vector cannot represent the specification.

The resolution is a **ladder of storage kinds**, entered at the narrowest rung
and climbed on the first element that does not fit the current one: dense
small integers, then dense floats, then dense boxed values, then a sparse map
of values, then a sparse map of full descriptors. Each rung represents
everything the rung below it can, so a widening is a copy that loses nothing;
no rung narrows, because narrowing would require proving that every element
fits again and the proof costs more than the width it would save. The one
subtlety is the boundary between the first two rungs: a float that
round-trips exactly through the integer type is stored as an integer, so a
program that writes whole-number floats does not widen a vector it will read
as integers. [Monotonic-typed-element-storage](./techniques/monotonic-typed-element-storage.md)
owns the ladder, the widening triggers, and the rule that the current rung is
observable from the guest so the engine's tests can be written in the
language it implements rather than against its internals.

Elements share nothing with shapes: the element storage is a separate field
with its own kind tag, and a widening moves no object to a new shape. Fusing
the two means every array that grows a float invalidates every cache on every
named property along its shape path.

## What the naive reading gets wrong

The naive engine reads "hidden classes" as a fixed layout inferred at
construction and is then surprised by the first delete. The shape is not a
class; it is a position in a history of additions, and deletion is a rollback
along the strong back edges followed by a replay of the transitions after the
deleted one, condensed so that the replayed chain is no longer than the
original, and bounded by the same cap that bounds the path. An engine with no
rollback and no cap has a tree that only grows and a delete that cannot be
expressed.

The second naive reading treats every constant here as a tuning knob and
raises it when a benchmark asks. Each constant is derived from something - a
counter width, a cache line, the point at which a linear scan loses to a
probe - and a constant raised without its derivation is one whose
consequences nobody can predict
([limits-are-derived](../../../_laws.md#limits-are-derived)). The engine
that ships a transition cap of one thousand and a megamorphic threshold of
four should be able to say why, and this subject's techniques do.

The third is that none of this is observable and so none of it needs a test
in the guest's terms. Whether two objects share a shape, which rung an array
is on, whether a site latched megamorphic are exactly what the engine's own
tests must assert; expose them as pure queries behind a flag, and let the
sibling that owns the introspection surface say how.
