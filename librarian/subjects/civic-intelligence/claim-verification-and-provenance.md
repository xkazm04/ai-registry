---
domain: civic-intelligence
subject: claim-verification-and-provenance
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# claim-verification-and-provenance

## Architecture review - 2026-09-09

Retain the subject with scoped verification and emission contracts. Reverify both consumer applications; no runtime evidence or maturity change is claimed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/claim-verification-and-provenance",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:3a6b28a10bf954c1",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A stable opaque ID survives rebuild through a preserved mapping.",
    "A cached immutable receipt accurately proves an earlier snapshot.",
    "The source value is stale but unchanged.",
    "A decodable ref was never minted by the publisher.",
    "A partial stamp rollout looks uniform among stamped rows.",
    "An approved internal edge has never undergone editorial fact checking."
  ],
  "sources": [
    {
      "url": "https://schema.org/ClaimReview",
      "result": "Fact-check semantics and publication-date meaning checked."
    },
    {
      "url": "https://schema.org/ratingValue",
      "result": "Number and Text accepted; retract numeric-only assertion."
    },
    {
      "url": "https://developers.google.com/search/docs/appearance/structured-data/factcheck",
      "result": "Consumer URL requirement and Search phase-out notice checked; Explorer support distinguished."
    }
  ],
  "documents": {
    "claim-verification-and-provenance.md": {
      "disposition": "clarify",
      "reason": "Scope address, review and verification guarantees."
    },
    "techniques/claim-ref-addressing.md": {
      "disposition": "clarify",
      "reason": "Separate decodeability, issuance, historical versions and privacy."
    },
    "techniques/recomputation-receipts.md": {
      "disposition": "clarify",
      "reason": "Clarify caches, precision, coherent snapshots and actual review policy."
    },
    "techniques/three-verdict-vocabulary.md": {
      "disposition": "clarify",
      "reason": "Require comparable values and disclose unassessed axes."
    },
    "techniques/derivation-comparison.md": {
      "disposition": "clarify",
      "reason": "Cover missing and empty populations and full derivation inputs."
    },
    "techniques/gate-state-as-modifier.md": {
      "disposition": "clarify",
      "reason": "Bind review to versions and actual workflow, preserving safe defaults."
    },
    "techniques/structured-review-emission.md": {
      "disposition": "clarify",
      "reason": "Correct verified primary-source claims and separate consumer support."
    },
    "applications/node--three-verdict-vocabulary.md": {
      "disposition": "reverify",
      "reason": "Historical code and runtime evidence not refreshed; reverify corrected contract."
    },
    "applications/react--recomputation-receipts.md": {
      "disposition": "reverify",
      "reason": "Historical code and runtime evidence not refreshed; reverify corrected contract."
    }
  }
}
```
