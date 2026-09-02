---
subject: correlated-exchange-over-broadcast
domain: software-engineering
last_touched: 2026-09-02
touched_by: intake
dry_streak: 0
---

# correlated-exchange-over-broadcast

First touch: 2026-09-02, forged in the intake 2.0.0 handoff over a dataflow runtime
(source note `2026-09-02-dora-v2.md`, design record D1). Category
`backend-platform/process-graph-runtime`. Single-stack (`rust`); a transplant pass
is owed.

## State

6 techniques, 2 applications. Owns request/reply, goal/feedback/result and
session/segment/chunk exchanges built as metadata conventions on an ordinary
broadcast bus: one key vocabulary from which every layer's predicate is derived,
an enumerated terminal-status set matched case-sensitively, the passthrough
buffered wait (absolute deadline for the whole wait; report-once for control
events), orphaned correlations on peer restart as an outcome distinct from
timeout, reply fan-out filtering, and the binding parity floor (a metadata-only
pattern is portable exactly to bindings that expose metadata on send and receive;
in the control plane, commit a mutation only on its own typed reply variant).

Boundaries drawn: `realtime-events` (owns the closed vocabulary of facts and refuses
the emitter-expects-an-answer case, which this subject takes over a broadcast
transport), `ipc-contract` (one door with call-and-return; here no call primitive
and no single door), `delivery-guarantees` (whether delivered; here whether the
waiting endpoint can still recognise the answer).

Upward lessons folded in: a correlated edge carries heterogeneous payloads, so
static per-edge type checks and schema-caching decoders exempt correlated traffic
on three paths; the echo obligation and internal-key stripping are one rule seen
twice; a sixth outcome (argument rejected, nothing awaited) is needed at a binding
boundary.

Deviations recorded: the source's parity table covers one binding and reads as
universal; the deadline-plus-restart-watch discipline lives only inside two
helpers; daemon-side synthesis of terminal events is deferred. Nuance for the
design record: Python's gap is send-half *helpers* with a full metadata surface,
not send-half capability; C has no surface in either direction.

Proposed law from the forger (not added): *borrowed-stream-is-returned* - a
component reading a shared stream for its own purpose owes back everything it did
not consume, in arrival order; three sightings, one in realtime-events.
