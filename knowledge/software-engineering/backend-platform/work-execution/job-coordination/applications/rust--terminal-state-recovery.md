---
layer: application
type: application
subject: job-coordination
technique: terminal-state-recovery
stack: rust
verified_against: rust@1.96
verified_on: 2026-08-28
---

# Terminal-state recovery in the Rust boot sequence

The repo runs independent boot/mid-flight recovery passes over several job
tables, and together they span the technique's whole spectrum — the
per-class verdict form, the park form, the corroborated age-expiry form,
and the blanket wholesale fail the technique exists to displace. The boot
passes are dispatched from one phase function,
`boot::recovery::recover_interrupted_work`, called at
`src-tauri/src/boot/mod.rs:72`; re-admission of persisted `queued` rows is
spawned separately from `src-tauri/src/boot/workers.rs`.

## The strong form: verdicts per class

`ExecutionEngine::recover_stale_executions` + `requeue_persisted_executions`
(`src-tauri/src/engine/execution.rs:500`, `:545`) split the survivors by
state class and give each its own fate:

- `running` → **fail with reason** ("App restarted while execution was
  running") — the executor subprocess is provably dead, the slot must be
  freed.
- `queued` → **preserved and resumed**: the row *is* the durable queue
  (status, persona, use case, input all persisted), and each row is
  re-admitted through the normal `start_execution` door — not by flipping
  status, so admission limits still apply. Per-row best effort: a row whose
  persona no longer exists is failed with its own distinct reason instead
  of blocking the batch; a row the queue refuses stays `queued` for the
  next boot, which makes the sweep idempotent and crash-safe mid-recovery.

The doc comment (`execution.rs:496-499`) preserves the history: this function
*used to* fail `queued` rows too — the "P1 never-lose-a-queued-execution
gap" — i.e. the repo measurably migrated from the wholesale form to the
per-class form and wrote down why.

## The park form: paused survives boot

`n8n_sessions::recover_interrupted_sessions`
(`src-tauri/db/src/repos/resources/n8n_sessions.rs:167-209`) fails sessions
in the live classes (`transforming`, `analyzing`, `interrupted`) with an
*actionable* reason ("App closed during transform -- click Retry to
resume") — but explicitly **preserves `awaiting_answers`**: "they have
persisted questions and can resume without re-running the transform." A
paused job was not executing; the restart proved nothing about it. This is
the park verdict, verbatim.

It also demonstrates the registry-reconciliation obligation: the function
returns the `transform_id`s it re-verdicted "so the caller can clear
in-memory job state (dead cancellation tokens, expired status channels)" —
the sweep repairs both stores, rows and memory, in one startup sequence.

## The corroborated age expiry

`build_sessions::expire_stale_non_terminal`
(`src-tauri/db/src/repos/core/build_sessions.rs:304`) expires
non-terminal build sessions only when **both** hold: no activity for 24h
(`STALE_SESSION_MIN_AGE_HOURS`, `:278`) *and* the owning persona's
lifecycle has left `draft` — independent corroboration that the work is
orphaned, sparing a draft's legitimately parked `awaiting_input` session at
any age. The sweep reuses `cancelled` instead of minting `expired`, and the
comment (`:296-301`) records exactly why: the escape-hatch transition makes
the bulk sweep legal for every row, and a new terminal state would have to
be added to every scattered `phase NOT IN (…)` literal — the recorded
vocabulary-reuse compromise, with the one-authority bill it measures.

## The bad form, still live

`teams::recover_interrupted_pipeline_runs`
(`src-tauri/db/src/repos/resources/teams.rs:724-738`) is the blanket
wholesale fail: one `UPDATE … SET status='failed' … WHERE status IN
('running','awaiting_approval')`. It stamps a single generic reason across
both classes and — the technique's precise objection — **destroys
`awaiting_approval`**, a paused state holding a human-review question that
was not running and needed no repair. Registered as deviation
`#w8-pipeline-dag` in the consumer's deviation register.

Its own doc comment (`:714-723`) documents the deadlock that motivates
reachability: before this sweep existed, an orphaned `running` row meant
`execute_team` refused new runs, `delete_team` refused deletion, and
`cancel_pipeline` only flipped an in-memory registry flag "whose key is
gone after restart" — a team permanently wedged with no in-app remedy. The
guards keyed off live states; the unreachable state deadlocked every one
of them.

## The sweep sets the executor ceiling, and nobody wrote that down

The strongest evidence in this tree is structural, and it is not something
anyone designed — it fell out of two features shipping in the wrong order.

`recover_interrupted_work` opens with its own premise in a comment: *"their
processes died when the app last exited."* That is true of exactly one
process. The repo has since built engine leadership
(`src-tauri/src/engine/leadership.rs`), whose module doc states the opposite
outright — a windowed app, a daemon binary and test instances "can run against
one local device/DB at once", and each "currently runs its OWN copy of every
background loop, so two instances double-fire schedulers". The module
establishes *who* leads and explicitly defers the gating: "the gating is wired
in a later phase".

That deferral was scoped to the background loops, and the boot order shows why
it should not have been. The recovery phase runs at `boot/mod.rs:72`; the
leadership object is not constructed until `:173`, and `try_acquire()` is not
called until `boot/workers.rs:66`. **Every instance blanket-sweeps roughly a
hundred lines before it can learn it is a follower** — and the passes are
keyed on state alone (`WHERE status IN ('running', …)`), so a follower marks
the leader's live executions, transform sessions, pipeline runs, lab runs and
companion approvals failed.

The asymmetry is the part worth carrying: **a follower's loops merely duplicate
work going forward; a follower's recovery sweep destroys work already in
flight.** Loop gating was deferred as the safe simplification, and the one
caller that could not safely wait is the one that was not on the list.

This is [terminal-state-recovery](../techniques/terminal-state-recovery.md)'s
executor-ceiling section confirmed from the direction that makes it hardest to
notice. There is no claim here to misattribute the constraint to — these sweeps
are unconditional statements, not conditional writes — so the ceiling is not
recorded anywhere at all: no config pins the instance count, no comment says
"single instance only", and the constraint survives only as a premise in a
sentence that stopped being true when a different module shipped. A limit
carried by a stale comment is worse than one carried by the wrong line.

And the evidence the fix needs was already in the tree. The lease
(`daemon::lock`) carries holder identity, a heartbeat refreshed on an interval,
a staleness threshold, and takeover-on-stale — every input the technique's
*adopt* verdict is defined in terms of. The sweep simply never read it.

**Landed in the consumer 2026-08-28** (`boot/recovery.rs`, `boot/mod.rs`,
`engine/leadership.rs`): a read-only `another_instance_leads` peeks the
existing lease without acquiring, so it is callable before acquisition, and the
destructive passes defer to a live leader. Single-instance behaviour is
unchanged — a lone process sees no lease and sweeps as before, which is the
backward-compatibility default the leadership module already states for its own
gate. The residual window is the lock protocol's own: for up to the staleness
threshold after an unclean exit, a dead instance's lease still reads fresh, so
a fast restart skips the pass and reconciles on the next boot.

## Citations re-resolved 2026-08-28

Two of this document's structural citations had gone stale, both to the same
cause — the ~1,200-line `setup` closure was lifted out of `lib.rs` into a
`boot` module of named phase functions, and the engine's execution methods
moved out of `engine/mod.rs` into `engine/execution.rs`:

- dispatch: `lib.rs:815`/`:842`/`:909` → `boot/mod.rs:72` plus
  `boot/workers.rs`. `lib.rs` now contains no recovery dispatch at all; those
  line numbers are command-registration entries, which is the failure mode a
  line citation has when the file survives the move but its contents do not.
- per-class pair: `engine/mod.rs:703`/`:748` → `engine/execution.rs:500`/`:545`.
- age expiry drifted four lines (`build_sessions.rs:308` → `:304`,
  `STALE_SESSION_MIN_AGE_HOURS` `:282` → `:278`).
- `n8n_sessions.rs:167` and `teams.rs:724` still resolve unchanged.

The original document also called this "four independent passes over four job
tables". The boot phase now runs seven, five of them destructive, and the count
was load-bearing for nothing here — but a stated enumeration that quietly grows
is how a document starts lying without any of its sentences changing, so it is
now written as a spectrum rather than a census.
