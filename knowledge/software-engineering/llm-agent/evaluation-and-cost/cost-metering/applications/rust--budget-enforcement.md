---
layer: application
type: application
subject: cost-metering
technique: budget-enforcement
stack: rust
verified_on: 2026-10-31
---

# Budget enforcement in the Personas backend

The monthly persona ceiling (`personas.max_budget_usd`) enforced at two
Rust gates plus a fail-closed frontend layer, and a run-scope aggregate
ledger with launch-gate semantics. Also the honest inventory of where the
enumeration still has holes.

## The enforcement points, enumerated

- **Manual/API runs** —
  `src-tauri/src/commands/execution/executions.rs:476-488`: positive-cap
  guard, then `get_monthly_spend` vs ceiling; the refusal is
  machine-distinct (`AppError::Validation`) and human-actionable — it names
  the persona, the spend, and the limit ("Budget limit exceeded for '{}':
  ${:.2} spent this month, limit is ${:.2}").
- **Scheduled triggers** — `src-tauri/src/engine/background/scheduler.rs:855-908`:
  the cron path re-implements *the same decision*, and its comment is a
  small essay on why gates must share semantics: the old bespoke inline SQL
  got three rules wrong, including treating the legal `0.0 = unlimited`
  value as "permanently over budget and silently paused". The canonical
  decision is extracted to `schedule_over_budget` (`scheduler.rs:276-288`)
  with unit tests pinning `None`/`0.0`-as-unlimited and `>=` at the cap
  (`src-tauri/src/engine/background/tests.rs:49-70`). A budget skip is a *distinct outcome*: it
  advances the schedule pointer but preserves `last_triggered_at` as the
  fired-watermark "so backfill replays every run missed while the persona
  was paused on budget" (`scheduler.rs:896-907`) — blocked work is
  deferred, not silently dropped.
- **Both gates read one sum** — `get_monthly_spend` over the shared
  `MONTHLY_SPEND_PREDICATE`
  (`src-tauri/db/src/repos/execution/executions.rs:2354-2390`), the same
  predicate the budget UI renders. Gate and badge cannot disagree about
  what a month is or which rows count.

## The frontend layer: fail-closed, TTL declared, invalidation pushed

`src/stores/slices/agents/budgetEnforcementSlice.ts` is the cache-rules
section of the technique implemented almost clause for clause:

- `BUDGET_TTL_MS = 60_000` — the staleness bound is a named constant, and
  data older than it reports `'stale'`, which **blocks** (`:120-131`,
  `:133-152`): fail-closed on stale, on fetch failure (`:107-110`), and on
  a missing per-persona entry after a successful fetch ("prevent a
  fail-open window … during cache invalidation re-fetch", `:126-129`).
- `invalidateBudgetCache` (`:174-180`) marks stale *first*, then refetches
  — enforcement stays fail-closed until fresh data lands, rather than
  serving the revoked snapshot through the TTL.
- Overrides are explicit, narrow, and first-class: session-scoped
  `budgetOverrides` / `budgetStaleOverrides` sets (`:49-52`), separate
  actions per override kind, cleared on refresh — the human re-authorizing
  is recorded state, not an erased block. The slice header documents the
  intent split: frontend gating keeps the user's override capability while
  the backend still hard-caps.
- The 3s TTL-cached tier snapshot
  (`src-tauri/src/commands/infrastructure/tier_usage.rs:15,52-130`) is the
  bounded-lag pattern on the limits side, with an `approaching_limit` flag
  at 80% — the warning tier computed server-side, once.

## Run-scope ceilings: launch-gate semantics, stated

`src-tauri/core/src/run_budget.rs` bounds fan-out runs (evolution cycles,
lab matrices, pipelines) where "a single misconfigured fan-out can quietly
burn N× a single run's cost". Its header states the check-then-spend
honesty clause verbatim: "a spawn's cost is only known after it finishes,
so the ceiling bounds 'don't start new spawns past X', while each spawn's
own `--max-budget-usd` bounds the single in-flight call" — aggregate
launch gate above, per-call cap below. Enforce-mode is an explicit opt-in
(`enforce_enabled`, `:81-88`, default warn-only), and the flag in force is
captured onto the persisted row at finalize
(`src-tauri/db/src/repos/run_budget.rs:14-44`), so history records whether
a breach *could* have halted anything.

## The holes, kept visible

The legacy audit (`docs/concepts/golden-paths/llm-spend-accounting.md` §7,
`spend-ceilings.md` §7) measured the enumeration gaps this Application
would be dishonest to omit:

- **Fail-open by `unwrap_or`**: `get_monthly_spend(...).unwrap_or(0.0)` at
  the scheduler gate (`scheduler.rs:889`) reads any DB error as "$0
  spent" — an undeclared fail-open on exactly the unattended path the
  technique says should fail closed.
- **Only `trigger_type == "schedule"` is gated** in the dispatcher
  (`scheduler.rs:870`); event- and webhook-driven firings reach the same
  execution path without the budget branch.
- **One field, two units**: the same `max_budget_usd` is compared against
  monthly spend *and* passed to the CLI as a per-call `--max-budget-usd`
  (`src-tauri/engine/src/prompt/cli_args.rs:134-138`) — the ceiling-identity clause violated in
  one line.
- **Killed calls never advance the cap** (cost recorded as zero — see the
  usage-ledgers Application), so the ceiling can be approached but never
  crossed by cancelled runs.
- **The apparatus is production-untested**: at audit time, zero personas
  had a positive cap set and `run_budgets` had never persisted a row —
  "refusal count zero" with both possible meanings still open.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0. `background.rs` was split into a
module directory (`src-tauri/src/engine/background/`) and the CLI argument builder
moved into the extracted engine crate; the anchors above are updated, and every
construct and quote still reads as cited, as do both legacy audit documents
(`docs/concepts/golden-paths/llm-spend-accounting.md` §7, `spend-ceilings.md` §7).
The four code-level holes still hold (the fifth is the audit's dated reading of a
live database, kept as measured): the scheduler
still reads a DB error as `$0` (`scheduler.rs:889`), the event bus still calls
`start_execution` with no budget branch (`event_bus.rs:790-800`), one field is still
both a monthly ceiling and a per-call `--max-budget-usd`, and cancelled runs still
book `0.0`.

The enumeration has grown by one gate the list above does not name. The
subscription attention ledger's admission check
(`src-tauri/src/engine/subscription/attention.rs:1591-1630`) pre-flights the same
`get_monthly_spend` against `max_budget_usd`, folds in the persona's mandate cap
(`budget_monthly_usd`, tighter ceiling wins), and propagates a read error with `?`:
on that path a DB failure refuses rather than reading as zero, so it is the one
gate here that fails closed, and its refusal is ledgered as `BudgetExhausted`.
`check_budget_enforcement` (`src-tauri/src/engine/execution.rs:3044-3075`) also
reads the sum, with `unwrap_or(0.0)`, but only files a post-run alert report; it
is not an enforcement point.
