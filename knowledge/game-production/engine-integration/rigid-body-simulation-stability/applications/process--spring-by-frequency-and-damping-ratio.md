---
layer: application
type: application
subject: rigid-body-simulation-stability
technique: spring-by-frequency-and-damping-ratio
stack: process
status: forged
verified_on: 2026-10-14
---

# Tuning a gripper closing on a load, as a procedure

This is the human-workflow realization of `spring-by-frequency-and-damping-ratio` for one
mechanism: a two-finger gripper with a single driven joint and five followers. It was read
in the operating guides of the physics SDK at commit 6dc53585d7db07346f53d0598a5fd3bfdce47d8d
on 2026-10-14, anchors relative to that tree. The guide labels its own estimates
"deliberately crude" (ovphysx/docs/guides/gripper_tuning.md:9 "establish a value *range*");
the figures below are illustrations of the order of operations, not values to reuse.

## The order of operations

1. **Build the minimal scene.** The gripper plus one object, nothing else
   (ovphysx/docs/guides/gripper_tuning.md:19 "Tune with minimal scenes"). Cover a primitive at
   two thicknesses, one thin-walled shape and the hardest object the application needs.
2. **Gravity off, then on, then lift.** Close with the object weightless and watch for
   instability or penetration; enable gravity and check the grip holds; then apply a lifting
   force. Each stage isolates a different failure: the first is stiffness, the second is
   contact and friction, the third is force margin.
3. **Set limits from the specification before gains.** Required grip force from load and
   friction (ovphysx/docs/guides/gripper_tuning.md:57 "holds a 5 kg box at friction
   coefficient 0.3"), then torque from the lever arm, rounded up, then summed over the
   joints the one drive moves (ovphysx/docs/guides/gripper_tuning.md:65 "Round up to 4 Nm
   per joint"). Joint speed from the specified finger speed and travel; followers keep the
   default speed limit (ovphysx/docs/guides/gripper_tuning.md:80 "Generally do **not** set max
   joint velocity on the mimic joints").
4. **Derive stiffness from force at the smallest error that matters.** The guide takes the
   force limit divided by a five-degree error expressed in radians
   (ovphysx/docs/guides/gripper_tuning.md:104 "~0.087 rad") and notes the unit trap: the
   solver reads angles in radians and the authoring format in degrees
   (ovphysx/docs/guides/gripper_tuning.md:12 "PhysX uses radians").
5. **Read the frequency against the lightest link,** using the parallel-axis term for the
   offset mass (ovphysx/docs/guides/gripper_tuning.md:93 "lighter link's inertia about the
   rotation axis"). The asset's original stiffness was several times past the step rate even
   counting iterations as steps; the derived one was still high.
6. **Reach for reflected inertia, not a smaller gain.** Derive armature from the motor
   datasheet as rotor inertia times gear ratio squared
   (ovphysx/docs/guides/gripper_tuning.md:136 "armature = i_m * G^2") and check that the
   spec supports the size.
7. **Verify against the specification.** Open-to-close time near the spec; maximum rated
   load held across finger states; no penetration measured on the collision shapes, not the
   visuals; no jitter.
8. **Fine-tune one parameter and re-derive its dependants.** Lower stiffness or force while
   the load still holds; when stiffness changes, recompute damping
   (ovphysx/docs/guides/gripper_tuning.md:157 "re-derive damping when you change stiffness").
   Persisting instability: more position iterations, a shorter step, or more armature, in
   the order `instability-triage-by-stiffness-source` gives. Finish the gripper before
   simulating the whole robot.

## Where the procedure and the guide differ

The guide asserts that past the natural-frequency match the implicit spring delivers *less*
force as stiffness rises and that extra damping "applies almost no damping"
(ovphysx/docs/guides/gripper_tuning.md:116 "PhysX uses an implicit spring formulation"). A
published derivation of the implicit update gives a force that rises with stiffness to a
ceiling and does not fall, so the technique records a saturation, not a fall. The practical
instruction (keep the natural frequency near what the step can follow) is unchanged.

Compliance on the followers is added late: start non-compliant, add compliance only when
competing hard constraints cannot be met, and author it in frequency and ratio, not in
copied drive gains (ovphysx/docs/guides/gripper_tuning.md:143 "Start with non-compliant mimic").
