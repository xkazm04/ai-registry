---
subject: delivery-guarantees
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# delivery-guarantees

First touch: [[2026-09-01-matrix-rust-sdk]], intake of a messaging SDK's
send-queue module doc and its changelog. Gained `ordered-lane-blocking` -
the lifecycle table answered what becomes of one dead-lettered event and
was silent on the events queued behind it; the silent default (keep
draining) is right for an entity lane and wrong for a stream lane, and the
source paid for the wrong default (messages delivered out of order after a
wedged send). The discriminator - would item N still mean what its author
meant if N-1 vanished - is stated here and mirrored from the client side in
client-state/optimistic-write-path, whose "waiting on a predecessor is not
inheriting its failure" rule is the entity-lane half of the same boundary.

Applied at `simulation` against a connected project's conversation queue
(react application, verdict better): the drain fired on a `finally` block
that could not tell success from failure.

## Open leads (banked, convergence rule applies)

- A wedge must persist across restarts like the rest of the spine; the
  source persists its queue and its wedged flag, and nothing in this subject
  yet says a wedge that evaporates on relaunch resumes draining out of order.
- The classifier's precision bounds the technique where the lane class is
  inferred per item rather than declared per class (the connected project
  infers it from text).

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Application `rust--dead-letter-design`** (negative), from an agent harness's
outbound message queue. The tree implements **five of six** of this subject
faithfully and with evident care: explicit states as directories so location *is*
state, atomic claiming by move, stuck-reaping that requeues the in-flight
directory on worker start, retry escalation as a transition into the dead-letter
lane rather than a bigger number, and a typed reason on the terminal outcome.

The sixth is the one the golden path predicts in a sentence: **the failed
directory has one writer and no readers.** Five references in the whole tree, all
in one storage module - the path constructor, the two callers that write into it,
and the routine that deletes it when the adapter is removed. No tool, CLI verb or
sweep reads it, and nothing wakes anyone. *A dead-letter lane nobody can see is a
`/dev/null` with extra steps*, and here it is worse than absent, because the
machinery reads as completeness: a reviewer asking "do we drop messages?" finds a
durable outbox with retry limits and a failure state and stops.

**The generalisable half** is which piece gets built when a team builds this
incrementally. Everything on the producing side is reachable from the code path
already being written and makes the current change more correct; the consuming
side is a different surface with no local pressure to exist, so it is deferred,
and deferring it is invisible because nothing fails. The review question is
therefore not "is there a dead-letter lane" but **"name the caller that reads
it."**
