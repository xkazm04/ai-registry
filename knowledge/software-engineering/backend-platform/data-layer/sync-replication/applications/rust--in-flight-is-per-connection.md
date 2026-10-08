---
layer: application
type: application
subject: sync-replication
technique: in-flight-is-per-connection
stack: rust
status: forged
verified_on: 2026-10-08
verified_against: rust@1.96
---

# A per-connection in-flight flag on a durable outbox, in a local-first agent controller

Citations are against the public repository `zeronsh/zeron` at `0c4835d2`
(cloned 2026-10-08), workspace edition 2024, `rust-toolchain.toml` pinned to
`stable` with no floor; the toolchain that read it was `rustc 1.96.1`. The
exemplar is the workspace registry's outbox in `crates/doc/src/registry.rs`,
with the same fix applied to the chat sync actor and measured in
`docs/transport-reliability.md`.

## Decision and forces

The decision: a batch is *pending* until acknowledged (durable) and *in flight*
while written to the current socket (not durable). Forces: a session on a
2 KiB/s, 600 ms link where every edit saw the previous ones unacknowledged and
resent them; the server deduplicated by batch id, so the bug was invisible as a
correctness failure.

- `crates/doc/src/registry.rs:751 "Batches to push: everything not already in flight on this connection."`
  is `take_pushable`, which sends only pending batches whose flag is clear and
  sets it as it hands them out.
- `crates/doc/src/registry.rs:763 "Connection dropped: everything unacked becomes pushable again."`
  is `mark_disconnected`, the single reset site.
- `crates/doc/src/registry/tests.rs:1954 "fn in_flight_batches_are_never_coalesced_and_still_ack"`
  is the property that an in-flight batch is never merged with a later edit.
- `crates/doc/src/registry/tests.rs:2027 "in_flight` is not persisted, so the snapshot reloads all-unsent"` documents that
  the flag is not persisted.

Measured in `docs/transport-reliability.md` (main `67c960f4` against the fix,
three alternating runs each, 20 edits at 100 ms): 30 (range 30 to 61) against 20
(20 to 20) successful push attempts, outbound bytes 12,648 against 8,912,
completion 9.84 s against 7.28 s; all 20 rows delivered with no pending batch in
every run. The predicate is successful push attempts for unique batches over
decrypted HTTP/WebSocket bytes, not physical network bytes, and the document
itself declines to generalise from three runs.

## Rust notes

The flag lives on the plain `PendingBatch` struct inside the registry state
rather than in a channel or a separate set, so the "pending minus in flight"
computation is a single pass over a `Vec` with no second structure to keep in
step; `ack_batch` is `retain` plus a generation bump. The field is declared
`#[serde(default, skip_serializing)]` (`crates/doc/src/registry.rs:416 "skip_serializing"`),
so it is never written to a snapshot and reads back false: the
reload-all-unsent property is structural rather than remembered.

## What it cannot do

It removes redundant resends but does not reduce the size of a first send, does
not protect a batch whose acknowledgement is lost after the server applied it
(that is what the deduplication id is for), and says nothing about ordering
across batches. A 30 percent saving is this workload's, not a fleet-wide figure.
