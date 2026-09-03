---
layer: technique
type: technique
subject: concurrency-guards
technique: critical-section-across-a-suspension
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a review says never hold a lock across a yield, splitting a critical section to shorten it, a read-modify-write spans an operation that waits]
---

# A critical section that spans a suspension is a decision

The reflexive rule is *never hold a lock across a suspension point*, and it is
repeated as though it were a correctness rule. It is not. It is a throughput
rule wearing correctness clothes, and applying it without the accompanying
test converts a throughput problem into a correctness one — silently, and in
the direction that is hardest to detect.

The rule's real content is narrow: a mutual-exclusion primitive that **blocks
its underlying worker** must not be held while the unit suspends, because the
worker is then parked on a wait that only another unit can satisfy, and that
other unit may need the same worker. That is a real hazard and it is why the
rule exists. What the rule does not say — and what its usual phrasing hides —
is what happens to the invariant the section was protecting.

## The split introduces a check-to-use race

Shortening a critical section around a suspension means cutting it in two:
acquire, do the first half, release, suspend, acquire again, do the second
half. Between the release and the second acquire, **any other unit may enter
the section and change the shared structure.** If the second half depends on
anything the first half observed or established — a value it read, a slot it
reserved, a count it checked — the second half is now operating on a state
that no longer holds. The check happened; the use happens later; the world
moved in between.

This is the same defect shape as a gate that observes a proxy rather than the
thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the first half's
observation is a proxy for the state at the moment the second half acts, and
it diverges exactly when contention is highest — which is when the section
mattered. It passes every test that does not specifically contend the two
halves against each other, which is most tests, and it produces a defect
that reads as data corruption far from the lock.

So the split is legitimate only after an explicit finding:

> **Before shortening a critical section around a suspension, establish that
> the two halves are independent. If the second half depends on state the
> first half observed, the section is transactional and must not be split.**

Independence is a claim about the invariant, not about the code's appearance.
Two operations that merely look similar — two appends, two counter bumps —
may still be dependent if the second's correctness rests on what the first
saw. State the invariant, then ask whether another unit entering between the
halves can violate it. That question has an answer; "the section is shorter
now" does not.

## When the halves are dependent, two moves are correct

- **Use an exclusion primitive that yields rather than blocks.** The section
  stays whole across the suspension, the invariant holds, and the waiting unit
  releases its worker instead of parking it. This is the transactional form:
  read, wait, modify, write, all under one hold. It costs more per acquisition
  than the blocking primitive and it makes the hold duration a scheduling
  concern, both of which are honest prices for the guarantee.
- **Redesign so the suspension leaves the section.** Do the waiting first and
  bring its result into the section as a value; or compute outside and commit
  inside with a conditional write that fails if the state moved. This is
  strictly the better answer where it is available, because it removes the
  question rather than answering it, and it is the same instinct that makes a
  fencing check belong *inside* the write
  ([fence-inside-write-transaction](./fence-inside-write-transaction.md))
  rather than at acquire time.

Which of the two applies is decided by whether the wait can be hoisted. If
the value being waited for depends on what the section read, it cannot, and
the yielding primitive is the answer.

## Inversion: where the halves genuinely are independent

Where the two halves do not depend on each other — two unrelated writes into
a shared structure, a pair of registrations with no ordering relation between
them — **the short blocking section is strictly better.** It is cheaper per
acquisition, it holds for a bounded and predictable duration, and it keeps the
shared structure's guard out of the scheduler's concerns entirely. Reaching
for a yielding primitive there is pure overhead: a more expensive acquisition
and a guard whose hold time is now unbounded by anything the code controls,
bought to protect an invariant that does not exist.

That is the correct residue of the reflexive rule, and it is worth keeping in
that form: *prefer the short blocking section; it is the common case.* What is
not acceptable is applying the preference as an edict, because the cases where
it is wrong are exactly the read-modify-write sections whose corruption is
worth the most.

## Where this sits against the rest of the subject

This subject owns guard **keys**, the shared acquire and release doors,
single-flight arbitration, cross-process exclusion and fencing. Every one of
those treats the guarded body as opaque. This technique is about the body's
internal shape — specifically, what it is allowed to do while holding the
guard — and it is the one question the guard machinery cannot answer for you,
because the invariant lives in the body.

Two adjacent obligations remain the other techniques':
[release-guarantees](./release-guarantees.md) still owns every exit path out
of the section, and a section spanning a suspension acquires an exit path the
short one does not have — the unit being destroyed at the suspension, holding
the guard, with no code left to release it. And what the *held state* may be
across that same suspension is a separate design question owned by
[no un-restorable state at a suspension point](../../job-coordination/techniques/no-unrestorable-state-at-a-suspension-point.md):
exclusion protects the invariant from other units, and it does nothing at all
about the unit ceasing to exist mid-section.

## Decision rules

- Never split a critical section around a suspension without naming the
  invariant and showing the halves are independent of it. Write the finding
  down next to the section; it is the thing the next editor will otherwise
  re-litigate by guessing.
- A read-modify-write with a wait in the middle is transactional by
  definition. Use a yielding primitive or hoist the wait; do not split it.
- Prefer removing the suspension from the section over choosing a primitive to
  tolerate it.
- Where the halves are independent, keep the short blocking section — the
  yielding primitive there buys nothing and costs per acquisition.
- A section held across a suspension names what releases it if the unit is
  destroyed at that suspension, not merely on the error and early-return
  paths.
