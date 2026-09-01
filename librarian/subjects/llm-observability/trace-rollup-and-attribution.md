---
subject: trace-rollup-and-attribution
domain: llm-observability
last_touched: 2026-09-01
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
