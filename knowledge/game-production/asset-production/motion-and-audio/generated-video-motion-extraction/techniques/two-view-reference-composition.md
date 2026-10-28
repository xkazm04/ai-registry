---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: two-view-reference-composition
status: forged
laws: []
shared_with: []
use_when: [setting up a generated clip that will be triangulated, choosing camera placement for a two-view motion source, deciding what the first frame of a motion-source clip shows]
---

# Two-view reference composition

Triangulation needs two things: the same instant seen from two directions, and a way to
say which point in one image is which point in the other. With real cameras the second is
paid for with calibration and a keypoint model. A generated clip can be **composed** so
that both come nearly free, and the composition is the technique.

## The composition

**Two panels in one generation, never two generations.** A video model generating two
clips from one prompt produces two performances. They differ in timing, in pose and often
in the action itself, and no amount of alignment turns two performances into one. Two
panels inside one frame are one rendering of one moment, which is the only way to ask a
generator for the same instant twice. It still does not guarantee it, which is why the
panel sync gate exists.

**Level cameras at one height, orthographic when possible.** Put both cameras on the same
horizontal plane, both level, at the same height, looking at the actor from the front and
from the side. Under an orthographic projection a body point then sits on the same image
row in both panels. The front panel gives the point's horizontal position and its height;
the side panel gives its depth and the same height again. The shared row is the
correspondence. Any point that can be found by a geometric rule in each panel (the
highest pixel of the silhouette, the lowest, the leftmost) can be matched across panels by
row alone, with no keypoint model at all. Measured on one locally run video model: a front
and side panel pair with the sword tip as the silhouette's top point was read this way,
frame by frame, with no detector.

**The row residual is a free check.** Because both panels report the same height for the
same point, the difference between the two readings is an error the composition exposes
for nothing. It grows when the model lets the panels drift in time, when it lets one panel's
character change shape, and when something other than the body becomes the tracked point.
Record it per frame.

**The first frame is a render of the character's own rig.** Render the target character,
already rigged, from the two cameras, at the clip's resolution, in a pose that is the
action's start. Use it as the clip's first frame. This pins proportions, silhouette and
rest pose from frame zero, so the model animates the character the motion will land on
rather than a human it imagines. It also gives the extraction a known starting pose: the
solve's first frame can be checked against the rig pose that produced it.

**A plain, separated background.** A flat field of a colour the character does not
contain, a visible floor line for contact, even light with no hard cast shadow that the
silhouette rule could pick up as body.

## Decision rules

- **When a rule-based point (top, bottom, extreme) carries the read, prefer it to a
  detector.** It cannot hallucinate a joint, and its failures are visible in the residual.
- **When the action's key point is hidden in one view at the key moment, add a third
  panel rather than trusting a prior.** A lunge seen from directly in front can hide the rear
  arm behind the torso; a three-quarter panel at the same height keeps the row constraint.
- **When the clip cannot be orthographic, keep both cameras level and at one height
  anyway.** The rows then agree only near the image centre. Keep the actor small and central,
  and treat the residual away from the centre as expected rather than as error.
- **When the first frame cannot be the target rig (the rig does not exist yet), say so on
  the clip.** Its proportions are the model's, and every joint estimate from it carries that
  assumption until it is retargeted and checked.

## Procedure

1. Fix the camera pair: two level orthographic cameras, front and side, same height, same
   scale, the whole body and the weapon's full reach inside both panels at every pose.
2. Render the target rig's start pose from both cameras and composite them side by side
   into one first frame at the generator's resolution.
3. Prompt for the action positively, with a still camera and a plain studio, and for nothing
   the engine will add later.
4. Generate. Before anything else, run the panel sync gate.
5. Read rule-based points row by row and record the row residual beside every reading.

## When not to use it

- **For an action whose main plane faces one camera.** One view is enough, and the second
  panel halves the resolution available to the one that matters.
- **When the generator ignores panel layout.** Some models merge two panels into one scene
  or swap characters between them. Check a few seeds before building a pipeline on it.
- **As a calibration claim.** The row constraint is a property the generator was asked to
  respect, not a camera model. Its residual says how well it did, clip by clip, and nothing
  more.
