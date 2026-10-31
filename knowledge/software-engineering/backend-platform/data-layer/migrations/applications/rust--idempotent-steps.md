---
layer: application
type: application
subject: migrations
technique: idempotent-steps
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Idempotent steps in the ledger-less boot chain

This repo is the standard's **ledger-less variant in production**: there is
no version counter anywhere (`src-tauri/db/src/backup.rs:15-18` states it
outright — "There is no schema-version counter in this codebase"), so the
full chain — `migrations::run` + `run_incremental`
(`src-tauri/db/src/lib.rs:477-478`) — replays on every launch of every
install. Every guard is load-bearing, which makes this codebase a complete
tour of the technique: the discipline done right, the hazard fired for
real, and the chain-level failure no per-step property could see.

## The step record and the legal probes

`IncrementalMigration` (`src-tauri/db/src/migrations/incremental/support.rs:14-19`)
is `{ id, description, already_applied, apply }`; `run_step` (`:21-33`)
evaluates the guard, short-circuits or applies, and logs. Note what it does
NOT do: record anything — `id` is a log field only. The three legal guard
probes read the *live schema*: `has_column` (`:49-56`), `has_table`
(`:58-65`), `has_index` (`:85-92`). All three return `Ok(false)` for a
missing table — the guard resolves uncertainty toward *running* the step,
whose failure is loud, exactly the bias the standard prescribes. 123
`run_step` sites use this shape. `ddl_step` (`:42-47`) supplies the atomic
unit per step.

## The hazard, fired: swallowed guards

The standard's "a guard that skips is indistinguishable from a guard that
succeeded" happened here twice, in both flavors:

- **Swallow-everything guards.** Steps used `let _ = ddl_step(…)` to absorb
  the expected "duplicate column" on re-run — and absorbed every real error
  with it. Six load-bearing sites were fixed, and the regression test
  `a_genuinely_failed_guarded_alter_is_no_longer_swallowed`
  (`incremental/tests.rs:180-206`) pins the fix: it drops the target table,
  runs the chain, and asserts the error *surfaces and names the table* and
  that the chain did NOT sail past (the next step's table must not exist).
  The compliant replacement shape is `incremental/e03_p2p_and_telemetry.rs:571-584`: probe with
  `has_column`, making the duplicate impossible, "which means anything that
  still errors here is real and propagates."
- **The residue.** 42 production `let _ = ddl_step(` sites remain below the
  test module (counted by grep, lines < 8596), plus 13
  `let _ = conn.execute_batch(` ALTERs in
  `src-tauri/db/src/migrations/initial.rs` (e.g. `:18-21`). Some are argued
  (the `DROP COLUMN` batch at `incremental/support.rs:374-405` documents why swallowing is the
  success path there); most are simply the pre-fix pattern still standing.
  One site *inverts* the uncertainty bias: `incremental.rs:7718` guards
  with `has_column(…).unwrap_or(true)` — probe failure is treated as
  "already applied" and the step is skipped, the exact quiet branch the
  standard forbids.

## The chain-level failure: oscillation

The standard's claim that idempotent steps do not compose into a convergent
chain is not hypothetical here. `retire_persona_groups`
(`incremental/e07_deliberation_and_scoring.rs:16-100`) drops columns that two *additive* guarded
steps 350 lines upstream kept re-adding; with the destructive step's guard
written as `already_applied: |_conn| Ok(false)` (always-run), the pair
cycled add→drop on every boot — ~186 ms and two full table rewrites per
launch, forever, with every individual step reporting honest success. The
fix (2026-08-15) is all three repairs from the standard at once: the
additive steps were deleted (`incremental/e06_teams_and_sync.rs:62-70`,
`:103-104` document the removal), and the destructive step's guard became a **post-condition
probe** (`e07_deliberation_and_scoring.rs:35-39`) that asserts the retired state. The in-code
post-mortem (`:26-29`) states the transplantable lesson verbatim: "The
defect was a relationship between steps 370 lines apart, which no per-step
instrument can see."

One always-run guard legitimately remains: `groups_to_teams_data_migration`
(`e06_teams_and_sync.rs:320-327`) has no clean boolean marker (zero groups is a legitimate
no-op), so it leans entirely on internally idempotent statements
(`NOT EXISTS` / `IS NULL` guards, deterministic derived ids at `:317-318`) —
the "replayable phrasing" escape hatch, paid for with a real data scan on
every boot.

## The fixed-point instruments

Two tests approximate the standard's "run the chain twice, assert zero
work": the rebuild-idempotency assertion (`incremental/tests.rs:155-170`)
replays the chain and asserts the `persona_executions` CHECK was not
re-widened (a second widening means the guard failed and user history was
re-copied on boot); and `fresh_schema_contains_latest_migration_artifacts`
(`incremental/tests.rs:263` ff.) pins that a fresh store actually receives the newest steps'
artifacts — the fresh-install half of convergence. What does not exist yet
is the general form: a full chain-runs-twice/second-pass-does-nothing
assertion, and any instrument on the steady-state probe tax (the legacy
audit `docs/concepts/golden-paths/boot-migration-step.md` measured 436
statements re-prepared and 157 schema probes per launch at its commit).

Re-checked 2026-10-31 at personas@22260d77c9: `migrations/incremental.rs` was
split into `migrations/incremental/` (a `support.rs` holding the step record,
the probes and the shared rebuilds, one file per era, and `tests.rs`), so the
anchors above are re-pointed into that directory and "350 lines upstream" is
now a neighbouring file (`e06` adds, `e07` drops). The constructs hold. The
counts do not: `run_step` has 271 call sites (was 123); the production
`let _ = ddl_step(` residue is 27 sites (was 42), 19 of them in `support.rs`;
`initial.rs` keeps 8 swallowed `execute_batch` ALTERs (was 13). The one site
that inverted the uncertainty bias (`has_column(…).unwrap_or(true)`) is gone:
it guarded a `workspace_knowledge` column, and `6898c2ac22` deleted that step
when the Workspace Knowledge tables were retired. No `unwrap_or(true)` guard
remains under `migrations/`. The general chain-runs-twice/zero-work assertion
still does not exist; `migration_chain_is_idempotent_on_rerun` (`tests.rs:119`)
replays the chain and checks integrity, FK health and the CHECK widening, not
that the second pass did nothing.
