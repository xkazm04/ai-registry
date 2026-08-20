---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: budget-preflight-and-ceiling
stack: rust
status: forged
refresh_by: 2026-11-20
---

# Rust: per-run spend control in LightTrack's compare runner

LightTrack's compare mode (`crates/runner/src/budget.rs`) implements the full
pre-flight + live-ceiling contract for its provider×model×prompt matrix runs,
documented at `docs/BENCHMARK_FRAMEWORK.md:427-445` (§5a "Spending is asked
for, not discovered afterwards").

## Pre-flight as an order-of-magnitude instrument

The module header states the separation doctrine outright
(`budget.rs:1-7`): this is "an *operator ceiling on one benchmark run*,
deliberately separate from the ingest limit engine … the judge/scoring engine
stays unbudgeted by repo invariant. Nothing here talks to `limit_rules`."

The estimate prices the call shape — `targets × cases × gen_samples`
generations, each judged `samples` times (`estimate_compare`,
`budget.rs:55-67`) — at fixed nominal token counts, with the honesty comment
inline (`budget.rs:20-26`): "this is an ORDER-OF-MAGNITUDE figure — it exists
to catch a matrix that is 100× too expensive, not to predict the invoice. The
live `Budget` enforces the real number."

Unpriced models are collected into `CostEstimate.unpriced`
(`budget.rs:33-35`) and flip the printed figure from `~$X` to
`≥$X (unpriced models excluded)` (`CostEstimate::line`, `budget.rs:40-52`) —
the estimate discloses that it is a lower bound instead of reading a missing
price as zero. `--max-cost` defaults to $25, `0` disables, and an abort at
pre-flight prints the exact value to pass to proceed
(`BENCHMARK_FRAMEWORK.md:434-437`).

## The live ceiling and the atomic accumulator

Real spend is accumulated as **integer micro-dollars in an atomic counter**
(`budget.rs:16-18`): "concurrent cells can add to one atomic counter without
a lock (and without float races); $1e-6 is far below any per-call cost."
Cells check the ceiling at a case boundary before spending
(`BENCHMARK_FRAMEWORK.md:438-439`), so a run whose real cost outruns the
nominal estimate stops instead of finishing the invoice — and no call is ever
killed mid-flight.

## Partial is contagious

A halted run is `partial`, never `passed`
(`BENCHMARK_FRAMEWORK.md:439-443`): per-target reports carry
`partial` / `budget_halted` / `skipped_cases` / `cases_planned` /
`budget_spent_usd`, the leaderboard prints a `PARTIAL` banner, and both the
CLI gate (`lt-runner bench --gate`) and the HTTP gate
(`GET /v1/benchmarks/:id/gate`, `crates/runner/src/gate.rs`) treat
`partial`/`aborted` as **unverified** — a distinct exit code (4), not pass
and not fail. The doc states the reason in the subject's own words: "a run
that judged 30% of its dataset can never be a green build."

## What transplants

The three load-bearing choices — lower-bound disclosure for unpriced models,
integer-micros atomic accumulation for concurrent cells, and a contagious
`partial` state that every gate treats as unverified — are stack-portable.
The nominal token constants are not: recalibrate them to your own traffic
before trusting the pre-flight's order of magnitude.
