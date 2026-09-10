---
domain: llm-observability
subject: llm-price-book-operations
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# llm-price-book-operations

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/llm-price-book-operations",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:238bb26b064f57eb",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two rebuilds read revisions 1 and 2; revision 1 finishes last and overwrites revision 2 under the same pointer lock.",
    "A premium lane costs more than standard, so base fallback understates rather than conservatively bounds cost.",
    "Unknown-model calls imputed at the window mean do not acquire their own model price merely when a row is added."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/llm-price-book-operations",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "scope": "Primary pricing source consulted for provider-specific pricing structure; no complete current rate-table or historical application refresh."
    }
  ],
  "documents": {
    "llm-price-book-operations.md": {
      "disposition": "reverify",
      "reason": "A price book models estimates, not necessarily invoiced actuals. Ignoring discounts can overprice rather than always underprice. One-level variants cannot cover populated lane-by-tier combinations; served lane, effective time and usage classes matter. Frozen wrong estimates need auditable correction, not mandatory waiting for windows to roll."
    },
    "techniques/embedded-seed-fallback.md": {
      "disposition": "reverify",
      "reason": "Embedded nonempty data does not guarantee supported-model coverage, freshness or negotiated rates. A parseable empty file still wins under the stated precedence. Corrupt override fallback can silently change economics despite a warning; validate semantics and declare refusal policy. Versioned merges can be reproducible, and runtime staleness remains relevant after first boot."
    },
    "techniques/hot-swap-price-book.md": {
      "disposition": "clarify",
      "reason": "Repaired out-of-order rebuild races, snapshot consistency, database/cache divergence and write time versus provider effective time. Full rebuild plus pointer lock alone does not prevent an older read replacing a newer book."
    },
    "techniques/no-retroactive-repricing.md": {
      "disposition": "clarify",
      "reason": "Repaired estimates as immutable measurements and unpriced imputation as automatically correct after adding a row. Preserve original decisions while supporting versioned correction and explicitly valued projections."
    },
    "techniques/price-provenance-and-staleness.md": {
      "disposition": "reverify",
      "reason": "Source URL and write timestamp do not show who changed a row or preserve the cited page version. Separate actor, provider effective date, local activation and verification coverage. Typed units can prevent thousand/million mistakes. Repricing cadence is not a predictable validity bound; calendar defaults need risk-based and event-driven checks."
    },
    "techniques/price-resolution-order.md": {
      "disposition": "clarify",
      "reason": "Repaired premium-lane fallback as conservative, lane/tier incompatibility and syntactic date trimming as proof of price equivalence. Unknown rates and partial class coverage remain disclosed rather than fabricated actuals."
    },
    "techniques/price-row-variant-encoding.md": {
      "disposition": "reverify",
      "reason": "A parsed suffix grammar is one schema choice, not guaranteed future-proof. Arbitrary model names can collide with reserved suffixes. Lane-by-tier needs an explicit representation; token classes also interact with length thresholds. Multipliers can be valid provider rules and validated structured columns are legitimate. Missing cells cannot silently use base as actual price."
    },
    "applications/process--no-retroactive-repricing.md": {
      "disposition": "reverify",
      "reason": "Historical runbook retained, not rerun. Mean-priced-call imputation does not self-correct to the missing model rate simply because that rate is added; displayed implementation and prose disagree. Dated provider multipliers are not fully refreshed. Estimates may be corrected with lineage; startup semantic validation and concurrency remain unproven."
    },
    "applications/rust--price-resolution-order.md": {
      "disposition": "reverify",
      "reason": "Historical Rust code retained, not rerun. Priority as flex synonym can underprice a premium lane. Date-shaped suffix does not establish price identity, saturation hides cached counts exceeding input, and listed 100k/300k tests do not establish exact-threshold behavior. Seed activation now is valid if separate from verification; substituting verification date would conflate those clocks."
    }
  }
}
```
