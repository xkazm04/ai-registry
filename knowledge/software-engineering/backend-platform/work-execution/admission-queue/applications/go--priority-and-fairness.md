---
layer: application
type: application
subject: admission-queue
technique: priority-and-fairness
stack: go
verified_on: 2026-08-22
---

# Priority and fairness in Kubernetes API Priority and Fairness (Go)

How the Kubernetes apiserver's APF subsystem realizes this technique. Citations are against
`kubernetes/apiserver` — the published staging mirror of `k8s.io/apiserver` inside
`kubernetes/kubernetes`, so these files are read-only copies whose changes land upstream —
branch `master` at commit `80186b5` (2026-07-28), the Kubernetes 1.38 line shortly before
`v0.38.0-alpha.0`. Paths are relative to `pkg/util/flowcontrol/`. Pinned in prose rather than
`verified_against` because this reconciles an external tree. APF separates the technique's two
halves and names them: **priority levels** arbitrate urgency between classes, **flow schemas**
plus shuffle-sharded fair queuing arbitrate occupancy between origins inside one class.

## 1. The classification authority is a cluster API object

Each request is matched against `FlowSchema` objects sorted by `MatchingPrecedence` then by name
(`pkg/util/apihelpers/helpers.go:95-102`); first match wins (`apf_controller.go:1030-1038`) and
the schema names the level (`:1053`). Two schemas are undeletable — `exempt` prepended,
`catch-all` appended, re-inserted if an operator removes them (`:786-792`) — and an unmatched
request falls back to catch-all with a warning, or panics if even that is gone (`:1044-1051`).
Levels are few and named for meaning: `system`, `node-high`, `leader-election`, `workload-high`,
`workload-low`, `global-default`, plus mandatory `exempt` and `catch-all`
(`pkg/apis/flowcontrol/bootstrap/default.go:169-274`) — a declarative, versioned, cluster-scoped
mapping with no numeric scale to inflate.

## 2. Priority is a concurrency share, not a strict order — so nothing starves

APF never puts two levels in one line. Each owns a `QueueSet` with its own limit,
`ceil(serverConcurrencyLimit × NominalConcurrencyShares / shareSum)` (`apf_controller.go:863`),
and lends and borrows around it: `minCL = nominal − lendable`, `maxCL = nominal + borrowing`
(`:866-872`, `:876-878`); `LendablePercent` is per-level policy — 33% for `system`, 90% for
`workload-low` (`bootstrap/default.go:174-175`, `:245-246`).

Every 10 seconds (`apf_controller.go:79`) `updateBorrowingLocked` re-solves a small
optimization: each level's target is its **smoothed** seat demand (exponential decay,
coefficient `0.977`, 5-minute half-life, `:84-88`), floor `max(minCL, min(nominalCL, demand
high-watermark))`, ceiling `maxCL` (`:420-427`); `computeConcurrencyAllocation` returns the
unique allocation summing to the server limit where every level gets `fairProp × target` unless
clamped by its own bound (`conc_alloc.go:110-119`). Exempt levels come off the top first
(`:410-413`).

This reaches the technique's starvation repair by a road other than aging: since a level's floor
never drops below `minCL`, a busy `system` cannot reduce `workload-low` to zero however long the
pressure lasts — "low priority" means "runs slower", never "may never run". Under server-wide
starvation the allocator degrades toward the floors and publishes `seat_fair_frac` as 0 rather
than failing (`:439-443`). Interaction between levels stops there: "Some day we may have
connections between priority levels, but today is not that day"
(`fairqueuing/interface.go:57-58`).

## 3. Fairness inside a level: shuffle sharding onto virtual time

The origin is the **flow** — `(flow schema, flow distinguisher)`, the distinguisher being the
requesting user or the target namespace as the schema declares (`apf_controller.go:1116-1129`),
hashed `sha256(fsName ‖ 0x00 ‖ distinguisher)` truncated to 64 bits (`:1131-1139`) and computed
only where the level has more than one queue (`:1062-1065`). That hash deals a *hand* —
`HandSize` 6, from 64 queues for `system` and 128 for the workload levels
(`bootstrap/default.go:179-181`, `:232-234`, `:250-252`) — and the request joins the queue in
the hand holding the least **total work in seat-seconds**, not the shortest
(`fairqueuing/queueset/queueset.go:583-612`, choice at `:600-605`). The hand is visited from a
rotating offset `qs.enqueues % handSize` (`:589-590`), explicitly to de-bias flows with
overlapping hands (`:585-586`), and occupancy is measured in work rather than entries — "cap the
occupancy, not the submission" made continuous.

Dispatch is weighted fair queuing on a virtual clock. Virtual time advances at `min(seats
requested, concurrency limit) / active queues` per real nanosecond (`:526-541`); each queue
carries `nextDispatchR`, set to current virtual time when it wakes from empty (`:635-641`) and
advanced by the dispatched request's estimated work (`:741`); the dispatcher scans round-robin
for the queue whose head has the smallest virtual finish time (`:785-803`), then parks the index
there so ties go to the *others* next time (`:834-837`). On completion `nextDispatchR` is
corrected by estimated-minus-actual service time (`:932-939`), so an overrunning flow gets no
silent free share. Sharpest of all is anti-windup: a queue that cannot use its allocation but
never goes empty would accumulate an ever-earlier `nextDispatchR` and bank unbounded credit, so
virtual-world dispatch is forbidden to precede arrival (`boundNextDispatchLocked`, `:945-964`).

## 4. Identity survives the reordering

Nothing here is addressed by position. Removal is a **closure returned by `Enqueue`** capturing
its own list element (`fairqueuing/queueset/fifo_list.go:91-104`), stored on the request
(`fairqueuing/queueset/types.go:70-72`). Cancellation reaches the entry's own write-once
promise, resolved by a dispatch decision or the request context's `Done()`, whichever comes
first (`fairqueuing/promise/promise.go:42-61`) — a disconnecting client reaches *its* entry,
never whoever now stands in that slot, and eviction re-applies anti-windup
(`queueset.go:426-439`). A second `Wait` on one entry is logged as impossible (`:407-412`).

## 5. Deviations

- **The cap is re-read live, not snapshotted at enqueue.** The dispatch loop reads
  `qs.dCfg.ConcurrencyLimit` every iteration (`queueset.go:654-657`, `:748-769`) and that limit
  is *replaced* every 10 seconds by the borrowing controller (`apf_controller.go:494`), so an
  entry admitted while its level borrowed toward `maxCL` can be promoted after the allocation is
  cut back toward `minCL`. Borrowing cannot work against frozen limits, but the consequence
  stands: promotion order depends on config timing, with no compensating rule.
  `QueueLengthLimit` is likewise read at rejection time (`:618-629`).
- **Wide requests can starve, and the code knows it.** A request needing more seats than its
  level's whole limit is dispatchable only when the level is completely idle
  (`canAccommodateSeatsLocked:753-763`), marked `TODO: this is a quick fix for now`. Worse, when
  the minimum-virtual-finish queue's head cannot be accommodated,
  `findDispatchQueueToBoundLocked` returns `nil, nil` (`:811-821`) and
  `dispatchAsMuchAsPossibleLocked` stops entirely — head-of-line blocking across *all* queues in
  the level. The instrument exists (`request_dispatch_no_accommodation_total`,
  `metrics/metrics.go:314-315`); the repair does not, and in-queue aging would supply it.
- **Per-origin fairness is unobservable in metrics.** Every APF metric is labelled
  `(priority_level, flow_schema)` and none carries the flow distinguisher —
  `current_inqueue_requests` (`metrics/metrics.go:203-212`), `request_wait_duration_seconds`
  (`:254-263`), `rejected_requests_total` (`:91-100`, whose `reason` label is a good verdict
  vocabulary: `concurrency-limit`, `queue-full`, `time-out`, set at `queueset.go:321`, `:340`,
  `:433`). The starvation test — oldest-wait *per origin* — therefore cannot be run from
  metrics; one user monopolizing a queue looks identical to an evenly loaded schema. The
  cardinality reason is sound; the gap is answered by three unlisted debug endpoints dumping
  per-queue contents down to the username (`apf_controller_debug.go:43-47`, `:150-171`) — an
  operator tool, not a signal.

## Reconciliation summary

Confirmed: one declarative classification authority with undeletable first/last schemas;
occupancy capped in work rather than entries; shuffle sharding with de-biased hand traversal;
weighted fair queuing on virtual time with service-time repayment; anti-windup so idle origins
bank no credit; inter-level starvation foreclosed by lending floors rather than aging;
position-free entry identity. Deviations: limits re-read live instead of snapshotted at enqueue;
wide requests head-of-line block the whole level, instrumented but unrepaired; fairness
telemetry stops at the flow schema. Not present by scope: logical-request dedup identity (HTTP
carries no such id) and in-queue aging, absent by construction since each flow queue is strict
FIFO.
