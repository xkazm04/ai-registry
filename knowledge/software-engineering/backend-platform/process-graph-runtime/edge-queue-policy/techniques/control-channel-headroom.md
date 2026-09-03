---
layer: technique
type: technique
subject: edge-queue-policy
technique: control-channel-headroom
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [lifecycle and data messages share one bounded channel, a shutdown or close notice was lost during a burst, sizing the reserve on a mixed channel]
---

# Control-channel headroom

Where lifecycle messages and payload travel through one bounded channel,
reserve a fixed slice of that channel for lifecycle traffic and refuse **data**
once free capacity falls below the reserve. Control stays deliverable while
data saturates, which is the only condition under which control was ever going
to be lost.

## Why one channel, and why that creates the problem

Merging the two classes onto one channel is usually right. One channel is one
thing to size, one thing to instrument, and one place where ordering between a
message and the notice that its edge closed is preserved — split them and the
"this input is finished" notice races the last three payloads it was supposed
to follow, and every consumer has to reconstruct the order it just lost.

The merge costs one thing: the two classes have wildly different arrival
statistics and wildly different value. Payload arrives in floods, and each
message is one sample among thousands. Lifecycle messages — a peer stopping, an
edge closing, an upstream restarting, a readiness verdict — arrive rarely, and
each one is the sole carrier of a transition. A channel that sheds uniformly
therefore sheds the important class exactly when the flood is on, which is
exactly when a peer is most likely to be failing and a notice most likely to be
the only evidence.

## The reserve

Let the channel's capacity be *C* and the reserve *R*. The rule has two halves
and both are necessary:

- **A data message is admitted only while free capacity exceeds *R*.** Data
  sees an effective capacity of *C − R* and is dropped, by this edge's declared
  overflow verdict, once that is reached.
- **A lifecycle message is admitted while free capacity exists at all.** It may
  consume the reserve. Nothing else may.

*R* is sized from the maximum number of lifecycle messages that can be
outstanding in one burst — one per edge for closure notices, one per peer for
restart notices, plus the shutdown signal and the readiness verdict — with a
margin. It is a small fraction of *C*, in the low percent: a reserve large
enough to matter to data throughput is a second data queue with a different
name, and one small enough to be exhausted by a single fan-in event is
decoration.

The reserve is a floor for the *class*, not a private lane per sender. Lifecycle
messages from different peers compete inside it, which is correct: they are the
same class of fact and there is no principled ordering between two peers' close
notices.

## The two severities

The severity of a drop is decided by class, and the gap between the two is the
point of the whole mechanism.

**A dropped payload is a policy outcome.** It is counted, it is not an error,
and it is not logged per occurrence — a per-message log on the drop path of a
saturated channel is a second outage layered on the first.

**A dropped lifecycle message is a correctness event**, logged at error level,
every time. Something downstream is now waiting for a transition that will
never be announced: a consumer that will never learn its input closed, a
supervisor that will never learn a peer stopped, a shutdown that will hang
behind a signal nobody received. Grading it as a warning — the reflex, because
it happened during a saturation the operator already knows about — files the
one event that says the reserve failed under the heading of events that say the
system is busy ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
a channel that could not carry a fact and a channel with no facts to carry must
not read alike).

The classification must arrive with the message rather than be inferred at the
drop site ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A drop path that inspects a payload to decide whether it was important is
running a parser in the hottest, least-tested code in the queue, and it will
misclassify precisely the novel message type that was added last.

## The reserve line is also the "keeping up" predicate

Once the reserve exists, the system has a free and honest answer to a question
it otherwise has to invent an instrument for: *is this consumer keeping up?* A
consumer whose channel has more than the reserve free is draining; one whose
channel has fallen into the reserve is not, and is by construction already
losing data. Reuse that same comparison wherever the answer is needed — whether
to refresh a liveness deadline, whether to re-open an input a breaker has
opened, whether to promote a consumer back to a faster route — rather than
adding a second, independently-derived notion of health.

Two things fall out. A liveness deadline refreshed by the *sender's* "I sent
it" is refreshed by a party that cannot see the receiver's drop, so it never
fires for exactly the slow consumer it exists to detect; gating the refresh on
the receiver's own headroom repairs that without a new measurement. And a
breaker re-opened while the consumer is still inside the reserve will flap
open and shut at the deadline interval, delivering nothing on each cycle, so
recovery is gated on the same line that admission is.

## An undeliverable critical message escalates, and the escalation must not block the drainer

The reserve reduces control drops; it does not eliminate them, and for the
class of lifecycle message whose loss strands peers forever — an upstream
restarted, an exchange abandoned — logging the drop is not enough. Those
escalate to a guaranteed, blocking send.

The trap is where that blocking send runs. If it is awaited on the single loop
that also feeds the receiver, and the receiver is itself blocked sending into
that loop's own channel, the two wait on each other and the whole runtime
stops — a deadlock reachable only under the saturation that made the escalation
necessary. Hand the awaiting send to a detached task with its own handles and
let the loop keep draining. The general rule: **a guaranteed delivery must
never be awaited on the thread whose progress is the receiver's only way to
make room.**

## What the reserve does not fix

The reserve keeps control *deliverable*; it does not keep it *timely*. A
lifecycle message admitted behind a full channel of payload still waits for
that payload to drain, so a consumer that must react to a stop within a bounded
time needs either a priority read that takes lifecycle messages out of order or
a genuinely separate channel — at which point the ordering guarantee above is
gone and must be reconstructed explicitly, usually by having the closure notice
carry the sequence number of the last payload it follows.

Nor does the reserve survive a consumer that has stopped reading entirely. Then
the channel fills, the reserve fills behind it, and the design that saves the
situation is not headroom but the eviction ladder: the queue sacrifices ordinary
messages to keep the stop signal, which is the one message that can restart the
reader.

## When to skip it

Skip the reserve where the two classes genuinely do not share a channel, and
skip it where the channel is unbounded by construction (an in-process direct
call, a channel whose capacity is the address space) — in the second case,
record that the protection is absent rather than assuming it. Skip it, too, on
a channel that carries lifecycle messages *only*: reserving part of a channel
for its sole occupant is a smaller capacity wearing a policy.
