---
layer: application
type: application
subject: mass-based-arcade-collision
technique: multi-circle-capsule-contact
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Three circles on every car, and the depth the flank still gives away

Read against the Death Ride tree (`firetv-deathride`, branch `deathride/main` at `d9990777`,
Kotlin 2.0.21), 2026-10-09. The geometry is arithmetic over the tree's real silhouettes. It
is not a play measurement.

## The chain, derived from the drawing

The contact shape comes from the drawn silhouette, as the technique's steps one and two ask:
`deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:26 "return CarSpec(circleRadiusM=shape.widthM*.5,circleOffsetM=(shape.lengthM-shape.widthM)*.5"`.
The spec derives the drawn length back from the two numbers:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:35 "val lengthM get()=2*(circleOffsetM+circleRadiusM)"`.
Every car gets three circles, and every pair makes nine tests:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:533 "// A middle circle closes the side-contact gap on the longer W6 silhouettes."`
then `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:534 "for(ea in -1..1) for(eb in -1..1) {"`.
The wall test uses only the two end circles:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:515 "for(end in -1..1 step 2) {"`.

## The forge's rule would have kept two circles

The technique's original step four added the middle circle only when the clear gap between
the end circles exceeded the smallest opponent's diameter. The ten shapes in
`deathride/core/src/main/resources/data/car-shapes.csv` give a widest two-circle gap of 2.55
m (Kestrel, `deathride/core/src/main/resources/data/car-shapes.csv:10 "Kestrel,9.15,3.3"`).
The smallest opponent is the 3.0 m wide Needle
(`deathride/core/src/main/resources/data/car-shapes.csv:2 "Needle,6.6,3.0"`). Under that rule
no car needed a middle circle.

The quantity a player sees is how far an opponent's nose can sink past the drawn flank
before any contact registers. It is set by the gap between two adjacent circle centres,
`depth = R - sqrt(R^2 - (s/2)^2)`, where `R` is the sum of the two radii and `s` is the
centre spacing. Against a Needle nose:

| Car | Two circles | Three circles (shipped) |
| --- | --- | --- |
| Kestrel, 9.15 x 3.3 m | 1.98 m, 60% of its width | 0.36 m, 11% |
| Comet, 9.0 x 3.5 m | 1.52 m, 43% | 0.31 m, 9% |
| Bastion, 9.3 x 4.65 m | 0.79 m, 17% | 0.18 m, 4% |
| Flint, 7.1 x 4.1 m | 0.33 m, 8% | 0.08 m, 2% |

The project overrode the gap rule and shipped three circles everywhere. It was right to: the
depth rule flags Kestrel and Comet, and the gap rule passed them. A true capsule (closest
points of two segments, one test per pair) would make the depth zero. Death Ride's solver
is circle-only, so the chain is the cheaper change there.

## Verdict

Simulation over ten real silhouettes. The old gap rule would accept two circles for all ten
cars. The depth rule rejects two circles for the two long classes, at 1.5-2.0 m of
undetected flank, and accepts three. That matches the project's own later decision, so the
verdict is **better**: the new rule separates cases the old one could not. Kestrel's 0.36 m
residual is the number to watch if flank hits are ever reported as "went through".
