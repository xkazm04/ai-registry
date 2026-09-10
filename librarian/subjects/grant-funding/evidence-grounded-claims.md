---
domain: grant-funding
subject: evidence-grounded-claims
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# evidence-grounded-claims

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/evidence-grounded-claims",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:eae35e9e36f31e89",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Source says 78 percent of staff completed training; draft says 78 percent of beneficiaries found work. The numeric set passes an unsupported claim.",
    "100 percent of board members donated is a factual assertion requiring evidence.",
    "Annual revenue for 2024 and 2025 are two valid facts, not necessarily a conflict.",
    "20 of 25 participants gives a traceable 80 percent even if that literal percentage is absent from the source."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/evidence-grounded-claims",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "evidence-grounded-claims.md": {
      "disposition": "reverify",
      "reason": "Grounding does not make fabrication structurally impossible. External cited statistics and explicit derivations can be legitimate; verbatim digits can still attach to the wrong population. The richer-data causal claim needs controlled evidence and percentage-only precision needs measurement."
    },
    "techniques/bracketed-placeholder-over-invention.md": {
      "disposition": "reverify",
      "reason": "Brackets can be overlooked, legitimate citations also use brackets, and the supposedly number-free example says three poorest districts. Matching kind alone does not establish relevance; repeated placeholders may refer to different periods or programmes."
    },
    "techniques/document-fact-extraction.md": {
      "disposition": "reverify",
      "reason": "Regex can misattribute numbers and is neither free nor automatically conservative. Explicit quotation is not truth; confidence cannot resolve source disagreement by itself. Truncation may remove critical qualifiers, and delimiter stripping does not guarantee injection resistance."
    },
    "techniques/placeholder-to-fact-resolution.md": {
      "disposition": "reverify",
      "reason": "Amount, budget and annual revenue are not equivalent. Year can mean founding year rather than fiscal year; deterministic cue rules can guess wrongly too. A human acceptance click reduces risk but does not prove semantic fit."
    },
    "techniques/provenance-per-figure.md": {
      "disposition": "reverify",
      "reason": "Source filenames need precise locations and immutable versions. Old fiscal years remain valid historical evidence; deletion or replacement needs retention and invalidation policy rather than erasing audit history. Extraction error can be corrected against the same original source with a recorded revision."
    },
    "techniques/ungrounded-statistic-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired missing echo versus fabrication, claim context, derived rates, percent versus percentage points, endpoints and detector scope. Numeric equality does not establish support."
    },
    "techniques/verified-fact-ledger.md": {
      "disposition": "clarify",
      "reason": "Repaired sourced candidates versus verification, period-specific cardinality, conflict retention, external sources and explicit derivations; exact quotation and normalized representations can coexist."
    },
    "applications/node--ungrounded-statistic-detection.md": {
      "disposition": "reverify",
      "reason": "Historical code/date not rerun. Numeric sets accept a rate belonging to another group and conflate percent with percentage points; blanket 0/100 exemption misses board-participation claims. Eighty-character bracket matching is not comprehensive placeholder detection. Tiger drill causality and precision remain unverified."
    },
    "applications/node--verified-fact-ledger.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. First-match singular revenue drops multiple fiscal years and conflicts; caps truncate without proving completeness. Filename plus prompt instruction is not enforced truth, and a deterministic placeholder mapper can insert revenue into a grant-budget request."
    }
  }
}
```
