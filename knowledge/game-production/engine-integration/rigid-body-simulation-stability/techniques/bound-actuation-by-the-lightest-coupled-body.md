---
layer: technique
type: technique
subject: rigid-body-simulation-stability
technique: bound-actuation-by-the-lightest-coupled-body
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [setting a drive's maximum force or a joint's maximum velocity, a light link that is thrown by a heavy one, large mass or inertia ratios across a joint or a contact, a hand-written correction term that overshoots into reversal]
---

# Bound actuation by the lightest coupled body

The named concern: clamp what an actuator may do from its specification, then check the
clamp against the body that will actually move. The defect this prevents is a drive whose
gain is sensible and whose force limit is infinite, so that the first large error is
converted into an acceleration the lightest body in the pair cannot survive and the contacts
cannot absorb.

## The procedure

1. **Take the limits from the actuator, not from the solver.** The maximum force or torque
   and the maximum speed come from the specification or from measurement of the real thing.
   Where a mechanism has one driven joint and several followers, the driven joint's limit is
   the sum of what it must supply to each follower, and the followers' own speed limits stay
   at their defaults: a follower with a too-low cap fights the joint that is driving it.
2. **Compute the acceleration the limit allows on the lightest body.** Divide the maximum
   force by the smaller of the two masses (for an angular joint, the torque by the smaller
   inertia), including the attached subtree. This is the worst-case acceleration, and it is
   the number to inspect, not the force.
3. **Convert it to what one step can do.** Velocity change in one step is acceleration times
   step; distance moved because of it is half acceleration times step squared. Compare that
   distance with the thinnest collision feature and the contact margin of the bodies
   involved, and the velocity change with the speed the mechanism is designed to reach. A force that moves a body
   by more than the margin in a single step has skipped the contact it was supposed to be
   resolved against.
4. **Clamp or reshape until the check passes.** Options, cheapest first: a lower force limit,
   a rate-limited target so that a target far from the current state does not produce a large
   force, feed-forward effort for gravity and inertia so that a lower gain tracks a target,
   and a joint-velocity cap generous enough not to bind in normal operation.

## Rules of thumb, with their status

Published tuning guidance gives two tests: a linear acceleration orders of magnitude beyond
gravity, and an angular acceleration that amounts to a full turn's worth of rate within a
single step, are bugs, not tuning. They are useful tripwires and have no derivation; treat
them as *what a failing scene tends to look like*, not as limits to design to. The derived
check in step three is the one to apply, because it states its basis (this body, this step,
this margin). A tripwire without a basis fails quietly when the scale changes: a scene in
centimetres, a mechanism a tenth the size, and an "orders of magnitude" threshold means
something else.

## Mass ratios are model defects

An impulse applied to a large mass and propagated to a small one produces a large velocity
on the small one. Large mass or inertia ratios across a joint or a contact make the solver
converge poorly, and every setting (iterations, step) only moves the symptom. Fix the model:
raise the light body's mass to a believable value, split the heavy body, or reduce the
heavy one's authority over the light one. Verify the masses and inertias of every link are
nonzero and reasonable by reading them from a recorded dump of the scene, not from the
authored values; an inertia silently computed from a bad collider can be far off.

Added joint inertia (see `spring-by-frequency-and-damping-ratio`) is the legitimate form of
the same fix when the physical actuator really has rotor inertia: it raises the effective
inertia of a light link and lowers the frequency of its drive.

## The same bug in a hand-written integrator

A correction, a friction force or a damping term in a hand-rolled integrator is the same
object as a drive: a force proportional to an error. When it is large relative to the
velocity that exists, it removes more velocity than there is in one step and reverses the
sign, and the body oscillates around zero at the step rate. The rule is identical:
**clamp the correction to what one step can absorb.** A lateral grip force applied to a
sliding body must not take the sideways speed past zero; the clamp is the sideways speed
divided by the step. This is why a correction clamped to the existing velocity cannot
reverse, regardless of how large the nominal coefficient is.

## Units

A joint's speed limit and its stiffness are authored in whatever unit the file format uses
for angles and read by the solver in another. A speed limit authored in degrees per second
and read as radians per second is a factor of fifty-seven; stiffness has the same factor
and its square for frequency. Every limit goes into the record with its unit and its basis
(`a-number-carries-its-unit-and-basis`) so that the check in step three is a calculation
and not a guess.

## When not to use it

Do not clamp force where the actuator is genuinely unbounded in the model (an ideal
kinematic mover) or where the clamp would block a behaviour the specification requires
(a gripper that must break a seal). Do not use the lightest body when the light body is
rigidly attached to a heavy one: use the subtree. And do not let a clamp substitute for a
model fix: a force limit that keeps a bad mass ratio from exploding has hidden the defect,
not removed it.
