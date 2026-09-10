---
subject: cross-provider-benchmark-operations
domain: llm-observability
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# cross-provider-benchmark-operations

Touched by `/intake` on 2026-09-04 from `github:duckdb/duckdb-wasm` @ `def100b4`
— a source from an entirely different domain (a browser-embedded analytics
engine) whose **comparative benchmark suite** turned out to carry a measurement
discipline this subject lacked.

## State

6 → 7 techniques. Landed **`handicap-disclosure-in-the-result-row`**.

The rule: in a comparative benchmark, the handicap applied to a target to make
the workload runnable is **part of the measurement** and belongs as a typed field
on the result row, at the finest grain where it is true. A workload that cannot
be weakened into something runnable gets its own verdict ("not expressible"),
never a slow number and never a missing cell.

## Why it was not already covered

The subject owned six techniques about *running* a fair comparison — matrix
runs, frozen samples, determinism stamping, budget ceilings, cancellation,
failure clustering — and the corpus owns
`a-claim-carries-its-sample-and-its-basis` for sample size. None of them owns the
case where the **task itself changed** for one target.

- Group.aggregate stores sample_count per metric key, so a group mean over a
  partial subtask set is detectable in the artifact - citable by
  partial-run-never-green.

The boundary the worker drew and I kept: `determinism-stamping` records how
*pinned* a call was; this records how *equal* the case was. And
`target-matrix-runs`' "normalize at the generation adapter, never in the dataset"
is explicitly excluded — absorbing a request-shape difference is adapter work,
while the handicap begins where the task changed.

## The evidence, and why the source class matters

A vendor publishing a benchmark **it wins** attached, per result, a string naming
exactly how each competitor's workload had to be weakened ("does not support
arithmetic operations and nested subqueries… some queries with nesting were
dropped"). The mechanism is not the string, it is the **carriage**: the field is
in the result schema, spreads into the same flat object as the timings, survives
serialization into the published result set as a column, and is read back by the
comparison surface — so no rendering path can show the number without it.

Two of my readings were wrong and the worker corrected both against the tree; I
verified both corrections:

- The concession is cleared for exactly four query ids, so it is **per-benchmark,
  not per-system** — the granularity rule is in the source, not invented.
- The cell renders `{value} *` **at rest**, plus a hover tooltip. The asterisk is
  the load-bearing half: a hover-only concession dies the moment the chart is
  screenshotted. I had recorded this as "wraps the cell", which undersells it.

**The strongest case for the discipline is exactly when the publisher wins**,
because that is when the omission is most self-serving and least likely to be
challenged. That framing is in the technique.

## One thing the source does NOT do, written as the standard anyway

A cell with no entry renders as a bare dash with no reason attached, so "not
expressible" and "not run" are indistinguishable there. The technique's third
clause closes that gap rather than lowering the rule to what the tree does.

## Lead banked in the source note

The same harness sets `minSamples: 1` for a cross-system comparison, so a
published competitive number may stand on a single sample. Return condition: when
a run mines a second comparative harness that *does* set a floor, the pair is a
technique about where the floor belongs — the harness or the renderer.

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
## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/cross-provider-benchmark-operations",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d7428af77cb01868",
  "disposition": "reverify",
  "coverage": "All 16 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A wide confidence interval spans zero and a materially harmful quality loss; a nonsignificant test cannot certify sufficiency.",
    "Two workers each see spend below the ceiling and launch expensive calls; atomic additions afterward still overshoot.",
    "Retry-After of sixty seconds exceeds a ten-second call budget but can be an ordinary rate limit.",
    "Different fixed seeds per sample preserve multiple draws while making the sampling schedule replayable."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/cross-provider-benchmark-operations",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.ncbi.nlm.nih.gov/books/NBK98982/",
      "scope": "Statistical guidance distinguishes noninferiority from lack of a significant difference; applied here to benchmark inference only."
    },
    {
      "url": "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/reference/rpc/google.cloud.aiplatform.v1",
      "scope": "Primary API documentation describes seeded output as mostly deterministic, not an absolute guarantee. Other current provider controls and historical implementations not refreshed."
    }
  ],
  "documents": {
    "cross-provider-benchmark-operations.md": {
      "disposition": "reverify",
      "reason": "Frozen shared cases support pairing but do not establish all comparability or representativeness. Non-significance is not sufficiency, seeds are not exact replay guarantees, and case-boundary spend checks are not hard ceilings. Synthetic adversarial cases can complement traffic. Selection, provider variation, missingness and judge bias need explicit design rather than universal best/cheap heuristics."
    },
    "techniques/async-run-queue-with-cancel.md": {
      "disposition": "reverify",
      "reason": "Atomic claim alone does not fence a stale worker after reclaim; need leases/heartbeats and attempt tokens. Staleness is suspected loss, not proven death. Cancelling needs terminal recovery and provider-specific interruption economics. Due-check/enqueue must be atomic, global concurrency matters, and unlimited crash retries can repeat paid calls indefinitely."
    },
    "techniques/budget-preflight-and-ceiling.md": {
      "disposition": "clarify",
      "reason": "Repaired nominal lower-bound claim, unknown prices, in-flight reservations and soft-stop versus hard ceiling. An atomic total does not atomically reserve future spend."
    },
    "techniques/cheapest-sufficient-configuration.md": {
      "disposition": "clarify",
      "reason": "Repaired non-significance as sufficient, selected-best bias, uncertainty on frontier, absolute requirements and one-frontier-point contradiction. Recommendation requires affirmative noninferiority evidence against a prespecified acceptable loss."
    },
    "techniques/dataset-sampling-anonymize-freeze.md": {
      "disposition": "reverify",
      "reason": "Anonymization is not guaranteed by regex/model scrub; source ids permit linkage and model scrubbing itself discloses content to a provider. Preserve task validity and authorization. Dedup/stratification change traffic weights; sample provenance and cluster structure matter. Frozen content hashes need context and rubric, and privacy corrections may require removing old sensitive artifacts, not merely a new version."
    },
    "techniques/determinism-stamping.md": {
      "disposition": "clarify",
      "reason": "Repaired seed acceptance as exact reproduction, sampling intent versus reproducibility and fixed seed schedules for multiple draws. Pinning controls and measured repeatability are separate metadata."
    },
    "techniques/entitlement-exhaustion-is-not-ill-health.md": {
      "disposition": "clarify",
      "reason": "Repaired Retry-After beyond budget as a scheduling fact rather than proof of quota exhaustion. Metered accounts also have credit/quota limits; halt cause and cost comparability require explicit evidence."
    },
    "techniques/failure-clustering-recommendations.md": {
      "disposition": "reverify",
      "reason": "A failure cluster suggests a diagnosis, not proof of cause. Shared model failures may be real task weakness, not dataset defects; one severe reproducible case can justify repair. Cheaper within a few percent is exploratory until sufficiency is established. Preserve multiplicity, denominator and missing cases."
    },
    "techniques/graded-case-difficulty.md": {
      "disposition": "reverify",
      "reason": "Difficulty depends on task and target; harder-tier outperformance can be real specialization. Pass-all tiers still establish baseline coverage and fail-all tiers diagnose limits. Three grades are not a minimum, three cases need not force every test to refuse, and pilot-calibrated frozen difficulty is legitimate. Pruning by observed tiers changes evidence and needs validation."
    },
    "techniques/handicap-disclosure-in-the-result-row.md": {
      "disposition": "reverify",
      "reason": "Useful per-cell disclosure but a typed field does not force a renderer to show it. Different tasks remain noncomparable despite a caveat; incapability can count against a prespecified task-success endpoint while remaining absent from latency metrics. Corrections can be auditable annotations without rerunning unchanged measurements. No-handicap columns are not evidence of hidden concessions."
    },
    "techniques/sampling-knobs-are-axes-not-strings.md": {
      "disposition": "reverify",
      "reason": "Typed knobs and validated adapters are useful, but strings can represent axes after parsing. Temperature can change output length and cost; cost is not the only reason to record a knob. Explicit parameters outrank suffixes and supported combinations/version must be checked. Run versus target settings depends on experiment design."
    },
    "techniques/target-matrix-runs.md": {
      "disposition": "reverify",
      "reason": "A shared manifest can coordinate separate target processes. Matching cases and judge does not remove time/order/rate-limit effects; randomize or block execution. Mechanical scoring is legitimate and same-family bias is a risk, not inevitable. New targets need multiplicity treatment but need not invalidate all old pairwise evidence."
    },
    "applications/python--target-matrix-runs.md": {
      "disposition": "reverify",
      "reason": "Historical commit/probes retained, not rerun. Task hashes alone are not iff comparability, and joining telemetry from the same calls is valid. Reported counts and no-revision/no-cost code claims remain scoped to cited commit; missing dataset source versions and prompt/case hash conflation need separate resolution."
    },
    "applications/rust--budget-preflight-and-ceiling.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Nominal priced subtotal is not a true lower bound; atomic accumulated micros cannot prevent multiple admitted calls exceeding the ceiling. Rounding small per-call costs can accumulate error. Partial status is necessary but total-cost reservation and retry accounting are unproven."
    },
    "applications/rust--determinism-stamping.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Accepted seeds do not establish exact reproducibility; repeated samples can use a frozen seed sequence. Frozen integer version is not a content pin. Unknown and not-applicable states need distinct aggregation semantics."
    },
    "applications/rust--entitlement-exhaustion-is-not-ill-health.md": {
      "disposition": "reverify",
      "reason": "Structural-only experiment retained, no behavioral arm rerun or maturity change. Typed-error collapse is a valid gap, but long waits do not prove entitlement exhaustion and metered accounts can exhaust quotas. Paired completed cases do not eliminate selection bias from skipped hard cases; all-target breaker failure can be real shared outage."
    }
  }
}
```
