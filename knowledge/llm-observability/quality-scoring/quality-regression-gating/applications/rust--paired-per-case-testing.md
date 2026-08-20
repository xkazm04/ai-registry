---
layer: application
type: application
subject: quality-regression-gating
technique: paired-per-case-testing
stack: rust
status: forged
verified_on: 2026-08-20
---

# Rust: paired per-case testing in LightTrack's benchmark runner

LightTrack's verdict math lives in `crates/runner/src/stats/paired.rs`, and it
realizes the technique end to end — including the refusal paths and the fixed
alpha that the technique layer describes abstractly.

## The fixed alpha, in code

```rust
// crates/runner/src/stats/paired.rs:16-19
/// Family-wise significance level: the probability that *any* of a run's comparisons produces a
/// false `regressed`. Fixed rather than configurable — a benchmark tool whose confidence level is a
/// knob invites tuning it until the answer is the desired one.
pub(crate) const ALPHA: f64 = 0.05;
```

A `pub(crate) const`, not a config key: the only way to change it is a
reviewed code change. Everything downstream derives from it —
`bonferroni_alpha(ALPHA, m)` and `bonferroni_z(ALPHA, m)` at
`paired.rs:89-90` produce the per-comparison threshold and critical value, so
there is exactly one number to audit.

## Refusing to pair mismatched cases

`paired_deltas` (`paired.rs:45-50`) returns `Option<Vec<f64>>` and answers
`None` when the case vectors are empty or of different lengths — the doc
comment calls it "never a silent truncation … a paired test over mismatched
cases is worse than no paired test at all". Comparability itself is
established upstream per `docs/BENCHMARK_FRAMEWORK.md:52-55`: each target
pairs against **its own previous comparable run** (same mode, target, case
count, and `dataset_version` when both recorded it); where none exists, the
report says so and falls back to the unpaired CI test flagged
`method: "unpaired-ci"` — the flagged-fallback rule, verbatim.

## The zero-stderr edge case

`paired_z` (`paired.rs:57-70`) handles the "every case moved by the same
amount" degenerate case exactly as the technique prescribes: a zero stderr
with a non-zero mean reports an infinite z and p = 0 — a *perfectly
consistent* change is maximal evidence, not a discard. `n < 2` returns
`None`: no fabricated p.

## Composition that only adds detection

`verdict()` (`paired.rs:83+`) composes the absolute-floor test (whole
corrected CI below `baseline_score`) with the paired-drop test;
`regressed` if **either** fires (`BENCHMARK_FRAMEWORK.md:75-79`). The
correction can trade a false alarm for a real detection; it cannot disarm
the gate. A benchmark with no `baseline_score` has opted out of gating:
paired statistics are still reported, status stays `no_baseline`.

## Caveats in the artifact, not the docs

The `SigVerdict` struct (`paired.rs:24-41`) carries `status`, `method`,
`scalar_fallback`, the surviving `alpha`, the family size `comparisons`,
`p_value`, `mean_delta`, and `caveats: Vec<String>`. Two caveats are pushed
mechanically: the `n < 2` scalar fallback ("a bare mean compare, not a
test", `paired.rs:112-115`) and — every time the floor test runs — the
baseline-uncertainty admission (`paired.rs:125-130`): `baseline_score`
carries no stderr, so "this run's uncertainty is accounted for and the
baseline's is not". The framework doc (`BENCHMARK_FRAMEWORK.md:81-85`)
names the paired test as the structural fix, which is why the paired
verdict outranks the floor test wherever both can run.

The downstream promotion gate (`BENCHMARK_FRAMEWORK.md:87-99`) then reads
the runner's verdict rather than re-deriving it — one definition of
"regressed" in the product — and preserves the `scalar_fallback` honesty of
the small-n path instead of silently upgrading it.
