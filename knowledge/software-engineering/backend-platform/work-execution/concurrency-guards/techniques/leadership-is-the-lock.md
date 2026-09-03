---
layer: technique
type: technique
subject: concurrency-guards
technique: leadership-is-the-lock
status: forged
laws:
  - gate-sees-target
  - one-validation-door
shared_with: []
use_when: [choosing whether a cluster lock over a replicated log needs a fencing token, the active node must be exactly the log's leader, reading a "how far have we applied" index for a consistency check, deciding what the lock key's stored value actually proves]
stage: multi-service
---

# Leadership is the lock

Cross-process exclusion earns its fencing token from one fact: the store that
receives the holder's writes has no idea who holds the lock, so the holder must
carry proof and the store must check it (see cross-process-exclusion's paused-
holder rule). Change the fact and the token becomes redundant. **Where the
shared store is a replicated log that refuses to accept a write from any node
but its current leader, and the lock is "be the leader", the refusal is the
fence.** A node that was leader, paused, and resumed after a new election
cannot write a single stale entry — not because it checked a token, but
because the log's own admission rule rejects a proposal from a non-leader
before it is appended. The guard is inside the thing being written (law:
gate-sees-target), which is the strongest place a guard can be.

The naive reading is to keep the fencing machinery anyway "for safety". It
buys nothing and costs one thing that matters: the token has to be persisted
and compared on every write, and the comparison runs against a value that can
only ever agree with the leadership check that already happened. Redundant
guards are not free — every one is a door that a later change can leave
open in a different way from the others (law: one-validation-door). Where the
log refuses non-leader writes, there is exactly one door, and it is the log's.

## The acquisition goes through the log or waits on the election

Because leadership is the lock, acquiring it is not a compare-and-swap on a
row; it is winning an election, and the lock primitive is a thin adapter over
the election's notifications. The procedure has two branches and no third:

- **Already leader.** Write the lock key through the log, as an ordinary
  replicated entry. The write succeeds only if this node is still leader at
  append time, so a successful write *is* the acquisition, and its value —
  which node holds active duty — becomes readable on every replica through
  the same channel as all other state. Then hand back the leadership-loss
  notification as the lock's loss channel.
- **Not leader.** Do not poll the key. Wait on the election's own
  notification until it reports leadership, then take the first branch. A
  contender that instead polls the stored value has built a second, weaker
  lock beside the real one: the stored value can lag the election by the
  whole apply pipeline, and a reader acting on it acts on the past.

Release is likewise an election operation — transfer leadership away — rather
than a delete of the key. Deleting the key while remaining leader would leave
a leader that no longer "holds the lock", a contradiction the design should
make unexpressible. The notification channel can deliver a stale "leader"
signal queued from before the lock was requested; the adapter reads until it
sees the first *loss*, and treats every preceding "leader" as the already-
known present, not as a second acquisition.

## The stored value proves nothing on its own

The lock key still exists in the log, and it is useful: it tells every replica
which node currently claims active duty, for redirecting clients and for
operator display. It does not tell anyone whether the lock is *held*. A row
under a key cannot distinguish "the leader wrote this and is still leader"
from "the leader wrote this and lost the election a second ago" — that
information lives only in the election. So a query for "is the lock held?"
must be answered from leadership state, and a design that answers it from the
key is answering a different question with the same words. Say so in the
adapter, where the next reader will look for a liveness check that is not
there.

## The applied index comes from the state machine, never from the log

A replicated log has two positions that look alike and are not. The log's
own *accepted* index is the last entry it has durably appended; the state
machine's *applied* index is the last entry whose effects are visible to a
reader. Between them sits the apply pipeline, which is asynchronous in every
practical implementation, so the accepted index runs ahead of what a read
can observe. Any consumer that reports "how far are we" — a consistency
index echoed to clients, a comparison across replicas to pick the freshest,
a check that a write is visible before an invalidation is fired — must read
the state machine's applied position. Reading the log library's accepted
index says "we have this" about an entry the reader cannot yet see, and the
failure it produces is a client told its write is visible that then reads
the value before it. The rule is a habit rather than a subtlety: the index a
system publishes is the index of what it can *serve*, and only the state
machine knows that.

## Decision rules

- When the shared store refuses writes from a non-leader and the lock is
  leadership, carry no fencing token: the refusal fences, and a second check
  is a second door.
- Acquire by writing the lock key through the log if leader, else by waiting
  on the election notification; never by polling the stored value, because the
  value lags the election.
- Release by transferring leadership, not by deleting the key; the key cannot
  be unheld while its writer is leader.
- Answer "is the lock held?" from leadership state; the stored value proves
  only who last claimed active duty.
- Publish, compare and gate on the state machine's applied index, never the
  log's accepted index; the difference is exactly the window in which a read
  is served stale.
- When the store does *not* refuse non-leader writes, this technique does not
  apply; fence every write instead (see fence-inside-write-transaction).
