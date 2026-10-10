---
layer: application
type: application
subject: two-thumb-touch-layout-design
technique: relative-anchor-steering
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# A request for faster steering, answered on the glass and then moved into the model the same evening

Source tree: `firetv-deathride` on branch `deathride/main` at `d9990777`, read 2026-10-10; paths are
relative to its root. Kotlin 2.0.21. The simulation core is platform-independent and runs on the TV
host; the controller is the browser page described in the
[node application](./node--pointer-capture-per-control.md). No physical phone has driven either
version, so this records a design move and its reasons. It does not record a felt result.

## What happened, in two commits on 2026-10-06

The owner asked for more responsive steering. The first answer, commit `898f4928`, shortened the
stroke on the glass. Every feel preset's full-lock travel was halved and its dead zone doubled so
the dead zone kept its size in pixels. The owner checklist recorded the change at
`deathride/OWNER-CHECKS.md:307 "Balanced now needs about 57 px of drag for full lock (was 115)"`.
The same checklist named the risk that change carries: `deathride/OWNER-CHECKS.md:307 "you hit full lock by accident"`.

The second answer, commit `af448554` about fifty minutes later, reverted the travel and put a gain in
the model instead. The preset row is back at the long stroke:
`deathride/core/src/main/resources/data/feel.csv:5 "Balanced,0.03,1,115,0.28"`. The gain is one
authored row with its bounds:
`deathride/core/src/main/resources/data/drift.csv:38 "humanSteerGain,2,1,3,x"`. It is applied at
the one place yaw is computed from the filtered steering value:
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:172 "(if(c.human && !c.labCar)p.humanSteerGain else 1.0)"`.

The revert restored a rule the project had already written down before either commit:
`docs/concepts/deathride/D1-drift-research.md:19 "Do not shrink travel or multiply input during a slide."`
The response shaping stays in one place downstream as well. Dead zone and exponent are applied in core
at `deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:27 "fun shape(value: Double): Double"`.
The glass still sends the normalised value, bounded by the pad width:
`deathride/controller/index.html:140 "const travel=Math.min(feel.touchTravelPx,r.width*feel.touchTravelFraction)"`.

## The instrument is kept out of the gain

The drift lab is the project's calibration rig. It drives cars marked as human, so a gain keyed on
"a person is driving" alone would have moved every calibrated result. The lab marks its cars:
`deathride/core/src/main/kotlin/dev/deathride/core/DriftLab.kt:61 "car.human=true;car.labCar=true"`.
The reason is written on the field:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:180 "Drift-lab cars keep the calibrated steering so the lab stays a fixed instrument."`
AI cars are excluded because they are not human. Human cars take the player's input at
`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:381 "val input=if(c.human)inputs[i] else c.aiInput"`.

## What this application does and does not show

- **Shows:** the technique's decision rule held in the field. The stroke on the glass was the first
  thing changed and the first thing reverted, and the replacement lives downstream as one
  authored value.
- **Shows a cost the technique did not name.** The two answers are not equivalent. Halving the stroke
  keeps the car's maximum yaw and reaches it with half the drag. A gain of two on yaw raises the
  ceiling: at full lock a human-driven car turns twice as fast as the same car under AI control.
  A sensitivity request answered inside the physics changes what the vehicle can do. One answered in
  the response curve changes only how fast the thumb gets there. Whether the AI's pace or the race
  balance moved was **not measured** in this pass.
- **Shows the key is "a person drives", not "a thumb on glass".** Keyboard steering on the desktop
  build also takes the human input path, so it received the same gain. Whether that was intended
  was not checked.
- **Stale documentation.** `deathride/README.md:24 "Steering travel is half what it was"` still describes
  the reverted first answer. A player-facing doc that disagrees with the data row misleads the owner
  when they test.
- **Does not show** that either stroke or either gain is comfortable. The owner check for it is
  written and pending.
