---
domain: grant-funding
subject: funder-intelligence-index
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# funder-intelligence-index

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-intelligence-index",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:32c29fc930875583",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An awarded event later corrected as erroneous must not remain an award forever.",
    "Every fit band wins 10 percent: weak monotonicity is true but the score does not discriminate.",
    "Five organizations all declined: a published zero award rate discloses the sensitive outcome for every known member.",
    "A 16-character hash of a publicly listed programme title can be matched by hashing candidate titles.",
    "0.065 is a valid number in either percent or fraction conventions; clamping cannot infer the intended unit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/funder-intelligence-index",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://scikit-learn.org/stable/modules/calibration.html",
      "scope": "Official calibration documentation distinguishes predicted probabilities and observed positive fractions; no consumer model evaluation performed."
    },
    {
      "url": "https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance",
      "scope": "Primary de-identification guidance located; no claim that this corpus implementation passed a privacy audit."
    }
  ],
  "documents": {
    "funder-intelligence-index.md": {
      "disposition": "reverify",
      "reason": "Coarse hashes are not non-reversible anonymity, own-organization views still require user authorization, and small samples are uncertain rather than lies. A selected panel rate is not automatically personal probability; weak monotonicity is not calibration. Curated/live replacement requires comparable populations, periods and definitions."
    },
    "techniques/award-rate-by-revenue-bracket.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown revenue, immutable submission scope, correction-aware outcome collapse, explicit denominators and panel-versus-population inference."
    },
    "techniques/consent-scoped-contribution.md": {
      "disposition": "reverify",
      "reason": "Read-time filtering is useful but does not invalidate already cached or exported aggregates by construction. Separate operational retention from contribution authority; scope permission by purpose/version and explain withdrawal limits. Public records and private dashboards can still contain sensitive third-party information. All-or-nothing organizational participation is a design choice, not a universal consent requirement."
    },
    "techniques/fit-calibration-monotonicity.md": {
      "disposition": "clarify",
      "reason": "Repaired rank association versus probability calibration, equal-rate and sampling counterexamples, model-version capture and prospective evaluation."
    },
    "techniques/k-anonymity-suppression.md": {
      "disposition": "clarify",
      "reason": "Repaired contributor floor versus anonymity guarantee, dictionary-reversible title hashes, sensitive attribute disclosure, dominance and release-composition review. A larger k or nightly refresh is not a complete defense."
    },
    "techniques/rfp-difficulty-scoring.md": {
      "disposition": "reverify",
      "reason": "Sector rate ranges and thresholds have no supplied primary evidence. Selectivity is not writing effort or individual chance; an observed opt-in panel is not automatically funder-wide selectivity. Fixed cutoffs need uncertainty, versioning and minimum-sample justification; 11 applications is not universally forbidden by a stated floor."
    },
    "techniques/win-probability-confidence-bands.md": {
      "disposition": "clarify",
      "reason": "Repaired count labels versus statistical intervals, dependence and selection, explicit units, missing/invalid values, scoped base rates and comparable curated/live merging."
    },
    "applications/node--k-anonymity-suppression.md": {
      "disposition": "reverify",
      "reason": "Historical source/date retained, not rerun. A 16-hex title hash preserves near-unique grouping and is dictionary-recoverable; invalid revenue must not imply smallest bracket. Award-always-wins ignores corrections, grant identity may conflate repeat cycles, default overrideable k can drift from disclosure, and literal k>=5 suppressed reverses the predicate. No composition or dominance protection is demonstrated."
    },
    "applications/node--win-probability-confidence-bands.md": {
      "disposition": "reverify",
      "reason": "Historical code/date not refreshed. Application-count merge floor does not independently enforce distinct contributors. Clamping cannot detect 0.065 as fraction versus percent, and nonfinite-to-zero fabricates a rate. Counts alone do not establish confidence; frozen score needs actual submission capture plus model version, and equal-rate bands pass monotonicity without ranking signal."
    }
  }
}
```
