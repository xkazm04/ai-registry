---
domain: grant-funding
subject: nonprofit-verification
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# nonprofit-verification

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/nonprofit-verification",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:817194567a2448e9",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Only a clear sanctions name screen returns pass; identity and legal-status checks fail operationally. One-pass aggregation falsely grants eligibility.",
    "An eligible church may not appear in the public exemption dataset.",
    "Claimed name Aid is contained in Global Aid Foundation despite insufficient identity evidence.",
    "Anyone can copy a legitimate public name and identifier, so name equality alone does not authenticate representation."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/nonprofit-verification",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations",
      "scope": "Official search guidance lists eligible donees that may be absent from Pub. 78."
    },
    {
      "url": "https://ofac.treasury.gov/faqs/5",
      "scope": "Official valid-match guidance requires identity comparison beyond a name hit; no live sanctions screening performed."
    }
  ],
  "documents": {
    "nonprofit-verification.md": {
      "disposition": "reverify",
      "reason": "One pass with all other required checks unavailable does not establish eligibility. Public name/id consistency does not authenticate a representative. Registry absence has coverage exceptions, sanctions candidates need resolution, and pass/decided is not calibrated confidence. Checksum validity does not prove a typo or universal detection."
    },
    "techniques/determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "Repaired per-claim/source applicability, required-check incompleteness, non-listing exceptions and sanctions review. Inconclusive can prevent a permission decision without accusing the applicant."
    },
    "techniques/graceful-source-degradation.md": {
      "disposition": "reverify",
      "reason": "Unknown registration status is inconclusive, not determinate historical status. Walking arbitrary nested payloads can capture another entity or historical states; validate schema paths and subject binding. Brief error caching/backoff may be appropriate if never presented as a fact. Declared roster must reflect applicable requirements."
    },
    "techniques/identifier-checksum-prevalidation.md": {
      "disposition": "reverify",
      "reason": "Checksum rules detect only specified error classes, not all swaps. Failure may reflect wrong scheme/version rather than proven user typo; preserve leading zeros and only normalize allowed punctuation. Stored identifiers can need revalidation after contract changes or corruption."
    },
    "techniques/registry-adapter-contract.md": {
      "disposition": "reverify",
      "reason": "Shared interfaces need claim scope, requiredness, source version and entity binding, not only per-source pass/fail. Filtering implemented adapters contradicts full roster unless unavailable placeholders are returned. A new source can require a genuine contract extension; one constructor does not prove all callers use it."
    },
    "techniques/registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "Repaired fuzzy matching as candidate evidence, containment weakness, legitimate aliases and the separate representative-authority check."
    },
    "techniques/verification-passport.md": {
      "disposition": "clarify",
      "reason": "Repaired required-evidence coverage, qualified credential claims, checksums versus signatures and freshness/revocation. A pass ratio cannot prove trust and a newest unexpired document is not automatically applicable or trustworthy."
    },
    "applications/node--determinate-vs-inconclusive-outcomes.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. IRS non-listing is not universal failure; active SAM alone or clear name screen can satisfy the unsafe aggregate with identity unknown. Empty ARES status mapped historical fabricates a negative; BMF and annual filings have different scope."
    },
    "applications/node--registry-name-binding.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained. Containment bypasses larger-set protection, generic legal words can erase identity and first returned name is not necessarily authoritative. A matching public name and id still do not prove the account represents the entity."
    }
  }
}
```
