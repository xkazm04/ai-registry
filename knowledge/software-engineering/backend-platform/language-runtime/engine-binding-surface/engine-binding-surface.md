---
layer: golden-path
type: golden-path
subject: engine-binding-surface
status: forged
use_when: [writing a memory-safe binding layer over an engine you did not write and cannot change, deciding which of a foreign runtime's dynamic rules can be carried by the host language's type system and which must stay checks, a foreign object the engine holds pointers into is being moved by safe host code, a destructor fires on a thread that is not allowed to perform the release, re-expressing a foreign class hierarchy without inheritance, an unsafe cast is justified by a layout assumption nobody has written down]
techniques:
  - address-sensitive-construction
  - capability-deferred-release
  - ask-the-authority-not-the-shadow
  - hierarchy-as-three-relations
  - phantom-capability-parameter
---

# Engine binding surface

Nine subjects in this category design an engine. This one designs the other
side of the same wall: the layer a host writes to reach an engine it did not
build, cannot change, and must not crash. The engine arrives as a foreign
library with its own memory model, its own collector, its own thread rules and
its own inheritance hierarchy — none of which the host language can see — and
the binding layer's entire product is a surface where the host's ordinary
safety story still holds.

That product is not a wrapper. A wrapper forwards calls; a binding surface
**re-expresses invariants**. The engine enforces its rules dynamically, at run
time, usually by crashing or corrupting when they are broken. The host language
enforces its rules statically, at compile time, over a model that knows nothing
about the engine. Every decision in this subject is one instance of the same
question: *which of the engine's dynamic rules can be carried by the host's
static model, at what cost to the caller, and what happens to the ones that
cannot?*

[Invariant placement](../../../engineering-process/standards-and-gates/invariant-placement/invariant-placement.md)
owns that question in general and its four altitudes are the vocabulary here.
What this subject adds is the case that subject does not model: **the rule
being placed was written by somebody else, for a different language, and
neither its statement nor its enforcement is under the host's control.** A
binding author cannot move a rule into the engine's shape. They can only choose
what to build on their own side of the wall, knowing the wall will not move.

## Where this subject starts and stops

- [Engine-host contract](../engine-host-contract/engine-host-contract.md) is
  the mirror. It designs the seams **from the engine's side** — which behaviours
  an engine hands to a host and what each obliges its implementor to keep true.
  This subject is the host filling them, and the asymmetry is the whole point:
  the engine-side subject can change the contract, and this one cannot.
- [Native-guest interop](../native-guest-interop/native-guest-interop.md) owns
  traffic in the other direction — a host value living inside an object the
  guest heap owns, and recovering it safely later. Its
  [typed-downcast-access](../native-guest-interop/techniques/typed-downcast-access.md)
  is the mirror image of this subject's narrowing relation: there the host
  records the payload's identity because the guest heap erased it, here the
  engine already knows the type and publishes a predicate for it.
- [Invariant placement](../../../engineering-process/standards-and-gates/invariant-placement/invariant-placement.md)
  owns the altitude decision, the price of each altitude, and the liveness
  obligation that comes with raising one. This subject borrows all of it and
  re-litigates none of it.
- [Concurrency guards](../../work-execution/concurrency-guards/concurrency-guards.md)
  owns release paths in general, and its
  [release-guarantees](../../work-execution/concurrency-guards/techniques/release-guarantees.md)
  enumerates the five ways a release fails to fire. The case in
  [capability-deferred-release](./techniques/capability-deferred-release.md) is
  not a sixth member of that list, and reading it as one sends the repair to
  the wrong place: there the release never runs, here it runs exactly as
  designed and is not permitted to complete.
- The unverifiable operations this layer is made of — the casts, the assertions
  the checker cannot prove — are governed by
  [marked-unverifiable-region](../../../engineering-process/codebase-stewardship/module-design/techniques/marked-unverifiable-region.md).
  A binding surface is one large such region with a small checked door, and
  that technique's four properties are the audit this subject assumes has
  already been passed.

## The three kinds of foreign rule

Sorting the engine's rules into these three before designing anything is what
keeps a binding layer from becoming a pile of individually reasonable
decisions. They differ in what the host can do about them, not in how serious
they are.

**Rules about a value's type.** The engine knows what each of its values is
and will usually say so on request. These are the cheapest to carry: the host
mirrors the hierarchy as relations between its own types, and every narrowing
consults the engine's own predicate rather than a belief. Getting this wrong
is loud and immediate.

**Rules about a value's lifetime.** Handles live only as long as the region
that created them; the collector may move the object underneath. The host's
own lifetime machinery is a genuinely good fit here, and this is where the
binding layer earns most of its keep — a whole class of use-after-free stops
being expressible.

**Rules about *where* and *when* a value may be touched.** The object may only
be used on one thread; the region may not be moved once the engine has taken
its address; the release may only run while a lock is held. These are the ones
that break binding layers, because the host language's own guarantees are
actively unhelpful here: a destructor is guaranteed to run, which is the
problem; a value is free to move, which is the problem; a type is `Send` or it
is not, and neither answer is right for a handle whose *operations* have
different thread rules than its *storage*.

The third kind is what this subject is mostly about, because the first is
routine and the second is what the host language was designed for.

## Do not model the engine; model what the caller may do next

The binding layer's public types are not a translation of the engine's classes.
They are the answer to *what is legal right now*, and that is a different
shape. An engine class that exists for the engine's own convenience may deserve
no host type at all, while a state the engine tracks in a field — a region has
been entered, a lock is held, initialization has finished — usually deserves to
be a *type distinction*, because the operations legal in that state are exactly
what the caller needs the checker to police.

The recurring form is a type parameter that carries no data and names a
capability the value currently has
([phantom-capability-parameter](./techniques/phantom-capability-parameter.md)).
It is the Shape altitude applied to a state the engine keeps at run time, and
its price is paid in signatures: every routine downstream must now say which
capability it needs, which is the cost the altitude always charges and which is
also, here, free documentation.

**Where a foreign hierarchy has to be carried, carry it as relations rather
than as a class tree.** Access to a base's members, widening to a base, and
narrowing to a derived type are three different operations with three different
safety stories, and a host language without inheritance models them better as
three tables than as one simulated hierarchy — see
[hierarchy-as-three-relations](./techniques/hierarchy-as-three-relations.md).

## The unsafe half is the deliverable, and it must be assertable

A binding layer is unsafe code with a safe surface. That is its purpose, not a
compromise, and the honest form of it has one property that is easy to skip:
**every assumption the unsafe code rests on is stated somewhere a build can
check, not somewhere a reader can agree with.**

The assumptions divide cleanly. Those relating values known before the program
runs — a type's size, its alignment, the offset of a field, whether one layout
is a prefix of another — are exactly the class
[build-time-evaluation-of-cross-value-invariants](../../../engineering-process/standards-and-gates/invariant-placement/techniques/build-time-evaluation-of-cross-value-invariants.md)
serves, and they belong in a build-time assertion sitting beside the cast that
needs them. A cast justified by a comment and a cast justified by a failing
build are the same code and a different system.

Those relating the *shape of the surface* — that a handle cannot outlive its
region, that a value cannot be moved after initialization — cannot be asserted
that way, because their whole content is that certain programs do not compile.
The obligation there is
[constraint-deletion-is-silent](../../../engineering-process/standards-and-gates/invariant-placement/techniques/constraint-deletion-is-silent.md)'s
negative artifact, and a binding layer is the setting where that obligation is
heaviest: the surface exists *only* to make a class of program unwriteable, so
a change that quietly makes those programs writeable again deletes the
product while every test still passes.

**And the artifact that discharges the obligation is the one most likely to be
excluded by configuration.** Its output is the toolchain's own diagnostics,
which vary by version and by target, so it acquires version guards and platform
guards for entirely honest reasons — and on every configuration where a guard
excludes it, the altitude is back to having no liveness signal at all. That is
the condition under which the remedy reproduces the disease, and it is stated
where the remedy lives.

## What the host's guarantees do not reach

Two things a binding author should stop trying to encode, because the attempt
produces a worse system than the check it replaced.

**A fact the engine can invalidate while the value sits unchanged.** The
engine disposed of the region; the collector moved the object; another thread
took the lock. These are
[facts that expire](../../../engineering-process/standards-and-gates/invariant-placement/invariant-placement.md)
in the exact sense that subject bars from the top two altitudes, and here the
clock belongs to a foreign runtime that will not tell you when it ticks. They
stay as checks, and the check consults the engine
([ask-the-authority-not-the-shadow](./techniques/ask-the-authority-not-the-shadow.md)).

**A rule the host's own machinery is committed to breaking.** The destructor
that must not run here, the value that must not move, the reference that must
not be shared — the host language has opinions about all three and they are
not negotiable. The design move is not to fight the machinery but to give it
something safe to do: a destructor that always runs but only ever *enqueues*
([capability-deferred-release](./techniques/capability-deferred-release.md)), a
value that is born movable and becomes immovable at a construction step
([address-sensitive-construction](./techniques/address-sensitive-construction.md)).

## The techniques

- [address-sensitive-construction](./techniques/address-sensitive-construction.md)
  — a foreign object the engine takes the address of cannot be moved
  afterwards; the split between allocating it and initializing it, the storage
  type that tracks which side of the line it is on, and why the ceremony is
  deliberately visible.
- [capability-deferred-release](./techniques/capability-deferred-release.md) —
  a destructor that fires reliably where it is not permitted to act: enqueue
  in the destructor, perform at a named checkpoint, and the three questions a
  deferral scheme owes before it is safe.
- [ask-the-authority-not-the-shadow](./techniques/ask-the-authority-not-the-shadow.md)
  — when a correctness-critical answer is available from the foreign runtime,
  the conditions under which caching it locally is wrong, and the storage whose
  teardown order disqualifies it outright.
- [hierarchy-as-three-relations](./techniques/hierarchy-as-three-relations.md)
  — prefix access, infallible widening and predicate-gated narrowing as three
  separate tables, why generating them from a declaration beats writing them,
  and the layout assertion that makes the first two sound.
- [phantom-capability-parameter](./techniques/phantom-capability-parameter.md)
  — carrying a run-time state of the engine as a type parameter with no
  representation, what it buys at call sites, and the two states that must not
  be carried this way.
