---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: mutate-good-track-to-prove-linter
stack: process
status: forged
verified_on: 2026-10-01
---

# A ten-rule track linter, four rules proven by mutation

Source tree `firetv-deathride`, branch `deathride/main`, at commit `9793226`. The track linter is a
pure function from a baked `Course` to a list of findings; the tests that exercise it are the
subject of this document. Everything here is geometry arithmetic and unit tests: nothing in it
involved a person driving a track, and every threshold is authored, not tuned on human play.

## The linter and its rules

`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:120 "fun errors(c: Course): List<String>"`
holds ten rules. Widest and longest car come from the roster at call time
(`:121` `val widest=CarShapes.all.maxOf { it.widthM }`), and thresholds come from the rules table
through a getter that throws on a missing key (`:9` `operator fun get(key: String)=values.getValue(key)`),
so a rule never silently falls back to a literal. The rules, with their lines:

- width in widest-car widths, `:122` `"road narrower than minimum car widths"`;
- corner radius in longest-car lengths, `:123` `"corner radius too tight"`;
- checkpoint order, `:124`;
- grid count, `:125` `"six grid positions required"`;
- unknown spot kind, `:128` `"unknown spot"`;
- spot outside the road, `:130` `"spot outside road"`;
- spot fraction, `:131` `"spot fraction"`;
- grid capsule overlap, `:137` `"grid cars overlap"`;
- distant ribbon overlap, `:148` `"ribbon overlap at segments $i/$j"`;
- straight-fraction band, `:153` `"outside pacing band"`.

An eleventh, closure, is a construction-time `require` at `:45` `"centerline must explicitly close"`, so it
cannot be reached through the linter and is not counted in the ten.

## The mutants that exist

`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:33 "fun linterRejectsNarrowReorderedAndCrossingCourses()"`
copies the first shipped course into a `bad` course with one change each:

- narrow: `:36` `c.nodes.map{it.copy(width=2.0)}` and asserts `it.contains("narrower")`;
- reordered gates: `:37` moves the `.45` checkpoint to `.1` and asserts `it.contains("order")`;
- crossing: `:38` builds a four-node bow-tie of half-width 9 and `:39` asserts `it.contains("overlap")`.

The grid mutant sits in a different test, `:25-26`: it rewrites every grid spot to `fraction=-.02, laneM=0.0`
(all six slots on one point) and asserts `it.contains("grid cars overlap")`. The negative half is
`:28-30`, `fun allAuthoredContentPassesGeometryAndPacingLint()`: `assertEquals(5,Courses.all.size)` then
`assertEquals(emptyList<String>(),TrackLinter.errors(c),c.id)` for every shipped course. That `assertEquals(5,...)`
is a non-empty-scope guard in the sense of the technique: a loader that handed the linter nothing would fail it.

## Reconciliation

**Confirmed.** Mutate-a-good-track, copy-with-one-change, assert on the finding text and keep the
unmutated set as the negative: lines `:35-39` and `:28-30` do exactly this. The thresholds are read from
the canonical table and a missing key throws (`:9`). The scope guard is present.

**Deviation: the ledger is four of ten.** No test mutates the corner-radius rule (`:123`), the
straight-fraction band (`:153`), the grid count (`:125`), the unknown-spot rule (`:128`), the
spot-outside-road rule (`:130`) or the spot-fraction rule (`:131`); `grep` for `too tight` and
`pacing band` finds those strings only in `Tracks.kt`. The corner and pacing rules are the two the
design brief leads with, so the rules most advertised are the least proven. The standard stays:
an unproven rule is reported unproven, and the repo's own design note claims the tests "mutate good
geometry to prove the linter rejects bad content" (`docs/concepts/deathride/W6-tracks.md:21 "mutate good geometry to prove the linter rejects bad content"`), which
holds for four rules and over-claims for the rest.

**Deviation: the overlap rule returns early.** `:148` `errors.add("${c.id}: ribbon overlap at segments $i/$j");return errors`
exits before the straight-fraction check at `:153`, and the straight total is accumulated inside the same
loop (`:142`). A track with an overlap therefore never reports its pacing verdict, and a mutant that trips
overlap cannot be used to test the band. The standard says collect or order the mutants so each rule is
reachable.

**Deviation: the crossing mutant is not locally smooth.** `:38` is a bow-tie of four far-apart nodes with
sharp turns, so it may also trip the corner rule; the assertion `.any{it.contains("overlap")}` is specific
enough to pass, but the mutant does not isolate overlap from the corner rule, and no twin mutant (two legs
close but not overlapping, expected to pass) exists to show the exclusion `arcGap>clearance*2` at `:145-147`
is doing its job.

**Upward lesson.** The repo showed that mutants can live next to an unrelated test (the grid mutant sits in a
scale test, not the linter test) and that this is how they get missed in a ledger; the technique now asks for
a rule-to-mutant ledger and for the boundary pair (just under and just over the limit), which the narrow mutant
at `:36` does not do: `width=2.0` is far below the limit and would catch a missing check but not a doubled unit.

## Evidence rung

Measured: the four rejections above are deterministic and fail the build if they stop firing. Simulated: the
race test at `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:50 "fun sixCarsFinishEveryCourseAndReplayDeterministically()"` runs seeded six-car
races on every course, which shows the authored circuits are traversable by scripted opponents. Authored and not
felt: every threshold, and any claim that the circuits are fair or well paced; the repo's own result note keeps
owner-felt readability and fun at "not measured" (`docs/concepts/deathride/W6-tracks.md:44 "Owner sofa readability"`).
