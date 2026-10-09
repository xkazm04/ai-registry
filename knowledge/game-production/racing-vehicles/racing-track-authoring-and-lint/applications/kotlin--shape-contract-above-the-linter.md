---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: shape-contract-above-the-linter
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride's shape contract: 29 lint-clean circuits rejected, every gate planted

This reads the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to
that tree. The contract is test-side tooling: it lives under the core test sources and its
thresholds sit outside the runtime data. Nothing here involved a person driving a circuit.

## The contract, kept apart from the linter

The runtime linter refuses a circuit at load. The shape contract refuses it entry to the
installed library. Two tests draw that line on the course's race profile, the mark a circuit gets
when it is installed. Every legacy course must fail at least one shape gate
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:10 "it.raceProfile==null"`).
Every installed course must pass all of them
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:13 "it.raceProfile!=null"`).
Thresholds are one table of minimums:
- `deathride/tracks/shape-thresholds.csv:2 "hullPerimeterRatio,1.12"`
- `deathride/tracks/shape-thresholds.csv:6 "directionReversals,1"`
- `deathride/tracks/shape-thresholds.csv:7 "cornerFamilies,3"`
- `deathride/tracks/shape-thresholds.csv:8 "foldbackRatio,0.03"`
- `deathride/tracks/shape-thresholds.csv:9 "straightBrakePairs,1"`
- `deathride/tracks/shape-thresholds.csv:10 "undeclaredCrossings,0,0,count"`

A straight-brake pair is
`docs/concepts/deathride/R1-shape-instruments.md:11 "Straight/brake pairs require"` a straight of
at least six car lengths before a turn of at least 45 degrees tighter than six lengths.

The quality table beside it carries the rhythm and race measures, each with its hypothesis:
- corner families as entropy (`deathride/tracks/quality-thresholds.csv:6 "radiusEntropy,0.5,,lap,bits,More than one radius family is present"`);
- passing under simulation (`deathride/tracks/quality-thresholds.csv:11 "overtakesPerFieldLap,0.5"`);
- line use (`deathride/tracks/quality-thresholds.csv:16 "lineEntropy,0.5"`);
- the evidence floor (`deathride/tracks/quality-thresholds.csv:17 "seedCount,12"`,
  `deathride/tracks/quality-thresholds.csv:18 "rotationCount,6"`,
  `deathride/tracks/quality-thresholds.csv:19 "distinctTrajectoryFraction,0.9"`).

The last of those is computed as distinct trajectory hashes over trials
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualitySimulation.kt:223 "distinctTrajectoryFraction"`),
so twelve seeds that replay one race cannot pass as twelve. The shared lint quantities are resolved
from the linter's rows, not copied
(`deathride/tracks/quality-thresholds.csv:3 "minRadiusL,track:minRadiusCarLengths"`).

## Confirmed: a witness per gate, and an empty input is not a pass

Every shape gate must have a planted geometry that fires
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:8 "fun everyShapeGateHasAnActualPlantedGeometryWitness()"`).
The note lists them: a circle for eight minimum gates, a real figure of eight for the crossing gate,
and transformed duplicates for similarity
(`docs/concepts/deathride/R1-shape-instruments.md:19 "All **15 planted witnesses** fire"`). They are
course bakes, not invented metric rows. The circle also has known answers: a hull perimeter ratio of
one and 360 degrees of signed turn
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:17 "assertEquals(1.0,s.metrics.getValue("`).
An empty metric set reports every gate as unmeasured, not passed
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:21 "shapeGates(emptyMap()).all"`).

The witness earned itself once. The circle first counted as a hairpin under an unbounded angle rule
(`docs/concepts/deathride/R1-shape-instruments.md:21 "The circle initially counted as a hairpin under an unbounded"`).

## Measured: the library the linter passed

All 29 legacy circuits pass the linter
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:44 "Courses.all.flatMap{TrackLinter.errors(it)}"`).
All 29 fail the contract, and 81 pairs among them are similar
(`docs/concepts/deathride/R1-shape-instruments.md:19 "29/29 old merged outlines fail; 81 pairs are similar"`).
Similarity is outline and turning distance under normalisation for start, direction, reflection and
rotation (`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeReport.kt:96 "fun shapeSimilarity(a: TrackShape,b: TrackShape)"`).
The library had been rejected before the contract existed
(`docs/concepts/deathride/R3-knowledge-for-registry.md:1 "after an oval-library rejection"`). The
contract agrees with that rejection. It does not show its minimums are where a person would set
them.

## Measured: a pacing edit broke shape

Stretching two circuits for duration took away their hairpins
(`docs/concepts/deathride/R3-candidate-library.md:19 "Their physical lint and simulation results alone had not detected that loss"`).
The tree's rule now is to re-run the contract after every pacing edit
(`docs/concepts/deathride/R3-knowledge-for-registry.md:37 "Re-run the shape contract after every pacing edit"`),
and to key simulated evidence on the grid position as well as the nodes
(`docs/concepts/deathride/R3-knowledge-for-registry.md:35 "Evidence cache keys must include the grid/start fraction"`).

## One exclusion

The contract's proximity and fold-back measures exclude arc neighbours over the larger of eight car
lengths and four road widths
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeReport.kt:71 "max(8*TrackQuality.longest,4*fullWidth)"`).
The runtime linter's overlap rule uses two road widths
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:267 "arcGap>clearance*2"`), and the
quality proof records it firing on a road's own continuation (`deathride/tracks/atlas/gate-proof.json:1 "ribbon overlap at segments 17/19"`).
Two instruments in one tree hold two definitions of "far along the lap". The contract's definition is
the sound one.

## Applied

The A/B is a simulation over the cases above. The old reading had one rhythm gate, the band, and
left the rest to a person. It accepts all 29 legacy circuits and the two stretched ones. The
technique refuses all 31, and it agreed with the person on the 29. It is better on this tree.
Falsifier: a lint-clean library that a person accepts and the contract rejects wholesale.

## Evidence rung

Measured: 15 planted witnesses firing, 29 of 29 legacy rejections, the invariance and known-answer
tests. Simulated: the race measures, from seeded AI opponents with the seed, rotation and
distinct-trajectory floors. Authored: every minimum. Not measured: whether an accepted circuit is
fun. The tree's own report header says so
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualityReport.kt:101 "owner feel unmeasured"`).
