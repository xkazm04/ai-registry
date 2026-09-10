---
domain: grant-funding
subject: jurisdiction-modelling
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# jurisdiction-modelling

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/jurisdiction-modelling",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:46087056a5829103",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A country profile has no code table because ingestion is incomplete, not because every call is governed solely by legal form.",
    "A non-member country is associated with one funding programme but not another.",
    "An uploaded file named audit.pdf contains a draft budget rather than a valid audit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/jurisdiction-modelling",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "scope": "Previously opened primary annex distinguishes participation, funding eligibility and call-specific conditions; no individual legal eligibility determination."
    },
    {
      "url": "https://www.grants.gov/api/status-codes",
      "scope": "Previously checked official code 25 requires additional eligibility clarification; not an unrestricted default."
    }
  ],
  "documents": {
    "jurisdiction-modelling.md": {
      "disposition": "reverify",
      "reason": "Eligibility includes programme and private-funder conditions, not only legislation. One profile cannot encode all call exceptions through a Boolean. Country of registration, programme participation, service geography and preferred language are distinct; inherited sources are discovery coverage, not universal entitlement."
    },
    "techniques/compliance-document-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Repaired conventional versus mandatory documents, per-authority scope and content validation. Filename matches cannot establish satisfaction and filtering solely to profile defaults can omit a novel call requirement."
    },
    "techniques/eligibility-regime-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired empty-code-table inference and default applicant assumptions; mixed code/prose/legal requirements compose at call level. Shared shape can consistently encode a wrong regime."
    },
    "techniques/entity-type-code-mapping.md": {
      "disposition": "reverify",
      "reason": "Curated mapping is useful but a fully verified enumeration can be supported. Agreement of name inference and self-declaration is not independently verified legal status. Preserve registry facts and mapping versions; code namespaces reflect issuing vocabulary, not necessarily each adapter."
    },
    "techniques/jurisdiction-profile-schema.md": {
      "disposition": "reverify",
      "reason": "Pure data helps testability but cannot prove legal correctness or guarantee all new markets need no code. Boolean grantEligible and a single currency/language lose programme conditions; source keys are not eligible geography. Preserve incumbent behavior only where correct, and record rule dates and source versions."
    },
    "techniques/market-claim-truthfulness.md": {
      "disposition": "reverify",
      "reason": "A supported flag keeps surfaces consistent, not necessarily truthful. Capability-specific current evidence is required, and onboarding registration choices must not be the full programme-market list. Roadmap announcements and waitlist priority are separate product choices; static blurbs can still drift."
    },
    "techniques/supranational-membership-inheritance.md": {
      "disposition": "clarify",
      "reason": "Repaired membership versus programme association, discovery versus eligibility, effective dates and registration-market separation. Supranational programmes need not map to a simple political membership tree."
    },
    "applications/node--jurisdiction-profile-schema.md": {
      "disposition": "reverify",
      "reason": "Historical schema/date retained, not rerun. Code 25 is not unrestricted and legacy nonprofit defaults can misclassify. Empty table does not prove legal-form-only eligibility; pending copy migration and declared-unbuilt verification mean configuration alone does not prove support."
    },
    "applications/node--market-claim-truthfulness.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. Same list can consistently expose an inappropriate incorporation choice, and static US-only notice already contradicts derived coverage. Supported flag with unbuilt verification needs scoped claims rather than automatic truth; consumers were not executed."
    }
  }
}
```
