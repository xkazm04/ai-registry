---
layer: technique
type: technique
subject: edge-queue-policy
technique: in-band-flush
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [queued output must be abandoned the moment it is superseded, interruption is racing the data it cancels, deciding whether sessions may share one input]
---

# In-band flush

Carry interruption as a **flag on the next message** rather than as an
out-of-band cancel. The consumer's queue reads the flag at admission, discards
what is queued, and then admits the message — so the discard costs one delivery
and cannot be overtaken by the very messages it is cancelling, because it
travels in their lane.

## Why in-band beats a cancel channel

An out-of-band cancel is a hop out and a hop back through whatever brokers the
control plane, and it races the payload still in flight on the data path. The
loser of that race is visible to a user: audio that keeps playing for a beat
after the interruption, a display that paints two more frames of the superseded
answer, a manipulator that executes one more command from a plan already
abandoned. Worse, the two paths have different failure modes, so the cancel can
be lost while the data it was meant to stop is delivered perfectly.

In-band, the ordering is free. The flush marker is *behind* everything it must
discard and *ahead* of everything that supersedes them, by construction,
because it occupies a position in the same stream. There is no window, and
there is nothing to reconcile: the same mechanism works identically whether the
peers are in one process, on one machine, or across a network, and it needs no
second channel to keep alive.

The cost is that interruption requires something to send. A producer that wants
to cancel and then say nothing must emit a message carrying only the flag — an
empty segment, a marker with no payload — which is a small price and should be
made explicit in the message vocabulary rather than improvised as a zero-length
payload.

## Placement: the flag is on the message, read at admission

Two details decide whether this works.

**The flag is a property of the message, not a separate event.** An event that
travels beside the message can be reordered relative to it by any scheduler
between them, including the fairness rotation this subject's own consumer runs.
On the message, it cannot.

**The discard happens at queue admission, not at consumption.** If the consumer
performs the discard when it reaches the flushing message, everything queued
ahead of it has already been delivered to the consumer's loop and possibly
acted on — the interruption arrives after the work it was cancelling was done.
Admission-time discard is what makes interruption latency a property of the
transport rather than of the consumer's loop, which may be arbitrarily busy;
this is exactly the case where the consumer is busy.

## What flush discards, and what it may not touch

Flush discards the **ordinary** class only. Correlated messages — the halves of
an exchange a peer is blocked on — and the lifecycle class are immune, on the
same ladder eviction reads, for the same reason: a flush that discards a pending
reply strands a peer in a wait with no terminator, and a flush that discards a
stop signal produces a process that will not exit. The naive statement of this
mechanism, and the one most designs ship first, is "flush clears the queue";
it is wrong, and it is wrong in a way that only manifests when an interruption
happens to coincide with an outstanding request, which is late and rare and
brutal to diagnose.

That shared ladder is the reason both mechanisms must read **one** class
vocabulary with one authoritative definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained notions of "what may be sacrificed" — one in the eviction
path, one in the flush path — drift at exactly the moment someone adds a
message kind, and only one of the two copies is updated. As with eviction, the
class arrives with the message as a typed value rather than being re-derived at
the flush site ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

One structural shortcut is worth refusing here. Where the lifecycle class is
held in a separate queue under a reserved identifier, it is tempting to argue
that flush — which targets one input's queue — cannot reach it, and to skip the
immunity check on the flush path. That argument holds only while no declared
edge can carry the reserved identifier as its own name, which is a property of
the *validator*, not of this code. Guard the flush path explicitly: an
invariant enforced in a different component is an invariant one relaxed
validation rule away from being false, and its violation here is a runtime that
will not shut down.

## Flush is per edge, so sessions get their own edge

The flag names no session and no conversation. It says "discard what is queued
**on this input**", because at admission time the queue is the only context
available and inspecting payloads to decide which queued messages belong to the
interrupted conversation would put a parser on the hot path and make the
discard cost proportional to depth.

The consequence is a design rule, and it is load-bearing: **two independent
conversations must not be multiplexed onto one input.** If they are, either
interruption discards the other conversation's queued messages — silent data
loss with no diagnosis available to either endpoint — or the flag is weakened
into a hint the consumer applies later, which surrenders the latency guarantee
that motivated the mechanism. A design that serves many concurrent sessions
gives each its own edge, and accepts that the number of edges now scales with
concurrency, which is a real cost to weigh against a session-aware cancel.

## Interruption is not an ending

A flushed stream has not been told how it ended. The interrupted segment simply
never reaches its terminator, and a consumer that treats "no more messages" as
"completed successfully" has promoted an interruption to a success. The flag
says what to discard; it says nothing about *why*, and user interruption,
producer crash and transport loss are indistinguishable at the queue. Wherever
the outcome matters, the ending is a message of its own — a typed terminator on
the correlated class, immune to the flush that preceded it — or it is derived
by the consumer from a supervisor's restart signal, or it does not exist
anywhere.

## When not to use it

Do not use in-band flush where the producer cannot be relied upon to send
again: if the interruption's whole meaning is "this producer is going away",
the marker never arrives and the queue holds its stale contents forever — that
is the closure notice's job. Do not use it where queued messages have already
had external effects, because discarding them cancels nothing that happened.
And do not use it where the queued messages are individually owed — commands
that each mutate state, chunks of a file — since the flush's whole premise is
that the discarded messages were superseded rather than lost.
