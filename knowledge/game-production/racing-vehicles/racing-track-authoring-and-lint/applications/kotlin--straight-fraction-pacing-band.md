---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: straight-fraction-pacing-band
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's pacing band: four readers, never binding, outranked by a shape contract

This reads the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to
that tree. The fractions below come from the game's own bake. Where they come from a committed
report, n is given. Nobody has driven these laps for this document.

## The band

Three rows in the rules table define it:
- `deathride/core/src/main/resources/data/track-rules.csv:5 "minStraightFraction,0.12"`
- `deathride/core/src/main/resources/data/track-rules.csv:6 "maxStraightFraction,0.85"`
- `deathride/core/src/main/resources/data/track-rules.csv:7 "straightCurvature,0.012"`

The threshold turn rate of 0.012 per metre is a radius of 83 m. That is about nine lengths of the
9.3 m longest car, below the technique's suggested few dozen. Straights are counted by arc length
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:258 "straight+=c.arc[i+1]-c.arc[i]"`).
Both ends of the band fail, and the finding prints the fraction
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:273 "outside pacing band"`).

## Confirmed: one threshold, four readers

The threshold is read in four places:
- **The linter**
  (`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:258 "if(c.curvature[i]<TrackRules["`).
- **The renderer's approach chevrons**
  (`deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:338 "Direction chevrons at the approach to sharper bends are visible at driving scale"`,
  `deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:339 "if(course.curvature[i]>TrackRules["`).
- **The AI's corner flag**, added since the first read
  (`deathride/core/src/main/kotlin/dev/deathride/core/AiBehaviour.kt:136 "s.corner=abs(point.curvature)>TrackRules["`).
- **The quality instrument**
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualityGeometry.kt:82 "val straight = BooleanArray(c.count) { c.curvature[it] < TrackRules["`).
  Its gate table resolves the band from the same keys instead of copying them
  (`deathride/tracks/quality-thresholds.csv:4 "straightFraction,track:minStraightFraction,track:maxStraightFraction"`).

A census of readers returns the linter, the presentation and two more. This is the technique's
"one threshold, two readers" with room to spare.

## Deviation: only the low end has a linter mutant

The low end is proven by a 16-node circle
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:13 "val circle=(0..16)"`,
`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:20 "copy(nodes=circle)"`). No
`TracksTest` mutant pushes the fraction above 0.85.

The quality instrument does plant one, a course scaled up five times
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualityReport.kt:21 "over-gentle scaled course"`).
Its committed proof (`deathride/tracks/atlas/gate-proof.json`, n = 25 rows, all fired) records
that the quality gate flagged a fraction of 1.0. The same row records that the linter said nothing
about pacing. It reported a ribbon overlap and returned
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:268 "return errors"`). The
technique's procedure step 4, "still run this one", is unmet, and the evidence now shows the cost.

## Deviation by evidence: the band never bound

The 37 installed composer courses carry geometry metrics in
`deathride/tracks/atlas/candidates.json` (generated 2026-10-04). I re-baked three of them at
`d9990777` and they match to the centimetre. Their straight fractions run from 0.369 to 0.728.
The closest any course comes to the floor is 0.25 above it. The closest to the ceiling is 0.12
below it.

The band rejected none of them, and it did not reject the old library either. Every one of the
29 pre-composer courses passes the linter. Every one fails a separate shape contract
(`docs/concepts/deathride/R1-shape-instruments.md:19 "29/29 old merged outlines fail"`), which a
test enforces
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:10 "it.raceProfile==null"`).
That library had already been rejected as a set of ovals
(`docs/concepts/deathride/R3-knowledge-for-registry.md:1 "after an oval-library rejection"`). The
note does not say who rejected it. The band, as the technique says, only says "not degenerate".
The tree had to build the next rung to say "not an oval".

## The rung the band lacks

The shape contract is a table of minimums:
- `deathride/tracks/shape-thresholds.csv:2 "hullPerimeterRatio,1.12"`
- `deathride/tracks/shape-thresholds.csv:6 "directionReversals,1"`
- `deathride/tracks/shape-thresholds.csv:8 "foldbackRatio,0.03"`
- `deathride/tracks/shape-thresholds.csv:9 "straightBrakePairs,1"`

A straight/brake pair is placed geometry: a straight of at least six car lengths before a
significant tight turn
(`docs/concepts/deathride/R1-shape-instruments.md:11 "Straight/brake pairs require"`). This is the
"where are the straights" question that the technique says the fraction cannot answer. Installed
courses must pass every shape gate
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:13 "it.raceProfile!=null"`).

The research says the same about a shared target
(`docs/concepts/deathride/R0-track-craft-research.md:19 "A shared straight-fraction target cannot express those distinct rhythms"`).
Its own figures from published circuits, 12.6% to 32.3%, all sit inside this band.

## Upward lesson

- The band is confirmed as a gate, not a quality score. The tree never reports it as quality. It
  added a measured shape contract as an acceptance gate for new content, kept apart from the
  runtime linter. That is a rung between "not degenerate" and "a person liked it". The golden
  path names only the two ends.
- Pacing edits can break shape. Stretching two courses for duration cost them their hairpins, and
  lint plus simulation did not notice
  (`docs/concepts/deathride/R3-candidate-library.md:19 "Their physical lint and simulation results alone had not detected that loss"`).
  The research note draws the rule from it
  (`docs/concepts/deathride/R3-knowledge-for-registry.md:37 "Re-run the shape contract after every pacing edit"`).

## Evidence rung

Measured: the low-end mutant, the four-reader census, and 37 fractions from the game's bake.
Measured as a gate: 29 of 29 old outlines rejected by shape, with 15 planted witnesses. Not
measured: whether any of these laps is well paced for a person. The owner's Keeps are choices
between proposals. They are not a measurement of rhythm.
