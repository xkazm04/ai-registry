---
layer: application
type: application
subject: analytics-store-design
technique: analytical-copy-partitioning
stack: process
status: forged
refresh_by: 2026-11-20
---

# The LLM-telemetry storage landscape, 2025–2026 (field survey)

A dated application of the technique to the layer that moves under it: which
store classes the observability platforms actually run their event tables on,
where the row-store doctrine's ceiling was measured, and what the field pairs
with date partitioning in practice. Checked 2026-08-20; the platform
architectures below are the fastest-moving facts in this subject — re-verify
by the frontmatter date.

## Where the platforms landed

- **Langfuse** ran its first two major versions on Postgres — "the right
  call for shipping quickly" — and measured the row store's ceiling at
  **tens of thousands of events per minute**: ingestion exhausted IOPS while
  dashboard scans over millions of wide rows crawled. v3 (December 2024)
  moved all tracing data to ClickHouse on the stated diagnosis that "trace
  observability is an OLAP problem." The 2026 redesign went further: a
  **single wide, mostly immutable observations table**, trace-level
  attributes (`user_id`, `session_id`) denormalized onto every row to
  eliminate joins and read-time dedup — initial loads went from seconds to
  tens of milliseconds, large-project dashboards ≥10× faster.
- **Helicone** is columnar-native from the start: Cloudflare Workers at the
  edge, Kafka buffering, ClickHouse as the event store — 2B+ interactions.
- **Honeycomb** is the doctrine's origin: arbitrarily wide structured
  events on a purpose-built distributed column store; its 2024–2025
  "observability 2.0" framing — one wide event stream, columnar underneath,
  derived signals computed on read — is the position recent platforms
  converged on. ClickHouse's HyperDX acquisition (March 2025) and ClickStack
  packaged the same shape as an open-source default.

Three independent platforms, one shape: the technique's warehouse copy — a
wide flat table, partitioned by time, clustered/ordered by tenant-and-time,
pruned before read — is not the *copy* at this scale. It is the store.

## The inversion boundary

The technique's fork ("row store keeps ingest and governance; warehouse
takes long scans") holds below the measured ceiling and **inverts above
it**: past roughly the volume where row-store ingest IOPS saturate, the
field makes the columnar store the system of record for events and retreats
the row store to config, keys, and governance state. The sink-not-peer rule
survives the inversion with roles intact — enforcement still never reads an
eventually-consistent path, and Langfuse's ingest illustrates why the
columnar primary *is* eventually consistent by construction: events land in
object storage first (also the replay source), queue as references, and
reach the table in worker batches, so spikes become queue depth rather than
database pressure.

## What the field pairs with partitioning

- **Ordering key over composite indexes.** ClickHouse tables sort by
  `(project, time)` with skip indexes on the frequent filter columns — the
  same query-surface derivation as the b-tree composites, expressed in
  columnar physics. The API contract *requires* time filters and uses token
  (keyset) pagination, so the indexing subject's keyset doctrine survives
  the store-class change unmodified.
- **Monthly partitions, not daily.** At billions of rows, day-grain
  partitioning explodes part counts; Langfuse partitions monthly and lets
  ordering-key pruning do the day-level work. Partition grain is a volume
  decision, not a constant.
- **Retention as an active nightly policy, not unbounded cheapness.** The
  field's standard economics: hot SSD tier at full resolution (days to a
  month), warm, then cold object storage at ~$0.023/GB-month versus
  $1.50–3.00/GB ingested at observability SaaS list price; tail sampling
  keeps 100% of error/slow traces while sampling routine successes to 1–5%.
  Langfuse runs retention nightly; deletes (GDPR-shaped) are batched
  background mutations that rewrite parts — the one operation immutable
  columnar tables make genuinely expensive.
- **Payloads leave the row.** Multi-megabyte agent inputs/outputs live in
  object storage with references on the event row — the flat-events
  technique's "one text column each" has a size ceiling in the field.

## Counter-evidence lane, recorded honestly

- *Flat wide row*: **strengthened**, not weakened — the field converged on
  wider and flatter than the technique dares (trace attributes denormalized
  per event row), at the price of immutability.
- *"Derived views stay derived"*: **boundary found** — trace *identity
  attributes* get materialized onto rows at scale; the trace roll-up itself
  stays computed on read.
- *Fixed-width string timestamps*: **untouched** — its own "when not to
  use" already yields to native temporal types on columnar stores, which is
  exactly what the field does there.
- *Keyset pagination and equality-first ordering*: **confirmed** on both
  store classes.

## Sources

- [Langfuse — How Langfuse runs ClickHouse at agent scale](https://langfuse.com/resources/engineering/clickhouse-at-agent-scale)
- [ClickHouse — How Langfuse is scaling LLM observability](https://clickhouse.com/blog/langfuse-llm-analytics)
- [Helicone — The complete guide to LLM observability platforms (2025)](https://www.helicone.ai/blog/the-complete-guide-to-LLM-observability-platforms)
- [Honeycomb — Why observability requires a distributed column store](https://www.honeycomb.io/blog/why-observability-requires-distributed-column-store)
- [Greptime — Observability is converging (2026 survey of the wide-event turn)](https://www.greptime.com/blogs/2026-08-11-observability-three-pillars-history)
- [OneUptime — Tiered storage for OpenTelemetry data](https://oneuptime.com/blog/post/2026-02-06-tiered-storage-opentelemetry-data/view)
