---
layer: application
type: application
subject: cost-metering
technique: usage-ledgers
stack: rust
verified_on: 2026-10-31
---

# Usage ledgers in the Personas backend

Two spend-class ledgers, one wire format, and the repo's best worked example
of the failure discipline — plus the counter-examples that show what happens
without it.

## The two ledgers

- **`companion_turn`** (`src-tauri/src/companion/turn_ledger.rs`) — the
  interactive/companion class: every Claude CLI spawn Athena makes (chat,
  autonomous, proactive, headless decision legs, maintenance legs). One row
  per turn, written from the CLI's terminal `{"type":"result"}` stream-json
  event (`CliUsage::from_result_event`, `turn_ledger.rs:83-104`): `cost_usd`
  from `total_cost_usd`, direction-split tokens plus **cache-read and
  cache-creation token classes**, `duration_ms`, `num_turns`.
- **`dev_llm_spend`** (`src-tauri/db/src/repos/llm_spend.rs`) — the headless
  background class: scanner/evaluator/design tiers. Same wire parsing
  (`parse_result_line`, `llm_spend.rs:83-111`, documented at `:73` as "mirrors the field
  extraction in `companion::turn_ledger::CliUsage`"), different row shape:
  write-time `SpendCtx` carries `source`, `trigger_kind`, `model`,
  `persona_id`, `project_id` (`llm_spend.rs:20-26`) — attribution decided at
  the call site, exactly the write-time-or-never rule.

The class taxonomy is deliberate, and extending it is cheap by design:
`ORIGIN_MAINTENANCE` was split from `ORIGIN_HEADLESS`
(`turn_ledger.rs:42-54`) specifically so the sleep cycle's cost would not
hide "inside a bucket already dominated by 1,600 triage legs" — and the
spend rollup groups by `origin`, "so a new value surfaces there with no
rollup change".

## Failed calls are rows — the strongest evidence in the repo

`turn_ledger.rs` is a case study in earning the failure discipline
retroactively. The module doc records the before-state twice:

- "Until this existed, every error exit in `session::send_turn` returned
  *before* the ledger write, so `is_error` was 0 on every row ever written —
  the health surface reported a flawless error rate *by construction*"
  (`turn_ledger.rs:154-158`; the module doc restates it at `:20-26`).
- The headless legs were worse: "~94% of `companion_turn` rows … were
  structurally incapable of reporting a failure" until
  `record_failed_leg` (`turn_ledger.rs:254-296`).

The corrected mechanics map one-to-one onto the technique:

- **One construction site for failure rows** — `failed_turn_record`
  (`turn_ledger.rs:176-217`): "the chat/background path … and the headless
  decision legs must never drift into two different failure shapes — they
  feed the same `companion_get_health` number."
- **Low-cardinality reason taxonomy** — `error_reason` tokens (`timeout`,
  `spawn_failed`, `cli_nonzero_exit`) from a single classifier
  (`session::classify_failure`), raw message truncated into
  `outcome_json.error` for diagnosis (`turn_ledger.rs:159-163`, `:183-185`).
- **Unknown cost never swallows the row** — `record_failed_leg` writes
  usage `None` "and that is a fact about the call rather than a shortcut …
  A failed leg with unknown cost is still a recorded failed leg"
  (`turn_ledger.rs:264-268`). The test
  `records_a_failed_turn_with_no_usage_at_all` (`turn_ledger.rs:714-756`)
  asserts cost stays `NULL` "rather than blocking the row".
- **Two failure signals ORed** — the row's `is_error` is
  `u.is_error || rec.failed` (`turn_ledger.rs:364`): the CLI reporting its
  own error and the turn dying before the CLI could report are both
  flagged.
- **Timeouts flagged despite returning `Ok`** — `flag_timeout`
  (`turn_ledger.rs:298-313`) synthesises a usage block for a killed child,
  because "a timeout would book as a clean leg carrying whatever cost it
  burned … the failure mode most likely to be common".

## Period boundaries: one predicate, returned with results

The monthly boundary has exactly one owner:
`MONTHLY_SPEND_PREDICATE` (`src-tauri/db/src/repos/execution/executions.rs:2369`)
— status set (`completed/failed/incomplete/cancelled`), UTC
`datetime('now','start of month')`, ops-chat exclusion — shared **verbatim**
by the gate that blocks runs (`get_monthly_spend`, `:2371-2390`) and the
budget UI feed (`get_all_monthly_spend_with_conn`,
`src-tauri/src/commands/communication/observability/metrics.rs:184-223`).
The UI feed's doc comment states the invariant: a local-timezone boundary
"would make the badge disagree with the gate that actually blocks runs", so
the caller's `utc_offset_minutes` is *accepted and intentionally ignored*.
And the result carries its window: `MonthlySpendResult.period_start_utc`
travels with the items (`metrics.rs:37-41`) — the period returned with the
totals, per the technique.

## The declared best-effort trade

Both ledgers choose availability over blocking: `record` "logs + swallows
on failure — never propagates to the caller, so spend recording can't break
a real LLM call" (`llm_spend.rs:28-39`); `record_turn` likewise
(`turn_ledger.rs:322-334`). The choice is explicit, per-class, and each
dropped write emits a `tracing::warn!` — the stance the golden path allows,
minus one refinement it asks for: the drops are logged but not *counted*,
so "how much did the ledger miss this month" has no queryable answer.

## Counter-examples (the same repo, the other ledger)

The persona-execution spend path shows the cost of missing each rule:

- **Unknown spelled as zero:** `ExecutionMetrics.cost_usd` is `f64`, not
  `Option<f64>` (`src-tauri/core/src/types.rs`), while both the update
  struct and the DB column are nullable — so a cancelled run's killed CLI
  (no `result` event) books `Some(0.0)`, a definite claim of free. Measured
  in the legacy audit: cancelled and zombie-swept rows all at zero, and the
  gate's own comment admits such rows "may have consumed API credits".
  `LlmSpendInsert.cost_usd: Option<f64>` two files away is the correct
  form.
- **Token units never arrive:** `input_tokens = 0` on all execution rows —
  the parser reads `total_input_tokens`, a field the vendor has never
  emitted, and a hand-written fixture certifies the dead field (registered
  at `#w1-streaming-output`, `#w4-prompt-assembly`; the two ledgers above
  read `usage.*` and get real numbers).
- **Pruning refunds the budget:** `get_monthly_spend` sums
  `persona_executions`, so deleting execution history vacates enforced
  spend — the legacy audit measured ~44% of audited dollars orphaned from
  deleted executions. `prune_old_turns` (`turn_ledger.rs:404-430`) shows
  the declared-retention form (90 days, named reaper), though its window
  is retention-motivated rather than enforcement-aware.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0: every construct above is still
present and every quote still reads as cited; only line anchors had drifted, and
they are updated in place. The counter-examples all hold: `ExecutionMetrics.cost_usd`
is still `f64` (`src-tauri/core/src/types.rs:526`), the execution parser still reads
the top-level `total_input_tokens` (`src-tauri/engine/src/parser.rs:443`, now an
extracted crate), and the gate still sums `persona_executions`, so pruning still
refunds the budget. The ledgers' dropped writes are still logged, not counted. One
addition beside the counter-example: `ExecutionMetrics` now carries `result_seen`,
so a run whose stream ended without its terminal `result` event is distinguishable
from a clean one, though its cost still books as `0.0`.
