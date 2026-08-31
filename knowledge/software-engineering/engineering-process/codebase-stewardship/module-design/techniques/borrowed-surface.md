---
layer: technique
type: technique
subject: module-design
technique: borrowed-surface
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a wrapper type forwards the wrapped type's methods implicitly, an extension assumes two upstream categories stay disjoint, deciding whether a delegating wrapper still earns its name, a dependency upgrade changed a type's surface without changing your code]
---

# Borrowed surface

[module-depth](./module-depth.md) defines a module's interface as everything a
caller must know, and corrects the author's denominator upward: with enough
callers, every observable behaviour is interface whether it was promised or not.
That correction runs **downstream** — callers discover surface the author did not
intend to offer. There is a second correction and it runs the other way.

**Part of your module's interface can be authored by someone else, in their
file, on their release schedule.** Where that is true the surface is *borrowed*:
it is not visible in your module, not enumerable from your module, and it
changes without an edit on your side. Depth is unmeasurable against an interface
you cannot read, so the whole quality model in this subject silently stops
applying at exactly the boundaries where it is most often invoked.

Two constructs borrow, and they look nothing alike.

## Form one: implicit delegation

A wrapper adopts another type's entire callable surface through one declaration
— a forwarding operator, an embedded member promoted into the outer namespace, a
dynamic method-missing hook, an interception proxy, an implicit conversion. One
line, and every method the delegate has is now a method the wrapper has.

The explicit pass-through that [module-depth](./module-depth.md) names is
countable: methods appear in the file, a reviewer sees the list grow, and the
"what would a caller learn in addition if this layer were removed?" test can
actually be applied. Implicit delegation is the same failure with the evidence
removed. There is nothing to count, the diff is three lines, and the layer's
interface is defined in a file the reviewer is not reading.

**The decision rule is what the wrapper is for, and there are only two answers.**

- **The wrapper adds a capability the delegate lacks** — a storage mapping, a
  lifetime, a synchronisation discipline, a serialization format — and callers
  are *meant* to keep using the delegate's surface. Delegation is correct here
  and costs nothing: the added capability is orthogonal to the surface being
  forwarded, so widening the surface cannot damage it.
- **The wrapper exists to make a distinction** — so that two things which were
  interchangeable stop being interchangeable, and the mistake becomes a build
  error rather than a defect. Delegation is **self-defeating** here, and it is
  the common case for a wrapper introduced during a bug fix. The distinction was
  the entire product; forwarding restores the substitutability it was created to
  remove, and does so invisibly.

The tell that separates them in review is one question: *if this wrapper became
an alias for the thing it wraps, what would break?* Nothing — delegation is
fine, and the wrapper is buying something else. Something — the wrapper is a
boundary, and delegation has already dissolved it.

## Delegation moves an invariant out of the type and into caller discipline

The sharpest cost is not substitutability, it is enforcement. A wrapper that
guards an invariant — scrub this before discarding it, take this lock first,
record this write — usually guards it in two or three of its own methods.
Delegation forwards every *other* mutator the delegate has, and none of them
know about the invariant.

The invariant does not immediately break, because the one caller that reaches
through the borrowed surface generally reimplements it by hand, often with a
comment explaining why. That is the state to recognise: the guard has left the
type and become a convention, so it now holds because one author remembered, and
it stops holding when the second caller arrives. This is
[one-validation-door](../../../../_laws.md#one-validation-door) at the type
level — the guarded methods are the door, the forwarded surface is the bypass —
and it fails the way [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)
predicts, silently and by default.

**When a wrapper's job is an invariant, forward nothing.** Expose the few
operations callers actually need, each one enforcing the invariant, and let the
compiler reject the bypass. A wrapper that needs eleven forwarded methods to be
usable is reporting that the invariant belongs somewhere else.

## Form two: a disjointness premise taken from a contract you do not own

The second form has no wrapper in it. You extend a contract defined upstream —
implementing it for the cases its owner did not cover, or attaching behaviour to
its members — and your code is correct **only while the upstream's membership
stays as it is**. It compiles today because the sets are disjoint today. The
owner can add a member next release, the sets overlap, and your code stops
building or starts resolving ambiguously, with no change of yours in the diff.

This is the failure that
[seams-and-adapters](./seams-and-adapters.md) answers with its fourth signal.
The rule here is narrower and worth stating on its own: **a category boundary
you did not define is not a premise, it is a forecast.** Where correctness
depends on two upstream groups remaining distinct, restate the grouping in a
contract you own — even when that costs a line per member and looks like pure
duplication. The duplication is the point: it converts somebody else's
taxonomy decision into your own, where a change to it appears in your diff.

The cost is usually smaller than it looks, and that is worth checking rather
than assuming. Enumerating N members against a contract you own is N lines and a
build error the day the set is wrong; extending a foreign contract is zero lines
and a build error on someone else's schedule.

## What to ask at the boundary

One question covers both forms and it is cheap enough to ask in review:

> **Who can change this module's interface without touching this repository?**

If the honest answer is anyone but you, the interface is borrowed. That is not
automatically wrong — form one is correct whenever the wrapper's job is
orthogonal to the surface, and a genuinely stable upstream contract is a
reasonable thing to build on. It does mean the surface must be *named* rather
than inherited: write down what you actually depend on, pin it if the ecosystem
allows pinning, and put the dependency where a reviewer reads it instead of
where a release note mentions it.

## When not to use it

Do not read this as an argument for wrapping everything in a hand-written
façade. A façade over a large, stable, well-owned surface is the shallow-module
failure [module-depth](./module-depth.md) describes, arriving with better
intentions: it charges an interface, hides nothing, and goes stale against the
thing it wraps. Delegation exists because transparently reusing a surface is
frequently the right call.

The distinction this technique draws is not wrap-versus-delegate. It is that a
borrowed surface must be a **decision** — asked once, answered out loud, and
recorded — instead of the thing that happens when nobody asks.
