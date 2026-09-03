---
layer: application
type: application
subject: job-coordination
technique: lease-renewal
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Heartbeat leases: the daemon lock and engine leadership

The repo's canonical lease is **runner-scoped** (the technique's "per
runner" scope): a JSON lock file with a periodic heartbeat, arbitrating
which process instance hosts the engine machinery at all.

## Sizing, exactly per the rule

`src-tauri/src/daemon/lock.rs` writes the sizing rationale into the
constants: `HEARTBEAT_INTERVAL = 30s` (`:60`) and `STALE_THRESHOLD = 90s`
(`:57`), with the comment doing the technique's arithmetic — "90s gives
three missed heartbeats before we declare the daemon dead… conservative
enough to avoid false positives from brief GC pauses or I/O stalls, short
enough that a crashed daemon doesn't block a fresh start for more than
~1.5 minutes." TTL sized to detection latency and tolerant of missed
renewals; job duration appears nowhere in the math, because it is
irrelevant. `is_stale` (`:107`) even treats a future-dated heartbeat as
suspect rather than trusting it.

## Two-way renewal and takeover

`EngineLeadership` (`src-tauri/src/engine/leadership.rs`) generalizes the
same lock into an election. `tick` (`:168-191`) is the technique's two-way
channel in twenty lines:

- **Leader:** refresh the heartbeat — and if the *write fails*,
  relinquish leadership on the spot (`:173-179`). The renewal result is
  read and acted on; a leader that cannot prove liveness stops claiming
  it, instead of working on as a zombie.
- **Follower:** re-attempt acquisition each tick, so a dead leader's
  lease is taken over within one stale window (`:187-190`).

`release` (`:194-200`) deletes the lease on clean shutdown so a successor
need not wait out the 90s — the stale window is paid only for crashes.
`try_acquire` is idempotent, logs both outcomes with the holder's pid and
heartbeat age, and a `forced_follower` mode exists for processes that must
never win (`:124-126`) — tested down to
follower-takes-over-released-lease (`:236-246`).

## What the per-job layer has, and lacks

Individual executions carry the evidence half of a lease:
`persona_executions.last_heartbeat_at` is stamped by the runner
(`src-tauri/db/src/repos/execution/executions.rs:1498`) and
`find_silent_running` (`:1518`) is the watchdog's stale-heartbeat query —
silence made queryable, per the technique. But the *event* pipeline's
claims record no holder, timestamp, or lease at all (`claim_pending` sets
only `status`), which forces the degraded two-snapshot reaper documented
in delivery-guarantees' stuck-reaping — the registered deviation
`#w2-background-jobs` in the consumer's deviation register.
The contrast inside one codebase is the technique's argument compressed:
where lease evidence exists (lock file, heartbeat column), expiry is
affirmative and takeover is immediate; where it does not, staleness is
folklore defended by comments about worst-case cadences.

## A second tree: the per-job lease where absent and lost are one fact

The technique's "absent is not lost" section was tested against a
different Rust tree — a job runner whose lease is a **column on the job
row itself**. `crates/core/migrations/0017_job_heartbeat.sql` adds
`heartbeat_at` to `jobs`; the worker stamps it on an interval
(`crates/server/src/worker.rs:860-862`), and the reaper
(`crates/core/src/storage.rs:1036`, `reap_stale`) re-queues running jobs
whose stamp is older than the window, through the same verdict function
the boot sweep uses.

The renewal is attempt-fenced at the store (`storage.rs:1015-1026`):
`UPDATE jobs SET heartbeat_at … WHERE id = ? AND status = 'running' AND
attempts = ?`, returning whether a row changed. So is completion
(`storage.rs:439`) and so is fan-out: the tree's own test
`a_reclaimed_attempt_does_not_fan_out` (`worker.rs:2745`) pins that a job
reset or reaped mid-run, whose attempt advanced, must not index or deliver
webhooks on behalf of the run that no longer owns it, and its sibling
`a_missing_row_fails_closed` pins that a vanished row "proves nothing —
and cannot prove it must not mean push anyway".

**Simulation, three cases, policy A as shipped versus policy B with the
absent/lost split:**

1. *The reaper reaps a live-but-slow task.* The next renewal updates zero
   rows because the attempt advanced. Under both policies that is *lost*;
   the difference the amendment draws — re-establish on absent — has no
   branch to take, because a renewal cannot recreate the row it is the
   lease on.
2. *The job row is gone* (pruned, cancelled, another install's id). Zero
   rows again. Under B's letter this is *lapsed* and the holder would
   re-establish; here that is exactly wrong, and the tree already says so:
   absent is fail-closed. The row is the work; absence of the lease is
   absence of the job.
3. *The store is lost and restored.* The flush shape the amendment exists
   for — every live holder evicted at once while nothing was wrong — cannot
   occur, because the same loss takes the jobs with the leases. There is no
   "live holder with no key"; there is no holder.

Verdict **not-better**, and the condition is now the amendment's closing
paragraph: a lease that lives on the same durable row as its work, with
attempt-fenced writes, has one meaning for "zero rows" and nothing for the
split to protect. The distinctions are for a lease store that lives apart
from the resource it governs and can serve or lose state independently.

**One structural fact against the base technique, not the amendment.** The
worker discards the renewal's boolean — `let _ = state.storage.heartbeat(…)`
(`worker.rs:861`) — so a task reaped mid-run keeps working until its
fenced completion is refused, and the fence (which the tree built well) is
the only thing that stops the zombie. The two-way channel this technique
already prescribes — read the renewal's result and stop the loop — is the
few-line change this tree is owed, and it is independent of the amendment.
