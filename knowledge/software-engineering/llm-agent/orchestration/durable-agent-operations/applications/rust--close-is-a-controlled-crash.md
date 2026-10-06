---
layer: application
type: application
subject: durable-agent-operations
technique: close-is-a-controlled-crash
stack: rust
verified_on: 2026-10-06
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# A clean quit got worse recovery than a power loss

The desktop agent app (personas, Tauri over SQLite; toolchain pinned to 1.96.1 by
its `rust-toolchain.toml`, which is the witness for `verified_against`) persists
every agent run as a row in `persona_executions`. A restart classifier, landed on
2026-09-03, sorts the rows a dead process left `running` into three classes: a
row started inside a 30-minute window goes back to the durable queue with a
`resume_pending` mark and its session id, an older row becomes `incomplete` with
`recovery_state = 'unproven'` and appears on the unresolved-recovery surface,
and the third consecutive restart suspends it. That is the recovery path this
technique asks for: one policy over whatever state the process left behind.

The same change added a clean-shutdown marker, following the registry's
`session-continuation/stuck-loop-detection`: `RunEvent::Exit` writes it last,
and a boot that finds it **skipped the classifier** as "no run was
interrupted". That skip is the second recovery path this technique forbids,
and the tree had it for five weeks.

## The structural fact

The skip's premise was that a graceful exit drains in-flight work. The exit
handler drains two things, neither of them agent runs:

- `src-tauri/src/lib.rs:245` "if matches!(event, tauri::RunEvent::Exit) {"
- `src-tauri/src/lib.rs:256` "state.webbuild_servers.stop_all();"
- `src-tauri/src/lib.rs:265` "personas_core::shutdown_marker::record_clean_shutdown("

Warm CLI sessions and preview servers are ended, and then the marker is
written. A persona execution in flight at that moment has no writer, so its
row still says `running`, which is exactly what a crash leaves. Behind the gate
the row skipped the classifier and waited for the live zombie sweep, which runs
60 seconds after boot and every five minutes after that. The sweep reaps a row
30 minutes after its start:

- `src-tauri/db/src/repos/execution/executions.rs:2432` "const DEFAULT_ZOMBIE_THRESHOLD_SECS: i64 = 30 * 60;"
- `src-tauri/db/src/repos/execution/executions.rs:2514` "status = 'incomplete',"

The sweep writes no `recovery_state`, and the unresolved-recovery surface
selects on that field:

- `src-tauri/db/src/repos/execution/restart_recovery.rs:348` "WHERE recovery_state IS NOT NULL AND status != 'completed'"

So a run interrupted by a quit was never resumed, even when the restart came
seconds later. The resume window is the same 30 minutes as the zombie threshold
(`src-tauri/db/src/repos/execution/restart_recovery.rs:64` "pub const RESUME_WINDOW_SECS: i64 = 30 * 60;"),
so every row the skip touched was inside the window or past it, and the gate
lost the resume in the first case and the surface in both. The crash path was
correct the whole time, and every crash test passed. The only path that was
wrong was the one the user takes several times a day, which is the asymmetry
the technique predicts.

The tree's own record bounds how often this happened, and it does not support
a large number. In a read-only copy of the local database, 31 `running`
executions since 2026-09-03 were reaped by the zombie sweep, in 11 batches,
and none carries a `recovery_state`. **21 of them do not count.** Their last
heartbeat lands within seconds of the reaping, so their runner was alive. The
machine had slept, and on waking the sweep reaped them by start time alone. No
restart happened, so the classifier was never involved. That is a separate
defect in the sweep, and it belongs to the project's ledger rather than to
this technique. **The other 10 rows, in 5 batches, fit the marker's failure.**
Their heartbeat stopped hours before the reaping, no execution was created in
between, and they were reaped about a minute after activity resumed, which is
the sweep's first tick after a boot. At those boots the classifier did not
move them. Two other causes would leave the same record: the leadership
deferral, which skips the whole recovery pass when another instance holds the
engine lease, and a runner that hung silently while the app sat idle. The logs
that would separate the causes are rotated (the oldest retained is
2026-10-01). So 10 is an upper bound on the marker's share. In the retained
logs, four boots read a marker, and none of them had a running row to hide.

## The paired comparison

The measurable is whether an execution `running` at a graceful quit gets the
crash path's recovery. The floor is that a quit that drained still classifies
nothing and changes no row, which was the marker's stated reason to exist. One
fixture goes through both arms: a run started 60 seconds earlier, plus the
marker written by the real `record_clean_shutdown`.

| arm | boot behaviour | row after boot | on the unresolved surface |
|---|---|---|---|
| A | the retired gate, inlined: a marker present skips `classify_running_rows` | `running` (zombie-reaped later, no mark) | no |
| B | `reconcile_after_exit`: consume the marker, classify anyway | `queued`, `resume_pending`, restart count 1 | yes |

Target: 0/1 to 1/1. Floor held: a drained quit (three completed rows and two
queued rows, with the marker present) classifies 0 rows and changes none, and
the next boot reads unclean because the marker was consumed. The crash path
classifies as before. The test module ran 13/13
(`src-tauri/db/src/repos/execution/restart_recovery.rs:1044` "fn a_graceful_exit_with_a_run_in_flight_is_the_crash_case() -> Result<(), AppError> {"),
and the app crate passed `clippy --features desktop -D warnings`.

## What shipped

personas `5429ab2d5` on master (committed locally and not pushed, because
master carries a sibling session's unpushed commits). The decision moved out of
the boot module into the tested data layer:

- `src-tauri/db/src/repos/execution/restart_recovery.rs:285` "pub fn reconcile_after_exit("
- `src-tauri/db/src/repos/execution/restart_recovery.rs:289` "let previous_exit_clean = personas_core::shutdown_marker::take_clean_shutdown(app_data_dir);"
- `src-tauri/src/boot/recovery.rs:66` "engine::ExecutionEngine::classify_stale_executions(app_data_dir, pool);"

The marker is still written, so the tree keeps the "restart is a recorded fact"
its own golden path asked for. It is now read only to label the exit in the
log. When a graceful exit still left rows, the boot logs a warning that names
the gap: the exit path does not drain persona executions.

## Why the seam was chosen to falsify

The marker came from a registry technique that prescribes exactly this skip,
and the 2026-09-04 simulation row against this seam argued only the other
polarity, that a missing marker reads a manual restart as a crash. If the skip
had been safe here, this technique's "no ownership-loss recovery path" rule
would have been overreaching, and the amendment would have gone the other way.
It was not safe. The skip is right for a sweep keyed on *recency*, which is the
sweep stuck-loop-detection describes, and wrong for one keyed on *state*,
which is the sweep this tree has. Both techniques now state that
discriminator.

## What this realization cannot do

It does not drain. A run in flight at quit is still interrupted, and its
external effects are still unknown. Classification only puts it on the same
footing as a crash, under the same resume policy and its same lack of
tool-level idempotency, which the resume-pointer comment in the same module
admits. The four sibling boot sweeps (transform sessions, pipeline runs, lab
runs, approvals) still mark their rows failed without classifying them, and
never read the marker. Nothing here distinguishes a quit from a crash for
them, and nothing needs to until they classify.
