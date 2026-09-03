---
layer: application
type: application
subject: data-plane-transport-selection
technique: control-plane-off-the-data-path
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Keeping the dora daemon off the data path

In [dora](https://github.com/dora-rs/dora), `dora-daemon` is the per-machine
supervisor: it spawns nodes, holds the routing tables, enforces restart and
timeout policy, and reports to the coordinator. Since the Zenoh shared-memory
data plane landed it is deliberately **not** a data-path component —
`docs/architecture.md:268-278` ("Node to Node (Zenoh SHM Data Plane)") states
it plainly: "The daemon receives only lifecycle notifications (no data copies
through daemon)." Citations are from commit `bdd1516`, workspace
`rust-version = "1.95.0"`.

## One serial loop, and what it may not do

`binaries/daemon/src/lib.rs` runs a single merged event stream — external
events, internal `dora_events`, the watchdog, the metrics tick and the health
check, merged at `:2163-2170` — and processes them serially. That design is
what makes routing-table mutation lock-free, and it is also what makes any
`await` on the loop a system-wide risk.

**The publish offload.** `ZENOH_PUBLISH_CHANNEL_CAPACITY = 256` (`:206-208`,
commented "Large enough for burst patterns; messages are dropped with a warning
when full"). A `tokio::spawn`ed drain task (`:2035-2056`) owns the actual
`publisher.put(...).await` and the `net_bytes_sent` / `net_messages_sent` /
`net_publish_failures` counters; the loop's side is a `try_send` whose `Full`
arm warns `"zenoh publish channel full (256), dropping inter-daemon message"`
and whose `Closed` arm logs at `error!` that the drain task is gone
(`:5696-5707`). Two distinguishable failures, neither of them a block.

**No inline metrics.** `spawn_metrics_collection` (`:4135-4137`) snapshots the
running dataflows and hands collection to a background task, "so it never
blocks the event loop"; `docs/performance.md:7-15` lists this in the
architecture comparison table as a property — `Metrics | Fire-and-forget
(spawned task) | Inline` — against the middleware it benchmarks itself against.

**The handler ceiling.** At the bottom of every loop iteration (`:2497-2504`):
if `start.elapsed()` exceeds 100 ms it logs `"Daemon took {}ms for handling
event: {event_kind}"`. The comment is the rule in one line: "the main loop
should never be blocked for too long."

## The deadlock that forced the offload

`lib.rs:6716-6734` is the incident, preserved as a comment on the fix. When a
node restarts, every downstream receiver must be told (`NodeEvent::NodeRestarted`)
because service and action clients park on correlations that died with the old
process (`dora-rs/adora#148`). The normal send is a `try_send` into the
receiver's channel, which reserves control headroom for exactly this class. If
that still returns `Ok(false)` — full even with the headroom — the event is too
important to drop, and the tempting fix is to await a backpressure-aware send.
The comment explains why that fix hangs the daemon:

> Awaiting here suspends the single serial event loop until the receiver drains
> a slot. If that receiver's Listener is itself parked on
> `daemon_tx.send().await` (the daemon event channel at capacity), it never
> returns to drain its subscribe channel, so the two block each other forever
> and the whole daemon hangs (dora-rs/dora#3066).

The shipped answer is the classification the technique names: warn, clone the
channel handle and the receiver's pending counter, and offload the awaiting
send to a detached task, "so the main loop keeps draining `dora_events_rx`".
Guaranteed delivery is preserved; the loop never waits for it.
`docs/plan-event-loop-separation.md` is the design record that rejects the
single-loop-awaits-publish arrangement wholesale.

## Where the tree is thinner than the standard

The 100 ms ceiling logs but does not count: there is no metric for handler
outliers, so the smoke detector is a `warn!` line rather than a rate an
operator can alert on. The drain channel's drops are likewise logged and not
counted, so the "high-water mark and drop count" signal the technique asks for
does not exist. And the control plane's own liveness is reported through the
same coordinator report path as everything else rather than as a heartbeat
independent of message traffic — which is the one signal that would separate
"loop stalled, data still flowing" from a healthy run.
