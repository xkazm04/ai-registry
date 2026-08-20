---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: texel-density-and-uv-tiling
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding how many times a texture repeats across a surface, one surface looks softer than the one beside it, choosing a texture resolution for an asset class, accepting a generated texture against a stated density]
---

# Texel density and UV tiling

## The concern

A tiling texture is never used at its own resolution. It is used at whatever density
results from its pixel dimensions, the world size of the surface it covers, and how many
times it repeats across that surface. Those three numbers fix one quantity — texture
pixels per unit of world space — and that quantity, not the image, is what a player sees.

The failure is not a soft texture. It is *inconsistency*: a crisp wall next to a soft
floor. An environment built entirely at a modest density reads as a style; an environment
with a two-to-one density mismatch across a corner reads as broken, and nobody reports it
in these terms. They say the floor looks bad, and someone spends a day regenerating a
texture that was fine.

## Procedure

1. **Declare a target density per environment class**, once, with its unit and its basis:
   texture pixels per unit of world length, stated for a named reference surface class.
   The number without the unit is meaningless — the same figure expressed per centimetre
   and per metre differ by a hundred, and both phrasings are in common use.
2. **Derive the repeat count, never dial it.** Repeat count equals surface length in world
   units, times target density, divided by the texture's pixel dimension along that axis.
   Anyone typing a repeat by eye has become a second authority for a quantity that already
   had one.
3. **Choose the texture resolution from the density and the largest surface class** that
   will use it, rather than defaulting every texture to the same size. A texture used on a
   small prop at the same density needs a fraction of the pixels, and spending them is
   memory taken from somewhere that needed it.
4. **Check the achieved density, do not assume it.** Compute it back from the shipped
   values per surface and compare against the class target. An environment where nobody
   has measured density has an unknown density, not a compliant one.
5. **Accept a generated texture against the stated density.** A source is not "sharp
   enough" in the abstract: it is sharp enough at a density. Evaluate the tile at the size
   it will occupy, not zoomed to fit a review pane.
6. **Allow declared exceptions, never silent ones.** A distant cliff face at a quarter
   density is a legitimate decision that should be recorded as one, so the next person
   does not see a mismatch and "fix" it.

## Decision rules

- **When two adjacent surfaces disagree by more than about a factor of two, treat it as a
  defect** even if both are individually acceptable. Adjacency is where the eye compares,
  and comparison is what makes density visible at all.
- **When the density target and the repeat count disagree, the target wins and the repeat
  is recomputed.** The reverse — inferring the target from what the surfaces happen to do
  — dissolves the standard into a description.
- **When a surface's repeat count rises above roughly a handful, expect visible grid
  repetition** and solve it with variation in the surface rather than with density. A
  higher repeat count buys sharpness and spends legibility, and past a point the tile's
  identity becomes the pattern rather than the material.
- **When the texture cannot reach the target density at any reasonable resolution**, the
  surface is too large for a single tiling material. That is a content decision — break it
  up, or blend a second scale — not a texture problem.
- **When a density is quoted, quote its basis with it.** "Which surface class, at what
  world scale, measured how" — a density figure that does not say what it was computed
  over cannot be compared with another one.

## When NOT to use it

- **Uniquely unwrapped surfaces**, where density is a property of the unwrap and belongs
  to whoever authored it. The consistency rule still applies across the environment; the
  derivation from repeat counts does not.
- **Stylised projects that deliberately vary density** for a hand-painted look. State the
  intent, because the difference between an intentional variation and an unmanaged one is
  invisible in the result and total in the process.
- **Interface and screen-space work**, where the relevant density is pixels per screen
  pixel and world size does not enter.

## The seam to the shading side

Density decides how many pixels a surface consumes; it does not decide how many texture
samples the shader takes, how channels are packed together, or which shading model the
material uses. Those are budget decisions belonging to the shader-authoring side, and they
consume what this technique produces. The handoff carries the density target, the achieved
density, and the labelled channel set — enough for the consumer to know what it is being
given and how far to trust each part of it.
