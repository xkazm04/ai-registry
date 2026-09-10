---
domain: game-production
subject: wiring-contract-doctrine
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# wiring-contract-doctrine

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/wiring-contract-doctrine",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:31d9837f6d8cacd2",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An existing event ID OnHit is five characters and can be more precise than a thirty-character vague sentence.",
    "A verification sentence containing L4 and no actual test run is still only a plan.",
    "Five input-action assets unrelated to movement do not establish that the required movement bindings exist."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/content-pipeline/wiring-contract-doctrine",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "wiring-contract-doctrine.md": {
      "disposition": "reverify",
      "reason": "Useful authoring-time grants/triggers/dependencies, but four fields are not a proof that every runtime reachability condition is modeled. Static typed references can detect some orphans yet cannot prove conditional paths executable. Consumer count and declaration-to-codepath ratios do not measure coverage, and binary assets are not necessarily manual-only. Keep planned checks distinct from observations."
    },
    "techniques/contract-injection-into-prompts.md": {
      "disposition": "reverify",
      "reason": "Prompt injection can help but does not guarantee lower rejection rates or uniquely change output distributions; checker feedback can guide repair. Keep validation rather than dropping it under budget pressure. Post-hoc wiring repair can be valid if references and behavior are rechecked. Elision must not omit required acceptance constraints, and shared constants alone do not ensure semantic agreement."
    },
    "techniques/cross-catalog-link-resolution.md": {
      "disposition": "reverify",
      "reason": "Declare edge direction and reachable roots, including conditions, instead of ambiguous backward traversal. Required cycles can be generated in phases; existence does not establish player reachability. Fixing a typo/alias is another remedy beyond producing or dropping a target. Binary/external assets can resolve through typed providers; missing catalogs require unknown, and deferred content can still be erroneously referenced by a shipping path."
    },
    "techniques/four-field-wiring-contract.md": {
      "disposition": "reverify",
      "reason": "Four concerns are useful schema choices, not an exhaustive theorem. Runtime services/resources need registration and consumption semantics rather than literal grants. Binary production capability must be checked, not inferred from format. Empty dependencies can be valid; named planned verification is not performed evidence, and extra metadata does not inherently weaken conjunction."
    },
    "techniques/no-gray-box-rule.md": {
      "disposition": "reverify",
      "reason": "Scope done to requirements: compilation can complete a compile-only task, while assigned visuals/behavior are themselves structurally checkable. Invisible triggers and static scenery can legitimately lack one of those assignments. Uniform green does not prove compilation-only checking, and structural precision/recall claims need measured evidence."
    },
    "techniques/placeholder-rejection.md": {
      "disposition": "clarify",
      "reason": "Repaired minimum character count as specificity proof and generic one-word/none rejection. Requires typed references, explicit blocked/not-applicable states, ambiguity handling and a planned action/expected result while preserving distinction from executed evidence."
    },
    "techniques/verification-must-name-a-tier.md": {
      "disposition": "clarify",
      "reason": "Repaired one-observation-only and highest-tier-as-completion rules. Multiple independent checks may belong to one artifact; track required evidence kinds and actual outcomes, bind them to content and distinguish proposed test from performed observation."
    },
    "applications/node--placeholder-rejection.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations, counts and verification date were not rerun. The displayed regex is prefix-based rather than whole-field and its word boundary mishandles punctuation markers; MIN_PROSE can reject valid short IDs. String(d) accepts null, numbers and objects, so malformed dependency elements can pass. Tier token presence does not validate meaning; equal grep counts do not prove one-to-one composition."
    },
    "applications/node--verification-must-name-a-tier.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF references and verification date were not rerun. Substring/name heuristics can match the wrong class; five unrelated input assets do not prove the required input set exists. An unavailable/stale manifest is not a missing feature. The shown multi-observation contract is legitimate and contradicts the single-observation technique; actual runtime results are absent."
    },
    "applications/process--contract-injection-into-prompts.md": {
      "disposition": "reverify",
      "reason": "Historical process/PoF locations and verification date were not rerun. The displayed affix contract uses multiple observations, contrary to the one-check instruction, and descriptive dependencies need actual typed resolution. Importing MIN_PROSE shares one number rather than the complete checker semantics; caps and claimed tests were not rerun. Prompt text is not evidence that binary production is impossible or wiring executed."
    }
  }
}
```
