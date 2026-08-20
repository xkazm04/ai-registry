---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: canonical-pose-rule
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
use_when: [choosing or briefing a source image for a character reconstruction, writing the pose criterion of an input rubric, reconstructions return fused limbs or asymmetric bodies]
---

# The canonical pose rule

## The concern

Pose is the criterion that cannot be fixed after the fact. Isolation can be redone, lighting
can sometimes be neutralised, resolution can be upscaled — but a subject photographed or
painted in a dynamic crouch has hidden half of itself, and no preparation recovers what the
pose occluded. The reconstruction fills the gap by invention, and invention at a limb
junction is exactly where the rig will later bind.

The rule: **the reconstruction source shows the subject in a neutral, symmetric, frontal
stance with every limb separated from the body and from every other limb.** For a humanoid
that means arms out and away from the torso, legs apart, palms open and flat, head level and
facing the camera, no props crossing the body, no foreshortening.

## Why this pose and not another

Three independent reasons, and it is worth knowing which one is biting.

- **Self-occlusion is minimised.** Every surface the pose hides is a surface the model must
  hallucinate. A neutral spread stance hides less of a humanoid than any other pose.
- **Symmetry is exploitable.** With a clean symmetric source, one good half can be mirrored
  to repair the other. A twisted pose destroys that option permanently.
- **Downstream stages assume it.** A rig binds to a rest pose; a retarget maps between
  skeletons that share one. A mesh reconstructed mid-stride carries the stride baked into
  its rest geometry, and every animation played on it inherits the bend.

The third reason is the one that gets underestimated. A mesh generated from an action pose is
not merely awkward — it is structurally wrong for the pipeline it is entering, and the cost
lands three stages later on someone who did not choose the image.

## Decision rules

- **If limbs touch or overlap the torso, fail.** The silhouette is closed there and the
  reconstruction will fuse them. This is a fail and not a warning because the fused junction
  is precisely where a skeleton binds.
- **If the subject is turned more than roughly fifteen degrees off frontal, and no additional
  view is supplied, fail.** Off-axis singles reconstruct with a systematic asymmetry that
  looks like a modelling error and is actually a projection error.
- **If a limb is foreshortened toward the camera, fail.** Foreshortening encodes length as
  near-zero pixels; the model reads the pixels.
- **If hands are closed, fused, or holding something, warn rather than fail** — for most
  asset classes hands are re-authored or replaced, and failing on them stalls a pipeline over
  a part nobody keeps. Fail on hands only when the asset class is one where the hand is the
  deliverable.
- **If the head is tilted or turned while the body is frontal, fail for a character whose
  face matters.** A rotated head produces a face reconstructed from a partial view, and face
  geometry is the least forgiving output in the pipeline.
- **If the asset will never be rigged** — a static prop, a set dressing piece — the pose rule
  collapses to the silhouette rule alone. Judge by what happens downstream, not by habit.

## Faces are their own case

Where the deliverable is a face, gate a dedicated close crop as a separate input with its own
criteria: sclera visible, pupils crisp and clearly bounded, brows natural in shape and value,
no emissive glow, no heavy stylised makeup, no hair crossing the eyes, mouth closed and
neutral. Each of these is a specific reconstruction failure. Glow becomes a bulge. Heavy
makeup becomes a socket. Soft pupils become a smooth eyeball with no anchor, which is the
signature of a generated head that cannot be repaired downstream and reads as uncanny at
every subsequent stage.

Note what the gate is and is not buying here. Reconstructed eyeballs are not salvageable at
all — they come back as part of the face surface, sunken and asymmetric, and the standard
finishing move is to delete them and drop in primitives. So the input criteria on the eyes
are not about the eyeball; they are about everything the reconstruction bakes into the
surrounding face — socket depth, brow shape, lid line, the shadow a glow effect leaves behind.
Those are the parts nothing replaces.

The corresponding output check is a headless close-up render set — front, three-quarter,
profile — inspected before any spend on rigging or retargeting. Gate the concept and gate
the head; the two together are cheaper than one retarget on a bad face.

## Grade against the shipped standard

The temptation with pose is to grade relative to what the concept team produced this sprint.
Do not. The bar is the stance that reconstructs successfully into an asset of the quality
that actually ships in this genre — an absolute reference, restated in the rubric as a
description an examiner can check the image against. A batch of uniformly dynamic concepts
is a briefing failure to be reported upward, not a reason to soften the criterion.

## Preparation, not just rejection

Middle-band pose problems have real fixes. A near-frontal source can be re-generated from
the same concept with an explicit stance instruction. A subject with arms at its sides can
often be re-posed by the same image model that produced it, far more cheaply than by
reconstructing and fixing the mesh. Where a symmetric subject has one clean half, mirroring
that half is legitimate preparation and should be stated as such in the record — a mirrored
input produced a mirrored asset, and someone will eventually ask why the scar is on the wrong
side.

## When not to use this

- **Deliberately asymmetric subjects** — a one-armed character, an organically irregular
  creature — where mirroring is wrong and the symmetry sub-rule must be switched off
  explicitly rather than silently violated.
- **Scanned or captured real subjects** with full multi-view coverage: coverage substitutes
  for canonicality, and demanding a rest pose from a real capture session is a cost with no
  return.
- **Non-articulated props**, per the decision rule above.
