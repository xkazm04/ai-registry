---
domain: game-production
subject: gameplay-runtime-patterns
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# gameplay-runtime-patterns

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/gameplay-runtime-patterns",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a99bcb39c2452dd4",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "A measured worst frame is not a worst-case guarantee. Separate immutable setup from per-use reset and handle late callbacks, generation identity, cache invalidation and scratch-buffer ownership. Profile-derived savings remain estimates until measured.",
    "Data-driven behavior does not require exactly one runtime class. Schema validation, required versus optional defaults and composition order still matter; data may encode behavior without eliminating all useful types.",
    "Pattern forces are not an exhaustive vocabulary. Planned performance requirements and costly single queries can justify a pattern; removal should follow dependency review, not the disappearance of one measured symptom."
  ],
  "sources": [
    {
      "url": "https://gameprogrammingpatterns.com/event-queue.html",
      "scope": "Original-author search evidence on event queues; direct open failed. Used as supporting context only; the known-receiver/deferred-execution counterexample is explicit in the repaired technique."
    }
  ],
  "documents": {
    "gameplay-runtime-patterns.md": {
      "disposition": "reverify",
      "reason": "Reverify single-force pattern selection, universal pooling thresholds, event timing versus receiver coupling and deterministic-replay claims. The event technique is repaired; related golden-path claims still need reconciliation."
    },
    "techniques/allocation-discipline-in-the-hot-path.md": {
      "disposition": "reverify",
      "reason": "A measured worst frame is not a worst-case guarantee. Separate immutable setup from per-use reset and handle late callbacks, generation identity, cache invalidation and scratch-buffer ownership. Profile-derived savings remain estimates until measured."
    },
    "techniques/data-driven-type-objects-over-subclass-growth.md": {
      "disposition": "reverify",
      "reason": "Data-driven behavior does not require exactly one runtime class. Schema validation, required versus optional defaults and composition order still matter; data may encode behavior without eliminating all useful types."
    },
    "techniques/event-dispatch-versus-direct-call.md": {
      "disposition": "clarify",
      "reason": "Repaired selection around independent timing and coupling requirements, including queued commands to a known receiver, synchronous subscription, ownership and explicit overload handling."
    },
    "techniques/pattern-selection-by-force-present.md": {
      "disposition": "reverify",
      "reason": "Pattern forces are not an exhaustive vocabulary. Planned performance requirements and costly single queries can justify a pattern; removal should follow dependency review, not the disappearance of one measured symptom."
    },
    "techniques/spatial-partitioning-threshold.md": {
      "disposition": "reverify",
      "reason": "Spatial indexes can accelerate a single linear scan as well as all-pairs work. Dense overlap can still require quadratic output, so changing tree type cannot guarantee the claimed bound; benchmark actual workload and hardware."
    },
    "techniques/update-order-and-frame-coherence.md": {
      "disposition": "reverify",
      "reason": "Double buffering does not make all side effects commutative. Specify deterministic reductions, random streams, thread and floating-point behavior, mutation semantics and backlog policy; two matching runs are bounded evidence."
    },
    "applications/node--allocation-discipline-in-the-hot-path.md": {
      "disposition": "reverify",
      "reason": "Historical tick measurements were not rerun. An empty own override can inherit base-class work; identify the measured scope and distinguish estimated eliminated cost from observed savings. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--pattern-selection-by-force-present.md": {
      "disposition": "reverify",
      "reason": "Historical force inventory was not rerun. A shorter justification list is not evidence of correct pattern selection; inspect supported workload and removal dependencies. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```
