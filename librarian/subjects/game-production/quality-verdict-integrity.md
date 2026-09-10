---
domain: game-production
subject: quality-verdict-integrity
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# quality-verdict-integrity

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/quality-verdict-integrity",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2a3fb8d54d6fcc74",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Human confirmation is reference-label provenance, not guaranteed ground truth. Sample size and agreement threshold need uncertainty and intended-population weighting; chance correction is not universally stricter. Hold out calibration targets from tuning and retain raw-score errors when relevant.",
    "Unknown failures may justify a reversible hold, not a confirmed current defect. Costs are not universally ten minutes versus one model draw; human verdicts also need scope and binding. Re-grading priorities and missing observations require explicit policy.",
    "Select within rubric family and applicable content/configuration, not a global newest version that can hide valid current evidence. Whitespace can change model input. The claimed forty-times noise divides 16.9 by mean drift 0.4 rather than dispersion 3.1; neither ratio alone establishes statistical significance."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/quality-verdict-integrity/quality-verdict-integrity.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "quality-verdict-integrity.md": {
      "disposition": "reverify",
      "reason": "Reverify timestamps as proof of changed content, strict ordering of condemnation/reuse costs, missing context bindings, newest-present rubric selection and historical effect-size arithmetic. The content-binding technique is repaired; sibling projection and standing policy still need reconciliation."
    },
    "techniques/calibration-against-confirmed-labels-only.md": {
      "disposition": "reverify",
      "reason": "Human confirmation is reference-label provenance, not guaranteed ground truth. Sample size and agreement threshold need uncertainty and intended-population weighting; chance correction is not universally stricter. Hold out calibration targets from tuning and retain raw-score errors when relevant."
    },
    "techniques/condemn-vs-elevate-asymmetry.md": {
      "disposition": "reverify",
      "reason": "Unknown failures may justify a reversible hold, not a confirmed current defect. Costs are not universally ten minutes versus one model draw; human verdicts also need scope and binding. Re-grading priorities and missing observations require explicit policy."
    },
    "techniques/content-hash-binding.md": {
      "disposition": "clarify",
      "reason": "Repaired target plus criterion-relevant context binding, request-snapshot races, scheme compatibility, collision-risk choice, source/derivative identity and metadata-only timestamp updates."
    },
    "techniques/rubric-version-supersession.md": {
      "disposition": "reverify",
      "reason": "Select within rubric family and applicable content/configuration, not a global newest version that can hide valid current evidence. Whitespace can change model input. The claimed forty-times noise divides 16.9 by mean drift 0.4 rather than dispersion 3.1; neither ratio alone establishes statistical significance."
    },
    "techniques/sibling-context-projection.md": {
      "disposition": "reverify",
      "reason": "Required context can exceed caps; omitted reference material must not yield a complete judgment. Low nonempty rate may be correct for standalone artifacts. Ungraded siblings can be necessary evidence when uncertainty is labeled; context also needs binding and instruction/data separation."
    },
    "techniques/stale-superseded-unknown-classification.md": {
      "disposition": "reverify",
      "reason": "A later write may only change bookkeeping and does not prove stale content. Supported old serializers can compare schemes through explicit compatibility. Missing current hash, rubric or context can also produce unknown; keep reason dimensions even if one display state has precedence."
    },
    "applications/node--condemn-vs-elevate-asymmetry.md": {
      "disposition": "reverify",
      "reason": "The historical isStanding predicate includes unknown, so using it for a quality mean conflates holds with measured quality. Judge-class filtering and human exceptions need scope checks; preserve failed required gates when another layer is deferred. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--content-hash-binding.md": {
      "disposition": "reverify",
      "reason": "The historical 32-bit FNV digest is not a universal acceptance-cache recommendation. The displayed binding omits changing sibling context, and updatedAt can be metadata-only. Published machine-specific checkout roots need removal; allowlists also require validation. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--calibration-against-confirmed-labels-only.md": {
      "disposition": "reverify",
      "reason": "Three provisional targets do not establish human calibration, as the application acknowledges. The effect sizes and control mean/standard deviation do not alone establish significance; newest-present selection requires rubric-family and current-content scope. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
