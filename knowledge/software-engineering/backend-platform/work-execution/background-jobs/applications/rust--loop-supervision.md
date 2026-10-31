---
layer: application
type: application
subject: background-jobs
technique: loop-supervision
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Loop supervision in the Rust engine

Re-checked 2026-10-31 at `personas@22260d77c9`: the two single files this was read from were split
into modules on 2026-08-22, and the extracted engine crate now holds the trait and the scheduler
state; the anchors below point at the new homes. The constructs are the same. The roster grew from
~30 to ~40 subscriptions, and the curation loop moved from `lib.rs` into `boot/workers.rs` with its
three gaps intact. `leadership.rs`'s `is_leader()` still reads only the in-memory lock, and
`release()` still has no production caller.

The repo's supervisor is the unified subscription model:
`src-tauri/src/engine/subscription/` (the door) plus
`src-tauri/src/engine/background/` (the roster and lifecycle). Every claim
of the technique has a concrete address here.

## The registration door

`ReactiveSubscription` (`src-tauri/engine/src/subscription/traits.rs:7-63`) is the one trait every
recurring loop implements: `name()` (stable label, keys health and logs),
`interval()` / `idle_interval()` (the cadence pair), `initial_delay()` (the
staggered first tick), `tick()` (the body), plus two supervision-relevant
extras — `requires_leadership()` (default `true`: every loop is a singleton
unless it opts out) and `wake_signal()` (optional push-wake). The module doc
at `subscription/mod.rs:1-13` states the thesis outright: adding a new reactivity
source "only requires implementing the trait — no new `tokio::spawn` block
needed."

The roster is assembled in `start_loops` (`background/lifecycle.rs:73-704`): ~40
heterogeneous subscriptions — event bus, trigger scheduler, HTTP polling,
cleanup, OAuth refresh, credential healthchecks, watchdogs, a dozen
autonomy loops — pushed into one `Vec<Box<dyn ReactiveSubscription>>` and
spawned through `spawn_subscriptions` (`subscription/runner.rs:256-283`), which
returns `JoinHandle`s that the scheduler retains
(`store_subscription_handles`, `background/lifecycle.rs:502`) "preventing silent task
drops."

`run_single` (`subscription/runner.rs:50-255`) is the uniform envelope every loop
inherits: alive/dead registration bracketing the loop
(`mark_subscription_alive` at `:62`, `mark_subscription_dead` at `:253`),
panic boundary, cadence switching, slow-tick/overrun accounting — safety as a
property of the door, exactly as the technique prescribes.

## Startup admission is compare-and-swap

`start_loops` opens with `try_begin_start` (`background/lifecycle.rs:99-109`; the CAS itself at
`src-tauri/engine/src/background/state.rs:165`) — an
atomic CAS so two concurrent start calls cannot both spawn a full
subscription set; the loser gets a warning naming the consequence it
prevented ("would double-fire every trigger/webhook and duplicate OAuth
refresh").

## Epochal retirement — the generation counter

The standard's "stop signals must be epochal" clause is implemented, and the
field's doc comment (`src-tauri/engine/src/background/state.rs:96-110`) is the best statement of the
reasoning anywhere in the tree: dropping a `JoinHandle` "does NOT abort the
underlying tokio task", so after a stop+restart a loop gating on the shared
`running` bool would find it `true` again and keep polling — "two live copies
of every trigger/webhook/schedule loop hammering the same DB." Instead,
`stop_loops` (`background/lifecycle.rs:706-720`) bumps `generation` as well as clearing
the bool, and each loop compares its spawn-time capture against a fresh load
every tick (`subscription/runner.rs:95-106`), retiring itself when the world has
moved on.

## Ownership across processes — two heartbeat leases

Cross-process single-runner enforcement exists at two layers:

- **Engine leadership** (`src-tauri/src/engine/leadership.rs`): a lock file
  (`engine-leader.lock`) with a heartbeat, generalizing the daemon's proven
  lease. `run_single` gates every `requires_leadership()` loop on
  `leadership.is_leader()` (`subscription/runner.rs:108-123`); a follower idles
  and re-checks each interval, taking over "within the lease's stale window
  if the leader dies."
- **Daemon handoff** (`background/scheduler.rs:20-79`, `should_yield_to_daemon`):
  the windowed app yields a trigger to the headless daemon only when all
  three conditions hold — fresh `daemon.lock` heartbeat (< 90s), the daemon's
  `owns[]` list includes the trigger kind, and the persona is headless — with
  the stated fallback bias "better to double-fire than silently lose a
  trigger."

The heartbeat/staleness ratio matches the technique's slack rule (30s
heartbeat vs 90s stale threshold).

**Known deviation, reported not repaired here:** the legacy corpus document
`docs/concepts/golden-paths/loop-ownership-and-restart.md` (D1) replayed the
takeover-while-alive path and showed `heartbeat()` renames its own contents
over the file **without re-reading the owner**, while `is_leader()` consults
only the in-memory `Option` — so a late-but-alive old leader silently
re-claims over a legitimate takeover and both processes hold leadership
permanently. This is precisely the technique's "the loser must actually stop
/ verify ownership before acting" clause, violated; the same document also
records that both gates fail open (`.unwrap_or(true)`) and that `release()`
has zero production call sites (every relaunch eats a ~90s follower blind
spot).

## The counter-example in the same tree

`src-tauri/src/engine/curation_scheduler.rs` never registers. It is hosted as
a raw spawned sleep-loop in the boot sequence (`src-tauri/src/boot/workers.rs`,
`spawn_curation_scheduler` at `:300-330`): leadership-gated, but with no
panic boundary (a panicking tick kills the task silently), no
`SubscriptionHealth` entry, and no generation check (it survives
`stop_loops`). One roster away from inheriting all three — the swarm pattern
persisting inside a repo that already built the supervisor.
