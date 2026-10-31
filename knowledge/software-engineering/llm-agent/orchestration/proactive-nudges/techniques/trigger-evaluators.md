---
layer: technique
type: technique
subject: proactive-nudges
technique: trigger-evaluators
status: forged
laws:
  - failure-not-empty-success
shared_with: []
use_when: [deciding whether an evaluator may deliver directly, same condition keeps refiring every tick, quiet week that could be a dead instrument]
---

# Trigger evaluators

The noticing half of a proactive system: a fleet of small judgments that
run on a cadence and answer, each for its own concern, "is there currently
something worth a human's attention?" Everything downstream — budgets,
quiet windows, dedup — assumes evaluators are cheap enough to run eagerly
and safe enough to run unsupervised. That assumption is earned by
contract, not hoped for.

## The evaluator contract

An evaluator is a **pure function over observable state**:

- **Input:** a read-only snapshot of whatever state the evaluator judges —
  open incidents, staleness gauges, pending reviews, accumulated internal
  pressure. The evaluator does not fetch, poll, or await side effects of
  its own; the runner assembles the snapshot once per tick and hands the
  same view to every evaluator. Snapshot collection is itself bounded and
  authorized: the runner reads only the state the recipient has allowed
  proactive evaluation to see, scoped to that recipient and tenant, with
  a size and time limit on assembly. An evaluator can only judge what it
  was handed, which makes the snapshot the place where privacy and cost
  are enforced.
- **Output:** nothing, or a **candidate notice** — kind, subject
  reference, human-readable payload, priority class, and suggested
  expiry. Never a delivery, never a mutation. An evaluator that "just
  sends the notification itself this once" has silently bypassed every
  policy gate the subject exists to enforce; purity is what makes the
  gates structurally unavoidable rather than disciplinary.
- **Determinism modulo state:** same snapshot, same answer. This is what
  makes evaluators testable as table-driven cases and what makes a
  misfire diagnosable — replay the snapshot, watch the judgment. It holds
  only if the clock is part of the snapshot rather than read inside the
  evaluator.

Purity is a contract, not a guarantee most languages give: nothing stops
an evaluator from reading a global or calling out. Hold it by
construction where the language allows (the evaluator receives no handle
to I/O or the delivery path), and by review and tests where it does not.

The candidate's **priority class** deserves emphasis: the evaluator
declares it from a closed set, and downstream policy (quiet-window bypass,
budget lane) keys off the class — the evaluator never gets to say "and
deliver me now." Authors will lobby for higher classes; that pressure is
resolved where the class set is defined, once, not per evaluator.

## Cadence

- **Eager and periodic beats event-perfect.** A tick every few minutes
  that re-derives judgments from current state is simpler and more robust
  than a lattice of change-listeners, and the notice/delivery split means
  eager evaluation costs nothing at the attention layer — noticing often
  is fine when delivering is rationed.
- **Re-evaluation is idempotent by construction.** A condition that stays
  true across ticks produces the same candidate identity each time; the
  dedup layer collapses them. Evaluators therefore never need to remember
  "did I already say this?" — statelessness is preserved because identity
  handles repetition.
- **Ticks are skippable, never queueable.** If a tick overruns or the
  host sleeps, the next tick evaluates current state; missed ticks are
  not replayed. Judgments are about *now* — a backlog of stale
  evaluations is a backlog of stale opinions.
- **That rule covers periodic conditions, not transient events.** A
  condition that stays true ("an incident is open") is still visible at
  the next tick. An event that happens and is gone ("a run finished",
  "a message arrived") is visible only if something recorded it: a
  skipped tick, or a tick that every evaluator passes over, loses it. An
  event kind therefore needs a durable record written by the subsystem
  that produced it (an event row, an outbox, a cursor the evaluator
  advances), so that the evaluator judges a condition — "there are
  unreported events since my cursor" — rather than a moment.

## Evaluator isolation

The fleet fails one at a time or not at all:

- **A throwing evaluator is caught, recorded, and skipped**; its siblings
  run. One broken judgment must not silence the whole proactive surface.
- **A slow evaluator is bounded**; the tick has a deadline per evaluator,
  and a chronically slow one is reported as unhealthy rather than allowed
  to stretch the tick. The deadline bounds how long the runner *waits*;
  it does not stop the evaluator. A timed-out evaluator running on the
  same thread, or a synchronous one that never yields, still holds its
  time and can still finish later. Actually bounding the work needs
  cancellation the evaluator honours, or isolation in a worker that can
  be abandoned or killed, and a late result is discarded, not admitted.
- **Silence is distinguishable from failure**
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  "Ran, found nothing" and "did not run" produce different records. A
  proactive system that went dark looks exactly like a quiet week unless
  each tick asserts the instrument — evaluators consulted, candidates
  produced, errors caught — before reporting the result.

## Decision rules

- One evaluator, one question. An evaluator that checks three conditions
  is three evaluators sharing a crash domain and a name.
- Read state other subsystems maintain; never maintain shadow state to
  evaluate. An evaluator with its own database of "what I think is true"
  drifts from the system of record and nudges about ghosts.
- New evaluators enter behind the same registration door as old ones —
  enumerable, listable, individually disable-able. "What can nudge me?"
  must have a one-glance answer.
