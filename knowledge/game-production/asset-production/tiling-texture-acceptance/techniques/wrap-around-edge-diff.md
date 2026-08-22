---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: wrap-around-edge-diff
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [accepting a generated texture that must repeat, a surface shows repeating lines in a build, deciding what to check before an import cycle, verifying a derived channel is still tileable]
---

# Wrap-around edge diff

## The concern

A tiling image must be continuous with a translated copy of itself. That is a testable
property of the pixels alone: the column at the right edge is the left-hand neighbour of
the column at the left edge, and the bottom row is the top row's neighbour. If those
pairs disagree, the tiled surface shows a line. Nobody sees that line in the image
itself, which is why it survives review and dies in a build.

The technique is to compute the disagreement as a single number per axis, before the
image is accepted, on the decoded pixels — never on a thumbnail, never by eye.

## Procedure

1. **Decode to raw pixels** at full resolution. A scaled preview has already blurred the
   one-pixel discontinuity you are looking for; a lossy re-encode may have invented one.
   Check the artifact that will actually ship.
2. **Take the four edge bands.** The leftmost and rightmost columns for the horizontal
   test, the top and bottom rows for the vertical one. One pixel wide is the correct
   width for the primary measure: a wider band averages the defect away. Resolve
   transparency first and say how — a comparison over premultiplied edges and one over
   straight edges are different measurements.
3. **Compare each corresponding pixel pair** across the wrap. Compare on luminance or on
   each colour channel — state which, because a hue-only seam and a brightness seam
   produce different numbers and a reader must know which quantity was measured.
4. **Reduce to two scores, one per axis**, as a mean absolute difference normalised to
   the channel's full range, so the score is unit-free and comparable across images of
   different bit depths and sizes.
5. **Also keep the maximum,** not only the mean. A short, hard discontinuity — a shifted
   feature crossing the edge — barely moves a mean over a thousand-pixel edge while being
   the most visible defect class there is. Mean catches gradual tonal mismatch; max
   catches structural mismatch. Report both.
6. **Judge each axis independently.** A texture can tile horizontally and not vertically,
   which is a real and common outcome, and it is useful information: some surfaces are
   only ever tiled on one axis and such a texture may still be usable there.
7. **Name the worst edge in words a person can act on** — which of the two wraps was
   worse, phrased as the edge to go and look at. A pair of normalised deltas tells an
   engineer where the defect is; a named edge tells the artist, and the artist is the one
   who fixes it.
8. **Re-run the same measure on every derived channel** that will ship alongside the
   source. The check belongs to the artifact set, not to the input.

## Decision rules

- **The measure is pure and non-throwing, and it never modifies the image.** It reads
  decoded pixels and returns a result. A check bolted onto a generation flow must not be
  able to break that flow — the analysis is an observer, so a decode failure yields a
  *not checkable* result and a logged warning, never an exception that loses a generation
  and never a rewritten file.
- **When the image cannot be decoded, the result is not a pass.** It is *not checkable*,
  and the texture does not proceed on that basis. Not-checkable and clean must be
  different values all the way downstream; an error path that returns "no seam detected"
  because it never got a pixel is the failure mode that makes the whole check worthless.
- **When a texture is accepted without this measure, record that it was not measured.**
  Not a default score, not an assumed pass — a label. An unchecked texture and a checked
  clean texture must be distinguishable downstream, or nobody can ever tell how much of a
  library was verified.
- **When the mean is clean and the max is high, fail it.** The eye is a discontinuity
  detector, not an averager. Do not let a good aggregate hide a local break.
- **When a texture fails, prefer a re-roll over a repair** for statistical surfaces. A
  blend or mirror fix costs authoring time and often creates a visible symmetry, which is
  a subtler defect than the seam it replaced. Repair is for a hero texture that has
  already been approved on its content.
- **Report the number, not just the verdict.** A score near the threshold on either side
  is a different situation from a score an order of magnitude away, and only the number
  distinguishes them.

## When NOT to use it

- **Textures that are not tiled.** A decal, a unique surface unwrapped to its own space,
  a sky dome, an interface element: continuity across edges is meaningless and enforcing
  it rejects good work. The check is triggered by the intent to tile, so that intent must
  be recorded at generation time rather than guessed from the pixels.
- **Deliberately mirrored tiling**, where the surface is flipped on each repeat. The
  continuity condition is different — an edge meets itself reflected — and this measure
  answers a question that was not asked.
- **Tile sets whose pieces meet each other rather than themselves.** Edge continuity is
  then a pairwise property across a set, and the same arithmetic applies but the pairing
  is the design's, not the image's.

## What this technique does not tell you

Passing means the pixels line up. It does not mean the texture reads well when repeated:
a strongly-featured tile with a bright asymmetric element produces obvious grid
repetition at four repeats with a perfect edge score. Structural continuity is necessary
and not sufficient — repetition legibility is a perceptual judgment, and it needs an eye
or a rubric, not this number.
