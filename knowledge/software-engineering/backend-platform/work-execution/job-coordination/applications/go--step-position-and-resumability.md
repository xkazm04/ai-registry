---
layer: application
type: application
subject: job-coordination
technique: step-position-and-resumability
stack: go
verified_on: 2026-08-22
---

# Resumable steps in River (Go)

How River — the Postgres/SQLite-backed job queue for Go — realizes
step-position-and-resumability. Citations are against `riverqueue/river` commit
`f748a5c` (2026-08-22), release `v0.44.1` (2026-08-21). The pin lives in prose, not
`verified_against`, because this reconciles an external tree rather than the consumer
repo the sibling `rust--*` applications cite. The feature is ~400 lines: a step API
(`resumable.go`, `resumable_step_tx.go`) plus one middleware added to every client
(`internal/riverplugin/plugin.go` via `DefaultPlugins()`, `client.go:836`). It is
**record-only** — position lives in the job row's `metadata` JSONB — so "resume needs
no witnesses" holds by construction.

## 1. Position is a step name, enforced unique

The frontier `river:resumable_step` is "the last successfully completed step"
(`internal/rivercommon/river_common.go:38-40`), and its value is the step's **name**,
never an ordinal. A worker body is straight-line Go
(`example_resumable_job_test.go:27-46`), so there is no plan to index into. Uniqueness
is enforced at run time: `registerResumableStepName` (`resumable.go:162-170`)
accumulates names into `state.AllStepNames` and turns a repeat into `"river: duplicate
resumable step name %q"`: a shared name would make the frontier ambiguous, so the
ambiguity is refused rather than resolved.

## 2. Re-entry replays the step list and matches by name

Resume is not a jump. The middleware seeds `ResumeMatched: true` unless a recorded
step is present (`plugin.go:37-45`); when one is, every call runs the guard `if
!state.ResumeMatched { if name == state.ResumeStep { … } return }`
(`resumable.go:66-72`), skipping earlier steps by executing nothing. Matching fails
loudly: if the recorded name never matches, the middleware synthesizes `"river:
resumable step %q not found in Worker"` (`plugin.go:62-63`) rather than calling the
job complete — a renamed or deleted step fails the attempt instead of silently
skipping the job's tail.

## 3. The cursor keeps "finished" and "partway" distinguishable

`ResumableStepCursor` (`resumable.go:107-151`) adds position *within* a step: the step
receives a user-typed `TCursor` unmarshaled from `river:resumable_cursor` (`:132-138`)
and calls `ResumableSetCursor` as it advances (`:24-40`, driving the `id <=
cursor.LastProcessedID { continue }` skip in
`example_resumable_cursor_job_test.go:33-51`). Two facts satisfy
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) per step:
a completed cursor step **deletes** its cursor (`:150`), so on resume a
frontier-matching name that still has one is re-executed with it rather than skipped
(`:116-130`). Consumed cursors are cleared with an explicit `nil` (`plugin.go:70-75`).

## 4. Checkpoint ordering — batched by default, per-step only on opt-in

**Default.** Nothing is written when a step succeeds; `ResumableStep` only assigns
`state.CompletedStep` in memory (`resumable.go:83`), and the middleware flushes the
frontier **only on the error path** (`plugin.go:67-77`). That flush rides the *same*
write as the attempt's state transition — one `metadataUpdates` map threads through
execution (`internal/jobexecutor/job_executor.go:186-187`) into the
`JobSetStateIfRunning` params for completed (`:440`), interrupted (`:486`), cancelled
(`:507`) and retryable (`:547`) alike — so position and verdict land atomically.

**The deviation.** The technique checkpoints per step; River checkpoints per
*attempt*, and only when the attempt ends in a *reported* error. Anything ending it
before that write loses the frontier — the lease-expiry path especially. `JobRescuer`
repairs stuck jobs through `JobRescueManyParams`
(`riverdriver/river_driver_interface.go:529-537`) — `ID`, `Error`, `FinalizedAt`,
`ScheduledAt`, `State`, and **no metadata field** — so its verdicts
(`internal/maintenance/job_rescuer.go:265-278`) cannot record a position the dead
executor never persisted: a rescued job restarts from the last frontier an *earlier*
failed attempt wrote, which on a first attempt is step one. River says so itself —
"because it happens out-of-transaction, there's a chance that it doesn't happen in
case of panic or other abrupt termination" (`resumable_step_tx.go:20-24`). The
standard stays.

**The opt-in fix is textbook.** `ResumableSetStepTx` / `ResumableSetStepCursorTx`
(`resumable_step_tx.go:28`, `:45`) write the frontier via `JobUpdate` with
`MetadataDoMerge: true` on the caller's *own* transaction (`:102-107`), so effect and
marker commit or roll back together in one store — the technique's **marker-guarded**
shape, its trap structurally unavailable
(`example_resumable_set_step_tx_test.go:34-63`: work, checkpoint, commit, then fail).
It survives a panic too, writing into the executor's map (`:89-95`) that panic
recovery still returns (`job_executor.go:190-212`), whereas the middleware's
post-`doInner` flush is unwound past and lost.

## 5. Re-run safety is undeclared

Step declarations — naturally idempotent, keyed, marker-guarded, honestly
non-idempotent — have **no representation**. `StepOpts` is `struct{}`, "reserved for
future use" (`resumable.go:42-44`), and the cursor doc pushes it to the author in
prose (`:97-99`). Steps also share nothing but their Go closure — the record holds
only a frontier string and a cursor deleted on completion (`:150`) — "resume needs no
witnesses" passed by *forbidding* witnesses rather than persisting them.

## 6. Lineage, a wart, and a testable resume path

Restart preserves lineage: the claim query increments `attempt` and appends to
`attempted_by` in the same `UPDATE … SET state = 'running'` that wins the job
(`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql:218-231`), and each failure
appends an `AttemptError` carrying that number (`job_executor.go:493-500`). Soft stop
and snooze decline to charge one (`:486`, `:417-419`) while still carrying
`metadataUpdates`, so the frontier survives a graceful deploy
(`example_resumable_job_test.go:33-34`). The wart: written only on error, the frontier
outlives the failure — a job that finally succeeds keeps the last failed attempt's
`river:resumable_step`, so its terminal row reads as though it stopped midway.
Finally, `rivertest.ResumableStepAfter`/`ResumableStepAtCursor`
(`rivertest/resumable.go:20`, `:35`) seed resume metadata on insert, making "resume at
step N" testable without a staged crash — a genuine addition.

## Reconciliation summary

Confirmed: stable step-name position with run-time uniqueness enforcement;
replay-and-match re-entry that errors loudly when the name is gone; cursors that
distinguish finished from partway and clear themselves; position written atomically
with the attempt's verdict; a marker-in-the-same-transaction checkpoint primitive;
restart as the same record with preserved lineage.

Deviations: checkpoint granularity is the attempt, not the step, and only on a
*reported* error, so a crashed or lease-expired executor loses its frontier and the
rescuer cannot recover it; per-step durability is opt-in per call site; steps cannot
declare re-run safety; no per-step outcome or inter-step value on the record; a
completed job retains a stale frontier.

Not present by scope: plan versioning and position migration — with no plan object, a
changed body surfaces only as a missing-step error, while *inserting* a step before
the frontier fails silently. Nor is restart a recorded decision: nothing separates
"resumed" from "restarted from zero".
