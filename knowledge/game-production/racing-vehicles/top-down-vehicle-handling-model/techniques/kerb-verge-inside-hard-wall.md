---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: kerb-verge-inside-hard-wall
status: forged
laws: [structural-proof-is-never-sufficient, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [designing the penalty for running wide, a verge or kerb band exists in the table but players never feel it, a car must not leave the world but must be punished for approaching the edge]
---

# Kerb and verge inside a hard wall

The named concern: how to make "running off the road" a graded, felt cost while the car can
never actually leave the playable area. The answer is geometric: the surface bands sit
*inside* the hard boundary, so the car meets the kerb, then the verge, then a wall, in that
order, and always has a chance to react before the wall takes its speed.

## Three zones along the lateral axis

Measure the car's lateral offset from the centre-line of the road. Let `w` be the half-width at
that point on the track, the distance from the centre-line to the hard boundary. Define two
widths: a verge width `v` and a kerb width `k`. The zones, outermost first, are:

- **Wall.** The hard boundary at `w`. Collision response, not surface, handles it.
- **Verge.** Offsets greater than `w - v`. The worst surface: strong drag and reduced grip.
- **Kerb.** Offsets between `w - v - k` and `w - v`. A mild penalty, narrow, the early warning.
- **Road.** Everything inside, with whichever surface the track assigns.

Both widths are table values in metres, kept apart from the surface table so that geometry is
tuned without disturbing the ladder. The surface is resolved once per step from a single lateral
offset, with the outer zone tested first so the verge takes precedence over the kerb.

## The reachability condition

This is the technique's reason to exist and the part most often assumed. **A zone is felt only
if the point the surface is sampled at can enter it.** If the surface is sampled at the car's
centre, and the car is a body with a radius `r` that the wall keeps inside `w - r`, then the
centre's maximum offset is `w - r`, and:

- the verge is reachable only if `w - r > w - v`, that is, **`r < v`**; the reachable depth is
  `v - r`;
- the kerb is reachable at all only if `r < v + k`.

So a body whose radius is as large as the verge's width can never enter the verge, however hard
it is driven into the wall. A car with a radius larger than the sum of both widths never feels
either band. A table of zone widths that are smaller than the narrowest car's half-width is a
table of penalties for a place the car cannot go.

The remedy is one of three, chosen on purpose: widen the bands to exceed the largest car's
radius by the depth you want felt; sample the surface at the body's outermost point on the
outer side rather than at its centre; or resolve the surface per wheel pair. The first is the
cheapest and the one a tuning table can express. But it ties the band widths to the widest car,
so every new body re-opens the question. The second is one term in the zone test (offset plus
radius), it holds for any car width, and it leaves the authored widths alone. In one game that
had the defect, it was the remedy chosen, with a regression that failed on the old query first.
After the fix, one coasting step on the verge lost measurably more speed than on asphalt. When
you sample at the edge, keep two things at the centre or in step with it. Features authored as
points on the road, such as a spill or a shortcut, stay sampled at the centre. Any opponent
look-ahead that reads the surface uses the same footprint as the physics, or the driver plans
for a surface the car will not be on.

## The margin is also a design promise about the wall

A band that sits inside the wall promises that the player meets it before the wall. That
holds only while the bands fit inside the road. State it as an invariant and test it against
the table: the sum of the two band widths is less than the half-width, and each band width
exceeds the largest body radius by the depth you intend the player to feel. Without the second
clause the band exists on paper and the wall takes the speed first.

## Wall behaviour completes the penalty

A graded penalty ends in a hard stop whose cost depends on the angle. The wall response
reflects the normal component of velocity with the car's restitution and keeps most of the
tangential component, losing only a small fraction. That is what makes a grazing contact a
nudge and a head-on contact a stop, and it is what makes riding the wall a cheaper line than
it should be unless the verge has already taken the speed. Keep the wall's tangential loss small
but non-zero, and let the band, not the wall, carry the penalty for approach.

## Procedure

1. **Write the widths in metres in a table with a unit,** next to the wall tangential loss.
2. **Compute and record, per car class, the reachable depth of each band** (`v - r`,
   `v + k - r`), clamped at zero. A zero is a finding, not a pass.
3. **Test the zone boundaries** with positions just inside and just outside each limit,
   including the case where the verge is wider than the half-width and the zones overlap.
4. **Drive each class into the wall in a deterministic run and record which surface the car
   was on at the deepest point.** If the answer is never the verge, the band is decorative.
5. **Give a practice mode that forces a surface everywhere** if designers need to feel the
   surfaces themselves; keep it out of normal play and out of balance claims about the verge.

## Decision rules

- **When a band is never reached by a large car, widen it by the car's radius, not by guesswork,**
  or move the sample to the car's edge. Prefer the edge when the roster's widths still change.
- **When a track narrows, scale the bands down with the half-width,** or the verge swallows the
  road; the widths are caps, not fixed fractions.
- **When a surface override applies to the whole track, the bands do not.** Keep the bands
  outside the override; a verge that vanished because a practice surface was selected would hide
  the very thing the practice was for.
- **When a car has multiple collision circles,** the surface sample must be the outermost of
  them on the wall side, or the largest car's reach is the rear circle's reach.

## Measured, simulated, authored

Zone boundaries and ordering are table arithmetic and can be unit-tested. Whether any
class in a given roster can reach a band is a derivation from the table and the car radii;
until a deterministic run records the surface at the wall, it is a derivation, not a
measurement. Whether players *feel* a gentle penalty before the wall is a human claim that has
not been made for the source this technique came from.

## When not to use this

- **For an open-field or off-road game with no wall.** There is no inside to be in.
- **For a game where the edge is lethal.** A cliff or a barrier that destroys the car is a
  different design, and a gentle band in front of it is a courtesy that may undermine it.
- **When the track surface already varies continuously to its edge.** A mapped surface layer
  that already grades the ground makes a separate band redundant.
