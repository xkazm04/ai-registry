---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: width-in-widest-car-widths
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride's width floor: confirmed, joined by a passing width and a warning against too wide

This reads the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to
that tree. The widths are the game's own bake. Where they come from a committed report, n is given.
Nobody has reported how any of these roads feels to drive.

## The rule as written

The minimum is a multiple of the widest body
(`deathride/core/src/main/resources/data/track-rules.csv:3 "minWidthCarWidths,3.6"`). The widest
body is resolved from the roster on each call
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:237 "val widest=CarShapes.all.maxOf { it.widthM }"`).
The stored half-width is doubled before the comparison
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:238 "if(c.width.min()*2<widest*TrackRules["`).
Width is interpolated linearly between nodes
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:69 "width[i]=b.width+(c.width-b.width)*t"`),
so the minimum of the baked array is a node minimum and the technique's shortcut is sound here.

The same key guards alternative routes
(`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:35 "narrow branch"`). The
quality instrument resolves the key instead of copying it
(`deathride/tracks/quality-thresholds.csv:2 "minWidthW,track:minWidthCarWidths"`). The design note
states that discipline outright
(`docs/concepts/deathride/T1-track-instruments.md:26 "not independently tuned by the instrument"`).

## Confirmed: the composer authors in car units

The layout composer takes distances in longest-car lengths and widths in widest-car widths
(`docs/concepts/deathride/R2-layout-composer.md:7 "Distances are longest-car lengths L = 9.3 m, full road width uses W = 4.65 m"`).
The unit of the rule is now the unit of authoring, which is the strongest form of the technique.
The candidate library used three width tiers
(`docs/concepts/deathride/R3-candidate-library.md:21 "The initial technical road is 3.7 W, with 4.3 W releases and 5.15 W passing areas"`).

Across the 37 installed composer courses in `deathride/tracks/atlas/candidates.json`, minimum width
runs from 3.70 to 4.15 W and maximum width is 5.15 W on every one. I re-baked three of them at
`d9990777` and they match. The floor is close to binding, at 3% above 3.6.

## Not exercised: a roster change

The roster went from five cars to ten. The widest body is still
`deathride/core/src/main/resources/data/car-shapes.csv:4 "Bastion,9.3,4.65"`, and the new
`deathride/core/src/main/resources/data/car-shapes.csv:11 "Bulwark,9.3,4.6"` is narrower. The
technique's decision rule, re-lint when a wider car arrives, has not yet been triggered by a real
change. Its value here is still untested.

## Extension: two more width numbers, both in car units

The quality instrument adds two width diagnostics on top of the floor. They are flags for review,
not lint failures:
- **Passing.** A passing zone needs full width of
  `deathride/tracks/quality-rules.csv:20 "overtakeWidthW,5"` for a length of
  `deathride/tracks/quality-rules.csv:21 "overtakeLengthL,4"` after a braking drop. A lap needs at
  least two such zones
  (`deathride/tracks/quality-thresholds.csv:7 "overtakeZones,2"`).
- **Compression.** Road below `deathride/tracks/quality-rules.csv:19 "compressionWidthW,4.2"` is
  compression, and no more than 35% of a lap may be compressed
  (`deathride/tracks/quality-thresholds.csv:8 "compressionFraction,,0.35"`).

Measured compression did change the content
(`docs/concepts/deathride/R3-candidate-library.md:21 "Some measured compression failures required 4.15 W technical releases"`).
This is the technique's "racing budget" made checkable: one number for "fits", another for "can
pass".

## The failure the floor cannot see: too wide

The research measured the old roads in both denominators
(`docs/concepts/deathride/R0-track-craft-research.md:39 "9 widths of Needle"`). A 27 m road is 5.81
widest-car widths and nine widths of the smallest car. The note concludes: print both
(`docs/concepts/deathride/R0-track-craft-research.md:39 "Always print both reference and metres"`).
The registry draft gives the consequence
(`docs/concepts/deathride/R3-knowledge-for-registry.md:13 "A 27 m road hides too much corner structure"`).

The widest-car unit is right for a floor, because it is conservative for every assignment. But it
makes an over-wide road look modest, because most of the field is narrower.

## Deviations

- The finding text is still `road narrower than minimum car widths`
  (`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:238 "road narrower than minimum car widths"`).
  It gives no measured width and no lap position.
- The new route rules hold their geometric tolerances as code literals, not table rows: a 1.5 m
  join (`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:30 "hypot(a.x-b.x,a.y-b.y)>1.5"`),
  a 1 m width step (`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:31 "branch width discontinuity"`)
  and a 45 to 135 degree crossing angle
  (`deathride/core/src/main/kotlin/dev/deathride/core/TrackJunctions.kt:21 "angle !in 45.0..135.0"`).
  These are metres and degrees beside a rule that insists on car units.

## Upward lesson

- Keep the floor in widest-car widths. Report the narrowest point also in metres and in the
  typical car's width, because the widest-car unit hides an upper-side problem.
- A single minimum is the existence proof for racing. A second width, for passing over a stated
  length, is what the content was actually tuned against here.

## Evidence rung

Measured: the floor's verdict on every shipped course, and the 37 baked widths. Measured as a
diagnostic, not a gate: passing zones and compression, from the game's bake. Simulated: six-car AI
traversal and overtake counts on every proposal. Not felt: whether 3.7 W technical road leaves a
human room to pass.
