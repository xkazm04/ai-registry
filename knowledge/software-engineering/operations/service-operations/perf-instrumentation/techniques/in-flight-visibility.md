---
layer: technique
type: technique
subject: perf-instrumentation
technique: in-flight-visibility
status: forged
laws: [failure-not-empty-success, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a latency window looks healthy while users report hangs, records are written only at settlement, a stall suppresses the very calls that would have measured it]
---

# In-flight visibility

A ring of settled records answers "how long did the calls that *finished*
take?" It is silent on the calls that have not finished, and those are
exactly the ones a hang, a deadlock, or a dead dependency is made of. The
percentile is computed over survivors. The worse the incident, the fewer
records arrive, and a window that stops receiving its slowest members reads
*better* while the product is worse.

Two mechanisms produce the blindness, and they need different repairs.

## Survivorship at settlement

The write-path rule of [ring-buffer-metrics](./ring-buffer-metrics.md) (stamp
the record when the outcome is known) means an operation is invisible from
its start until its end. A call stuck for ten minutes contributes nothing to
p99 for ten minutes. Two properties cap the damage, and both should be stated
rather than assumed:

- **A deadline turns a hang into a record.** If every measured call races a
  timeout, the stuck call settles at the deadline as a timed-out record
  ([semantic-flags-over-heuristics](./semantic-flags-over-heuristics.md)). The
  hang is then visible, but *late by the length of the deadline* and
  *clipped to it*: the recorded duration is the deadline, never the true
  stall. A p99 that pins to the timeout value is the signature of clipping.
- **No deadline, no record.** A call without a deadline that never settles
  never enters the window at all.

The repair is a separate live gauge, kept beside the ring and not inside it:
the **count of in-flight operations and the age of the oldest**, per key from
the same closed vocabulary. It is a counter incremented at start and
decremented at settlement, plus a start timestamp per open call, so it is
bounded by the concurrency the product already has. The panel then carries
"p95 = 240ms over 500 settled, 3 in flight, oldest 41s" and the last clause
is the one that catches the hang. An oldest-age beyond the operation's
deadline is a fault by itself, whatever the percentile says.

## Coordinated omission: the stall suppresses its own samples

The second mechanism is subtler. When a closed loop waits for one call before
issuing the next, a stall of ten seconds costs the window **one** slow sample
where an open arrival stream would have produced ten seconds' worth of
delayed requests. Gil Tene named this *coordinated omission*: the measuring
system coordinates with the measured one and so avoids recording the
outliers. In a product that instruments itself it appears wherever work is
driven by the thread that stalled, such as a poll loop, a queue drained by one
worker, or a UI that issues the next request only after the last render. The
freeze the heartbeat of [continuous-monitors](./continuous-monitors.md)
measures is the same event that silently deleted the calls which would have
been made during it.

Repairs, in order of cost:

- Measure from the **intended** start (the enqueue or scheduled time), not
  the moment the worker got to it, when the queue wait is part of what the
  user experienced. The record then carries both stamps and the derivation
  names which one it used.
- Where the intended time cannot be known, do not repair the percentile;
  **disclose** it. Correlate the window with the freeze records: a window
  overlapping a recorded stall is flagged, not trusted.
- For open-arrival load in a benchmark (as opposed to production
  self-measurement), use a constant-rate generator and record against
  scheduled time.

## What the surface shows

Settled count, in-flight count, oldest in-flight age, and whether durations
are start-to-settle or intended-start-to-settle. Absent in-flight data is
rendered as *unknown*, not as zero in flight
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Boundary

This is a claim about what a window can and cannot see. Whether a slow
request is a failure is the health verdict of
[health-checks](../../health-checks/health-checks.md); this technique only
ensures the distribution is not built from survivors alone.

## Sources

Tene, "Coordinated Omission" (Mechanical Sympathy list) and his talk "How
NOT to Measure Latency"; the wrk2 README, which describes the constant-rate
correction. Read 2026-09-30 through search summaries, not the full texts.
