---
layer: technique
type: technique
subject: invariant-placement
technique: build-time-evaluation-of-cross-value-invariants
status: forged
laws: [limits-are-derived, gate-sees-target]
shared_with: []
use_when: [constants that must not overlap or must sum under a bound, a layout table maintained by hand, deciding whether a constraint belongs in a test or in the build, weighing a build-time check against the analysis it hides]
---

# Build-time evaluation of cross-value invariants

A subset of most languages can be evaluated before the program runs. Where an
invariant holds *between* values that are all known at that point, the
invariant can be evaluated there too, and a violation becomes a failed build
rather than a failed test, a failed boot, or a corrupted device.

This is not a fifth altitude. It is the gate altitude with an unusually good
rung — the earliest possible one, with no configuration, no scheduling and no
liveness problem of its own, because the build cannot proceed without running
it. What earns it a technique is that the *class* of invariant it serves is
narrow, specific, and almost always left to a comment.

## The class, stated exactly

**Values known before the program runs, carrying an invariant between them.**
The recurring members:

- **Non-overlap.** Address windows, identifier ranges, partition boundaries,
  reserved slots. The invariant is pairwise and quadratic to check by eye,
  which is precisely why nobody does.
- **Containment.** A sub-window lies inside its parent; a field lies inside its
  register; a record fits its frame.
- **Sum under a bound.** Allocated regions fit the available space; declared
  field widths fit the word; per-tenant reservations fit the pool.
- **Alignment and stride.** An offset is a multiple of a size; a table's
  entries tile without a gap.
- **A derivation chain with per-stage ranges.** An input frequency divided,
  multiplied and divided again, where each intermediate must stay inside a
  stated range. Every stage is arithmetic on known values; every stage has a
  legal band; the composition is the thing that actually breaks.

The last one is why this technique pairs with
[limits-are-derived](../../../../_laws.md#limits-are-derived). That law says a
capacity limit is derived from a measured property or another limit, that the
derivation is written beside the number, and — the load-bearing half — that the
derivation must be **computed, not merely written**, because a formula in a
comment beside a constant that no longer tracks its input is the failure in its
most convincing disguise. Build-time evaluation is the mechanism that makes the
derivation computed. A comment reading *must stay under the transport chunk*
becomes an expression that fails the build when it does not, and the pair of
numbers can never again drift apart silently.

## The three denials

The class has explicit boundaries, and the advocacy for it habitually blurs
them. Do not place here:

1. **Values sourced at run time.** Anything read from a file, an environment,
   an operator, a peer, or a device is unavailable before the program runs.
   The invariant is real; the placement for it is the construction door, and
   the value it produces carries the verdict onward.
2. **Highly dynamic structures.** Trees, graphs, anything whose shape depends
   on data. The build-time subset can express surprisingly much of this and
   should not be asked to; the resulting expression is unreadable, its failure
   message is worse, and property-based testing over the real structure is both
   cheaper and stronger.
3. **Single-value range checks.** "This must be between one and one hundred" is
   a property of one value, and it belongs at the construction door as a
   distinct kind of validated value, which then carries the constraint into
   every signature. Placing it at build time buys a check at exactly one
   literal and leaves every other producer of that value unguarded — the
   narrower placement that looks stronger. The rule of thumb: **if the
   invariant mentions one value, it is a door; if it mentions two or more, this
   technique is available.**

## It lands inside the blindness rule

The corpus already holds a two-sided rule about moving decisions to build time,
and it is the higher tier here:

> Prefer the runtime conditional over the compile-time one wherever both
> branches can compile everywhere. A runtime conditional keeps both branches in
> front of the type checker and costs a dead branch; a compile-time one buys
> the deletion and pays with the blindness
> ([gate laddering](../../quality-gates/techniques/gate-laddering.md)).

Nothing here contradicts that, and the reconciliation is a line, not a
negotiation:

- **A build-time *evaluation* is not a build-time *conditional*.** The
  invariant above is one expression over values that exist in every
  configuration, evaluated unconditionally, whose failure stops every build. It
  deletes no source from anyone's analysis. The blindness rule is about branch
  selection removing a region of source before any static instrument reads it;
  an unconditional assertion removes nothing.
- **The moment the invariant is itself selected by configuration, the blindness
  rule governs and this technique yields.** A constraint that exists only under
  one feature selection, or over constants that differ per target, is checked
  only in the configurations that are actually built — and the honest posture
  is the one that rule already prescribes: name which configurations the
  binding rung analyzes, rather than implying all of them.
- **Therefore the diagnostic to keep is the same one:** how many configurations
  does the binding rung *build*, against how many exist? A build-time invariant
  is only enforced in the configurations somebody builds, which is
  [gate-sees-target](../../../../_laws.md#gate-sees-target) in its cheapest
  form — the check is perfect and the target is a subset.
- **Where both are available, prefer the unconditional form**: express the
  invariant over values that exist everywhere and let the configuration select
  only the *inputs*, not whether the check runs. That keeps one assertion in
  front of every build instead of one per variant.

## When not to use it

Beyond the three denials: **when the values are not actually fixed.** A table
maintained at build time that a deployment is expected to override is a table
whose real values arrive at run time, and the build-time check then certifies a
default nobody ships. This is the most common way the placement becomes
decorative while continuing to pass.

And **when the failure message cannot name the violation.** A build-time
assertion that fails with a location and no explanation is a poor gate,
regardless of how early it fires; every prohibition carries its repair, and an
assertion that cannot say *which two windows overlap* costs more to diagnose
than the runtime check it replaced. Where the toolchain permits a message, the
message names the values and the relation; where it does not, keep the
assertion narrow enough that its location is the answer.

## Decision rules

- One value in the invariant means a construction door; two or more means this
  technique is available.
- Never place run-time-sourced values, dynamic structures, or single-value
  range checks here.
- A derived limit is computed at build time or it is a comment, and comments
  drift from the numbers beside them.
- A build-time evaluation is unconditional or it is a compile-time conditional
  wearing a costume; if the check itself is selected by configuration, the
  blindness rule governs.
- Report how many configurations the binding rung builds; a build-time
  invariant is enforced only there.
- Every assertion carries a message naming the values and the relation, or is
  narrow enough that its location does.
