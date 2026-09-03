---
layer: golden-path
type: golden-path
subject: edge-queue-policy
status: forged
use_when: [wiring a bounded channel between two long-lived peers, a fast producer is swamping or starving a slow consumer, deciding what an edge drops when it saturates, interruption must reach a peer faster than a control round trip]
techniques:
  - per-edge-depth-and-policy
  - control-channel-headroom
  - least-recently-used-input-fairness
  - eviction-priority-classes
  - in-band-flush
  - drop-accounting
---

# Edge queue policy

This is the subject you own when two long-lived peers are joined by a
**declared edge** — a named, typed channel that exists for the life of the
graph and carries a continuing stream from one process to another — and the
producer is, for seconds at a time, faster than the consumer. Something must
hold the surplus, something must decide what is lost when the surplus exceeds
what may be held, and something must decide which of the consumer's edges is
served next. Those three decisions are the edge's queue policy: not a buffer
size, and not the consumer's private business — declared on the edge, where the
edge is declared, binding on every transport the edge may take.

The physics that make this subject its own are in the payload. A work item
wants to be executed exactly once, and the queue holding it holds a promise. An
edge's messages are **samples of a continuing signal**, most of which will be
superseded before anyone can read them, so the default verdict inverts: a work
queue refuses the newest arrival to protect the promises it has already made,
and an edge sacrifices the *oldest* message to protect the freshness of the
newest. A manipulator acting on the frame from four hundred milliseconds ago is
not being careful with data; it is acting on the past. The same inversion
decides the failure worth fearing — not a lost promise but a **queue that
grew**, latency climbing while depth absorbs a mismatch that never resolves.

## What this subject owns, and where it stops

The neighbouring subject with the shared vocabulary is
[admission-queue](../../work-execution/admission-queue/admission-queue.md), and
the vocabulary transfers while the object does not. That subject arbitrates
*work items* entering an executor — run now, hold for later, or refuse, the
refusal carrying a reason a caller can act on, fairness measured across the
*requesters* competing for one pool. Here there is no executor and no
requester: one standing data edge whose default verdict is "drop the oldest",
whose producer usually receives no verdict at all, and whose fairness question
is asked entirely inside one consumer, across its own typed inputs. Read that
subject when the thing being queued has a fate; read this one when the thing
being queued has a successor.

[delivery-guarantees](../../work-execution/delivery-guarantees/delivery-guarantees.md)
asks whether a message is delivered *at all* — the guarantee chosen per event
class, the atomic claim, the reaper, the dead letter that keeps a refusal
legible. This subject assumes that is settled and asks the question surviving
it: given a channel lossy on purpose, *which* messages are lost, in what order,
and who is told. An edge running drop-oldest is an at-most-once channel that
chose its losses instead of suffering them — which is why a designed loss and
an undetected fault are one observation until something counts them apart.

The third neighbour looks closest and is furthest.
[streaming-output](../../../llm-agent/runtime-and-io/streaming-output/streaming-output.md)
owns interruption at the *renderer*: whose output this is, whether it is still
flowing, how it ended, what the surface does with a partial result. This
subject owns interruption as a **queue semantic** one hop upstream — the
discard happens at the consumer's queue on arrival, before its loop has seen
anything, and whether or not a renderer exists. The rule for picking: what a
human sees when something stops is the renderer's; what happens to messages
already in flight is this one.

## The policy is declared per edge, never per consumer

A consumer with one queue has silently declared that every producer feeding it
deserves the same depth, the same overflow verdict and the same memory — false
the first time a camera at three hundred hertz and a configuration channel at
one message a minute arrive at the same process. Depth says how much history
*this* signal is worth keeping and the verdict says whether its older values
still mean anything — both properties of the edge, legible beside it.

Two spellings decide whether that declaration is honest. **Losslessness is an
opt-in that still names a ceiling** — the edge declaring it gets backpressure,
and backpressure gets a hard cap some multiple above the nominal depth, past
which the queue drops and says so loudly, because a lossless mode with no cap
is an unbounded queue with better manners. And **a depth of zero is clamped to
one, never honoured as written**: zero turns a declared edge into a port that
accepts nothing, a topology change made by a typo.
[per-edge-depth-and-policy](./techniques/per-edge-depth-and-policy.md) owns the
derivation, the two verdicts, the cap and the degenerate values.

## Control traffic keeps a reserved slice of a shared channel

Where lifecycle messages and data share one bounded channel — and they usually
do, because one channel is one thing to size, one thing to instrument and one
place to preserve ordering — saturation attacks the wrong traffic first.
Payload arrives in floods; "I am stopping", "this input closed", "the upstream
restarted" arrive rarely and matter enormously, so a channel that drops
uniformly drops the shutdown notice during the burst that made shutdown
necessary. The repair is a reserved slice: below a fixed headroom the channel
refuses *data* and keeps accepting lifecycle messages. Severity grades
differently on each side of that line — a dropped sample is a policy working as
designed, a dropped control message is a correctness event at error level,
because something downstream now waits for a transition nobody will announce.
[control-channel-headroom](./techniques/control-channel-headroom.md) owns the
reservation, its sizing and the two severities.

## Selection across edges is a second, separate decision

Per-edge admission decides what survives *inside* one queue; it says nothing
about which queue the consumer reads next, and the naive answer — whatever
arrived first — implements a policy nobody chose. Under sustained load, arrival
order is frequency order: the thousand-hertz edge is always non-empty and the
one-hertz edge is served when the fast one blinks, which under real load it
does not. The consumer starves on the input it least expected to lose, and the
symptom reads as "the controller ignores the operator", not as a queue problem.

Serving the **least recently served non-empty input first** removes that
structurally: every non-empty edge advances at its own pace, and a fast edge's
surplus is dropped by its own policy rather than absorbed at its siblings'
expense. It buys that with two costs that must be stated rather than
discovered. Cross-input chronology is no longer preserved — two messages sent at
the same instant on different edges are delivered in rotation order — and
because the lifecycle class is served *ahead of* the rotation rather than
inside it, an edge-closed notice can arrive before that edge's own last queued
messages, inverting the invariant most consumers assume. Neither is acceptable
*unannounced*, and where the runtime offers both a fair receive and a raw
chronological stream, the difference is part of each entry point's contract.
[least-recently-used-input-fairness](./techniques/least-recently-used-input-fairness.md)
owns the rotation, its costs and the chronological escape hatch.

## Eviction is a classification, not a position

"Drop the oldest" is a rule about position, and position is the wrong
coordinate the moment a channel carries more than one kind of message. The
oldest entry may be the shutdown signal; the newest arrival may be the reply
half of an exchange a peer is blocked on. So eviction reads the message's
**class**, given at construction and travelling with it: ordinary samples are
sacrificed first and silently, correlated messages — the halves of a request, a
goal, a session — are sacrificed last and loudly, because dropping one strands
a peer in a wait with no other terminator, and the lifecycle signal that ends
the consumer's loop is never sacrificed at all. A queue that guesses the class
by inspecting a payload has already lost: the guess runs in the drop path, the
hottest and least tested code the queue owns.

The same path carries an accounting trap: where eviction leaves a marker behind
— a tombstone keeping indices stable — a consumer that has stopped reading
accumulates one per dropped message until the queue is full of nothing, so
compaction belongs on the drop path, the only path still running.
[eviction-priority-classes](./techniques/eviction-priority-classes.md)
owns the class ladder, the drop order and the compaction rule.

## Interruption rides the stream

The queue is also where interruption is cheapest. A consumer that must abandon
everything queued — a speaker interrupted mid-sentence, a plan superseded — can
be told through a control round trip, which costs a hop out and back and races
the data still in flight, or by the next data message itself: a flag on it,
read at queue admission, that discards what is queued before the message is
delivered. In-band, interruption costs one delivery and cannot be overtaken by
the messages it cancels, because it travels in their lane.

Two rules keep the mechanism from becoming a data-loss bug. Flush discards the
**ordinary** class only — correlated exchanges and the lifecycle signal are
immune, on the same ladder the eviction path uses. And flush is a property of
the *edge*, not of a session: everything queued on that input is in scope, so a
design that needs two conversations interrupted separately gives each an edge.
[in-band-flush](./techniques/in-band-flush.md) owns the placement of the flag,
the immunity ladder and the multiplexing rule.

## A drop nobody counted is indistinguishable from a broken producer

Every policy above spends messages on purpose, and an uncounted spend is a
fault the system has agreed not to notice. The consumer receiving one frame in
four cannot tell, from the data alone, whether the producer has degraded, the
transport is losing messages, or its own queue is doing exactly what it was
configured to do. So drops are counted per edge and per class, at the site that
performed them, readable by the consumer and not only by an operator, each
carrying its predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)).

The same instrument settles a question that otherwise stays open forever: a
policy declared on an edge must hold on **every** transport that edge may take.
A graph that can move a payload by more than one route acquires a second queue
implementation the moment the fast route bypasses the slow one — written by
whoever built the fast route, in a hurry, without the class ladder. Both routes
enter one policy, both are covered by paired tests, and the counters are the
evidence they agree
([gate-sees-target](../../../_laws.md#gate-sees-target)).
[drop-accounting](./techniques/drop-accounting.md) owns the counters, their
predicates and the cross-transport obligation.

## A message's life on an edge

| State | Meaning | The edge's obligation |
| --- | --- | --- |
| **queued** | admitted, awaiting selection | counted in this edge's depth, and in nothing else's |
| **evicted** | removed by policy before delivery | counted by class; the class decides whether it was silent or loud |
| **flushed** | discarded by an interruption carried in-band | counted apart from eviction — a different cause with a different remedy |
| **delivered** | handed to the consumer's loop | the queue's slot is released and any marker compacted |

Two rules fall out. **Every message leaves by a named exit** — delivery,
eviction, flush, or the edge closing
([creation-names-reaper](../../../_laws.md#creation-names-reaper) applied to
queue slots). And **no edge state is inferable from silence**: an idle edge and
a starved edge look identical from inside the consumer's loop, so depth,
oldest-message age and drop counts are what tell them apart.

## The techniques

- [per-edge-depth-and-policy](./techniques/per-edge-depth-and-policy.md) —
  depth derivation, the two verdicts, the cap, the degenerate values.
- [control-channel-headroom](./techniques/control-channel-headroom.md) — the
  reserve, its two severities, and the escalation that must not block.
- [least-recently-used-input-fairness](./techniques/least-recently-used-input-fairness.md)
  — the rotation, the chronology it trades away, each entry point's contract.
- [eviction-priority-classes](./techniques/eviction-priority-classes.md) — the
  class ladder, the order of sacrifice, compaction on the drop path.
- [in-band-flush](./techniques/in-band-flush.md) — the flag, discard at
  admission, the immune classes, one edge per session.
- [drop-accounting](./techniques/drop-accounting.md) — per-edge and per-class
  counters, their predicates, one policy across every transport.
