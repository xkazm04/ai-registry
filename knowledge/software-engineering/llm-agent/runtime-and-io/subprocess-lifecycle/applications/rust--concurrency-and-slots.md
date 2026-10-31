---
layer: application
type: application
subject: subprocess-lifecycle
technique: concurrency-and-slots
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Concurrency and slots across the Personas host

This app is the technique's charter case: one desktop host running many
`claude` children at once — persona executions, fleet terminal sessions,
companion calls, dev servers — plus *sibling host instances* (parallel CLI
agent sessions) spawning onto the same machine. Three layers of the standard
are implemented in three different places, each shaped by what its children
cost to lose.

## Layer 1 — admission-side caps: the execution queue

`ConcurrencyTracker` (`src-tauri/engine/src/queue.rs:166-213`) is the bounded
scheduler for persona executions, with the technique's full layered-cap
stack:

- **Global cap** — `global_max_concurrent` (`:196`), checked by
  `has_global_capacity` (`:272-274`); "an execution needs both per-persona
  AND global capacity to run" (`:194`).
- **Per-tenant cap** — per-persona `max_concurrent`, snapshotted at enqueue
  time (`persona_max_concurrent`, `:45-47`) so drain decisions need no DB
  lookup; `has_capacity` (`:330-336`).
- **Bounded queue with backpressure** — `AdmitResult` (`:60-86`) is a closed
  three-way outcome: `Running`, `Queued { position }`, or
  `QueueFull { max_depth }` — refusal is visible, exactly the
  backlog-is-also-a-resource rule.
- **Composed admission gates** — admission also consults a quota cooldown
  (`quota_cooldown_until`, `:197-205`, armed reactively when a run fails
  against a provider rate limit, never shortened by a later failure,
  `:286-295`) and a resource-pressure gate (`resource_throttled`, `:206-212`)
  set by the governor below.

Re-checked 2026-10-31 at personas@22260d77: `AdmitResult` is no longer a
three-way outcome. `Queued` now carries a `displaced` execution id (a full queue
can shed its weakest waiter for a higher-priority arrival, and the caller owes
that waiter a refusal), and a fourth variant, `AlreadyAdmitted { execution_id }`,
reports a duplicate admission for the same conflict key (`running_keys`,
`:182`). Refusal is still visible; the outcome set grew from three to four.

`resource_governor.rs` (`src-tauri/src/engine/resource_governor.rs`) drives
the pressure gate with hysteresis and *asymmetric* watermarks — CPU pauses
at 70% / resumes below 55%, memory at 85% / 70% — with the rationale in the
module doc (`:13-16`): high RAM occupancy is often healthy cache warmth
while the OOM kill lives near 95%, so memory's bar is higher than CPU's. It
skips the first, invalid sample (`:46-49`) and logs every gate transition
(`:57-71`). "Running executions are NEVER interrupted — only NEW admissions
defer" (`:10-11`).

Re-checked 2026-10-31 at personas@22260d77: the memory watermarks are now
90% pause / 88% resume (`resource_governor.rs:31-33`), not 85% / 70%; CPU is
unchanged at 70% / 55%, and the asymmetry rationale in the module doc still
stands.

## Layer 2 — eviction-side cap: the fleet live-slot scheduler

Fleet sessions invert the posture, and the code states why. The cap
(`MAX_LIVE_SESSIONS`, `src-tauri/src/commands/fleet/stale.rs:141-162`) turns
the fleet into "N tracked conversations, ≤max live processes" — overflow
Idle/Stale sessions are *hibernated* (transcripts persist; Wake resumes), so
the newcomer spawns immediately and an idle child pays. The policy is a
pure, unit-tested function, `live_slot_evictions` (`stale.rs:1325-1344`):
process-backed rows only (`has_pid` — hooks-only external rows neither hold
nor free a slot), resumable only (`has_cc_id`), oldest-idle first, never
more than the overflow. Running/AwaitingInput/Spawning are untouchable —
"evicting working sessions would lose in-flight work, which the
never-lose-work rule forbids" (`:1322-1324`) — making it a declared **soft
cap** (`:146-147`). `free_slot_for_spawn` (`:1393-1415`) pre-frees a slot at
spawn/wake time by evaluating the policy at `cap − 1`, and eviction
re-validates state inside the hibernate lock (`:1370-1372`) so a session
that went live between snapshot and act is never slept — the TOCTOU guard
the technique's "enforced, not assumed" clause demands.

Re-checked 2026-10-31 at personas@22260d77: this layer has changed shape.
`MAX_LIVE_SESSIONS` is gone; the cap is the durable `fleet.max_parallel_sessions`
setting, cached at `stale.rs:155-169`. `free_slot_for_spawn` is gone too: the
admission side is now a durable dispatch queue, `src-tauri/src/commands/fleet/queue.rs`,
whose module doc (`:1-24`) says the old soft cap "never refused work and never
remembered it"; at the cap a spawn becomes a `Queued` row that is promoted when a
slot frees. The eviction side is what this section describes and is still soft:
`live_slot_evictions` (`stale.rs:2082-2114`) keeps the same filters and the same
never-lose-work comment (`:2080-2081`), and `live_slot_pass` re-validates inside
`hibernate(&sid, true)` (`:2143-2146`). So the fleet now has a hard admission cap
and a soft eviction cap, which is closer to the technique than the version read
first.

## Layer 3 — machine-scoped exclusion across host instances

`scripts/build/guard-concurrent-cargo.mjs` serializes heavyweight compiles
across *independent agent sessions* sharing the checkout — a resource no
in-process scheduler can see. Its two design decisions are the technique's
closing argument in miniature:

- **Stateless by choice** (`:34-40`): "it inspects live processes rather
  than maintaining a lockfile, because a lockfile needs a release path and a
  crashed run would leave a stale lock that blocks everything." The gate
  observes the population itself — the ground truth cannot go stale.
- **Fail-open, loudly** (`:70-76`): if enumeration fails it allows the
  command and says so on stderr — a false block halts all compilation, a
  false allow merely risks the CPU spike. Every degraded path prints
  `DEGRADED`, including the empty-stdin case (`:88-99`), which the script's
  own self-test caught silently exiting 0 — "the blind-gate pattern this
  repo keeps finding."

It also applies the young-process grace (`MIN_AGE_MS`, `:33` — cargo
re-execs itself) and blocks with actionable options plus an explicit
override env (`:116-127`).

Re-checked 2026-10-31 at personas@22260d77: the guard no longer refuses. It
now waits for the slot through `cargo-run.mjs`'s queue and never exits 2
(`:118-123`); `MIN_AGE_MS` was removed with the old enumeration (`:48-51`),
since a false wait of two seconds is not worth a start-time lookup, and the
override env is `CARGO_GUARD=off` / `CARGO_FULL_SEND=1` (`:78-79`). The
stateless and fail-open-loudly decisions above are unchanged.

## Disjoint ownership, and the gap

Per-run scratch isolation matches the matrix: `CliProcessDriver::spawn_temp`
mints a UUID-named private temp dir per child and deletes it at `finish`
(`src-tauri/engine/src/cli_process.rs:1004-1019`, `:1218-1229`); run identity
keys each child's activity and output attribution
(`process_activity.rs` — the serde comment documents the exact shared-key
collapse the technique forbids, concurrent runs folding into one
`"execution"` entry). **Gap worth naming:** the three cap layers count
three different populations (tracker entries, fleet sessions with pids, OS
processes named `cargo`), and no reconciliation pass compares any ledger
against the real process table — the slot-leak detector the technique's
observability section calls for does not exist here; the legacy corpus
audit of process reconciliation found the app persists almost no child PIDs
at all, so a post-crash ledger-vs-population comparison has nothing to read.

Re-checked 2026-10-31 at personas@22260d77: the gap is narrower, not closed.
`ConcurrencyTracker::reconcile_running` (`queue.rs:540-555`) now compares the
tracker's running set with the database's live execution rows and evicts an id
on its second consecutive miss, driven from
`src-tauri/src/engine/subscription/watchdogs.rs:208-212`, after a measured
2026-09-10 leak where one persona's slot count never fell. That is a
ledger-vs-ledger reconciliation for one of the three populations. Nothing yet
compares any of them with the OS process table. Separately, `CliProcessDriver`
now also removes its temp dir on `Drop` (`cli_process.rs:1240-1244`), not only
at `finish`.
