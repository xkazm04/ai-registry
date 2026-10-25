---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: own-rig-synthetic-keypoint-training
status: forged
laws: [a-judge-of-the-generators-family-is-not-independent, unmeasured-is-not-a-pass]
shared_with: []
use_when: [extracting motion for a character that is not human-proportioned, a generic keypoint detector places joints on a creature where a human's would be, the extraction needs points a generic detector does not know such as a weapon tip]
---

# Own-rig synthetic keypoint training

**Evidence status, stated first.** This technique comes from one practitioner's first-party
account of a working pipeline. It has not been reproduced on this registry's machines: no
detector was trained, and no clip was extracted with one. What follows is argued from the
failure it prevents and from how synthetic training data is known to behave. Treat it as a
standard to try, with its validation step as the part that must not be skipped.

## The failure it prevents

A generic keypoint detector learned where joints are from photographs of people. Given a
silhouette, it finds the most human reading of it. On a human-proportioned character that is
correct. On a character with long arms, a hunched spine, digitigrade legs, a tail, or armour
that hides the elbow and knee, it is confidently wrong: it puts the elbow where a human's
elbow would be on a body that size, and the confidence score says nothing about it, because
the detector has never seen a body where that guess fails. Every downstream stage then fits
a skeleton to joints that are not there. The solve is smooth, the retarget is clean, and the
character bends in the middle of its forearm.

The same detector also does not know the points this subject needs beyond the joints: a
weapon's tip and hilt, a marker that fixes a limb's twist, the toe of a clawed foot.

## The procedure

1. **Sample poses from the rig, within its joint limits.** The rig that the motion will land
   on is the source of truth for where the joints are and how far they bend. Sample poses
   across each joint's declared range, weighted toward the poses the character's actions
   reach. Poses beyond the limits teach the detector bodies that will never appear.
2. **Render from the clip's camera rig.** The same cameras, heights, projection and
   resolution the motion-source clips use. A detector trained on a three-quarter perspective
   view is being asked a different question when it reads a level orthographic panel.
3. **Label by projection, not by hand.** Every joint, every off-axis marker and the weapon's
   key points are projected from the rig into each render, so the labels are exact. Record
   visibility per point: a point behind the torso is labelled as hidden, not at the position
   it would have if it were visible.
4. **Degrade the renders the way generated video degrades a picture.** Motion blur along the
   limb's direction, compression blocking, slight texture and colour drift between frames,
   softened edges, small changes in proportions. A detector trained on clean renders reads
   clean renders. Generated frames are not clean.
5. **Vary what the generator varies.** Lighting, surface detail, background tone within the
   plain range the composition allows. Hold fixed what the composition fixes.
6. **Train or fine-tune the head; keep a pretrained backbone.** The backbone already sees
   edges and parts. The head is what learns this body.
7. **Validate on generated frames, labelled by a person.** Pull frames from real
   motion-source clips of this character and have someone place the points. That set is the
   only evidence the detector works.

## Why the validation set must not be synthetic

A held-out split of the synthetic renders is a reference set the producer wrote for itself.
It shares the renderer, the poses and the degradations the detector was trained on, so it
scores the detector on its own average and says nothing about the gap between a rig render
and a generated frame. That gap is the whole risk of the technique. A synthetic validation
score is useful as a filter during training and is never reported as the detector's accuracy.

## Decision rules

- **When the character is human-proportioned and the route uses a body-model solver, do not
  train.** The generic detector and the body prior are built for that body. Training buys
  little and adds a model to maintain.
- **When the character is not human-proportioned, train on its own rig, never on generic human
  data.** Fine-tuning a human detector on more humans does not teach it a tail.
- **When the extraction needs only one or two points that a geometric rule can find (the top of
  the silhouette, the lowest foot), use the rule and skip the detector.** A rule cannot invent a
  joint.
- **When the rig changes (new proportions, new bones, new limits), retrain.** The detector
  learned that rig. It is versioned with it.
- **When no person-labelled generated frames exist, report the detector as unvalidated.** Do not
  ship its extractions as measured motion.

## When not to use it

- **Before the rig exists.** The training set is the rig; without it there is nothing to render.
- **For a one-off clip.** Training a detector costs more than hand-correcting a few frames.
- **To rescue a clip that fails its gates.** A detector that sees through effects or across a
  panel drift is still reading a clip that does not carry the motion.
