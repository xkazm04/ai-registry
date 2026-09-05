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

## 2026-09-04 - /intake ([[2026-09-04-pgmq-just-use-postgres]])

Gained `co-transactional-consume` (+ `rust--co-transactional-consume`), from a
590-word demo video that was wrong about its own headline. The source claimed a
visibility timeout "guarantees exactly once delivery"; `guarantee-selection`
refutes that in its opening line, so the correction was a catch. **The finding
was in what the refutation is made of.**

`guarantee-selection` names the exact condition under which acknowledgment and
effect commit atomically - "which holds only when both live in the same
transactional store" - and spends it entirely on explaining why a vendor's
advertisement is false. It never turns the condition around into a design a team
could choose, and closes the door explicitly: *"There is no fourth row."*

**The asymmetry**: the corpus builds the mirror of that property, at full
strength, in `data-layer/data-access/transactions-and-units-of-work` - the
outbox, where an effect's intent is durable exactly when the data is, which that
technique calls "the strong version". The registry owned the **producing** half
as a mechanism and denied the **consuming** half as a posture. Both rest on the
identical property.

The consuming half is a mechanism and not a boundary case, so it landed as a
technique: for a handler whose every effect is local, it deletes the persisted
claim, the lease, the reaper, the retry counter and the stable-identity
requirement, and inverts two of `atomic-claiming`'s rules. Its two costs had
nowhere to live in this subject - the transaction held open for the handler's
duration (a real tension with the lock-lifetime discipline in `data-access`,
recorded as a tension rather than resolved), and a concurrency ceiling measured
in **connections rather than consumers**, which is the boundary every
demonstration of this pattern hides because it only appears when the worker
count is raised.

It also splits a vocabulary the subject had inherited from the marketing it was
rebutting: exactly-once **delivery** (an illusion) versus exactly-once
**effect** (ordinary transactional atomicity, bounded by one store). Naming that
is what made a fourth posture expressible at all.

**Applied `experiment`/`better` against tracklight**, the one fleet tree carrying
both postures - and the evidence is a partition nobody designed. Four modules
whose effects stay in the store carry **0** lease/fence tokens each; three whose
effects leave it carry **23 / 18 / 9**; nothing sits between, across a dozen
write domains and two authors' worth of history, with **no document stating the
rule**. A convention would have drifted; a documented rule would have proved only
that someone read it. Under the subject as it stood, 2 of those 8 sites classify
correctly; under the technique, 8 of 8. Shipped the crate doc that states the
invariant (`ed9e0d7`), because the silent-revert risk the technique names was
live and undefended - one added network call moves a local path across the line
into the group with none of the machinery it now needs.

**A near-miss worth recording**: tracklight's own 2026-07-16 feature scout
documents a double-claim bug on the job queue. It is fixed in `HEAD` and was one
step from being reported as a live finding. Read the code, not the tree's
account of itself.

## Open leads

- A database-queue throughput number is a measurement of the wrong resource
  unless it names the connection count and the concurrent transactional load.
  Return: a second independent source benchmarking a database-backed queue *with*
  connection accounting - then it is a technique in `admission-queue` about
  sizing a consumer pool against a shared store rather than against a broker.
