---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: ai-distances-from-car-size
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [authoring when a driven opponent starts a pass and how wide it swings, adding a car class that is bigger or smaller than the existing ones, rescaling a roster or a track, a rival that passes fine in one car and rams or hangs back in another]
---

# AI distances from car size

The named concern: every distance a driven opponent uses to relate itself to another car —
when it starts to pass, how much room it leaves, how far down the road it looks, how far
behind it counts a pursuer — is written as a multiple of that car's own length or width, and
converted to metres only at the moment of use.

Distances in metres are the natural first writing, and they work until the roster stops being
one size. A trigger of eight metres to begin a pass is a comfortable two car lengths for a
compact racer and half a length for a heavy one. The two cars share one rule file, and one of
them overtakes early and wide while the other overtakes late, clips the car in front, and
reports a bug in the pass logic. There is no bug in the pass logic. There is a number whose
basis was never stated ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)):
metres of what.

## The rule

A relational distance is a ratio of the agent's own dimensions. A pass trigger is a number of
car lengths ahead. A passing lane offset is a number of car widths from the lane being
passed. A look-ahead floor, the minimum distance ahead the agent steers toward, is a number of
car lengths, with a speed-dependent term added on top for the part that depends on how fast
the car moves. A clearance for side-by-side running is a number of car widths. The conversion
reads the vehicle's own dimensions from its own specification, so a new class needs no new
distance rows: it inherits correct ones by being a different size.

The benefit is **survival of a rescale**. A roster that is scaled up because the cars read too
small on a television, or because the track is redrawn wider, would otherwise force a pass over
every authored distance to find which ones were metres of the old scale. With size-relative
distances the rescale is one change to the car's dimensions, and the opponents' relational
behaviour moves with it, in proportion, without anyone opening the opponent code.

## Which distances are relative and which are not

Not every distance is about the car. The split is by what the distance is *for*.

**Relative to the car** when the distance protects or asks something of the body: passing
trigger, passing lane, side clearance, the distance considered "tailgating", the nose look-ahead
floor. These are ratios, because the thing they relate is the vehicle's size to another
vehicle's size.

**Absolute** when the distance belongs to something that does not scale with the car: a
weapon's reach, a sensor's range, a distance the player must be able to read on a given
screen. A firing range is a property of the weapon and the screen, and a car that is larger
does not shoot further. Writing it in car sizes would make a heavier car a longer-range
shooter by accident. The test is whether the distance would change if the cars were redrawn at
twice the size on the same track: if the answer is yes, it is relative; if it is no, it is not.

**Mixed** when a relative quantity gates an absolute one, for example a pursuit test that
combines a distance behind in metres with a sideways band in car widths. The mixture is
acceptable if it is declared, because the two halves answer different questions: how far back
counts as behind the car, and how far to the side is in its path. The failure is the mixture
nobody declared, in which the metre half quietly decides everything on the largest cars.

## Per-opponent scale on top, not instead

An opponent's character is allowed to shift these distances: an aggressive driver starts a pass
from a little further back, a cautious one waits. Express that as a multiplier on the ratio,
held on the opponent's style row, so a style is a scale of a size-relative distance and never
a replacement for it. A style that stores its own distance in metres reintroduces the
roster-dependence the ratio removed, and does so in the one place a designer will tune by
feel.

## Decision rules

- **When a rival behaves well in one car and badly in another, check the basis of each relational
  distance before touching the arbitration.** The usual cause is a metre value written against
  the first car.
- **Write the ratio and its basis in the data, one row per distance, with the dimension named
  in the key**: a key that says it is in car lengths or car widths cannot be read as metres. A
  bare 'overtake distance' invites the metre reading.
- **Add a class of a different size to the roster in a test before shipping it**: run the
  opponent against it and confirm the pass count and the contact count are in the same band as
  the other classes. A relative distance that is right in ratio and wrong in effect, for
  instance because the car's length is measured from a body shape that is not its footprint,
  shows up here.
- **Give the road the same treatment.** A minimum road width in car widths and a minimum corner
  radius in car lengths keep the track and the opponents in step with the cars. A track
  authored in metres is a track that stops fitting the roster when the roster changes.

## Evidence grade

A size-relative distance is verifiable on paper: its basis can be read in the row. That it
produces passes that look natural and contact that feels fair is a claim about how the
opponents race, and a simulation can count passes and contacts across classes but cannot tell
whether a human finds the spacing believable. Say which of the three has been established:
**authored** (the ratio exists), **simulated** (the roster was run and the counts compared), or
**felt** (a person raced against it).

## When not to use this

- **On a roster of one car size.** If every car in the game is the same size and will remain so,
  metres and car lengths are the same number and the conversion is ceremony. Write it relative
  anyway if the track might be rescaled; skip it if neither will change.
- **For distances the player must perceive on screen.** A warning marker or a weapon reticle
  has a size on the display, which does not follow the car.
- **When the body shape is not a good proxy for the footprint.** A car with a long towed trailer
  or an extended weapon has a footprint that its nominal length does not describe; measure from
  the collision shape, and say so, or the ratio is relative to the wrong thing.
