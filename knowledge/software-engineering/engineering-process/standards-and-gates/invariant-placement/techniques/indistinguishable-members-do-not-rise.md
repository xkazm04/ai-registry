---
layer: technique
type: technique
subject: invariant-placement
technique: indistinguishable-members-do-not-rise
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [two parameters of one signature carry the same type, an encoding is asserted to make a state unrepresentable, a pair is distinguished only by the order it is written in, a checker cannot be made to refuse the known-bad construction, a defect survives because a second defect downstream undoes it]
---

# Indistinguishable members do not rise

The shape altitude is sold on a single promise: the illegal combination has no
expression, so nothing is checked because there is nothing to check. The promise
is real and it has a precondition nobody states. **A structural checker refuses
only the distinctions it can see, and a distinction it cannot see is not
enforced at the shape altitude, wherever the encoding appears to sit.**

The recurring case is a pair whose members share a type. A span carrying a start
and an end; a point carrying two coordinates; a position carrying a line and a
column; two identifiers for one entity, one of them a human-facing handle and
the other the row key a query is scoped by. The encoding looks like a shape: the
members are declared, they are named, they have types. What actually separates
them is **the order they are written in**, which is a call-site convention. The
invariant did not rise. It is sitting at the call site wearing the shape's
clothes, and the altitude table's promise of *zero* enforcements has been
collected without the enforcement being bought.

## The diagnostic: try to write the refusal

There is no need to reason about this, and reasoning about it is where it goes
wrong, because the encoding reads as correct. Use the obligation the subject
already imposes: [one negative artifact per raised
invariant](./constraint-deletion-is-silent.md), whose pass condition is a
refusal, watched failing once before it is trusted.

> **Write the known-bad construction and try to make the checker reject it. If no
> program expresses the violation, the invariant is at the shape altitude. If the
> violation compiles, it never was, and the artifact you just failed to write is
> the evidence.**

This costs minutes and it is the only reliable answer, because the two outcomes
are indistinguishable from the inside. A transposed pair and a correct pair are
the same program to a checker that sees two members of one type.

Two shapes of indistinguishability recur, and they fail differently:

- **Positional members of one type.** The signature's parameter *names* carry the
  meaning, and names are not part of structural compatibility. A function whose
  third and fourth parameters are swapped relative to the contract it is assigned
  to satisfies that contract exactly, and every call site is then correct with
  respect to whichever of the two declarations its author happened to read.
- **A value asserted into a set it is not in.** A hand-maintained table of
  permitted values, each member individually asserted to the declared type, cannot
  be checked against that type — the assertion is the thing that suppresses the
  check. The table and its own declared set then drift, and the drift is invisible
  precisely where it matters: the comparison against a value the table really
  produces is refused as impossible, while the comparison against a value the
  declaration permits and nothing produces is accepted and is dead forever. The
  encoding has inverted, and it still reads as a closed set.

## The failure is silent in a specific and worse way

An unenforced pair does not announce itself by breaking. The wrong member is the
right type and usually a plausible value, so the operation *succeeds* on it: a
scoped read matches nothing and returns empty, a position reports a location off
by the width of a line, a range covers the interval's complement. This is
[failure spelled as empty
success](../../../../_laws.md#failure-not-empty-success), and no test sees it
unless a test happened to assert on the populated case for a real subject.

Two consequences worth holding:

**The behavioural suite is not the backstop.** A pair used *asymmetrically* in a
computation is covered by ordinary tests for free, because the transposition
changes a result. A pair that is carried, stored, logged or matched on is not
covered by anything, and those are the majority. Sort the pairs by whether
transposing them changes an observable before deciding how much to care.

**Blast radius still chooses the altitude, and this class raises it.** Two
identifiers for one entity, where one of them is what a scope is ANDed with, is
the [authorising value](../invariant-placement.md) case: the mistake and its
consequence are separated by an unbounded interval, and the consequence is
someone else's rows or none at all.

## The compensating pair, which is why these survive

The dangerous instance is not the transposition. It is the transposition whose
consumer transposes it back.

A contract delivers its pair the wrong way round. The one consumer that reads
the pair was written against the behaviour rather than the declaration, so it
swaps them at the point of use and the rendered output is correct. Every test
passes because nothing observable is wrong. The defect is real, fully
documented in the declaration, and **load-bearing**: the pair of errors is now
the mechanism, and repairing either end alone introduces the bug that neither
end had.

This is the state to name explicitly when it is found, because the instinct is
to fix the half you are looking at:

- **Neither half is a local fix.** Repair both ends in one change, or neither.
- **A new consumer of that contract gets the pair backwards**, and it will be
  the honest consumer — the one that trusted the declared names — that appears
  to be wrong.
- **The compensation is why no instrument fired**, so the absence of a failing
  test is evidence about the instruments, not about the contract. An aggregate
  that absorbs offsetting errors hides the same way, and neither is caught by
  looking at outcomes.

## The repair is one-directional, which is what makes it affordable

Making the members distinguishable sounds like a migration of every call site,
and price #5 of the subject's cost list — a wrong encoding is a one-way door —
argues for caution. The asymmetry that resolves it:

**A nominal wrapper over a primitive is assignable to the primitive, not from
it.** So branding the value where it is *produced* breaks no consumer: every
signature that still takes the raw type keeps compiling. Only the other
direction is refused, and only at the signatures that opted in. The altitude
therefore rises **one consumer at a time**, and an unmigrated consumer is exactly
as safe as it was, never less.

That converts the decision from "encode the whole surface or none of it" into a
door plus a migration order, which is the form the subject's [door
altitude](../invariant-placement.md) already recommends. Mint at the one place
that established the fact; migrate the highest-blast-radius consumers first;
leave the rest.

**State what the wrapper proves.** It proves *provenance* — the value came
through the door that established it — and not validity. A wrapped identifier
does not say the row still exists, and a wrapped position does not say it is in
range. Properties with clocks stay where the subject says they stay. A brand read
as a validity proof is the unchecked access under a comment asserting the
construction, which is price #3 arriving through a new door.

## When not to use it

**When the pair is genuinely one value.** Two coordinates of a point, always
produced together, always consumed together, never meaningful apart: wrap the
pair rather than branding the members, and the ordering question disappears
instead of being policed. Branding both members of a pair that should have been
one type is the combinatorial declaration cost of price #2 with nothing bought.

**When the members are distinguishable but the names are wrong.** If the checker
*can* tell them apart and a call site still passed the wrong one, the encoding
worked and the defect is elsewhere. Do not add a brand to a problem a rename
fixes.

**When the artifact cannot reach a blocking rung.** A negative artifact for this
class is a type-level construction, and type-level constructions are routinely
excluded from the very check that would run them — a test-file exclusion in the
checker's own configuration is enough to put the artifact on no rung at all,
where it stays green forever and certifies nothing
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Confirm the checker
reads the artifact's file before trusting it, by deleting the constraint and
watching the artifact fail. An artifact that stays green when the constraint is
removed is measuring its own exclusion.

## Decision rules

- Before claiming an encoding makes a state unrepresentable, name the two
  members and ask whether the checker can tell them apart. If it cannot, the
  rule is at the call site and is recorded as such.
- The claim is settled by writing the refusal, never by reading the
  declaration.
- A pair distinguished only by position is documented as a call-site convention
  until the members are made distinguishable, and it is not counted as a
  structural guarantee in any review.
- Where a transposition is found, look for the consumer that compensates before
  repairing either end; if one exists, both ends move in one change.
- Prefer wrapping a pair that is one value over branding two members that are
  two values.
- Brand at the producing door, migrate by blast radius, and state that the
  brand proves provenance and not validity.
- Confirm the negative artifact is on a rung the checker actually reads, by
  watching it fail once.
