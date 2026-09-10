---
domain: grant-funding
subject: submission-filing
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# submission-filing

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/submission-filing",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:c099364040bbafd9",
  "disposition": "reverify",
  "coverage": "All 8 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Five filings contain only one portal URL; a high global sample tier does not corroborate that URL.",
    "A fabricated nonempty confirmation string satisfies the displayed verifiable expression.",
    "An awarded record leaves FILED_STATUSES and loses its derived proof despite having a valid historical receipt.",
    "An attachment required only for one applicant type disappears under a global majority."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/submission-filing",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.grants.gov/help/applicants/check-application-status",
      "scope": "Official status guidance distinguishes received, validation errors and agency receipt; no application submitted or tracked."
    }
  ],
  "documents": {
    "submission-filing.md": {
      "disposition": "reverify",
      "reason": "Deterministic derivation is not evidence of current truth. Crowd precedence, sample-size confidence and irreversible status are overgeneralized. Preserve filing events while supporting correction, withdrawal and resubmission. Evidence presence alone does not prove receipt, and outcome transitions must not erase historical filing. Registration and deadline rules need call-specific sources."
    },
    "techniques/crowd-verified-filing-profiles.md": {
      "disposition": "reverify",
      "reason": "Per-funder aggregation mixes programs, rounds and applicant types. Total sample size does not establish per-field coverage, independence or accuracy; first-seen plurality is not majority. Retain correction and freshness, distinguish missing answers from explicit none, protect private receipt references and reject unsafe destinations beyond URL scheme. Mark-filed is not the only valid capture moment."
    },
    "techniques/funder-portal-resolution.md": {
      "disposition": "clarify",
      "reason": "Repaired identifier shape as non-proof of existence, listing versus filing destination, current authoritative instructions before crowd reports and safe URL handling. Search can discover sourced candidates without itself establishing authority."
    },
    "techniques/majority-rule-doc-consensus.md": {
      "disposition": "clarify",
      "reason": "Repaired majority as descriptive frequency rather than requirement authority, response denominator and conditional requirements. Minority reports may identify genuine obligations; do not erase them solely to simplify a checklist."
    },
    "techniques/proof-of-filing.md": {
      "disposition": "clarify",
      "reason": "Repaired evidence presence versus validation, status-independent filing history, subject/package binding, correction and downstream policy. Receipt, validation, acceptance and timeliness are separate claims."
    },
    "techniques/standard-materials-checklist.md": {
      "disposition": "reverify",
      "reason": "Generic materials are jurisdiction and applicant dependent; a determination letter or annual return is not universal. A partial crowd list should not replace a complete requirements list. Keep source labels per item when combining differently sourced guidance; an empty known-required list differs from unknown requirements."
    },
    "applications/node--crowd-verified-filing-profiles.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Counting only current filed statuses can remove awarded/declined filings. Per-filing samples mislabeled org counts, global sample confidence can mask one portal report, repeated-org dominance and note-sentinel ambiguity remain. Scheme checks do not prevent phishing or private receipt disclosure."
    },
    "applications/node--proof-of-filing.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Nonempty user strings do not prove funder receipt, referenced artifact storage is deferred, and changing status to awarded/declined can make filed false. Local timestamp, missing validation and absent identity/package checks prevent a verified or guarantee verdict."
    }
  }
}
```
