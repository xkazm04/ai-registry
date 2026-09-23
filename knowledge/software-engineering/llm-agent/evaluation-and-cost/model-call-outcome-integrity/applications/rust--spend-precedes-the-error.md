---
layer: application
type: application
subject: model-call-outcome-integrity
technique: spend-precedes-the-error
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96.1
---

# Rust — a failure that carries its own price

A Rust workspace that drives a subscription coding CLI as its only model engine makes the
ordering rule structural: the failure **type itself** carries the money, so a caller
cannot propagate the error without having been handed the ledger row.

## The shape

The failure is not an error enum alone. It is a pair — what went wrong, and what it cost:

```rust
pub struct ClaudeSpend {
    /// USD the CLI reported as **already spent** before it failed. `None` means
    /// no envelope was ever produced (timeout, spawn failure), so the spend is
    /// genuinely unknown — which is not the same fact as `Some(0.0)`.
    pub cost_usd: Option<f64>,
    /// Which failure this was, for the ledger's `detail` column.
    pub class: ClaudeFailure,
}
```

`crates/core/src/error.rs:10-16`. The doc comment states the distinction the technique's
sibling law insists on: an unknown spend and a zero spend are different facts, and the
type refuses to collapse them.

`ledger_event()` (`error.rs:49-55`) then decides what the ledger receives, by matching on
both halves at once:

| observed | ledger row |
| --- | --- |
| a cost was reported | that cost, detailed `failed_spend (<class>)` |
| no cost, killed on deadline | `0.0`, detailed `unmetered_timeout` |
| no cost, process never started | **no row at all** |
| no cost, any other class | `0.0`, detailed `failed_spend_unreported (<class>)` |

The four arms are the technique's rule made total. The third is the one worth naming: a
spawn failure means nothing ran, so writing a row would be the mirror lie — a metered
event for a call that never happened.

## What the tree proves that the technique only asserts

Two tests in the same file pin behaviour the technique states as a rule and cannot
enforce:

- `error.rs:619-622` asserts the ledger row carries **both** the real money and the
  failure class — `Some((0.42, "failed_spend (is_error)"))` — so a failed call is
  attributable, not merely counted.
- `error.rs:623-626` asserts the cost does **not** appear in the error's `Display` output:
  *"the cost travels in a field, not smuggled into the message"*. That is a sharper rule
  than the technique writes down. A price interpolated into an error string is unusable by
  a ledger and unparseable by anything downstream; putting it in a field is what makes
  step 1 of the technique (extract usage from a response about to be rejected) mechanical
  rather than aspirational.
- `error.rs:641-643` pins the mirror risk explicitly, in its own words: *"a row for a call
  that never ran is a different lie"*.

## The structural half

The rule is enforced upstream of any caller's discipline. The raw engine handle is a
`pub(crate)` field on the engine set (`crates/core/src/engine.rs:1446-1457`), so an
application crate cannot name it; every call reaches the model through one context method
that meters before it returns (`crates/core/src/app.rs:585`). Bypassing the metering
wrapper is a compile error rather than something review has to catch — which is what makes
"spend precedes the error" hold for call sites written by people who never read this
document.

## Where it stops short

Token counts are absent. The engine reads `total_cost_usd`, `num_turns`, `duration_ms` and
`session_id` from the CLI envelope (`crates/engine-claude/src/lib.rs:498-504`) and no
input/output token fields, so the cost is trusted from the vendor rather than priced from
usage. The technique permits that and requires it be said; the tree says it in the type's
doc comment rather than in the emitted row, so a reader of the ledger alone cannot tell a
vendor-reported figure from a computed one.

Budget here is denominated in **dollars**, not tokens (`max_budget_usd`, clamped to the
job's remaining headroom, `crates/engine-claude/src/lib.rs:70-73`). That is a different
answer to the ceiling problem than a completion cap, and a better-behaved one for the
failure this technique guards: a dollar ceiling cannot silently truncate an answer, it can
only decline to start one.
