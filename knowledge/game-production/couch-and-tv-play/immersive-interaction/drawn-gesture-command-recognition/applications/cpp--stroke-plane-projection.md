---
layer: application
type: application
subject: drawn-gesture-command-recognition
technique: stroke-plane-projection
stack: cpp
status: draft
verified_on: 2026-10-13
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A fitted plane whose sign is a world constant, and the player who turns past ninety degrees

Source tree: `mage-arena-vr` on `master` at `f928f1d` (the root of every path below). The
stack is C++ in an Unreal Engine project; `cpp@20` is the engine default standard, as in the
sibling applications on this subject. **Every number here is synthetic**: the clips come from
the project's seeded generator, and no tracked hand has drawn from a turned seat yet.

## The seam

The tree takes the third option of the technique, a plane fitted to the stroke by least
squares, with the normal as the direction of least spread:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.cpp:72 "FDrawPlane FitPlane"`.
The fit is facing-invariant, which is its virtue. The sign is not. The code points the normal
at a constant:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.cpp:128 "Seated origin looks along +X."`
The samples are in seated-origin space, and that space does not turn with the head. The
technique says the normal points toward the player. The tree points it toward world +X. The two
agree only while the player faces within ninety degrees of forward. The tree has no linearity
gate, no out-of-plane reject and no foreshortening check either; those are separate steps and
were not measured here.

## The instrument, and its positive control

The project's JavaScript port of the builder (`apps/vr/tools/glyphs/stroke.mjs`) and its own
$Q port (`qdollar.mjs`), run read-only from a scratch directory. Templates are the 36 committed
clips, the corpus is the 270 clips of `--corpus 30 --seed 1000`. At a yaw of 0 the run
reproduced the project's published split: 257 correct of 270, 13 wrong lines, 0 rejects.

## The arms

Each corpus stroke set was rotated about the vertical axis by a head yaw, as a player turned in
the seat would draw it, then classified.

- **A** is the tree as it is.
- **B** takes the normal's sign from the head's forward direction at pen-down (the technique's
  body frame), which in the port is the fit run in the head-aligned frame.

**Target:** wrong-line casts under yaw. **Floor:** the unturned split and the correct casts.

| Yaw | A correct / wrong / reject | B correct / wrong / reject |
| --- | --- | --- |
| 0 to 80 | 257 / 13 / 0 | 257 / 13 / 0 |
| 100 to 180 | 170 / 99 / 1 | 257 / 13 / 0 |

A is flat to 80 degrees and falls off a cliff past 90, which is where the sign flips. B holds
the unturned split at every yaw, so the floor did not move. Wrong-line casts past 90 degrees
dropped from 99 to 13, and the 13 are the unturned residue. At 180 degrees the confusions are
the mirror ones the technique predicts: of 90 `sigil-line3` drawings, 48 read as line1 and 37 as
line2, and 4 as themselves. Line3 is the handed shape; line1 and line2 lose only 3 and 11.

## What the seam says about the technique

The seam was chosen to falsify the claim that a fitted plane removes facing error "completely".
It does, up to the sign. The fit is invariant under any yaw, and the sign it inherits is the
only place facing re-enters. A fitted plane needs the head's forward as its sign reference
exactly as a body plane does. The technique now says so.

## What this cannot say

- Players turning past ninety degrees in a seat is an assumption; no session has recorded it.
  The finding is a latent defect, not an observed one.
- The unbuilt half: the C++ change needs a head-forward input to the builder, which no
  Unreal build verified here. The port is line-for-line, not the engine.
- Pitch and roll, depth jitter and near-linear strokes were not exercised.
