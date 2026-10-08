---
layer: application
type: application
subject: top-down-vehicle-handling-model
technique: kerb-verge-inside-hard-wall
stack: process
status: forged
verified_on: 2026-10-01
---

# The surface ladder is exercised; the verge band is probably unreachable

Read against the `firetv-deathride` tree, source root `firetv-deathride`, at
the head of its main branch on 2026-10-01 (uncommitted work present, commit not pinned). The
ladder's completion results are **simulated** (seeded computer-driven cars). The reachability
finding below is a **derivation from cited lines**, not an instrumented run. Nothing here is
human-felt.

## The zones

The bands are defined from the half-width, outermost first:
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:81 "abs(lateral)>widthAt(s)-Movement.vergeWidthM -> Surfaces.offtrack" and
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:82 "abs(lateral)>widthAt(s)-Movement.vergeWidthM-Movement.kerbWidthM -> Surfaces.kerb".
The widths are metres in a table apart from the surface table: deathride/core/src/main/resources/data/movement.csv:13 "kerbWidthM,1" and
deathride/core/src/main/resources/data/movement.csv:14 "vergeWidthM,1.5". The design note states the intent at
docs/concepts/deathride/W3-movement.md:9 "A near-edge kerb and outer verge remain inside the hard wall". The surface is resolved once per
step for each car from the projected position, deathride/core/src/main/kotlin/dev/deathride/core/World.kt:255 "c.surface=track.surfaceAt(projection.s,projection.distance)".

## The ladder itself

The two columns are in deathride/core/src/main/resources/data/surfaces.csv:2 "Asphalt,1,0", deathride/core/src/main/resources/data/surfaces.csv:3 "Gravel,0.72,0.12", deathride/core/src/main/resources/data/surfaces.csv:6 "Kerb,0.85,0.10"
and deathride/core/src/main/resources/data/surfaces.csv:7 "Offtrack,0.55,0.65". The ordering is asserted at
deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:39 "assertTrue(lateral(Surfaces.asphalt)<lateral(Surfaces.practice.last()))", and the completion run is
deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:44 "fun everySurfaceCompletesSeededAiRacesDeterministically()". The wave note reports its three-seed, six-car results from
docs/concepts/deathride/W3-movement.md:25 "| Asphalt | 69.350" to docs/concepts/deathride/W3-movement.md:30 "| Offtrack | 149.567".

The time ranking is not the grip ranking. Offtrack grip, 0.55, is higher than oil's 0.48, yet its
finish times are the worst by a wide margin because its drag is 0.65 per second against oil's 0.02.
That is the two-column argument recorded in the source's own numbers. **Simulated, n = 3 per
surface.**

## The incident the standard was built around

docs/concepts/deathride/W3-movement.md:32 "Initial ice run failed the 180 s completion requirement for Bastion" gives the cause: the driver applied grip once in the
lateral-acceleration corner limit and again as a speed multiplier. The corner-speed estimate reads
the surface grip once, at deathride/core/src/main/kotlin/dev/deathride/core/World.kt:315 "track.surfaceAt(s+look,lane).gripScale", and the remaining factor applies only
on straights, as a stated floor, at deathride/core/src/main/kotlin/dev/deathride/core/World.kt:316 "val surfaceLimit=if(point.curvature>0)1.0 else sqrt(c.surface.gripScale)".
The fix was a deletion, not extra power.

## Reachability: the verge cannot be entered by a roster car (derived, not tested)

The wall holds each collision circle inside the half-width, deathride/core/src/main/kotlin/dev/deathride/core/World.kt:328 "val limit=track.widthAt(projection.s)-radius".
A roster car's radius is half its width, deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:19 "CarSpec(circleRadiusM=shape.widthM*.5", and the widths
run from deathride/core/src/main/resources/data/car-shapes.csv:2 "Needle,6.6,3.0" to deathride/core/src/main/resources/data/car-shapes.csv:4 "Bastion,9.3,4.65", with the other classes between, so the radii span 1.5 to 2.325 m.
The authored tracks use a half-width of 12, deathride/core/src/main/resources/data/tracks/foundry.csv:2 "-85,45,12,Asphalt,0".

The surface is sampled at the car centre, and the two end circles each stay within `w - r`, so the
centre cannot be deeper than `w - r`. The verge begins at `w - 1.5`, so:

- **Verge** is reachable only for `r < 1.5`. The smallest car has `r = 1.5` exactly and the zone
  test is a strict greater-than, so the reachable depth is zero for every class. No ordinary drive
  reaches the 0.65-drag surface.
- **Kerb** is reachable for `r < 2.5`, so for all five classes, with depths from 1.0 m for the
  narrowest to 0.175 m for the widest.

The note's own account of the verge, docs/concepts/deathride/W3-movement.md:32 "Offtrack-only runs are deliberately severe; ordinary play has only an outer verge", is
the claim this derivation contradicts: those forced-surface runs are the only way the row was
exercised. It is a derivation: straight sections, centre sampling and end-circle containment all
hold in the code read, but no test records the surface at the deepest wall contact. **Open
question for the owner: has any roster car ever been recorded on the verge outside a
forced-surface run?**

## What the wall does at the end

The wall keeps most tangential speed: deathride/core/src/main/resources/data/movement.csv:15 "wallTangentLoss,0.04" feeds
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:335 "c.vx+=ny*tangent*Movement.wallTangentLoss". With only 4 per cent tangential loss and a verge the
car never meets, riding the wall is the cheapest line, and the band that was meant to prevent
that cannot, on this geometry.

## Deviations and upward lessons

- **Deviation, unreachable band.** As above. A remedy within the standard: widen the verge past
  the widest car's radius plus the depth to be felt (about 2.325 + 1.0 m), or sample the surface
  at the outer circle on the wall side.
- **Deviation, no reachability test.** Zone boundaries are checked by ordering only; the standard
  asks for a deterministic run recording the deepest surface per class.
- **Upward lesson.** Because the widths are metres in their own table, the bug is repairable by
  editing a number, and the standard now carries the condition `r < v` as the check that was
  missing.
