---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: wall-tangent-retention-versus-head-on-loss
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a car meets a track boundary, glancing and head-on hits must cost different amounts, wall damage must scale with impact]
---

# Let a glance keep its speed and a head-on hit lose it

## The concern

A boundary is a wall of infinite mass, so the only question is how the car's velocity is
split. The component along the wall normal is the part that hits; the component along the
wall is the part that scrapes. A model that scales the whole velocity by one factor treats
the two the same and makes a car racing along a barrier as slow as one that rams it. The
model that feels right treats them differently: the normal component is reversed and
scaled by restitution, and the tangent component loses only a small fixed fraction.

The distinction is the whole difference between a barrier that is a lane edge and one that
is a hazard, and it is learned by the player in a few corners.

Status: a simulated comparison proves the ordering, a glancing hit keeping more than twice
the speed of a head-on one at the same approach speed, but only while restitution is low.
With a tangent loss of a few percent, a head-on hit leaves at `e` times the approach speed,
and a shallow glance leaves at nearly all of it. So "more than twice" needs the tangent
retention to exceed twice the restitution. Computed on 2026-10-09: at a restitution of 0.24
the ratio is 3.9 at a 15-degree glance and 2.2 at 60 degrees. At 0.4 it is 2.3 and 1.5. At
0.5 it fails at every angle. The tangent loss fraction is authored and has not been felt.

## Procedure

1. **Test every circle against the boundary, not just the car centre.** Project each end
   circle's centre onto the track to find its signed distance from the centreline and the
   boundary normal. The limit is the track half-width minus the circle radius. A car that
   rotates into a barrier touches with a corner before its centre arrives.
2. **Push the car out along the normal by the penetration.** Do this before the velocity
   changes, so the later steps read a consistent position.
3. **Act only if the car is moving into the wall.** The normal velocity must be positive
   along the outward normal; a car already moving away is not touched.
4. **Reflect the normal component with restitution.** Subtract `(1 + e)` times the normal
   speed along the normal. With `e` below one the car rebounds slower than it arrived.
5. **Remove a small fixed fraction of the tangent component.** The tangent is the velocity
   projected on the wall's tangent direction; subtract `loss * tangent` along it. The
   fraction is small, a few percent per contact, because the contact repeats every step
   while the car scrapes.
6. **Record the normal speed as the wall impact.** Keep the largest over the step, not a
   sum, and reset it at the start of each step. Whatever consumes it, such as wall damage,
   reads the head-on component only, so a scrape is nearly free.
7. **Assert the ordering.** At the same speed, a car meeting a straight boundary at a
   shallow angle must leave with more than twice the speed of the same car meeting it at a
   right angle. Keep the test; it is the contract. Run it at the highest restitution any
   class or surface can reach, not at the default, because the contract breaks once
   restitution rises toward one half.

## Decision rules

- **When scraping along a wall feels free,** raise the tangent loss slightly, but check
  first that it is not the normal rebound being too lively. Both read as "the wall does not
  matter".
- **When a head-on hit feels like a bounce,** lower the restitution before raising anything
  else; a high rebound hides the loss the technique exists to show.
- **When wall damage must scale with impact,** damage on the normal speed above a floor,
  with a cooldown. The floor keeps scrapes free and the cooldown stops a car sliding along
  a corner from being charged every step.
- **When the loss fraction is applied every step during a scrape,** budget it per second,
  not per step: with the step rate known, the fraction retained over a second is one minus the loss,
  raised to the number of steps in a second. State the per-second figure beside the per-step one.
- **When some vehicle classes should ignore the tangent loss,** gate it by class
  explicitly and write the reason, such as an older class kept frictionless for backward
  compatibility. An unexplained gate is a second model.

## When not to use this

- **Do not use a fixed fraction where scraping must scale with how hard the car is pressed
  into the wall.** That is a friction law and needs the normal impulse as an input.
- **Do not use it for soft boundaries,** such as grass or gravel that should slow the car
  by drag over time; those belong to the surface model, not to a hard contact.
- **Do not apply the tangent loss on the same step the car leaves the wall.** A car that
  has stopped touching should be left alone.
