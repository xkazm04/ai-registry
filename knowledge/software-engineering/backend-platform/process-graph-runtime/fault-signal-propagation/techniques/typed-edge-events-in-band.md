---
layer: technique
type: technique
subject: fault-signal-propagation
technique: typed-edge-events-in-band
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
stage: multi-service
use_when: [a consumer must learn its upstream failed without inventing a timeout, designing the event vocabulary a data channel carries beside payloads, deciding whether supervision facts travel in-band or on a side channel]
---

# Typed edge events, in band

A consumer reading a data edge has exactly one instrument for detecting that its
producer is gone: nothing arrives. That instrument cannot distinguish a dead
producer from a quiet one, and every consumer that builds a timeout on top of it
is reconstructing, badly and privately, a fact the supervisor already holds.
This technique replaces the reconstruction with delivery: the supervisor's
observations enter the consumer's own stream as typed events, interleaved with
data, consumed by the same loop.

## The vocabulary is four events, and it is closed

**Edge closed** — this input will produce nothing further, either because its
producer reached a terminal state or because the edge was removed from the
topology or its declared staleness bound expired unrefreshed. **Edge recovered**
— data is flowing on this input again and a delivery has landed. **Producer
restarted** — the process behind this input exited and a new instance now holds
its outputs. **All inputs closed** — every input of this consumer is closed for
good, which is the graph's only terminal verdict for a consumer.

Four is not a coincidence: they are the four transitions a consumer can act on
differently. Adding a fifth is a design decision, not an implementation detail,
because the enum has one authority and every language binding derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained copies of an event enum in two bindings are not redundancy;
they are the guarantee that a consumer written in the second binding silently
ignores whatever the first one added last quarter.

Each event names the edge or the producer it is about, by an identity stable
across the incident. An event that says only "something upstream happened" hands
the consumer a lookup, and the lookup races the supervisor's next decision.

## Why in-band, and why the ordering is the payload

A supervision fact delivered on a side channel races the data path, and both
outcomes of that race are wrong. If the notification wins, the consumer marks an
edge dead while good messages are still in flight behind it, and either discards
them or processes them after it has already committed to a degraded decision. If
the data wins, the consumer attributes post-restart values to the pre-restart
producer for however long the notification takes to arrive — the fusion bug that
produces a plausible, confidently wrong output.

Delivering the event in the same stream, at its true position in the sequence,
makes the ordering itself carry information: everything before this event came
from before the fault, everything after came from after it. No consumer has to
reason about clock skew between two channels, because there is one channel.

The corollary is a rule about the queue. Whatever admission policy the edge's
data queue runs — a bounded depth, oldest-dropped-first, a backpressure mode —
supervision events are not ordinary payloads under it. **Eviction is a
classification, not a position.** A queue that drops the oldest entry without
looking at what it is will, under exactly the load spike that accompanies an
upstream failure, evict the notification of that failure and keep three stale
frames.

Classification alone is not enough, and the stronger form is worth the extra
mechanism: **reserve headroom for supervision events rather than prioritise them
at eviction.** A fixed slice of the queue's depth is held back, and *ordinary
payloads are refused* once free capacity falls into it. Prioritising at eviction
is too late — by then the queue is full, the event has already been offered and
refused, and the only remaining move is to discard something already accepted.
Refusing data early costs a few frames a saturated consumer was going to fall
behind on anyway. And whichever mechanism is used, an event lost to capacity is
reported, never dropped quietly
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)): a
consumer that never received a close reads exactly like a consumer whose edge is
healthy.

## A late subscriber is replayed the transitions it missed

A consumer can attach after its edges have already changed state — it started
slowly, it was added to a running graph, or it is its own restarted instance
reconnecting. If the event stream only carries transitions as they happen, that
consumer's view is silently wrong from birth: it holds a healthy picture of an
edge that closed while it was away, and no further event is coming, because the
transition already occurred.

So attachment is itself a delivery point. On subscribe, the runtime walks that
consumer's declared inputs, compares them against current edge state, and emits
the events needed to bring the consumer's view to the truth before the first
payload reaches it. A restarted consumer that is not caught up this way will wait
forever on an input nobody will close again — the failure is a hang, and it looks
like a slow upstream.

## Only facts are admitted

An event states what the supervisor observed. The deadline expired without a
refresh; the process exited with this status and was respawned; the producer
reached a terminal state. Nothing the consumer would otherwise have had to
guess enters the vocabulary.

The tempting violation is a synthesised health judgment — "upstream degraded",
"input unreliable" — computed by the supervisor from its own thresholds and
published as though it were an observation. It fails twice. Consumers inherit a
threshold they cannot see, cannot tune per edge, and will not agree with; and
the raw transition they *could* have branched on is buried under an opinion.
The supervisor publishes the transition; the judgment is the consumer's, made
against the criticality it declared for that edge.

## Typed all the way to the branch

The events exist so a consumer can branch, which means they must arrive as typed
values at the outermost layer that acts on them
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). The
common erasure is delivering the events as data — a payload on a reserved topic,
a specially-shaped message the consumer parses — so that a consumer that forgot
to check treats a close as a reading. Events and payloads are different variants
of the same received value, and the consumer's match on that value is
exhaustive: a binding that lets a consumer handle only the data variant and
compile has moved the failure to runtime, on the day of the incident.

## Decision rules

- **When an edge's fate is knowable by the supervisor, publish it; when it is
  only inferable by the consumer, do not.** This is the whole admission test for
  the enum.
- **One event per transition per receiver.** A close emitted per queued message,
  or a restart emitted per output, forces consumers to deduplicate — and they
  deduplicate on time windows, which is wrong on exactly the slow restart the
  window was not sized for.
- **The event's identity is the declared edge or producer identity, never a
  process identity.** Process identities are recycled and change across the
  restart the event is about.
- **A binding that cannot express the enum is unfinished, and says so.** The
  gap is recorded as a known limitation of that binding, not absorbed by
  dropping the event silently on that side.

## When not to use this

Inside a single process, where a call already returns the producer's fate to its
consumer, this is machinery for a fact the type system carries for free.

Where a graph has no degraded modes at all — every input critical, the answer to
every close identical and immediate — the four-event enum is over-engineering
and the terminal verdict alone suffices. That situation is rarer than designers
believe, and it stops being true the first time one input becomes optional, so
the reconsideration trigger is worth writing down: **the second an input becomes
survivable, the enum earns its place.**
