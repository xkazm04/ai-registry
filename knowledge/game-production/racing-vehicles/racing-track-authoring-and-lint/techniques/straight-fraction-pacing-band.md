---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: straight-fraction-pacing-band
status: forged
laws: [law-and-check-share-one-source, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [rejecting a lap that is all corners or all straight, defining what counts as a straight on a baked ribbon, one threshold must drive both the linter and the drawn track markings]
---

# Straight fraction as a pacing band

A lap has a rhythm, and the cheapest honest check on it is the **share of the lap, by arc length,
that is straight**, required to sit inside a band. The check is deliberately crude. It exists to
reject degenerate laps, a ring of continuous curvature or a drag strip with a bend at the end, and
to leave every interesting lap to a person.

## Define the straight, then count it

A straight is not a geometric absolute; a baked ribbon is never perfectly straight. A **segment is
straight when its turn rate is below a stated threshold**, and the straight fraction is the sum of
the arc lengths of straight segments over the lap length. The threshold is a radius in disguise:
a turn rate threshold is the reciprocal of the radius above which a bend is too gentle to brake for.
State it as that radius so a reader can judge it: a threshold equivalent to a radius of a few
dozen car lengths means a gentle sweeper counts as a straight and a real corner does not.

Count by **arc length, not by vertex count**. A baked ribbon is not uniformly sampled once speed
or width interpolation affects spacing, and a vertex count turns an unevenly sampled corner into a
misleading fraction. Weight each segment by its length.

## The band has two ends

**Low end.** A lap with too little straight has no place to go fast, no approach to a corner, and no
reason to learn braking. A car with a speed-dependent camera never gets the sight-distance reward,
and a drag-based slipstream or boost mechanic has nowhere to pay out. The floor is a fraction of the
lap, in the low tens of percent as an authored default.

**High end.** A lap that is mostly straight has nothing to brake for and nothing to learn, and
becomes a speed test that favours the highest top speed in the roster. The ceiling is high, because
many good circuits have a very long straight; it is there to catch the degenerate case, not to
constrain a design. An authored ceiling of well above half the lap, and well short of all of it, is the
right shape.

Both ends fail. A pacing band that only checks the low end ships the drag strip.

## What it does not say

The fraction does not say **where** the straights are. Three short straights and one long one
produce the same fraction and play entirely differently, and a long straight placed after a hairpin
is a different lap from the same straight before one. It does not say how many corners there are, how
they link, or whether the sequence teaches anything. Those are authored by a designer and judged by a
person. The band is a floor on rhythm, and a lap that passes it must be reported as *not degenerate*,
never as *well paced*. This is the same stance the room-graph pacing rules take about a level whose
rhythm is not obviously broken: the rule removes the obvious failure.

## One threshold, two readers

The straight threshold is read twice in a well-built system: once by the linter to count straights,
and once by whatever draws the track to decide where a corner begins, for example to place approach
markings ahead of bends that matter. Both must read one named value. If the drawn markings use a
private copy of the number the track will show chevrons at one set of corners and be linted against
another, and the disagreement is invisible until a designer wonders why a corner the linter calls
straight has a warning painted on it. This is the situation
[the law and the check share one source](../../../_laws.md#law-and-check-share-one-source) names, and
the counterpart discipline in [declaring an input is not consuming it](../../../_laws.md#declaring-an-input-is-not-consuming-it)
asks that every declared threshold have a reader: a census of readers for the threshold should
return the linter and the presentation code, and an entry nobody reads is a finding.

## Procedure

1. Define the straight threshold as a turn-rate, document the radius it implies, and put it in the
   canonical rules table with the band's two ends.
2. On the baked ribbon, sum arc length of segments below the threshold; divide by the lap length.
3. Fail when the fraction is outside the band, naming the fraction and the band, and name which end.
4. If an earlier rule has already failed, still run this one. Short-circuiting on the first finding
   hides the pacing verdict behind an unrelated defect and teaches the designer to fix one problem
   per run.
5. Print the fraction for every shipped track, not only on failure. A band that is always satisfied
   by a wide margin is a calibration question for a human.

## What was measured, simulated, authored

The fraction is an exact computation. The band and the threshold are authored, with no tuning on
human play, and the fractions of the shipped circuits are known only to the extent that someone prints
them. A claim that a circuit is paced well rests on a human driving it, and nobody has.

## When not to use this

- **On a point-to-point stage** with a different rhythm, where a fraction of the whole is meaningless.
- **On a circuit whose character is deliberately one-note**, such as an oval, which should carry a
  reasoned exemption rather than a loosened global band.
- **As the only pacing check** on a game whose lap rhythm depends on elevation, surface changes or
  hazards; none of those is visible to a planar curvature count.
