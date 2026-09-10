---
domain: game-production
subject: catalog-pipeline-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# catalog-pipeline-authoring

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/catalog-pipeline-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:0f122090d1189776",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "One seed can pass while an unvisited checker branch reads a different field.",
    "An exception count can stay constant while a new violating identity replaces an old one.",
    "A known failure plus a deferred check must not become an aggregate deferral."
  ],
  "sources": [
    {
      "url": "https://playwright.dev/docs/best-practices",
      "scope": "Official isolation guidance supports independent reproducible tests; it does not establish exhaustive coverage of a catalog from one seed."
    }
  ],
  "documents": {
    "catalog-pipeline-authoring.md": {
      "disposition": "reverify",
      "reason": "Reverify universal claims about bespoke tools, fixed vocabulary size and complete walker coverage. Separate coherent declarations from exhaustive behavior evidence."
    },
    "techniques/archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Reverify the count-only ratchet: enforce containment of allowed exception identities, and distinguish observed convention from an independently justified invariant."
    },
    "techniques/direction-as-first-class-produce-input.md": {
      "disposition": "reverify",
      "reason": "Reverify reproducibility and collision claims. Direction needs model/tool/input provenance, a reserved namespace, and explicit empty versus unknown states."
    },
    "techniques/packaging-exempt-two-state-rule.md": {
      "disposition": "reverify",
      "reason": "Reverify exclusive terminal-or-exemption validation, including both-present cases. Frequent absence alone does not justify reversing a shipping requirement."
    },
    "techniques/seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Reverify evidence scope and aggregation: cover negative fixtures and branches, bind revision and run configuration, and preserve failures alongside deferrals."
    },
    "techniques/step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Reverify nine-kind, three-example and vocabulary-size prescriptions as local conventions; one justified requirement can warrant a new kind."
    },
    "techniques/view-produce-accept-triad.md": {
      "disposition": "reverify",
      "reason": "Reverify sampled dependency tracing, displayed-field equality and downstream-step prohibition. Explicit dependencies and branch fixtures are needed; aggregate failure precedence must be order-independent."
    },
    "applications/node--seed-entities-and-walker-coverage.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed seed-entities-and-walker-coverage contract. Reverify evidence scope and aggregation: cover negative fixtures and branches, bind revision and run configuration, and preserve failures alongside deferrals."
    },
    "applications/process--step-archetype-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed step-archetype-taxonomy contract. Reverify nine-kind, three-example and vocabulary-size prescriptions as local conventions; one justified requirement can warrant a new kind."
    },
    "applications/react--archetype-view-coherence-ratchet.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed archetype-view-coherence-ratchet contract. Reverify the count-only ratchet: enforce containment of allowed exception identities, and distinguish observed convention from an independently justified invariant."
    }
  }
}
```
