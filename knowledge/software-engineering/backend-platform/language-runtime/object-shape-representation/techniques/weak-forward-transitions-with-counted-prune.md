---
layer: technique
type: technique
subject: object-shape-representation
technique: weak-forward-transitions-with-counted-prune
status: forged
laws: [creation-names-reaper, limits-are-derived]
shared_with: []
use_when: [a transition tree must not keep every shape a program ever produced alive for the life of the engine, deciding which direction of a parent-child edge is weak and which is strong, choosing when dead transition entries are swept without putting a sweep on the insertion path]
---

# Weak forward transitions with a counted prune

A transition tree is a memory of how programs build objects, and a memory that
forgets nothing is a leak. Every object literal in a request handler, every
temporary a test harness builds once, every shape a deleted property's replay
minted on the way to the shape that survived - each is a node reachable from
the root, and a tree with strong edges in both directions keeps all of them
until the engine exits. This technique owns the edge polarity that lets dead
shapes die and the cadence at which their dead edges are removed from the
parents that still name them.

## Forward edges are weak; back edges are strong

The rule is by direction. The edge from a **child to its parent** is strong:
a live shape needs its ancestry for the rollback that deletion performs and
for the prefix of the property table it shares, and an ancestor of a live
shape is by definition still describing part of a live object's layout. The
edge from a **parent to its child** is weak: it exists so that the next
object to take the same path finds the child without allocating, and if no
object holds the child any more, the next object can mint it again at the
cost of one allocation. A weak forward edge trades a rare allocation for the
guarantee that the tree's size is bounded by the number of shapes something
still uses.

The consequence a designer must accept is that a transition can be **lost and
remade**. Two objects that took the same path a collection apart may end on
two distinct shapes with identical layout if nothing held the first shape in
between. This is correct - the shapes are structurally equal and a cache that
saw the first will miss on the second and refill - and it is the reason the
cache's fallback must be the full lookup, never an assertion that a shape it
saw once is a shape it will see again. An engine that cannot tolerate a remade
shape has made shape identity mean more than "layout at this moment", and
should not use weak edges.

## Dead edges are pruned on a counter, not on the operation

A weak edge whose target has been collected still occupies its entry in the
parent's transition table. The table lookup sees it as a miss - the weak
pointer no longer upgrades - and the insertion path must then mint a new child
and add a new entry, so the dead entry is pure waste from that moment. The
naive engine sweeps the table on every insertion to keep it tidy and puts a
linear scan on the hottest path in the object model.

The rule is that pruning runs on a **counter**. Each shape carries a small
wrapping counter that advances once per forward transition added; when it
wraps, the table is swept of every entry whose target no longer upgrades. An
eight-bit counter sweeps every 256 insertions, and the number is not chosen -
it is the width of the smallest counter the shape can carry without growing
its header, and the derivation is written beside it so that a wider counter
is understood as a cadence change and not a tuning knob
([limits-are-derived](../../../../_laws.md#limits-are-derived)). Between
sweeps a parent holds at most 256 dead entries, which bounds the waste by
the same number that bounds the sweep interval.

The second trigger is a **miss on upgrade**: when a lookup finds an entry for
the key it wants and the weak pointer fails to upgrade, the shape it hoped to
reuse is dead, the insertion will mint a replacement, and the dead entry
would otherwise sit beside the live one until the next wrap. Prune on that
miss as well, because the cost of the sweep is paid by an insertion that is
already allocating, and because the entry that just missed is the one most
likely to be looked up again.

Two triggers, neither per-operation, is the shape of the rule. A sweep on the
wrap bounds the waste in the absence of misses; a sweep on the miss removes
the entries that are actually in the way. Neither adds a scan to an insertion
that reuses an existing live edge, which is the path a program taking a shared
path executes on every object after the first.

## The prune is the edge's reaper, and it is named at creation

An edge is created by an insertion and it is removed by the prune, and the
prune must be visible from the code that creates the edge - the counter is
advanced in the same call that adds the entry, so a reader of the insertion
sees where the entry will be reaped
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). A
tree whose prune lives in a collector callback that walks all shapes has
separated creation from cleanup by a module boundary, and the usual failure
follows: the callback is disabled during a refactor, nothing on the insertion
path notices, and the tree grows until someone measures it.

The test for the whole technique is the one the design makes possible: build
an object down a path, drop the object, collect, and assert that the parent's
transition table shrinks after the counted number of further insertions - and
does not shrink before it. A test that asserts only "the tree does not grow
without bound" cannot distinguish a working prune from a slow leak.

## Decision rules

- Make every parent-to-child transition edge weak and every child-to-parent
  edge strong, because a live shape needs its ancestors and a dead shape's
  descendants are unreachable.
- Prune dead entries when the per-shape insertion counter wraps and when a
  lookup's weak upgrade misses; never on every insertion, because the reuse
  path must not scan.
- Derive the prune interval from the counter's width and write that
  derivation beside it; a wider counter is a longer interval, not a tuning
  parameter.
- Advance the counter in the same call that adds the edge, so the creation
  site names its reaper.
- Design every consumer of a shape identity to tolerate a lost and remade
  shape; a cache that asserts a shape's return is wrong by construction.

## When not to use it

An engine whose collector cannot express a weak reference - a pure
reference-counting heap with no weak handle, or an arena freed only at exit -
cannot make forward edges weak, and should instead bound the tree by the
dictionary fallback alone and accept that shapes minted before the fallback
are permanent. An engine whose whole program is loaded and shaped once, as an
embedded configuration evaluator is, minted every shape it will ever have at
startup and gains nothing from pruning them. The technique pays when the
program creates shapes throughout its life and most of them are transient,
which is the profile of every long-running host that evaluates guest code per
request.
