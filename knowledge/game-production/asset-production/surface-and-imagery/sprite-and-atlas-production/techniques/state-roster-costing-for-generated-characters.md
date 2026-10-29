---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: state-roster-costing-for-generated-characters
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [choosing a generated route for animated characters (painted sprites, video-generated frames, prerendered cards), one character's clips look good and the team wants to commit the route, estimating the generation time and texture memory for a cast, a game has more than one animated character type]
---

# State-roster costing for generated characters

The named concern: a generated character route is judged on its best clip of its best character,
and committed on that. The cost of the route is set elsewhere: by every state the rules ask each
character to show, multiplied by every character the player meets, multiplied by the retries the
generator needs per clip, and paid in texture memory on the target device. Cost the route against
that roster before choosing it.

## The roster

Enumerate, from the rules and the session data, not from the animation list the team happens to
have:

- **Every character type the player sees,** with how many appear at once.
- **For each type, every state the rules can put it in.** Idle, each attack or cast by tier, ward
  or block, dodge, each locomotion direction (the mirror trick covers only symmetric moves), hit,
  heavy hit, death, victory, phase or story beats. Also note which states can be active while the
  character moves.
- **For each type, the facings the camera will see.** Front-facing cards hold only when the
  character keeps facing the player. Characters that orbit or cross the field need four to eight
  facings per state.

## The cost model

Measure the pipeline on the team's own hardware, with its own retry rate, on two or three real
clips:
- the wall time per clip, from keys to motion segments to mattes to packing;
- the share of clips needing a retry, and how many.

Then compute, for the roster:

- **Generation time:** clips × facings × (1 + retries) × time per clip.
- **Texture memory:** cells × cell size² × bytes per texel after compression, plus mips, per
  character, at the cell size the play distance needs. Find that distance with a play trace.
  Cells magnified two times on the device read soft.
- **Coverage today:** the share of states that have a clip. Report it as covered states over
  roster states, never as a list of the clips that exist.

## What the costing found

One project's generated painted-card opponent covered 4 of the roughly 18 states its rules asked
for, and the costing showed:
- about 1 to 1.5 hours of generation per clip including retries, with action clips needing one to
  three retries each;
- about 550 cells for the one character at 256 px, or about 28 MB of pages on a mobile GPU;
- at the cell size its real fighting distance needed, 6 to 9 pages and 57 to 85 MB;
- every other character in the session (soldiers, hounds that orbit and so need facings, a
  second mage) still to do.

The verdict was "feasible for one showcase character, not for the cast". Wiring the states to
the rules took half a day; the art was the cost.

## Decision rules

- **When the roster's generation time exceeds the schedule, the route is for a showcase, not the
  cast.** Plan the other characters on a cheaper route, or cut the roster.
- **When the roster's texture memory exceeds the device's budget at the play-distance cell size,**
  lower the frame rate (animating on twos halves it), share bodies across types, or change the
  route.
- **When states can be active while moving and only locomotion clips move,** add moving variants of
  those states to the roster before costing. Otherwise the character slides.

## When not to use this

- **For a single static character** (a portrait, a shopkeeper card).
- **When the route is a rigged 3D model with a shared animation library,** where states cost
  retargeting rather than generation. Cost the library gaps instead.
