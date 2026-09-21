---
domain: civic-intelligence
subject: legislative-change-tracking
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# legislative-change-tracking

## Architecture review - 2026-09-09

Retain the subject with bounded extraction and explicit historical/current distinctions. Resolve collection-year derivation against publisher records and reverify both applications before new witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/legislative-change-tracking",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:98eb1bce56a2d31a",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A returned bill has reached a stronger historical stage than its current state.",
    "An unknown later committee event follows a known referral.",
    "A first signatory did not draft the text.",
    "A single proposer is recorded directly on the print row.",
    "A publication and history event fall in different years.",
    "Two overlapping edits compose or commence on different dates.",
    "A novel instruction fails the grammar but remains an amendment."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1303",
      "result": "Checked transition, proposer and collection-year field contracts; discrepancies need consumer verification."
    },
    {
      "source": "All nine subject documents",
      "result": "Assessed milestone, extraction and identity counterexamples; historical batch incidents and consumer runtime not replayed."
    }
  ],
  "documents": {
    "legislative-change-tracking.md": {
      "disposition": "clarify",
      "reason": "Correct proposer and publication-year assumptions against primary schema."
    },
    "techniques/amendment-instruction-grammar.md": {
      "disposition": "clarify",
      "reason": "Bound grammar claims by document context and explicit unknowns."
    },
    "techniques/bill-fate-dating.md": {
      "disposition": "clarify",
      "reason": "Clarify transition semantics and independently supported publication fields."
    },
    "techniques/committee-routing-reconstruction.md": {
      "disposition": "clarify",
      "reason": "Distinguish historical routing summaries, unknown events and current assignments."
    },
    "techniques/sponsorship-and-rapporteur-roles.md": {
      "disposition": "clarify",
      "reason": "Distinguish role assignment from authorship and work performed."
    },
    "techniques/statute-citation-extraction.md": {
      "disposition": "clarify",
      "reason": "Require full legal identity, evidence spans and explicit extraction limits."
    },
    "techniques/statute-collision-clustering.md": {
      "disposition": "clarify",
      "reason": "Require version-aware targets and qualify candidate counts."
    },
    "applications/node--bill-fate-dating.md": {
      "disposition": "reverify",
      "reason": "Reverify source-contract discrepancies and nonmonotonic states."
    },
    "applications/node--statute-collision-clustering.md": {
      "disposition": "reverify",
      "reason": "Reverify version mixing, target attribution and historical coverage."
    }
  }
}
```
