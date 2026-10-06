---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: ai-corner-speed-from-grip-limit
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [authoring how a computer-driven vehicle chooses its speed through a bend, an opponent car is faster than the player's identical car on the same corner, a rival looks like it follows different physics from the player, setting how hard a racing opponent drives]
---

# AI corner speed from the grip limit

The named concern: let a computer-driven vehicle choose its corner speed by asking the same
question the player's vehicle physics answers — how much lateral acceleration can this car
hold on this surface — and turn that answer into a speed, so that the opponent has no
physics of its own to cheat with.

A racing opponent has to decide, a short distance ahead, how fast to enter a bend. The
tempting constructions are all authored numbers: a speed per corner stored with the track, a
speed per car class, a rubber band that adds or removes pace according to the gap to the
player. Each of them is a second model of the car's capability, and each drifts from the first.
The first model is the one the player's car actually obeys, and it already contains the
answer.

## The derivation

A car moving at speed v along a path of curvature k needs a lateral acceleration of v squared
times k. The most it can hold is a limit the physics already owns: a car-specific maximum
lateral acceleration, scaled by the grip of the surface under the point being looked at. Setting
the two equal and solving for speed gives the corner speed, the square root of the grip-limited
lateral acceleration divided by the curvature. Reading the friction circle that way, the whole
of the lateral budget is spent on turning; the share left over for braking or accelerating is
what the straight-line logic spends elsewhere.

Three refinements turn the formula into a driver.

**A skill fraction.** Multiply the limit by a fraction below one, so the opponent drives at a
stated share of what the car can hold. The fraction is the competence dial for cornering in
the same sense that reaction delay is the dial for perception: a named quantity, with a unit
(a fraction of the physical limit), set per opponent class, and bounded above by a value the
design can defend as human-plausible. A strong human does not hold ninety-nine percent of a
tyre's limit through every bend of a race; an opponent that does is a different kind of
opponent. Because the fraction multiplies a number the physics owns, raising it raises the
opponent's pace without introducing a speed the car could not reach.

**A margin in speed, subtracted after the root.** A small per-skill subtraction in the
resulting speed makes the weakest opponents brake earlier than their fraction alone implies.
Keep it a separate dial: a fraction scales with the corner, a margin does not, and an opponent
tuned only by the fraction gets proportionally slower in fast corners and barely changed in
slow ones.

**Grip read where the car will be, not where it is.** The surface term is sampled at the look-
ahead point on the intended lane. A car that reads its current surface brakes for a slippery
patch after it has entered it. A car that reads the patch ahead brakes for it, which is the
single behaviour that makes a rival look like it sees the road.

## Why this is a no-cheat construction

The test of an opponent's honesty is a swap: put the player's controls on the opponent's car
and ask whether the player could reproduce its speed through that bend. When corner speed is
derived from the car's own lateral limit, the answer is yes by construction, and the opponent
fails only by being too slow, never by being impossibly fast. When the speed is an authored
number, nothing in the system can say whether the car could physically hold it, and the first
indication is a rival that out-corners the player's identical car on a slippery surface.

This matters more than it first appears because it is the honest alternative to the most
criticised opponent behaviour in the genre. A rubber band that gives a trailing opponent extra
power, or a leading opponent less, replaces skill with a different physics, and players read
the difference at once: the opponent is slower than the player in the first lap and
inexplicably on their bumper in the last. Adjusting how close the opponent drives to the grip
limit can slow or quicken a pack with the same cars under the same rules. The one thing it
cannot do is make an opponent faster than the limit, which is exactly the constraint that makes
the contest about driving.

## Decision rules

- **When an opponent corners faster than the player's identical car can, find the second
  authority before touching the dial.** Either the speed is authored rather than derived, or
  the grip term is being replaced by something larger. Lowering a skill fraction on top of a
  cheat hides it on one surface and leaves it on every other.
- **State the skill fraction and the margin as separate named quantities per opponent class,
  each with its unit and the ceiling it is bounded by**
  ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
  A single combined 'corner skill' number cannot be audited, because nobody can say which of
  its two behaviours a complaint is about.
- **Make the grip term the physics' own value, read once.** The surface multiplier, the
  lateral-acceleration limit and the speed it yields have one authority
  ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)); the second
  half of this concern, what happens when it is read twice, is the next technique.
- **Cap the target by a cruise fraction of the car's top speed.** A bend of near-zero
  curvature yields a very large root; the opponent should not drive its top speed on a
  straight at the exact physical maximum either, because it leaves no headroom to recover from
  a push.
- **Derive passing and spacing from the same car, not from the same number.** The speed an
  opponent chooses is half of a behaviour; the other half is where it places itself, and that
  is handled by expressing distances in car sizes.

## Evidence grade, stated plainly

The derivation is physics and checkable on paper. Whether a given skill fraction produces
opponents that feel right to a human is not. A derived corner speed is **simulated** when a
seeded run shows every opponent class finishing on every surface; it is **authored** where the
skill fractions and margins are picked by the designer; and it is **felt** only when a person
has raced against it, which a simulation cannot replace. Report which of the three each claim
has reached.

## When not to use this

- **On a track that is a scripted set piece.** A chase along a collapsing road, a staged
  finale, a tutorial that must be won or lost by design: the opponent's speed is a script, and
  deriving it from grip only adds a way to break the script.
- **Where the player's car has no lateral-limit model.** If the player's vehicle is a point
  with a turn rate and no grip, there is no limit to derive from, and the honest model is a
  speed profile authored per track and checked against the player's best lap.
- **As a replacement for line choice.** Corner speed is the longitudinal half of driving. An
  opponent that takes every bend at the right speed along a dull, centred line is still dull;
  the lane the opponent targets, and how it moves off it to pass, is a separate decision.
- **For off-road or airborne phases.** When traction is not the limiting quantity — a jump, a
  ramp, a vehicle in the air — the formula describes nothing and the opponent needs its own
  rule.
