---
subject: cross-provider-benchmark-operations
domain: llm-observability
last_touched: 2026-09-07
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

## 2026-09-07 - a fifth truncation cause, from a 892-word video

[[2026-09-07-two-models-one-game-benchmark]]. A practitioner's cross-vendor comparison
was cut short on one arm by a subscription usage limit and not on the other; he says he
cannot compare token use, then reports the comparison anyway - which
`partial-run-never-green` already forbids, so the source's own error is a catch.

The gap sits next door to that catch. **`partial-run-never-green` says "all truncation
causes converge on one state" and enumerates four - cost ceiling, operator cancel,
pre-flight refusal, crash.** An enumeration is a claim, and every member of that one is
something the harness or its operator did. A halt imposed by the *target* is a fifth, and
it does not converge in the same way: it indicts the account rather than the provider, it
is **reproduced** by re-running where ill health is transient by construction, and it is
correlated with the target under test - which makes it the only cost signal available
when the plan is not priced per call. That technique also pushes the case away explicitly
("do not entangle it with the product's usage-limit machinery") - correct while you own
the harness, unavailable when the thing under test is sold as a plan.

Landed `entitlement-exhaustion-is-not-ill-health`: the discriminator is not the status
code (a burst limiter and an exhausted allowance return the same one) but **the stated
wait measured against the budget the run has to give it**, with a response naming no wait
recorded as ambiguous rather than sorted. Golden-path chain item 3 gained a clause saying
why both halves of `budget-preflight-and-ceiling` fail when the ceiling is not yours.

**Convergence carried the +1**: the fleet's memory harness recorded the same shape
independently on 2026-09-05 about its own internals - "any cap that can bind before the
declared budget is a predicate of the arm and belongs in the run header" - after a
hard-coded ceiling spent 665 of 6,000 given tokens and made every number in that arm a
fact about the ceiling. Inside the harness there, outside it here.

## Applied

`rust--entitlement-exhaustion-is-not-ill-health`, and the seam was **chosen to falsify**.
It largely succeeded: that runner already renders provider-side absence separately from
money-side absence and comments on the distinction in this technique's own terms, feeds
its breaker on generation failures only, fails open when every target is indicted, and
tests the winner paired on the cases both completed. The coverage half of the technique is
**already-covered** there and the application says so. What survives is one rule, missing
structurally: eleven typed error variants upstream - one of them the exact discriminator,
with a doc comment insisting it be kept distinct - collapsed to a boolean one line before
the breaker and the report. Ship 0: another session held uncommitted work in that file.
