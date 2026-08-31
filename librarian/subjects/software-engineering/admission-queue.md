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

## 2026-08-31 - /intake omniroute

Two techniques and one correction from `github:diegosouzapw/OmniRoute` @ `b7a0c54`, an
OSS LLM gateway. **Both techniques land against something this subject already said**,
which is why they are worth more than additions would have been.

- **`resource-denominated-bounds`** contradicts `depth-bounds-and-shed`'s instruction to
  size the depth bound "under the pessimistic case where every entry is maximal". Right
  arithmetic, wrong unit: pessimistic *count* sizing is exactly what produced the source's
  default cap of 1 and its 503s under ordinary coding-agent load. Denominate in the
  resource, charge each item its real cost, derive the ceiling from the host's own limits,
  and refuse at the door an arrival larger than the whole budget. Closes with the three
  cases where a count is still honest.
- **`speculative-work-admission`** fills a stage the subject never had: the three-verdict
  contract assumes a caller who benefits from *queued*, and for redundant work that verdict
  is the worst one available. Probe non-blocking, skip, release on admit, no wait knob.
  Distinct from `depth-bounds-and-shed`'s fan-out backpressure rule, which is producer-side;
  this is the gate side.
- **`priority-and-fairness` amendment**: the per-origin cap assumed origins are attested and
  never said so. Where the key is caller-minted, per-origin capacity is a multiplier — the
  source shipped it and removed it in #10110. Capacity bounds globally; identity orders the
  line.

Applied same-run to `goat`: `speculative-work-admission` **code / better, shipped**
(`58453a3`) after an A/B on the real prefetch queue across three network tiers — 3g went
52 dispatches/18 useful to 30/30 with zero waste, 4g is a no-op. The arm that *failed* is
the reusable part: skipping every source served 0/6 high-intent prefetches, so the
technique gained a boundary section stating that the arrival's class must be readable by
the gate rather than inferred from load, and that below saturation the rule buys nothing.
`resource-denominated-bounds` came back **unmeasurable** on the same tree with its
instrument named (per-source response size).

## Open leads (banked, with return conditions)

- **Advisory-then-blocking as a gate rollout discipline** — the source ships new gates
  advisory with a named calibration window and a retained artifact before they block.
  Adjacent to `quality-gates/gate-laddering`; return if a second source shows the retained
  calibration artifact, which is the part gate-laddering does not carry.
