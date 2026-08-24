---
subject: trace-rollup-and-attribution
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
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
