---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: mutate-good-track-to-prove-linter
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's track linter: the base ledger is closed, the route rules are not

The companion `process` application read this linter at `9793226` and found four of ten rules
proven. This one reads the `firetv` repository's `deathride/main` branch at `d9990777`, on
2026-10-10, 446 commits later. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that tree.
Everything below is unit tests, committed evidence files and arithmetic. Nobody drove a track for
this document.

## The linter grew by composition

`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:236 "fun errors(c: Course): List<String>"`
still holds the ten base rules. It now first collects four other linters
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:237 "errors.addAll(TrackContent.errors(c));errors.addAll(ObstacleContent.errors(c));errors.addAll(TrackJunctions.errors(c));errors.addAll(TrackBranches.errors(c))"`).
Counting distinct finding strings, the gate now has 47 rules: 10 base, 14 content and feature
rules, 8 obstacle rules, 6 junction rules and 9 branch rules.

## The ledger, rule by rule

- **Base, 10 of 10.** One test adds the six missing mutants and asserts each named finding
  (`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:9 "fun remainingSixGeometryAndPacingRulesRejectTheirNamedMutants()"`,
  `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:21 "TrackLinter.errors(mutant).any{it.contains(rule)}"`).
  The design note records the closure
  (`docs/concepts/deathride/V1-verge-and-lint.md:15 "All ten base linter rules now have named mutants"`).
- **Content, 14 of 14.** Nine of them are in one table of mutants
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackContentTest.kt:8 "fun remainingFeatureVocabularyLengthGridAndRecoveryRulesHaveMutants()"`).
  The other five are in a second test
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackContentTest.kt:49 "fun pacingLinterRejectsUnwarnedOutsideAndNonRiskyFeatures()"`).
- **Obstacles, 8 of 8**
  (`deathride/core/src/test/kotlin/dev/deathride/core/ObstaclesTest.kt:31 "fun authoredPlacementsPassAndEveryNewLintRuleRejectsItsMutation()"`).
- **Junctions, 1 of 6, loosely.** One wrong declaration has a zero warning distance
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackComposerTest.kt:40 "listOf(TrackJunction(.1,.6,0.0))"`).
  It trips the declaration rule, and that rule `continue`s past the other five
  (`deathride/core/src/main/kotlin/dev/deathride/core/TrackJunctions.kt:17 "invalid junction declaration/warning"`).
  The assertion matches any finding that contains the word junction. The intersect, angle,
  straight-approach, grid-zone and feature rules have no mutant.
- **Branches, 0 of 9.** No test calls a branch mutant. The only other caller requires the list to
  be empty
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackComposer.kt:80 "require(TrackBranches.errors(course).isEmpty())"`).

So 33 of 47 rules have been seen to reject something, and all 14 unproven rules are route rules.
That fits the technique's prediction that rules added late are the ones left unproven. These rules
also have almost no shipped input. One installed course declares a junction
(`deathride/core/src/main/resources/data/tracks/crown-7-a-junctions.csv:2 "0.07078728896146613,0.5171507167519878"`).
Every one of the 37 branch sidecars is a bare header, for example
`deathride/core/src/main/resources/data/tracks/crown-7-a-branches.csv:1 "start,end,altStart,altEnd,nodeFile"`.
For the branch rules the evidence is empty on both sides: no failing mutant, and no shipped split
that passes.

## Confirmed

Each mutant copies a shipped course, changes one thing, and asserts the named finding. The
unmutated original must pass in the same test
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:12 "assertEquals(emptyList<String>(),TrackLinter.errors(c))"`).
The scope guard moved from an exact count of five to a floor read from the content table
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:43 "assertTrue(Courses.all.size>=TrackContent["`).

## Deviation: the overlap rule still returns early, and the evidence now shows it

The rule still exits as soon as it finds an overlap
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:268 "return errors"`). That return
comes before the pacing band. The quality instrument's committed proof, `deathride/tracks/atlas/gate-proof.json`
(n = 25 rows: 6 planted courses and 19 threshold-boundary fixtures, all fired), records what the
linter said about each planted course. Three results matter:

- The "over-gentle scaled course" has a straight fraction of 1.0
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualityReport.kt:21 "over-gentle scaled course"`).
  The linter reported only `ribbon overlap at segments 17/19` and gave no pacing verdict.
- The narrow-road course reported an overlap at segments 114/116.
- The crossing course reported `corner radius too tight` as well as the overlap. So the bow-tie
  mutant still does not isolate the overlap rule.

Segments 17 and 19 are neighbours, so the overlap rule fired on a false positive. The exclusion
is two full road widths of arc
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:267 "arcGap>clearance*2"`). Once a baked
segment is about one road width long, the segment two places along is outside that exclusion and
still within clearance. I checked this with a JavaScript reimplementation of the bake. It
reproduces the lengths of three installed courses exactly. On today's `foundry` scaled by five,
it fires at segments 22/24, with a 24.29 m segment against 24 m of clearance. That is derived
arithmetic, not a test in the tree. (The proof file's planted lengths predate today's `foundry`
geometry, which is why its segment indices differ.) The shape instrument in the same tree uses a
wider exclusion
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeReport.kt:71 "max(8*TrackQuality.longest,4*fullWidth)"`).

## What junctions and splits did to the model

A declared at-grade junction waives the overlap rule near its two points
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:267 "!TrackJunctions.permits(c,c.arc[i],c.arc[j])"`).
At runtime, projection uses the previous progress to keep passage identity
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:170 "Preserve passage identity at an at-grade crossing"`).
A test walks 25 m either side of both passages and asserts there is no jump
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackComposerTest.kt:36 "TrackJunctions.cyclicGap(c,s,q.s)<1"`).
The same crossing with the declaration removed must report an overlap
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackComposerTest.kt:38 "val undeclared=Course("`).

A split is a second closed `Course`. Only an interval of it is driven, and that interval maps
monotonically onto the main lap
(`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:5 "Both ends map to the main lap, so shortcuts cannot award extra checkpoints"`).
The single closed curve survives as the progress authority. Alternatives hang off it.

## Upward lesson

- An early return is now measured, not only predicted. A planted pacing defect was hidden by an
  overlap the planted shape did not intend.
- An overlap exclusion stated in widths also needs an upper bound on segment length, or a floor
  stated in samples.
- Route topology brought its own rule family. The ledger should be kept per linter, because an
  aggregate count of 33 of 47 hides that branches are at zero.

## Evidence rung

Measured: the 33 named rejections, which run in the unit suite, and the 25 fired rows in
`gate-proof.json`. Measured as a shape gate: 15 planted geometry witnesses
(`deathride/core/src/test/kotlin/dev/deathride/core/TrackShapeTest.kt:8 "fun everyShapeGateHasAnActualPlantedGeometryWitness()"`).
Derived: the false-positive mechanism. Not measured: every branch rule, and five of the six
junction rules.
