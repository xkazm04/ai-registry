---
layer: technique
type: technique
subject: invariant-placement
technique: consumption-bounds-at-most-once
status: forged
laws: [creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [a value that must never be used twice, a one-shot authorisation or single-use secret, deciding whether a structural encoding covers a must-happen requirement, a cleanup step nobody performs]
---

# Consumption bounds at most once

Some obligations are about a count. A single-use secret must never be reused; a
one-shot authorisation must not be replayed; an entry must be recorded exactly
once; a fuse must be blown at most one time. The placement available for this
family is unusually clean, and its limit is unusually easy to overstate.

**The clean half.** Where a language can express a value that is not
duplicable, handing that value to an operation *consumes* it — the caller no
longer holds it, and a second call cannot be written, because the argument no
longer exists. The rule is enforced by construction at every call site that
will ever exist, with no counter, no flag, and no state to keep consistent. For
the *never twice* half of the obligation, this is as strong as placement gets.

**The half nobody says out loud.** Nothing structural forces the holder to use
the value at all. Discarding it is always legal. So:

> The encoding bounds consumption at **at most once**. It says nothing about
> **at least once**.

The holder can drop the value, walk away, and the calibration never runs, the
entry is never written, the fuse is never blown. Most toolchains offer an
annotation that makes an unused value produce a *warning*, and a warning is not
a refusal — the whole ladder's foundational test asks which input makes it
block, and this one blocks on nothing
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): a guard
that can be ignored is not a guard). Careful sources state this limitation and
then, two paragraphs later, present the placement as a complete solution;
readers keep the second impression.

## The composition that is actually correct

Because the two halves need different instruments, a single-use obligation is
placed in two pieces, and the design is only sound when both are present:

1. **At most once — structural.** The non-duplicable value, consumed by the
   operation. No runtime state.
2. **At least once — runtime, at the point that depends on it.** The operation
   that requires the obligation to have been discharged checks that it was.
   This is the safety net, it lives with the dependent operation rather than
   with the obligation, and it is not optional just because the first half
   looks impressive.

Where the obligation is a *sequencing* rule rather than a count — this must
happen before that becomes available — the second half can often rise too, by
making the dependent operation exist only on a value in the post-obligation
state. That is a different placement (the state is carried in the shape, and
the dependent operation is simply absent before the transition), and it is the
right upgrade when the two operations belong to the same value. It does not
rescue the general case, where the obligation and its dependant are separated
by a process boundary, a queue, or an operator.

The value must also name what happens if it is *not* consumed
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): a
one-shot value that is dropped has left an obligation undischarged, and the
destruction path is the place to say whether that is benign, logged, or a
failure. A non-duplicable value with an interesting destruction path is the
ordinary form of this, and it is the only mechanism in the family that fires
when nobody calls anything.

## Distinguish this from delivery semantics

The vocabulary collides with the messaging one and the questions are different.
Exactly-once, at-least-once and at-most-once *delivery* concern a system's
behaviour across retries, crashes and duplicates, and belong to
[delivery guarantees](../../../../backend-platform/work-execution/delivery-guarantees/delivery-guarantees.md).
This technique concerns a *single process's* ability to call an operation twice
with the same value, and it holds only inside the memory of one execution. A
non-duplicable value provides no protection whatsoever against a retried
request arriving twice, a crashed process restarting, or the same secret being
minted a second time by the same code path. Where the obligation crosses a
durability or network boundary, the placement here is not the mechanism —
idempotency keys and the deduplication apparatus are, and they are runtime
machinery by necessity.

Saying this out loud matters because the structural version is so convincing
that teams stop asking the distributed question.

## When not to use it

**The moment the requirement is "must happen" rather than "must not happen
twice."** This is the inversion, and it is total rather than partial. If the
obligation is that the step *occurs*, the placement carries nothing at all:
it bounds a count from above and the requirement is a bound from below. Every
line of encoding buys zero, and what returns is exactly what it was supposed to
replace — a flag, a check at the dependent operation, or a reconciliation pass
that finds undischarged obligations. Adopt it anyway and the cost is not merely
wasted effort: the design now *looks* like it enforces the obligation, and the
runtime check that would have caught the dropped case is the natural thing to
delete during cleanup.

**Where the obligation is per-identity rather than per-value.** "This coupon
may be redeemed once" is a claim about a record in a store, enforced by the
store's write door and a uniqueness constraint. Modelling it as a value in one
process protects one process.

**Where the value must be inspected before use.** A non-duplicable value that
several components need to read, and one needs to consume, becomes an exercise
in threading it back and forth; the shape is fighting the flow, and a
conventional value plus a consumption check at the single consumer is smaller
and honest.

## Decision rules

- The encoding bounds at most once. Write down that it does not bound at least
  once, next to the encoding.
- Every single-use obligation is placed in two pieces; ship the runtime half or
  do not claim the obligation is enforced.
- A warning on an unused value is feedback, not enforcement — never counted as
  the second half.
- Say what an undischarged obligation costs, at the value's destruction path.
- If the requirement is "must happen," the placement carries nothing; keep the
  flag.
- Never quote this as protection against duplicates that cross a process,
  a queue, or a retry.
