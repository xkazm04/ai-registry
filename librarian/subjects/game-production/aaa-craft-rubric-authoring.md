---
domain: game-production
subject: aaa-craft-rubric-authoring
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# aaa-craft-rubric-authoring

## Architecture review - 2026-09-09

Read all 14 documents. Corrected overlap arithmetic, evidence sufficiency,
ceiling policy, calibration and source-applicability claims. All four applications
retain explicit reverify decisions.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/aaa-craft-rubric-authoring",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:52b4f1406ea51e0f",
  "disposition": "clarify",
  "coverage": "All 14 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Repeating score 1 changes the lowest-two mean from 2.5 for [1,4,4] to 1 for [1,1,4,4]; only an exact minimum has this duplication invariance.",
    "A filmstrip can omit a between-frame defect and cannot establish curve contents.",
    "A current product reference can change without a rubric edit unless the specimen is pinned.",
    "A type-specific ceiling can be reached while a release bar remains unmet.",
    "Existing scan paths can be empty or bypassed by indirect imports; path existence is not complete isolation proof."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2306.05685",
      "scope": "Primary abstract: position, verbosity and self-enhancement bias in evaluated conversational judges; no game-craft replication."
    },
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
      "scope": "3:1 scope and exceptions for required visual information; no game-art or consumer UI certification."
    },
    {
      "url": "https://tech.ebu.ch/publications/r128",
      "scope": "Publication target -23 LUFS; does not identify or validate the unnamed platform specification in the historical application."
    }
  ],
  "documents": {
    "aaa-craft-rubric-authoring.md": {
      "disposition": "clarify",
      "reason": "Qualify fixed-reference grading, empirical prescriptions, calibration and diagnostic claims."
    },
    "techniques/capped-disqualifiers.md": {
      "disposition": "clarify",
      "reason": "Treat cap counts as convention and distinguish missing measurements, detection uncertainty and applicability."
    },
    "techniques/ceiling-as-a-market-assumption.md": {
      "disposition": "clarify",
      "reason": "Separate observed quality from policy ceiling; remove permanent capability forecasts and causal distribution claims."
    },
    "techniques/checkable-against-the-stored-artifact.md": {
      "disposition": "clarify",
      "reason": "Define sufficient evidence packages, sampling limits, disagreement diagnosis and authorized routing."
    },
    "techniques/criterion-set-coverage-audit.md": {
      "disposition": "clarify",
      "reason": "Remove unsourced effect size and prevent partial coverage disclosure from authorizing release."
    },
    "techniques/criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "Qualify criterion-count heuristics, permit multiple sources and retain healthy requirements."
    },
    "techniques/deliberately-overlapping-criteria.md": {
      "disposition": "clarify",
      "reason": "Correct lowest-k duplicate sensitivity; qualify evidence for overlap and require adjudicated finding merges."
    },
    "techniques/lens-versioning-as-invalidation.md": {
      "disposition": "clarify",
      "reason": "Preserve historical standing and bind editorial changes, active runs and pilot observations to exact snapshots."
    },
    "techniques/named-benchmark-anchors-per-level.md": {
      "disposition": "clarify",
      "reason": "Require pinned exemplars and replace process-label anchors and unsupported distribution diagnostics."
    },
    "techniques/question-form-criteria-for-open-judgment.md": {
      "disposition": "clarify",
      "reason": "Qualify artifact-only viewer inference, disagreement attribution and separate-call/cap guarantees."
    },
    "applications/node--deliberately-overlapping-criteria.md": {
      "disposition": "reverify",
      "reason": "Reverify code isolation, overlap calibration and contrast applicability; historical witness unchanged."
    },
    "applications/process--ceiling-as-a-market-assumption.md": {
      "disposition": "reverify",
      "reason": "Reverify ceiling forecasts, duplicate policy sources and inconsistent A2/A3 display example."
    },
    "applications/process--checkable-against-the-stored-artifact.md": {
      "disposition": "reverify",
      "reason": "Reverify contradictory routing example and limits of filmstrip evidence."
    },
    "applications/process--criterion-with-a-cited-source.md": {
      "disposition": "reverify",
      "reason": "Reverify unnamed loudness source, talks and implementation; scope external judge research."
    }
  }
}
```
