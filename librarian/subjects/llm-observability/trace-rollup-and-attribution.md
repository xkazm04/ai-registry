---
subject: trace-rollup-and-attribution
domain: llm-observability
last_touched: 2026-09-10
touched_by: librarian-inbox-writer
dry_streak: 0
---

# trace-rollup-and-attribution

First touch: [[2026-08-23-6]], external reconcile against `Arize-ai/phoenix`
@ `9478f95` (arize-phoenix 20.3.0). Gained `python--keyset-trace-pagination`
(uncovered); single-stack debt cleared. Hint confirmed, richer than sent.
Executed evidence: cursor codec exec'd verbatim, a 6-trace keyset harness, a
NULL-ordering probe.

## Measured disproof - LANDED in cycle N1-a ([[2026-08-23-7]]): cursor-column direction constraint written into the technique

- `keyset-trace-pagination` prescribes the trace's LATEST event time as the
  cursor column and calls the consequence a benign re-appearance. Executed:
  under the DESC order the technique also prescribes, a later-moving key
  SKIPS rows (trace 5 silently lost); an earlier-moving key only duplicates.
  The rule should read: the cursor column must be immutable, or mutable only
  in the direction that duplicates. Priority for the next cycle.

## Open leads (banked, convergence rule applies)

- Nullable sort columns need pinned NULL placement + NULL-aware cursor
  degeneration; a dialect default breaks it (SQLite NULLs-first measured).
- A short or empty page is not end-of-traversal; the flag is the only end
  signal (empty-page-with-hasNextPage + bounded refill loop sighted).
- A cursor-independent total is not a CURRENT one (1h TTL count cache).
- One timeRange argument reads span-grain in one branch, trace-grain in
  another - coexisting unstated readings the technique forbids, sighted live.
- Refusal-by-schema-extension: refusal and the constant it makes honest are a
  pair; either alone is a lie.

## Cross-subject proposals

- derived-trace-rollup tension: the tree materializes monotone extrema
  (min-start/max-end) and that is what makes keyset exact - candidate rule:
  monotone order-independent extrema are safe to materialize under late
  arrival; non-monotone derived values are not.
- span-cap-truncation-signal: same tree bounds the detail read but ships no
  truncation boolean (numSpans must be compared by hand) - a second-worker
  target on the same pin.
- tenant-scoped-trace-ids: scope-in-the-query sighting at Project.trace.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (personas). `single-shape-rule`'s own "each path may gather the facts its own way"
was the loophole; it now governs how facts are fetched, never which things, and a new
section pins the collection as well as the rule: counts and totals above a list are passed
down from the list's owner, never re-derived at the display site, and the conformance test
uses a fixture where the collections could differ. Corroborated by the dimensional-modeling
tradition (drilling across requires conformed row headers) and the reporting practice's
"same metric, different filter context" defect class. Application `react--single-shape-rule`
at personas `b6dcf28aa` (span count handed down beside error count; asymmetric regression).
Proposals: measurement-honesty `co-published-numbers-must-reconcile` lacks a collection
constraint; `span-cap-truncation-signal` interacts with a pinned collection.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/trace-rollup-and-attribution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cef53dcf01b3905b",
  "disposition": "reverify",
  "coverage": "All 13 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Fetching 5001 rows proves more than 5000 exist, not whether total is 5001 or 100000.",
    "Two deliveries of one span ID need not be two paid calls.",
    "A trace moves across a cost filter while paging on an immutable ID; keyset alone cannot freeze membership."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/trace-rollup-and-attribution",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "trace-rollup-and-attribution.md": {
      "disposition": "reverify",
      "reason": "Materialized projections can be maintained correctly and explicit completion markers can exist. Observed spans are not necessarily all events. Summed elapsed span time is not CPU compute and min/max clocks do not establish user wait. Mutable activity keys do not guarantee exact pagination. W3C wire grammar and opaque native identity need separate contracts."
    },
    "techniques/derived-trace-rollup.md": {
      "disposition": "clarify",
      "reason": "Repaired categorical ban on maintained projections, retries treated as distinct calls, first-arrival nondeterminism and malformed events assumed harmless to totals. Version the fold and validate scope before aggregating."
    },
    "techniques/keyset-trace-pagination.md": {
      "disposition": "clarify",
      "reason": "Repaired exactness under concurrent mutation, contradictory latest-activity cursor wording and count freshness. Snapshot and filter membership matter beyond a stable cursor; scalar unique cursors are valid."
    },
    "techniques/single-shape-rule.md": {
      "disposition": "reverify",
      "reason": "Shared definitions and collection scope are useful but code reuse alone does not guarantee agreement. Any failed child is a policy choice, not necessarily failed request after recovery. Sums have units, null, dedup and rounding choices too. Use maximum finish, not finish of last-starting span; sum of elapsed spans is not compute time."
    },
    "techniques/span-cap-truncation-signal.md": {
      "disposition": "clarify",
      "reason": "Repaired limit-plus-one as exact total, oldest span assumed root, truncation assumed pathology and universal retained-only totals. Scope each aggregate and its snapshot explicitly."
    },
    "techniques/tenant-scoped-trace-ids.md": {
      "disposition": "reverify",
      "reason": "Tenant query scope and server-owned billing attribution are sound. Scope cache, scores, exports and write identities as well. A native opaque ID can be case-sensitive even if hex-shaped; shape alone does not prove protocol semantics. W3C wire traceparent requires lowercase hex rather than arbitrary case-insensitive acceptance. Opaque credential IDs are prudent; a cryptographic token hash is not automatically reversible."
    },
    "techniques/unpriced-span-accounting.md": {
      "disposition": "clarify",
      "reason": "Repaired missing latency as safe zero, missing cost as no cost, unconditional lower-bound claim and price book as only cause. Preserve measurement status and reason across aggregates."
    },
    "applications/python--keyset-trace-pagination.md": {
      "disposition": "reverify",
      "reason": "Historical Phoenix harness retained, not rerun. Mutable-start direction improves this finite fixture but cannot guarantee a live snapshot under changing filters or insertions. One-hour cached count and omitted trace predicate do not match current list population. Null ordering, malformed cursor handling and stripped assert remain concrete residuals."
    },
    "applications/react--derived-trace-rollup.md": {
      "disposition": "reverify",
      "reason": "Historical React first-wins change retained, not rerun. Test explicitly changes owner with input order, contradicting order-independent determinism. Duplicate IDs can be retries or updates, not proven distinct calls. First-wins without canonical ordering and conflict policy cannot establish correct linkage or accounting."
    },
    "applications/react--single-shape-rule.md": {
      "disposition": "reverify",
      "reason": "Historical React collection fix retained, not rerun. Null unifiedTrace becomes zero and may mean loading or unavailable. Root cost lookup still selects a population and can mislead beside merged rows. Shared counts do not establish full cost, duration or capped coverage."
    },
    "applications/react--unpriced-span-accounting.md": {
      "disposition": "reverify",
      "reason": "Historical formatter tests retained, not rerun. Null-to-dash preserves missingness at this seam, but Rust mapper already coerces other costs to zero. Type annotations are not runtime validation; a dash needs an accessible meaning and aggregate completeness is still absent."
    },
    "applications/rust--derived-trace-rollup.md": {
      "disposition": "reverify",
      "reason": "Historical Rust fold retained, not rerun. Timestamp-only ties preserve arbitrary incoming order; duplicate span IDs need delivery classification. Limit-plus-one cannot establish total above cap, shared shape does not fix snapshot/population mismatch, and ended cursor can skip moving traces."
    },
    "applications/rust--unpriced-span-accounting.md": {
      "disposition": "reverify",
      "reason": "Historical Rust accounting retained, not rerun. Known-component sum with missing count is useful but not always a lower bound on actual invoice. Latency zero without missingness hides unavailable timing; serde missing count default zero makes legacy completeness unknown."
    }
  }
}
```
