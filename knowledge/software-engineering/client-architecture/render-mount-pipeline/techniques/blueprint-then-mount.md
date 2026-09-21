---
layer: technique
type: technique
subject: render-mount-pipeline
technique: blueprint-then-mount
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [designing what a layout pass hands to the mount pass, deciding which nodes get a host object of their own, a flattened tree lost a click target or an accessibility node, layout cannot leave the frame thread because it touches host objects]
---

# Blueprint, then mount

The layout phase and the mount phase are separate programs with a data
structure between them, and that data structure is the whole technique. Layout
takes an immutable description and emits a **blueprint**: a flat, ordered list
of render units with resolved bounds and no reference to any host object. Mount
takes the blueprint and a visible region and places units into host objects. It
never measures, never resolves, and never walks the tree layout used to get
there.

## Why layout must not touch host objects

Host objects — native views, retained scene nodes, document elements — are
mutable and are usually confined to one thread. A layout that operates on them
inherits both properties: it must run on that thread, and it must instantiate
every object before it can know where any of them goes. Layout over an
immutable description is a pure function of its inputs, which is the property
that lets it run on a background thread, be computed ahead of need, be
deduplicated across callers, and be interrupted and resumed. Put a host object
inside the function and every one of those options closes at once.

## What the blueprint carries

Each render unit carries a **stable identity** (derived from the description,
not from its position in this blueprint), **bounds** relative to the host that
will hold it, the **content type** it needs so mount can ask a pool, the
**binders** that fill that content, and the identity of its parent host. It does
not carry the intermediate layout tree: resolution builds a tree, measurement
annotates it, collection flattens it into units, and the tree is discarded.
Keeping it would tempt the next mount-time feature to read it, and a mount pass
that reads layout state is a mount pass that can no longer run against a
blueprint computed elsewhere.

Identity is load-bearing downstream
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)). The mount
pass decides between *leave it*, *rebind it* and *replace it* by matching unit
identity across blueprints; an identity derived from list position turns an
insertion at the top into a rebind of everything below it.

## Containers vanish; leaves may not even be host objects

A container whose only contribution is arranging its children has done all of
its work by the time bounds are resolved. It emits no unit, and its children's
bounds are expressed relative to the nearest ancestor that did emit one. A leaf
that only paints — text, an image, a decorative shape — can often mount as
paint-only content drawn by its host rather than as a host object of its own.
The effect on a typical card is dramatic: a dozen nested arranging nodes and a
handful of paint leaves collapse into one host object with a list of things to
draw.

## The promotion rule

Flattening removes capabilities that live only on host objects, and it removes
them silently. So the rule is stated from the other side:

> **A node is promoted to a host object of its own exactly when it declares a
> capability that only a host object can provide, and promotion is derived from
> those declarations by one predicate.**

The capabilities recur across every runtime that has done this: an enabled hit
target (touch, click, long press); focusability or keyboard-navigation grouping;
an accessibility node or role of its own; lookup by id or tag from outside; a
shadow, elevation, outline or clip that the host renders; a transform, opacity
or other value animated at runtime rather than baked into paint; an identity a
transition must track across blueprints; and custom binders that need a host to
bind to. Each is a declaration the author already made for its own reason. The
author never also sets a "needs host object" flag, because a flag that must be
remembered is the one that is forgotten on the day a click handler is added to
a node that was flattened yesterday.

Two refinements separate a careful predicate from a merely correct one. A
declared capability that is **not live** does not promote: a disabled touch
handler contributes no hit target, and promoting for it spends a host object on
nothing. And an explicit **force-wrap** exists, is visible, and is rare, for the
host-only behaviour the predicate cannot see — something applied to the host by
code outside the description. A force-wrap used as the normal path is the flag
the predicate was built to retire.

The predicate is a vocabulary, and it has one authority
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
Debug tooling that draws "this node is its own host object" must call the same
predicate or label itself approximate; a second hand-written copy disagrees
exactly on the capabilities added last, and the overlay then lies about the
defect it is being used to find. Promotion is also a derived value, recomputed
from declarations on every layout, never stored on the node between layouts
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).

## Decision rules

- When a layout pass would need a host object to finish, move that need behind a
  declaration and resolve it at mount; layout stays pure.
- Emit a flat, ordered list of units with stable identity, bounds, content type,
  binders and parent; discard the layout tree after collection.
- Arranging-only containers emit nothing; paint-only leaves mount as drawn
  content unless promoted.
- Promote from declared, live host-only capabilities through one predicate;
  keep an explicit force-wrap for what the predicate cannot see, and count its
  uses.

## When not to use this

- **The platform lays out for you.** A document runtime or a declarative toolkit
  with its own reconciliation already separates description from host objects;
  building a second blueprint beside it doubles the work and wins nothing.
- **The surface is small and static.** A settings screen with forty host objects
  that never scrolls pays for this machinery with no frame to save.
- **Host objects are the unit of work.** An editor whose elements are live
  inputs with their own internal state gains nothing from flattening what is
  about to be promoted anyway.

## How to test for the property

- Run layout on a thread that is forbidden to touch host objects; any access
  fails the test. The blueprint produced must be identical to one produced on
  the frame thread.
- Build a nested card of arranging containers and paint leaves; assert the
  blueprint holds one host unit and a list of paint units, not one unit per
  node.
- For each host-only capability in the predicate, add it to a flattened node and
  assert the node is promoted; disable the capability (a disabled handler) and
  assert it is not.
- Diff the debug overlay's promotion answer against the predicate's over a
  corpus of screens; any disagreement is a failure, not a tolerance.
- Insert an element at the top of a list and remount; units below it rebind
  zero times.
