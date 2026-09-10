---
domain: game-production
subject: production-work-prioritization
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# production-work-prioritization

## Architecture review - 2026-09-10

Read and assessed all 14 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-work-prioritization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:247ac0522f5693f1",
  "disposition": "reverify",
  "coverage": "All 14 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "An acceptance dependency need not force all authoring to wait; staged checks and test doubles can make upstream work judgeable. Granularity and sparsity bands are policies, not proofs that an edge is invalid.",
    "A ceiling is not a target and should not be hidden from the producer. Eleven can satisfy up to twelve without being deficient. Allocate a total by normalized weights, not ambiguous division by a role weight; under-budget work can be efficient and complete.",
    "Max is not invariant to candidate partition and can undercount disjoint outputs. Dependencies still blocked by other work are not necessarily unblocked; completed outputs must not lend their maximum to one unfinished output. Union of actual newly eligible dependents answers a different, stronger question."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-work-prioritization/production-work-prioritization.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "production-work-prioritization.md": {
      "disposition": "reverify",
      "reason": "Reverify unsupported universal ladder ordering, absent evidence as zero value, graph constraints that prohibit useful parallel work and max fan-out invariance. The mixed-known/unknown readiness rule is repaired; other ranking policy remains uncalibrated."
    },
    "techniques/blocked-if-any-produced-feature-is-blocked.md": {
      "disposition": "clarify",
      "reason": "Repaired required-output conjunction, mixed unknown handling, explicit eligibility policy and partial work scope. Empty bindings do not establish zero real-world value; waiting is hard or soft according to the actual prerequisite."
    },
    "techniques/curriculum-prerequisite-graph.md": {
      "disposition": "reverify",
      "reason": "An acceptance dependency need not force all authoring to wait; staged checks and test doubles can make upstream work judgeable. Granularity and sparsity bands are policies, not proofs that an edge is invalid."
    },
    "techniques/declared-scope-as-a-shaping-budget.md": {
      "disposition": "reverify",
      "reason": "A ceiling is not a target and should not be hidden from the producer. Eleven can satisfy up to twelve without being deficient. Allocate a total by normalized weights, not ambiguous division by a role weight; under-budget work can be efficient and complete."
    },
    "techniques/fan-out-max-not-sum.md": {
      "disposition": "reverify",
      "reason": "Max is not invariant to candidate partition and can undercount disjoint outputs. Dependencies still blocked by other work are not necessarily unblocked; completed outputs must not lend their maximum to one unfinished output. Union of actual newly eligible dependents answers a different, stronger question."
    },
    "techniques/five-factor-weighted-scoring.md": {
      "disposition": "reverify",
      "reason": "Zero contribution for missing evidence is a ranking policy that penalizes unknowns, not an empirical zero. State missingness and correlated factors; override logs are useful but not the only trustworthy calibration evidence."
    },
    "techniques/fixed-deadline-scope-triage.md": {
      "disposition": "reverify",
      "reason": "Scope is not the only variable under a fixed date: resources and delivery design may change. Cutting optional work cannot repair a must-only overload; protect required non-path obligations and allow evidence-driven re-planning, not only checkpoint ritual."
    },
    "techniques/null-success-odds-with-sample-provenance.md": {
      "disposition": "reverify",
      "reason": "Rate times capped count is a selection heuristic, not calibrated confidence or freshness. A very low twenty-run rate can lose to a perfect one-run rate. Label priors and null policy; do not present a missing weighted component as an observed rate."
    },
    "techniques/urgency-ladder-for-what-next.md": {
      "disposition": "reverify",
      "reason": "Determinism does not establish correct urgency. A trivial failure need not outrank new critical work; missing comparison data is unmeasured rather than evidence of no disagreement. Ranking never-produced last is separate from its progress display."
    },
    "techniques/vertical-slice-as-the-first-milestone.md": {
      "disposition": "reverify",
      "reason": "Slice completion needs the declared end-to-end observation, but components can be built in parallel. Authored static input is not inherently a stub. Cuts must preserve the agreed milestone, and previous integration does not eliminate new project risk."
    },
    "applications/node--five-factor-weighted-scoring.md": {
      "disposition": "reverify",
      "reason": "The historical score shares fan-out between urgency and impact, requiring explicit policy. Zeroing readiness alone is not an eligibility filter; confirm blocked exclusion and mixed unknowns. A heuristic binding label does not establish its accuracy. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--null-success-odds-with-sample-provenance.md": {
      "disposition": "reverify",
      "reason": "The displayed capped-rate product does not guarantee a one-run perfect pattern loses to every twenty-run pattern or account for sample age. The 0.7/0.3 blend needs explicit normalization with a missing component; nullable types do not enforce rendering truth. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--vertical-slice-as-the-first-milestone.md": {
      "disposition": "reverify",
      "reason": "The displayed 30%-of-all-items slice metric does not establish a playable path. However, per-item ranking is not inherently unable to prioritize path work; its inputs and policy decide that. Source search alone cannot establish every consumer absent. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--urgency-ladder-for-what-next.md": {
      "disposition": "reverify",
      "reason": "The shared ladder reduces duplication but does not prevent bypasses. The glossary calls pending not started while the technique calls it produced/in flight. Missing drift input must remain visible as unmeasured, and never-produced ordering does not determine progress. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
