---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: px-per-metre-scale-contract
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's scale contract: green in the suite, breached on every race camera

The companion `process` application read this contract at `9793226`. It found the breach only in
the shared two-player camera. This one reads the `firetv` repository's `deathride/main` branch
at `d9990777`, on 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that tree. The
figures below are arithmetic from the code and tables. No frame was captured and nobody looked
from a sofa.

## The tables and the test, unchanged

The scale table is unchanged:
- `deathride/core/src/main/resources/data/presentation.csv:2 "soloPixelsPerM,17"`
- `deathride/core/src/main/resources/data/presentation.csv:4 "minPixelsPerM,12.8"`
- `deathride/core/src/main/resources/data/presentation.csv:20 "minimumCarPixels,80"`

The roster grew from five cars to ten, but its extremes did not move. The shortest car is still
`deathride/core/src/main/resources/data/car-shapes.csv:2 "Needle,6.6,3.0"`. The longest is still
9.3 m (`deathride/core/src/main/resources/data/car-shapes.csv:4 "Bastion,9.3,4.65"`), now
matched by `deathride/core/src/main/resources/data/car-shapes.csv:11 "Bulwark,9.3,4.6"`.

The assertion is the same line, moved
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:35 "shape.lengthM*VisualTuning["`).
It still multiplies car length by the table's floor and never runs a camera. It passes.

## Deviation: a divisor after the clamp, on every follow state

The follow camera still floors its target
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:527 "coerceAtLeast(VisualTuning["`).
Two lines later it divides the result
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:529 "target/=RACE_ZOOM_OUT"`). The
divisor is a literal in game code
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:92 "private val RACE_ZOOM_OUT=1.5"`).
It came from the owner
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:91 "Race camera sits 50% farther away than the authored zoom (owner, 2026-10-06)"`),
in commit `7f6689be` on 2026-10-06.

The stage is 1280 by 720 logical pixels
(`deathride/game/src/main/kotlin/dev/deathride/game/ViewBounds.kt:9 "The 1280x720 stage maps (640,350) to the focus"`).
So the solo driving range is now 17 / 1.5 = 11.3 down to 12.8 / 1.5 = 8.5 logical pixels per
metre. The whole range sits below the table's floor. At 8.5 every car in the roster is under 80
pixels, the 9.3 m cars included, at 79.4. At 11.3, which is standstill, Needle (74.8), Quill
(75.9) and Trail (78.2) are still under 80.

The shared term is still unfloored
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:528 "if(count>1)target=min(target,min(1100/(maxX-minX+VisualTuning["`).
Its result is now divided by 1.5 as well.

The design note still forbids exactly this
(`docs/concepts/deathride/W6-tracks.md:9 "Do not zoom out to cancel the request"`). The note was not
amended. Neither the table nor the test changed. The contract is green while no race camera
state honours it. This is the technique's failure case, now reached on the primary mode and not
only on the shared one.

## What did change for the shared view

A wrecked or finished car no longer widens the frame. Only active human drivers count
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:523 "if(c.human && !world.combat.wrecked(c.id) && c.finishSeconds<0)"`).
That followed a device session
(`docs/concepts/deathride/W8-integration.md:29 "A resolved driver's position had continued widening the shared camera"`),
and the pitfall log records it
(`docs/concepts/deathride/PITFALLS.md:28 "A shared camera that includes resolved human cars keeps zooming out around a distant wreck"`).
This removes one cause of separation. It does not add a floor.

## The lobby stopped being a map

The non-following scale still fits the whole circuit
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:520 "var pixelsPerM=min(1180.0/(course.maxX-course.minX)"`).
The lobby now has its own branch, though
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:531 "Lobby backdrop: a close, live look at the demo pack"`).
It uses a fixed literal
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:995 "private const val LOBBY_PIXELS_PER_M=9.0"`),
which puts Needle at 59 pixels. The design note still calls the lobby overview a map
(`docs/concepts/deathride/W6-tracks.md:15 "explicitly a map, not the driving scale"`). Nobody drives
the lobby, so exempting it is defensible. But the exemption is now implicit, and the constant
lives outside the presentation table.

## Still open from the first read

The note's two ranges still disagree. One says 84 to 158 pixels
(`docs/concepts/deathride/W6-tracks.md:9 "12.8-17 logical pixels/m"`). The other says 65 to 95
(`docs/concepts/deathride/W6-tracks.md:15 "approximately 65"`). The first matched the code until
2026-10-06. Neither matches it now. The live range is about 56 to 105 pixels.

The track research mixes bases. It states the visible area at 12.8 px/m on a 1920 by 1080 view
(`docs/concepts/deathride/R0-track-craft-research.md:45 "At the current minimum 12.8 px/m"`), but
the contract's pixels are logical, on a 1280-wide stage.

## Upward lessons

- An owner's felt decision is stronger evidence than an authored floor, and it should win. But
  it should win in the table. A literal divisor after the clamp hides the change from the
  contract's only test. The repair is either to lower `minPixelsPerM` and `minimumCarPixels` with
  the owner's reason, or to fold the factor into the table and assert on it. Both keep the data
  rung honest.
- The second assertion the technique asks for, the camera function over speeds and separations,
  still does not exist. It would have failed on the day of the owner's change.
- Every camera literal (1.5, 9.0, 1100, 1180) is a reader the presentation table cannot see.

## Evidence rung

Measured: the data assertion (green). Derived: every pixel figure above, computed from
`RaceGame.kt` and the tables. Owner-decided: the 50% zoom-out. The tree records no reason for it
beyond the comment. Not measured: readability on the Stick. The latest track wave left rendered
camera inspection pending
(`docs/concepts/deathride/R3-candidate-library.md:55 "rendered camera inspection on the Stick and sofa feel remain"`).
