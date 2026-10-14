---
layer: technique
type: technique
subject: rigid-body-simulation-stability
technique: instability-triage-by-stiffness-source
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [a simulation is unstable and several tuning guides disagree about which lever comes first, deciding between a shorter step and more solver iterations, a mechanism that jitters or penetrates after a change, an instability that appears only sometimes]
---

# Instability triage by stiffness source

The named concern: decide which of two instabilities you have before spending any lever,
because the cheapest fixes for them are in opposite order. The defect this prevents is the
reflex of shortening the step for a contact problem (expensive and mostly useless) or of
widening a contact margin for a drive problem (free and mostly useless).

## The discriminator

**Stiffness-limited** instability tracks a drive, a coupled joint or a closed loop. It
appears when a gain is raised, when a mechanism is made more complex, or when a loop is
closed; it grows as a runaway oscillation; reducing the gain makes it disappear. Its
signature is a joint whose position or velocity diverges without any contact being involved.

**Contact-limited** instability shows as penetration, jitter or tunnelling. It appears at
the moment of contact, depends on the masses and speeds of the bodies involved, and does not
change when a drive gain changes. Its signature is a pair of colliders occupying the same
space, or a body that passes through a thin one.

When both are present, split the scene: a mechanism that is stable with its contacts
disabled is a contact problem; one that is unstable with them disabled is a stiffness
problem. Fix the stiffness one first, since contacts on an oscillating mechanism cannot be
judged.

## The order for each

**Stiffness-limited: shorten the step first.** The step is the only term in the stability
bound that is not a property of the model. Shorten it until the instability is gone, then
reduce the solver's iteration count to the lowest value that still holds at that shorter
step: a smaller step with fewer iterations generally beats a larger step with more, because
shrinking the step improves every approximation at once and iterating improves only
convergence within a step. Published solver comparisons and the practice of sub-stepping
agree on the direction. The cost of a shorter step is paid by the whole scene, so first
confirm the frequency really is the source (`spring-by-frequency-and-damping-ratio`), and
prefer to lower the frequency (by a lighter gain, added joint inertia, bounded force) if the
physical model allows.

**Contact-limited: the cheap levers first, the step last.** In rough order of cost:
- give the contact room: a wider contact margin, so the solver reacts before overlap, at some
  cost in detection time;
- cover fast movers by extending the margin with velocity, or by a swept test;
- fix masses: very light bodies, or large mass ratios between bodies in contact, converge
  poorly, and this is a model defect before it is a setting (`bound-actuation-by-the-lightest-coupled-body`);
- cap the correction speed: a lower maximum separation velocity trades a slower recovery
  for no overshoot;
- raise the solver's position iterations for the bodies involved;
- raise friction within physically plausible values, so bodies come to rest;
- only then shorten the step.

Never start overlapped. Two shapes that overlap at the first step are separated by a strong
correction, and the resulting motion is mistaken for an instability. Place them apart and
check the first step's contacts.

## The exit condition

You are done when the instability is gone at the **cheapest configuration that holds**: the
largest step and the lowest iteration count at which a reproducible scene still behaves.
Record the starting values before the first change. This is the half of the rule that
protects performance: a configuration that is stable at twice the necessary cost is a
configuration that will be paid for every frame.

## The scene must be reproducible

Both branches are judged by whether the instability disappears. An **intermittent** case
gives no signal: a change that "fixed" it may simply have hit a good run. Do not tune an
intermittent failure. Build a scene that fails every time (the minimal mechanism plus the
object, the fixed seed, the identical initial poses), or record the contacts of a failing
run and replay the state. Until it fails on demand the correct entry in the log is
*not measured*, never *fixed*.

## Where the guides appear to disagree

One operating guide says to shorten the step first and then trim iterations; another says
the step is the last lever. Read together they are consistent: the first is written for
articulated mechanisms and loops, where stiffness dominates, the second for free contacts,
where it does not. A practitioner who quotes one without the discriminator will apply it
to the wrong failure.

## When not to use it

Do not triage a scene that mixes a dozen independent faults; split it first. Do not use the
step-first rule where the step is externally fixed (a networked or replayed simulation):
there, lower the frequency or the force instead. And do not use the contact ladder for a
scene where the geometry itself is wrong (a hole in a collision mesh, a thin shell below the
detection grid): the symptom is contact-shaped and no lever on the list repairs it.
