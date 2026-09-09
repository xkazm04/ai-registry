---
domain: civic-intelligence
subject: parliamentary-data-modeling
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# parliamentary-data-modeling

## Architecture review - 2026-09-09

Retain all six techniques with explicit identity, temporal and snapshot limits. Both applications require current consumer verification, especially deletion reconciliation, missing scopes and manual role exemptions. No dump reload or runtime re-verification was performed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/parliamentary-data-modeling",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:efbd6fc2f06f3cbf",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A seated member has no observed activity because ingestion is incomplete.",
    "One human has multiple publisher person records.",
    "An end date is unknown rather than a documented current affiliation.",
    "A term with no roll calls still contains legitimate excuses.",
    "Correcting a start date changes a natural key and leaves a stale old row.",
    "An external officeholder is not a voting member.",
    "Political-party membership differs from both list and club."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1301",
      "result": "Checked duplicate-person warning, discriminator, dates, sentinel and electoral/club distinction."
    },
    {
      "url": "https://www.popoloproject.com/specs/membership.html",
      "result": "Separate membership relation checked; not a universal institution or boundary rule."
    },
    {
      "url": "https://www.popoloproject.com/specs/post.html",
      "result": "Post/office identity distinguished from occupants."
    }
  ],
  "documents": {
    "parliamentary-data-modeling.md": {
      "disposition": "clarify",
      "reason": "Correct person uniqueness, mandate evidence and snapshot reconciliation."
    },
    "techniques/cross-term-registry-loading.md": {
      "disposition": "clarify",
      "reason": "Handle eventless terms, key-changing corrections and authoritative scope."
    },
    "techniques/mandate-vs-person-identity.md": {
      "disposition": "clarify",
      "reason": "Clarify tenure classification, denominators and source identity."
    },
    "techniques/membership-window-modeling.md": {
      "disposition": "clarify",
      "reason": "Preserve source boundaries and distinguish interval corrections from new stints."
    },
    "techniques/office-vs-plain-membership.md": {
      "disposition": "clarify",
      "reason": "Handle unknown discriminators and versioned projections."
    },
    "techniques/party-club-vs-electoral-list.md": {
      "disposition": "clarify",
      "reason": "Avoid inferred whip, independence and electoral-system assumptions."
    },
    "techniques/term-and-chamber-scoping.md": {
      "disposition": "clarify",
      "reason": "Scope the organization model and retain unknown institutional mappings."
    },
    "applications/node--cross-term-registry-loading.md": {
      "disposition": "reverify",
      "reason": "Reverify snapshot reconciliation and eventless scopes; counts not refreshed."
    },
    "applications/node--office-vs-plain-membership.md": {
      "disposition": "reverify",
      "reason": "Reverify role mapping and retain manual-classification deviation."
    }
  }
}
```
