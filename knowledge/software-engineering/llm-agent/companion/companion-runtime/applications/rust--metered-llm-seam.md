---
layer: application
type: application
subject: companion-runtime
technique: metered-llm-seam
stack: rust
status: forged
verified_on: 2026-08-23
---

# One metered door for every companion leg (Personas / Athena)

The companion in this desktop product reaches its model by spawning a CLI
subprocess and reading a stream of JSON events back. Every one of those spawns —
a chat turn, an autonomous continuation, a proactive turn, a cheap headless
decision, a maintenance pass — is meant to record one row in `companion_turn`.
Getting there took a measured failure and a structural fix, and both are
documented in the source.

## The failure the structure exists to prevent

`src-tauri/src/companion/brain/oneshot.rs:10-16` records it:

> Until 2026-08-08 this module drained stdout for assistant-text deltas and
> **threw the terminal `result` event away**, so the seven legs below reached
> neither spend ledger … Their cost was invisible in both, which mattered because
> this is exactly the machinery the L1 sleep cycle runs on — the cycle's own
> price could not be measured.

Seven unattended legs, all invisible, and the one thing nobody could price was
the autonomous maintenance the product's longevity work was about. This is the
technique's central asymmetry in the concrete: the legs with no human watching
are the ones that go unmetered, and they are the ones that run most.

## Confirmed: no unmetered public entry point

The fix is structural rather than advisory (`oneshot.rs:18-22`):

> So `call_claude_text` now takes a `UserDbPool` and writes one `companion_turn`
> row per invocation with `origin='maintenance'` and the `leg` name in
> `trigger_kind`. There is deliberately **no unmetered public entry point**: a
> future leg cannot be added without a pool, which is the structural version of
> the rule rather than a comment asking for it.

`call_claude_text` (`oneshot.rs:122`) takes the pool as its first parameter and
`leg: &str` at `:126` — both required, so a new leg cannot compile without
declaring what it is and where it is accounted. The leg vocabulary is a module of
constants rather than free strings (`oneshot.rs:81` onward: `CONSOLIDATION`,
`REFLECTION`, `RECALL_SYNTHESIS`, `BRIEFING`, `NIGHT_PLANNER`,
`NIGHT_UNATTENDED`, `TOURS`, `CYCLE_COMPRESS`, `CYCLE_RECONCILE`), documented as
"one token per leg, used for BOTH the ledger label and the error-message tag — so
`GROUP BY origin, trigger_kind` and a `tracing` line can never name the same leg
two different ways".

## Confirmed: one parser, one row shape, deliberately not re-implemented

`oneshot.rs:30-35` states the rule the technique asks for and the reason:

> The row shape and the failure taxonomy are NOT re-implemented here. They come
> from `turn_ledger::{record_cli_leg, record_failed_leg}`, shared with
> `athena_reaction`'s headless decision legs, and the `result`-event parser is
> `turn_ledger::CliUsage::from_line` — the same one the tracked path feeds every
> stdout line to. Two parsers or two row shapes would drift, and both feed one
> `companion_get_health` number.

The parser is `CliUsage::from_result_event` (`turn_ledger.rs:76-98`) with the
line-oriented convenience wrapper `from_line` (`:100-105`); the writers are
`record_cli_leg` (`:212`) and `record_failed_leg` (`:248`). The leg classes are
separated at the origin level on purpose — `ORIGIN_HEADLESS` (`:41`) and
`ORIGIN_MAINTENANCE` (`:53`) — with the reason given at `:46-52`: folding
maintenance into headless "would have hidden the cycle's cost inside a bucket
already dominated by 1,600 triage legs".

## Confirmed: unknown is carried, not zeroed

Every field of `CliUsage` is `Option` (`turn_ledger.rs:61-70`), and the header
states the disposition directly: "A missing or unparseable `result` event records
a row with NULL usage fields (the turn still happened)" (`turn_ledger.rs:15-17`).
Failed turns are rows too (`:19-26`), with the reason this was not optional: "Without
it every error exit returned before the ledger write and `is_error` was 0 on
every row ever written, so the health surface reported a flawless error rate *by
construction*."

The call-versus-caller split the technique describes is also present, and stated
as such (`oneshot.rs:24-28`): a leg whose CLI ran fine but whose reply failed to
parse "still has exactly one row … the row records the CLI leg that was paid for,
and the caller's parse verdict is a separate concern".

## Deviation: dropped ledger writes are not counted

Capture is declared "best-effort and never blocks a turn … an insert failure is a
`tracing::warn!` and nothing more" (`turn_ledger.rs:15-17`). Choosing
best-effort over blocking is one of the two principled stances, and it is
declared, which is what the standard asks for. What is missing is the third
requirement: the dropped writes are not counted, so the ledger is a lower bound
of unknown depth rather than a lower bound with a known error term. A counter
next to the warning would close it.

## Deviation: two ledgers, one concept

The same product also carries `dev_llm_spend` for a different family of spend
(`src-tauri/db/src/repos/llm_spend.rs`), and `oneshot.rs:12-13` describes the
pre-fix legs as reaching "neither spend ledger". One ledger per spend class is
defensible under the cost subject's own rules; what makes it a deviation here is
that the split is by *subsystem* rather than by spend class, so answering "what
did this product spend on models" requires knowing which table a leg happened to
be routed to.
