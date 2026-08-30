---
layer: application
type: application
subject: quality-regression-gating
technique: partial-run-never-green
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: the gate exit contract and cost-halted runs in LightTrack

LightTrack wires "a partial run is never green" into the narrowest channel
it has — the process exit code — in `crates/runner/src/gate.rs`, and feeds
that contract from the `--max-cost` machinery documented at
`docs/BENCHMARK_FRAMEWORK.md:462-480`.

## Three states, two nonzero codes

```rust
// crates/runner/src/gate.rs:6-22
pub(crate) const EXIT_REGRESSED: i32 = 3;
pub(crate) const EXIT_NO_BASELINE: i32 = 4;

pub(crate) fn gate_exit_code(status: &str) -> i32 {
    match status {
        "regressed" => EXIT_REGRESSED,
        "no_baseline" | "partial" | "aborted" | "cancelled" => EXIT_NO_BASELINE,
        _ => 0,
    }
}
```

Exit 3 is evidence of harm; exit 4 is absence of a verdict. All three
truncation causes — `partial` (halted mid-run by `--max-cost`),
`aborted` (the cost pre-flight refused to start), `cancelled` (an operator
stopped it) — converge on the **unverified** code, "so a CI step can never
read a run that judged 30% of its cases as a green build" (`gate.rs:13-15`).
The mapping is a pure function of the run's recorded status, so the exit
code, the report banner, and `GET /v1/benchmarks/:id/gate` cannot disagree.
The unit test (`gate.rs:29-40`) pins every arm, including the deliberate
default: unrecognized/legacy statuses map to 0 (non-blocking) — a
documented decision, acceptable because statuses never cross a trust
boundary.

## Spending is asked for, not discovered afterwards

The framework (`BENCHMARK_FRAMEWORK.md:462-477`) implements consent twice:

- **Pre-flight**: before the first paid call, the runner prints
  generation/judge call counts and a dollar estimate from the price book.
  Unpriced models are named, their share shown as `$0`, and the line prints
  `≥$` rather than `~$` — the estimate discloses that it is a lower bound.
  If it exceeds `--max-cost` (default `$25`, `0` disables), the run aborts
  at pre-flight, printing the exact value to pass to proceed.
- **Live ceiling**: the same ceiling is checked at case boundaries
  *before* spending, so a run whose real cost outruns the nominal estimate
  stops instead of finishing the invoice.

A halted run is stamped `partial`, never `passed`: per-target reports carry
`partial` / `budget_halted` / `skipped_cases` / `cases_planned` /
`budget_spent_usd`, the leaderboard prints a `PARTIAL` banner, and both the
CLI gate and the HTTP gate treat it as unverified (exit 4). The truncation
is in the payload on every surface — never only in documentation.

## The ceiling stays out of the product's limit engine

`BENCHMARK_FRAMEWORK.md:479-480` states the boundary explicitly: this is a
per-run operator ceiling on benchmark spend, "deliberately unrelated to the
ingest limit engine" — the judge/scoring path stays unbudgeted and nothing
here reads or writes `limit_rules`. The quality apparatus is governed by
its own consent mechanism, not by the caps that meter customer traffic.
