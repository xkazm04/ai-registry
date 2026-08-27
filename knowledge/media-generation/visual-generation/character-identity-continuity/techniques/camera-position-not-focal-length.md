---
layer: technique
type: technique
subject: character-identity-continuity
technique: camera-position-not-focal-length
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [designing a test that a continuity technique must pass, a consistency batch passes easily and the result feels unearned, writing the shot list for a continuity probe, a fixed seed is being used to hold a batch together]
---

# Camera position, not focal length

A continuity test is only as hard as the difference between its shots. The
cheapest way to produce a passing result is to write a shot list whose entries
differ in framing but not in viewpoint — and the trap is that such a list
reads, on paper, exactly like a wide, a medium and a close.

## The failure

Ask for a wide, a medium and a close of one character with the camera left
unstated, hold the seed fixed, and what comes back is frequently **three zoom
levels of one setup**: the same background layout, the same key light in the
same place, the same body position, cropped tighter each time. The character
matches across all three. Of course it does — it is very nearly the same
picture at three magnifications, and nothing in the batch asked the generator
to re-invent a face from a new angle.

A fixed seed is what makes this so easy to fall into. Seed discipline is a
legitimate cheap first arm — it is supposed to be the baseline every later
technique has to beat — but its mechanism is to anchor composition, and a
composition-anchored batch passes a composition-varying test by construction.
The measurement is real; it is answering an easier question than the one that
was asked.

## What a real setup change is

Each shot in the list must put the camera somewhere the other shots cannot see
from. Concretely, vary at least two of:

- **Position** — across the space, not along the lens axis. Behind a
  foreground object, from the other side of the subject, from the far end of
  the room.
- **Height and angle** — floor level looking up, above eye level looking down.
- **Which side of the subject** — a profile from the left is a different face
  problem than a three-quarter from the right.
- **What the key light does** — a setup that puts the light behind the subject
  is a different rendering problem than one that rakes it across the face.

The test for the list, before generating anything: *could a single camera
produce two of these shots without moving?* If yes, rewrite that pair.

## Prompt-only discipline holds a zoom and does not hold a cut

The result this technique protects is worth stating because it is the reason
to spend the effort. A batch built on a repeated character description and a
fixed seed can score comfortably inside the acceptable band on the
zoom-only list, and score past the different-people ceiling on the same
character, same location, same everything, when the list is rewritten to move
the camera. The technique did not change. The test did.

So: **the baseline arm must be run on the hard list.** A baseline measured on
the easy list understates the problem, which makes every later technique look
like a smaller improvement than it is — and, worse, invites shipping the cheap
arm.

## Read the visible discontinuities, not only the score

The hard list also surfaces failures that a distance number does not carry.
Distinctive markings are the reliable tell: an asymmetric feature — a scar, an
injury, an earring, anything the description places on one side — will
frequently swap sides between setups, or render as a mangled artifact in the
shot the model found hardest. A viewer notices that immediately and no
identity embedding reports it, because the embedding sees the same person
either way.

Put one deliberately asymmetric, side-specific feature on the character used
for continuity probes. It costs nothing and it turns a class of drift that is
otherwise invisible into something the naive human check catches in seconds.

## Decision rules

- When a continuity result looks unearned, inspect the backgrounds before the
  faces — matching background layout across a "wide, medium, close" set is the
  signature of the zoom test.
- When reporting a continuity result, state the setup change the shots
  actually contained; "three camera setups" is not a claim a reader can
  evaluate without it.
- When a fixed seed is used to hold a batch, keep the hard list — the seed's
  composition anchoring and the list's viewpoint variation are then working
  against each other, which is the honest configuration.
- When a technique clears the hard list, keep the easy list's number too: the
  gap between them is the measurement of how much of the problem is viewpoint
  rather than the model's memory.

## When not to use it

A batch whose real production shots genuinely are one setup at several
magnifications — a locked-off interview, a product turntable, a sequence built
from punch-ins — should be tested the way it will be shot. This technique is
about not *accidentally* testing that way when the delivery is a cut sequence.
