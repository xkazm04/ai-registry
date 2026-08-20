---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: unpriced-span-accounting
stack: rust
status: forged
verified_on: 2026-08-20
---

# Rust: counting the spans the cost sum could not measure (LightTrack)

LightTrack's trace totals carry the unmeasured-row count as a first-class
field. `TraceTotals` in `crates/core/src/trace.rs:179-200` sums `cost_usd`
across spans and, beside it, `unpriced_spans` — with the rationale in the
field doc (trace.rs:194-199): "The ingest path keeps unpriced cost as `None`
rather than a phantom $0.00; a rollup that sums a nullable measure must
likewise carry HOW MANY rows it could not measure, so `cost_usd` is not read
as a confident total when it is a lower bound."

## The fold

`totals_of` (trace.rs:365-384) is the single pass: for each event,

```rust
if e.cost_usd.is_none() {
    t.unpriced_spans += 1;
}
t.cost_usd += e.cost_usd.unwrap_or(0.0);
```

The `unwrap_or(0.0)` is safe *only because* the count is incremented in the
same branch structure — the zero enters the sum, the null enters the count,
and the payload discloses both. The test
`totals_carry_the_unpriced_span_count_beside_the_cost_sum`
(trace.rs:884-901) pins the pair: three spans, two unpriced, asserts
`unpriced_spans == 2` and that the sum covers only the priced span, with the
comment "the $ figure is understood as a lower bound."

## Null is held from ingest

The nullability originates upstream, not in the rollup. The ingest path
(`crates/api/src/events.rs:60-65`) records whether the client supplied a
cost, then calls `ev.ensure_cost(&book)` against the price book and marks
the cost's provenance (`mark_cost_source`); a model absent from the book
leaves `cost_usd` as `None`. Nothing between ingest and rollup coerces the
null — which is what makes `unpriced_spans` in the totals a true count of
unmeasured rows rather than an approximation reconstructed after the fact.

## Contrast: measures where zero is a safe default

The same fold deliberately does *not* apply the machinery to latency:
`t.total_latency_ms += e.latency_ms.unwrap_or(0)` (trace.rs:377) with no
companion count, and the test `missing_latency_is_treated_as_zero`
(trace.rs:712-724) confirms the choice. A missing latency degrades a
duration conservatively; a missing price fabricates money. The codebase
draws the technique's own boundary: the null-plus-count discipline is
reserved for measures where absence and zero mean different things to the
reader.

## Note on serde defaults

`unpriced_spans` is `#[serde(default)]` (trace.rs:198), so rollups
serialized before the field existed deserialize as zero. That is the one
place the pattern is lossy — an old payload cannot distinguish "fully
priced" from "predates disclosure" — and it is confined to replayed
historical payloads; anything re-derived from events (the normal path, since
traces are computed on read) reports the true count.
