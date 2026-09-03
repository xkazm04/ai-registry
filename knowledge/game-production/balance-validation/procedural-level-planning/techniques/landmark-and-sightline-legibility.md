---
layer: technique
type: technique
subject: procedural-level-planning
technique: landmark-and-sightline-legibility
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a generated space is navigable on paper but confusing to walk, placing landmarks or points of interest into a generated plan, deciding what a geometric checker may claim about a space nobody has looked at]
---

# Landmark and sightline legibility

A generated space must be navigable by looking at it. Legibility is the property that a
player standing anywhere in the space can decide where to go next, and later recall where
they have been, without consulting a map, a marker or a memory of the seed. It is a
separate axis from connectivity, and it is the axis a generator has no incentive to
optimise.

The naive reading is that connectivity *is* navigability: if every room is reachable and
the graph has no dead ends the player cannot get lost. The failure is precise and it is
the most common quality complaint against generated space. A generator optimising
connectivity produces a topologically excellent graph — well connected, evenly branched,
every route short — in which **the player cannot tell two junctions apart**. They walk a
loop, arrive somewhere they have already been, do not recognise it, and take the same
branch again. The graph is perfect and the space is a fog. More connections make this
worse, not better, because every added edge adds a junction that looks like the others.

## What a landmark is, and where it goes

A landmark is a feature placed so it can be seen from outside the room that contains it
and recognised again later. Three placement rules carry the technique, and each one is a
rule because it is exactly what a generator drops.

**A landmark is visible from a distance, or it is not a landmark.** A feature only visible
once the player is standing in the room with it is decoration: it can confirm where they
are but it cannot pull them anywhere, and pulling is the whole job. Placement therefore
runs against the visibility relation, not against the room list — a landmark is placed *so
that* some set of other positions can see it, and that set is the reason it exists.

**Landmarks are distinguishable from each other on more than one channel.** Two towers of
the same silhouette in different colours are one landmark repeated: at distance colour
washes out, in darkness it is gone, and for a meaningful fraction of players it was never
distinguishing at all. The rule that survives production is that **two landmarks visible
from the same decision point differ on at least two of silhouette, scale, motion and
sound** — channels that degrade independently. Draw them from a declared kit without
replacement, and treat exhaustion of the kit as a finding: a space that needs more
landmarks than the kit holds is a space that is too big or too uniform, and duplicating a
landmark to fill it destroys the property being bought.

**Landmarks go at decision points, not at destinations.** This is the rule teams invert.
A striking feature at the end of a corridor is a reward; it tells the player something
about where they arrived and nothing about where to go. The navigational instrument is a
landmark placed so it is *visible from the junction where the choice is made*, giving each
branch an identity before it is taken. The generator therefore enumerates the nodes where
the player has a real choice — the branch points of the traversal graph — and places
against those, orienting each candidate so the branch it advertises is the one it is seen
from. A landmark placed at a destination and a landmark visible from the decision point
that leads to it are different placements, and only the second one is wayfinding.

Scarcity is part of the specification, not a consequence of a budget running out. A space
where every room has a landmark has none: the eye has nothing to prefer, and the feature
class stops carrying meaning. State the count per space class as the intended number —
one anchor for the space as a whole, plus one per major decision point — and grade the
delivered count against the requested one.

## The sightline check, and its basis

The check that turns the rules above into evidence is stated per decision point: **a
decision point passes when, from the position a player actually occupies there, each
branch it decides between exposes something that distinguishes it.** Sample the standing
eye position at the node, cast visibility toward each branch's landmark anchor and its
first few metres of floor, and record for every branch whether anything distinguishing is
in view, at what distance, and at what angle off the forward axis.

Every one of those numbers carries its basis or it is not a number, per
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
Visibility computed from the origin of a room rather than from standing eye height passes
spaces that are blocked by waist-high geometry. Visibility computed with no field-of-view
limit passes landmarks that are behind the player. Visibility computed on untextured,
fully-lit blockout passes spaces that are unreadable at the fog density and the light
budget the game ships. Record the eye height, the field of view and the lighting state
with the result, and treat a visibility figure without them as unusable rather than
optimistic.

## What the checker can see, and what it cannot

The two halves of legibility sit on different rungs of evidence and must not be reported
as one number.

**Visibility is a geometric question and a checker settles it.** Whether an anchor is
occluded from a node, at what distance, within what angle, is computed exactly from the
same geometry the player will walk. A decision point with no line of sight to any of its
branches fails on geometry alone, and that failure is cheap, early and certain.

**Sameness is a perceptual question and a checker cannot settle it.** That two landmarks
are distinct objects with distinct anchors says nothing about whether a person, moving,
at that distance, in that light, tells them apart. Two silhouettes that differ in the data
can read identically on screen, and the ways they collapse — similar profile against the
skyline, the same value at low contrast, both lost against a busy backdrop — are exactly
the ways nothing in the geometry predicts. This is
[structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
in its native habitat: the geometric rung is necessary, it is never sufficient, and the
rung above it is somebody or something *looking at a rendered frame from the decision
point* and answering whether the branches read as different.

So the space carries two verdicts, not one, and the weaker one governs what may be
claimed. A space whose sightlines pass and whose frames nobody has looked at reports
**geometry checked, perception unmeasured** — never "legible", and never "playable", per
[unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass). Under unattended
generation this is the whole discipline: the production line may build a space it has only
proven geometrically, provided the plan says so in the field a downstream consumer reads.

## Decision rules

- **When a decision point has more than three branches, reduce the branches before adding
  landmarks.** Legibility is bought more cheaply by simplifying the choice than by
  decorating it, and a four-way junction with four landmarks asks the player to hold four
  identities at once for a decision they make in a second.
- **When a sightline fails because generation placed an occluder, move the occluder, not
  the landmark.** The landmark's position was derived from the decision point; moving it
  re-derives every sightline that depended on it, and the second placement is rarely
  better than the first.
- **When two branches from one node cannot be distinguished, merge them or gate one.** Two
  indistinguishable choices are not a choice; they are a coin flip the player has to walk.
- **When the game ships a map or a marker, lower the floor but do not remove it.** A
  navigational aid is a crutch whose use is a measurement: a space the player can only
  cross with the map open has failed this technique and is reporting its failure through
  telemetry instead of through the linter.
- **When landmarks are assigned by a generative pass rather than a placement rule, require
  the distinguishing channels as declared data on each one.** A pass that tags an arbitrary
  prop as a landmark has produced a label, and the label will pass every check that reads
  labels.

## When not to use this

- **Spaces whose design is disorientation** — a maze, a fog level, a horror space that
  works by denying the player a mental map. The rules do not vanish; they invert, and the
  space declares that inversion so the check proves the ambiguity rather than reporting it
  as a defect. An undeclared maze and a failed exploration space are indistinguishable from
  the outside, which is why the declaration is the requirement.
- **Spaces the camera shows whole** — a single-screen arena, a fixed overhead view of a
  small floor. Sightline analysis is trivially satisfied there and answers nothing; the
  legibility problem moves to whether regions of one visible space read as different
  regions, which is a different check.
- **As a substitute for placement.** Legibility says the player can tell where they are and
  choose where to go. Whether the place they choose is worth going to is decided by what is
  in it, which this technique does not touch.
