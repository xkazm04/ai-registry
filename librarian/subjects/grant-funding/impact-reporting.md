---
domain: grant-funding
subject: impact-reporting
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# impact-reporting

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/impact-reporting",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2c0c9fc94b672ca7",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "FY2026 can end June 30; parsing it as December 31 moves the schedule by six months.",
    "A report due twelve hours ago has Math.ceil(daysRemaining) equal to negative zero, so a less-than-zero alarm can miss it.",
    "Two grants each report the same 20 trainees: aligned indicator labels do not justify 40 distinct people.",
    "50,000 dollars divided by 50,000 dollars per FTE-year is one FTE-year, not a counted job."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/impact-reporting",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://grants.nih.gov/grants-process/post-award-monitoring-and-reporting/reporting-requirements/research-performance-progress-report-rppr",
      "scope": "Current primary final RPPR timing: 120 days from end of period of performance."
    },
    {
      "url": "https://www.commonapproach.org/standards/common-framework/",
      "scope": "Primary framework separates aggregation methodology from data interoperability."
    }
  ],
  "documents": {
    "impact-reporting.md": {
      "disposition": "reverify",
      "reason": "Four questions are a scaffold, not universal requirements. No miss can be an honest result. Awarded, received, spent and attributable impact are distinct; matching indicators does not make counts additive. Report timing and future funding consequences depend on award rules, and missing dates must not look safely upcoming."
    },
    "techniques/four-section-report-model.md": {
      "disposition": "reverify",
      "reason": "Minimum character counts admit repeated placeholders and cannot prove substance. Required content follows the actual report form, not an unconditional four-section denominator. Reach allocation is not causal attribution; 10 percent variance and word ranges are advisory examples."
    },
    "techniques/honest-misses-disclosure.md": {
      "disposition": "reverify",
      "reason": "Useful warning-only qualification contradicts the golden-path mandatory miss. Causes may be genuinely external or unknown, changes may be unnecessary, and qualitative misses need not have invented numbers. Comparative fundability and officer-reading claims are unsupported."
    },
    "techniques/modeled-figure-marking.md": {
      "disposition": "clarify",
      "reason": "Repaired estimates versus bounds, dimensional units, causal language, invalid-input defaults and assumptions. Award dollars divided by dollars per FTE-year produce FTE-years, not jobs or observed employment."
    },
    "techniques/per-funder-track-record.md": {
      "disposition": "reverify",
      "reason": "An award with unknown amount is still an award; positive committed funds are not necessarily received or spent. Keep monetary totals with known amounts separate from award counts and unknowns, model missing currencies and refunds, and do not call fundraising totals delivered impact. Shared predicate alone cannot prove reconciliation."
    },
    "techniques/report-calendar-derivation.md": {
      "disposition": "clarify",
      "reason": "Repaired fiscal calendar requirements, actual obligation schedule, unknown dates and exact overdue comparisons. Current-period interim reporting is valid, and default grace is planning rather than a legal deadline."
    },
    "techniques/shared-indicator-alignment.md": {
      "disposition": "clarify",
      "reason": "Repaired comparability versus additivity, overlap and denominators, scoped definitions and revised mappings. Alignment supports exchange but cannot alone prevent double counting or establish causal contribution."
    },
    "techniques/verifiable-impact-certificates.md": {
      "disposition": "reverify",
      "reason": "An all-present-checks verdict can pass an empty or incomplete check set: require a declared expected set and unknown statuses. Hashes need trusted comparison and do not establish issuer authenticity or factual truth; keyed schemes need actual key validation. Expiry concerns current validity, not erasing historical facts, and publication requires appropriate authority/privacy scope."
    },
    "applications/node--modeled-figure-marking.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained. Formatter conflates FTE-years with FTE, hides negatives as zero and emits non-finite values; less-than-one does not identify a model. Denominator fallback and positive awards do not establish labor impact. A log-only truncation warning does not adequately qualify a public total."
    },
    "applications/node--report-calendar-derivation.md": {
      "disposition": "reverify",
      "reason": "Historical source/date retained, not rerun. FY year need not end December 31; Math.ceil(-0.5) is negative zero and can delay overdue detection. Unknown-as-upcoming conceals missing evidence; status submitted requires receipt and correction semantics. Overriding grace is not necessarily an explicit due-date override."
    },
    "applications/process--shared-indicator-alignment.md": {
      "disposition": "reverify",
      "reason": "Historical snapshot/date unchanged. Primary NIH guidance gives final RPPR 120 days, contradicting the stated 30. Common Approach distinguishes interoperability from aggregation methodology; mapping is not free additivity. Other survey counts, agency rules and revision effective dates were not independently refreshed."
    }
  }
}
```
