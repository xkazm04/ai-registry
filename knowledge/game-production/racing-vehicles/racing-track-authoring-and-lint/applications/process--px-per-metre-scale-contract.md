---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: px-per-metre-scale-contract
stack: process
status: forged
verified_on: 2026-10-10
---

# A scale contract asserted on the data, breached by the race camera

Source tree `firetv-deathride`, branch `deathride/main`. It was first read at commit `9793226` on 2026-10-01.
Every anchor was re-resolved at `d9990777` on 2026-10-10. A top-down racer for a television, rendered at a
logical 1280 by 720. The contract is a pair of tables and one test; the camera code that should honour it is
elsewhere. Nobody has looked at the result from a sofa: the repo's own note keeps that "not measured".

## The three layers in the tree

**World metres.** `deathride/core/src/main/resources/data/car-shapes.csv` is the dimension authority:
Needle 6.6 by 3.0, Line 7.8 by 3.75, Bastion 9.3 by 4.65, Comet 9.0 by 3.5, Trail 6.9 by 3.9 metres. Since the
first read five more cars were added (Flint, Quill, Vandal, Kestrel, Bulwark), with unchanged extremes: shortest
`deathride/core/src/main/resources/data/car-shapes.csv:2 "Needle,6.6,3.0"`, longest 9.3 m, widest 4.65 m. The
design note says so outright (`docs/concepts/deathride/W6-tracks.md:7 "car-shapes.csv"` remains the dimensional
authority) and calls the proportions "deliberately readable arcade proportions"
(`docs/concepts/deathride/W6-tracks.md:13 "deliberately readable arcade proportions"`).

**Camera scale.** `deathride/core/src/main/resources/data/presentation.csv:2 "soloPixelsPerM,17"`,
`deathride/core/src/main/resources/data/presentation.csv:4 "minPixelsPerM,12.8"`,
`deathride/core/src/main/resources/data/presentation.csv:7 "sharedPaddingM,30"`.

**On-screen minimum.** `deathride/core/src/main/resources/data/presentation.csv:20 "minimumCarPixels,80"`.

The assertion that ties them: `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:35 "for(shape in CarShapes.all)assertTrue(shape.lengthM*"`
`VisualTuning["minPixelsPerM"]>=VisualTuning["minimumCarPixels"],shape.id)`.
By arithmetic over the table the shortest car gives 6.6 x 12.8 = 84.5 pixels against the 80 required, a margin of
about 5 percent, and the longest 9.3 x 12.8 = 119 pixels. That was true of the game at the first read and is true
only of the table since 2026-10-06 (below). The same test pins the Line dimensions
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:34 "assertEquals(7.8,line.lengthM,1e-9)"`), so a
dimension edit forces a conscious test edit.

## Confirmed

Three authorities, one assertion over the data, resolved from the same tables the drawing uses: the contract is
real, runs in the unit suite, and reads the roster rather than a copy. Road width is likewise stated against the
cars, in the design note (`docs/concepts/deathride/W6-tracks.md:9 "about 3.6-6 widest-car widths"`) and the rules table
(`deathride/core/src/main/resources/data/track-rules.csv:3 "minWidthCarWidths,3.6"`).

## Deviation: the floor holds on no race camera path

At the first read the follow camera floored its target
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:527 "coerceAtLeast(VisualTuning["`) and only the
two-player minimum escaped it
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:528 "if(count>1)target=min(target,min(1100/(maxX-minX+VisualTuning["`),
with **no floor applied afterwards**. Since 2026-10-06 a literal divisor follows the clamp on every follow state, solo
included (`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:529 "target/=RACE_ZOOM_OUT"`,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:92 "private val RACE_ZOOM_OUT=1.5"`), an owner decision
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:91 "Race camera sits 50% farther away than the authored zoom (owner, 2026-10-06)"`).
The effective solo range is 8.5 to 11.3 px/m: every car is under 80 pixels at the floor, and Needle, Quill and Trail
are under it even at standstill. The shared term still falls without bound as the cars separate: two cars 200 metres
apart in x give 1100 / (200 + 30) / 1.5, about 3.2 pixels per metre, which puts the 6.6-metre car near 21 pixels.
This is derived arithmetic from the code, not an observation of the running game; no capture was taken for this
document. The unit test cannot see it because it multiplies the car length by `minPixelsPerM` and never runs the
camera. The design note anticipated the shared widening
(`docs/concepts/deathride/W6-tracks.md:9 "Shared framing may still widen for two separated players"`) and still forbids
the solo zoom-out (`docs/concepts/deathride/W6-tracks.md:9 "Do not zoom out to cancel the request"`); neither the note,
the table nor the test changed. The technique names the case: either floor the mode, or state it as a mode exempt
from the contract, in the table. The standard stays. The companion `kotlin` application works the figures through.

The non-following branch sets the scale to fit the whole circuit
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:520 "var pixelsPerM=min(1180.0/(course.maxX-course.minX)"`),
which the design note declares a map and not the driving scale
(`docs/concepts/deathride/W6-tracks.md:15 "explicitly a map, not the driving scale"`): the right way to exempt a mode.
The lobby no longer uses it. It now has a close live camera
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:531 "Lobby backdrop: a close, live look at the demo pack"`)
at a literal `deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:995 "private const val LOBBY_PIXELS_PER_M=9.0"`,
while the note still calls the lobby overview a map. The exemption is now implicit and outside the table.

## Deviation: the prose and the data disagree about the range

The design note states the solo range three ways: `docs/concepts/deathride/W6-tracks.md:9 "12.8-17 logical pixels/m"` ... "approximately 84-158
logical pixels long", `docs/concepts/deathride/W6-tracks.md:15 "approximately 65"` ("roughly 13-17 logical pixels/metre ... 65-95 logical
pixels long"), and the table says 12.8 and 17. The 84-158 figure agrees with the table and the dimensions (6.6 x 12.8 = 84, 9.3 x 17 = 158);
the 65-95 figure does not and is a stale value from before the sizing pass. The contradiction is unfixed at `d9990777`, and
neither range now matches the running camera, which gives about 56 to 105 pixels. A contradiction between siblings is a defect
in its own right, and the number a reader would act on depends on which paragraph they hit.

## Upward lessons

- A contract asserted only over data proves the tables agree and says nothing about every state of the camera; the technique
  now asks for a second assertion that exercises the camera function over speeds and separations. It still does not exist,
  and it would have failed on the day of the owner's zoom-out.
- The 5 percent margin between the floor and the minimum means any later shrinking of the roster or lowering of the floor
  breaks the test at once, which is the right behaviour and worth keeping. A divisor applied after the clamp in game code
  bypasses that margin entirely; an owner's felt change should land in the table, where the test reads it.
- A static scenery layer must extend beyond the circuit by the follow camera's visible margin, or a hard edge enters the
  driving view (`docs/concepts/deathride/PITFALLS.md:4 "must extend beyond the circuit's geometry bounds"`); a margin is
  a scale-dependent quantity and belongs in the presentation table beside the scale, which it is
  (`deathride/core/src/main/resources/data/presentation.csv:21 "sceneryMarginM,60"`). Whether 60 m still covers the wider
  view at 8.5 px/m was not checked.

## Evidence rung

Measured: the table arithmetic and the unit assertion (green). Derived: the live pixel figures, from the camera code.
Owner-decided: the 50 percent zoom-out. Authored: 12.8, 17, 80, 3.6. Not measured: whether cars at 56 to 105 pixels read
from a sofa on a television; the design note's own truth statement keeps "Owner sofa readability ... **not measured**"
(`docs/concepts/deathride/W6-tracks.md:44 "Owner sofa readability"`).
