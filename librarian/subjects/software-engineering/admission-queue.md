---
subject: admission-queue
domain: software-engineering
last_touched: 2026-08-31
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

## Applied to the technique layer

- 2026-08-22-6: **vocabulary erasure in transit** (verdict-survives-the-boundary family) applied to `admission-vocabulary` ([[2026-08-22-6]]).
- 2026-08-22-8: `admission-vocabulary` now cites the promoted `verdict-survives-boundary` law ([[2026-08-22-8]]).

## 2026-08-31 — the step trigger, from a systems-database source ([[../../sources/2026-08-31-tigerbeetle]])

`self-paced-intake` landed (6 -> 7 techniques, 2 -> 3 applications). It sits **first** in
the technique list on purpose: it owns the stage before the rest of the subject, which
opens at "requests arrive faster, or lumpier, than the system can execute them" and
never asked whether an arrival should cause a step at all. A per-arrival consumer has no
rate to state, and every bound this subject offers is written against a rate — so the
missing stage was load-bearing for the whole subject rather than an addition beside it.

Corroborated by **cross-run convergence**, at zero fetches: the prior day's Headlong run
landed `engagement-paced-cadence` on `cost-metering` from an agent microharness, and
TIGER_STYLE states the same root for a database ("don't do things directly in reaction
to external events; your program should run at its own pace"). The two are written as
neighbours in both directions — that one paces a loop with *no* external work and must
not bill for idling, this one paces a loop that *does* and must not let arrivals set its
rate. **A third independent sighting would make the root a law**; the lead is banked in
the source note.

Applied same-run to `personas` as a simulation, verdict `better`, proof `structural-only`.
The structural fact: four long-lived consumers, three policies, no rule — and the split
does not track any of the technique's three exemptions. Return condition is an
instrument, not a judgment: the tree counts records dropped when the drain falls behind
but does not emit drain size, so the falsifying measurement (a batch-size distribution
dominated by 1) cannot currently be taken.
