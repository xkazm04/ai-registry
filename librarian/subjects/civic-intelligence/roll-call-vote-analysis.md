---
domain: civic-intelligence
subject: roll-call-vote-analysis
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# roll-call-vote-analysis

## Architecture review - 2026-09-09

Reviewed all nine documents. Corrected binary-measure interpretation, support,
identity and aggregation boundaries. Application implementation claims remain
reverify work; no maturity or historical witness dates were refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/roll-call-vote-analysis",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a43921646b1b581e",
  "disposition": "clarify",
  "coverage": "All nine owned documents read; official source schema checked. Consumer code, fixtures, historical counts and field behavior not evaluated.",
  "counterexamples": [
    "Fifty divisions with one group voter each pass a personal count floor without establishing supported group lines.",
    "Two unanimous opposing groups yield average within-group Rice 1 and pooled Rice 0.",
    "A ballot identity swap preserves chamber totals while reversing individual records.",
    "A yes/no measure can survive a merge of abstention categories it never used.",
    "An unaffiliated member can still have a valid pairwise agreement rate."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "scope": "Publisher codes, merged category, unavailable individual ballots, excusal precedence and challenge semantics; no national-law opinion or live-data recount."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "scope": "Full-snapshot update and dependent-data consistency guidance."
    }
  ],
  "documents": {
    "roll-call-vote-analysis.md": {
      "disposition": "clarify",
      "reason": "Qualify source completeness, abstention semantics and support-floor inference."
    },
    "techniques/club-line-and-rebellion.md": {
      "disposition": "clarify",
      "reason": "Require dated membership and separate line support; a personal count floor cannot validate thin group lines."
    },
    "techniques/co-voting-agreement-matrix.md": {
      "disposition": "clarify",
      "reason": "Guard duplicate person/division rows and qualify reliability and cross-period rate comparability."
    },
    "techniques/positional-vs-participation-bases.md": {
      "disposition": "clarify",
      "reason": "Separate binary convention, participation evidence and valid subset fractions; preserve unaffiliated pairwise analysis."
    },
    "techniques/rice-cohesion-index.md": {
      "disposition": "clarify",
      "reason": "Remove whipping inference and distinguish average within-group cohesion from pooled chamber cohesion."
    },
    "techniques/tally-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Require same-snapshot comparison and affected-output gating; allow traceable repairs to confirmed ingest defects."
    },
    "techniques/vote-choice-vocabulary-mapping.md": {
      "disposition": "clarify",
      "reason": "Keep raw codes and restrict vocabulary-break claims to affected metrics."
    },
    "applications/node--club-line-and-rebellion.md": {
      "disposition": "reverify",
      "reason": "Dated source mapping checked; consumer membership, thin-line and ranking implementations not executed."
    },
    "applications/node--tally-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Publisher aggregate columns checked; consumer recount and historical incident not replayed."
    }
  }
}
```
