---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: behavioural-discriminators-over-symbolic-pass
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [choosing what a behavioural assertion measures, a boolean check passes while the behaviour is wrong, calibrating a threshold for a runtime gate]
---

# Behavioural discriminators over symbolic pass

The concern: what a behavioural assertion is allowed to be *about*. A symbolic pass is any
assertion whose subject is a claim the system made about itself — a returned success code,
a boolean flag on a component, a log line saying the test passed. A **discriminator** is a
measured continuous quantity whose value separates the state you want from the state you
fear. This technique is the discipline of building the second and refusing the first.

## Why the boolean is not enough

The failure is not that booleans lie. It is that the boolean and the defect are answers to
different questions. "Is an animation active?" is true both for a figure that is walking
and for a figure frozen in its reference pose while an animation ticks over it. No amount
of asking harder gets a different answer, because the system genuinely does not model the
distinction you care about.

The continuous quantity does. Sample a pose quantity that varies through a motion cycle —
a limb's droop angle, the vertical oscillation of the root — several times across the run,
and take its **variance**. The animating figure's value wanders through a wide arc; the
reference-posed figure's is flat to within measurement noise. One number, sampled a handful
of times, sees what an unlimited number of structural checks cannot.

## Procedure

**1. Name the two states you must tell apart.** Not "does it work" — "an animating figure
versus one stuck in reference pose", "a subject that moved versus one that slid without
locomotion", "a capability that fired versus one that resolved to nothing". Discriminators
are always binary discriminations between two concrete, previously-observed states.

**2. Find a quantity that differs between them and is already emitted, or make it emitted.**
Prefer quantities the runtime already produces for its own purposes; they are cheap and
they are real. Where you must add emission, add a scalar per sample, not a derived verdict
— the sample stream is the evidence, and downstream consumers you have not met yet will
want to re-derive from it.

**3. Calibrate on both states before you pick a threshold.** Run the known-good case and
the known-bad case, several times each, and look at the two distributions. Site the
threshold in the gap. Record what you ran, and what you saw, next to the number — a
threshold whose basis is not recorded gets edited by whoever it inconveniences.

**4. Express the assertion as a named kind with an overridable default.** A small closed
vocabulary of assertion kinds — displaced by at least *d*; peak speed at least *v*; vertical
rise at least *h*; pose swing at least *θ*; pose swing at most *θ* (the deliberate
"should be still" case); a resource pool dropped by at least *Δ*; the sequence played — each
carrying a calibrated default that a specific scenario may raise. Closed vocabularies are
what let a reader of a result understand it without reading the harness.

**5. Assert a delta against a same-run baseline, never against a hardcoded expectation.**
Compare the post-act reading to the pre-act snapshot from the same run. Comparing to a
constant cannot separate "the act did something" from "the world already looked like that".

**6. Disambiguate the negative.** This is the step most harnesses skip, and it is where the
real time goes. When an assertion fails, the harness usually cannot say *why*, and the two
or three candidate causes demand completely different fixes. Add a cheap sampled fact that
splits them. The canonical example: when a named capability is activated and nothing
happens, emit whether the requested identifier was even *found* on the subject before
activation. "The identifier does not exist — probably a naming or casing error" and "it ran
and produced no observable effect — a real behavioural defect" are otherwise identical
readings, and conflating them costs an investigation every time.

## Decision rules

- When a system offers a boolean that would answer your question, use it as an *input* to
  the verdict and label it self-reported. It never becomes the verdict on its own.
- When a discriminator's two distributions overlap after calibration, the discriminator is
  wrong — pick a different quantity rather than a braver threshold. An overlapping
  discriminator produces confident wrong answers, which is worse than no gate.
- When a threshold has no recorded calibration, treat the assertion as unmeasured until it
  does. A number with no basis is not information.
- When you add a new sampled field to the stream, make it optional and let the verdict
  degrade gracefully to the older, weaker check when it is absent. Observation emitters and
  observation consumers deploy on different clocks, and a required new field turns every
  older run into a false failure.
- When one sample would do, take several anyway if the quantity is time-varying. Variance
  is the discriminator; a single reading has none.

## When not to use

Do not build a discriminator for a property that is genuinely declarative. Whether a
reference resolves is a structural question and a boolean is the correct instrument; forcing
a continuous measurement onto it adds noise and cost for nothing.

Do not reach for a discriminator when the cheap mechanical check already decides. If a
captured frame is measurably empty, that is a failure on its own and needs no judgement —
save the expensive interpretation for the cases the cheap check cannot resolve.
