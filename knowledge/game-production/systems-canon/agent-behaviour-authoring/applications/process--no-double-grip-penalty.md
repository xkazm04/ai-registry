---
layer: application
type: application
subject: agent-behaviour-authoring
technique: no-double-grip-penalty
stack: process
status: forged
verified_on: 2026-10-01
---

# One grip limit for the car and the rival, and the ice race that found a second one

How a six-car arcade racer built for a living-room television derives its rivals' corner speed
and spacing. Every citation below was re-opened on the date above against the game's source
tree. Honesty note: everything here is **simulated** (seeded, deterministic runs on a Windows
JVM at the fixed 60 Hz step) or **authored**. No person has raced these rivals; the document
that records the repair says itself that owner feel was not measured.

## Corner speed from the same limit the car obeys

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:315` builds the target speed of a
classed rival as the smaller of a cruise cap and a corner limit:

> `sqrt(c.spec.maxLateralAccelerationMps2*track.surfaceAt(s+look,lane).gripScale*CarCatalog.aiGripFraction/point.curvature)-skill.cornerMarginMps`

That is the derivation in `ai-corner-speed-from-grip-limit` almost term for term: the car's own
lateral limit, the surface grip sampled at the look-ahead point on the intended lane, a skill
fraction, the curvature, and a separate subtraction after the root. The two dials live in data:
`deathride/core/src/main/resources/data/car-rules.csv:5` `aiCruiseFraction,0.97` caps the
target at 97 percent of top speed, and `:6` `aiGripFraction,0.70` has the rival use 70 percent
of the lateral budget. The margin is per skill row in `ai-skills.csv` (`cornerMarginMps` is 4
for the Rookie row and 2 for Club). The design note for the wave states the intent in one
line, `docs/concepts/deathride/W3-movement.md:17`: "AI sees the same grip limit and lowers
corner speed, with no physics cheats". Confirmed on every point, including the one the
technique treats as optional: grip is read ahead (`s+look`), not underfoot.

## The duplicate and how it was found

`docs/concepts/deathride/W3-movement.md:32` records the defect: "Initial ice run failed the 180 s
completion requirement for Bastion. The AI applied grip once in the lateral acceleration corner
limit and again as a speed multiplier. Removing that duplicate corner reduction fixed
completion without adding power." The Bastion class on the lowest-grip surface
(`surfaces.csv:5` `Ice,0.32,0.01`) did not finish inside the 180 second race limit
(`track-rules.csv:8` `maxRaceSeconds,180`). Nothing in a normal race looked wrong.

The instrument was a completion test across the surface list.
`deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:44`
`everySurfaceCompletesSeededAiRacesDeterministically` loops every surface three times
(`:46` "for(surface in Surfaces.all) repeat(3)"), runs a twin world for determinism, steps until
180 seconds or six finishers (`:49`), and asserts `assertEquals(6,a.finished,...)` at `:51`.
Six surfaces by three seeds are the 18 races the wave note counts (`W3-movement.md:21` "18
seeded races, six finishes each"). It also writes a per-cell CSV at `:53`, which is the
near-miss report the technique asks for; the note tabulates the ice band as 115.217 to
121.267 seconds, comfortably inside 180 now.

## What the repair left behind

The fix is visible at `World.kt:316`:

> `val surfaceLimit=if(point.curvature>0)1.0 else sqrt(c.surface.gripScale).coerceIn(Movement.aiSurfaceMargin,1.0)`

A second surface factor still exists, but it is exclusive by construction: it is 1.0 whenever
the point ahead is a corner, so the corner limit at `:315` is the only place grip enters a
corner, and the underfoot factor acts only on straights. That is the "exclusive by
construction" repair the technique recommends. Two points against the standard follow.

**Deviation: a clamp hides the straight-line penalty.** On a straight the factor is
the square root of the grip scale clamped to `aiSurfaceMargin` (`movement.csv:19`, 0.8). Ice (about 0.57), oil (about 0.69) and offtrack (about 0.74)
are all clamped to 0.8, while gravel and kerb give 0.85 and 0.92. The slowdown on a straight is therefore authored, not derived, and no
test asserts which surface is bound by the clamp. The standard wants every speed factor to
carry a one-line statement of its single cause, and there is none beside `:316`.

**Deviation: the regression guard is a completion test, not a factor audit.** Nothing fails if
a future edit reintroduces a second factor that merely does not push a class past 180 seconds;
the 180 second limit and the six-finisher assertion are the only detectors. The standard
accepts that as the cheap floor and adds that a near-miss should be visible, which the CSV
output at `MovementTest.kt:53` provides but nothing reads.

## Distances in car sizes

The rival's relational distances are ratios in `track-rules.csv`: `:12` `aiOvertakeCarLengths,2.4`,
`:13` `aiLaneCarWidths,0.55`, `:14` `aiPassCarWidths,1.5`, `:15` `aiLookCarLengths,1.4`. (The
scout's anchor for these was lines 58 to 63; the file has 17 lines, and the right range is 11 to 15,
with `:11` `aiLateralClearanceM,0.5` the one metre value among them.) They are converted at use
in `World.kt`: the pass trigger at `:303` is
`(c.spec.circleRadiusM+c.spec.circleOffsetM)*2*TrackRules["aiOvertakeCarLengths"]*(c.aiStyle?.passDistanceScale?:1.0)`,
the pass lane at `:305` is `c.spec.circleRadiusM*2*TrackRules["aiPassCarWidths"]`, and the look-ahead
floor at `:307` is a car-length ratio with the speed term added at `:308`. The style multiplier
`passDistanceScale` rides on top, as the technique wants. The track validator uses the same basis
(`Tracks.kt:122` "road narrower than minimum car widths", `:123` "corner radius too tight"), so the
road and the rivals rescale together.

**Deviation: firing and chase ranges are absolute, which is right for the first and unstated
for the second.** `Combat.kt:184` starts a rival's firing range from the weapon's own range,
`Weapons.all[Weapons.RIVET].rangeM*(c.aiStyle?.fireRangeScale?:1.0)` (48 metres in
`weapons.csv:2`), which is correct: a weapon does not reach further because the car is bigger.
The chase test at `:192` mixes `aiChaserRangeM` (22 metres, `combat.csv:19`) with a car-width
band (`:20` `aiChaserCarWidths,1.1`). That is the declared-mixture case, but the metre half is
not named as a decision anywhere, and `World.kt:299` reads its lateral clearance in metres
(`aiLateralClearanceM`, 0.5), so the one clearance a rival uses to judge whether another car is in its lane does not scale with a
heavier body.

## What the repo added to the draft

One upward lesson, taken into `no-double-grip-penalty`: the repair kept a second surface factor
and made it exclusive by region instead of deleting it. That is a better rule than "delete the
duplicate" and the technique now states it ("make them exclusive by construction").
