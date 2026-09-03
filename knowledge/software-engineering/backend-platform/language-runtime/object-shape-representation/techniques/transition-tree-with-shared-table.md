---
layer: technique
type: technique
subject: object-shape-representation
technique: transition-tree-with-shared-table
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [two objects built by the same sequence of property additions must end up with the same layout descriptor, deciding whether a property addition may reuse an existing shape or must mint one, a lookup on a shape must not read entries that belong to a sibling shape, implementing property deletion on a shared layout without a per-object table]
---

# Transition tree with a shared property table

A shape is a node in a tree whose root is the empty object and whose edges
are property additions. The tree exists so that the second object to add the
same key in the same way as the first arrives at the first object's shape
without allocating, and the technique's whole difficulty is deciding what
"in the same way" means, what the nodes share, and how a deletion - which the
tree has no edge for - is expressed.

## The edge key is the name plus the attributes

An edge from a parent shape is identified by the property key **and** the
attribute flags the property is added with: writable, enumerable,
configurable, and whether the slot holds a plain value or an accessor pair.
When an object adds a key that already has an edge from its current shape
with the same flags, reuse the child; when the flags differ, mint a new child
under a different edge, because a cache that resolved the name to a slot on
one child would otherwise accept a store that the other child's attributes
forbid. The flags are part of the identity for the same reason the name is:
the cached fact is "this slot is a writable data slot for this key", and a
shape that let two objects share it with different flags would let a pointer
compare validate a fact that is false for one of them.

The reuse rule is exact, not approximate. Two objects that add `a` then `b`
share a shape; two that add `b` then `a` do not, and the engine must not try
to canonicalise the order, because the slot index is the order, and a program
that reads slot zero as `a` on one object must read it as `a` on every object
carrying that shape. Order-insensitive sharing is a legitimate optimisation in
an engine that separates slot assignment from shape identity, and it is not
this technique.

## Sibling shapes share one table until one of them diverges

Each shape must answer "which slot holds key `k`" and "which key is at slot
`i`", and the naive representation gives every shape its own table, copied
from the parent plus one row. For a chain of `n` additions that is `n²/2`
rows for `n` shapes, and the copying, not the lookup, is what a constructor
with twenty fields pays on its first instance. The alternative is that a child
shape **shares its parent's table** and appends its row to it: the parent's
entries are a prefix of the child's, the child records its own property count,
and a lookup on either reads only the first `count` rows.

Sharing holds until it cannot. When a parent already has a child that appended
row `count` with key `a`, and a second object adds key `b` from that same
parent, the two children want different rows at the same index; the second
child **forks** the table - copies the prefix up to the parent's count and
appends its own row - and from that point the two branches own separate
tables. The fork test has two halves, and the second is the one a first
implementation forgets: fork when the parent's count is not the table's
length (a sibling already owns the next row), *and* fork when the key being
added already appears anywhere in the table, because a table keyed by name
cannot hold one name at two rows, and a deletion's replay routinely re-adds a
name that a sibling branch still holds further along. Fork only on those two
conditions, never eagerly: a program whose objects all take one path pays one
table for the whole path, and the fork cost is paid exactly by the program
that needs two layouts.

The count is the bound, and it is what makes the sharing safe. A shape's
lookup must be bounded by **its own** property count, not the table's length,
because the table it shares may have been extended past the shape's rows by a
descendant; a lookup that scanned the table's length would find a descendant's
property on an ancestor's object and return a slot the object does not have.
An index into the table must be guarded the same way: the row at index `i`
belongs to this shape only if `i` is below this shape's count.

The initial capacity of a new table is small - four rows is the common
choice - because most objects in real programs carry a handful of properties
and the table doubles like any vector; the number is a starting point for the
growth policy, not a limit.

## Deletion is rollback and replay

The tree has edges for additions only, and deletion on a shared shape cannot
mutate the shape - every other object carrying it would lose the property
too. The procedure is to **walk back** along the strong parent edges to the
shape just before the deleted property was added, then **replay** every
addition that came after it, taking existing forward edges where they exist
and minting shapes where they do not. The object ends on a shape whose
history is its own history minus one addition, and every other object on the
original path is untouched.

The replay is linear in the number of transitions after the deleted one,
which is why deleting the *last* property is cheap and deleting the *first*
is not. Its cost is bounded without a trigger of its own: no shared path is
longer than the transition cap that
[dictionary-mode-fallback](./dictionary-mode-fallback.md) owns, so no replay
is either, and the cap is checked again on the shape the replay produces. Two
rules make the replay cheaper than the history it re-walks. Attribute changes
made to a property after its insertion are **condensed** into a single
insertion with the final attributes, at the position of the original insert,
so the replayed chain is never longer than the original and is shorter
whenever the object was reconfigured. And prototype changes on the path are
collapsed to the latest one, applied first, because only the last prototype
is the object's. An engine that replayed the history verbatim would mint
shapes for states the object passed through and no longer holds.

Never mutate a shared shape in place to express a deletion; the identity that
other objects and every cache hold would then name a layout it no longer
describes ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
An engine that finds the replay too expensive for its workload has a second
legitimate design - convert to a unique shape on any deletion that is not of
the last property - and it trades the replay for losing the object from every
cache that saw it; the tree's design keeps the object shared, which is right
when deletions are rare and wrong when the object is a map.

## The root is per prototype, and prototype change is an edge of its own

Objects with different prototypes must not share a shape, because a cached
lookup that resolved on the prototype validated a prototype identity along
with the receiver's. The root of every path is therefore a **prototype
transition** from a single prototype-less root, and setting an object's
prototype after construction is a transition like any other: a new child of
the root for the new prototype, with the property additions replayed on top.
The replay is the same machinery deletion uses, and it is bounded by the same
exit.

## Decision rules

- When an object adds a key with attribute flags that match an existing edge
  from its shape, reuse the child; when the flags differ, mint a new child,
  because a cache keys on the attributes as well as the slot.
- When a child is minted from a parent with no existing children at the next
  row, append to the parent's table; when the parent already has a child at
  that row, fork the table for the new child, because two rows cannot share
  one index.
- Bound every lookup and every index check by the shape's own property count,
  never by the shared table's length, because the table may hold a
  descendant's rows.
- Fork also when the key being added is already present anywhere in the
  shared table, because one name cannot occupy two rows.
- Express deletion as rollback to the shape before the addition plus replay of
  the later transitions, condensing later attribute changes into their insert
  and keeping only the latest prototype; rely on the transition cap to bound
  the replay rather than adding a trigger of its own.
- Treat a prototype change as a transition from the root with the properties
  replayed, never as a mutation of the current shape.

## When not to use it

An engine whose objects are created from static class declarations that
cannot gain or lose members has no transitions and needs no tree; a fixed
slot layout per class is the whole design. An engine whose objects are
overwhelmingly used as maps - a configuration-language interpreter, say - pays
for a tree that every object leaves within a few insertions, and should start
in the dictionary the fallback ends in. The tree pays when the same code
builds many objects the same way and different code reads them, which
describes nearly every general-purpose dynamic language and few of the
special-purpose ones.
