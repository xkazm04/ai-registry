---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: single-subject-plain-background
status: forged
laws: [unmeasured-is-not-a-pass]
use_when: [preparing a source image for reconstruction, writing the isolation criterion of an input rubric, reconstructions come back with attached background geometry]
---

# Single subject, plain background

## The concern

A reconstruction has to decide, for every pixel, whether that pixel is the thing or not the
thing. Everything it cannot separate, it includes. A stool leg behind the subject becomes a
tail. A cast shadow on a wall becomes a slab. A second character in frame becomes a fused
mass with the first. This is not a quality degradation, it is a category error in the input,
and it is the single most common reason a reconstruction returns something unrecognisable.

The rule: **one subject, fully in frame, on a background that carries no depth cue and no
competing edge.**

## The procedure

Run in this order; each step is cheap and each one can make the next unnecessary.

1. **Count subjects.** More than one means the image is not an input, it is a scene. Crop to
   one, or reject. Collages, turnaround sheets pasted side by side, and "the character with
   their weapon" are all multi-subject — a held prop that must exist as a separate asset is a
   second subject.
2. **Check the crop.** The subject must be complete and not touching the frame edge. A limb
   or head clipped by the border reconstructs as an amputation, because the model has no
   evidence the part continues. Leave a visible margin on all four sides.
3. **Isolate.** Remove the background to a flat neutral field or to transparency. Flat
   neutral means no gradient, no vignette, no texture, no floor-to-wall corner — each of
   those is a depth cue and gets read as surface.
4. **Check contact shadows.** A grounded shadow is a plane the model may reconstruct as
   geometry. Remove it with the background, do not merely lighten it.
5. **Check subject-background contrast.** After isolation, the outline must be crisp at the
   pixel level. Soft or feathered mattes leave a halo, and the halo becomes a shell of thin
   geometry around the silhouette.
6. **Re-check the silhouette.** Isolation frequently reveals the real problem: limbs that
   read as separate against a busy photo turn out to be a single closed blob against a flat
   field. That is a pose problem, not an isolation problem, and it goes to the pose rule.

## Decision rules

- **If the subject cannot be separated by an automated matte, do not hand-fix and proceed —
  reject.** An image whose subject boundary is genuinely ambiguous to a matting model is
  ambiguous to the reconstruction for the same reasons.
- **If the background carries a gradient or a horizon, flatten it before scoring.** Scoring a
  recoverable image as a fail wastes the cheapest fix available.
- **If the subject touches the frame edge on any side, fail regardless of everything else.**
  Cropping cannot add the missing part, and reconstruction will not either. This is a hard
  fail, not a warning, because nothing downstream restores truncated volume.
- **If a prop is genuinely part of the subject** — welded, worn, never removable, never a
  separate asset — it is one subject and stays. Ask what the asset list says, not what the
  picture looks like.
- **Transparency beats a white field** where the pipeline supports it: a white field can be
  confused with white material on the subject.

## What "plain" is not

It is not "simple". A softly blurred studio backdrop is simple and still carries a depth
gradient. It is not "dark" — a black field hides the silhouette of a dark subject entirely
and produces a truncated reconstruction with no warning. Plain means **uniform, mid-value,
and contrasting with the subject.** Where the subject spans a wide value range, prefer
transparency and let the pipeline composite.

## Recording the result

An image that has not been through the isolation check is *ungated*, and must be recorded as
such — not as a neutral score, not as an implicit pass. This is the failure that hurts most
in aggregate: a handful of images that skipped the gate for operational reasons become
indistinguishable from images that passed it, and the report that summarises the batch is
then simply false. Carry a distinct value for "not checked" all the way to whatever surface
reads these scores.

Record which step fixed the image, too. Over a hundred inputs the distribution tells you
where to intervene upstream: if two thirds of failures are multi-subject crops, the brief
given to whoever makes the concepts is wrong, and fixing the brief is worth more than any
amount of gate tuning.

## When not to use this

- **Environment or scene reconstruction**, where the whole frame *is* the subject and
  isolation is meaningless. Different problem, different rubric.
- **Photogrammetry from real capture**, where a consistent real background across many
  registered shots is an asset rather than a liability — the constraint there is camera
  coverage, not isolation.
- **Style or material reference images**, which are not reconstruction sources at all and are
  gated on different criteria. Isolating a material swatch destroys the thing it is for.
