---
layer: technique
type: technique
subject: object-shape-representation
technique: dictionary-mode-fallback
status: forged
laws: [identity-survives-reuse, limits-are-derived]
shared_with: []
use_when: [an object has taken a transition path no other object will share and the tree is now a per-object linked list, deciding which mutations of a per-object shape keep its identity and which must mint a new one, bounding the cost of deletion by rollback-and-replay on a long path]
---

# Dictionary-mode fallback

The transition tree pays for objects that are built alike. An object used as
a map - a memo table keyed by user input, a registry that grows and shrinks
over a process's life, a record that a deserialiser populates field by field
from a document whose field order is the document's - takes a path that no
other object takes, and every shape on that path is a node minted for one
object, shared with none, kept alive by that object and by nothing else. Past
some depth the tree's constants are worse than the hash table the literal
reading of the specification started with. This technique owns the exit to
that hash table: the **unique shape**, held by exactly one object, whose
property table is mutated in place, and the identity rule that keeps every
cache honest once mutation is allowed.

## The trigger is a transition count, and the shape already carries it

Every shape knows its distance from the root, because the tree assigns it at
minting: a child's count is its parent's plus one. The fallback triggers when
an insertion would produce a shape whose count exceeds a **threshold**, and
the threshold is not a guess. It sits where a linear structure of that length
loses to a hashed one on the operations the tree performs - a lookup that
scans a shared table is linear in the count; a deletion that rolls back and
replays is linear in the count; a prototype change that replays the whole
path is linear in the count - and a threshold of about a thousand transitions
is where those costs stop being amortised by sharing that is no longer
happening ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
State the derivation beside the number; an engine that raises the threshold
because a benchmark built objects with two thousand fields has raised the
cost of every deletion on every long path with it.

A count from the root is the right trigger and a count of *properties* is
not. The two differ by every deletion and every prototype change on the path:
an object that added and deleted one property a thousand times has few
properties and a long history, and it is the history the tree is paying for.

## Conversion is a copy, and the object never returns

Converting an object builds a unique shape whose table is a private copy of
the shared prefix the object's current shape described, and points the
object at it. The old shared shapes are unaffected - other objects may still
hold them - and the converted object is no longer in the tree in any sense:
its shape has no parent, its insertions add no edges, and nothing else can
transition to it. Conversion is one-way. An engine that tried to re-admit a
unique object to the tree when it "looked shared again" would have to find
or mint a path of shapes matching a history it discarded at conversion, and
the proof that the object is now worth sharing costs more than the sharing
would save.

The check runs after **every** kind of transition, not only insertion: an
attribute change, a deletion's rollback-and-replay and a prototype change
each produce a shape with a count, and each converts when that count reaches
the threshold. A deletion needs no trigger of its own, because the replay
re-walks a path that was itself under the cap and produces a shape that is
checked against it; the count bounds the replay as a consequence of bounding
the path.

The tree is not the only entrance to unique mode, and the second entrance is
a design choice rather than a fallback. An object the **host** constructs
through the engine's public constructor - a builtin's instance, a wrapper
around host data, a global the embedder assembles once - is built by one
piece of code that no guest constructor shares, and its layout will be seen
by exactly one object. Start such objects unique. The tree pays for layouts
that recur, and the engine's own literal and constructor paths are where
layouts recur; an object built once by the host would mint a path of shapes
nobody else will take and then hold it alive. Reserve the shared-shape
constructor for the paths that produce many objects alike, and let the
public constructor default to a unique shape with an empty table.

## Insertion keeps the identity; everything else mints a new one

A shared shape never mutates, so its identity - the pointer - is a stable
fact about a layout, and every cache in the engine keys on that pointer. A
unique shape *does* mutate, and the question is which mutations leave every
cached (shape, slot) pair true and which make some pair false. The rule
follows from the caches, not from the mutation's cost:

- **Insertion keeps the identity.** Appending a property adds a slot beyond
  every slot a cache could have recorded; no cached pair names the new slot,
  no cached pair moves. A site that cached this shape and slot two reads slot
  two and finds what it found before.
- **Deletion mints a new identity.** Removing a property either leaves a hole
  a cache might read as the deleted value, or shifts later slots so that a
  cached index reads the wrong property. Either way some cached pair is
  false, and the only way to make every such cache miss is to give the
  object a shape pointer no cache has seen.
- **Changing an existing property's width or attributes mints a new
  identity.** A slot that widens from one storage width to another moves the
  slots after it; a slot that changes from writable to read-only makes a
  cached store illegal. Both invalidate cached pairs.
- **Changing the prototype mints a new identity.** A cache that resolved a
  property on the prototype validated the prototype through the receiver's
  shape, and a receiver whose prototype changed under the same shape would
  let that cache read the wrong object's slot.

The rule is the general one: an identity names a meaning, and when the
meaning changes the identity is reminted rather than reused
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
The three mutations that mint are the three that change what a previously
valid cached access would do; the one that keeps is the one that changes
nothing any cache could have seen. An engine that mints on every mutation is
correct and defeats caching on dictionary objects entirely - every insertion
into a map-like object would invalidate every site that touches it - and an
engine that mints on none is a cache that reads deleted slots.

## What the caches see

From a cache's side, a unique shape is a shape like any other: a pointer to
compare and a slot to read. The cache does not know or care that the shape is
unique, which is the property the identity rule exists to preserve. A design
that gave caches a separate "is this unique" check would put a branch on
every hit to save a remint on some deletes, and the trade is wrong: hits are
the hot path and deletes on dictionary objects are not.

The guest can observe the conversion only as a change in what a
representation probe reports, never as a change in behaviour; a program that
adds two thousand properties to an object gets the same answers before and
after the thousandth, at a different cost. That is the boundary with the
sibling that owns execution limits: a threshold here changes cost and never
outcome, and the moment it changes outcome it has become a ceiling and
belongs there.

## Decision rules

- When an insertion would take a shape past the transition-count threshold,
  convert the object to a unique shape rather than minting, because a path no
  other object shares is a linked list with a hash table's job.
- Check the threshold after every transition kind - insertion, attribute
  change, deletion's replay, prototype change - because each produces a
  counted shape and the count bounds the replay for free.
- Start an object unique when the host builds it once through the public
  constructor, and reserve the shared-shape constructor for the engine's own
  paths that produce many objects alike, because a layout seen by one object
  gains nothing from a tree.
- Never convert a unique object back to a shared shape; the history that
  would place it in the tree was discarded at conversion.
- In unique mode, keep the identity on insertion and mint a new identity on
  deletion, on a width or attribute change to an existing property, and on a
  prototype change, because those are exactly the mutations that falsify a
  cached (shape, slot) pair.
- Give the cache no way to tell a unique shape from a shared one; the
  identity rule is what makes the distinction unnecessary at the hit.

## When not to use it

An engine that has no shared shapes - one that gave every object its own
table from the start - is already in dictionary mode everywhere and has
nothing to fall back to. An engine that bounds objects by the specification
of the language it implements, such that no object may exceed a fixed field
count, has a bounded tree and needs no exit. The fallback pays in the general
case, where the same language is used to build both records and maps and the
engine cannot know in advance which an object will be.
