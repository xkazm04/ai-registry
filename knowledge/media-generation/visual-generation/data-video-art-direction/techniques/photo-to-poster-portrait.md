---
layer: technique
type: technique
subject: data-video-art-direction
technique: photo-to-poster-portrait
status: draft
laws: [checkability-routes-the-pixel, output-never-outruns-evidence]
shared_with: []
use_when: [showing a real person (a champion, a leader, a founder) as a boosted illustrative portrait, building a succession or title-holder video, styling a cut-out photo to match an era]
---

# Photo-to-poster portrait

Some cases are about people holding something: a title, an office, a
record. A boosted portrait of the current holder makes the frame, but a
generated likeness of a real person is never acceptable. The portrait is
made **from a real, freely licensed photograph** by segmentation and
deterministic image processing. The illustration is a treatment of a real
picture, not an invention.

## Procedure

1. **Find a free photo from the person's era** (the reign, the term, the
   record), and log it (photo-rights-ledger).
2. **Cut the person out** with a segmentation model (it makes a mask; it
   does not generate pixels). Union two models if one leaves gaps. Fill
   only small holes, keep real gaps between limbs, keep the largest
   component, and feather the edge slightly. Check every mask by eye.
3. **Paint down** with edge-preserving smoothing, then local contrast for
   poster light.
4. **Posterize and gradient-map** into the holder's theme palette
   (leader-adaptive-theme). Blend some continuous tone back in to avoid
   harsh banding.
5. **Add print character**: line art (difference-of-Gaussians ink), an
   amplitude halftone in the shadows, paper texture, plate
   mis-registration.
6. **Light it**: a silhouette glow and a one-sided rim light built from the
   mask.
7. **Run a taste gate on the face and skin**: specular highlights that
   posterize into pale patches read as skin damage. Compress highlights
   before halftoning, and tune levels per photo.
8. **At a change of holder**, wipe the new portrait over the old one along
   a hard seam and change the background world with it. Desaturate the
   outgoing holder.

## Decision rules

- No free photo? Use a clearly labelled generic silhouette
  ("PHOTO NOT AVAILABLE"), never a generated face.
- Context photos (a later year, a ceremony) are allowed when captioned with
  their year.
- Do not alter facial features, skin tone or body shape beyond the global
  treatment. The treatment is applied to the whole image, never to selected
  features.
- Decorative props drawn in code (a belt, a trophy) stay generic: no real
  organisation's marks.

## When not to use it

- **Private persons, minors, victims.**
- **Cases where the person's image is the controversy.**
