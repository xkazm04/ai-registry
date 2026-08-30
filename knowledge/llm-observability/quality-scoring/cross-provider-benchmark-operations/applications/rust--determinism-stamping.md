---
layer: application
type: application
subject: cross-provider-benchmark-operations
technique: determinism-stamping
stack: rust
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: two-half determinism stamps and the weakest-wins fold in LightTrack

LightTrack stamps every benchmark verdict with how reproducible it actually
was, across two decision records (D12, D13 in
`docs/BENCHMARK_FRAMEWORK.md:246-278`), and folds the stamps with pure,
unit-tested functions in `crates/core/src/collective/rigor.rs`.

## The vocabulary and the two halves

Three levels, ordered weakest first — `sampled` < `best-effort` < `exact`
(`BENCHMARK_FRAMEWORK.md:265`). `exact` requires every sampling control
pinned *including a seed* (OpenAI, Gemini take one); the Anthropic Messages
API has no seed and the `claude -p` CLI has no sampling knobs at all, so
those paths stamp `best-effort` — degraded and disclosed, never excluded
(`BENCHMARK_FRAMEWORK.md:243-245, 271-272`).

D13 extends the stamp to generation, not just judging: compare and pairwise
modes generate the candidate they grade, so the run report carries two facts
—

```json
"determinism": "best-effort",
"determinism_detail": { "generation": "best-effort", "judging": "exact" }
```

with the headline being the **weaker** half and a `null` half meaning "that
half did not happen" (`BENCHMARK_FRAMEWORK.md:253-264`). `sampled` is a
deliberate third state: with `--gen-samples > 1` the operator wants a
distribution of candidates, and pinning would silently delete the feature —
so it samples and says so (`BENCHMARK_FRAMEWORK.md:266-269`).

## The fold: weakest wins, silence voids

`rigor.rs` implements the aggregation with two properties worth stealing:

- `weakest_determinism` (`rigor.rs:50-55`) folds two stamps to the weaker,
  and an unrecorded stamp (`None`) **absorbs**: "an unrecorded run cannot
  vouch for the rest." Unknown labels rank weakest (`rank`, `rigor.rs:40-46`)
  "so a fold can never *strengthen* a claim."
- `canon_determinism` (`rigor.rs:31-37`) clamps arriving stamps to the
  closed three-level vocabulary — anything else becomes `None`, "never a
  fourth level, which would only add cardinality to the fingerprint
  surface" (`rigor.rs:26-28`). The dataset version integer never leaves the
  instance for the same reason (`rigor.rs:16-19`).

The four-state `Coverage` enum (`rigor.rs:62-98`) applies the same doctrine
to boolean facts like "frozen dataset": `All`/`None` are complete claims;
agreement-with-silence degrades to `Mixed`, "because a claim resting on
silence is not a claim."

## The dataset pin closes the loop

An exact stamp over mutable cases proves nothing, so every run over a
referenced dataset also records `dataset_frozen` and `dataset_version` as of
run time and prints a note when the set is not frozen — recording the truth
without changing the policy: an unfrozen dataset still runs, "it just no
longer *reads* as pinned" (`BENCHMARK_FRAMEWORK.md:275-278`).

## What transplants

The closed vocabulary, the two-half stamp with weakest-wins headline, the
`None`-absorbs fold, and stamping intent (`sampled`) over capability are all
portable. The specific provider capabilities are not — re-derive which of
your access paths can honestly claim `exact`, and expect the answer to
change across provider API revisions.
