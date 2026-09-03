---
layer: application
type: application
subject: convergence-loop-and-requeue
technique: keyed-queue-with-earliest-wins
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# A deduplicating delay queue in Rust: `kube-rs/kube`

The Kubernetes controller runtime published as the `kube-runtime` crate of
[`kube-rs/kube`](https://github.com/kube-rs/kube) realizes this technique almost
line for line. Citations below were re-opened at commit
`7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`; the workspace declares
`rust-version = "1.89.0"` and `edition = "2024"` at `Cargo.toml:26-27`, which is
the version witness behind `verified_against`.

## The structure: a delay queue plus a map, not a channel

`kube-runtime/src/scheduler.rs:44-59` holds the whole technique in four fields:

- `queue: DelayQueue<T>` — the timer, from `tokio-util`;
- `scheduled: HashMap<T, ScheduledEntry>` — the key-to-entry map, documented at
  `:47` as *"considered to hold the 'canonical' representation of the
  message"*, with the delay queue holding only a handle back into it;
- `pending: HashSet<T>` — the parked set, described at `:49` as *"Messages that
  are scheduled to have happened, but have been held"*;
- `debounce: Duration` — with a doc comment at `:54-58` that states the trailing
  form exactly: the debounce *"is added to the request's initial expiration
  time. If another request with the same message arrives before the request
  expires, its added to the new request's expiration time."*

The generic parameter `T` is the key. In the controller it is
`ReconcileRequest<K>` (`kube-runtime/src/controller/mod.rs:310-316`), whose
`reason` field is annotated `#[educe(PartialEq(ignore), Hash(ignore))]` at
`:313-315` — so the
reason rides along for tracing and is invisible to the map. The note above the
type says the consequence out loud at `:298-302`: *"an object can only occupy one
scheduler slot, even if it has been scheduled for multiple reasons. In this case,
only *the first* reason is stored."*

## Earliest-wins, in four branches

`schedule_message` at `scheduler.rs:78-110` is the technique's decision table:

1. `:79-82` — if the key is in `pending`, **return immediately**. The comment is
   *"Message is already pending, so we can't even expedite it"*: a second arrival
   for a parked key is dropped, because the pass it is waiting for has not
   started.
2. `:83-88` — compute the entry's time as `run_at + debounce`, then
   `time.min(max_schedule_time())`. The clamp carries its own provenance inline:
   *"Clamp `time` to avoid [`DelayQueue`] panic"*, citing issue 1772, and
   `max_schedule_time()` at `:296-301` derives the ceiling from the timer's
   documented limit with the margin written beside it — *"panics when trying to
   schedule an event further than 2 years into the future… We limit all scheduled
   durations to 6 months to stay well clear of that limit."* That is
   `limits-are-derived` implemented rather than described.
3. `:93-99` — an occupied entry whose stored `run_at` is at or after the new
   request's time is **moved earlier** via `queue.reset_at`, and the map entry is
   re-keyed. No second entry is inserted.
4. `:100-102` — an occupied entry that will already run *before* the new request
   ignores the request entirely.

The four tests at `:425-539` pin the behaviour by name:
`scheduler_dedupe_should_keep_earlier_item`,
`scheduler_dedupe_should_replace_later_item`,
`scheduler_should_overwrite_message_with_soonest_version` and
`scheduler_should_not_overwrite_message_with_later_version`. They use a
deliberately constructed key type — `SingletonMessage` at `:321-324`, whose
payload is excluded from `PartialEq` and `Hash` — so the tests exercise
"same key, different content", which is precisely the reason-erasure case.

## Parking behind an in-flight twin

The parked set is filled in two places. `poll_pop_queue_message` at `:115-138`
pops an expired key and, if a caller-supplied predicate refuses it, inserts it
into `pending` and keeps draining the timer rather than blocking — the test
`scheduler_pending_message_should_not_block_head_of_line` at `:378-398` is the
regression guard. `pop_queue_message_into_pending` at `:141-150` moves *every*
expired key into `pending` without executing any, which is what the runner calls
while it is saturated or not yet ready.

The predicate that implements exclusion is one line in the runner:
`hold_unless(|msg| !slots.contains_key(msg))` at
`kube-runtime/src/controller/runner.rs:129-132`, where `slots` is the map of
in-flight passes. Exclusion is therefore a property of the queue's consumer, not
something a reconciler acquires — matching the technique's rule — and the runner
asserts it can never be violated at `:136-139`, panicking with *"Runner tried to
replace a running future.. please report this as a kube-rs bug!"* rather than
silently overwriting.

## Debounce, and the hazard documented where the knob is

`debounced_scheduler` at `scheduler.rs:289-294` is the constructor;
`Config::debounce` at `controller/mod.rs:588-600` is the user-facing knob, and
its doc comment carries the hazard this technique demands be written beside it:

> **Warning**: This option delays (and keeps delaying) reconcile requests for
> objects while the object is updated. It can **permanently hide** updates from
> your reconciler if set too high on objects that are updated frequently (like
> nodes).

Two tests cover the two halves: `scheduler_should_add_debounce_to_a_request`
(`:542-561`) proves the delay is added rather than substituted, and
`scheduler_should_dedup_message_within_debounce_period` (`:563-596`) proves a
second arrival inside the window extends the entry rather than creating one.

## Where the tree deviates from the standard

- **The queue's key population is unbounded.** Nothing in `scheduler.rs` caps how
  many distinct keys may wait; the only bound is the global execution cap in the
  runner. For a controller this is defensible — the key population is the object
  population, which the server already bounds — but it means the technique's
  companion bound from `admission-queue`'s depth discipline is simply absent, and
  a trigger source that can mint unbounded distinct keys would have no gate.
- **Debounce is per scheduler, never per key**, exactly as the technique
  predicts, and there is no ceiling relating it to any watched object's update
  rate. The hazard is documented; the guard is not.
- **The three populations are not exposed as metrics.** `scheduled`, `pending`
  and the runner's `slots` are private fields; `contains_pending` at `:249-252`
  is `#[cfg(test)]`. An operator cannot ask this queue how much is waiting versus
  parked, which is the measurement `per-key-exclusion-under-a-global-cap` asks
  for.
- **The requeue channel is bounded at 100** (`APPLIER_REQUEUE_BUF_SIZE`,
  `controller/mod.rs:384`) and a completing pass writes into it. The deadlock
  this can cause is real and was one — issue 926 — and the fix lives as the test
  `applier_must_not_deadlock_if_reschedule_buffer_fills`
  (`controller/mod.rs:1778-1839`), which floods the path with 5,000 objects
  requeueing at zero delay. It is cited here because the test is the evidence for
  the technique's companion rule that the requeue path must never be able to
  block the consumer that drains it.

## The fleet counterpart, and why it is not a copy

`pumper`'s cron scheduler is the closest thing the fleet owns to this component
and it answers a different force. Its module doc opens
(`crates/server/src/scheduler.rs:1-6`) with *"DB-backed cron scheduler. Every
tick it reconciles the `schedules` table"* — the same level-triggered stance —
but its queue is a table, its outcomes are a six-variant enum
(`StepOutcome` at `:162-181`, including `Held` for the overlap guard), and its
delayed retries are an `available_at` column. That durability is not a
refinement of the design above; it is the answer to the force this tree never
faces, because `pumper`'s store *is* the source of truth for its jobs, while a
controller's queue can be thrown away and re-derived from the API server. The
transferable half in the other direction is narrower and real: `pumper` has no
key-level coalescing for two enqueues arriving without a client-supplied
idempotency key, which is exactly the gap `schedule_message`'s branches 3 and 4
close.
