---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: bounded-collision-spin
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [a hit off the car's axis should turn it, cars spin out of control after a tap, deciding whether a vehicle needs a moment of inertia]
---

# Turn the hit into a bounded yaw kick, not a rotational solver

## The concern

An off-axis contact should turn the car. A full treatment gives each body a moment of
inertia and folds the lever arm into the impulse denominator, which is correct and almost
never what an arcade racer wants: it produces long spins, makes the result depend on a
shape constant nobody can tune by feel, and couples the linear and angular responses so a
change to one moves the other.

The arcade form is a yaw-rate kick. The lever arm is the cross product of the contact
offset from the car's centre with the contact normal; the kick is that arm times the
impulse the car just received, scaled by the car's inverse mass and by one authored spin
scale, then clamped to a ceiling in radians per second. Three things are authored on
purpose: the scale, the ceiling and the fact that the impulse is not changed by the
spin. That last point is the arcade approximation, and it means angular momentum and energy
are not conserved.

Status: the sign convention and the clamp are provable by test. The scale and the ceiling
are authored feel and have not been validated by a driver.

## Procedure

1. **Take the lever arm from the circle that touched, not from the car's centre.** The
   offset is that circle's world position relative to the car centre. A contact on the end
   circle has a long arm; a contact on the middle circle has none.
2. **Compute the kick from the impulse already applied to this car.** `kick = arm *
   impulse * invMass * scale`, signed by which side of the centre the contact lies on and
   by which body in the pair is being turned. Use each body's own inverse mass so the light
   car turns more.
3. **Add it to the car's yaw rate and clamp the result,** not the kick, to plus and minus
   the ceiling. Clamping after each contact stops several circle contacts in one step from
   stacking into a spin no single hit could cause.
4. **Gate by role when a body should not spin,** such as a static obstacle or a wrecked
   shell that should slide. Make the gate explicit in the spin step, not in the mass.
5. **Leave the decay to the handling model.** The contact writes the yaw rate; the handling
   model owns damping it and steering against it. This keeps one owner for how a car
   recovers.
6. **Assert three properties.** Signs: a hit on the right of the nose turns the car one way
   and on the left the other. Bound: the yaw rate never exceeds the ceiling after any
   number of contacts in a step. Scaling: a lighter car turns further for the same impulse.

## Decision rules

- **When a car spins for too long after a hit, lower the ceiling first,** then the scale.
  The ceiling bounds the worst case; the scale only shifts the average.
- **When a hit on the middle of the flank barely turns the car,** that is correct. Resist
  the urge to add a constant bias for readability; add a visible flash or a sound instead.
- **When the response must be physically plausible for a heavy truck,** raise the truck's
  mass rather than adding a per-class spin scale. One more per-class constant is a second
  authority over weight.
- **When wall hits and car hits must turn differently,** give them separate scales and name
  both. A shared scale tuned for one will be wrong for the other.
- **When spin could cross the line from effect to control loss,** state the ceiling in terms
  of the handling model's own recovery rate, because a ceiling the car cannot steer out of
  within a second removes the player's agency.

## When not to use this

- **Do not use it where rotation is a mechanic,** such as a spin-to-win or a rolling
  vehicle. Those need a conserving rotational model.
- **Do not use it with a full inertia tensor alongside it.** Two rotational authorities on
  one body produce rotation that depends on which ran last.
- **Do not describe the result as conserved or physical in a rule document.** It is an
  authored approximation, and a designer who reads it as conserving angular momentum will
  tune around a quantity that does not exist.
