---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: luminance-heightfield-normal-derivation
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [producing a surface-direction map from a single colour image, a derived normal map introduced a seam, deciding between baking and deriving surface detail, a derived normal embosses painted markings]
---

# Luminance heightfield normal derivation

## The concern

A colour image can be read as a height field by treating brightness as elevation, and the
gradient of that field gives a surface direction per pixel. It is a cheap, deterministic
operation that turns a flat-looking surface into one that responds to light. It is also an
assumption wearing the clothes of a measurement, and the two things it most commonly gets
wrong — edge handling and pigment — are both avoidable if named.

## Procedure

1. **Convert to luminance with a stated weighting.** Perceptual weights and a flat average
   produce different height fields; either is defensible, silently switching between them
   is not. Write the coefficients down.
2. **Take the gradient with a small differencing operator** over a three-by-three
   neighbourhood — one that combines a difference across the axis with a light smoothing
   along it, so single-pixel noise does not become a spike of surface direction.
3. **Sample with wrap-around at every edge.** This is the step that is skipped by
   default and is the whole reason a derived map re-introduces a seam the source did not
   have. A pixel on the right edge takes its right-hand neighbour from the left edge, and
   the same for top and bottom. Clamping to the edge pixel — what most image libraries do
   unless told otherwise — produces a one-pixel flat border on all four sides, invisible
   in colour and glaring under a moving light.
4. **Assemble the direction vector** from the two gradients and a constant depth term,
   normalise it to unit length, and encode it into the channel range with the sign
   convention written down. The convention for the vertical axis differs between
   ecosystems and a flipped one makes every dent read as a bump; it is a one-line fix and
   an hour of confusion.
5. **State the strength as a parameter with a basis**, not a magic constant — what
   surface relief depth the default corresponds to, so a caller who wants twice the relief
   knows what they are doubling.
6. **Re-run the seam measure on the output.** The derivation is a new artifact and
   inherits nothing.
7. **Export the height field itself as a channel.** The intermediate the gradient was
   taken over is a usable displacement or parallax input on its own, it costs nothing
   extra to emit, and because it is a per-pixel transform it is tileable wherever the
   source was — no wrap-around question arises. An intermediate that a consumer would
   otherwise reconstruct by hand should leave the pipeline as an artifact.
8. **Label the result as derived**, naming the operator and the assumption. A consumer
   must be able to tell this map from a baked one.

## Decision rules

- **When the detail is structural and unique, bake it from geometry instead.** A bolt, a
  panel line, a carved relief, anything approached closely — model it and bake the
  difference between a dense form and the sparse one that ships. That produces a *true*
  normal map, encoding measured geometry; this technique produces a *plausible* one. The
  provenance, not the fidelity, is what decides.
- **When the detail is statistical and repeating, derive it.** Gravel, bark, plaster,
  woven cloth, rust, corroded metal: nobody can name an individual feature, and the eye
  only needs the surface to stop being flat. Deriving is minutes; baking is a day.
- **When the source's brightness is pigment rather than relief, do not derive.** Painted
  markings, printed patterns, dye, decals, colour variation in polished stone: the
  derivation embosses them, because it cannot distinguish a light-coloured flat region
  from a raised one. A source that mixes both is wrong in the pigment regions and no
  parameter fixes it — the information was never in the image.
- **When the source has baked lighting, remove it first or accept the error.** A shadow in
  the colour image derives as a trench. If the generator produced a lit-looking image, the
  honest options are a delighting pass or a note that the surface direction is
  contaminated — never a silent derivation over shadows.
- **When the source is heavily compressed, expect blocking artifacts to become relief.**
  The gradient operator is a high-pass filter and compression noise is high-frequency;
  derive from the least-processed version available.

## When NOT to use it

- **As a substitute for geometry on a silhouette.** Surface direction changes shading, not
  outline. A shape whose edge must read as bumpy needs geometry; a derived map at high
  strength only makes the interior noisy while the silhouette stays flat.
- **On an already-derived channel.** Deriving surface direction from a roughness map or a
  height map that was itself produced by convention compounds two assumptions and labels
  the result as one.
- **When a true height field exists.** If the source carries real elevation, derive from
  that and skip the luminance proxy entirely — the proxy exists only because the elevation
  is missing.

## What passing does not prove

A derived map that is seamless, correctly encoded and correctly signed still says nothing
about whether the surface *looks* right under the lighting it will ship in. Structural
correctness of a channel is a lower rung than perceptual correctness, and only a look at
the lit result reaches the higher one.
