---
subject: convergence-loop-and-requeue
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# convergence-loop-and-requeue

Born 2026-09-03 from `/intake` run `intake-kube-0903` (intake 2.3.1, round 5, all workers
Opus): forged from design entries A1 and A2 of a control-plane client library (the
reconciler is told THAT, never WHY; one slot per key with earliest-wins, in-flight parking,
trailing debounce and a global cap) plus the DC7 promotion, queue-time coalescing being
absent from `concurrency-guards`. Second subject of `operations/control-plane-operations`.
Boundaries first: `concurrency-guards` owns exclusion and this subject composes it into a
queue; `job-coordination` and `delivery-guarantees` own durable work, every queue here is
in-memory and re-derivable; `retry-backoff` owns classification, this subject owns only
the seam shape; `fleet-orchestration`'s "signals first, sweeper second" is the same
doctrine one level up. Techniques: `told-that-not-why`, `keyed-queue-with-earliest-wins`,
`per-key-exclusion-under-a-global-cap`, `error-policy-as-a-separate-function`,
`drain-a-derived-queue` (renamed from `graceful-drain` because `admission-queue` already
owns generic drain; the discriminator is that every entry is reconstructible from held
state, which is also the test that tells a converger it has grown durable state).
Director review: gate green, purity clean, `use_when` on all five, the `#[cfg(test)]`
gate on `contains_pending` at `scheduler.rs:250` opened and read. Fleet: pumper's
scheduler is the nearest instance, named only in the application; a peer study went to
pumper this run. Deviations for the backlog: no bound on distinct waiting keys; the
debounce permanent-hide hazard has no ceiling; the three-population split is unmeasurable
in production; the requeue channel deadlock is guarded by a test not structure; no
give-up verdict distinct from await-change.
