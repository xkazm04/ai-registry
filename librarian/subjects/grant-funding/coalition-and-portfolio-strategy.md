---
domain: grant-funding
subject: coalition-and-portfolio-strategy
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# coalition-and-portfolio-strategy

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/coalition-and-portfolio-strategy",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:434a4a360c4d7fd4",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Same-region score 1+0 ties out-of-region score 0+1, so a capacity tie-break can choose the out-of-region peer.",
    "A three-year award exceeding one year's revenue need not exceed annual delivery capacity; comparing totals without duration misstates exposure.",
    "Allocating 100 percent to members then adding a 10 percent administration share requests 110 percent of the same award."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/coalition-and-portfolio-strategy",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://rea.ec.europa.eu/horizon-europe-grants-reporting_en",
      "scope": "Opened official page lists multiple beneficiaries with rights/obligations in the grant agreement and coordinator reporting responsibilities; demonstrates program-specific roles rather than universal single-recipient assumptions."
    },
    {
      "url": "https://erasmus-plus.ec.europa.eu/programme-guide/part-c/after-approval",
      "scope": "Official search excerpt distinguishes mono- and multi-beneficiary agreements; no live grant eligibility or legal advice assessment performed."
    }
  ],
  "documents": {
    "coalition-and-portfolio-strategy.md": {
      "disposition": "reverify",
      "reason": "Coalition feasibility and portfolio capacity are useful distinct questions. Award-to-revenue is not universal eligibility, partner structure can change several gates, and summing revenue does not prove delivery capacity. Lead liability and subaward form depend on the program. Barbell outperformance, tenfold rates and consortium advantage require comparable outcome evidence; requirement gaps depend on which member must satisfy each rule."
    },
    "techniques/capacity-floor-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired capacity heuristic as hard eligibility gate and unknown bound as known zero/unlimited. Compares time/currency/payment basis, preserves unknowns and evaluates coalition rules rather than promising capacity is uniquely curable by partnership."
    },
    "techniques/complementarity-scoring.md": {
      "disposition": "reverify",
      "reason": "sameRegion plus a 0-1 fraction permits a tie, not strict dominance; hard requirements need filtering. Candidate-only novelty does not measure relevant incremental coalition coverage and must be recomputed after additions. Greedy ranking does not guarantee minimum membership, redundant delivery can be valuable, and missing capabilities are unknown rather than proven zero. Coalitions may be required even when solo revenue clears a floor."
    },
    "techniques/lead-applicant-selection.md": {
      "disposition": "clarify",
      "reason": "Repaired universal single-recipient/full-liability and largest-revenue lead default. Requires current program roles, agreement, eligibility and demonstrated administrative/liquidity capacity, with explicit partner consent and permitted costs."
    },
    "techniques/portfolio-balance-across-difficulty.md": {
      "disposition": "reverify",
      "reason": "Barbell superiority and cutting the middle first are unsupported universal strategy. Gross award times estimated probability is not unrestricted net value; account for restrictions, cofunding, timing, dependencies and delivery burden. Small samples can inform uncertainty without claiming precision, and high pooled program rates need not predict this applicant's chances."
    },
    "techniques/proportional-subgrant-split.md": {
      "disposition": "clarify",
      "reason": "Repaired revenue-proportional allocation as capacity guarantee and admin allocation on top of a fully allocated pot. Starts from eligible scoped work, preserves total budget, clarifies rounding, comparable figures and program-specific agreements."
    },
    "techniques/requirement-profile-aggregation.md": {
      "disposition": "reverify",
      "reason": "Preserve required versus optional modality, negation, dates and applicability before normalization. Per-analysis dedupe is not per-independent-application dedupe; repeated org analyses of one call inflate frequency. No finite high-share history proves always, missing extraction is not absence, and a 990 is not interchangeable with financial statements. Untrusted source text must be isolated/escaped rather than merely stripped."
    },
    "applications/node--complementarity-scoring.md": {
      "disposition": "reverify",
      "reason": "Historical grant-writing-nonprofits code, funder signal and verification date were not rerun. Score ties defeat strict regional dominance; greedy novelty order is not smallest coalition. Combined revenue and rounded shares do not establish legal eligibility or spend capacity. The 4-to-1 coalition signal has no primary evidence supplied here; proposed consent and lead acceptance require actual records."
    },
    "applications/node--requirement-profile-aggregation.md": {
      "disposition": "reverify",
      "reason": "Historical Node implementation and verification date were not rerun. The displayed regex strips only one leading imperative and can merge must versus should; per-analysis counting can overweight one solicitation. First-seen text can be a poor representative and localeCompare depends on locale/runtime for reproducibility. Profile shares are historical sampled observations, not binding checklist rules."
    }
  }
}
```
