---
domain: grant-funding
subject: grant-taxonomy-design
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# grant-taxonomy-design

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-taxonomy-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:888019b5f6736922",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Adding a valid new code can break a consumer with an exhaustive enum or change classifier outputs.",
    "A health-and-education call legitimately needs two sector labels even when the residual model is asked for one.",
    "A confident regex tag can be wrong and should not be immune to evidence-based correction."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/funding-landscape/grant-taxonomy-design",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://taxonomy.candid.org/",
      "scope": "Primary classification vocabulary reference identified for facet context; no external taxonomy migration or classifier benchmark executed."
    }
  ],
  "documents": {
    "grant-taxonomy-design.md": {
      "disposition": "reverify",
      "reason": "Facets can contain hierarchies and need not be statistically independent. Deterministic precedence is an engineering policy, not epistemic authority. Single-code residual conflicts with multivalued sectors; missing tags need not be safer for every user decision. Corpus-wide accuracy and cost claims remain historical."
    },
    "techniques/agency-and-programme-fallbacks.md": {
      "disposition": "reverify",
      "reason": "Agency remit rarely proves all programmes share a sector, and an issuer field can be missing. Source-specific programme codes may be strong evidence but still need versioned interpretation. Fallback restoration of suppressed tags is not necessarily correct; conflicting evidence should be retained."
    },
    "techniques/append-only-codes-with-migrations.md": {
      "disposition": "clarify",
      "reason": "Repaired additive compatibility limits, label versus semantic changes, migration chains/cycles and unresolved splits. Unknown historic codes remain auditable rather than disappearing."
    },
    "techniques/deterministic-first-classification.md": {
      "disposition": "reverify",
      "reason": "Same input requires same rule, taxonomy and normalization versions. Deterministic patterns can classify multiple languages; rule outputs can be reviewed and corrected. Most project grants is not a universally true default; matching all means placing a weak rule last does not reduce its weight."
    },
    "techniques/false-positive-suppressors.md": {
      "disposition": "reverify",
      "reason": "Innocence keywords can be negated, quoted or incidental. Bare sustainable without an environmental noun is absence-based despite the stated rule against it. A measured single counterexample can justify a repair without a invented percentage; holdout recall is required beyond retag-count diffs."
    },
    "techniques/llm-residual-classification.md": {
      "disposition": "clarify",
      "reason": "Repaired calibrated acceptance versus self-confidence, per-dimension cardinality, operational failures versus abstention and review of wrong deterministic tags."
    },
    "techniques/orthogonal-dimension-modelling.md": {
      "disposition": "reverify",
      "reason": "Facets answer distinct questions but may have valid dependencies. Co-funders can have multiple types; geography can use controlled vocabulary, and internal analytic facets need not appear in browse UI. Nearly all is not universal, and small corpus size does not eliminate entanglement."
    },
    "applications/node--deterministic-first-classification.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date preserved, not rerun. Corpus percentages and counterfactual recall recovery require original audit data. Broad defaults and prefix rules may misclassify; taxonomy version alone misses classifier-version changes. A renamed code can retain a formerly narrower meaning in historical rows."
    },
    "applications/node--llm-residual-classification.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. Confidence >=0.6 is not an accuracy guarantee, cache by prompt needs model/config scope, and one label loses valid multi-sector content. Code validity prevents invented identifiers but not incorrect assignments; transport null must remain distinguishable from deliberate abstention."
    }
  }
}
```
