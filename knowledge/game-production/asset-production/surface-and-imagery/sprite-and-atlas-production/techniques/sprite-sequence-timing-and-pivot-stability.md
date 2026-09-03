---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: sprite-sequence-timing-and-pivot-stability
status: forged
laws: [structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [assembling generated frames into an animation, a character bobs or jitters while playing a cycle, declaring per-frame durations and loop points, a held object detaches from the hand during a swing]
---

# Sprite sequence timing and pivot stability

## The concern

A sprite animation is a list of images plus two declarations neither image carries: where each
frame is anchored, and how long each frame is held. Both are invisible in every frame and
decisive in the sequence.

The anchor — the point the renderer positions, rotates and mirrors the sprite about — is the one
that fails silently. If the anchor sits at a fixed place in each image but the *art* sits at a
different offset within the image from frame to frame, the sprite translates by the difference
every time the frame advances. Played at ten frames a second, a two-pixel wander reads as a
character bouncing while walking on flat ground, and every frame in the set is correct
([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)).
The reviewer who reports it says the animation "feels floaty", which points at the timing, which
is not the problem.

Timing fails more loudly but with a subtler trap: the durations are numbers whose unit is
frequently not written down.

## Procedure

1. **Declare the anchor per frame, in the same record as the frame.** Not per set — per frame,
   because a set whose members share an anchor is a special case of a set whose members declare
   one, and the special case is the one that produces bobbing when a single frame is retouched.
2. **Anchor to a stable feature of the subject, not to the image.** For a walking character the
   ground contact point; for a held weapon the grip; for a projectile the tip. The image's centre
   or corner is stable only until the art shifts inside the frame, which it does the moment one
   frame is regenerated.
3. **Check anchor stability as a series, not per frame.** Compute the anchor-relative position of
   a feature that should be still — the ground line, the head top for a non-bobbing idle — across
   the whole set, and report the excursion. A stable cycle has an excursion near zero on the axes
   that should not move; a defective one has a sawtooth, and the amplitude is the number of pixels
   the character bounces.
4. **Distinguish intended motion from drift.** A run cycle *should* bob vertically. What must not
   drift is the axis the motion does not own — a run cycle that also wanders horizontally will
   slide relative to its own movement speed. State per set which axes are expected to move, and
   check the rest.
5. **State durations with a unit.** Milliseconds, ticks, or display frames at a stated rate.
   ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis))
   A bare "4" is four hundredths of a second in one runtime and four sixtieths in another, and the
   resulting animation is a factor of two and a half out with no error anywhere.
6. **Declare loop points and check closure.** A cycle whose last frame does not lead back into its
   first has a visible hitch once per loop. The check is the same excursion measurement applied
   across the wrap, and it is exactly the seam check of a tiling texture in the time axis.
7. **Record a frame order that is data, not filename ordering.** Lexical ordering of names puts
   the tenth frame after the first, and the resulting animation plays in an order nobody chose.

## Decision rules

- **When the anchor is not declared, it is declared — at a default.** Usually a corner or the
  image centre. Treat an undeclared anchor as a defect at intake, because the default is right by
  accident for the frames whose art happens to be centred and wrong for every other one.
- **When frames were generated independently, the anchor must be derived from the art, not
  assumed from the canvas.** Independent generation places the subject differently within each
  canvas; deriving the anchor from the art's own bounding content, or from a detected feature, is
  what makes such a set usable at all. Assuming a shared canvas position guarantees the bounce.
- **When a set is trimmed to tight bounds during packing, the anchor moves and must move with
  it.** Trimming transparent margins is a legitimate packing optimisation and a reliable source
  of jitter, because the offset it removes differs per frame. Trim and adjust the anchor in one
  operation, or do not trim.
- **When durations are uniform, say so explicitly rather than omitting them.** An omitted duration
  is filled in by a default somewhere downstream, and two consumers with different defaults play
  the same asset at different speeds.
- **When a sequence was assembled without an excursion check, it is unmeasured, not stable.**
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)) Jitter is only
  visible in motion at speed, so a static review that saw nothing saw nothing about this.
- **When the excursion is large and abrupt on one frame, fix or replace that frame rather than
  re-anchoring the set.** A single bad frame moves the average and tempts a global correction that
  makes every other frame slightly wrong.

## When NOT to use it

- **Non-anchored, full-screen or background art**, which is placed by layout rather than about a
  point. There is no anchor to stabilise and no cycle to close.
- **Physically simulated or skeletally driven motion**, where placement comes from a rig or a
  solver and the images are drawn from it. Motion quality there is judged as motion — smoothness,
  contact, weight — which is a different subject entirely; what remains from this technique is only
  the duration-unit rule.
- **A deliberate shake, recoil or impact frame set** where the excursion *is* the content. Declare
  the expected excursion for such a set rather than checking it to zero, or the check rejects the
  effect it was asked to protect.

## What this technique does not tell you

A set with a rock-steady anchor and correctly stated durations can still be bad animation: wrong
weight, wrong spacing, dead poses, a cycle that reads as a shuffle. This technique removes the
class of defect that no eye can attribute correctly — a reviewer confronted with jitter blames the
timing, the art, or the engine, almost never the anchor — so that the judgment left over is an
honest judgment about the animation.
