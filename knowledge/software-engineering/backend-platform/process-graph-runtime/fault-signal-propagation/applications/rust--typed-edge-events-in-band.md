---
layer: application
type: application
subject: fault-signal-propagation
technique: typed-edge-events-in-band
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# In-band edge events in the dora dataflow daemon

Citations resolved on 2026-09-02 against the `dora-rs/dora` tree at commit
`bdd1516`, workspace `rust-version = "1.95.0"`, edition 2024 (`Cargo.toml:99-103`).

## The enum and the one channel it rides

`NodeEvent` is the single variant type a node's subscribe channel carries, and
supervision facts are variants of it alongside `Input`. The four propagation
events are `InputClosed { id }`, `InputRecovered { id }`, `NodeRestarted { id }`
and `AllInputsClosed`; `EventStream::convert_event_item`
(`apis/rust/node/src/event_stream/mod.rs:1425-1431`) maps each daemon-side
variant onto the node-facing `Event` one-for-one, so the consumer's `match` in
its receive loop sees payloads and supervision facts in one sequence. There is no
side channel: `docs/fault-tolerance.md:237-262` shows the canonical node loop,
where `Event::Input`, `Event::InputClosed` and `Event::InputRecovered` are arms of
the same match.

Delivery sites in `binaries/daemon/src/lib.rs`, all through the same
`send_with_timestamp` helper:

| Event | Sites |
|---|---|
| `InputClosed` | `:7442-7455` (`close_input`, producer gone), `:7517-7529` (`break_input`, deadline expired), `:5847-5860` (subscribe-time replay) |
| `InputRecovered` | `:7351-7367` (data landed on a broken input), `:7247-7261` (the direct-path notification variant) |
| `AllInputsClosed` | `:7486-7493` (`signal_all_inputs_closed_if_drained`), `:5892-5900` (subscribe time) |
| `NodeRestarted` | `:6706-6712` (non-blocking), `:6751-6768` (guaranteed-delivery fallback) |

## Headroom is reserved, not prioritised at eviction

`binaries/daemon/src/event_types.rs:227-230` sets `NODE_EVENT_CHANNEL_CAPACITY =
1000` and `CONTROL_EVENT_HEADROOM = 50`. `send_with_timestamp` (`:235-268`)
classifies by variant — `let is_control = !matches!(event, NodeEvent::Input {
.. })` — and *refuses the data event* when free capacity has fallen into the
reserved 50: the last 5% of every consumer's queue belongs to supervision and
shutdown, and payloads are dropped to keep it free. `send_output_to_local_
receivers` applies the same test before even constructing the message
(`lib.rs:7289-7298`).

The drop is loud in both directions. A refused data event logs a warning naming
the slow receiver; a control event that is somehow refused *despite* the
reservation logs at error with the literal prefix `CRITICAL: control event
dropped despite headroom reservation` (`event_types.rs:258-261`). Nothing here
drops an edge event into silence.

## Subscribe-time replay

`Daemon::subscribe` (`lib.rs:5833-5860`) walks `dataflow.mappings` for every
`(receiver, input)` pair belonging to the connecting node, filters to inputs
absent from `open_inputs`, and emits an `InputClosed` for each before any payload
flows. `:5892-5900` follows with `AllInputsClosed` if `is_finished_non_source`
already holds. The comment at `:5884-5891` records what the check must read —
`data_inputs` as registered, not `descriptor.nodes[].inputs`, because a runtime
(`operators:`) node keeps its inputs under `operators[].config.inputs` and a
descriptor-derived check calls every operator node a source, skipping the event
and hanging the dataflow (`dora-rs/dora#2920`).

## Where this tree diverges from the technique

**Exhaustiveness is deliberately traded away.** The node-facing `Event` is
`#[non_exhaustive]`, and its doc comment states the intent: "Please ignore unknown
event types instead of throwing an error to avoid breakage when updating"
(`apis/rust/node/src/event_stream/event.rs:8-17`; `StopCause` at `:118-124`
carries the same attribute). So every consumer match carries a `_` arm and a
newly added event variant is
silently ignored by existing consumers rather than failing to compile. The tree
buys wire and source compatibility across four language bindings with it; the
cost is that the technique's compile-time guarantee — a consumer cannot forget to
handle a new supervision fact — does not exist here, and the `InputTracker`
example doc comment says so outright (`input_tracker.rs:33`: "`Event` is
`#[non_exhaustive]`, so match with a `_` arm").

**The enum's authority is single but its bindings are not equal.** The daemon-side
`NodeEvent` is the one definition and the Rust node API derives from it faithfully.
The C binding does not: `enum DoraEventType`
(`apis/c/node/node_api.h:48-54`) carries only `Stop`, `Input`, `InputClosed`,
`Error` and `Unknown`, so a C consumer can see an edge close but receives
`InputRecovered`, `NodeRestarted` and `AllInputsClosed` as
`DoraEventType_Unknown`. Three of the four propagation facts are unreachable from
that binding, and the header does not say so — the gap is real and silent, which
is the case the technique asks to be recorded rather than absorbed.
