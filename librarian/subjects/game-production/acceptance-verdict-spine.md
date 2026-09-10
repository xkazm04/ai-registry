---
domain: game-production
subject: acceptance-verdict-spine
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# acceptance-verdict-spine

## Architecture review - 2026-09-09

Read all ten documents. Corrected aggregate verdict semantics, required-evidence
binding, structured claim handling and explanation boundaries. Removed machine-specific
checkout roots from all three applications, which remain reverify work.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/acceptance-verdict-spine",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ed7fbdae02f93a60",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Required checks [deferred, fail] produce aggregate fail even when the first diagnostic is deferred.",
    "A stored runner pass for artifact A cannot clear a deferred requirement for edited artifact B.",
    "A structural pass plus absent required craft judgment is incomplete acceptance.",
    "An UNGRADED reason prefix with status=pass still gets counted by status-only consumers.",
    "Identical resolver functions supplied different snapshots can disagree; an open disclosure thunk can rerun on each render.",
    "An empty dependency map or passing authoring rows do not prove integrated runtime behavior."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
      "scope": "Non-color cue requirement only; no consumer accessibility evaluation."
    }
  ],
  "documents": {
    "acceptance-verdict-spine.md": {
      "disposition": "clarify",
      "reason": "Replace total-authority-order claims with scoped deterministic resolution, complete evidence binding and failure-dominant required-check aggregation."
    },
    "techniques/three-layer-merge-order.md": {
      "disposition": "clarify",
      "reason": "Bind all evidence, preserve conflicts and make required missing judgment unmeasured rather than structural success."
    },
    "techniques/first-non-pass-reporting-in-all-of.md": {
      "disposition": "clarify",
      "reason": "Separate diagnostic ordering from aggregate truth, cover empty/not-run members and avoid copying a leaf evidence tier."
    },
    "techniques/explain-why-this-verdict.md": {
      "disposition": "clarify",
      "reason": "Require snapshot-bound full-record explanations; distinguish applied layers from deciding rules and disclosure render costs."
    },
    "techniques/gate-check-dependency-map.md": {
      "disposition": "clarify",
      "reason": "Make missing dependencies unmeasured and distinguish dependency labels from evidence of integrated behavior."
    },
    "techniques/hardcoded-pass-antipattern.md": {
      "disposition": "clarify",
      "reason": "Replace never-failed inference with scoped negative/evidence tests and distinguish direct checks from terminal aggregation."
    },
    "techniques/ungraded-marker-doctrine.md": {
      "disposition": "clarify",
      "reason": "Separate claims, verification and acceptance structurally; registration and reason prefixes do not prove execution."
    },
    "applications/node--three-layer-merge-order.md": {
      "disposition": "reverify",
      "reason": "Reverify historical overlay behavior, runner binding, required judgment and cross-surface snapshot parity."
    },
    "applications/process--hardcoded-pass-antipattern.md": {
      "disposition": "reverify",
      "reason": "Reverify incident and fallback behavior; distinguish named dependencies from integration proof."
    },
    "applications/react--explain-why-this-verdict.md": {
      "disposition": "reverify",
      "reason": "Reverify full-record parity and render cost; scope first-non-pass and accessibility claims."
    }
  }
}
```
