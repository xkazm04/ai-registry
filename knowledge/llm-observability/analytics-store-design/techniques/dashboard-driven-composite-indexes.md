---
layer: technique
type: technique
subject: analytics-store-design
technique: dashboard-driven-composite-indexes
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [adding a filter to an event listing, a dashboard read getting slow with volume, reviewing the index set against the query surface]
---

# Dashboard-driven composite indexes

The index set of an analytics store is not derived from the schema; it is
derived from the **query surface** — the concrete list of filters, sorts,
and rollups the product actually serves. Every index exists because a named
query needs it; every query either names its index or is a documented scan.
This technique is the derivation procedure and the column-ordering rules
that make one index do double duty.

## The core rule: filtered column before the sort column

The dominant read shape in LLM telemetry is "this project's events, filtered
by one high-cardinality dimension, newest first, keyset-paged":
`WHERE project = ? AND provider = ? ORDER BY ts DESC LIMIT n`. One composite
index serves that entire query **iff the columns are ordered equality-first,
range-last**: `(project, provider, ts)`. The equality columns pin a
contiguous region of the index; within it, entries are already in timestamp
order, so the seek, the sort, and the "resume after cursor" predicate are
all the same index walk.

Get the order wrong — `(project, ts, provider)` — and the index still
"works": the planner seeks the project's time range and filters provider as
a residual. On the dev database this is indistinguishable from correct. In
production it means a query for a rare provider walks the project's *entire*
history to find its rows, and the cost grows with total volume rather than
with result size. The failure is silent, deferred, and discovered by a
customer.

So the derivation procedure is:

1. Enumerate the query surface: each list endpoint's filter combinations,
   each dashboard panel's cut, each rollup's grouping, each governance
   read's window.
2. For each high-cardinality equality filter that combines with the time
   sort, mint one composite `(tenant, dimension, time)`. Low-selectivity
   predicates and JSON-path filters stay residual *within* an indexed range
   — acceptable exactly because the range is already narrow.
3. For each grouping read (e.g. "roll this project's events up by trace"),
   mint the composite that makes the group reachable without a scan:
   `(tenant, group-key)`.
4. Write the rationale as a comment **on the index itself**. An index whose
   reason is recorded survives review; an unexplained index gets dropped by
   the next cleanup pass, and the query it served regresses a month later.

## Two clocks means two index families

Because client event time and server receipt time are separate columns
serving separate query families (per
[server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock)),
they need separate composites: `(tenant, event-time)` for the analytical
listings and rollups, `(tenant, receipt-time)` for the accounting window
reads — limit admission, usage-since, the forecast series. The accounting
composite is the more critical of the two: it runs on the hot ingest path,
often inside a per-tenant admission lock, so a missed index there is not a
slow dashboard, it is ingest throughput collapsing under its own history.

One subtlety with migrated columns: if reads coalesce the new receipt-time
column over the old event-time column for pre-migration rows, a plain
column index cannot serve that predicate at all — the index must be over
**the expression the query uses**, or the query must be split into the
indexed modern case and a bounded legacy case. Indexing the column while
querying the expression is the advanced form of the silent-residual failure
above.

## Indexes the surface does not need

The procedure prunes as much as it mints:

- No index for a filter that only ever co-occurs with a stronger one.
  Residual filtering inside a tight indexed range is free compared to the
  write cost of another composite on a hot insert path.
- No covering indexes by default. The fact row is wide; covering it
  duplicates the table. Seek-then-fetch is the right trade until a measured
  read proves otherwise.
- No index on the JSON side-channels. A metadata key that needs an index has
  outgrown JSON — promote it to a column (the flat-events technique owns
  that move) rather than indexing into the blob.

## Partial indexes for transient states

A predicate that is true briefly and false forever — "rows not yet
backfilled", "jobs still queued" — deserves a **partial index**: it makes
the transitional query index-driven while it matters and shrinks to nothing
once the state drains, so re-running an idempotent migration or a recurring
sweep costs a lookup instead of a full scan, forever.

## When not to use this

- On the analytical warehouse copy — there the same reasoning produces
  partitioning and clustering choices instead of b-tree composites; see the
  companion partitioning technique.
- Before the query surface exists. Speculative indexes are write cost plus
  a false signal to the next reader about what the product serves. Index
  when the panel ships, in the same change.
- When the fix is upstream: a query that filters on a computed expression is
  often better rewritten to filter on the stored column than served by an
  expression index nobody else will reuse.
