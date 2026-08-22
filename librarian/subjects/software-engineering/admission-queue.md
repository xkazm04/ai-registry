---
subject: admission-queue
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# admission-queue

First touch: [[2026-08-22-4]], external reconcile against
`kubernetes/apiserver` @ `80186b5` (k8s 1.38 dev line; staging mirror). Gained
`go--priority-and-fairness` — second stack; single-stack debt cleared. Hint
confirmed; the worker's re-check caught itself fabricating an illustrative
numeric, which is the pass at its best.

## Open leads (banked, convergence rule applies)

- Share-based isolation with a floor as a first-class alternative to aging —
  "runs later, never never" without reordering.
- Anti-windup: a non-empty but under-consuming origin must not accumulate
  scheduling credit.
- Occupancy measured in work (seat-seconds), not entries.
- When the fairest-next item cannot be admitted, skip it — or fairness becomes
  head-of-line blocking (deviation observed, instrumented, unrepaired).
- The per-origin starvation instrument must exist in metrics, not only in a
  debug dump; say how to answer the cardinality objection.

## Cross-subject proposals

- The seat abstraction (multi-slot holds, final seat count, latency tail) →
  subprocess-lifecycle/concurrency-and-slots.
- Smoothed-demand bounded fair-share redistribution on a fixed period →
  rate-limiting.
- The reason-labelled rejection counter as an exemplary verdict vocabulary →
  admission-vocabulary (note: the inverse of the wave-1 finding where a
  refusal enum was erased at the boundary — same family, opposite outcome).
