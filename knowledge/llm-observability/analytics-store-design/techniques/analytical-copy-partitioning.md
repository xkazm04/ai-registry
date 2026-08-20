---
layer: technique
type: technique
subject: analytics-store-design
technique: analytical-copy-partitioning
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [long-horizon queries straining the row store, designing the warehouse copy of the events table, deciding which store serves which read]
---

# Analytical copy partitioning

Past a modest scale, one store cannot honestly serve both of the product's
read families. Ingest, admission checks, and recent listings want a row
store: point writes, index seeks, transactional reads. "What did the last
two quarters cost, by model, by customer" wants an analytical warehouse:
columnar scans priced by data touched. The technique is the fork — an
append-only copy of the fact table in a warehouse, shaped so time-ranged
analytics is cheap — and the strict role separation that keeps the fork from
becoming two disagreeing sources of truth.

## The copy is a sink, not a peer

The row store remains the system of record and the only enforcement
surface. The warehouse copy:

- **Receives, never originates.** Events flow one way, through an event
  sink on the ingest path (or a batched exporter). Nothing writes the copy
  directly, and nothing corrects it in place — a correction is a new fact,
  never a restatement of an old row.
- **Never enforces.** Budget windows, limit admission, and anything keyed
  on server receipt time (per
  [server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock))
  read the row store. The copy is eventually consistent by construction —
  batched, minutes behind, occasionally replayed — and an admission check
  against a stale copy is an enforcement hole with excellent dashboards.
- **Mirrors the logical schema.** Same columns, same names, same meanings
  as the fact table, with type mappings stated once (the string timestamp
  becomes the warehouse's native temporal type; the JSON side-channels
  become native JSON or string). The payoff is that an analyst's query
  written against one store runs against the other with trivial edits —
  the portability claim, extended to the warehouse.

## Partition by date, cluster by the filter dimensions

The warehouse's cost model prices a query by the bytes it touches, so the
physical layout *is* the performance design:

- **Partition by the event's calendar date.** Every analytical question has
  a time range; date partitioning turns "last 30 days" into "read 30
  partitions" regardless of how many years the table holds. This is what
  makes retention economically unbounded: old partitions cost storage, not
  query time. Partitioning is on *event* time, not receipt time — the
  analytical clock, the one users' questions mean — which is precisely why
  the copy can never serve accounting reads, whose windows key on the other
  clock.
- **Cluster within partitions by the dominant equality filters** — tenant
  first, then the highest-value dimensions (provider, model). Clustering is
  the warehouse's analogue of the composite index: it co-locates the rows a
  filtered query wants so the scan skips the rest. Choose the clustering
  columns from the same query-surface enumeration the indexing technique
  uses; the two artifacts are one design expressed in two physics.
- **Order the clustering by selectivity of the real queries**, not by
  cardinality in the abstract. Tenant leads because every query is
  tenant-scoped; a dimension no dashboard cuts by earns no clustering slot.

Late-arriving events land in their *event-date* partition, not today's —
partition-by-load-date is simpler for the pipeline and wrong for every
query, because a time-ranged question would silently miss rows that arrived
after their day closed.

## Sizing the fork honestly

The fork has a cost — a pipeline, a lag, a second schema to keep mirrored —
so the decision rule matters:

- **Before the fork**: serve everything from the row store. A well-indexed
  row store handles surprisingly deep history for a single team's traffic;
  forking earlier buys complexity with no reads to justify it.
- **The trigger is a query class, not a row count**: fork when a real
  surface needs scans the row store's indexes cannot bound — whole-history
  group-bys, cohort comparisons across months, per-customer year series.
- **After the fork, draw the routing line by window, and write it down**:
  recent-and-exact reads (listings, traces, governance) stay on the row
  store; long-horizon aggregates go to the copy. A read that straddles the
  line belongs to the row store until the copy's lag is measured and
  acceptable for that surface.

An interim stage is legitimate: client-side aggregation over a bounded
recent window (pull the matching rows, sum in the service) serves
low-volume deployments on weak backends without any warehouse at all — the
honest version of "we are too small to fork", stated with its O(matched
rows) cost rather than hidden.

## When not to use this

- Below the trigger. The premature warehouse is the domain's most popular
  resume-driven mistake; the row store plus good composites is the right
  v1 and often the right v3.
- Never let dashboards *write* rollups back into the row store as peer
  tables — that is the two-sources-of-truth failure re-imported. Rollup
  caches, if needed, are declared caches with stated recomputation.
- Do not extend the copy to config and governance tables (projects, keys,
  rules). They are small, hot, and transactional; copying them buys nothing
  and invites someone to read them from the wrong store.
