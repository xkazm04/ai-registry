---
layer: technique
type: technique
subject: analytics-store-design
technique: flat-events-plus-json-linkage
status: forged
laws: [server-owns-the-accounting-clock, nullable-never-zero]
shared_with: []
use_when: [designing the events fact table, deciding whether a field is a column or metadata, adding customer or product attribution]
---

# Flat events plus JSON linkage

The fact table for LLM telemetry is one wide, flat row per normalized call.
No dimension tables, no surrogate keys, no join topology. Typed columns hold
what queries touch; JSON side-channels hold what rows merely carry. The
technique is the discipline of that boundary — what earns a column, what
stays in JSON, and how a field crosses over without breaking anything.

## What earns a typed column

A field is a column when at least one of these is true, and stays JSON
otherwise:

- **Queries filter or group on it.** Project, provider, model, operation,
  status, the use-case label. These are the dimensions of every dashboard
  cut; a filter over a JSON path is a scan with extra steps on most row
  stores.
- **An index must serve it.** Indexes index columns. If the field belongs in
  a composite (see the companion indexing technique), it is a column by
  definition.
- **A constraint or default protects it.** Token counts default to zero
  *because zero calls-worth-of-tokens is a measurement*; cost is nullable
  *because an unpriced call is an admission, not a free one* — the
  [nullable-never-zero](../../_laws.md#nullable-never-zero) distinction is
  enforceable only on typed columns.
- **The accounting path reads it.** Anything a budget, cap, or enforcement
  decision touches must be a column the server controls. In particular the
  server's receipt timestamp is a column the ingest path stamps and the
  request body cannot set — client event time and server receipt time are
  *two columns*, per
  [server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock),
  and no JSON field ever feeds accounting.

## What stays in JSON

- **Payloads** — request and response bodies. Large, schemaless, subject to
  per-project redaction policy, and never filtered on server-side. One text
  column each — with a size ceiling: once payloads reach megabytes per event
  (agentic traffic gets there fast), they move out of the row entirely, into
  a blob store with a reference column. The row keeps the pointer and the
  size, never the bytes; the boundary rule is unchanged, only its far edge
  named.
- **Tags** — a freeform label array. Query semantics are *membership*, not
  substring: "has tag X" is answerable (imprecisely but correctly) with a
  containment predicate; substring matching over a serialized array matches
  `"checkout"` against `"checkout-v2"` and is a correctness bug, not a
  performance one.
- **Metadata** — the open extension surface. App-supplied attribution
  (customer id, product id, feature flag arm) lands here first, queryable by
  key or key=value. This is the pressure valve that lets the product answer
  per-customer questions *before* the schema knows customers exist.

## Promotion across the boundary is additive, always

Fields migrate: a metadata key that every dashboard groups by has outgrown
JSON. The move follows one rule — **the schema only ever gains**:

1. Add the column, nullable, with an idempotent "add if absent" migration.
   The store applies its schema on every boot, so migrations must be safe to
   re-run forever.
2. Order matters mechanically: the column addition must precede any index
   over it in the same migration batch, or the batch fails on every existing
   deployment while passing on every fresh one — the classic migration that
   only breaks in production.
3. Backfill from the JSON source where feasible, and make reads tolerate the
   pre-backfill state (coalescing new column over old source) so the code
   never depends on the backfill having completed.
4. Keep writing both for a deprecation window if any consumer still reads
   the JSON path.

Never rename, never repurpose, never change a column's meaning in place. A
third party's saved query is part of the installed base; "data-open" means
their SQL keeps working.

## Derived views are computed, not stored

A trace is every event sharing a trace identifier, with the span tree
reconstructed from parent pointers on read. There is no traces table. The
temptation to materialize one arrives with the first slow trace listing; the
answer is a composite index over (project, trace id) — not a second table
whose rows can contradict the first the day an event arrives late or a
rollup bug ships. The same holds for cost summaries and daily series: they
are queries, or at most caches with a stated recomputation, never peer
tables written on ingest.

One field-observed boundary on this rule: at columnar scale, trace-level
*identity attributes* (the user, the session) do get denormalized onto every
event row — wider and flatter than a row store would dare — because they are
written once, at ingest, onto immutable rows. That is not a materialized
view; it is the flat-row discipline extended. The roll-up itself — the tree,
the totals — stays computed on read.

## When not to use this

- When the write path and read path belong to the same team and the queries
  are closed — builder-side logging can use whatever shape its own reader
  likes; the flat contract is for stores with strangers.
- When a dimension is genuinely relational — customers with names, plans,
  and lifecycle of their own deserve their own table *in the application
  domain*; the events table still stores only their identifier.
- Do not flatten the payloads themselves into columns. A "prompt_text"
  column invites indexing, substring search, and retention policies the
  redaction model must then fight. Payloads are opaque by design.
