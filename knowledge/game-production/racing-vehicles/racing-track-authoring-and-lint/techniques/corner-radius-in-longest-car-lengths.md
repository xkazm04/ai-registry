---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: corner-radius-in-longest-car-lengths
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [setting the tightest corner a circuit may contain, a hairpin is smooth on the plan and impossible in the car, converting turn rate on a baked ribbon into a radius check]
---

# Corner radius in longest-car lengths

The tightest bend on a circuit has to be one the longest car can actually turn in. The rule is
stated as a minimum **radius measured in lengths of the longest car in the roster**, and it is
checked on the baked ribbon as a maximum turn rate, because a baked ribbon is a polyline and a
polyline has no radius until you compute one.

## Why length, and why the longest

Width decides whether a car fits on the road; length decides whether it can rotate through the
bend. A car sweeps a larger arc the longer it is, and a hairpin that is comfortable for a short
car is a wall for a long one. The reference is the longest body, not the largest or the heaviest,
for the same reason the width rule uses the widest: the extreme that stresses the axis in question
is the one that must be satisfied. A roster whose longest car is a slim wedge and whose widest is a
squat wagon has two different extremes, and borrowing one for both rules makes one of them wrong.

**The body is a proxy for the wheelbase.** The geometric turning radius is set by wheelbase and
steering lock: in the bicycle model it is the wheelbase over the tangent of full lock. Overhang
widens the swept path but does not tighten the turn. Body length stands in for wheelbase only
where wheelbase is a fixed share of length. Where the handling model carries a wheelbase per car,
resolve the reference as the car with the longest wheelbase, or better, the largest wheelbase
over the tangent of its lock, and keep the body length for the swept-path margin. In one measured
roster the longest body (9.3 m, wheelbase 6.1 m) and the longest wheelbase (7.1 m on a 9.15 m
body) were different cars. The body-length rule was 30% more conservative than a wheelbase rule
at the same multiple, and it named the wrong car as the hardest to turn. A short-bodied car on a
long wheelbase makes the proxy lenient instead.

The unit also makes the rule transplant across scales. Two circuits built at different world scales
carry the same number if their cars are the same proportion, which a metre figure would hide.

## From polyline to radius

A baked ribbon has a position at every sample and nothing else. Estimate the **turn rate at each
vertex** as the absolute change in heading between the incoming and outgoing segment divided by the
mean length of the two segments. That is a curvature, in one over metres, and the radius it implies
is its reciprocal. The rule is then a comparison of the maximum curvature against the reciprocal of
the minimum radius, written without a division so a straight segment, whose curvature is zero, never
divides by zero:

    maxCurvature x longestCarLength x minRadiusInCarLengths  <=  1

Three details decide whether this is right.

**Wrap the heading difference.** Headings are angles; the difference between a heading just below a
half turn and one just above it is small, not nearly a full turn. Normalise to the shortest signed
angle before taking the magnitude, or the first vertex after a heading wrap reads as an infinitely
tight corner.

**Sample density is part of the instrument.** A vertex-to-vertex estimate over a coarse bake
understates a tight corner, because the corner is spread across too few vertices to read its true
rate, and over a very fine bake is noisy at control-point joins. The check is only as good as the
sampling that feeds it, so the sampling rate is a stated, fixed rule and not a variable the
designer can change; per
[an instrument proves it had input](../../../_laws.md#an-instrument-proves-it-had-input), report
how many vertices were examined beside the verdict, and fail if the count is zero.

**Lint the bake, not the control points.** Interpolating splines can overshoot between unevenly
spaced control points and produce a tight kink the designer never placed; the control polygon looks
gentle and the curve is not. Only the baked ribbon contains what the cars will drive on. The
loss is large enough to plan for. In one measured pipeline, corners authored as arcs of 2.7
car lengths baked to 1.68 where a straight met the arc. Corners authored at 3.6 baked to 2.23.
In both cases the authored radius was about 1.6 times the baked minimum. Author with stated
headroom over the floor, and check the baked minimum on every export, not the authored radius.

## What the minimum radius protects

At a radius of two longest-car lengths, the inner edge of a road that is several car widths wide is
still positive: the centreline radius minus the half-width stays above zero whenever the minimum
radius exceeds the half-width. That is a derived arithmetic fact worth checking in the units of the
data, because an inner edge with negative radius folds over itself and produces a ribbon with a
cusp, which breaks nearest-segment projection near the corner. Where the minimum radius in metres is
not larger than the half-width in metres, the width rule and the radius rule are in conflict and the
rules table is wrong, not the track.

## Procedure

1. Resolve the longest car from the roster's dimension table at check time, or the longest
   wheelbase where the handling model has one.
2. Read the minimum radius multiple from the canonical rules table; a missing key fails.
3. Compute curvature per vertex on the baked ribbon with wrapped heading differences.
4. Compare the maximum to the limit and, on failure, report the **position along the lap** of the
   worst vertex and the radius it implies in both metres and car lengths. A finding that names the
   corner is fixed in a minute; one that says "too tight" is argued with.
5. Keep the rule a floor. A corner tighter than the limit fails; a corner exactly at the limit is a
   deliberate hairpin and the lap's pacing, not this rule, says whether there are too many.

## What was measured, simulated, authored

The curvature is computed, exactly, on the baked data. The multiple of around two is authored; that
a roster of opponents steered by a simple follower can finish every circuit is a simulation, and it
says that the geometry is traversable at lap speed by those opponents, not that a human at the wheel
finds the hairpin fair. A radius rule is a geometric floor and says nothing about the speed a car
can hold through the corner; that is the handling model's question. At racing speed grip binds
first, because the radius a car can hold grows with the square of its speed. So the geometric
floor binds only in slow hairpins and in recovery from a spin. A corner-speed check asks the
handling model for the speed it allows at the measured radius.

## When not to use this

- **On a track with a speed-dependent turning model you have not reconciled with the floor.** The
  radius is a minimum of geometry. If cars can steer inside it at low speed the floor is conservative;
  if the handling model needs more room than it at racing speed, the floor is too low and no linter
  here will say so.
- **As a corner-quality score.** A corner that passes can still be a poor corner; the rule removes
  impossible ones and nothing else.
