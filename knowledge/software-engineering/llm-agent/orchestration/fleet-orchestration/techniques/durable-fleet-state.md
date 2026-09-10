---
layer: technique
type: technique
subject: fleet-orchestration
technique: durable-fleet-state
status: forged
laws: [gate-sees-target, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [attaching durability to existing event chokepoints, a restart forgot sessions that were still running, reconciling mirror claims before serving new work]
---

# Durable fleet state

An in-memory registry with a durable mirror is one design for a single controller.
A transactional store or replicated log may instead own the authoritative state;
choose based on the required recovery and concurrency guarantees. These designs
need different read and acknowledgement contracts.

## Couple durable state to accepted transitions

Attach persistence to the transition authority so writers cannot forget it, but
do not confuse a shared callback with an atomic commit. A crash can occur after
memory changes or a view is notified and before a queued persistence write lands.
If an acknowledgement promises durability, commit the transition and required
reservation before acknowledging it or permitting the external action. Publish
notifications from committed state with replay or an outbox, and make repeated
delivery idempotent. Best-effort mirrors must expose their possible loss window.
Completed durable writes and delayed change notifications are distinct contracts.

Mirror-write rules of thumb:

- **Terminal states must not be lossy.** Transitions into exited, failed, or
  lost — and into and out of hibernated — are the mirror's reason to exist;
  a durability promise requires acknowledgement after commit. Group commit
  is compatible when each waiter is acknowledged only after its group is durable. A
  batched mirror that loses the last thirty seconds turns every crash into a
  small amnesia about precisely the sessions that were changing.
- **High-frequency fields may be lazy.** Last-heard-from advances on every
  output byte; mirroring every advance is waste. Coarsen it (mirror on state
  change plus a periodic touch), and let startup reconciliation absorb the
  slack — the sweeper re-derives liveness anyway.
- **The mirror stores identity, not handles.** Process ids, stream handles,
  and terminal attachments are process-lifetime facts; the mirror records
  them as *claims to verify*, never as capabilities to reuse blindly
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse): the
  session's minted identity is the durable key; everything operating-system
  flavored is a re-checkable annotation).

## Startup: reconcile before you serve

Orchestrator startup is a designed phase with a fixed order — load, verify,
adopt or declare, then open for business. Serving dispatch requests from an
unreconciled registry double-books write scopes and concurrency slots against
sessions that may still be alive.

1. **Load the mirror.** Every entry that was non-terminal at last write is
   now a *claim*, not a fact: "there was a working session with this
   identity, this process, this write scope."
2. **Verify each claim against reality.** Does the recorded process exist,
   and is it corroborably the same process (identifier reuse again)? For
   stream-attached sessions, can the stream be found or re-opened? Each
   verification has three honest outcomes: **alive → adopt** (re-enter the
   registry as live, re-attach the lifecycle sensors, resume slot
   accounting); **gone → declare** (the session died while unwatched — it
   becomes lost, or is graduated through late-result recovery if its output
   can still be harvested); **ambiguous → quarantine** (a process that might
   be the session but cannot be corroborated is not adopted; it is flagged
   for the orphan policy).
3. **Sweep for ghosts in both directions.** Mirror entries with no living
   counterpart are the common ghost; the rarer and nastier one is the
   inverse — a fleet-looking process with no mirror entry, spawned in the
   gap between process start and first mirror write. The orphan scan owns
   these (see [lifecycle-signals](./lifecycle-signals.md)).
4. **Only then admit new work.** Slots and write scopes are computed from
   the reconciled registry, so nothing new can collide with an adopted
   survivor.

Hibernated entries pass through reconciliation untouched — no process is
expected, so there is nothing to verify beyond the integrity of the stored
context they will need at wake (see
[hibernation-and-resume](./hibernation-and-resume.md)).

## Recovery honesty

Reconciliation is an inference engine, and its output vocabulary must keep
inference distinct from report
([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success)):

- A session adopted alive is *adopted*, and its lineage says so — later
  debugging of that session must know it crossed an orchestrator restart.
- A session declared dead at recovery is *lost-at-recovery*, distinguishable
  from lost-by-sweep and from self-reported failure. These three populations
  have different root causes (orchestrator downtime, signal delivery, the
  session's own work) and only the labels keep them separable.
- **Recovery that finds nothing to recover says so explicitly.** An empty
  mirror and an unreadable mirror are different events; treating a corrupt
  or missing mirror as "fresh start, zero sessions" silently discards the
  fleet. Assert the instrument, then report the result.

## Reads follow the chosen consistency contract

For the in-memory-plus-mirror design, live admission reads the authoritative
registry, and recovery and historical accounting may read its durable mirror.
Queries over lazy fields must name their freshness limits. In a store-authoritative
design, live reads from the store are valid when their isolation meets the admission
contract; they are not forbidden second readers. Retain terminal records for the
declared accounting window and preserve run and incarnation identity.

An ambiguous survivor keeps its claims quarantined until stopped or fenced. A
single controller lock does not prevent a previous controller or remote worker
from continuing after a partition. Recovery must establish current authority before
opening affected resources for dispatch; independent reconciled partitions may
resume earlier if their isolation is established.
