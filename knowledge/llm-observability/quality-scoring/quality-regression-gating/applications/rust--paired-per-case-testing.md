---
layer: application
type: application
subject: quality-regression-gating
technique: paired-per-case-testing
stack: rust
status: forged
verified_on: 2026-09-20
verified_against: rust@1.96
---

# Rust: paired per-case testing in LightTrack's benchmark runner

LightTrack's verdict math lives in `crates/runner/src/stats/paired.rs`, and it
realizes the technique end to end — including the refusal paths and the fixed
alpha that the technique layer describes abstractly.

## The fixed alpha, in code

```rust
// crates/runner/src/stats/paired.rs:22-25
/// Family-wise significance level: the probability that *any* of a run's comparisons produces a
/// false `regressed`. Fixed rather than configurable — a benchmark tool whose confidence level is a
/// knob invites tuning it until the answer is the desired one.
pub(crate) const ALPHA: f64 = 0.05;
```

A `pub(crate) const`, not a config key: the only way to change it is a
reviewed code change. Everything downstream derives from it —
`bonferroni_alpha(ALPHA, m)` and `bonferroni_z(ALPHA, m)` at
`paired.rs:119-120` produce the per-comparison threshold and critical value, so
there is exactly one number to audit.

## The length check that was not an identity check

This is the place the repository got it wrong first, and the correction is
the clearest realization of the technique's identity rule in the bundle.

`paired_deltas` (`paired.rs:66-72`) pairs **by position**, having checked
only that the two vectors are the same non-zero length. Its own doc comment
now states why that is not the same check: "a compare run's per-case vector
is compacted past errored cells, so two targets that each failed a different
case arrive here the same length and one position out". It survives as a
narrow helper for callers whose two vectors are built from one collection
and are aligned by construction (`calibrate_batch`, which maps `single` and
`batched` out of a single `pairs` vector); the doc comment names that as its
only legitimate caller. `crates/runner/src/stats/cases.rs` carries the
general path.

`CaseScore` (`cases.rs:27-29`) is the type change that makes the defect
unrepresentable: a score that knows its case, where the id is the 1-based
case index the run report already wrote on every logged case — "the identity
was persisted all along and thrown away on the way back in"
(`cases.rs:23-25`). `paired_deltas_by_case` (`cases.rs:125-162`) indexes
both sides into a `BTreeMap<u32, f64>`, so the deltas come back in case
order however the caller built its vectors — "two runs of one matrix can
never produce a different pairing" (`cases.rs:145-146`).

The refusals are a named enum, not a bare `None`: `Unpairable::{Empty,
Disjoint, DuplicateCaseIds, TooFewShared(n)}` (`cases.rs:47-58`), each with
its own `reason()` string (`cases.rs:62-80`), because "the case sets do not
overlap", "a report names one case twice" and "they share a single case"
are three different facts about a run. Everything else pairs the
intersection: refusing outright "would delete the `best` line from most real
matrices and buy no correctness, because the retained cases are genuinely
matched" (`cases.rs:16-18`).

## The subset travels with the deltas

`PairedByCase` (`cases.rs:86-93`) carries `retained` and `dropped` beside
the deltas, and `retained` is documented as "the **real** n of the paired
test — the figure that must reach the power disclosure, not either side's
own case count". `verdict` copies both onto the result
(`paired.rs:173-174` → `paired_cases` / `paired_dropped`, serialized as
`paired_cases` and `paired_cases_dropped` at `paired.rs:243-244`) and
pushes `subset_caveat()` whenever anything was dropped
(`paired.rs:181-183`). A second caveat covers the prefix hazard: when the
baseline run's report logged only a bounded preview of its cases, the
pairing is over that prefix — "a valid paired test, but a systematic subset
rather than a random one" (`paired.rs:186-193`).

## The zero-stderr edge case, and why it needed the identity fix first

`paired_z` (`paired.rs:87-101`) handles "every case moved by the same
amount" exactly as the technique prescribes: zero stderr with a non-zero
mean reports an infinite z and p = 0 — a *perfectly consistent* change is
maximal evidence, not a discard. `n < 2` returns `None`: no fabricated p.

Composed with the old positional pairing, that rule was the amplifier. The
regression test `equal_lengths_are_not_a_matching_case_set`
(`cases.rs:188-208`) is the mechanism in its smallest form: two targets
scored on a monotone difficulty ladder, case sets offset by one, equal
lengths ("the count check would pass"). By case id the shared cases are
identical and every delta is zero; by position every delta is the ladder's
own step — a constant, therefore zero spread, therefore p = 0. The
higher-level twin `superiority_never_pairs_two_different_cases`
(`paired.rs:518-536`) asserts the same at the level of the test that decides
`best`. Both are fixtures, not field measurements: the constant they produce
is the fixture's difficulty step and carries no meaning outside it.

Comparability itself is established upstream per
`docs/BENCHMARK_FRAMEWORK.md:233-238`: each target pairs against **its own
previous comparable run** (same mode, same target, and `dataset_version`
when both recorded it); where none exists, the report says so and falls back
to the unpaired CI test flagged `method: "unpaired-ci"` — the
flagged-fallback rule, verbatim. Note what left that list: equal case count
was a comparability criterion and is not one any more, because the identity
pairing made it neither necessary nor sufficient.

## Composition that only adds detection

`verdict()` (`paired.rs:113+`) composes the absolute-floor test (whole
corrected CI below `baseline_score`) with the paired-drop test;
`regressed` if **either** fires (`BENCHMARK_FRAMEWORK.md:297-301`). The
correction can trade a false alarm for a real detection; it cannot disarm
the gate. A benchmark with no `baseline_score` has opted out of gating:
paired statistics are still reported, status stays `no_baseline`.

## Caveats in the artifact, not the docs

The `SigVerdict` struct (`paired.rs:30-53`) carries `status`, `method`,
`scalar_fallback`, the surviving `alpha`, the family size `comparisons`,
`p_value`, `mean_delta`, `paired_cases`, `paired_dropped`, and
`caveats: Vec<String>`. Two caveats are pushed mechanically: the `n < 2`
scalar fallback ("a bare mean compare, not a
test", `paired.rs:143-148`) and — every time the floor test runs — the
baseline-uncertainty admission (`paired.rs:160-168`): `baseline_score`
carries no stderr, so "this run's uncertainty is accounted for and the
baseline's is not". The framework doc (`BENCHMARK_FRAMEWORK.md:303-307`)
names the paired test as the structural fix, which is why the paired
verdict outranks the floor test wherever both can run.

The downstream promotion gate (`BENCHMARK_FRAMEWORK.md:309-317`) then reads
the runner's verdict rather than re-deriving it — one definition of
"regressed" in the product — and preserves the `scalar_fallback` honesty of
the small-n path instead of silently upgrading it.
