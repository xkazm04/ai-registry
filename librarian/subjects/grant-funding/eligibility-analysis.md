---
domain: grant-funding
subject: eligibility-analysis
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# eligibility-analysis

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/eligibility-analysis",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:540babaa972a8182",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A call uses Others but its additional text limits applicants to named institutions: adding that code to every organization falsely passes them.",
    "An organization shares the funder country but is outside a required municipality.",
    "A fit score of 95 with unknown legal eligibility is a promising discovery result, not permission to submit.",
    "A registration can be curable next month while submission is blocked today."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/eligibility-analysis",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.grants.gov/api/status-codes",
      "scope": "Official code definitions distinguish Others from Unrestricted and require supplemental clarification."
    },
    {
      "url": "https://grants.gov/applicants/applicant-registration/organization-registration",
      "scope": "Current published processing estimate and completed-registration prerequisite; no applicant registration performed."
    }
  ],
  "documents": {
    "eligibility-analysis.md": {
      "disposition": "reverify",
      "reason": "The four gates are not exhaustive: registration and call-specific conditions also matter. A deterministic rule is not necessarily authoritative; missing conditions cannot become confirmed eligibility. Capacity heuristics and legal-form lookup need narrower scope."
    },
    "techniques/applicant-type-code-mapping.md": {
      "disposition": "clarify",
      "reason": "Repaired code provenance, preservation of subtype constraints and supplemental eligibility text: Others is not unrestricted, and unrestricted can carry clarifications. Unknown codes remain unresolved."
    },
    "techniques/award-size-capacity-fit.md": {
      "disposition": "reverify",
      "reason": "Annual revenue comparisons ignore award duration, currency, eligible work and cash flow; missing bounds are not published zero or infinity. The 5–40 percent range and floor exceeding revenue are not universal eligibility rules."
    },
    "techniques/deadline-and-cutoff-evaluation.md": {
      "disposition": "reverify",
      "reason": "A one-hour timezone error is material at submission. Multiple cutoffs require stage eligibility; invalid dates and missing dates differ. Other gates can expire without a profile edit too."
    },
    "techniques/geographic-scope-gating.md": {
      "disposition": "clarify",
      "reason": "Repaired geography as explicit call predicates for applicant, activities and beneficiaries; same country and international labels do not prove local eligibility."
    },
    "techniques/hard-gate-vs-soft-score.md": {
      "disposition": "clarify",
      "reason": "Repaired provisional discovery versus permission to submit, unknown required conditions, authoritative rule scope, and time-dependent cache validity."
    },
    "techniques/legal-form-eligibility-model.md": {
      "disposition": "reverify",
      "reason": "Legal form may be relevant to both coded and uncoded calls; a regime-wide Boolean cannot replace programme conditions. Eligible-with-note must not pass an unevaluated mandatory condition. Universal validation-stage claims need programme sources."
    },
    "techniques/registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "Curable registration failure can still block submission now. Exclusion must match entity, scope, effective dates and exceptions; not every regime requires only an identifier at application. Lead times are uncertain dated estimates, not marketing-versus-truth classes."
    },
    "applications/node--applicant-type-code-mapping.md": {
      "disposition": "reverify",
      "reason": "Historical code and verified_on preserved, not rerun. Appending code 25 to everyone contradicts the official definition; code 99 also permits clarifications. Broad nonprofit merging and unconditional regime branching can produce false passes."
    },
    "applications/node--hard-gate-vs-soft-score.md": {
      "disposition": "reverify",
      "reason": "Historical implementation and date not refreshed. Excluding structured geography failures while hard-blocking heuristic award fit reverses evidence quality; unknown required conditions can become strong. Input hashing alone cannot invalidate an elapsed deadline."
    },
    "applications/process--registration-and-validation-readiness.md": {
      "disposition": "reverify",
      "reason": "Historical snapshot not refreshed. Current registration guidance says average 7–10 business days after complete entry; universal active-registration, exclusion and validation-stage claims require programme exceptions and scope. Proposed-rule assertions and effective-date distinctions were not independently verified."
    }
  }
}
```
