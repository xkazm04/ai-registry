---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: quantity-ownership-and-the-bindable-row
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source]
shared_with: []
use_when: [the same number is stated by several sibling specs, deciding which artifact owns a shared quantity, a consumer cites an identifier that does not exist, deduplicating values across a content catalog]
---

# Quantity ownership and the bindable row

The named concern: **which artifact owns a shared quantity, and when removing a
duplicate goes too far.** Two failures sit either side of this line, and a repair pass
that only knows about the first reliably causes the second.

## The first failure: unowned duplication

The same value appears in four sibling specs. Three of them drift. Every consumer now has
a different number, and no artifact is wrong on its own terms.

The reflex — delete the duplicates and keep one — is correct in outcome and insufficient
in execution, because nothing records *why* the survivor is the survivor. The next author
adds the value back where they need it.

**Nominate the owner on a stated principle: the artifact where the mechanism lives.** The
cost of a climb is owned by the step that holds the gate creating it and the bucket
metering it, not by the step that holds the thresholds. Then say so in one clause.

That clause is the difference between a deletion and content. In one measured case it
also answered a standing finding — *the model names a behaviour with no row to carry
it* — without inventing a row or dropping the behaviour, because naming the owner made
clear where the behaviour actually lived.

Every other artifact then **cites the owner by name** rather than restating the value.
This is the authoring face of
[one authority per quantity](../../../_laws.md#one-authority-per-quantity).

## The second failure: a behaviour with nothing to bind to

The mirror, and the one a deduplication pass causes. Having learned that duplicated rows
are bad, an author documents a consequence as prose instead: *"this is not a row — the
terminal sets the flag directly."* Coherent, non-duplicative, and **unbindable**.

A downstream consumer that reaches every other behaviour in the table by identifier now
has nothing to reference. In one measured case the consuming catalog invented an
identifier for it, which then read as a fabricated cross-reference in *that* catalog — a
finding logged against the consumer for a defect the producer caused.

**The test: can a consumer reach this behaviour through the same interface as every other
behaviour in the table? If not, "it is not a row" is an omission wearing a principle's
clothes.**

The fix is a real row with a zero delta whose entire job is the flag it sets. A row that
changes no value but exists to be bound is not duplication; it is the interface.

## State what the table does not carry

The complement, and cheap: an explicit field naming the identifiers a consumer might
expect and **what to use instead**. In the same case this closed the loop on a phantom
identifier a neighbouring catalog had invented.

**A phantom identifier in someone else's catalog is a defect in yours** for never saying
which identifiers exist. Producers own their interface's negative space.

## Read the consumer before rewriting the producer

Before changing a shared quantity or its ownership, read the artifacts that cite it.
Twice in one campaign this changed the answer: once the consuming catalog already
described the behaviour a corrected computation produced, confirming the fix for free;
once a producer's published price had moved and a consumer was still citing the producer
*as its source* for the old value in eight places — a contradiction only visible from
outside the artifact.

Where the two disagree and the producer is right, the consumer's correction is the
consumer author's to make. Record the contradiction and route it; do not reach into a
catalog you do not own.

## Decision rules

- **When a quantity appears in more than one artifact, nominate an owner where the
  mechanism lives and state the principle in one clause.**
- **When an artifact needs a value it does not own, cite the owner by name** rather than
  restating the number.
- **When a behaviour must be reachable by a consumer, give it a row** — a zero-delta row
  is still a row.
- **When a table has a boundary, publish what it does not carry** and what to use
  instead.
- **When changing a shared quantity, read every consumer first.**

## When NOT to use this

- **Do not create rows for behaviours nothing binds to.** The zero-delta row earns its
  place through a real consumer; without one it is hollow content, and a reviewer will
  say so.
- **Do not nominate an owner by convenience** — the largest artifact, or the one you are
  editing. Ownership by anything other than where the mechanism lives will not survive
  the next author, because the principle is what makes it memorable.
- **Do not edit another owner's artifact to resolve a disagreement** during a parallel
  pass. Two authors reconciling one quantity from both ends produces a contradiction
  neither can see.
