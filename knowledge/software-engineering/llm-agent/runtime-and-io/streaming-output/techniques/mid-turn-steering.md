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

## When not to use this

Short turns need none of this: a turn that settles inside a perceptual beat
is cheaper to let finish and follow up than to steer. And a batch pipeline
whose consumers are not watching has no steering user; there, mid-run input
is a configuration change with its own release discipline, not a message.
