---
subject: concurrency-guards
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# concurrency-guards

First touch: [[2026-08-22-7]], external reconcile against `golang/sync`
@ `3ffd83c` (v0.22.0 era). Gained `go--release-guarantees` (uncovered) -
second stack; single-stack debt cleared. Hint confirmed; the worker's re-check
caught itself inverting a test's meaning and fixed it against the assertion.

## Open leads (banked, convergence rule applies)

- Any manual/out-of-band release door makes identity-checked eviction
  mandatory - the incumbent is then guaranteed to outlive its own entry.
- The enemy list should split panic from abrupt-thread-exit; they need
  different waiter treatment.
- The release must decide what the waiters GET - replay the failure, crash
  loudly, or release-and-stay-silent - and the unstated choice becomes the
  wedge.
- An acquisition that can never be satisfied belongs on the enemy list;
  failing fast is a release-design decision.

## Cross-subject proposals

- The joiner reaps the scope it created (Wait-calls-cancel) -> scheduling /
  background-jobs.
- Deliberate head-of-line blocking to prevent large-request starvation ->
  admission-queue territory; note it is the OPPOSITE trade to the one the
  API-server reconcile flagged as a deviation - the two documents together
  frame the real design choice.
