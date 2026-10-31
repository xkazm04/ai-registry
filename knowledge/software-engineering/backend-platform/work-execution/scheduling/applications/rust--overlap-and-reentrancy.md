---
layer: application
type: application
subject: scheduling
technique: overlap-and-reentrancy
stack: rust
verified_on: 2026-10-31
---

# Overlap & reentrancy in the Personas trigger scheduler (Rust)

How this repo realizes the overlap-and-reentrancy technique across four layers: the
per-trigger single-flight guard, CAS slot claims, orphan-loop retirement, and the
stuck-claim reaper. File references are to the desktop backend, re-anchored at Personas
`61029d7ae0`.

> Re-checked 2026-10-31 at `61029d7ae0`: the former `src-tauri/src/engine/background.rs`
> is now the module directory `src-tauri/src/engine/background/` (`scheduler.rs`,
> `event_bus.rs`, `lifecycle.rs`, …), and `SchedulerState` moved into the extracted
> engine crate at `src-tauri/engine/src/background/state.rs`. The trigger repo's
> `triggers.rs` became `src-tauri/db/src/repos/resources/triggers/scheduling.rs`, and
> `subscription.rs` became `src-tauri/src/engine/subscription/runner.rs` for
> `run_single`. Every mechanism below is still present; all anchors were re-read.

## 1. Single-flight, drop — with a visible signal

The scheduled-fire path implements the technique's default policy (single-flight,
drop, recorded) at `src-tauri/src/engine/background/scheduler.rs:946-967`. When a
`schedule` trigger comes due while its previous run is still active, the tick:

- detects overlap via `schedule_overlap_active` (`scheduler.rs:579-609`) — an
  EXISTS query over `persona_executions` in `('queued','running')` whose payload
  carries this trigger's id (`json_extract(input_data, '$._event.source_id')`),
  OR'd with `persona_events` rows still `('pending','processing')` for the trigger;
- **consumes** the slot with `mark_triggered` rather than merely advancing the
  pointer — the comment at `scheduler.rs:933-945` spells out the watermark
  interplay: "an overlap skip is an INTENTIONAL drop — the previous run is still
  doing the work — so the slot must be neither replayed by backfill nor counted as
  an offline miss", since both key off `(last_triggered_at, now]`;
- emits `schedule.skipped.overlap` (`emit_overlap_skip_signal`,
  `scheduler.rs:640-664`) with `reason: "previous_run_active"` (built by
  `synthesize_overlap_skip_payload`, `scheduler.rs:613-635`) into the event feed, so
  the drop is never silent.

Note the guard's *chosen failure direction* at `scheduler.rs:580-587`: on a DB pool
error the check returns `false` — fail open, "better to risk a rare overlap than to
silently drop a legitimate fire on a transient pool hiccup" — with a warn log either
way.

> Re-checked 2026-10-31 at `61029d7ae0`: the fail-open now covers two failure points,
> not one. Besides the pool error, a failed query also allows the fire
> (`scheduler.rs:605-608`, "overlap check query failed — allowing fire").

## 2. Claims are CAS on a version column

The claim primitive is optimistic concurrency on `trigger_version`
(`src-tauri/db/src/repos/resources/triggers/scheduling.rs:260-323`): `mark_triggered`
(`:266-284`) updates `last_triggered_at + next_trigger_at + trigger_version` guarded by
`WHERE id = ?3 AND trigger_version = ?4`, so of two ticks racing on the same due
trigger exactly one wins; `advance_schedule_pointer` (`:286-323`) gives the same CAS
guarantee while deliberately *not* moving the fired-watermark (the replayable-skip
primitive).

The backfill path shows claim-before-compute (`scheduler.rs:1015-1069`): the startup
overdue sweep and the first subscription tick both read the same
`last_triggered_at` watermark and would both publish the identical missed-slot
backlog; "the CAS that's supposed to prevent double-fire (`mark_triggered`) only runs
AFTER this whole loop". So the code takes an `advance_schedule_pointer` claim (version
bump, watermark and schedule untouched) before enumerating slots, and the loser skips
its backlog attempt for the tick.

## 3. The scheduler's own reentrancy: generation counters

`SchedulerState.generation` (`src-tauri/engine/src/background/state.rs:96-110`) exists
because dropping a tokio `JoinHandle` does not abort the task: a stop-then-restart left
every previous loop alive, and a bare `running: AtomicBool` reads `true` again after
restart — the orphan concludes it is current, and every trigger fires twice. The
generation is bumped on every start *and* stop; each loop captures it at spawn and
`run_single` (`src-tauri/src/engine/subscription/runner.rs:50`, check at `:95-106`)
re-loads it per tick, self-retiring when it moved on. The start transition itself is
guarded by `try_begin_start` (`state.rs:158-174`), a `compare_exchange` on `running`,
closing the two-concurrent-starts double-spawn race.

> Re-checked 2026-10-31 at `61029d7ae0`: the start-side bump now happens inside
> `try_begin_start` itself (`Some(self.generation.fetch_add(1, Ordering::SeqCst) + 1)`,
> `state.rs:173`), so the CAS and the bump are one call; the stop-side bump is in
> `stop_loops` (`src-tauri/src/engine/background/lifecycle.rs:718`). New layer beside
> the generation check: `run_single` also gates leader-only subscriptions on engine
> leadership (`runner.rs:108` onward) so several instances on one shared DB do not
> double-run a singleton loop — a cross-process reentrancy guard this application did
> not previously describe.

## 4. The reaper for claims without identity

Events claimed into `processing` carry no claim timestamp or holder id
(`claim_pending`, `src-tauri/db/src/repos/communication/events.rs:313-330`, sets only
`status = 'processing'`) — the deviation from the technique's "claim with identity"
rule — so the stuck-event reaper compensates behaviorally: a row must appear in
`processing` on **two consecutive** reap passes (`stuck_reap_seen`,
`src-tauri/engine/src/background/state.rs:85-90`) five minutes apart
(`STUCK_EVENT_REAP_INTERVAL`, `src-tauri/src/engine/background/event_bus.rs:122-132`)
before being reclaimed to `pending` or dead-lettered (`reap_stuck_processing_events`,
`event_bus.rs:175-253`), because "a single snapshot cannot tell a stranded row from
one a healthy tick (or the headless daemon, a separate process on the same DB) is
processing right now, and `claim_pending` records no claim timestamp to lean on".
Reclaims write `stuck_reclaimed` / `stuck_retry_exhausted` reason tokens
(`EventGateReason::token`, `event_bus.rs:80-81`), keeping the reaper's actions on the
same non-fire ledger as every other gate.

> Re-checked 2026-10-31 at `61029d7ae0`: the quoted rationale gained the headless
> daemon as a second claimant (it claims through `claim_pending_headless`,
> `events.rs:340`), which strengthens the case for the two-pass rule. The reaper now
> runs from `event_bus_tick` before the claim, inheriting the event-bus subscription's
> leadership gate and panic boundary.

## What to copy, what to improve

Copy: the consume-vs-preserve watermark distinction, claim-before-compute for
catch-up, the generation counter, the fail-open comment discipline. Improve: give
`claim_pending` a claim timestamp and holder identity so the reaper can act on
evidence instead of a two-pass heuristic — the code's own comments name this exact
gap, and at `61029d7ae0` it is still open.
