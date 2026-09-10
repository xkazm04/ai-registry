---
domain: civic-intelligence
subject: public-procurement-analysis
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# public-procurement-analysis

## Architecture review - 2026-09-09

Reviewed all ten documents. Corrected attribution, aggregation, versioning and
threshold claims. Source checks support only the scopes below. Historical consumer
code, incidents, counts, live ingest and actual indicator precision remain open;
no maturity or application witness dates changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/public-procurement-analysis",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:fb02d89519f8722c",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read. Primary source checks scoped below; no consumer execution or application witness refresh.",
  "counterexamples": [
    "A cancelled two-party contract with a receiver flag proves no disbursement.",
    "An omitted refund invalidates a positive-subset lower bound on net receipts.",
    "A correction replacing 100 with 10 is not necessarily a legal amendment of -90.",
    "For a regime applying at or above L, equality belongs outside the below-threshold band.",
    "Identical caps can truncate one supplier while fully covering another."
  ],
  "sources": [
    {
      "url": "https://standard.open-contracting.org/latest/en/schema/records_reference/",
      "scope": "Process-level records, compiled state and separate implementation transactions."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "scope": "Historical dump mutation, withdrawal and reuse obligations; no local legal compliance determination."
    },
    {
      "url": "https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/",
      "scope": "2024 guide landing page and 73 indicators; formulas not exhaustively evaluated."
    },
    {
      "url": "https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/",
      "scope": "Announcement only, not current maintenance or installed behavior."
    },
    {
      "url": "https://link.springer.com/article/10.1007/s00181-022-02250-4",
      "scope": "Publisher abstract and bibliographic record; full article, correction text and replication not evaluated."
    }
  ],
  "documents": {
    "techniques/payer-vs-receiver-direction.md": {
      "disposition": "clarify",
      "reason": "Separate intended direction from actual payment; allow explicit multi-party flows and conflicting states."
    },
    "techniques/contract-version-supersession.md": {
      "disposition": "clarify",
      "reason": "Distinguish disclosure corrections, legal amendments, partial releases and deletion reconciliation."
    },
    "techniques/registry-coverage-blind-spots.md": {
      "disposition": "clarify",
      "reason": "Replace automatic floors, heuristic cap detection and equal-query comparability with explicit conditions."
    },
    "techniques/contract-registry-record-model.md": {
      "disposition": "clarify",
      "reason": "Namespace agreement identity and remove parser-as-compliance guarantee."
    },
    "techniques/value-basis-non-summability.md": {
      "disposition": "clarify",
      "reason": "Require non-overlapping compatible amounts; disclosure cannot validate a mixed monetary total."
    },
    "techniques/threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "Correct strict-boundary arithmetic and legal applicability; distinguish test results from manipulation probabilities."
    },
    "public-procurement-analysis.md": {
      "disposition": "clarify",
      "reason": "Correct payment, floor, mixed-total and publication-history claims."
    },
    "applications/node--contract-registry-record-model.md": {
      "disposition": "reverify",
      "reason": "Historical parser, identifiers and incident claims were not replayed; narrow compliance claim."
    },
    "applications/node--value-basis-non-summability.md": {
      "disposition": "reverify",
      "reason": "Composition-only disclosure leaves mixed sums invalid; consumer code and dated counts need reverification."
    },
    "applications/process--threshold-proximity-signals.md": {
      "disposition": "clarify",
      "reason": "Replace broad landscape assertions with bounded primary checks; correct journal volume and adoption guarantees."
    }
  }
}
```
