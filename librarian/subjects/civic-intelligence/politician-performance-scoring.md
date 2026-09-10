---
domain: civic-intelligence
subject: politician-performance-scoring
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# politician-performance-scoring

## Architecture review - 2026-09-09

Read all nine owned documents. Corrected arithmetic, identity, lineage and inference boundaries. Historical application dates and incident claims are retained as unrefreshed evidence. Consumer runtime, writer atomicity, cohort counts, source freshness, UI tie behavior and release privacy remain reverify leads.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/politician-performance-scoring",
  "date": "2026-09-09",
  "baseline": "78850ba5",
  "digest": "sha256:a868c74cdc34651c",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "Rounded raw gap can be zero while individually rounded values differ (1.24 versus 1.26).",
    "Proportional weight vectors can come from different people; normalization does not enforce one voice.",
    "A matching formula ref can accompany stale inputs; an unstamped record can hold a newer unknown correction.",
    "Zero published weight makes points/weight undefined; missing-component renormalization creates different instruments."
  ],
  "sources": [
    {
      "url": "https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html",
      "scope": "Primary general composite-indicator methodology; no validation of this index."
    },
    {
      "url": "https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance",
      "scope": "Primary de-identification governance scope; no privacy certification for reader aggregates."
    }
  ],
  "documents": {
    "politician-performance-scoring.md": {
      "disposition": "clarify",
      "reason": "Narrow activity-proxy claims, population and unresolved identity handling; remove unsupported legal verdicts."
    },
    "techniques/weighted-component-index.md": {
      "disposition": "clarify",
      "reason": "Distinguish distinct components from statistical independence and specify missing-component comparability."
    },
    "techniques/saturation-caps.md": {
      "disposition": "clarify",
      "reason": "Treat caps as a declared scoring policy, not an empirical quality threshold or universal percentile rule."
    },
    "techniques/formula-lineage-stamping.md": {
      "disposition": "clarify",
      "reason": "Separate formula identity, source freshness and atomic write guarantees."
    },
    "techniques/structural-low-score-corrections.md": {
      "disposition": "clarify",
      "reason": "Replace inferred character and universal tail claims with dated neutral facts; allow explicit methodology corrections."
    },
    "techniques/comparison-fairness.md": {
      "disposition": "clarify",
      "reason": "Use one consistent displayed-value comparison; scope cohort and missing-data claims."
    },
    "techniques/participatory-reweighting.md": {
      "disposition": "clarify",
      "reason": "Separate normalization, voter identity and privacy; handle zero weights and missing components."
    },
    "applications/node--formula-lineage-stamping.md": {
      "disposition": "reverify",
      "reason": "Preserve dated source witness and flag cohort, missing provenance and atomicity checks."
    },
    "applications/react--participatory-reweighting.md": {
      "disposition": "reverify",
      "reason": "Correct privacy and identity claims while preserving historical implementation evidence."
    }
  }
}
```
