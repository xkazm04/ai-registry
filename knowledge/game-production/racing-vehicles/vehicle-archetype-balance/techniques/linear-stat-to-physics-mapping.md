---
layer: technique
type: technique
subject: vehicle-archetype-balance
technique: linear-stat-to-physics-mapping
status: forged
laws: [a-number-carries-its-unit-and-basis, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [defining the authoring surface of a vehicle roster, a stat bar and the handling disagree, adding a physical parameter that a stat should drive]
---

# Linear stat-to-physics mapping

The concern: designers author vehicles, the movement step consumes physical quantities, and
something has to sit between them. The technique is a single table whose every row names one
physical parameter, the one unitless stat that drives it, a **base** (the parameter at stat
zero) and a **per-point** increment. The derived value is `base + perPoint * stat`. No curve,
no lookup, no per-vehicle override. The stat scale is shared by every vehicle and is small
enough for a human to hold: a one-to-ten rating plus an integer for countable things such as
mounts.

Status of claims: the mapping is **authored**. Its linearity is a design promise and not a
fit to physics; nothing here says a real vehicle's top speed is linear in anything.

## Why linear, and why one table

Linear buys three properties an author can use. A change of one point has the same effect
wherever on the scale it is made, so a reviewer can predict a diff without running anything.
Two vehicles' derived difference is proportional to their stat difference, so the rating that
sits on top of the mapping (see the rating technique) can normalise by the same per-point
unit and stay interpretable. And the table is the only place a conversion lives, so the unit
of every derived parameter is written once beside its stat
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)):
metres per second, metres per second squared, radians per second, seconds, kilograms, a
dimensionless reduction.

A nonlinear response is sometimes right physically and always costly authorially. If a
physical effect truly saturates, put the saturation in the step's rules (a speed-dependent
steering limit, a drag term) where it applies to every vehicle identically, and keep the
mapping linear. The mapping answers "what does this vehicle have"; the rules answer "what does
the world do with it".

Linearity is a choice and not the field's norm. A best-selling kart racer converts stat points
through one lookup table per stat. Its datamined tables show speed rising by an equal step per
level, while handling's step shrinks twice toward the top of the scale and mass jumps at one
level. That design buys diminishing returns, so stacking one stat to the ceiling is less
attractive. It costs the reviewer's ability to predict a one-point diff. If you need that
trade, keep it in the one table: a per-stat curve that is monotonic, published and read by the
same derive call. Never use a per-vehicle exception.

## Procedure

1. List the physical parameters the step consumes. Anything the step reads that is not in the
   table is a hidden stat; either add it or make it a global coefficient owned by one data
   resource.
2. Group parameters by the single stat that should drive them. A stat may drive several
   parameters — a handling stat can set both the steering authority at speed and the yaw
   response time, with the response row's per-point increment negative because a faster
   response is a smaller time constant. A parameter is driven by exactly one stat; two stats
   feeding one parameter makes the rating non-separable and the weakness unreadable.
3. Choose the base so the middle of the scale yields a reference vehicle, and the per-point
   increment so that the span of the scale covers the physically comfortable range of the
   step — the range inside which the integrator, the camera and the track widths still work.
   A mapping that lets one extreme stat produce a quantity the step cannot integrate stably is
   a crash waiting for the first author who reaches for ten.
4. Make the table the only reader path. The shop, the stat bars on every screen, the rating
   and the step all read derived values through one derive call; none recompute from raw stats.
5. Bound the stat scale in validation: every vehicle's every stat lies in range, and every
   derived value lies inside the step's stability envelope.

## Decision rules

- When two stats would both move one parameter, split the parameter (steering authority and
  yaw response are two parameters) rather than letting a stat reach across. Why: the identity
  pair names one stat as a weakness, and a weakness must map to one observable loss.
- When a stat has no row, it is dead. Declared-but-unread stats are the most common roster
  defect, because a bar on a screen looks authored
  ([declaring-an-input-is-not-consuming-it](../../../_laws.md#declaring-an-input-is-not-consuming-it)).
  Audit readers, not writers.
- When parts or upgrades modify a vehicle, add to the stat before the mapping, never to the
  derived quantity after it. Why: the rating then sees the upgrade through the same function
  and the ladder stays one authority.
- When a designer asks for a bespoke value for one vehicle, the answer is a stat change or a
  new row, never an override. An override is a second model.
- When the movement step grows geometry (axles, wheelbase, a load-sensitive grip term), the
  rule "no parameter hangs from two stats" can hold in the table and fail in the step. The step
  multiplies a stat's derived value by per-vehicle shape data, or by another stat's value. In
  the source, the grip limit became the grip stat times a power of the mass stat. Steering and
  yaw response were scaled by each class's wheelbase and inertia, from shape tables no stat
  drives and the rating never reads. Audit the *effective* quantity the step integrates, not
  the table's column. For each per-vehicle input either drive it from a stat or list it in the
  rating's report as unpriced. A shape table is a hidden stat with a different file name.

## Common failures

A mapping whose per-point increment was tuned until one vehicle felt right, which makes every
other vehicle a side effect. A stat scale of one to ten whose per-point steps are so small the
player cannot feel one point, so the roster collapses into a single blob. A mapping that
lives partly in the table and partly in the movement step as a scattered multiplier, so the
rating and the physics disagree about what a point is.

## When not to use it

When the physical parameters are produced by a real physics model with its own vehicle
description, the stat layer is a UI. The technique fits arcade handling where the author owns
the parameters; in a simulation-grade model the author edits mass, centre of gravity and
tyre curves, and a linear stat is a lossy summary. An arcade step that has moved partway there,
to a two-axle solver with per-vehicle geometry, is in between. Keep the table, and own the
geometry explicitly under the decision rule above. Also do not use it for a roster of a
handful of one-off vehicles that will never be compared: the table earns its keep only where
vehicles are weighed against each other.
