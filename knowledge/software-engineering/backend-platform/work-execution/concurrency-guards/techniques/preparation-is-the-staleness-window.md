---
layer: technique
type: technique
subject: concurrency-guards
technique: preparation-is-the-staleness-window
status: forged
laws:
  - gate-sees-target
  - record-precedes-effect
  - one-validation-door
shared_with: []
use_when: [a guard's verdict is read at fetch time and used after several awaits, an irreversible external effect sits at the end of a prepared pipeline, deciding where a freshness check belongs, the set of locks to take is derived from an unlocked read, a cheap skip path decides it may do no work at all, a check passed and the effect fired on state that had already changed]
stage: multi-service
---

# The preparation is the staleness window

A guard is almost always written where the data arrives. The record is fetched,
its preconditions are checked against it — is this still owed, is this still
permitted, is this still unpaid — and the checked object is then carried through
whatever else has to happen before the operation can act: a credential decrypt,
a host re-resolution, two or three round trips to the counterparty, a lock
acquisition, a model call. Only then does the irreversible step run.

Every one of those steps is a suspension, and the verdict ages across all of
them. The gap between the check and the effect is therefore not a scheduling
accident that a faster machine would close — **it is the length of the
preparation, and the preparation is usually the expensive part of the
operation.** A verdict that was true when the object was fetched is, by the time
the effect fires, a statement about a state that is as many round trips old as
the operation is slow.

So the rule is about *placement*, not about adding a check:

> **Re-read the authoritative state as the last statement before the
> irreversible step, with no suspension between the re-read and the effect.**

The check has to stand where the effect is, not where the data was convenient
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The re-read is
cheap by construction — it is one point read of a record already identified —
and it is spent exactly once per operation, at the point where being wrong is
unrecoverable.

## Where the re-read belongs, decided by what the step is

The irreversible step's own nature decides which of three shapes is correct, and
two of the three are not a re-read at all.

- **The step is a write to the store that holds the state.** Then do not
  re-read: *condition the write*. The predicate carries the precondition, the
  affected-row count is the verdict, and the race loses loudly inside one
  atomic unit — the same reason a fencing check belongs inside the write and not
  at acquire time (see
  [fence-inside-write-transaction](./fence-inside-write-transaction.md), and
  [the single conditional write](../../../data-layer/data-access/techniques/transactions-and-units-of-work.md)).
  A re-read here is the weak spelling of a conditional write and should be
  replaced by one.
- **The step leaves the system.** A charge, a message, a record created in
  somebody else's database: nothing can condition it on your state. Here the
  re-read is the best available instrument, and it **narrows the window without
  closing it** — a concurrent actor can still settle the same obligation between
  the re-read and the wire. Two obligations follow. Say so where the check
  stands, in the same voice fencing uses: the honest sentence is "this makes the
  race short", not "this prevents it". And pair it with dedup at the effect — an
  operation identity minted before the first attempt and presented on every
  physical attempt (see
  [idempotency-by-design](./idempotency-by-design.md)), because the residue the
  re-read cannot remove is exactly what the receiving side can drop.
- **The step is a local write that licenses future work to be skipped.** A
  completion checkpoint, a coverage manifest, a "nothing changed since" marker.
  This one inverts: the write is cheap and re-doable, so the proof can be taken
  *after* it. Snapshot the inputs before the cheap path runs, again before the
  license is published, and again after — and on any drift, do not repair the
  license, **fall out to the full path**, which will overwrite it. The cheapest
  branch ends up carrying the most proof, which is the opposite of the usual
  instinct, and it is right because a stale license is not a lost write: it is a
  standing permission to do no work on state nobody has looked at
  ([record-precedes-effect](../../../../_laws.md#record-precedes-effect) read
  forward — the record that authorizes a future skip is itself an effect).

## The re-read may only refuse

The strongest temptation is to use the fresh read to *fix* the prepared work:
the state moved, so send the new value. Resist it in any flow where the effect
carries an operation identity. The prepared payload is what that identity
promised the counterparty; substituting fresh content under the same key makes
attempt N+1 a different operation wearing attempt N's name, and the receiver's
dedup — the one mechanism that covers what the re-read cannot — silently drops
the wrong one of the two.

So the fresh read is consulted for a verdict and nothing else. It refuses, and
the rebuild happens on the retry, from the top, where the payload and its
identity are minted together. The same discipline holds where the re-read exists
to *discover* something rather than to check it: use it to widen the set of
things you must hold, never to replace the work the caller decided on.

A refusal is then classified, because the two classes have opposite handling:

- **settled** — the precondition will not become true again (an erasure, a
  cancellation, a terminal decision). Dead-letter it on the first attempt; a
  retry ladder spent on a settled answer is noise that hides real failures.
- **transient** — the precondition may hold again, or the payload merely needs
  rebuilding under the current state. Leave it retryable and say why.

Either way the refusal is recorded and visible. An operation that declines at
the last statement and returns quietly is indistinguishable from one that was
never owed ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## When the thing derived from the stale read is the lock set

The sharpest form of this defect is not a value but a *scope*: the set of
records the operation must hold is computed from an unlocked read, and the
authoritative state names more of them than the read did. The mutation then
starts with part of its footprint unguarded, and the substrate rejects the
write mid-operation — after earlier writes have landed, which is the one moment
at which nothing can be undone.

Expanding the set from inside the mutation is the instinct, and it is wrong
twice: it happens after the first writes, so failure cannot restore atomicity,
and two owners holding disjoint subsets while each waits for the other's
expansion is a staged circular wait. Stabilise the set *before* the first
mutation instead:

1. Acquire what the first read implies, as one all-or-nothing batch.
2. Under that hold, re-read the authoritative sources and recompute the required
   set.
3. Unchanged — proceed; this is the common case and it costs one extra read.
4. Grown — **release the narrow hold and acquire the complete set from scratch.**
   Never wait for the expansion while retaining the subset.
5. Re-read once more after reacquisition, because the release opened an unlocked
   window; a set that grew again repeats the cycle.
6. Bound the cycle (three acquisitions is a defensible number) and fail *before
   any mutation*, so an adversarially churning graph cannot hold the operation
   open and cannot get it half-applied.

The post-acquisition re-read is the whole point of the design: it is what
converts "we released a lock and hoped" into "the set observed under the final
hold is covered by that hold".

**The inversion, and it is common: when every input that determines the final
set is already stable, compute the set first and lock once.** A batch whose
inputs are all completed work, a remapping whose rules are already known —
there the stabilisation loop buys nothing and costs an unlocked window,
a release and a second acquisition. Reach for the loop only when the
authoritative state can name a member the caller's inputs cannot.

## Decision rules

- Put the re-read at the last statement before the irreversible step; adding an
  `await` between them reopens the window and is a reviewable change.
- Store write: condition the write instead of re-reading. External effect:
  re-read *and* dedup at the effect, and record in the code that the re-read
  narrows rather than closes. Skip-licensing write: snapshot before, at publish
  and after, and fall out to the full path on any drift.
- Read the authoritative store, never a cached copy of it — the local copy is
  precisely what is stale in the scenario being defended against.
- The fresh read may refuse and may widen a lock set; it may never swap the
  payload an operation identity has already promised.
- Classify every refusal as settled or transient, and make it visible; a quiet
  decline reads as "nothing was owed".
- Where the operation's footprint is derived from an unlocked read, stabilise it
  before the first mutation: acquire, re-read, release-and-reacquire the whole
  set if it grew, re-read again, bounded, failing before any write.
- Where the footprint's inputs are already stable, skip the loop and acquire the
  complete set once.
