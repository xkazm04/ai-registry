---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: measurement-settle-budget
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [a per-frame sampler is running for the whole session, deciding when a capability probe is allowed to stop, an idle profile shows work with nothing on screen]
---

# Measurement settle budget

The probe has a deadline. When the deadline passes, the sampler
unsubscribes from the clock, releases its buffer, and does not run again
for the rest of the session. This is
[creation naming its reaper](../../../../_laws.md#creation-names-reaper) applied to
a measurement: the loop states, at the moment it is started, both the
condition and the wall-clock time at which it stops.

## Why a permanent probe is the wrong answer

The instinct is to keep measuring, because the device genuinely does change
mid-session. The instinct is wrong for two reasons, and the first is
structural.

**A permanent measurement is a permanent cost, paid by the device that can
least afford it.** A per-frame callback, an array write, a periodic sort or
percentile pass — small, and small forever, on every frame, on the slowest
machine in the fleet. A system that spends a fraction of a millisecond per
frame determining whether the device can spare a fraction of a millisecond
per frame has become its own answer. That is not a rhetorical point: on the
floor tier, once the effects have been reduced to almost nothing, the probe
can genuinely be the largest thing the fidelity system contributes to the
frame, which means the adaptation has outlived everything it was adapting.

**The information decays.** The first few windows carry nearly all of the
signal; the hundredth window on a settled device says what the third one
said. Continuing to pay for a signal that has stopped changing is the
definition of an unbudgeted background cost, and background costs are
invisible in exactly the profile where someone would look for them, because
they are spread evenly across every frame rather than concentrated in one.

## The stopping rule

Two conditions, and the deadline is the one that must be unconditional.

1. **Stability.** The tier has not changed for the last few consecutive
   windows. This is the ordinary way a probe ends: the device settled, the
   answer is known, stop asking.
2. **A wall-clock deadline from the first sample.** Not a window count — a
   duration, and one long enough to comfortably span the application's
   early load and its first real interaction. When it expires, the probe
   stops *whether or not* the tier ever settled.

The unconditional deadline exists for the pathological case, and the
pathological case is the one that matters. A device flapping on a boundary
never produces a stable run, so a probe that stops only on stability runs
forever on exactly the machine with no headroom for it. When the deadline
fires on an unsettled tier, resolve to the **lower** of the tiers it has
been flapping between and stop. A device that could not hold the richer
tier reliably could not hold it, and the plainer page is the honest
outcome; the alternative is a permanent probe plus a permanent pulse.

The stop must be a real teardown, not a flag. Cancel the clock
subscription, drop the sample buffer, clear the timer that would have fired
the deadline, and let the surrounding state be garbage. A "stopped" probe
that still holds a per-frame callback which returns early has kept the
wake-up, which was most of the cost.

## Re-arming, without polling

The legitimate objection — the device really does change, when it heats up,
when a video call starts, when the battery saver engages — is answered by
event-shaped re-arming rather than by continuous measurement. The
distinction is the whole point: **an event costs nothing until it
happens; a poll costs something always.**

Reasonable triggers, all of them things the application already knows:

- **Returning to the foreground after a long absence.** Long enough that
  the machine's situation plausibly changed — minutes, not seconds. A
  re-arm on every tab switch is a poll with extra steps.
- **Entering a materially heavier view.** The measured verdict was about
  the workload that was on screen; a route with ten times the effect count
  is a different question, and it is fair to ask it again.
- **An explicit user action that changes the workload** — turning an
  optional visual feature on, opening a dense view, starting a playback
  surface.

Each re-arm starts a **fresh settle budget with its own deadline**, and the
same stopping rule applies. A re-arm is not a return to permanent
measurement; it is one more bounded probe. And re-arms are themselves
budgeted: if the tier has been re-measured several times in a session and
landed on the same answer every time, stop re-arming. The device has told
you what it is.

## The counter-argument, stated fairly

There is a class of application — a long-lived surface someone leaves open
for hours while the machine's situation drifts underneath it — where a
settled probe will be wrong for most of the session. That case is real, and
the answer is still not a permanent per-frame sampler; it is a *sparse*
one. Sample one short window every few minutes rather than every frame
continuously, accept that the response to a change is minutes rather than
seconds, and keep the amortised cost near zero. State the choice explicitly
where the budget is defined, because a sparse re-probe is a different
system from a settled one and the difference should be a decision somebody
made rather than a loop somebody forgot to stop.

## When not to use this

If the probe is genuinely free — a signal the platform already computes and
publishes, which the application merely reads on a timer — there is nothing
to settle and the budget is ceremony. The technique is about a measurement
the application is paying for itself. It also does not apply when there is
no probe at all, which is the correct state under an explicit user
preference
([preference-short-circuits-measurement](./preference-short-circuits-measurement.md)).
