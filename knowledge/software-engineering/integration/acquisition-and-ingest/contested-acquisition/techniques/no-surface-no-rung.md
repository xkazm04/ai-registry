---
layer: technique
type: technique
subject: contested-acquisition
technique: no-surface-no-rung
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [a response requires a person to act, deploying an interactive fallback to a headless or hosted environment, refused requests take the full budget before answering]
---

# No surface, no rung

The last response in a refusal ladder is usually a person: put the situation
in front of a human, wait for them to deal with it, take the result. It is the
most capable response available and the most expensive, and it is the one most
often built as a timeout — engage the surface, poll until something changes,
give up after a generous deadline because a human is slow and the deadline
must be generous.

That construction is correct on the machine it was written on and catastrophic
everywhere else. On a headless host, a container, a scheduled job, a shared
server — anywhere nobody is watching — the step still engages, still polls,
and still waits out its full deadline, once per refused request. A generous
human-paced deadline is by design the largest single number in the budget, so
the environment where the response can *never* work is the environment where
it costs the most.

> A step that requires a human returns immediately — without notifying and
> without polling — unless consent **and** a surface both exist. The timeout is
> not the safety net; the gate is.

## Two conditions, and neither implies the other

**Consent** is a human decision that this system may interrupt a person. It is
explicit, it is configuration, and it is off by default.

**A surface** is a place a person could actually be shown something and could
actually act: a visible window, an attached console, a connected client. It is
a fact about the runtime, derived at the moment the step is entered, not
declared in configuration.

The reason both are required is that each is routinely present without the
other. An operator configures consent once, then deploys the same
configuration to a host with no display — consent survives the move and the
surface does not. And a developer sitting in front of a visible window has a
surface without having agreed to be interrupted by every refused request in a
batch of two hundred.

Check the surface first and consent second. The surface is the condition that
is false in exactly the deployments this gate exists to protect, so failing on
it first makes the common skip the cheapest one and puts the most informative
reason on the outcome.

## The gate is not optional, and that is the point

A gate that must be switched on is a gate that is off in production, because a
deployed fleet converges on the default
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). This one
engages on its own: the step evaluates its own preconditions on every
invocation, and the caller cannot skip the evaluation by not asking for it.

That inversion is what makes the ladder above it simple. The sequencer can
elect the human step on the strength of a single configuration switch, without
knowing anything about the runtime, precisely because the step will refuse
itself when it cannot work. A sequencer that has to reason about displays and
consent has absorbed a concern that belongs one level down, and it will get it
wrong the first time a new kind of surface is added.

## The degradation is immediate and named

Returning early is half the technique. The other half is *what* is returned,
and it is not a timeout and not a generic failure.

The step's outcome vocabulary distinguishes, at minimum, **no surface**, **no
consent**, and **timed out**. These are three different facts with three
different responses: the first is a deployment property, the second is an
operator decision, the third is a person who was asked and did not finish.
Collapsing them makes the step unmeasurable — you cannot compute how often a
human clears a refusal when "never asked" and "asked and failed" are the same
outcome — and it also makes the deployment problem invisible, because an
operator who wanted this response and is not getting it sees a timeout and
concludes the humans are slow.

Collapsing them into the slow shape is the worse direction. A refusal answered
after two minutes of polling *looks like a genuine attempt*, and it is
indistinguishable from one at every boundary above
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Fast and named beats slow and plausible: the caller learns the truth in
milliseconds and the budget is spent on responses that could have worked.

## Engage the surface exactly once

Once the gate passes, the step interrupts the person **one time** — raise the
surface, state what is being asked, then poll quietly. A step that re-prompts
on each poll turns one interruption into dozens and trains the operator to
turn consent off, which removes the response from the ladder entirely for a
reason that had nothing to do with whether it works.

Keep the step surface-agnostic while you are at it. The gate takes *whether* a
surface exists as an injected fact and the interruption as an injected
callback; the step itself knows about neither the window nor the console. That
is what lets a second kind of surface be added later without reopening the
gate logic, and it is what lets the gate — the load-bearing part — be tested
without one.

## Decision rules

- **When either condition is false, return before notifying and before
  polling.** No prompt, no wait, no partial engagement.
- **When both are true, notify once and then poll silently** until cleared or
  the deadline passes.
- **When the step declines itself, say which condition failed.** The reason is
  the outcome's most useful field.
- **Never let a timeout stand in for the gate.** A deadline bounds a person's
  slowness; it does not detect their absence.

## When not to use this

A tool whose only deployment is an interactive session in front of the person
who invoked it — a command a developer runs and watches — has a surface by
construction, and the gate is one branch that is always true. Even there,
prefer the explicit check: the cost is a line, and the first time that tool is
wrapped in a scheduled job, the gate is already the difference between an
immediate honest answer and a queue of two-minute waits.
