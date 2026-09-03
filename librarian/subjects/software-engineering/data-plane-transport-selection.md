---
subject: data-plane-transport-selection
domain: software-engineering
last_touched: 2026-09-02
touched_by: intake
dry_streak: 0
---

# data-plane-transport-selection

First touch: 2026-09-02, forged in the intake 2.0.0 handoff over a dataflow runtime
(source note `2026-09-02-dora-v2.md`, design record D2 with the scouts' route-probe
and policy-demotes-transport corrections). Category
`backend-platform/process-graph-runtime`. Single-stack (`rust`); a transplant pass
is owed.

## State

6 techniques, 2 applications. Owns the per-message and per-edge choice between a
brokered path and a direct peer path: the size threshold set at the page,
route-probe-then-freeze (a bounded grace from the readiness barrier, after which
an un-acked output rides the brokered path for the run), policy-demotes-transport
(a declared deadline pins the edge to the path that refreshes it), moved-payload
has no fallback (the fallback for a large payload that missed the pool is the
brokered path, not a copy on the fast path - an above-limit message fragments and
is silently discarded while the send reports success), path-divergence audit, and
control-plane-off-the-data-path (a critical lifecycle event is offloaded to a
detached task, never awaited on the loop and never dropped).

Boundaries drawn: `stream-proxy-hop` (the relay you add versus the mediator you
leave out), `ci-execution-trust` (a trust split versus a throughput-and-guarantee
split), `subprocess-lifecycle` (the peers; this begins once both are ready),
sibling `edge-queue-policy` (the queue's policy is theirs; discovering that a
transport bypasses the queue is this subject's).

Forger override, recorded: the golden path is 307 lines against the brief's
120-220, argued from the corpus distribution (median 236, p90 325 across 162
golden paths). Accepted; the brief's number is stale and is filed as a lesson.

Deviations recorded: no per-edge route is queryable as run state; demotions are
not counted by cause; the drain channel and the handler ceiling log but do not
count.

Proposed law (third sighting across this wave, not added): *a guarantee stated
for one path must be re-proved on every other path a message can take, or
documented as lost*.
