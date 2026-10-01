---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: px-per-metre-scale-contract
stack: process
status: forged
verified_on: 2026-10-01
---

# A scale contract asserted on the data, breached by the shared camera

Source tree `firetv-deathride`, branch `deathride/main`, commit `9793226`. A top-down racer for a
television, rendered at a logical 1280 by 720. The contract is a pair of tables and one test; the camera
code that should honour it is elsewhere. Nobody has looked at the result from a sofa: the repo's own note
keeps that "not measured".

## The three layers in the tree

**World metres.** `deathride/core/src/main/resources/data/car-shapes.csv` is the dimension authority:
Needle 6.6 by 3.0, Line 7.8 by 3.75, Bastion 9.3 by 4.65, Comet 9.0 by 3.5, Trail 6.9 by 3.9 metres. The
design note says so outright (`docs/concepts/deathride/W6-tracks.md:7 "car-shapes.csv"` remains the dimensional
authority) and calls the proportions "deliberately readable arcade proportions" (`:13`).

**Camera scale.** `deathride/core/src/main/resources/data/presentation.csv:2 "soloPixelsPerM,17"`,
`:4` `minPixelsPerM,12.8`, `:7` `sharedPaddingM,30`.

**On-screen minimum.** `deathride/core/src/main/resources/data/presentation.csv:20 "minimumCarPixels,80"`.

The assertion that ties them: `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:21 "for(shape in CarShapes.all)assertTrue(shape.lengthM*"`
`for(shape in CarShapes.all)assertTrue(shape.lengthM*VisualTuning["minPixelsPerM"]>=VisualTuning["minimumCarPixels"],shape.id)`.
By arithmetic the shortest car gives 6.6 x 12.8 = 84.5 pixels against the 80 required, a margin of about 5
percent, and the longest 9.3 x 12.8 = 119 pixels. The same test pins the Line dimensions
(`:20` `assertEquals(7.8,line.lengthM,1e-9)`), so a dimension edit forces a conscious test edit.

## Confirmed

Three authorities, one assertion over the data, resolved from the same tables the drawing uses: the contract is
real, runs in the unit suite, and reads the roster rather than a copy. Road width is likewise stated against the
cars, in the design note (`docs/concepts/deathride/W6-tracks.md:9 "about 3.6-6 widest-car widths"`) and the rules table
(`deathride/core/src/main/resources/data/track-rules.csv:3 "minWidthCarWidths,3.6"`).

## Deviation: the floor holds on one camera path, not on all

The follow camera computes its target with the floor, `deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:288 "coerceAtLeast(VisualTuning["`
`var target=(VisualTuning["soloPixelsPerM"]-speed/count*VisualTuning["speedZoomPerMps"]).coerceAtLeast(VisualTuning["minPixelsPerM"])`,
and then, for two or more human drivers, takes a further minimum at `:289`
`if(count>1)target=min(target,min(1100/(maxX-minX+VisualTuning["sharedPaddingM"]),...` with **no floor applied
afterwards**. The shared term falls without bound as the cars separate. By the formula alone, two cars 200 metres
apart in x give 1100 / (200 + 30), about 4.8 pixels per metre, which puts the 6.6-metre car near 32 pixels:
well under the 80-pixel minimum the test enforces. This is derived arithmetic from the code, not an observation of
the running game; no capture of a separated two-player view was taken for this document. The unit test cannot see it
because it multiplies the car length by `minPixelsPerM` and never runs the camera. The design note anticipated the
widening ("Shared framing may still widen for two separated players", `docs/concepts/deathride/W6-tracks.md:9 "Shared framing may still widen for two separated players"`), so the breach is declared in
prose and not in the contract, which is the case the technique names: either floor the mode, or state it as a mode
exempt from the contract. The standard stays.

The non-following branch sets the scale to fit the whole circuit (`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:281 "var pixelsPerM=min(1180.0/(course.maxX-course.minX)"`
`var pixelsPerM=min(1180.0/(course.maxX-course.minX),490.0/(course.maxY-course.minY))`), which the design note
declares a map and not the driving scale (`docs/concepts/deathride/W6-tracks.md:15 "explicitly a map, not the driving scale"`): the right
way to exempt a mode.

## Deviation: the prose and the data disagree about the range

The design note states the solo range three ways: `docs/concepts/deathride/W6-tracks.md:9 "12.8-17 logical pixels/m"` ... "approximately 84-158
logical pixels long", `:15` "roughly 13-17 logical pixels/metre ... approximately 65-95 logical pixels long", and the
table says 12.8 and 17. The 84-158 figure agrees with the table and the dimensions (6.6 x 12.8 = 84, 9.3 x 17 = 158);
the 65-95 figure does not and is a stale value from before the sizing pass. A contradiction between siblings is a defect
in its own right, and the number a reader would act on depends on which paragraph they hit.

## Upward lessons

- A contract asserted only over data proves the tables agree and says nothing about every state of the camera; the technique
  now asks for a second assertion that exercises the camera function over speeds and separations.
- The 5 percent margin between the floor and the minimum means any later shrinking of the roster or lowering of the floor
  breaks the test at once, which is the right behaviour and worth keeping.
- A static scenery layer must extend beyond the circuit by the follow camera's visible margin, or a hard edge enters the
  driving view (`docs/concepts/deathride/PITFALLS.md:4 "must extend beyond the circuit's geometry bounds"`); a margin is
  a scale-dependent quantity and belongs in the presentation table beside the scale, which it is
  (`deathride/core/src/main/resources/data/presentation.csv:21 "sceneryMarginM,60"`).

## Evidence rung

Measured: the table arithmetic and the unit assertion. Simulated: none for readability. Authored: 12.8, 17, 80, 3.6.
Not measured: whether cars at 84 pixels read from a sofa on a television; the design note's own truth statement keeps
"Owner sofa readability ... **not measured**" (`docs/concepts/deathride/W6-tracks.md:44 "Owner sofa readability"`).
