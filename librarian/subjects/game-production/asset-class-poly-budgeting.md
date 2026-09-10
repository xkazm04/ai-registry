---
domain: game-production
subject: asset-class-poly-budgeting
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# asset-class-poly-budgeting

## Architecture review - 2026-09-10

Read all nine documents. Clarified units, request provenance, allocation and
quality evidence. Both historical applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/asset-class-poly-budgeting",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:98668e0d5aba7cca",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A duplicated triangle mesh can produce a 2x ratio without a quad-unit error.",
    "Quad-dominant topology does not guarantee exactly two triangles per counted face.",
    "A budget of one passes a positive-number guard but halves to zero quads.",
    "A shared mesh can save storage while multiple instances still render triangles.",
    "A smaller result can satisfy both quality and a maximum budget."
  ],
  "sources": [
    {
      "url": "https://docs.meshy.ai/en/api/text-to-3d",
      "scope": "Current model/configuration-dependent topology and target settings; does not validate historical consumer or exact quad conversion."
    },
    {
      "url": "https://dev.epicgames.com/documentation/unreal-engine/working-with-naniteenabled-content",
      "scope": "Current documentation includes skeletal meshes; counterexample to blanket exclusions, not project eligibility or performance evidence."
    }
  ],
  "documents": {
    "asset-class-poly-budgeting.md": {
      "disposition": "clarify",
      "reason": "Define units, stages, provider configuration and separate quality/performance evidence."
    },
    "techniques/triangles-as-the-authored-unit.md": {
      "disposition": "clarify",
      "reason": "Avoid universal loader claims and preserve legitimate companion budgets and migration uncertainty."
    },
    "techniques/provider-face-limit-conversion.md": {
      "disposition": "clarify",
      "reason": "Restrict halving to verified pure quads; reject infeasible or invalid requests without dropping limits."
    },
    "techniques/quad-trap-detection.md": {
      "disposition": "clarify",
      "reason": "Treat ratio bands as diagnostic leads and distinguish targets from hard limits."
    },
    "techniques/budget-shapes-output-not-just-caps.md": {
      "disposition": "clarify",
      "reason": "Scope causal claims and preserve legitimate geometry uses and experiment evidence."
    },
    "techniques/part-split-budget-division.md": {
      "disposition": "clarify",
      "reason": "Validate allocation inputs, feasibility and assembly accounting; distinguish storage reuse from instance cost."
    },
    "techniques/class-ceiling-vs-requested-budget.md": {
      "disposition": "clarify",
      "reason": "Separate unknown/inapplicable status, hard ceilings and advisory adherence across stages."
    },
    "applications/node--provider-face-limit-conversion.md": {
      "disposition": "reverify",
      "reason": "Reverify helper guards and provider/model semantics; retain historical runtime claims as unverified."
    },
    "applications/process--class-ceiling-vs-requested-budget.md": {
      "disposition": "reverify",
      "reason": "Reverify local policy parity, split validation and version-specific engine support."
    }
  }
}
```
