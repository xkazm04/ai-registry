---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: oriented-capsule-grid-lint
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's grid lint: the capsule is unchanged, and the grid became a protected zone

This reads the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to
that tree. All of this is geometry and unit tests. Whether a back-row driver finds the first corner
survivable has not been asked.

## The capsule, as the technique writes it

Each pair of grid slots is sampled at its own arc position and lateral offset
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:249 "c.sample(s,spot.laneM,p)"`),
so each capsule follows that slot's heading. The segment half-length is half the difference
between the roster's longest length and widest width
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:250 "val offset=(longest-widest)*.5"`).
The required distance is the widest width plus a table margin
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:251 "val clearance=widest+TrackRules["`,
`deathride/core/src/main/resources/data/track-rules.csv:10 "gridClearanceM,0.8"`).

Segment distance includes the crossing test, so two crossing capsules report zero
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:280 "if(t in 0.0..1.0 && u in 0.0..1.0)return 0.0"`).
Negative arc positions wrap through `phase`
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:135 "fun phase(s: Double)=((s%lengthM)+lengthM)%lengthM"`).
The envelope is longest by widest for every slot, which is the technique's conservative choice.

Site checks use the same car. A spot must fit inside the road with the widest car's half-width
after the verge
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:246 "if(abs(spot.laneM)+widest*.5>c.widthAt(s)-Movement.vergeWidthM)"`).

## Confirmed: mutants and a silhouette agreement test

- **Overlap.** Moving all six slots onto one point behind the line must report an overlap
  (`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:39 "it.copy(fraction=-.02,laneM=0.0)"`).
  That mutant also uses a negative fraction on purpose.
- **Count.** Dropping one slot must report the count
  (`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:16 "c.spots.filterIndexed"`).
- **Silhouette.** Every car's collision circles must reproduce the dimension table
  (`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:45 "assertEquals(shape.widthM,spec.circleRadiusM*2)"`).
  A long car must have no collision hole in its middle
  (`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:30 "The drawn middle of a long car must not have a collision hole"`).

The silhouette test is exactly the cheap agreement test the technique asks for between the lint
capsule and collision's three circles.

## Extension: the grid is protected from every other layer

Since the first read, four other linters each refuse to put something on the grid:
- features (`deathride/core/src/main/kotlin/dev/deathride/core/TrackContent.kt:48 "feature covers grid"`);
- obstacles (`deathride/core/src/main/kotlin/dev/deathride/core/Obstacles.kt:71 "obstacle covers grid"`);
- junctions, over a warning distance
  (`deathride/core/src/main/kotlin/dev/deathride/core/TrackJunctions.kt:24 "junction covers grid warning zone"`);
- branches (`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:42 "branch covers grid"`).

The feature rule and the obstacle rule have mutants
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackContentTest.kt:20 "feature covers grid"`,
`deathride/core/src/test/kotlin/dev/deathride/core/ObstaclesTest.kt:43 "covers grid"`). The
junction rule and the branch rule do not.

The grid has become a protected zone that every content type is linted against, not only a set of
capsules linted against each other.

## Practice: put the grid on a straight

The composer looks for a straight long enough for all six cars
(`docs/concepts/deathride/R2-layout-composer.md:26 "The compiler locates a genuine straight long enough for all six oriented cars"`).
The first course pass also solved a bend overlap by moving the start, not by loosening the margin
(`docs/concepts/deathride/W6-tracks.md:36 "start moved onto the straight"`). The capsule check
still runs, but authoring now avoids the fanned-bend case the technique is built for.

## The grid is an input to evidence

A launch that moves without any change to the node file is a different experiment. An early cache
missed that, so simulation proofs are now keyed on the grid
(`docs/concepts/deathride/R3-knowledge-for-registry.md:35 "Evidence cache keys must include the grid/start fraction"`).
A test enforces this
(`docs/concepts/deathride/R3-candidate-library.md:41 "A regression test proves that moving a grid invalidates proof"`).
A grid that passes the capsule check can still invalidate a fairness result. The lint and the
proof cache have to agree on what the grid is.

## Deviations

- The finding is `grid cars overlap`, with no slot indices, measured distance or required distance
  (`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:253 "grid cars overlap"`).
- There is one finding per offending pair, unbounded. The quality instrument's committed proof
  (`deathride/tracks/atlas/gate-proof.json`, n = 6 planted courses) records four identical
  `grid cars overlap` lines on its continuous-circle course. That course was planted for pacing.
- "A good two-wide row must pass" is covered only by shipped courses passing. There is no
  just-clear twin of the overlap mutant.

## Upward lesson

When a game adds features, obstacles and route topology, the grid is the one place every one of
them must stay out of. Lint that as one rule family, with a mutant per layer. Key any start-order
evidence on the grid's position.

## Evidence rung

Measured: the capsule test on every shipped course, two grid mutants, and the silhouette agreement
test. Simulated: six-car starts and the early lead-slot wreck rate, which the instrument flags per
course as a surrogate for fairness. Not measured: human fairness from the back row.
