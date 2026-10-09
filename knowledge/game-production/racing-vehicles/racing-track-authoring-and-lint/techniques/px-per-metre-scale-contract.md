---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: px-per-metre-scale-contract
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [cars read as grains on a television, choosing a follow-camera scale range for a top-down racer, adding a second camera mode such as a shared view or an overview]
---

# Pixels-per-metre scale contract

A top-down racer has three numbers that describe one thing: the car's length in world metres, the
camera's scale in pixels per metre, and the smallest on-screen car the game accepts. The contract
ties them. It states the roster's physical sizes, a range for the camera's scale, and a minimum
on-screen length, and it asserts that the **shortest car at the lowest scale in the range is at least
that many pixels long**.

## Why the three must be tied

Physics is written in metres and the screen is in pixels, and nothing connects them unless someone
does. A game can have plausible handling on cars the size of real cars and, at the zoom that shows
a whole corner, cars a few dozen pixels long on a television across a room. The readability problem
is invisible in a development window at arm's length and obvious from a sofa. Published asset packs
for top-down racing tend to ship cars of the order of forty to sixty-four pixels, which is a hint
about the lower end of what reads at all, and a ten-foot view wants substantially more. The contract
states the floor so that the camera's range is derived from a requirement and not chosen by taste in
front of a monitor.

## The three layers

**World scale.** The dimension table fixes each car's length and width in metres. Make the cars
deliberately readable arcade proportions rather than real ones when the screen demands it, and say
so; the contract is about readability, and the numbers need not be real. Collision and drawing both
derive from this table.

**Camera scale.** A range, from the zoom used when the camera is close to the lowest it may reach at
speed. A follow camera that eases out with speed is a good idea; without a floor it eases out until
the cars are small. The floor is the lowest value of the range, and the **minimum on-screen length**
divided by the shortest car's length gives the minimum permissible floor: 80 pixels of shortest car
at 6.6 metres needs a floor of about 12.1 pixels per metre. State that arithmetic in the rules.

**On-screen minimum.** A pixel count in logical pixels, resolved at the reference resolution, with a
statement of how it scales to the output: logical pixel density scales with output resolution, so the
same contract holds at a higher display resolution with more physical pixels. Say which resolution the
number is for, per [a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).

## Tie the track to the screen

Road width in car widths already ties the track to the car. With the scale contract the track is tied
to pixels too: a road that is three and a half widest-car widths wide at a floor of about thirteen
pixels per metre is a known number of pixels, and so is the visible look-ahead at the viewport's
extent. Publishing those derived figures beside the contract lets a designer judge a corner's
visibility from the numbers. Derive look-ahead from the **safe area**, not the full frame. Television
platform guidance keeps focused content inside roughly the inner 90% of the picture, and overscan
can crop the edge on some sets. A corner visible only in the outer band is not reliably visible.
Platforms publish minimum text sizes for ten-foot viewing, not minimum game-object sizes, so the
on-screen car minimum stays an authored number. Comparing it with the platform's body-text minimum
at the same resolution is a sanity check, not a derivation.

## Every camera mode honours the contract

This is the rule that fails in practice. A contract is written for the primary follow camera and
asserted for it; later someone adds a **shared view** that must keep two cars on screen, taking the
minimum of the follow scale and a scale that fits both, and the second term has no floor. A distant
second car pulls the scale below the contract, and the cars shrink exactly when the camera is wide
enough to need them largest. The procedure is to list every camera mode and, for each, either apply
the floor, widen the cars' presentation instead, or declare the mode a **map** whose scale is exempt
because nobody drives by it. A lobby overview showing the whole circuit is a map; a gameplay
camera is not, even when two players are far apart.

A shared view that cannot satisfy the floor with both cars on screen has a design decision to make, and
the options are to let the trailing car leave the view with an indicator, to let it run off-screen with
a marker, to make separation a rule of the game, or to accept a floor breach and state it. The
shared-screen elimination racer is the classic case of the rule option: a car that falls off the
screen loses the round and the leader scores. The camera never has to widen past the floor. A
dynamic split, dividing the screen once zoom-out reaches the floor, is the other way to keep it.
Silently breaching is the one thing the contract forbids.

A factor applied after the clamp is a breach of the same kind, even when it comes from a felt
request. A decision to pull every camera back is a legitimate reason to change the floor. It
belongs in the table, where the data assertion reads it, and not as a divisor in camera code that
the assertion never runs.

## Test it on the data, not the picture

The first assertion is cheap and exact: for every car in the roster, length times the floor scale is at
least the on-screen minimum. It reads two tables and runs in a unit test. It proves the **data** agree,
which is a structural rung. The second assertion exercises the camera function over its inputs, many
speeds and two-car separations, and checks the resulting scale never falls below the floor outside the
declared map modes. The third rung is a frame captured on the target display at a real viewing
distance and looked at by a person; nothing below it implies it, per
[structural proof is never sufficient](../../../_laws.md#structural-proof-is-never-sufficient).

## Single authority and census of readers

The scale constants live in one presentation table, and the minimum and the contract assertion read it.
A scale value that appears as a literal in the camera code and in a test drifts the first time someone
edits one. Check that every declared constant has a reader, per
[declaring an input is not consuming it](../../../_laws.md#declaring-an-input-is-not-consuming-it):
a floor that is declared and never applied by a camera mode is exactly the case this guards.

## What was measured, simulated, authored

The contract's arithmetic is exact. Whether the on-screen size reads on a real television at a real
sofa distance is perceptual and not established by any of the above. A frame can be captured and a
timing measured on the device; neither says an adult across the room can tell the cars apart, and
that stays *not measured* until someone sits there.

## When not to use this

- **For a game with a fixed camera and a fixed-size car sprite**, where the scale is a constant of the
  art and nothing varies.
- **For a pixel-art game where the sprite grid is the unit**, where the equivalent contract is stated
  in sprite pixels and an integer scale factor.
- **As a design for a first-person or behind-the-car view**, where the scale is perspective, not a
  planar factor.
