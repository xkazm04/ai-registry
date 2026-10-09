---
layer: application
type: application
subject: racing-track-authoring-and-lint
technique: corner-radius-in-longest-car-lengths
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's radius floor: the bake took nearly two fifths of the authored radius

This reads the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to
that tree. The radii are computed on the game's own bake. Where they come from a committed report,
n is given. Whether a hairpin feels fair has not been asked of anyone.

## The rule as written

The floor is two longest-car lengths
(`deathride/core/src/main/resources/data/track-rules.csv:4 "minRadiusCarLengths,2"`). The
longest car is resolved from the roster on every call
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:237 "val longest=CarShapes.all.maxOf { it.lengthM }"`).
Today that is 9.3 m, so the floor is 18.6 m. The comparison has the technique's division-free
form, maximum curvature times length times multiple against one
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:239 "if(c.curvature.max()*longest*TrackRules["`).

Curvature is computed per vertex. It uses the wrapped heading change over the mean of the two
segment lengths
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:77 "curvature[i]=abs(wrapAngle(atan2(dy[i],dx[i])-atan2(dy[p],dx[p])))"`).
Sampling density is a fixed table value
(`deathride/core/src/main/resources/data/track-rules.csv:2 "samplesPerSpan,20"`), and the bake
reads it (`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:40 "private val subdivisions=TrackRules["`).
Wrap, fixed sampling, linting the bake: the three details of the technique are all present.

The same rule now guards alternative routes over their driven interval
(`deathride/core/src/main/kotlin/dev/deathride/core/TrackBranches.kt:36 "tight branch"`). The
quality instrument resolves the same key instead of copying it
(`deathride/tracks/quality-thresholds.csv:3 "minRadiusL,track:minRadiusCarLengths"`).

## Confirmed, with a measurement: lint the bake, not the authoring

The composer authors corners as explicit arcs with a radius in car lengths. Its first positive
control lost nearly two fifths of that radius in the bake
(`docs/concepts/deathride/R2-layout-composer.md:24 "a nominal 2.7 L radius could bake to 1.68 L at a transition"`).
The fix was headroom, not a looser floor
(`docs/concepts/deathride/R2-layout-composer.md:24 "The retained control uses 3.6 L author radii and its measured minimum is 2.23 L"`).
A Catmull-Rom spline through control points shrinks the radius where a straight meets an arc.
The composer spaces its control points equally to keep that boundary stable
(`docs/concepts/deathride/R2-layout-composer.md:22 "Equidistant control points keep line/arc boundaries stable"`).

The research note turns this into a rule
(`docs/concepts/deathride/R3-knowledge-for-registry.md:15 "the R2 nominal 2.7 L experiment failed at 1.68 L after baking"`).
This is the technique's "a spline between unevenly spaced control points can overshoot into a tight
kink", observed rather than argued. It also gives a number: authored radius was about 1.6 times
the baked minimum.

The installed library shows the floor biting. The 37 installed composer courses in
`deathride/tracks/atlas/candidates.json` (generated 2026-10-04) have minimum baked radii from 2.237
to 2.419 L. I re-baked three of them at `d9990777`, and their lengths match the file exactly.
Across all 102 proposals the range was wider
(`docs/concepts/deathride/R3-candidate-library.md:71 "minimum baked radii span 2.017"`). Every
course sits within 21% of the floor. Unlike the pacing band, this rule is close to binding.

## Deviation: the finding names neither the corner nor the radius

The finding text is only `corner radius too tight`
(`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:239 "corner radius too tight"`). It
gives no position along the lap, no radius in metres or lengths, and no count of vertices
examined. The numbers do exist in the tooling layer:
- the composer test's failure message
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackComposerTest.kt:50 "Minimum baked radius"`);
- the quality geometry
  (`deathride/core/src/test/kotlin/dev/deathride/core/TrackQualityGeometry.kt:154 "1 / c.curvature.max() / l"`).

A designer in the Track Lab sees them. The runtime linter's finding does not carry them.

## Deviation: the mutant is crude and not isolated

The corner mutant shrinks the whole course to a fifth of its size
(`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:15 "it.copy(x=it.x*.2,y=it.y*.2)"`).
On today's `foundry` that is a minimum radius of about 0.43 L, more than four times past the
limit. The road width is unchanged, so the 124 m lap is lapped by a 24 m road and also trips the
overlap rule. (That comes from my reimplementation of the bake, not from a test.) The assertion is
specific enough to pass. But this mutant would catch a missing rule and miss a doubled unit, and
there is no just-inside twin.

## Deviation: the longest body is not the longest wheelbase

The handling model gives each car a wheelbase as a fraction of its body length
(`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:134 "return DriftGeometry(shape.lengthM*r.number("`).
The fractions differ by car. Bastion, the rule's reference at 9.3 m, has
`deathride/core/src/main/resources/data/drift-geometry.csv:4 "Bastion,0.66"`, a wheelbase of
6.14 m. Kestrel is shorter at 9.15 m
(`deathride/core/src/main/resources/data/car-shapes.csv:10 "Kestrel,9.15,3.3"`), but it has
`deathride/core/src/main/resources/data/drift-geometry.csv:10 "Kestrel,0.78"`, a wheelbase of
7.14 m, the longest in the roster. A turning floor set by wheelbase would name Kestrel. The rule
names Bastion. The owner's handling checklist agrees with the wheelbase: it gives Kestrel the
widest arc and tells the tester to
`deathride/OWNER-CHECKS.md:152 "give the long wheelbase time"`. In metres, two lengths of the
longest body (18.6 m) is 30% more than two lengths of the longest wheelbase (14.3 m), so here the
body-length proxy is conservative. A roster with a short-bodied car on a long wheelbase would make
it lenient. The tree records no steering lock per car, so the true geometric minimum (wheelbase
over the tangent of full lock) cannot be computed from the data. This is derived from the tables,
not a test.

## Literals beside the table

Junctions require straight approaches through a code literal of 0.004 per metre, a radius of
250 m (`deathride/core/src/main/kotlin/dev/deathride/core/TrackJunctions.kt:22 "junction needs straight approaches"`).
That is a second curvature threshold with no table row and no mutant.

## Upward lesson

- When content is authored as arcs and baked through an interpolating spline, author with stated
  headroom over the floor. Here the measured ratio was about 1.6. Check the baked minimum on every
  export.
- Report the worst corner's position and radius in the finding. The tree computes them in two
  other places already.

## Evidence rung

Measured: the rule's verdict on every shipped course, the 37 baked minimums, and the composer's
2.7-to-1.68 and 3.6-to-2.23 L pairs. Simulated: every proposal passed a six-car AI rehearsal
(`docs/concepts/deathride/R3-candidate-library.md:3 "all 102 choices pass the six-car lap-rehearsal contract"`).
That says those drivers can get round the corners at their speeds. Authored, not felt: the
2 L floor. The tree has no handling-model check that a given car at a given speed holds the line
at 2 L.
