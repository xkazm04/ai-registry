---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: mutate-good-track-to-prove-linter
stack: process
status: forged
verified_on: 2026-10-10
---

# A ten-rule track linter, four rules proven by mutation, then ten

Source tree `firetv-deathride`, branch `deathride/main`. It was first read at commit `9793226` on
2026-10-01. Every anchor was re-resolved at `d9990777` on 2026-10-10. The track linter is a
pure function from a baked `Course` to a list of findings; the tests that exercise it are the
subject of this document. Everything here is geometry arithmetic and unit tests: nothing in it
involved a person driving a track, and every threshold is authored, not tuned on human play.

## The linter and its rules

`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:236 "fun errors(c: Course): List<String>"`
holds ten base rules. Since the first read it first collects four more linters
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:237 "errors.addAll(TrackContent.errors(c))"`),
so the gate now has 47 distinct findings; the companion `kotlin` application counts them. Widest and
longest car come from the roster at call time
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:237 "val widest=CarShapes.all.maxOf { it.widthM }"`),
and thresholds come from the rules table through a getter that throws on a missing key
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:9 "operator fun get(key: String)=values.getValue(key)"`),
so a rule never silently falls back to a literal. The base rules, with their lines in `Tracks.kt`:

- width in widest-car widths, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:238 "road narrower than minimum car widths"`;
- corner radius in longest-car lengths, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:239 "corner radius too tight"`;
- checkpoint order, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:240 "checkpoint order"`;
- grid count, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:241 "six grid positions required"`;
- unknown spot kind, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:244 "unknown spot"`;
- spot outside the road, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:246 "spot outside road"`;
- spot fraction, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:247 "spot fraction"`;
- grid capsule overlap, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:253 "grid cars overlap"`;
- distant ribbon overlap, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:268 "ribbon overlap at segments $i/$j"`;
- straight-fraction band, `deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:273 "outside pacing band"`.

An eleventh, closure, is a construction-time `require` at
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:62 "centerline must explicitly close"`, so it
cannot be reached through the linter and is not counted in the ten.

## The mutants that exist

`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:47 "fun linterRejectsNarrowReorderedAndCrossingCourses()"`
copies the first shipped course into a `bad` course with one change each:

- narrow: `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:50 "c.nodes.map{it.copy(width=2.0)}"` and asserts `it.contains("narrower")`;
- reordered gates: `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:51 "it.fraction==.45)it.copy(fraction=.1)"` and asserts `it.contains("order")`;
- crossing: `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:52 "TrackNode(-80.0,60.0,9.0"` builds a four-node bow-tie of half-width 9 and
  `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:53 "TrackLinter.errors(copy(nodes=crossing))"` asserts `it.contains("overlap")`.

The grid mutant sits in a different test,
`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:39 "it.copy(fraction=-.02,laneM=0.0)"`:
it puts all six slots on one point and asserts `it.contains("grid cars overlap")` on the next line. The negative half is
`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:42 "fun allAuthoredContentPassesGeometryAndPacingLint()"`.
At the first read it was `assertEquals(5,Courses.all.size)` then a per-course empty-list assertion carrying `c.id`.
The exact count of five is now a floor read from the content table
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:43 "assertTrue(Courses.all.size>=TrackContent["`),
still a non-empty-scope guard in the sense of the technique. The per-course check became one flattened assertion
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:44 "Courses.all.flatMap{TrackLinter.errors(it)}"`),
so a failure no longer names its course in the message, though each finding string still does.

## Reconciliation

**Confirmed.** Mutate-a-good-track, copy-with-one-change, assert on the finding text and keep the
unmutated set as the negative: the linter test and the all-content test do exactly this. The thresholds are read from
the canonical table and a missing key throws. The scope guard is present.

**Deviation, since closed: the ledger was four of ten.** At `9793226` no test mutated the corner-radius,
straight-fraction, grid-count, unknown-spot, spot-outside-road or spot-fraction rules, and `grep` for `too tight` and
`pacing band` found those strings only in `Tracks.kt`. The corner and pacing rules are the two the design brief leads
with, so the rules most advertised were the least proven, and the design note's claim that the tests "mutate good
geometry to prove the linter rejects bad content" (`docs/concepts/deathride/W6-tracks.md:21 "mutate good geometry to prove the linter rejects bad content"`)
over-claimed. The six missing mutants landed the same day, in commit `646f37a7`
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:9 "fun remainingSixGeometryAndPacingRulesRejectTheirNamedMutants()"`),
the pacing rule matched as `straight fraction`
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:20 "straight fraction"`). The base ledger is ten of ten
and the note's claim holds for the base rules. Across all 47 rules it is 33 proven; the route rules sit at 1 of 6
(junctions) and 0 of 9 (branches). The companion `kotlin` application keeps that ledger.

**Deviation: the overlap rule returns early.**
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:268 "return errors"` exits before the straight-fraction
check, and the straight total is accumulated inside the same loop
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:258 "straight+=c.arc[i+1]-c.arc[i]"`). A track with an
overlap therefore never reports its pacing verdict. This still holds, and is now measured: the committed proof
records a planted over-gentle course whose only finding is an overlap, with no pacing verdict
(`deathride/tracks/atlas/gate-proof.json:1 "ribbon overlap at segments 17/19"`). The standard says collect or order
the mutants so each rule is reachable.

**Deviation: the crossing mutant is not locally smooth.** The bow-tie is four far-apart nodes with sharp turns; the
same proof file records `corner radius too tight` beside the overlap on its crossing course. The `.any{...}`
assertion is specific enough to pass, but the mutant does not isolate overlap, and no twin mutant (two legs close
but not overlapping, expected to pass) exists to show the exclusion
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:267 "arcGap>clearance*2"` is doing its job.

**Upward lesson.** The repo showed that mutants can live next to an unrelated test (the grid mutant still sits in a
scale test, not the linter test) and that this is how they get missed in a ledger; the technique now asks for
a rule-to-mutant ledger and for the boundary pair (just under and just over the limit), which the narrow mutant
does not do: `width=2.0` is far below the limit and would catch a missing check but not a doubled unit.

## Evidence rung

Measured: the base rejections above are deterministic and fail the build if they stop firing. Simulated: the race test
at `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:64 "fun sixCarsFinishEveryCourseAndReplayDeterministically()"`
ran seeded six-car races on every course at the first read; it now runs only the legacy courses without a race profile
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:67 "for(c in Courses.all.filter{it.raceProfile==null})repeat(4)"`),
and installed courses have separate proofs. Authored and not felt: every threshold, and any claim that the circuits are
fair or well paced; the repo's own result note keeps owner-felt readability and fun at "not measured"
(`docs/concepts/deathride/W6-tracks.md:44 "Owner sofa readability"`).
