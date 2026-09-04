---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: additive-input-at-the-call-boundary
status: forged
laws: [record-precedes-effect, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a user types a follow-up while the agent loop is still working, deciding whether new input restarts a unit of work or joins it, a steering message silently disappears when the run finishes first, choosing where a running loop is allowed to accept anything from outside]
---

# Additive input at the call boundary

A running agent loop is a closed thing: it was started by one input and it
runs until the model stops asking for tools. Then a person types something
while it is working, and the runtime has to decide what that means. The
surface half of this is settled — the send control is never disabled, and
the three intents behind it are distinct. This technique owns the half
underneath: **where in the loop the message is allowed to land, and what
the loop must not do to accept it.**

Two designs are available and they are not close.

**Supersede-and-restart** cancels the running unit at a safe point and
promotes the message into a fresh unit that references the cancelled one.
It is genuinely attractive: it needs no new event, no new schema, and it
collapses queueing and steering into the single promotion path that already
exists.

**Additive injection** accepts the message *into* the running unit at a
model-call boundary, as an ordinary user message positioned after the
current tool batch's results.

The second is correct, and the reasons are worth stating because they are
not obvious from the loop's own shape — each one is a property of some
*other* part of the runtime that supersede quietly destroys.

## Why supersede loses, in three places it does not own

- **It resets the context transform at the worst moment.** A runtime that
  elides or compacts historic material treats the just-cancelled unit as
  history the instant a new unit begins. The large tool results the agent
  read thirty seconds ago — the whole reason it was making progress —
  become placeholders on the very next call. The model is steered and
  simultaneously made to forget what it was steered about.
- **It voids the sealed half of the transcript.** Continuation metadata is
  valid only for a cleanly closed unit. Cancelling to steer means every
  steer marks the preceding work unclean, so a reasoning model loses its
  chain on every single steer rather than on a provider switch.
- **It is destructive by construction to suspended work.** A unit waiting
  on a human decision or an outstanding external call cannot be cancelled
  without discarding those pending calls. Supersede therefore cannot be
  applied to the state in which steering is *most* likely — the loop is
  blocked, so the person types.

Additive injection preserves all three by not being a transition at all.
Nothing is cancelled, no unit closes, no in-flight work is interrupted.

## The boundary is one specific point, and it is narrow

The message lands at the point in the loop where: the tool batch has
settled with terminal results, completion has been ruled out, and the next
model request has not yet been prepared. That is the only moment at which
adding a message is neither a mutation of work in progress nor a change to
a request already sent.

Three constraints hold the boundary in place:

- **The loop does not know where the messages come from.** It polls a
  caller-supplied drain once per iteration. The queue, its ordering, its
  editability and its ownership belong to the layer above; the loop's
  entire share is "give me anything you have, now." A loop that reaches
  into a session's queue has taken a dependency it cannot be tested
  without, and has coupled unit execution to a concept the unit is
  explicitly allowed to run without.
- **The record is written before the request that carries it.** Each
  accepted input is appended as its own durable, indexed event, and the
  request that follows must reference every input accepted before it
  ([record-precedes-effect](../../../../_laws.md#record-precedes-effect)).
  That reference is not bookkeeping — it is what makes recovery correct.
  An input recorded and then orphaned by a crash is picked up by the
  re-issued request's references, because the references are derived from
  the record rather than from memory.
- **Injection is additive only.** It never cancels pending work and never
  interrupts a stream. This is the property that must be enforced, because
  every future feature that wants to "steer harder" will propose breaking
  it.

## Fresh input buys a fresh allowance

A loop with a call budget must **reset that budget on each accepted
input**, counting calls since the last one rather than since the unit
began. The budget exists to stop a model looping unattended; a person
typing is the opposite of unattended, and it is the exact evidence the
budget was a proxy for. A runtime that keeps counting from the start
gives a steered agent less room than a fresh request would have — and
the person, having just intervened, gets punished for it.

## Delivery is "earliest safe point", never "guaranteed"

If the model's final response has no tool calls, there is no next boundary,
and the unit completes with messages still pending. **That is correct and
must be stated in the contract**, because the alternative — holding the
unit open for a message that may never be safe to inject — trades a
guarantee nobody asked for against the liveness everybody depends on. The
layer above promotes the pending messages into a new unit instead, and the
person sees them start rather than vanish.

The obligation this creates is on the surface, not the loop: pending input
is visible from the moment it is accepted, so "it went into this unit" and
"it starts the next one" are both legible outcomes rather than the same
silence.

## Decision rules

When a message arrives mid-unit, inject additively at the model-call
boundary; do not cancel to make room. When wiring the drain, pass it in as
a callback and keep the loop ignorant of the queue. When an input is
accepted, record it before the request that references it, and make the
reference an enforced invariant rather than a convention. When a budget is
in play, reset it per input. When no boundary remains, complete and promote
— and say so in the contract rather than implying a guarantee.

## When not to reach for this

A loop with no durable record cannot do this safely: injection without an
append is a message that exists only in memory, and a crash makes it a
message the person watched being accepted and that never happened. Where
the record is absent, the honest design is to refuse mid-unit input and
queue at the surface, visibly, until the record exists.
