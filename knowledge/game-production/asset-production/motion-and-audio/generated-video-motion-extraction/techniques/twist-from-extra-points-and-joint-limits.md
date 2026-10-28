---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: twist-from-extra-points-and-joint-limits
status: forged
laws: []
shared_with: []
use_when: [turning triangulated joint positions into bone rotations, an extracted clip shows wrung forearms or thighs on the skinned mesh, a solver's bone roll flips between frames]
---

# Twist from extra points and joint limits

Triangulation recovers points. A skeleton needs rotations. The step between them has a
hole that geometry makes unavoidable: two joint centres give a bone's **direction**, and a
direction leaves one rotation free, the bone's roll about its own long axis, its **twist**.
Any twist is consistent with the same two endpoints. A solver that is not told how to
choose will choose differently from one frame to the next, and the error is invisible on the
joint centres, which are exactly right.

It is visible on the mesh. Skin bound to a bone that rolls 90 degrees while its neighbour does
not collapses at the joint between them, the candy-wrapper pinch familiar from badly weighted
forearms. A flip of half a turn between frames reads as the limb snapping. No check on joint
positions can see either, because joint positions are not wrong.

## Where twist information lives

Twist is fixed by any point that sits **off** the bone's axis and moves rigidly with it.

- **The next bone, when the joint is bent.** An elbow bent at a right angle defines a plane
  with the upper arm, and that plane fixes the upper arm's roll. As the joint straightens the
  plane degenerates, and at full extension the information is gone.
- **A weapon held in the hand.** Tip and hilt give a line that is rarely along the forearm, so
  a weapon fixes the hand's roll and, through the wrist's limits, much of the forearm's. For
  weapon actions this is the most reliable twist source available.
- **The foot.** Heel to toe is roughly perpendicular to the shank, so a visible foot fixes the
  lower leg's roll.
- **Markers placed on purpose.** When the first frame is a render of the character's own rig,
  that render can carry small high-contrast marks offset from the elbow, knee and wrist. The
  generator carries them forward, and the extraction tracks them like any other point.

## The procedure

1. **Solve directions first, from joint centres.** That part is determined.
2. **Solve each bone's twist from its off-axis points**, preferring rigid ones (a held weapon, a
   marker on a rigid part) to ones that depend on another bone's state.
3. **Clamp to the rig's joint limits.** Every rig declares how far each bone may roll. A
   candidate outside the limits is not a pose the character can make, whatever the points say.
   The clamp also removes the mirror solution that a symmetric point pattern allows.
4. **Where more than one candidate survives, take the one nearest the previous frame.** Real
   limbs do not jump half a turn in a frame. Continuity is a prior grounded in physics, not a
   guess.
5. **Where no candidate is determined (a straight limb, a hidden marker), interpolate twist from
   the nearest frames that were determined.** Mark those frames. Do not let the solver fill them,
   because its fill is the free choice this technique exists to remove.
6. **Check twist velocity.** A frame-to-frame roll faster than any joint can turn is a flip that
   got through. Find it and re-solve from the neighbours.

## Decision rules

- **Never let a solver pick twist freely.** Either a point determines it, the limits and
  continuity choose among candidates, or it is interpolated from frames that were determined.
- **When a body-model solver is used on a single view, its twist comes from its human prior.**
  That is acceptable on a human-proportioned character and should be checked, not assumed, on any
  other.
- **When an action depends on wrist roll (a cut that turns the edge, a thrust that rotates), give
  the weapon two tracked points.** One point says where the hand is. Two say which way it faces.
- **When the extracted twist will be retargeted, check it on the target skeleton.** Bone roll
  conventions differ between skeletons, and a twist that was right on the source can be off by
  a constant on the target. That remap belongs to finishing; this technique's job ends at a twist
  that is right on the skeleton it was solved on.

## When not to use it

- **On a clip that has not passed its gates.** Twist recovered from a desynced pair or from
  points an effect has covered is precise and wrong.
- **For fingers and faces.** Their twist is a separate solve with its own markers, and body
  extraction does not attempt it.
- **As a substitute for skin weights.** A correct twist on a badly weighted forearm still pinches.
  Check the deformation with a known-good clip before blaming the extraction.
