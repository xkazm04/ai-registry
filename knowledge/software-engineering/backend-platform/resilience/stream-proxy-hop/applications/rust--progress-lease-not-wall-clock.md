---
layer: application
type: application
subject: stream-proxy-hop
technique: progress-lease-not-wall-clock
stack: rust
status: forged
verified_on: 2026-10-08
verified_against: rust@1.96
---

# A byte-progress lease under a WebSocket pump, in a gpui agent controller

Citations are against the public repository `zeronsh/zeron` at `0c4835d2` (cloned
2026-10-08), workspace version 0.2.107. Toolchain witness: `rust-toolchain.toml`
pins `channel = "stable"` with no floor, so `verified_against` records the
toolchain that read it (`rustc 1.96.1`); the workspace is edition 2024 and the
lockfile resolves `tokio 1.53.1`. The exemplar is `crates/sync/src/socket.rs`
(the pump) and `crates/sync/src/socket/progress.rs` (the activity clock), shared
by the document-sync session and the device-relay session.

## Decision and forces

The decision: liveness is **time since a byte last moved on the underlying
stream**, not time since a message completed and not time since any reply
arrived. The forces are on the transport doc's measured links (2 KiB/s per
direction, 600 ms added delay) where a large message fits the local TCP buffer
and "sent" completes seconds or minutes before the remote has it. A total
duration cap would cut a healthy transfer; a ping/pong check would keep a
stalled write alive.

Where it lives:

- `crates/sync/src/socket/progress.rs:18 "struct Activity"` is the shared
  clock: separate read, write and completed-write millisecond stores plus
  `writing` and `blocked_write` flags, all relaxed atomics.
- `crates/sync/src/socket/progress.rs:99 "Poll I/O before its watchdog when both become ready."`
  is a `biased` select in `while_progressing`: the future is polled before the
  deadline arm so a frame that completes at the deadline instant is not
  discarded.
- `crates/sync/src/socket/progress.rs:77 "Immediately buffered pings/echoes are not peer liveness."`
  is rule 2 of the technique: a completed write only grants reply grace if the
  write actually blocked.
- `crates/sync/src/socket.rs:89 "Each direction owns its await points."` splits
  the writer and reader futures under one `select!`, with `in_tx.closed()` as a
  third arm so dropping the consumer releases both halves.
- `crates/sync/src/socket.rs:109 "Never resume a canceled send on this socket"`
  states rule 4; recovery is the actor's replay by deduplication id.
- `crates/sync/src/socket.rs:21 "Control frames can pass between fragments"`
  and `FRAGMENT_BYTES = 4096` implement rule 5: messages over 16 KiB are sent as
  4 KiB fragments with an empty ping between each.

## Rust idioms worth copying

- **The mutable state is a guard, not a pair of calls.** `Progress::writing()`
  returns `impl Drop`; the guard sets `writing` on creation and, on drop,
  promotes the write clock into `completed_write_ms` only if the write had
  blocked. An early `return` from the writer loop cannot leave `writing = true`.
- **The watchdog is a combinator over any future**, not a feature of the socket:
  `while_progressing(lease, write_only, future)` pins the future, loops on
  `select!`, and re-checks the deadline on wake because progress may have moved
  it while the sleep was pending. The same function bounds the read, the write
  and (with `tokio::time::timeout`) the consumer hand-off.
- **Time is tested with a paused clock.** Each liveness test is
  `#[tokio::test(start_paused = true)]` over an in-memory duplex stream, so the
  45-second lease is asserted in microseconds. The test names are the failure
  list: `unanswered_keepalives_do_not_keep_a_dead_peer_alive`,
  `stalled_write_cannot_disable_silence_deadline`,
  `pongs_do_not_extend_a_stalled_write_forever`,
  `dropping_consumer_cancels_a_stalled_write`, `full_inbound_queue_has_a_deadline`.

## What it cannot do

The lease bounds scheduling opportunity on a healthy transport and says
nothing about completion time under an unavailable server or an arbitrarily
large backlog; the sync doc states this itself. The clock is byte-granular only
as far as the OS reports progress, so a kernel that accepts a whole message
into its buffer and then stalls is seen only through the fragment pings. And the
design needs the socket wrapped in a custom `AsyncRead + AsyncWrite` adapter
(`ProgressIo`), which is a cost a library-owned transport would not allow.
