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

### 2026-09-17 - `/harvest backlog` wave 4, one technique + one application

`own-writes-are-not-triggers`. Two of the subject's central properties look like they cover a self-triggered loop and do not, and the reason each one misses is worth keeping. **Idempotence here is written about the world**, so a pass that changed nothing outside and still stamped a field has satisfied it and produced a trigger. **Coalescing cannot remove a trigger** - a self-trigger arrives after the pass completed and finds no twin to collapse into; coalescing bounds work per trigger. The third property makes it a trigger-layer problem rather than a pass-layer one: `told-that-not-why` reduces every arrival to a bare key before the queue, which is exactly the deletion of the only field that could say 'this one was mine'. So the exclusion runs at the boundary or it cannot run at all, and a pass that tries to work it out for itself has reintroduced the reason-shaped dependency the collapse exists to prevent. One question picks the remedy: **can a reader tell your output from genuine input, at the read boundary, without asking you?** Yes - filter by an identity the medium maintains. No - claim at the write door, before the write, matched on content, consumed once, expiring with a reaper. The half most often left out of the framing: the damage is **a false count, not only a spin**. Everything reading the change stream treats an arrival as news and acts on it, so the loop reports its own output back to the operator as independent confirmation that the work it did was done - the one failure that survives every retry budget and every cap, because nothing about it looks like a failure.
