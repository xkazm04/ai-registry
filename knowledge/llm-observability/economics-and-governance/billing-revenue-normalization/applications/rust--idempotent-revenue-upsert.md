---
layer: application
type: application
subject: billing-revenue-normalization
technique: idempotent-revenue-upsert
stack: rust
verified_on: 2026-10-14
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# Idempotent revenue upsert in LightTrack's webhook receiver (Rust)

The storage half of the technique was already in place and held. The `revenue_events` upsert is
keyed on the deterministic id in both the SQLite and Postgres backends, writes every business field
in the conflict arm, and guards the money columns so a redelivery against a newer FX table cannot
restate history. The SQLite batch is one transaction (`crates/store/src/sqlite/revenue.rs`,
`insert_batch`), and the handler returns failure on a rolled-back batch.

## The seam, chosen to falsify the acknowledgement rule

The technique says to acknowledge only what is durably persisted. The receiver
(`crates/api/src/billing.rs`) also keeps an in-process seen-set keyed on the provider's delivery id,
and it marked the id before the batch ran. A provider retry that arrived while the first attempt was
still persisting hit the seen-set and got `200`. If the first attempt then rolled back, the mark was
forgotten but the provider had already been told the delivery was done and would never resend it.
The durable upsert cannot repair that, because nothing replays the delivery.

## A and B

- **A:** `check_and_insert` returned a bare "seen before" for a key in either state, so an in-flight
  duplicate was acknowledged.
- **B:** a key is claimed in flight and committed only after the batch commits. A duplicate during
  the window is refused with `409` so the provider keeps retrying, a committed id short-circuits as
  before, and a claim dropped uncommitted (store error, client disconnect, panic) forgets the key.

Target: acknowledged-but-unpersisted deliveries in the in-flight window, A one, B zero (three new
unit tests on the seen-set; the in-flight case cannot be expressed on A). Floor: the `lighttrack-api`
suite (475 tests), clippy with warnings denied and the existing dedup semantics for a committed
delivery are unchanged.

## Not fixed

The batch default in the trait is a loop, and neither the Postgres nor the Firestore backend
overrides it, so on those backends a mid-batch failure commits a prefix. The handler comment calls
the batch atomic, which is only true for SQLite. The replay repairs it, but a report that runs in
the gap sees half a delivery. Closing it needs a Postgres transaction and a store test against a
live database, which this run could not exercise.
