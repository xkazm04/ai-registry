---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: dual-clock-event-time
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [choosing which timestamp a budget window keys on, designing an event schema that accepts client-reported times, debugging why a rolling limit admitted traffic it should have blocked]
---

# Dual-clock event time

Every ingested call event carries **two** timestamps, and the technique is
refusing to let either do the other's job.

- **Event time** (`ts` by convention): when the call happened, *as the client
  reports it*. The client owns this field outright — it may be seconds late
  (network), hours late (offline buffering, batch replay), or simply wrong
  (a bad clock). It is the timestamp humans debug with, so it drives every
  read that reconstructs what happened: listings, time-range filters, trace
  assembly, "what ran at 3am".
- **Receipt time** (`received_at` by convention): when the receiving API
  accepted the call. The server stamps it from its own clock; it is never
  read from the request body. It drives every read that *counts money or
  enforces policy*: rolling budget windows, limit admission, cap status,
  daily forecast series.

## Why the split is not optional

The tempting simplification — one timestamp — forces a choice between two
corruptions. Key accounting on client time and a single skewed clock in the
fleet silently corrupts enforcement: a client reporting yesterday's date
slides its spend out of the current window, a client reporting the future
parks spend where no window will ever look, and neither produces an error
anywhere. Key debugging on server time and offline-buffered traffic
collapses onto its upload moment: a trace that ran over ten minutes appears
to have happened in one burst, ordering inside it is lost, and "what
happened at 3am" returns what was *uploaded* at 3am.

The decision rule: **any read whose output feeds a budget, cap, admission
decision, or spend series keys on receipt time; any read whose output a
human interprets as event history keys on event time.** When a new read is
ambiguous, ask whether a wrong client clock should be able to change its
answer. If no, receipt time.

## Ownership is enforced, not documented

Receipt time being server-owned must be a property of the deserialization
path, not a comment: the field is skipped on deserialization (or overwritten
unconditionally at the ingest door), so a client that includes it in the
body changes nothing. Test this explicitly — send a body with both
timestamps backdated decades and assert event time round-trips while receipt
time is fresh. Without that enforcement the whole trust fix is one JSON key
away from bypassed. On reads, receipt time *is* serialized: consumers of the
record are entitled to see the accounting clock, they just may not set it.

## The backfill sentinel

The split usually arrives after rows already exist. Those rows have no
receipt time; leaving it NULL makes every windowed aggregate over history
either crash or silently skip. The correct migration backfills
`received_at = ts` — the best available estimate — and *documents that
sentinel*, because for backfilled rows the two clocks are definitionally
equal and any skew analysis over them is fiction. A reader who knows the
migration date can partition "measured receipt" from "assumed receipt";
a reader who does not has been lied to by an unremarkable-looking column.

## What this technique does not do

It does not validate event time — a client may still report a timestamp so
wrong that time-ordered reads over it become fiction; bounding that is
[ingest-skew-rejection](ingest-skew-rejection.md), a data-quality concern
that exists *even though* accounting no longer depends on the client clock.
And it does not extend to a third clock: resist adding "processed_at",
"indexed_at" and friends to the canonical record. Two clocks have two
distinct constituencies (humans and accounting); pipeline-internal latencies
belong in the pipeline's own telemetry, not on every row forever.
