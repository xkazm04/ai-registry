---
layer: application
type: application
subject: data-plane-transport-selection
technique: route-probe-then-freeze
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Route probe then freeze, in the dora node runtime

[dora](https://github.com/dora-rs/dora) is a dataflow middleware for robotics:
a YAML descriptor declares nodes and typed edges, a per-machine `dora-daemon`
spawns and supervises them, and since the Zenoh shared-memory data plane
landed, payloads at or above a threshold travel node-to-node without touching
the daemon. Everything below is from commit `bdd1516`, workspace
`rust-version = "1.95.0"` (`Cargo.toml:103`).

## The handshake

`apis/rust/node/src/node/mod.rs` implements the producer half. A node declares
one Zenoh publisher per output that may ever go direct, wrapped in a
`DirectOutput` (`:188-196`) whose only other field is
`ready: Arc<AtomicBool>` — documented as "settled by `wait_for_grace` before
`init` returns and immutable from then on, so every send of a given output
takes the same path".

Probing is a marker thread (`StartupHandshake`, `:477`) publishing on each
output every `ZENOH_STARTUP_MARKER_INTERVAL = 5ms` (`:158`) and stopping per
output as soon as that output's acks arrive. `AckState` (`:288-303`) holds the
`required` set — "the daemon's required-acker set, derived from actual
placement" — the `received` set, the shared `ready` flag, and a `frozen` flag.

The consumer half is `spawn_startup_acker` in
`apis/rust/node/src/event_stream/mod.rs:129-176`. Its doc comment is the
reentrancy rule stated in the technique: the data callback only
`try_send`s the input id into a bounded channel, because "a zenoh callback
must never `put` itself — it runs on zenoh's IO worker" (`:132-134`); a
separate thread publishes the ack. The same comment states the cost: "a
dropped ack (the bounded-queue `try_send` fallback below) costs that output
direct zenoh for the producer's whole run" (`:145-146`). The acker answers
markers for the stream's whole lifetime, so restarted or dynamically added
producers can still hand-shake.

## The window is measured from the barrier

`ZENOH_STARTUP_GRACE = 500ms` (`mod.rs:182`), and its doc comment
(`:158-182`) is the clearest statement of the rule anywhere in the tree:

> The window starts at the barrier, not at spawn: by then every static
> consumer has declared its subscribers and ack publishers, so a consumer that
> is merely slow to *start* (a Python node importing heavy libraries for a
> minute) cannot burn it. The healthy case completes in one marker→ack
> round-trip (single-digit milliseconds); half a second of 5 ms markers with no
> ack means the route is broken, not slow.

It also names the structural asymmetry this subject's technique warns about:
for a dynamic or restarted producer the barrier releases immediately, so its
window instead starts a few milliseconds after the session opens, "while the
peer links it needs may still be dialing. Such a producer is therefore the
most likely to end up frozen on the daemon path; if that shows up as a
measurable regression, this constant (**not a late upgrade**) is the thing to
raise."

## The freeze, and the race it closes

`wait_for_grace` (`:631-660`) polls every 2 ms (`ZENOH_STARTUP_GRACE_POLL_INTERVAL`,
`:185`) until every state is ready or the deadline passes, then calls
`AckState::freeze` (`:365-372`) on each. `freeze` takes the `received` lock and
re-checks `ready` first, so a late ack "either completes the handshake or is
ignored — never a half-applied upgrade". A freeze that fires logs at `warn!`
with the output id and `missing()` — the un-acked `node/input` identities —
which is the demotion record the technique asks for. The stated rationale is
the same as the golden path's: "Freezing keeps a topic's per-input FIFO order
unconditional; the cost is the fast path for routes that fail to establish
within `grace`."

`send_output_sample` (`mod.rs:1788-1846`) then reads only
`output_direct_ready` (`:1935`) and the payload size — never a live route
check. Its comment enumerates the four ways an output ends up on the daemon
path: no session (interactive/testing mode), a daemon-side pin, a consumer
behind inter-daemon forwarding (issue #2738), or a frozen handshake.

## Pinning what cannot be proven

`binaries/daemon/src/output_routing.rs:60-137` is the central computation the
technique argues for: `compute_output_routing` takes the resolved nodes, the
local set and the `routable_producers` set and returns, per output, a
`required_ackers` set plus a `daemon_only` flag. Its rules match the
technique's exclusions exactly — a dynamic consumer "is never an acker —
nothing may wait on a node that may never join" (`:98-104`), and a remote
static consumer whose producer has no dialable endpoint is pinned because
"there is no direct route to prove, so pinning beats spending a startup window
waiting for an ack that cannot arrive" (`:113-118`). Tests
`a_remote_static_consumer_pins_when_its_producer_is_undialable` (`:316`) and
`added_node_without_receivers_is_pinned_to_the_daemon_path` (`:435`) hold both
rules. `docs/distributed-deployment.md:296-317` documents the same list for
operators, including the 1.5 s endpoint-exchange timeout and the fact that
setting it to `0` keeps every cross-machine edge on the daemon path.

## What the tree does not do

No per-edge route is exposed as queryable state for the life of the run: the
verdict exists as an `AtomicBool` inside the producer and as a `warn!` line at
the moment of freeze, so an operator answering "which path is this edge on"
reads logs rather than a status surface. The demotions are also not counted by
cause — the technique's second and third operator obligations are unmet, and
the freeze warning is the whole instrument.
