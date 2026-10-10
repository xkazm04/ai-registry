---
layer: application
type: application
subject: top-down-vehicle-handling-model
technique: kerb-verge-inside-hard-wall
stack: process
status: forged
verified_on: 2026-10-10
---

# The surface ladder is exercised; the verge was unreachable, and edge sampling fixed it

First read against the `firetv-deathride` tree on 2026-10-01, at the head of its main branch
(uncommitted work present, commit not pinned). Re-read on 2026-10-10 at `deathride/main`
`d9990777`, and every anchor below is from that commit. The ladder's completion results are
**simulated** (seeded computer-driven cars). The reachability result is now a **test in the
project**. The first reading was only a derivation from cited lines. Nothing here is
human-felt.

## The zones

The bands are defined from the half-width, outermost first, and since 2026-10-01 they are
tested at the car's edge rather than its centre:
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:87 "abs(lateral)+contactRadiusM>widthAt(s,route)-Movement.vergeWidthM -> Surfaces.offtrack" and
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:88 "abs(lateral)+contactRadiusM>widthAt(s,route)-Movement.vergeWidthM-Movement.kerbWidthM -> Surfaces.kerb".
The widths are metres in a table apart from the surface table: deathride/core/src/main/resources/data/movement.csv:13 "kerbWidthM,1" and
deathride/core/src/main/resources/data/movement.csv:14 "vergeWidthM,1.5". The design note states the intent at
docs/concepts/deathride/W3-movement.md:9 "A near-edge kerb and outer verge remain inside the hard wall". The surface is resolved once per
step for each car, passing the car's collision radius for a roster car:
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:370 "c.surface=track.surfaceAt(projection.s,projection.distance,if(c.carClass==null)0.0 else c.spec.circleRadiusM,projection.route)".

## The ladder itself

The two columns are in deathride/core/src/main/resources/data/surfaces.csv:2 "Asphalt,1,0", deathride/core/src/main/resources/data/surfaces.csv:3 "Gravel,0.72,0.12", deathride/core/src/main/resources/data/surfaces.csv:6 "Kerb,0.85,0.10"
and deathride/core/src/main/resources/data/surfaces.csv:7 "Offtrack,0.55,0.65". The ordering is asserted at
deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:39 "assertTrue(lateral(Surfaces.asphalt)<lateral(Surfaces.practice.last()))", and the completion run is
deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:44 "fun everySurfaceCompletesSeededAiRacesDeterministically()". The wave note reports its three-seed, six-car results from
docs/concepts/deathride/W3-movement.md:25 "| Asphalt | 69.350" to docs/concepts/deathride/W3-movement.md:30 "| Offtrack | 149.567".

The time ranking is not the grip ranking. Offtrack grip, 0.55, is higher than oil's 0.48, yet its
finish times are the worst by a wide margin because its drag is 0.65 per second against oil's 0.02.
That is the two-column argument recorded in the source's own numbers. **Simulated, n = 3 per
surface.** Those times predate the roster's move to a two-axle model; the completion test still
passes on the current tree, but the table has not been re-run.

## The incident the standard was built around

docs/concepts/deathride/W3-movement.md:32 "Initial ice run failed the 180 s completion requirement for Bastion" gives the cause: the driver applied grip once in the
lateral-acceleration corner limit and again as a speed multiplier. The corner-speed estimate still
reads the surface once, now through the axle model's own limit, at
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:478 "DriftDynamics.lateralLimit(c.spec,track.surfaceAt(s+look,lane,c.spec.circleRadiusM,c.trackRoute),driftRules)",
and the remaining factor applies only on straights, as a stated floor, at
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:479 "val surfaceLimit=if(point.curvature>0)1.0 else sqrt(c.surface.gripScale)".
The fix was a deletion, not extra power. The same failure came back once in the axle model's
calibration, as docs/concepts/deathride/D3-drift-lab.md:23 "The first candidate applied surface loss twice and broke ice recovery".
It was fixed the same way.

## Reachability: unreachable on 2026-10-01, reachable and tested since

**The first reading (derived, 2026-10-01).** The wall holds each collision circle inside the
half-width, now at deathride/core/src/main/kotlin/dev/deathride/core/World.kt:518 "val limit=track.widthAt(projection.s,projection.route)-radius".
A roster car's radius is half its width,
deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:26 "CarSpec(circleRadiusM=shape.widthM*.5", and the widths run from
deathride/core/src/main/resources/data/car-shapes.csv:2 "Needle,6.6,3.0" to deathride/core/src/main/resources/data/car-shapes.csv:4 "Bastion,9.3,4.65", so the radii span 1.5 to 2.325 m.
The authored tracks use a half-width of 12, deathride/core/src/main/resources/data/tracks/foundry.csv:2 "45,12,Asphalt,0". With the surface
sampled at the car centre, the centre could be no deeper than `w - r`, and the verge began at
`w - 1.5`. So the verge was reachable only for `r < 1.5`, and the smallest car had exactly 1.5
against a strict greater-than. No ordinary drive reached the 0.65-drag surface, and riding the
wall was the cheapest line.

**What the project did.** It took the remedy this application proposed, sampling at the outer
circle on the wall side, in commit `646f37a7` ("V1 make verge drag reachable"). That was three
hours after this registry bundle landed. Its design note begins
docs/concepts/deathride/V1-verge-and-lint.md:3 "Reproduce the forge finding with every roster car on both sides of a straight". The
note confirmed the finding on the old code: all 20 class-and-side cases showed only asphalt or
kerb. It then measured the drag consumer, not just the query:
docs/concepts/deathride/V1-verge-and-lint.md:13 "ends at 19.71209 m/s on the verge versus 19.92680 on asphalt". The fix is the
`+contactRadiusM` in the two zone lines above. The reachability test the standard asked
for now exists:
deathride/core/src/test/kotlin/dev/deathride/core/VergeTest.kt:8 "fun everyCarCanReachVergeSlowdownWhileContainedByEitherWall()".
For every catalogue class on both walls, it drives the car to the wall-contained limit. It asserts
the car is on the verge and loses speed against asphalt, and that it reaches the kerb band
too. It also keeps the old failure as a control:
deathride/core/src/test/kotlin/dev/deathride/core/VergeTest.kt:24 "centre-only query reproduces the unreachable verge".

## What the wall does at the end

The wall keeps most tangential speed: deathride/core/src/main/resources/data/movement.csv:15 "wallTangentLoss,0.04" feeds
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:525 "c.vx+=ny*tangent*Movement.wallTangentLoss". With the verge reachable,
a car on the wall is now on the 0.65-drag surface, so the band does the job the 4 per cent
tangential loss could not.

## Deviations and upward lessons

- **Closed: unreachable band.** Fixed by edge sampling, not by widening the verge. Of the two
  remedies, edge sampling keeps the authored widths and works for any car width.
- **Closed: no reachability test.** `VergeTest` records the footprint surface per class and
  side and writes a report row for each.
- **Upward lesson.** The condition `r < v` in the technique was the check that had been
  missing. Once the derivation was written down with its numbers, the project reproduced it as
  a failing regression and fixed it within three hours. A derivation from cited lines that
  names its own falsifier can be acted on before anyone instruments it.
