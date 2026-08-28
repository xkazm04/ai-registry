---
layer: technique
type: technique
subject: error-handling
technique: cancellation-attribution
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [the error rate tracks traffic instead of health, a deploy shows a burst of failures that nobody can attribute, deciding whether a cancelled operation is worth telling anyone about]
---

# Cancellation attribution

Work that stops before it finishes did not succeed, and calling it a
failure is usually wrong. Cancellation is the third outcome, and a
taxonomy with two slots forces every cancelled operation into one of them
— which is how an error stream fills with events nobody can act on, and
how a genuinely broken deploy hides inside them.

The naive correction is to add one "cancelled" category and route it
nowhere. That trades one wrong answer for another, because:

> **Cancellation is not a category. It is an outcome with a cause, and
> the cause decides every question the taxonomy asks.** The observable is
> identical across causes that deserve opposite treatment.

At minimum four causes produce the same signal:

| Cause | Retry? | Tell the user? | Count it? |
|---|---|---|---|
| The requester went away — navigation, unmount, a closed tab | No — there is nobody to retry for | No — there is nobody to tell | Not as a failure; as traffic |
| **Supersession** — a newer input replaced this work | No — the newer attempt is the retry | No | Not as a failure; the rate is a tuning signal |
| A **local deadline** fired | Yes, often | Yes — their action did not complete | Yes, as a real failure |
| The **process is draining** for shutdown or restart | Yes, elsewhere | Yes — with an honest "try again" | Yes, and against the deployment, not the code |

The first two are non-events. The last two are failures with different
owners: one belongs to the operation, one belongs to whoever pushed the
button. Reporting all four as one thing means the two that matter arrive
diluted by the two that do not.

## The runtime's cancellation signal is deliberately causeless

This is the mechanism that makes the whole problem durable, and it is
worth stating plainly because it looks like a bug in each runtime and is
in fact the same design decision everywhere: **the platform tells you
that work was cancelled and never tells you who cancelled it.** The
signal is a shared sentinel, a shared error identity, a single named
condition — one value, propagated from whichever holder decided to stop,
carrying no record of which holder that was. It is causeless by
construction, because the mechanism is built to be composable, and a
composable cancellation cannot know which of its nested owners fired.

Two consequences follow directly:

- **Attribution must be added at the site that cancels, not recovered at
  the site that catches.** The catcher sees one value and cannot
  distinguish four situations from it, no matter how carefully it looks.
  Whoever calls for the stop knows why; that reason is recorded there or
  it does not exist. An unattributed cancellation is *unknown*, and the
  seductive move — filing it under the benign cause because most of them
  are benign — is
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
  applied to the one class where being wrong is silent.
- **The nesting must be read innermost-first.** A deadline that fires
  inside a request that the caller then abandons produces two cancels,
  and the outer one arrives last and overwrites the story. The first
  reason recorded is the true one; later ones are consequences.

## It must survive the boundary as a value, not as a name

The subject already forbids classifying on prose
([structured-propagation](./structured-propagation.md)), and cancellation
is where that rule is broken most often, because the cheapest available
discriminator is usually the error's *name*. That check answers the
wrong question: it establishes that something cancelled, which was never
in doubt, and says nothing about the cause, which is the whole decision.

So the attributed reason is a typed member of the taxonomy that crosses
every boundary intact
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)) —
across the layer that catches, the transport that serializes, and the
process boundary beyond it. Where a wire protocol is involved, the
distinction is worth spending distinct status values on, because a
receiver that cannot tell "the caller left" from "we ran out of time"
will re-derive the difference from timing and get it wrong. Attribution
is produced once, by the canceller, and every consumer derives
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)) —
the same rule that governs the rest of the taxonomy, applied to the class
that most invites re-derivation at each site.

## The doors, revisited for a non-event

The subject's central invariant is that every failure reaches at least
one door. Cancellation is where that invariant needs its exact reading:
the invariant is about failures, and two of the four causes above are not
failures — so routing them to the error door is not compliance, it is
the volume that makes the door unreadable.

The discipline that keeps this from becoming a licence to swallow:

- Benign causes are **counted, not reported**. A supersession rate and an
  abandonment rate are real operational numbers with real uses — a
  climbing supersession rate means work is being started too eagerly; a
  climbing abandonment rate means something is too slow to wait for —
  and they belong in their own counters, where their own baselines live.
  Silent to the error stream, never silent to everyone.
- Drain-caused cancellation is reported and **attributed to the
  deployment**, not to the operation. It is the one cause whose count
  should be compared against a release rather than against a baseline,
  and the one most often misread as a code regression appearing at
  exactly the moment of a rollout.
- The **benign bucket is itself monitored for the failure it can hide.**
  This is the inverse risk and it is real: once a category exists that
  routes nowhere, a misclassification into it is undetectable by
  construction. A benign cancellation rate that changes shape — a
  step, a new floor, a diurnal pattern that inverts — is investigated
  as a possible failure wearing the benign label
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## What this technique does not own

The two-way discrimination at a long-lived stream — telling an abandoning
client from a failing origin at a proxy hop, where abandonment is the
*dominant* exit rather than an occasional one, and where the detection has
its own mechanics — is
[abort-versus-unreachable](../../stream-proxy-hop/techniques/abort-versus-unreachable.md).
That technique holds the streaming case and its detection order; this one
holds the general claim it is an instance of: that cancellation enters
the taxonomy as an attributed cause
([taxonomy-design](./taxonomy-design.md)), and that the attribution is
written by whoever stops the work.
