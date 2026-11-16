---
layer: application
type: application
subject: multi-project
technique: passive-signal-ingestion
stack: rust
verified_on: 2026-11-16
verified_against: rust@1.96
---

# Rust — the project-tracking pulse engine

The reference implementation of
[passive-signal-ingestion](../techniques/passive-signal-ingestion.md) is the
engine's project-tracking subsystem: `src-tauri/src/engine/project_tracking/`.
Its module doc is the technique in one sentence: "absorbs CLI activity (git
commits, active-runs ledger entries, optional Obsidian notes), keeps a capped
raw event log, and runs an hourly consolidator … that produces a stable
per-project 'pulse' — narrative + 3-5 named directions + 0-3 tensions"
(`mod.rs:1-8`).

## Watchers over exhaust, read-only, per-source

- **`watchers/git.rs`** — spawns the user's own `git log --since=<iso>
  --no-merges` (no library dependency; one process per project per tick) and
  parses commits into `EventPayload::Commit` events. A hard
  `MAX_COMMITS_PER_POLL = 500` cap protects the downstream prompt budget,
  and hitting the cap *warns* — a truncated read is named, not silent.
- **`watchers/ledger.rs`** — the parallel-session active-runs ledger.
- **`watchers/obsidian.rs`** — the notes vault, gated per subscription.

All three are strictly read-only over artifacts the projects produce anyway
— the technique's "exhaust-only" contract. What each project exposes is a
per-project subscription row (`subscription.rs`: `watch_git`,
`watch_active_runs`, `watch_obsidian`, `enabled`, `last_pulse_at`), owned by
the plugin UI and *read* by the engine each tick — configuration and
ingestion cleanly split, with the ownership table written out in
`mod.rs:10-18`.

## Baseline cadence + announced acceleration, debounced

- **`scheduler.rs`** — the 1h tick (`TICK_INTERVAL`, "hardcoded per the
  locked design decision"). Each tick short-circuits on the master enable
  flag, runs leader-only under multi-driver orchestration (a follower would
  duplicate consolidator events), polls each enabled subscription with
  `since = last_pulse_at ?? now-24h`, and **isolates failures per project**
  — "failures inside one project's watcher pass are logged and skipped;
  they don't break the tick for other projects" (`run_tick`, lines 91-99).
  Event pruning (7 days) runs once per tick — the raw log names its reaper.
- **`push.rs`** — the announced lane: `POST /project-tracking/cli-event` on
  the loopback-only local server (plus an in-process helper for hooks that
  already live in the app). A CLI that just shipped something asks the
  consolidator to run *now* — and a per-project `DEBOUNCE_INTERVAL` of 300s
  "caps out-of-cadence runs at one per 5 minutes so a hot session can't
  starve the LLM budget" (`push.rs:5-8`). This is the debounce guard the
  technique requires on any announced lane, with the budget it protects
  named in the comment.

## Consolidation into a continuous, cost-accounted pulse

`consolidator.rs` makes the digestion model-assisted deliberately: a
one-shot small-model CLI call, 90s timeout, chosen because "the 'carry
forward / replace / retire' reasoning over directions matters more here
than raw speed" (`consolidator.rs:40-43`) — the technique's *continuity*
property is literally the model-selection rationale. The output envelope is
parsed tolerantly (missing arrays default), and the result upserts one
`PulseRow` per (project, day) — `pulse.rs` — carrying `narrative_md`,
`directions`, `tensions`, per-source counts (`commit_count`, `run_count`,
`note_count`) **and `tokens_in` / `tokens_out`**: the pulse records what
its own production cost, the technique's cost-accounting clause as two
columns. A successful upsert emits `project-tracking://pulse-updated`, and
consumers (the companion brain, chat context) read pulse rows — the digest,
never the raw exhaust.

## Deviations visible from here

- **Unwatched is spelled as quiet past the log line.** Every watcher
  failure path — binary missing, non-zero exit, unreadable vault — returns
  `Ok(vec![])` with a `tracing::warn` (`watchers/git.rs:51-70`). Nothing
  durable records "could not observe," so a project whose repository became
  unreadable renders exactly like a genuinely idle one on every surface
  that reads the pulse. The technique demands three outcomes
  (observed-changes / observed-quiet / could-not-observe) with the third as
  durable, surfaced state; the implementation has two plus a log.
- **The tracking registry is a second registry.** Subscriptions hang off
  `companion_known_project` while the Factory/passport surfaces key off
  `dev_projects` — two project identity spaces in one app, with the push
  endpoint resolving projects *by path* at the boundary. The subject's
  golden path prescribes one registry; at minimum the id↔id mapping should
  be explicit rather than path-mediated (a re-cloned project at a new path
  silently stops matching its announcements).
- **Cadence is baseline-only.** Acceleration exists only on the announced
  lane; there is no probe-based fast lane or decay — a busy project that
  never announces still waits for the hour.

## Re-read 2026-11-16 at `8d076db46a` (local checkout, read-only)

This section re-checks every citation above against the tree at
`8d076db46a`, which is master on 2026-11-08, 6,483 commits after the 08-18
read. Nothing was built or run.

- **Paths moved.** The `watchers/`, `pulse.rs`, `subscription.rs` and
  `events.rs` modules now live in the engine crate,
  `src-tauri/engine/src/project_tracking/` (`9708af6d23`, a build-time
  split). `consolidator.rs`, `push.rs`, `scheduler.rs` and `mod.rs` remain
  under `src-tauri/src/engine/project_tracking/` and re-export the moved
  modules (`mod.rs:29-35`). The ownership table is now `mod.rs:10-18`.
- **Correction: the consolidator is no longer a small model.** It runs a
  Sonnet-class one-shot through the Synthesis call class
  (`consolidator.rs:1-8`). The carry/replace/retire rationale is now
  `consolidator.rs:85-86`, and the 90 s timeout is unchanged (`:83`). On
  timeout it kills the whole child tree (`c87efdb0c3`, `ca341d3931`).
  `tokens_in`/`tokens_out` are still on the pulse row (`pulse.rs:25-26`).
- **Correction: the push lane is no longer just loopback.** `local_http`
  now authenticates its callers (`aac681a701`). The 300 s debounce stands
  (`push.rs:44`). Since `f8ccdb0528` (2026-10-20) a push keeps its own
  in-memory consumed-through mark and leaves `last_pulse_at` alone.
  Before that, a push stamped the watchers' position although it never ran
  them, so commits made since the last tick were skipped.
- **Deviation 1 is half-paid.** Since `fc4f1d5291` (2026-09-17), a spawn
  failure or a non-zero exit is an `Err` (`watchers/git.rs:56-82`). The
  scheduler latches a blind tick and holds `last_pulse_at`
  (`scheduler.rs:113-118,194-199`, `TickReadState`). That is the
  technique's cursor's gate, shipped. Still missing is durable
  could-not-observe state: the commit says so itself ("Not included: a
  persisted kind=watcher_error event"). A blind project still renders as
  quiet on every surface that reads the pulse.
- **Deviations 2 and 3 stand.** Push still resolves the project by path
  against the second registry (`push.rs:198-215`). Cadence is still the
  hourly baseline plus the announced lane only (`scheduler.rs:36`).

### New: the position comes from the clock, and the clock is wrong

The cursor's gate decides whether the stamp moves. The value it moves to is
`Utc::now()`, read at `scheduler.rs:194`. Three real defects follow, and
each loses commits for good:

1. **The stamp is taken after the consolidator.** The git read happens at
   `scheduler.rs:121`. The stamp is written at `:194`, *after* the
   consolidator call at `:184`, which can take up to 90 s. Any commit
   created inside that window has a committer date before the stamp, and
   the next tick reads `--since=<stamp>`. Those commits are never ingested.
2. **The cap drops the oldest commits, and the stamp still advances.**
   `git log` runs newest-first with `--max-count=500` (`watchers/git.rs:50-51`).
   A capped read warns (`:107-111`) and returns `Ok`, so the tick stamps
   now. The commits beyond the cap are the oldest ones in the window, and
   the next window starts after them.
3. **History arrives out of date order.** The cursor is a date. But a merge
   or fast-forward brings in commits made elsewhere, dated before the
   stamp, and the Personas repo is the default watched project
   (`companion/projects.rs` `seed_default_project`). Measured on this
   tree's own history, read-only:
   - since 2026-08-18 there are 6,103 non-merge commits, and 2,278 of them
     (37%) are off the first-parent line, so they arrived by merge;
   - the single merge `292e242f02` ("sync with GitHub", 2026-10-09)
     brought in 295 commits, and all 295 carry committer dates more than
     an hour older than the merge.

   An hourly date cursor that ticked in the hour before that merge offers
   none of them. The git docs also say plain `--since` stops walking at the
   first commit older than the bound, and only `--since-as-filter` visits
   them all (git-log reference, read 2026-11-16). So date order alone can
   hide newer commits.

The technique was amended for this on 2026-11-16 ("The new position comes
from the read, never from the clock"). Cheapest fixes, in order:

1. take the stamp before the read;
2. on a cap hit, hold the stamp, or page;
3. store the seen head as the git position and read `<old-head>..HEAD`.

Event-insert failures at `:167` also still stamp. This is lower risk: the
raw log is a cache, not the record.
