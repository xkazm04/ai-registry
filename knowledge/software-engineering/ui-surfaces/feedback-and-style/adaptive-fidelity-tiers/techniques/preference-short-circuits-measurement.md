---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: preference-short-circuits-measurement
status: forged
laws: []
shared_with: []
use_when: [wiring a capability probe into a surface that also honours a reduced-motion preference, the product offers its own quality setting, deciding whether a measurement should run for a user who asked for less]
---

# Preference short-circuits measurement

When the user has expressed an explicit preference for less — the
platform's reduced-motion setting, or a quality control the product offers
directly — **the probe does not run**. No idle request, no timer, no clock
subscription, no windows, no transitions. The tier resolves immediately to
the value the preference implies and stays there for as long as the
preference holds.

This technique is about the *measurement*, not about the preference. How
the preference is read, propagated, and honoured by individual gestures —
per-gesture fallbacks, the trap of a global reset — belongs to the motion
system and is not restated here. The only claim made here is that an
expressed preference ends the measurement's job before it starts.

## Three reasons, and the third is the one that gets missed

**There is nothing left to budget for.** The expensive effects are already
reduced or off by the preference. A measurement whose answer cannot change
what is rendered is pure cost with no output — the purest form of waste
available in a rendering system.

**The probe would then be the largest thing left.** This follows from the
first and is worse than it sounds. Having removed the ambient layers, the
particles and the parallax, the per-frame sampler is no longer a rounding
error against the effects; it can genuinely be the biggest per-frame
contribution the fidelity system makes. The adaptation outlives everything
it was adapting, on a surface that was supposed to have become calmer and
cheaper.

**The user asked for less, not to be profiled.** An accessibility
preference is a request, and responding to it by starting a
device-performance measurement is a response nobody asked for. Frame-timing
capability profiling is, in aggregate, a fingerprinting surface — it
distinguishes devices — and collecting it from a user who has just narrowed
what they want the page to do is precisely the wrong instinct. The general
rule is worth stating on its own: **measure only when the measurement will
change what you render.** Every capability signal collected past that point
is a signal collected for its own sake.

## The short-circuit goes before the scheduling

Placement is the whole implementation. The branch belongs at the top of the
component that owns the tier, before any scheduling happens — not as a
check inside the sampler, and not as a filter on the sampler's output.

A check inside the sampler still pays the idle request, the timer, the
clock subscription and the teardown; it only skips the arithmetic, which
was never the expensive part. It is also the check that gets relocated
during a refactor, because it reads as a guard rather than as the thing
that decides whether the machinery exists. Structurally: **the preference
decides whether the probe is created**, and a reader should be able to see
that from the shape of the code without following a branch into a loop.

## The preference is live, and so is the short-circuit

Preferences change mid-session — a user toggles the system setting, or
flips the product's own control while looking at the surface. Both
directions must work:

- **Preference turns on:** tear the probe down completely — cancel the
  subscription, clear the deadline timer, drop the buffer — and publish the
  preference's tier. A probe that keeps running behind a preference is the
  cost this technique exists to remove.
- **Preference turns off:** the probe may now be created, with a fresh
  settle budget and its own deadline
  ([measurement-settle-budget](./measurement-settle-budget.md)). Not a
  resumption of an old measurement: the tier that was in effect was chosen
  by the preference, not measured, and the previous samples are about a
  workload that no longer exists.

## An explicit quality setting outranks the measurement entirely

If the product offers users a fidelity control of its own, the same rule
applies with more force, and in both directions. A user who chose the low
setting gets the low setting and no probe. A user who chose the high
setting gets the high setting and no probe — including on a device the
measurement would have demoted, because they asked, and a system that
overrides a stated choice on the grounds that it measured something is a
system that will be described as ignoring its own settings.

The framing that keeps this coherent: **a measured tier is a default for
people who have not said what they want.** It is the best available guess
in the absence of a statement, and every statement retires it. Which also
means the control, if it exists, needs a genuine way **back** to the
measured default, rather than making the first use of the control a
permanent exit from the adaptive system.

That requirement does not, however, oblige the control to show a third
"automatic" option, and reaching for one first is the common mistake. The
way back can be a property of the *write* rather than a visible state: a
two-state control stores the user's target only when it differs from what
the system currently resolves to, and **deletes** the stored value when the
target and the resolved value coincide — so pressing back to the automatic
value is the same single gesture as pressing away from it, and the absence
of a stored row is what "automatic" means. The full rule, including the two
ways this silently corrupts (writing unconditionally, which pins a tier that
was merely following; and tidying the stored value away when the source
moves, which makes pinning unachievable) belongs to the settings store and
is [inherited-default-override](../../../../operations/governance-and-records/settings/techniques/inherited-default-override.md).

One caution is specific to this subject and does not apply there. That
technique's source is a *setting the application reads*; here the source is
a **measurement the application performs**, which can be re-run and can
return a different answer for reasons that have nothing to do with the
user's environment. A measurement is therefore disqualified twice over as a
trigger for re-evaluating a stored choice: not only must the comparison
happen at user interaction only, but a fresh probe result must never be
treated as evidence that a stored preference has become redundant.

## When not to use this

There is a narrow case where the preference does not end the measurement:
when the reduced configuration is *itself* expensive enough to be worth
budgeting — a data visualisation whose point count dominates, where
removing motion changes nothing about the cost. There, the preference has
not made the measurement pointless, and the probe may run. The test is the
one stated above and it is the only test: if the measurement's result can
still change what is rendered, it is measurement; if it cannot, it is
collection.
