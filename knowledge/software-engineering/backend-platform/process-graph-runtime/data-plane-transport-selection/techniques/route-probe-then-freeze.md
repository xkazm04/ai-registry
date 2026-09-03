---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: route-probe-then-freeze
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [a fast path must be proven before traffic is trusted to it, messages disappear into a peer session nobody joined, deciding whether a route may change mid-run, sizing a startup grace window]
---

# Route probe then freeze

A direct route between two peers is only usable if the peer is running, has
joined the session, and can map whatever the route needs. None of that is
knowable from the producer's side by inspection, and all of it is false for
the first moments of every run. The technique establishes the answer once,
inside a bounded window, and then **stops asking** — the verdict is fixed for
the whole run, so every message on an edge takes one path.

## The two failures this replaces

**Optimism.** The producer publishes on a direct route nobody has joined. The
publish succeeds — there is nothing to fail against — and the messages are
gone. It is silent on both sides: the send returns success, the consumer never
receives, and the first symptom is a downstream stage producing nothing.

**Per-send re-checking.** The producer asks on every send whether the route is
live. Every message pays for the check, and worse, the answer can change
between messages: an edge that was brokered for four hundred messages becomes
direct for the rest, so its ordering, queue behaviour and observability all
change partway through a run that will be analysed as one run.

## The handshake

**Probe with acknowledged markers, one per direct route, and wait for the
acknowledgement.** A marker is an ordinary message on the route carrying a
distinguishable payload; the consumer's transport layer answers it. What is
being proven is not reachability in the abstract but the exact thing the
traffic will need: this producer, publishing on this route, reaching this
consumer, on this deployment's mapping. Markers repeat on a short cadence —
single-digit milliseconds — and stop per route the moment that route's
acknowledgements are in, so the healthy case costs one round trip and the
unhealthy case costs a bounded burst of small messages rather than an
unbounded one.

**Know which acknowledgements are required before probing, and compute that
set centrally.** The set is derived where both the declared graph and the
peers' actual placement are visible: every statically declared consumer that
the route could serve, and nothing else. Two exclusions are load-bearing. A
consumer that may join at an arbitrary time is **never** a required acker —
nothing may wait on a peer that may never arrive. And a route that is known in
advance to be unprovable, because the producer has no address the consumer
could reach, is **pinned up front rather than probed**: spending a whole grace
window waiting for an acknowledgement that cannot arrive delays the run and
lands on the same answer.

**On the consuming side, do not answer from inside the transport's receive
callback** — a callback that publishes on the transport that invoked it is a
reentrancy hazard on every mechanism that has one. Hand the marker to a
separate thread through a bounded channel and publish from there, and note the
consequence, because it is the same one the freeze already carries: if that
hand-off drops under load, the producer loses its fast path for the run. The
acker answers markers for the whole life of the subscription, so a producer
that starts late or restarts can still hand-shake against a consumer that has
been up for hours.

**Measure the grace window from the readiness barrier, not from spawn.** This
is the rule that decides whether the mechanism works in practice. A consumer
that spends eight seconds loading a model, opening a device or indexing a
workspace has done nothing wrong, and a window that started at spawn would
expire while it was still initializing — demoting a perfectly good route for a
reason unrelated to the route. Starting the clock when the graph declares
every participant ready measures the thing the window is about: how long the
transport's own join takes.

**Size the window from the join, with margin, and keep it short.** A few
hundred milliseconds suits a mechanism whose join is local; an endpoint
exchange that crosses machines needs its own, longer bound. Either way it is a
startup cost that delays the first message, so it is sized to the slowest
healthy join and no more.

## The freeze

**When the window closes, the verdict is final for the run.** Routes that were
acknowledged are direct; routes that were not are brokered, and they do not
upgrade later even if the peer joins a second afterwards. The verdict is
carried as an immutable typed value on the route's own record — not a flag
consulted at each send, and not a mutable field somebody can helpfully improve
later ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Making it immutable in the type is what makes the guarantee hold under future
edits, because the next contributor who wants an opportunistic upgrade has to
change a type rather than assign a variable.

The reason for the freeze is not simplicity. It is that **an edge with one
path for a whole run has one behaviour for a whole run**. Ordering, eviction
under pressure, what the recorder saw, whether backpressure applied: all of it
is a property of the path, so a path that changes mid-run makes every one of
those a function of message index. A recording becomes two recordings; a
latency histogram becomes bimodal for a reason no field explains; an
incident's timeline needs the moment the transport switched, which nothing
logged.

## Say what the freeze costs

The mechanism has a real and asymmetric price: **a single lost acknowledgement
costs the producer the fast path for its entire run.** A momentarily busy
consumer, a marker dropped during a burst at startup, a window sized to the
median join instead of the slow one — any of these permanently demotes an edge
that would have worked fine.

That trade is correct, because a stable pessimistic answer is worth more than
an unstable optimistic one, and because absence of an acknowledgement is not
evidence that a route is bad — it is the absence of evidence that it is good
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and
the two are only safely conflated when the pessimistic branch is the safe one.
It is defensible only when it is **visible**:

- **Every demotion is logged at the moment the window closes**, naming the
  edge, the un-acknowledged peers and the reason — not at first send, where it
  is one line among thousands.
- **Demotions are counted by cause** — window expired, peer unreachable,
  mechanism unavailable, pinned by declared policy — because a window that is
  too short and a policy that pins an edge are different problems.
- **The settled route is queryable per edge for the life of the run**, so a
  performance question starts from the route instead of establishing it.

## Order of operations at send time

The comparison order matters and is not interchangeable:

1. **Is this edge pinned by a declared guarantee?** If so, brokered, and no
   further questions.
2. **Did this route survive the probe?** If not, brokered.
3. **Is the payload above the threshold?** If not, brokered.
4. Otherwise, direct.

Policy first, because a large payload on a pinned edge must never slip through
on a size test. Probe second, because it is a cheap immutable read. Size last,
because it is the only one that varies per message.

## When not to use it

- **When peers are discovered continuously rather than at startup.** A graph
  that adds and removes participants throughout its life has no single
  readiness barrier to measure from, so the window is opened per producer at
  its own join and the freeze applied per producer. Expect a structural
  asymmetry and state it: a producer that starts late or restarts has no
  barrier to wait on, so its window opens while its peer links are still being
  established and it is the participant most likely to end up frozen on the
  brokered path. If that shows up as a measured regression, **the window is the
  knob — not a late upgrade.** Re-opening the verdict mid-run to recover the
  fast path trades a bounded, visible startup cost for an unbounded,
  invisible correctness one.
- **When runs are short relative to the window.** If a run lasts two seconds,
  a half-second startup grace is a quarter of it. Either shorten the window or
  keep everything brokered and say so.
- **When the route's failure is loud anyway.** If publishing to an unjoined
  route reliably errors, the probe is buying certainty that the transport
  already provides; keep the freeze for stability and drop the markers.
