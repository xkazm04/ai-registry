---
layer: technique
type: technique
subject: engine-binding-surface
technique: hierarchy-as-three-relations
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [re-expressing a foreign class hierarchy in a host language without inheritance, a wrapper is growing one conversion method per pair of foreign types, deciding whether a downcast may be a cast or must consult a predicate, an unsafe reinterpretation rests on a layout assumption]
---

# Hierarchy as three relations

A foreign runtime's public surface is often a class tree of a hundred types
with single inheritance and a documented predicate for each. Host languages
that do not have inheritance are then asked to reproduce it, and the reflex is
to simulate: a trait per base, an enum of every variant, a wrapper struct per
level. All three scale badly and all three answer a question nobody asked.

The tree is not the thing worth reproducing. **Three relations between types
are**, and they are independent of one another, differently safe, and each
expressible as a table:

| Relation | Direction | Safety | What it costs at run time |
|---|---|---|---|
| **Prefix access** | derived → base's members | sound if the layouts nest | nothing |
| **Widening** | derived → base, as a value | always sound | nothing |
| **Narrowing** | base → derived, as a value | only with a predicate | one predicate call |

Everything the hierarchy was going to do for a caller is one of these. Nothing
in the design needs a simulated class.

## Prefix access: reaching a base's members

A derived handle can expose the base's operations because the base's fields sit
at the front of the derived layout. In a host language this is the auto-deref
or auto-borrow relation, and one declaration per edge generates it.

Two rules keep it from becoming folklore:

- **State the target explicitly per edge, rather than deriving a chain.** A
  generic blanket rule over some wrapper type produces a chain the compiler
  will follow in ways nobody intended; naming each edge keeps the graph
  reviewable, and it is short.
- **The layout claim is asserted, never assumed.** The relation is implemented
  by reinterpreting a pointer, which is sound only while the base is genuinely
  a layout prefix of the derived type: same alignment, same field offsets, no
  larger. That is precisely the class
  [build-time-evaluation-of-cross-value-invariants](../../../../engineering-process/standards-and-gates/invariant-placement/techniques/build-time-evaluation-of-cross-value-invariants.md)
  serves — sizes, alignments and offsets are all known before the program runs
  — so it belongs in a build-time assertion sitting **beside the cast**, naming
  the fields it checks. A reordered field then fails the build instead of
  producing a reinterpretation that reads one member as another. The assertion
  is the gate that actually sees the thing that can break
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)); a comment
  asserting the same fact sees nothing.

## Widening: derived to base as a value

Converting a handle to a handle of its base is infallible and free, because the
value being converted is a pointer and the target is the same pointer with a
different static type. It is the host's ordinary infallible-conversion relation,
and it is one table row per edge — but the table should be **generated from the
declared edges rather than written**, because it is quadratic in the worst case
and because a hand-written entry is a place a wrong pair can hide.

The reason a hand-written row is dangerous and a generated one is not: the row
carries no reasoning. Reading it, a reviewer sees two type names and a cast.
Generated from the same declarations that produce prefix access, a wrong edge
is a wrong declaration in one place, visible next to its siblings.

## Narrowing: base to derived, and the only place a check belongs

This is the direction that can be wrong, and the entire safety of the surface
turns on where the answer comes from. **The runtime already knows the type and
publishes a predicate for it; use that, and nothing else.** Not a field the
binding layer recorded at construction, not a tag the host maintains in
parallel, not a shape inferred from which method succeeded. The foreign runtime
is the authority for its own type vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and a shadow of that vocabulary is a second one that will disagree the first
time the runtime adds a case.

The relation is therefore the host's fallible-conversion form: it calls the
runtime's predicate and either returns the narrowed handle or a typed refusal
naming both types. Two properties are worth insisting on:

- **The refusal is a value, not a panic**, and it names the type that was
  wanted and the type that was held. A binding layer's callers routinely narrow
  speculatively; a panic makes that a control-flow crime rather than a
  question.
- **The predicate is per target type and generated alongside the edge.** The
  same declaration that says *this type narrows from that one* names the
  predicate, so an edge cannot exist without one. An edge whose predicate was
  forgotten is an unconditional cast wearing a fallible signature, which is the
  worst of both.

This is the mirror of
[typed-downcast-access](../../native-guest-interop/techniques/typed-downcast-access.md),
and the difference decides which one applies. There the host erased its own
value into a foreign cell, so the host must record the type identity itself and
compare it on the way out. Here the value was the runtime's all along and the
runtime never lost track of it, so recording anything locally is duplicating an
authority that is already correct.

## Generate the tables from one declaration list

The payoff of separating the relations is that each is a one-line-per-edge
declaration and the declarations sit together. A hundred foreign types become a
list a reviewer can read top to bottom, in which a missing narrowing predicate
or a widening in the wrong direction is visible as an anomaly in a column
rather than as a subtle line inside one of two hundred handwritten impls. The
expansion is mechanical and small; keep the generated code boring enough that
nobody is tempted to special-case an edge by hand, because the hand-written
edge is where the wrong one will be.

## When not to use it

**When the foreign hierarchy uses multiple inheritance or virtual bases.** The
prefix-access relation is exactly what stops being true, the layout assertion
will correctly fail, and the answer is an accessor that performs the runtime's
own adjustment rather than a reinterpretation.

**When only three or four types are involved.** The declaration machinery earns
its keep on a large tree. On a small one it is indirection over code somebody
could have read.

**When the host wants to expose a closed set rather than an open hierarchy.** If
callers should be matching exhaustively over a handful of cases, a sum type is
a better surface than three relations, and the narrowing predicate becomes the
constructor of that sum rather than a per-pair conversion.
