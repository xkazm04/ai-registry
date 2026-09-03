---
subject: fault-signal-propagation
domain: software-engineering
last_touched: 2026-09-02
touched_by: intake
dry_streak: 0
---

# fault-signal-propagation

First touch: 2026-09-02, forged in the intake 2.0.0 handoff over a dataflow runtime
(source note `2026-09-02-dora-v2.md`, design record D5). Category
`backend-platform/process-graph-runtime`. Single-stack (`rust`), born from one
tree - a transplant pass is owed.

## State

6 techniques, 2 applications. Owns the downstream half of supervision: typed edge
events in the consumer's own channel, per-edge deadline arming (the edge side; the
process side lives in `subprocess-lifecycle/liveness-and-heartbeats` and is cited,
not restated), recoverable-versus-closed, last-value degradation, restart
notification scope, and the supervisor's refusal to synthesise terminal replies.

Boundaries drawn: `subprocess-lifecycle` (one supervisor, one child, up to the
verdict), `retry-backoff` (the caller decides whether to call again; here the
consumer is told), `self-healing` (degrading is not repairing).

Deviations recorded against the source tree: the node-side tracker's health enum is
two-valued with no age or unarmed state; a restart flips an edge to healthy on the
announcement, before any post-restart message; the event enum is non-exhaustive so
a new supervision variant is silently ignored; the C binding exposes only a subset of
the event kinds; the on-demand-input exclusion for staleness deadlines is prose with
no validation.

Proposed law from the forger (not added): *a blocking state names its release* -
sighted in the orphaned-broken-record hang here, breaker provenance in
retry-backoff, and reap-is-unconditional in subprocess-lifecycle. Adjacent to
`creation-names-reaper`; needs a third bundle before it is a law.
