---
domain: game-production
subject: prompt-fitness-and-evolution
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# prompt-fitness-and-evolution

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/prompt-fitness-and-evolution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:3a8fec9638692627",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Define the estimand before exclusion. Synthetic prompts can be legitimate controlled benchmark inputs, and abandoned outputs or retries may be failures relevant to first-attempt fitness. Keeping only the last success creates survivorship bias; a high excluded share alone does not invalidate a correctly scoped remaining population.",
    "Join exact artifact and evaluation identities, including relevant context and harness. A minimum trial floor does not erase a descriptive mean. Coverage alone does not remove selection bias; distinguish verdict-weighted and artifact-weighted means.",
    "A bundled rewrite can be compared as a package, although individual changes are not separately attributable. A taxonomy does not make a causal experiment, and three losses do not establish a strategy class cannot work. Preserve ancestry across architectural rewrites."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/prompt-fitness-and-evolution/prompt-fitness-and-evolution.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/exacbici.htm",
      "scope": "Official search evidence warns that normal binomial limits may be inaccurate with small samples or few failures; supports rejecting a universal three-trial z-test guarantee."
    },
    {
      "url": "https://arxiv.org/abs/1810.08240",
      "scope": "Original-author abstract search evidence describes time-uniform confidence sequences. Supports distinguishing sequential inference from repeated fixed-sample thresholds; no experimental dataset was rerun."
    }
  ],
  "documents": {
    "prompt-fitness-and-evolution.md": {
      "disposition": "reverify",
      "reason": "Reverify small-sample z confidence, optional stopping, retries and abandoned outputs excluded by outcome, categorical ban on rewrite comparisons and causal magnitude/direction of historical harness effects. The inference technique is repaired; application behavior was not changed."
    },
    "techniques/exclude-synthetic-fixtures-from-fitness.md": {
      "disposition": "reverify",
      "reason": "Define the estimand before exclusion. Synthetic prompts can be legitimate controlled benchmark inputs, and abandoned outputs or retries may be failures relevant to first-attempt fitness. Keeping only the last success creates survivorship bias; a high excluded share alone does not invalidate a correctly scoped remaining population."
    },
    "techniques/join-judge-verdicts-to-prompt-version.md": {
      "disposition": "reverify",
      "reason": "Join exact artifact and evaluation identities, including relevant context and harness. A minimum trial floor does not erase a descriptive mean. Coverage alone does not remove selection bias; distinguish verdict-weighted and artifact-weighted means."
    },
    "techniques/min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "clarify",
      "reason": "Repaired sample-size claims, sparse-binomial inference, repeated testing, adaptive allocation, unit of independence, missing outcomes, equivalence and manual-confidence fabrication."
    },
    "techniques/mutation-taxonomy.md": {
      "disposition": "reverify",
      "reason": "A bundled rewrite can be compared as a package, although individual changes are not separately attributable. A taxonomy does not make a causal experiment, and three losses do not establish a strategy class cannot work. Preserve ancestry across architectural rewrites."
    },
    "techniques/stamp-prompt-version-into-provenance.md": {
      "disposition": "reverify",
      "reason": "Version configurations and per-call context separately. A real regeneration under a new configuration needs the new stamp; copying stored output retains the original. Prompt-length correlation can reflect input difficulty, and shared vocabulary in output is not proof of provenance leakage."
    },
    "techniques/unjudged-is-null-not-zero.md": {
      "disposition": "reverify",
      "reason": "Null preserves missingness but complete-case means can still be biased. Backlog need not track winning traffic, and query-time variation can reflect new evidence. Unequal coverage needs investigation or a justified sampling design, not an automatic universal invalidation."
    },
    "applications/node--join-judge-verdicts-to-prompt-version.md": {
      "disposition": "reverify",
      "reason": "The historical join key omits content and context from its displayed form; verify standing filters and rubric selection. Averaging multiple judges per artifact weights heavily judged artifacts more. Historical 816-artifact deltas require the retained paired data and direction labels. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "reverify",
      "reason": "The displayed z-to-confidence map has a discontinuity: just below 1.28 gives about 0.64, then 0.8. Repeated stopping and epsilon-greedy assignment lack calibrated inference here; a point gap below 0.05 does not prove equivalence, and the capped manual number is not measured confidence. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--mutation-taxonomy.md": {
      "disposition": "reverify",
      "reason": "A TypeScript union with a switch lacking default is not automatically exhaustive under every return type/compiler setting. Exact baseline capture is useful; multi-axis transforms remain comparable as packages and historical quality gains are not a newly verified causal result. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
