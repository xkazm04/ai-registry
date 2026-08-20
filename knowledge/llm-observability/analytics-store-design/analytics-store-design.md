---
layer: golden-path
type: golden-path
subject: analytics-store-design
status: forged
use_when: [designing the schema for LLM telemetry, adding a query filter or dashboard panel over events, porting the store to a new backend, deciding where analytical queries should run]
techniques:
  - flat-events-plus-json-linkage
  - fixed-width-timestamp-encoding
  - dashboard-driven-composite-indexes
  - capability-flags-and-refusal
  - backend-parity-as-contract
  - analytical-copy-partitioning
---

# Analytics store design

An LLM observability product stores one privileged fact — the normalized call
event — and then answers questions about it for years, from callers it has
never met, through query shapes it did not anticipate. That last clause is the
whole subject. Builder-side logging (the neighbor bundle's territory) writes
rows it will read back itself: the writer and the reader are the same team,
the queries are known at write time, and a schema quirk is an internal
inconvenience. An operator-side analytics store serves **unknown future
queries by third parties** — dashboards not yet built, rollups not yet
imagined, customers running raw SQL against their own telemetry. "Data-open,
query anything" is a *product claim*, and every schema decision — the shape
of the fact table, the encoding of a timestamp, the set of indexes, what a
backend refuses to answer — is a *product decision* that either honors that
claim or quietly voids it.

Three adjectives govern every choice, and they pull against each other:

- **Fast** — the common dashboard read must be an index seek, not a scan,
  because the store grows monotonically and the dashboard is opened daily.
- **Portable** — the same logical model must survive on an embedded relational
  store, a networked relational store, a document store, and an analytical
  warehouse, because deployments differ and migrations happen.
- **Honest** — a query the current backend cannot answer correctly must say
  so, not return something that merely looks like an answer.

The naive reading optimizes one and silently sacrifices the others: a
warehouse-native schema that no embedded store can serve; a
lowest-common-denominator model that answers everything slowly; a portability
layer that "degrades gracefully" into wrong answers. The principal reading
treats the three as a contract negotiated *explicitly*, per query surface,
with the losses written down.

## One flat fact table, linkage on the side

The center of the store is a single wide, flat events table: one row per
normalized call, with the measures (tokens, cost, latency) and the
high-cardinality dimensions (project, provider, model, operation, status,
use-case name) as first-class typed columns. Everything else — request and
response payloads, freeform tags, app-supplied attribution like customer and
product identifiers — rides in JSON side-channels on the same row.

This is not a compromise awaiting a proper star schema; it is the correct
end-state for this domain. Flatness is what makes the model portable (every
backend can store a wide row), what makes raw SQL tractable for a stranger
(no join topology to learn), and what makes ingest cheap (one insert, no
dimension upserts). The discipline is in the *boundary*: a field earns a
typed column exactly when queries filter, group, or index on it; it stays in
JSON while it is merely carried. Fields migrate across that boundary over the
store's life, and the schema must make that migration additive — see
[flat-events-plus-json-linkage](techniques/flat-events-plus-json-linkage.md).

Derived views stay derived. A trace — the set of events sharing a trace
identifier, rolled into one end-to-end picture — is computed on read from the
fact table, not materialized into a second table that can drift from the
first. A rollup table is a cache with a stated recomputation, never a second
source of truth.

## Two clocks, two columns, two index families

Every event carries two timestamps and they are not interchangeable. The
client stamps *when the call happened* — the analytical clock, the one users
mean when they ask "what did Tuesday cost". The server stamps *when the store
accepted it* — the accounting clock, the one every budget window, admission
decision, and enforcement read must key on, because a client clock is skewed,
buffered, or lied about, and a budget measured on it can be moved by one
wrong laptop. The two clocks are different *columns*, indexed separately,
because they serve different query families — conflating them is the single
most consequential modeling error in the domain. The analytical surfaces
(range filters, dashboards, rollups) read event time; the governance surfaces
read receipt time; and the schema makes the split impossible to blur.

## Encoding is part of the contract

Portability across heterogeneous backends dies in the details, and the
sharpest detail is time. When timestamps are stored as strings — often the
right call, because it gives every backend byte-identical semantics — the
encoding must be **fixed-width**, one canonical form, everywhere, forever:
same precision, same zone designator, no backend-native "convenience"
formats. Lexicographic order on the strings must equal chronological order,
or every range filter, every ORDER BY, and every keyset cursor is subtly
wrong on exactly the rows that cross a width boundary. This invariant is too
load-bearing to live in a convention document; it gets a structural guard
that fails the build when any code path formats a timestamp differently —
see [fixed-width-timestamp-encoding](techniques/fixed-width-timestamp-encoding.md).

## Indexes are product features

An index is not a tuning afterthought; it is the store's promise that a
specific question stays answerable at scale. The index set is therefore
derived from the query surface — each dashboard panel, each list filter, each
governance read names the composite that serves it, and the composite's
column order is chosen so one index serves both the equality seek *and* the
sort that pages the result. An index nobody's query uses is write
amplification; a query no index serves is a scan that grows with the product's
success. Both are found by reading the query surface, not the schema — see
[dashboard-driven-composite-indexes](techniques/dashboard-driven-composite-indexes.md).

## Heterogeneous backends: parity, or refusal

The same store interface fronts backends with wildly different powers: an
embedded relational store that can do everything, a document store that
cannot aggregate server-side, an analytical warehouse that aggregates
brilliantly but should never serve point reads. Two disciplines keep this
honest:

- **Parity is a contract, not an aspiration.** One backend is designated the
  reference; every interface method is either implemented to the reference's
  semantics, or *visibly* unimplemented. The dangerous state is the quiet
  default — the method that compiles, runs, and returns an empty page or an
  unfiltered page, converting a cap or a filter into an advisory comment. See
  [backend-parity-as-contract](techniques/backend-parity-as-contract.md).
- **Refusal is a first-class answer.** A backend that has not ported a filter
  answers "unsupported", naming the filter, with a protocol-level error code
  — never an unfiltered page presented as honored, never an empty page that
  reads as "you have no data". Capability flags let callers and operators
  discover the gap before they hit it. See
  [capability-flags-and-refusal](techniques/capability-flags-and-refusal.md).

The tension between these — strict refusal versus an additive interface where
new methods default to empty so old backends keep compiling — is real and
must be resolved per method by blast radius: a default that under-reports an
*analytical* breakdown may be a documented handoff; a default that
under-reports an *enforcement* read is a security hole and gets refusal.

## The analytical copy

The transactional store that admits events is not where heavy analysis
belongs. Past a modest scale, the store forks: the row store keeps ingest,
governance, and recent reads; an append-only copy in an analytical warehouse
takes the long-horizon scans. The copy is partitioned by event date and
clustered by the dominant filter dimensions, so a time-ranged query prices by
the days it touches instead of the table's lifetime — which is what makes
"query years of telemetry" affordable at all. The copy is a *sink*, not a
peer: it receives, it never enforces, and the schema mirrors the fact table
so a query written against one runs against the other — see
[analytical-copy-partitioning](techniques/analytical-copy-partitioning.md).

## Failure modes of the naive reading

- **The premature star schema.** Dimension tables and surrogate keys before
  any query needed a join — portability lost, ingest complicated, and the
  third-party SQL user now needs a schema diagram to count tokens.
- **The native-type trap.** Each backend storing time in its own native type,
  each with different precision and zone behavior; range queries agree until
  the first cross-backend migration, then history silently reorders.
- **The advisory filter.** A backend that ignores a predicate it never ported
  and returns the unfiltered page; the caller renders it under the filter's
  label, and every conclusion drawn from that screen is wrong.
- **The empty lie.** An unimplemented aggregate returning zero rows — read
  downstream as "nothing was spent", the exact substitution the domain's laws
  exist to forbid.
- **The one-store-does-everything warehouse.** Serving admission checks from
  the analytical copy (stale, eventually consistent) or serving year-scans
  from the row store (a scan per dashboard open). Each store does the work
  its physics favor.
- **The unindexed success.** A query surface designed on a ten-thousand-row
  dev database, shipped, and rediscovered as a full scan the month a real
  customer's volume arrives.

## The techniques

- [flat-events-plus-json-linkage](techniques/flat-events-plus-json-linkage.md)
  — the wide fact row, the column-versus-JSON boundary, and additive
  promotion across it.
- [fixed-width-timestamp-encoding](techniques/fixed-width-timestamp-encoding.md)
  — one canonical string form for time, and the structural guard that keeps
  every copy of the formatter honest.
- [dashboard-driven-composite-indexes](techniques/dashboard-driven-composite-indexes.md)
  — deriving the index set from the query surface; filtered column before
  sort column so one index serves seek and order.
- [capability-flags-and-refusal](techniques/capability-flags-and-refusal.md)
  — declaring what a backend serves, refusing what it does not, and testing
  the refusal so it cannot decay.
- [backend-parity-as-contract](techniques/backend-parity-as-contract.md) —
  the reference backend, the parity matrix, and choosing refusal versus
  documented degradation by blast radius.
- [analytical-copy-partitioning](techniques/analytical-copy-partitioning.md)
  — the append-only warehouse copy, date partitioning, clustering by filter
  dimensions, and the sink-not-peer rule.
