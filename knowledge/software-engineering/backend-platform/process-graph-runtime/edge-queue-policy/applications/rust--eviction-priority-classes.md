---
layer: application
type: application
subject: edge-queue-policy
technique: eviction-priority-classes
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# The eviction ladder in a node-side input scheduler

dora's node API (`apis/rust/node/src/event_stream/scheduler.rs`, commit
`bdd1516`) implements eviction as a three-way classification rather than as a
position, and the enum that names the outcomes is the clearest statement of the
technique available in a real tree:

```rust
enum Eviction {
    RemoveAt(usize),            // sacrifice the oldest ordinary event
    DropIncoming,               // queue is all correlated/Stop, arrival is ordinary
    DropCorrelatedLoud(usize),  // both must be preserved: drop oldest correlation, loudly
}
```

`select_eviction` (`scheduler.rs:83-107`) walks exactly the ladder order the
technique states: sacrifice the oldest non-correlated, non-`Stop` event; if
none exists and the *incoming* event is ordinary, drop the arrival rather than
break a correlation; only then drop the oldest correlated event, never the
`Stop`. `log_correlation_drop` (`scheduler.rs:109-129`) emits that last case at
error level with `request_id`, `goal_id` and `goal_status` attached, plus the
remedy ("increase `queue_size` or switch this input to
`queue_policy: backpressure`") — a loud drop that names the exchange it broke.

## The class predicate has one home

`is_correlated` (`scheduler.rs:35-50`) does not carry its own key list; it
delegates to `carries_pattern_correlation` in `dora_message::metadata`, and the
comment says why: "Duplicating the key list here risked silently dropping
service/action messages if a new correlation key were added to only one copy."
One level up, `event_parameters` (`scheduler.rs:18-33`) is "the single place
that decides which `EventItem` variants carry parameters, so the eviction guard
(`is_correlated`) and its diagnostics (`log_correlation_drop`) can never
disagree on that classification." `is_stop` (`scheduler.rs:52-67`) is immune by
construction and argues its own boundedness: at most one `Stop` is ever in
flight, so immunity cannot let the queue grow.

Both incidents behind this are cited in place — `dora-rs/adora#145` for
drop-oldest silently dropping correlated messages, `#146` for flush wiping
them.

## Flush reads the same ladder

`Scheduler::add_event` (`scheduler.rs:266-295`) retains
`is_correlated(e) || is_stop(e)` across a flush, so interruption discards the
ordinary class only. `docs/patterns.md:246` still states the superseded rule —
"flush discards *all* queued messages on the input regardless of session" —
which is a documentation/code deviation, and the code is the stricter of the
two. The `Stop` guard on the flush path is deliberately redundant with the
queue partition (`scheduler.rs:274-278`): `Stop` lives under the reserved
`dora.non_input_event` id, but `validate_data_id` permits an input literally
named that, so the path guards rather than relies on the validator.

## The tombstone leak, and its fix on the drop path

`binaries/runtime-api/src/channel.rs:109-165` evicts by nulling slots
(`*event = None`) so the surrounding deque order is preserved, and
`compact()` (`channel.rs:167-178`) is called from the drop path, not the read
path. The comment records the exact failure the technique warns about: without
compaction "a stalled operator (slow `on_event`) makes the deque grow by one
`Option::None` slot per received input forever — the number of live `Some`
events stays capped, but the tombstones are only ever cleared by `pop_front` in
`send_next_queued`, which never runs while the outgoing send is pending. That
defeats the bounded-memory guarantee of the drop-oldest policy and leaks until
OOM."

## The ladder is tested where the features intersect

The suite constructs full-and-mixed queues rather than testing depth and
classes separately: `scheduler.rs:612` (ordinary sacrificed while a correlated
event is at the front), `:634` (a middle ordinary event dropped to save the
front correlation), `:659` (incoming ordinary dropped into a fully correlated
queue), `:679` (correlated dropped loudly when both sides must be preserved),
`:731` and `:752` (`Stop` survives, and is admitted into, a full queue),
`:773` (flush retains `Stop`), `:518` and `:544` (flush retains `request_id`
and `goal_id` events).

The cross-transport obligation is met by pairing: `:838` and `:858` re-run the
correlated-preservation cases with `EventItem::ZenohInput`, the direct
data-plane variant, so the brokered and direct routes are asserted against one
policy. The pairing is visible in the test names, which is what lets a reviewer
notice a missing half.

## Deviation

The drop counter is `drain_drop_counts` (`scheduler.rs:239-242`, exposed on the
public event stream at `event_stream/mod.rs:990-1002`) — read-and-reset, keyed
by input id, and not split by eviction class. A consumer that polls it twice
gets disjoint windows, a second reader gets zeros, and an ordinary eviction is
indistinguishable in the count from a flush or a correlated drop. The technique
asks for monotonic counters per cause; here the cause survives only in the log
line.
