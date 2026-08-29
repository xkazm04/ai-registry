---
layer: application
type: application
subject: module-design
technique: io-free-core
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1
---

# Rust — a transport protocol as an I/O-free core with an async driver

The clearest production realization of
[io-free-core](../techniques/io-free-core.md) available to read is the Quinn
QUIC implementation (github.com/quinn-rs/quinn), which splits into exactly
the two parts the technique names: `quinn-proto`, the core, and `quinn`, the
driver. Citations are against the public tree at commit `d5d5b978c2b8`
(`quinn-proto` 0.12.0), read for this document on the `verified_on` date.

## The core states the form as its own contract

`quinn-proto/src/lib.rs:3-5` opens with the claim: *"quinn-proto contains a
fully deterministic implementation of QUIC protocol logic. It contains no
networking code and does not get any relevant timestamps from the operating
system."* The repository README names the consequence the technique
predicts: the core is "suitable for use with custom event loops (and
potentially a C or C++ API)."

The `Connection` type's public surface is the four-property shape, method
for method (`quinn-proto/src/connection/mod.rs`):

- **Inputs are values:** `handle_event` (`:1099`) takes an event and, per
  its doc, prepares "signals … that should be extracted through the
  relevant methods" — it does nothing itself.
- **Outputs are values:** `poll_transmit(now, max_datagrams, buf)` (`:454`)
  hands back datagrams for the caller to send; `poll` (`:390`) hands back
  application-facing events; `poll_endpoint_events` (`:408`) hands back
  events for the sibling state machine.
- **Time is a parameter:** `handle_timeout(now: Instant)` (`:1171`) and
  `close(now, …)` (`:1249`) receive the instant; `poll_timeout` (`:380`)
  returns the next deadline and its doc enumerates exactly which calls can
  change it — the next-deadline contract the technique's driver loop hangs
  on.
- **Nondeterminism is injected:** the connection owns an `rng: StdRng`
  field seeded at construction (`:137`) rather than reaching for an
  ambient source.

## The driver is where the runtime lives — all of it

`quinn/src/connection.rs` holds the loop. `drive_transmit`
(`:1105-1125`) asks the runtime for `now`, calls `inner.poll_transmit`, and
performs the actual sends; `drive_timer` (`:1262-1303`) turns
`poll_timeout` into a real timer and feeds expiry back through
`handle_timeout`. The runtime itself is behind a trait —
`quinn/src/runtime/mod.rs:18-32`, `trait Runtime { new_timer, spawn,
wrap_udp_socket, now }` — with one adapter per executor
(`runtime/tokio.rs`, `runtime/smol.rs`), so the driver is itself built on a
conventional seam while the core needs none. The `now()` method's doc says
why it exists: *"Allows simulating the flow of time for testing."*

Two details show the driver absorbing exactly the pain the technique
assigns it. The comment at `connection.rs:1268-1270` records a busy-loop
class bug fixed in the glue — the async timer "can return Pending for
elapsed deadlines," so the driver checks the clock first — the technique's
"the bug is in the loop and the core is provably fine," observed in the
wild. And `buffered_transmit` retry handling (`:1115-1117`) is
transmission-level statefulness that belongs to I/O, kept out of the core.

## Tests with no doubles

`quinn-proto/src/tests/util.rs:28-34` defines `Pair`: two real state
machines, a simulated network as an in-memory queue of
`(Instant, …, BytesMut)` (`:296`), and a `time: Instant` field that the
test advances by assignment. `drive` / `drive_client` / `drive_server`
(`:116-163`) are miniature drivers — the same loop the production driver
runs, pointed at queues instead of sockets. Nothing is mocked: no socket
double, no clock double, no executor. Packet loss, reordering and
timeout-dependent behaviour are tested deterministically because time and
delivery are both plain values.

## The costs, also visible

The form's price is in the same tree. The driver crate is large and
subtle — the timer-budget workaround above is glue complexity that a
socket-in-the-module design would not have as a separate category. And the
core's `handle_timeout`/`poll_timeout` contract must be documented with
unusual care (`connection/mod.rs:380-387` lists the four situations after
which the deadline may change) precisely because every consumer writes a
loop against it. The technique's claim is not that this is free; it is that
the price is paid once, at the edge, in exchange for a core that runs under
two executors today and a foreign binding tomorrow without change.
