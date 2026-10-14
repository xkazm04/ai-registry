---
layer: golden-path
type: golden-path
subject: rigid-body-simulation-stability
status: forged
use_when: [a simulated mechanism (arm, ragdoll, chassis, gripper) jitters, explodes or tunnels after a tuning change, choosing between a smaller step and more solver iterations, authoring a spring or drive for a constraint-based simulation, running many cloned copies of one scene in parallel]
techniques:
  - spring-by-frequency-and-damping-ratio
  - instability-triage-by-stiffness-source
  - bound-actuation-by-the-lightest-coupled-body
  - replicated-environments-share-unbounded-geometry
  - filter-the-pair-after-proving-the-class
---

# Rigid-body simulation stability

A gripper closes on a box and the box leaves the scene at the speed of a thrown brick. A
ragdoll lands and its knees vibrate until they separate. A vehicle chassis settles on its
springs and then, one frame later, is on the roof. These look like one failure, and the
usual response treats them as one: raise a number until it stops. Sometimes that works,
which is exactly what makes the habit durable and expensive. The subject here is what
stands between a constraint-based simulation and those failures while someone is tuning it:
knowing which kind of stiffness is misbehaving, spending the cheap lever that fits that
kind, and deriving the numbers from the mechanism instead of from the last value that
happened to survive.

## Two instabilities that look the same

A simulated mechanism goes unstable for one of two reasons, and the screen does not say
which.

The first is a **stiff constraint integrated at a step too coarse for its frequency**. A
drive, a coupled joint, a closed kinematic loop or a spring is an oscillator with a natural
frequency set by its stiffness and the mass it moves. The solver advances it in discrete
steps. When the step is long compared with the oscillation period, the solver does not
follow the oscillation; it overshoots, the next step overshoots the overshoot, and energy
enters the system every step. The mechanism is not wrong, the pair of numbers (stiffness,
step) is.

The second is a **contact resolved with too little room, mass or iteration**. Two bodies
interpenetrate because they started overlapped, because one moved further in a step than
the other is thick, or because the solver did not converge on a stack with a punishing mass
ratio. The correction is a velocity that pushes them apart, and if that velocity is large
the result is a launch rather than a rest.

They have different cheapest fixes, and the fixes are in nearly opposite order. A stiffness
problem is cured first by shortening the step, because the step is the only quantity in the
bound that is not a property of the model. A contact problem is cured first by giving the
contact more room, more mass or a gentler correction, because the step is the most
expensive lever and the contact levers are nearly free. Operating guides for the same
engine can therefore appear to contradict one another, each saying a different lever comes
first. They are answering different instabilities. `instability-triage-by-stiffness-source`
is the discriminator that tells a practitioner which guide applies.

## Stiffness is a frequency, and a frequency has a unit

The first load-bearing distinction is that a stiffness value copied between joints is
meaningless. A spring's stiffness only means something against the mass it moves: the same
number is a lazy wobble on a heavy limb and a violent buzz on a light fingertip. The
quantity that transfers is the pair (natural frequency, damping ratio), because the first
says how fast the thing responds and the second says whether it overshoots, and neither
depends on a particular mass once the mass is accounted for. Authoring springs and drives
that way, with the lightest mass or inertia the constraint couples, makes the stability
question a comparison of two things with the same unit: the frequency, and the rate at
which the scene steps.

That comparison has two regimes, and conflating them is the commonest error in the topic.
With an explicit or semi-implicit step, the product of step and frequency is a **stability
bound**: past roughly a quarter of an oscillation period per step the integration diverges.
With an implicit or exact discretization the product is **not** a bound, because the
integrator is stable at any step; but the force the spring actually delivers is no longer
the force the stiffness promised. Past the bound the response saturates and then falls, so
raising stiffness further makes the mechanism weaker, not stronger. "It no longer explodes"
is therefore not evidence that it is tuned. `spring-by-frequency-and-damping-ratio`
carries the procedure and the measured case.

## The step is part of the model

The second distinction follows from the first. An unconditionally stable integrator buys
stability. It does not buy accuracy, and the two get confused because the failure that
stability prevents is loud and the failure that remains is silent. A trajectory integrated
exactly in form at a coarse step is finite, smooth and wrong by an amount that grows
linearly with the step. A fixed step is therefore part of the model; changing it changes
the answer, and a variable step needs a convergence check against a fine reference, not a
stability check. This is why "make it stable at any rate" is a weaker claim than it sounds
and why a test written to prove stability across rates must also assert a tolerance on the
result.

## Force is the other half of stiffness

A stiff drive that cannot be integrated is a problem. A stiff drive that can be integrated
but is allowed to produce any force it likes is a second problem: it hurls a light link
past a heavy one and transfers an impulse the contacts cannot absorb. Actuation has to be
bounded from the actuator's specification, and the bound has to be checked against the
lightest body in the coupled pair including whatever is attached below it, because that is
the body that accelerates. `bound-actuation-by-the-lightest-coupled-body` states the check,
and the same rule applies to a hand-written correction term: a force that can remove more
velocity than exists in one step overshoots into reversal, exactly as a real drive does. Large
mass or inertia ratios across a joint or a contact are a defect in the model and are fixed
there; no solver setting repairs a ratio, it only postpones its symptom.

## Scope: cloned scenes and self-contact

Two further failure sources are structural and are found by reading the scene, not by
tuning. When one scene is cloned many times to train or test in parallel, any unbounded
collider (an infinite ground, a half-space) copied with it overlaps every other copy, so the
contact work grows with the square of the copy count and a profiler reports the solver as
the culprit. `replicated-environments-share-unbounded-geometry` says what to do with the
ground. And a jointed mechanism can collide with itself between links that share no joint;
the joint already excludes adjacent links, so the colliding pair is always a non-adjacent
one, and `filter-the-pair-after-proving-the-class` states how to find it without leaving
the model blind to a contact it needs.

## What the naive reading gets wrong

The naive reading is that stability is a setting. It is a relationship between four things
that must be read together: the stiffness of the constraints, the mass they couple, the step
at which they are integrated, and the force they are allowed to apply. Changing one without
re-deriving its dependants is the characteristic mistake: raise stiffness and leave the
damping, and the damping ratio has silently fallen; change the step and leave the
iteration count, and the cost has risen for no gain; copy a gain from a heavy joint to a
light one, and the frequency has risen a hundredfold.

The second naive reading is that a mechanism that stopped blowing up is finished. It is
finished only when it meets the specification it was tuned to: the closing time it was
supposed to have, the load it was supposed to hold, no visible penetration, no jitter. The
procedure is to build a minimal scene, derive the parameters, verify against the
specification, and only then fine-tune one parameter at a time, re-deriving the ones that
depend on it. Tuning by eye on the full scene produces numbers nobody can reproduce and a
reason nobody remembers.

The third is treating an intermittent failure as a tuning target. A failure that appears one
run in five gives no signal about whether a change helped; the only honest move is to
construct a scene that reproduces it, and until then to leave the parameters alone.

## Numbers that do not transfer

Every engine ships defaults: a step rate, solver iteration counts, contact buffer sizes,
distance-field resolutions. They are dated and specific to a release and a typical scene.
This subject does not state any of them as a rule and a reader should not import one. What
transfers is the relationship (frequency against step, force against the lightest body,
iterations against step) and the habit of recording the current setting before changing it,
so that a change is always an experiment with a baseline. Angular quantities deserve the
same care as any other number: a drive authored in degrees and read in radians is a factor
of fifty-seven, and the first symptom is a mechanism that is either dead or violent.

## Boundaries

This subject starts after the order of a step is fixed. Which state is read and which is
written, and in what sequence participants run, belongs to `gameplay-runtime-patterns`
(`update-order-and-frame-coherence`); a reader choosing between the two asks whether the
result depends on visiting order (that subject) or on stiffness, mass and step (this one).
Arcade vehicle feel (steering curves, drift state machines, grip ladders) belongs to
`racing-vehicles`, whose subjects tune a hand-written model for feel, not a solver; where a
model integrates its own lags, this subject contributes only the discretization rule, and the
decision of how it should feel stays there. Bounded collision spin and ram energy belong to
`mass-based-arcade-collision`. The per-frame cost of a hot path is owned by
`perf-regression-gating` and `render-submission-economy`; this subject spends cost only to
buy stability and says what it buys. Each of those names a different question about the
same moving bodies, and a document that answers one should not be stretched to answer the
others.

## When none of this applies

A game whose physics is a position update with a clamp has no solver to tune, and the
two-instability triage collapses to the question of whether the clamp is correct. A
simulation that is never coupled to anything stiff (a free projectile, a particle effect)
has nothing to be stiff about. And a mechanism that is stable at its authored step but
unreproducible between runs has a determinism problem, not a stability problem, and wants
a different instrument.
