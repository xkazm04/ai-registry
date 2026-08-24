---
subject: cross-provider-benchmark-operations
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# cross-provider-benchmark-operations

First touch: [[2026-08-23-6]], external reconcile against
`EleutherAI/lm-evaluation-harness` @ `4e7e0d47` (0.4.13.dev0 - an
in-development version; the shallow clone carries no tags, stated as such in
the application). Gained `python--target-matrix-runs` (uncovered);
single-stack debt cleared. Hint confirmed with rule 1 inverted. Executed
evidence: offline editable install, two synthetic tasks plus a group,
task_hashes reproducibility and conflation probes.

## Technique-edit candidates (single-sighted, banked)

- target-matrix-runs rule 1 as written assumes one process owns the whole
  cross product; the survivable form: the matrix's non-target axes are
  declared once and shared verbatim, and each target records a fingerprint
  proving it ran that declaration.
- The workload fingerprint should keep the case digest separable from the
  prompt-rendering digest (measured: --num_fewshot changed task_hashes while
  the ordered doc_hash list was unchanged) - so a mismatch names which moved.
- dataset-sampling-anonymize-freeze: "a dataset reference without a pinned
  revision is not a freeze" - 845 dataset-bearing task configs, zero pins,
  passthrough mechanism exists unused. And: a prefix limit is not a sample
  (--limit is islice; a fractional limit re-selects as the dataset grows).

## Open leads

- The request-cache key omits --limit and the dataset - a cache-hit
  comparability hazard, possibly upstream-reportable.
- Four seeds land in results config; NO provider-side sampling stamp exists -
  a second source for determinism-stamping.
- Distributed padding clones the last request to equalize ranks - can padded
  responses leak into metrics?
- predict_only / bypass metric is an unscored-run state adjacent to
  partial-run-never-green.
- lm_eval/decontamination/ (train-test overlap) is an uncovered surface with
  no home subject in this bundle.

## Cross-subject proposals

- Group.aggregate stores sample_count per metric key, so a group mean over a
  partial subtask set is detectable in the artifact - citable by
  partial-run-never-green.
