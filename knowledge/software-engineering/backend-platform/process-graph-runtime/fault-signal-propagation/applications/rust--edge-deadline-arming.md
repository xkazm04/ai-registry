---
layer: application
type: application
subject: fault-signal-propagation
technique: edge-deadline-arming
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Input deadlines in the dora dataflow daemon

Citations resolved on 2026-09-02 against the `dora-rs/dora` tree at commit
`bdd1516`, workspace `rust-version = "1.95.0"`, edition 2024.

## The record, and `None` as the unarmed state

An `input_timeout` is declared per input in the descriptor, not per node
(`docs/fault-tolerance.md:183-195`). The daemon holds one record per edge in
`RunningDataflow.input_deadlines`, keyed by `(NodeId, DataId)`:

```
struct InputDeadline {
    timeout: Duration,
    last_received: Option<Instant>,   // None = unarmed
}
```

`last_received` starts as `None` at dataflow start, and `check_input_timeouts`
considers **armed entries only** — `Some(_)` — so an input that is idle at
startup cannot trip (`docs/fault-tolerance.md:199-222`, attributed to
`dora-rs/adora#149`). Every arriving message sets `last_received = Some(now)`,
which both arms a previously-unarmed deadline and refreshes an armed one
(`lib.rs:7316-7322`). Detection rides the existing 5-second health-check
interval rather than a per-edge timer.

Recovery arms immediately rather than reopening unarmed: the re-created
`InputDeadline` at `lib.rs:7343-7350` carries `last_received:
Some(Instant::now())` with the comment "A message just arrived — arm
immediately", because the recovery is *caused by* a landed payload.

## A declared deadline demotes the transport

This is the tree's sharpest expression of the technique's headline rule, and it
is a routing decision made before any data flows.
`binaries/daemon/src/output_routing.rs:113-131` decides whether a remote static
consumer's output may take the direct node-to-node path or is pinned
(`entry.daemon_only = true`) to the brokered one. A consumer that declares an
`input_timeout` is pinned, and the in-code reasoning is exact:

> its deadline is armed unfired and refreshed only when its *own* daemon sees the
> message — either delivering it (`send_output_to_local_receivers`) or being told
> about it by a local producer (`note_output_sent_to_local_receivers`, which walks
> local mappings only). A direct cross-machine send reaches neither, so
> `last_received` would stay `None`, the deadline would never fire, and
> `input_timeout` — plus the circuit breaker built on it — would silently stop
> working on exactly the edges most likely to need it. The fast path is not worth
> a liveness guarantee the descriptor asked for.

The direction is the one the technique requires: the declaration stands, the
optimisation is withdrawn. The measured cost of the demotion is real — the tree's
own comparison table records the direct path at 35% lower latency (payloads ≥ 64
bytes) and 3-10x better throughput (≥ 2 KB) than the brokered one
(`docs/plan-zenoh-shared-memory.md:38-39`) — and it is paid anyway on every edge
that declared a deadline.

## A send notification is not an arrival

The other refresh path is `note_output_sent_to_local_receivers`, driven by a
producer's `OutputSent` notification when the payload itself went directly. The
daemon explicitly refuses to treat that as delivery
(`lib.rs:7158-7194`): the node-side callback drops the input with `try_send` when
its event channel is full, and treating `OutputSent` as delivery made
`input_timeout` deadlines never fire for a slow consumer (`dora-rs/dora#2021`).

The guard is a backpressure proxy read from the *receiver's* side —
`channel.capacity() >= CONTROL_EVENT_HEADROOM` (`lib.rs:7178-7194`) — and a
receiver with no subscribe channel at all counts as **not** keeping up rather
than as missing evidence. Circuit-breaker recovery is gated on the same signal
(`lib.rs:7196-7199`), and the paired test
`output_sent_does_not_recover_broken_input_when_receiver_saturated`
(`lib.rs:9392-9395`, capacity 1 against a headroom of 50) pins it.

## Closing an input drops its deadline

`close_input` removes the `input_deadlines` entry before anything else
(`lib.rs:7425-7430`). The comment records why: a surviving deadline fires later,
`check_input_timeouts` inserts a `broken_inputs` record, `break_input` then
no-ops because the input has already left `open_inputs`, and the orphaned record
pins `has_broken_input` true forever — so the drained node is never sent
`AllInputsClosed` and is eventually killed as a straggler (`dora-rs/dora#2968`).
`break_input` rolls its own record back in the same situation
(`lib.rs:7504-7516`). Two tests hold the line:
`close_input_drops_armed_deadline` (`lib.rs:9258-9289`) and
`drained_node_finishes_despite_stale_deadline_timeout` (`lib.rs:9293-9299`).

## The on-demand exclusion is documented, not enforced

`docs/fault-tolerance.md:197` carries an explicit warning that `input_timeout`
assumes a continuously publishing upstream and must not be set on service-response
or action-result inputs, because natural idle periods are indistinguishable from a
dead upstream; per-request waits use `recv_service_response` /
`recv_action_result` instead. The rule matches the technique exactly. It is
prose only — nothing in descriptor validation rejects an `input_timeout` on an
input whose source is a reply topic, so the guard depends on the author reading
the page.
