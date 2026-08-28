---
layer: technique
type: technique
subject: streaming-output
technique: mid-turn-steering
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [a message arrives while the turn is still running, deciding between steering an in-flight turn and queueing a next one, a steer capability exists in some runtimes and not others, a user cannot tell whether their interjection was seen]
---

# Mid-turn steering

A turn that streams for minutes invites the user to talk back before it ends
— to correct a misread instruction, narrow a scope, call off a tangent. The
surface has exactly two honest things to do with that message: **steer** (
inject it into the in-flight turn at the runtime's next safe point, so the
work redirects now) or **queue** (hold it as the next turn's input, so the
current work finishes unmodified first). Both are legitimate; what is not
legitimate is leaving the choice to accident, because the two differ in the
only way the user can feel: whether their words reached work in progress or
a queue behind it.

## Steering is a declared capability, and queueing is its degrade

Whether an in-flight turn can accept input at all is a property of the
runtime underneath — some expose a safe-point injection, some cannot. So
steering enters the system as a **capability the runtime adapter declares up
front**, never probes for at run time; and the caller above the adapter owns
exactly one degrade path: **absent the capability, a mid-turn message queues
as the next turn.** That split keeps the fallback in one place. Adapters that
cannot steer stay simple; the queue-only behaviour is implemented once, above
them all, instead of re-invented with local variations inside each adapter
that lacks the feature.

The user-facing consequence of the degrade must be visible: a message that
queued behind a running turn and a message that redirected it are different
promises, and a surface that renders both identically has the user watching
work continue down a path they just cancelled, wondering if they were heard.

## Between turns, steer refuses — it never queues quietly

The contract's sharpest edge: a steer call when **no turn is in flight must
refuse loudly, never accept the message into a queue**. The tempting
implementation accepts it ("we'll deliver it next turn — same thing"), and
the same-thing claim is false twice over. The caller that chose *steer*
believed a turn was running; if none is, one side of the conversation is
wrong about the session's state, and swallowing the message hides the
disagreement. Worse, the caller will also submit the message through the
normal next-turn path — its own degrade — and the quiet acceptance now
delivers it twice. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), the
steer path's "no turn to steer" is a failure with its own spelling, not a
silent success with delayed effect.

## The join must be observable in the stream

A steered message changes what the rest of the turn means, so the event
stream must record *where it joined*: an explicit joined-event emitted before
the turn's terminal event, positioned where the injection took effect. That
single event is what makes three things possible downstream — the transcript
reads truthfully (the reader sees the redirect where it happened, not
appended after the fact), [run-attribution](./run-attribution.md) stays
intact (output after the join is answering a different instruction than
output before it), and a steer that arrived too late to matter is
distinguishable from one that was never delivered. A steer accepted with no
join event is a promise with no receipt.

## Redirect, don't restart

Steering exists because the alternative interaction — cancel the turn,
re-prompt with the correction folded in — throws away every token of progress
and every warm cache the turn had. Reserve cancellation
([cancellation-and-finalization](./cancellation-and-finalization.md)) for the
case where the work itself is unwanted; steer when the work is wanted and the
direction is wrong. The two are siblings — user input against a live turn —
with opposite signs, and a surface that offers only the destructive one
teaches users to burn work to change it.

## The channel has more than one producer

Everything above reads as though the message came from the user, because that
is the case the surface is built for. It is not the only one. The mechanism
this technique describes — a queue drained at the runtime's next safe point —
is the natural arrival door for *every* fact that becomes available while a
turn is running, and a system that builds it for the human and then invents a
second door per machine source pays for the same mechanism repeatedly and
collects a different set of bugs each time.

The producers that belong on this channel are recognizable by one property:
each produces a fact the model should act on, at a moment nobody chose. A
concurrent worker settling with a report. A scheduled wakeup. An inbound
message from an external channel the agent is attached to. A notice that the
process restarted under a new build. Routed through one injection point, each
of these is a message carrying a source tag, and adding the next one costs a
tag rather than a subsystem.

**Two rules above invert for machine producers, and both inversions trace to
the same missing property.** A human caller has a second door: when a steer is
refused because no turn is in flight, that caller submits through the normal
next-turn path instead — which is exactly why refusing loudly is right and
quiet queueing is a double-delivery bug. A machine producer has no second door.
Nothing will re-offer a worker's report or a scheduled wakeup. So:

- **Absent a turn, a machine-sourced message starts one, or is held durably
  until it can be delivered.** Refusing it satisfies the letter of the rule
  above and destroys the only copy of the fact. Which of the two applies is a
  per-source decision — a wakeup whose whole purpose is to cause work starts a
  turn; a report whose value keeps can wait for the next one — but refusal is
  not among the options.
- **The delivery is recorded before it is attempted and cleared only once it
  lands.** The gap between "the source produced a fact" and "a turn carrying it
  began" is where a crash eats work invisibly: nothing is left behind to
  reconcile against, so the loss is not merely unrecovered, it is unnoticed.
  A durable pending-delivery record, redelivered at startup, converts that gap
  from silent loss into a duplicate at worst
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

The provenance obligation runs the other way. A machine-authored message
arriving on the user's channel is, to the model, indistinguishable from the
user's except by content — which is precisely what makes the composition cheap
and precisely what makes it a trust question. Two consequences, both cheap to
honor. The surface renders the source, so a human reading the transcript never
attributes a scheduler's instruction to themselves. And the assembler
classifies the injected span by its true origin rather than by the seat it
arrived in: an inbound external message is untrusted input wearing the user's
clothes, and the trust classes it must be sorted into are the ones the
[prompt-assembly](../../../prompt-and-context/prompt-assembly/prompt-assembly.md)
subject declares at assembly time.

## When not to use this

Short turns need none of this: a turn that settles inside a perceptual beat
is cheaper to let finish and follow up than to steer. And a batch pipeline
whose consumers are not watching has no steering user; there, mid-run input
is a configuration change with its own release discipline, not a message.
