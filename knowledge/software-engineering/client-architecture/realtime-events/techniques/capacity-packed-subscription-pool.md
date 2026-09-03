---
layer: technique
type: technique
subject: realtime-events
technique: capacity-packed-subscription-pool
status: forged
laws: [creation-names-reaper, identity-survives-reuse, count-carries-predicate]
shared_with: []
use_when: [the push provider caps subscriptions per connection and connections per account, a reconnect and a user unsubscribe race on the same topic, choosing whether to open one socket per topic, a dropped connection must re-establish its own subscriptions without touching its siblings, a subscribe arrives while the only connection with room is still opening]
---

# Capacity-packed subscription pool

[subscription-lifecycle](./subscription-lifecycle.md) settles the consumer
side: one native listener per event name, fanned out to N in-process
consumers, reaped when the last one leaves. It assumes the boundary can hold
as many native listeners as there are names. Push providers rarely allow
that. The common contract is **a cap on subscriptions per connection and a
cap on connections per account** - a socket may carry at most K topics, an
account may hold at most C sockets, and a topic subscribed twice on one
socket is an error. This technique owns the layer between the singleton
listener and the wire: a pool of push connections, each with a fixed
capacity, into which topics are packed, and a small state machine per topic
that keeps the pool honest while connections open, drop and reconnect
underneath it.

## Pack, do not spread

The unit of cost at this boundary is the connection, not the subscription:
every socket costs a handshake, a heartbeat, a slot against the account cap
and its own failure lane. So the pool packs. A new topic goes to the **first
open connection with room**; a connection is opened only when no open one
has room; a topic is never split across connections. Spreading topics evenly
across sockets feels like load balancing and is the opposite - it keeps every
socket alive at low occupancy and drives the account toward its connection
cap for no gain, since the provider fans one topic's events to one socket
regardless.

Two consequences follow from packing. A connection that is **opening** has
no room yet: subscribes that arrive while the pool's only spare connection
is mid-handshake are queued as pending, and the queue is drained into the
connection the moment it reports open, up to its capacity, with the
remainder triggering the next connection. And the pool opens **one
connection at a time**: a burst of a hundred subscribes must not open a
hundred sockets, because the first one to open will absorb K of them and the
other ninety-nine would sit empty. The pending queue is the pool's honesty
ledger - its length is the count of topics the provider has not yet
confirmed, and it is exported as such
([count-carries-predicate](../../../_laws.md#count-carries-predicate): which
pool, how many pending, since when).

## A connection re-subscribes its own topics

When a connection drops, its topics are the connection's problem, not the
pool's. The dropped connection's topic set is taken over as a unit and
re-submitted through the pool's normal subscribe path, which packs them into
whichever connections now have room - possibly the surviving siblings,
possibly one fresh connection. Two distinctions the drop handler must make:

- **Dropped after open** means the provider closed a working socket; its
  topics re-enter immediately and the connection backoff resets, because
  the network was fine a moment ago.
- **Failed before open** means the handshake itself is failing; its topics
  go to pending and the next connection attempt waits on an exponential
  ladder with a ceiling and jitter, because opening again immediately is a
  reconnect storm with one participant. The ladder is the one from
  [reconnect-storm-hygiene](../../../backend-platform/resilience/stream-proxy-hop/techniques/reconnect-storm-hygiene.md);
  this technique only says where it attaches - to the pool's connection
  attempts, never to individual topics.

Where the provider names a **reconnect address** in its close frame (a
session-migration hint), it is honored over a fresh dial: the provider is
telling the client where its subscriptions already are, and dialing the
default endpoint instead throws that state away and re-subscribes
everything through the rate-limited path.

## The per-topic state machine

Packing and re-subscribing both mutate a topic's placement while consumers
are attaching and detaching to the same topic. Without an explicit state per
topic, the two race: a reconnect re-subscribes a topic the last consumer
released a moment ago, or an unsubscribe fires against a connection that
already died and the provider keeps the topic alive on the migrated
session. So each topic carries a small state - *unsubscribed*,
*subscribing*, *subscribed*, *unsubscribing*, plus *retrying* and *failed*
where the subscribe is a request that can be refused - and every transition
is decided under that state:

- **Subscribe while subscribing, subscribed, retrying or unsubscribing** is
  a reference-count increment and nothing else. The topic's identity is the
  key ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)):
  a second interested party never opens a second subscription, and a
  subscribe that lands during *unsubscribing* is remembered, so the
  unsubscribe completion re-enters *subscribing* instead of leaving a
  consumer with no subscription.
- **Release to zero** cancels any pending retry first, then unsubscribes
  only if a subscription was actually established; a topic that never got
  past *subscribing* has nothing on the wire to release.
- **Reconnect** resets each affected topic to *subscribing* with its retry
  ladder cleared, and re-runs subscribe. A topic in *unsubscribing* at that
  moment is not re-subscribed - the reference count, not the connection
  event, decides whether anyone still wants it.
- **Retry is per topic**, on the topic's own timer and ladder, never per
  connection. A provider that refuses one topic (a permission it lacks, a
  transient session error) must not delay the other K-1 on the socket.

The reference-count half of this is the reaping rule from
[subscription-lifecycle](./subscription-lifecycle.md) restated at the
transport; the creation of every subscription names its reaper
([creation-names-reaper](../../../_laws.md#creation-names-reaper)) - the
holder's handle, whose release decrements, and the pool's shutdown, which
skips unsubscribes entirely because the sockets are about to close anyway.

## Decision rule

When the provider caps subscriptions per connection, pack topics into the
first connection with room and open a new one only when none has; queue
subscribes while a connection is opening; give every topic its own state
and retry ladder, and every connection its own re-subscribe of its own
topic set. If the provider has no per-connection cap, this technique is
over-engineering and one connection under subscription-lifecycle is the
whole design.

## Boundaries

This technique does not own the consumer-side singleton, the early-arrival
buffer or the cancelled flag - those stay in
[subscription-lifecycle](./subscription-lifecycle.md), which sits above the
pool and sees one subscribe/unsubscribe door. It does not own the backoff
arithmetic or the single-pending-timer rule, which are reconnect-storm
hygiene's. And it does not own catch-up: what a topic missed while its
connection was down is the reconciliation question, answered by
[push-vs-refetch-reconciliation](./push-vs-refetch-reconciliation.md) -
the pool restores the subscription, it never replays history.

The rule inverts when connections are cheap and topics are expensive: a
provider that meters per-topic bandwidth and allows unlimited sockets is
better served by isolating heavy topics on their own connection so one
flood does not starve its neighbours. The signal to look for is which
resource the provider's published limits actually count.

## How to test for the property

Three tests, none needing a network: a fake provider with capacity K
receives K+1 subscribes and the pool opens exactly two connections, the
second only after the first reports open, with the pending count reading 1
in between; a connection closed after open re-submits its full topic set and
the total subscribed count returns to its pre-drop value without any
duplicate subscribe on a surviving sibling; and the race - release a topic's
last handle while its connection is reconnecting - ends with the topic
unsubscribed and no subscribe on the wire after the release. The third is
the one that fails without the state machine, and it is the one to write
first.
