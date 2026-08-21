---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: async-run-queue-with-cancel
status: forged
laws: [statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [benchmark runs must not block ingestion, a paid long-running run needs a stop button, distinguishing a crashed worker from a failed run]
---

# Async run queue with cancel

A benchmark run is minutes to hours of paid, long-running work, and the same
system is usually ingesting production telemetry on the same process budget.
The two must never contend: runs go onto a **job queue** — enqueue returns
immediately, a worker loop claims and executes — and because the work is
paid and slow, the queue owes the operator three things a fire-and-forget
task runner does not: live progress, a race-safe cancel, and failure
accounting that tells a crashed worker apart from a failing run.

## The queue

- **One atomic claim.** A worker claims a queued job in a single atomic
  statement that flips it to running and stamps the claim time. Two workers
  polling the same queue must be unable to both win; everything else about
  the design follows from keeping the claim one statement.
- **Stale reclaim.** A running job whose claim time has gone stale (the
  worker died) returns to claimability — with the reclaim *counted* and the
  death recorded as its own kind of event, distinct from a run failure.
- **Concurrency cap.** Judge and generation calls stampede a provider's
  rate limits fast; the worker bounds its parallelism rather than letting
  queue depth set the request rate.
- **Progress is a live field, not a log line.** The worker publishes
  cases-done over cases-planned with an ETA as it goes (throttled — one
  write per couple of seconds), replacing the single "running" string
  written at claim time. An operator deciding whether to cancel needs to
  know if the run is 5% or 95% done.

## Cancel, race-safely

Cancellation is where queue designs quietly rot, because it races the claim
machinery:

1. A **queued** job cancels outright — it never started, nothing to unwind.
2. A **running** job moves to an intermediate **cancelling** state; its
   worker observes the flag and stops at the next **case boundary** — never
   mid-call, for the same reason the budget ceiling never kills a call in
   flight: the call is already paid for.
3. **Cancelling is outside the claimable set.** This is the load-bearing
   detail: the stale-reclaim path selects on "running and stale", so a
   cancelled runaway whose worker died can never be handed to the next
   worker as fresh work. Without this, cancel works in the demo and fails
   exactly when a worker crashes mid-cancel.
4. **Cancelling a terminal job is a conflict error, not a silent success.**
   "It was already done" and "I stopped it" are different facts; an API
   that returns success for both teaches operators nothing reliable.
5. **A backend that cannot cancel atomically says unsupported** — an honest
   refusal, never a pretend-cancel that leaves the worker spending.

Partial results from a cancelled run are kept and marked, exactly as with a
budget halt: the report carries cancelled/partial with planned-versus-done
counts, and every consumer — gates first — treats the run as unverified,
never passing.

## Failure accounting: three counters, not one

A single "attempts" counter conflates three different stories, and the
conflation has a real cost: a job whose worker crashed three times used to
exhaust its retry budget with the *crash* recorded as the run's error. Keep
three counters — claims (crashes included), worker deaths (stale reclaims,
each stamping a "worker lost" marker), and actual run failures — and make
**run failures the retry budget**. An operator reading the job then knows
which of "the benchmark is broken" and "the infrastructure is flaky" is
happening, and infrastructure flakiness does not eat the benchmark's
retries.

## Recurrence without a scheduler

Continuous monitoring wants the same benchmark re-run on an interval, and
the queue already has everything needed: a sweep marks a benchmark *due*
when it has an interval configured, no queued or running job already, and
its latest run is older than the interval — then enqueues a perfectly
ordinary job. The due-check makes the sweep **idempotent**: running it too
often is harmless, sweeps never pile up jobs, and an external cron driving
"one sweep + one claim" is a full substitute for a resident daemon. Enqueue
paths stay unified — manual, version-cut-triggered, and recurring runs are
the same job type through the same worker.

## Decision rules

- **When a gate will compare a queued run against a stored baseline, pin the
  queued path to the baseline's method** (e.g. unbatched judging) — the
  queue must not introduce a method delta the gate then reads as quality.
- **When queue depth grows, add workers before raising per-worker
  concurrency** — the claim is already atomic; provider rate limits are the
  contended resource.
- **When a job fails validation before any paid call, fail it without
  consuming a retry** — retries exist for transient trouble, not for a
  malformed payload that will fail identically five times.

## When not to use it

An ad-hoc, interactive scoring of a handful of cases wants a synchronous
call with a spinner, not a queue — the queue's ceremony is for runs long
enough to outlive an operator's attention or expensive enough to need a
stop button. The moment either becomes true, enqueue.
