---
layer: application
type: application
subject: modelled-performance-estimates
technique: one-ratio-then-a-capability-cap
stack: rust
status: forged
verified_on: 2026-09-03
---

# A memory-fit verdict rebuilt as one ratio plus a run-mode cap

A model-selection tool written in Rust — a workspace whose `llmfit-core` crate
computes, for every model in an embedded catalog, whether it will run on the
machine in front of you — carries the clearest worked example of this
technique the author has read, because it records the defect **and** the
refutation in both directions. Citations are against commit `d19380ba`.

## The composition

`score_fit` (`llmfit-core/src/fit.rs:936`) is three lines and does nothing but
compose the two halves:

```rust
fn score_fit(mem_required: f64, mem_available: f64, run_mode: RunMode) -> FitLevel {
    let memory_ratio = if mem_available > 0.0 { mem_required / mem_available }
                       else { f64::INFINITY };
    cap_for_run_mode(pure_ratio_verdict(memory_ratio), run_mode)
}
```

`pure_ratio_verdict` (`:907`) takes one `f64` and returns a `FitLevel` (`:193`,
a four-variant enum: `Perfect`, `Good`, `Marginal`, `TooTight`). It sees no
run mode, no hardware, no catalog. `cap_for_run_mode` (`:925`) takes a level
and a run mode and returns a level; it sees no ratio. Each is exercised over
its whole domain by its own test — `pure_ratio_verdict_band_boundaries_are_inclusive`
(`:2295`) walks the three constants, and
`cap_for_run_mode_only_lowers_perfect_on_non_gpu_paths` (`:2335`) walks the
tiers — which is only possible because neither function can reach the other's
input.

## The refutation, in both directions, in a comment

The comment block at `:885-898` is the artifact worth transplanting. It
records what the verdict used to depend on (`recommended_ram_gb`, described in
the same breath as "a catalog-wide `model_size * 2.0` heuristic") and the two
measured failures that removed it:

- **over-promise:** "a 23 GB model on a 24 GB card met its 22 GB
  recommendation and scored Perfect at 96% utilization, where it does not
  load";
- **under-rate:** "scoring a 9 GB model Good at 56% of a 16 GB card but
  Perfect on a 24 GB card, so the verdict tracked the card's size rather than
  how tightly the model fits it."

Two directions from one defect is exactly the signature the technique names,
and the fix was not a threshold move — it was removing the second input.

## The cap stops one tier down

`cap_for_run_mode` matches on the run mode and lowers **only** `Perfect`, and
only on the offload and CPU paths:

```rust
RunMode::Gpu | RunMode::TensorParallel => level,
RunMode::MoeOffload | RunMode::CpuOffload | RunMode::CpuOnly => match level {
    FitLevel::Perfect => FitLevel::Good,
    other => other,
},
```

The doc comment states the conjunction the cap enforces — "Perfect means
'fits with room to spare *and* runs on the GPU'" — and, in the next sentence,
the reason for stopping: "they are still genuinely runnable, which is why they
are not pushed down to Marginal."

## The derived band edge, and the unsizable pool

`FIT_MARGINAL_MAX_RATIO` is `0.98` (`:901`), and the derivation is written
directly above the constant (`:896`): "a pool filled to the last percent has
no room for allocator slack or fragmentation, so it does not load in
practice." The two lower edges are `0.60` and `0.85` (`:899-900`).

The conservative-tier rule appears at `:908`: a ratio that is not finite —
which `score_fit` manufactures with `f64::INFINITY` when the pool could not be
sized — resolves to `TooTight`, with the reason in the doc comment: "we can't
claim a model fits a pool we couldn't size." Its test is
`pure_ratio_verdict_treats_unknown_pool_as_too_tight` (`:2327`).

## Deviation

The technique asks for the ratio to be published beside the tier so a
borderline case can be argued with. `ModelFit` carries `fit_level` and the
memory figures it was computed from, but the ratio itself is recomputed
locally inside `score_fit` and never stored, so a consumer reading the
serialized fit re-derives it from two fields rather than reading the number
the verdict actually used. The standard stays as written: with three band
edges and a hard cut at `0.98`, the difference between `0.979` and `0.981` is
a tier, and that is precisely the case somebody will want to see.
