---
layer: technique
type: technique
subject: rigid-body-simulation-stability
technique: spring-by-frequency-and-damping-ratio
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [authoring or reviewing a spring, drive or compliant joint, a gain copied from one joint to another, a mechanism that stopped exploding but got weaker, choosing a fixed or a variable step for a hand-written integrator]
---

# Spring by frequency and damping ratio

The named concern: author every spring-damper as a natural frequency and a damping ratio
computed from the lightest mass it couples, derive stiffness from the force you need, and
compare the frequency with the step before anything runs. The defect this prevents is a
stiffness that was copied, scaled by tens until the scene stopped blowing up, and left in a
regime where it neither explodes nor works.

## The procedure

1. **Name the lightest coupled mass.** For a linear constraint it is the smaller body of the
   pair; for an angular one it is the smaller inertia about the axis, taking the whole
   attached subtree (the parallel-axis term is easy to forget and is not small for an
   offset limb). The lightest value is the conservative one, because frequency rises as
   mass falls.
2. **Fix the force first.** From the actuator specification or the load to hold (weight
   divided by friction for a grip, then divided across the contacts and multiplied by the lever arm
   for a joint torque), choose the maximum force. Everything else is derived from it.
3. **Derive stiffness from that force at the smallest error you care about.** Stiffness is
   force divided by the error at which the force should saturate. This is the step that
   replaces guessing; it also makes the number answer a design question ("at what error does
   the drive reach full force") instead of an engine question.
4. **Read the frequency it implies.** Frequency is the square root of stiffness over the
   mass, in radians per second. Convert once, state the unit, and never mix it with cycles
   per second: the two differ by a factor of about six and the confusion is silent.
5. **Compare step times frequency with one.** What the comparison means depends on the
   discretization (below).
6. **Derive damping from a ratio.** Damping equals the ratio times twice the square root of
   stiffness times mass. A ratio of one is critical, the usual starting point; beyond it the
   approach is steady and sluggish. Whenever stiffness changes, re-derive damping, because the
   ratio falls when stiffness rises and the mechanism starts ringing without anyone having
   touched the damping field.
7. **Verify against the specification, not against calm.** The mechanism must meet the
   time and load it was derived for; a gentle-looking scene that no longer lifts the load
   is a failed tuning.

## Two regimes for the product

With an explicit or semi-implicit step, step times frequency is a **stability bound**.
Published treatments put the safe limit at no fewer than about four steps per oscillation
period, which for a frequency in radians per second is a product of roughly one and a half
at the edge. Treat one as the planning ceiling and the product of one-and-a-half as the
place it will already be failing. Below the ceiling, nothing else is needed.

With an implicit or exact discretization the product is **not a bound**; the integrator is
stable at any step. It is, however, a **saturation threshold**. For an implicit step the
effective stiffness the mechanism feels is the nominal stiffness divided by one plus the
square of the product (plus a damping term). Solving the one-step implicit update shows the
delivered force rising with stiffness only until it reaches a ceiling set by the mass, the
error and the step (mass times error over step squared); beyond that, more stiffness adds
nothing. Some authors report the delivered force actually falling as stiffness keeps rising;
that depends on how the solver folds the spring into its constraint formulation and is not
a property to rely on either way. The practical consequences are two. Raising stiffness to
fix a weak mechanism does not strengthen it, and at best wastes the effort. And an implicit
step absorbs energy that grows with the step, so a mechanism well past the threshold looks
stable because it is over-damped by the integrator, not because it is tuned. A reader who
mistakes the stable behaviour for a tuned one will keep raising stiffness and see the
response stop improving. Extra damping past the threshold is likewise not a lever: the
integrator is already supplying more than the authored ratio.

## When the frequency is too high

Three remedies, in this order. First, lower the force requirement: a lower maximum force
with a larger saturation error gives a lower stiffness for the same behaviour. Second, add
reflected inertia where the physical model justifies it: a geared rotor adds its own
inertia multiplied by the gear ratio squared to the joint, which lowers the frequency
without lowering the gain, and which is a real property of a real actuator. A large relative
change in joint-space inertia changes the model, so the spec for the motor and the ratio must
support it; it is not a free parameter. Third, raise the step rate or the iteration
count, which are the expensive levers (`instability-triage-by-stiffness-source` orders them).
Reducing the gain to "fix" a frequency is the last resort, because it changes what the
mechanism does.

## Compliant constraints take the same pair

A compliance added to a coupled joint (a joint that follows another, a loop closure) is
authored in frequency and damping ratio too, and **not** with the drive's stiffness and
damping copied across: the two parameter sets have different units and different masses.
Start with the rigid version; add compliance only when competing hard constraints cannot be
satisfied together; and sometimes more joint inertia removes the need.

## The step is part of the model

A discretization that is exact for a first-order lag (the lag state is moved by one minus
the exponential of the negative step over the time constant, not by step over time
constant) has no stability bound at all, and a correction clamped to the velocity that
exists cannot reverse. It would be easy to conclude that the step no longer matters. The
measurement below says otherwise: the same cornering input integrated at five rates against a
fine-rate reference stays finite at every rate and drifts from the reference by an error
that is first order in the step, roughly three times larger for each tripling.

| step | heading error (rad) | slip error (rad) | position error (m) |
| --- | --- | --- | --- |
| 120 Hz | -0.0046 | -0.0015 | 0.256 |
| 60 Hz | -0.0137 | -0.0044 | 0.766 |
| 30 Hz | -0.0316 | -0.0105 | 1.768 |
| 20 Hz | -0.0490 | -0.0168 | 2.750 |
| 15 Hz | -0.0659 | -0.0233 | 3.706 |

The decision rule is that an exact or implicit discretization buys stability, not
accuracy. A fixed step is then part of the model and is chosen once and recorded. A
variable step needs a **convergence check** (the same input at two rates, an error
tolerance on the result), not a stability check. A test that only runs straight-line input
cannot see an error that lives on the turning path; the check must exercise the axis that
carries the error.

## When not to use it

Do not derive frequencies for a constraint that is rigid by design; there is nothing to
compare. Do not use the lightest-mass rule for a spring whose participants are never
simultaneously light (a heavy body on a rigid static support has only one mass). And do not
read the saturation threshold as a tuning target: the aim is a stiffness that delivers the
force the specification needs at a frequency the step can follow, not one that sits exactly
at a boundary.
