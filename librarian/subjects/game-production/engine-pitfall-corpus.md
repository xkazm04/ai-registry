---
domain: game-production
subject: engine-pitfall-corpus
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# engine-pitfall-corpus

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-pitfall-corpus",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b002bcea3b241e2a",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Unknown-domain fallback can overflow context or mix incompatible versions; unknown task kinds must not silently exclude relevant advice. Validate mapping keys and distinguish universal entries from unclassified ones.",
    "Structured incident shape helps routing but prose can be addressable too. Distinguish confirmed causes, documented restrictions and reported hypotheses; redact private incident evidence.",
    "Negative introspection and failed loading can share missing initialization or permission causes. Two agreeing failures do not prove absence; probing can itself mutate or crash a process."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/engine-pitfall-corpus/engine-pitfall-corpus.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "engine-pitfall-corpus.md": {
      "disposition": "reverify",
      "reason": "Reverify the claim that injection alone prevents incidents, universal binary impossibility, unbounded safe-superset routing and categorical provenance ordering. The repaired capability technique narrows one of these claims; the golden path still needs reconciliation."
    },
    "techniques/binary-content-wall.md": {
      "disposition": "clarify",
      "reason": "Repaired capability declarations to bind operation, version, mode and prerequisites; finite failed probes and binary storage no longer imply universal impossibility."
    },
    "techniques/domain-scoped-injection-with-a-safe-superset.md": {
      "disposition": "reverify",
      "reason": "Unknown-domain fallback can overflow context or mix incompatible versions; unknown task kinds must not silently exclude relevant advice. Validate mapping keys and distinguish universal entries from unclassified ones."
    },
    "techniques/incident-entry-shape.md": {
      "disposition": "reverify",
      "reason": "Structured incident shape helps routing but prose can be addressable too. Distinguish confirmed causes, documented restrictions and reported hypotheses; redact private incident evidence."
    },
    "techniques/introspect-before-you-call.md": {
      "disposition": "reverify",
      "reason": "Negative introspection and failed loading can share missing initialization or permission causes. Two agreeing failures do not prove absence; probing can itself mutate or crash a process."
    },
    "techniques/known-asset-paths-over-invented-ones.md": {
      "disposition": "reverify",
      "reason": "Resolved asset paths need version, identity and availability context. A stale catalog is not proof of absence, and an author may abstain instead of inventing a path."
    },
    "techniques/provenance-on-every-entry.md": {
      "disposition": "reverify",
      "reason": "One successful or failed probe does not license a universal prohibition. Compare conflicting evidence within matched contexts; documented restrictions can be authoritative without a live probe."
    },
    "applications/node--domain-scoped-injection-with-a-safe-superset.md": {
      "disposition": "reverify",
      "reason": "The historical router and 42-entry claims were not rerun. The displayed plain-object lookup needs own-key validation: inherited keys such as constructor can select a non-array value. Recheck task filtering and context-budget behavior. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--incident-entry-shape.md": {
      "disposition": "reverify",
      "reason": "The historical incident corpus and source witnesses were not reread in the consumer. Machine-specific checkout roots should be removed from published evidence; retain reported versus confirmed distinctions. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```
