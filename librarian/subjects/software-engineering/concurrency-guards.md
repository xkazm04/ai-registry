---
subject: concurrency-guards
domain: software-engineering
last_touched: 2026-08-27
touched_by: intake
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

## 2026-08-27 - intake, [[2026-08-27-picomq-durable-streams]]

Two amendments from one open-source stream engine. No new techniques; both
findings had homes that already existed and were incomplete rather than
absent.

**`single-flight-primitives` was enumerating wrong.** Its second-caller list
(refuse / join / queue / coalesce) closes by telling the reader to pick one
explicitly per operation - which makes an incomplete list consequential
rather than cosmetic. **Merge** is a fifth: N callers with *distinct*
payloads satisfied by one execution, each getting its own outcome. Join
returns one shared result to callers who wanted the same thing; coalesce
keeps the last arrival and discards the rest as waste; merge discards nothing
and duplicates nothing, and is the only policy that lowers the *cost* of the
guarded operation rather than its frequency. Landed with a window-closing
section: the batch can self-close on the previous execution finishing - no
timer, no tuning, no added latency for a lone caller - **only while
executions are serial.** Pipeline them and there is no single previous
execution to close against, so an explicit timer has to come back. Buffer
bounded with a distinguishable over-capacity refusal.

**`cross-process-exclusion` treats the cost of a duplicate as a measured
input.** Amendment: that cost can be engineered. Route every effect the
holder produces through a shared serialization point and the lease demotes
from safety mechanism to availability knob - which changes what its TTL has
to be defended against, and should be stated so a reader can tell which kind
of lease they are looking at. Two conditions written down because neither
survives assumption: no side-channel writes past the door, and the holder
worklist living in shared state rather than in process memory. Weakest of the
run - the premise is already owned by `idempotency-by-design`; the increment
is the consequence for lease sizing.

## Open leads from this run

- **Classify what a stale view decides: speed or correctness.** Only
  correctness decisions need freshness; they get a fence at the write site
  instead of a fresher view. The fencing half is already owned here - the
  classification framing is not, and reads as doctrine rather than technique.
  One sighting. **Return on a second independent one**, then propose at
  doctrine level rather than as a technique.
