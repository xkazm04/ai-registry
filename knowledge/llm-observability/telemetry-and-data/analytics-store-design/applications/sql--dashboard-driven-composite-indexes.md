---
layer: application
type: application
subject: analytics-store-design
technique: dashboard-driven-composite-indexes
stack: sql
status: forged
verified_on: 2026-08-30
verified_against: sql@16
---

# Query-surface-derived indexes across three backends (LightTrack)

LightTrack's event store realizes the technique across three schema files
that mirror one logical model (`docs/DATA_MODEL.md:3-4`): SQLite as the
reference row store, Postgres as the networked port, BigQuery as the
analytical copy. Every index carries its rationale as a comment — the
technique's "an unexplained index gets dropped" rule, applied literally.

## Filtered-column-before-ts, stated as the reason

`schema/sqlite/001_init.sql:67-72` mints the three high-cardinality
composites with the ordering rule in the comment:

> "Each puts the filtered column ahead of `ts` so one index serves BOTH the
> equality seek and the `ORDER BY ts DESC` keyset paging; without them a
> provider/model/status-only query degraded to a residual scan of the whole
> project-ts range."

— `idx_events_project_provider_ts`, `..._model_ts`, `..._status_ts`. The
"degraded to a residual scan" clause is a lived incident, not a hypothesis:
the query surface (`docs/DATA_MODEL.md:36-48`) AND-combines these equality
filters with keyset paging, and `min_cost` / `tag` / `meta` are explicitly
left "residual within that range" — the prune half of the technique (no
index for predicates that only co-occur with stronger ones, none into the
JSON side-channels).

## Two clocks, two composites

The accounting clock gets its own index family: `001_init.sql:57-60` pairs
`idx_events_project_ts` (client event time — listings, rollups) with
`idx_events_project_received` and the comment that windowed accounting
"filters on server arrival time, not client `ts`, so it needs its own
composite." The grouping read gets `idx_events_project_trace`
(`:62-65`), minted for the project-scoped trace rollup while the
single-column `idx_events_trace` keeps serving the per-trace fetch — one
index per named query, both named.

## The expression-index upward lesson

The Postgres port (`schema/postgres/001_init.sql:57-73`) teaches two things
the expert draft folded in:

- **Additive migration ordering**: `ADD COLUMN IF NOT EXISTS received_at`
  must precede any index over it — "an index on a not-yet-added column
  fails the whole schema batch on every existing deployment" (`:59-61`) —
  and the backfill gets a partial index (`idx_events_received_backfill
  ... WHERE received_at IS NULL`, `:65`) so re-running the idempotent batch
  on every boot "costs a lookup instead of a seq scan" once the backfill
  drains.
- **Index the expression the query uses**: because reads coalesce for
  pre-migration rows, the accounting composite is
  `ON events(project_id, COALESCE(received_at, ts))` (`:72-73`) — "a plain
  (project_id, received_at) index cannot serve `COALESCE(...) >= $2`, and
  admission runs this query on every ingested event, inside the per-project
  admission lock." That is the technique's hot-path clause at its sharpest:
  the miss would be ingest collapse, not a slow dashboard.

## The same design in warehouse physics

`schema/bigquery/001_init.sql:31-32` re-expresses the identical query
surface as layout: `PARTITION BY DATE(ts)` and
`CLUSTER BY project_id, provider, model` — tenant first, then the two
dimensions the composites indexed on the row stores. Scores get the
parallel treatment (`:47-48`: partition by `created_at`, cluster by
`project_id, rubric`). One derivation, two physics — b-tree composites
where seeks are cheap, partition-plus-cluster where scans are priced by
bytes touched.
