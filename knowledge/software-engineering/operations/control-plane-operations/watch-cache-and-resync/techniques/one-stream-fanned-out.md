---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: one-stream-fanned-out
status: forged
laws: [creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [several components in one process want the same slice, deciding whether a slow consumer should be shed or should slow the source, two views of one replica disagree after a resynchronisation]
---

# One stream, fanned out

When several components in one process need the same slice, the default is that
each opens its own stream and keeps its own replica. That default costs three
things, and only the first is obvious. N connections at the source, which the
source's operator will eventually notice. N copies of every object, which for a
large slice is the process's dominant memory cost. And — the one that produces
bugs rather than bills — **N independent desync clocks**: each replica
resynchronises at its own moment, so two components asked the same question a
millisecond apart get answers from different snapshots, and neither can tell.

One stream, one replica, one in-process fan-out removes all three.

## What is reused, and what is new

The mechanics of a single boundary subscription serving many in-process
consumers are already a solved shape: create the boundary listener lazily on
the first consumer, hold a subscriber set the boundary callback dispatches to,
snapshot the set before iterating and invoke outside the registry's own lock,
guard the attach/detach race with a per-attempt cancelled flag, and reap the
boundary listener when the last consumer leaves — all of it is [subscription
lifecycle](../../../../client-architecture/realtime-events/techniques/subscription-lifecycle.md),
and none of it is restated here. Every rule in that technique applies unchanged,
including the reaping obligation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

Two things are different here because the thing being shared is a *replica*
rather than a *bus*, and they are what this technique owns.

## Send identities, not payloads

The channel carries a reference to an entry — its key — and the consumer reads
the current value out of the shared replica. It does not carry the object.

This inverts a property people expect. On an event bus the payload is the
message, so a consumer processes what was true at emit time. Here the consumer
processes what is true at *read* time, which means a consumer running behind by
several notifications reads the latest value and skips the intermediate ones
for free. That is the correct behaviour for a convergence consumer, whose unit
of work is "make this identity right" rather than "handle this change", and it
is the reason a slow consumer here degrades into doing less work rather than
into a backlog of stale payloads. It also means the channel's memory cost is
the size of a key times the buffer, independent of object size.

The consequence to design for is that **the entry may be absent by the time the
consumer reads it** — deleted between notification and read. Define the answer
and write it down: either the consumer treats absence as a deletion to act on,
or the notification is dropped. Both are defensible. What is not defensible is
parking the consumer until something else wakes it, which is the shape a
lookup-miss accidentally takes when the miss returns "not ready yet" into an
asynchronous read: the consumer stalls until the *next* unrelated notification
arrives, and the stall is invisible because the channel looks healthy.

## Backpressure, not shedding

The event subject's shedding doctrine — a bounded channel that drops, and
counts what it dropped — is correct there and wrong here, and the difference is
worth being explicit about because the two techniques otherwise read alike.

On a bus, push is an optimisation over refetch: a dropped event costs staleness
that the next read repairs. In a replica, the stream **is** the read path;
there is no independent refetch to repair a drop, so an event dropped between
the reader and its consumers is a change that consumer will never learn about.
So the channel is bounded and, when full, **applies backpressure upward** — the
sender waits, the stream stops being consumed, and the position stops
advancing. That is a deliberate coupling: a slow consumer slows the source
reader, and if it stays slow long enough the position ages out of the window
and the whole replica resynchronises. That is the correct outcome and the
reason the resynchronisation count is worth a metric — it is the alarm for a
consumer that cannot keep up, arriving as a bounded, self-repairing event
rather than as silent divergence.

Two corollaries. The buffer releases an entry only when **every** subscriber
has taken it, so the slowest consumer sets the pace for all of them; sizing the
buffer is therefore sizing for the slowest, and a consumer that may block for a
long time hands off to its own queue rather than blocking on the shared one.
And the channel must survive having zero live subscribers — retaining an
inactive receiver, or an equivalent — because a fan-out that closes when the
last consumer detaches cannot be re-subscribed, and a component that attaches
late finds a dead channel.

## Late subscribers read the replica, not a backlog

A consumer attaching after the stream has been running does not need history,
and should not be given any: it reads the replica for the current state of
everything and receives notifications from the moment it attached. This is
strictly better than the early-arrival buffer a bus needs, and it exists only
because a complete replica is available beside the channel — which is another
reason the two are designed together rather than layered.

The same reasoning covers resynchronisation. After a swap, the reader
re-notifies every key in the new snapshot, so every subscriber re-examines
everything rather than waiting for individual changes to a slice that changed
while nobody was watching. It is a burst of exactly the replica's size, it
happens as often as the replica resynchronises, and it is the mechanism that
makes a desync cost latency rather than correctness for consumers.

## Identity across the channel

Keys travel between components, so the key's definition is a contract. A key
that is a human-assigned name reuses across a delete-and-recreate, and a
consumer holding local state against that key silently attributes the new
record's notifications to the old record's state
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). Include
the creation-minted identity where the source provides one. If the shared key
cannot carry it — because the replica's own index is by name — then the
consumers that keep durable state keyed on it must be told, in the read
interface, that the key is reusable.

## When not to fan out

Two consumers wanting *different* slices are not sharing anything; giving them
one stream over the union means each pays the other's memory and neither can
narrow its selector. Fan out over one declared slice, not over one source. And
where consumers genuinely need the payload as it was at change time — an audit
trail, a diff renderer — the replica is the wrong instrument entirely and the
change log itself is what they want.
