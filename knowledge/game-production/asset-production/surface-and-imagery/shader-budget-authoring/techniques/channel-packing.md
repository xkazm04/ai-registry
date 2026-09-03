---
layer: technique
type: technique
subject: shader-budget-authoring
technique: channel-packing
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [a material is near its sampler ceiling, exporting single-channel material maps, a packed map is producing wrong roughness or occlusion]
---

# Channel packing

## The concern

Occlusion, roughness, metallic, height, curvature and cavity are all **single-channel**
data. Stored as separate colour textures they each consume a sampler and waste
two-thirds of their storage. Three grayscale maps in three textures cost three samplers
for one texture's worth of information — and samplers are the scarce resource, not
memory.

Packing puts three such maps into the red, green and blue channels of one texture. One
sample returns all three. The count drops by two, the memory drops by roughly two
thirds, and the material stops fighting the ceiling. The technique is nearly free, which
is why it is universal, and it has exactly two costs that must be understood before
adopting it.

## Procedure

1. **Adopt one channel convention for the project and write it down.** The widely used
   layout is occlusion in red, roughness in green, metallic in blue. The specific
   assignment matters far less than that there is exactly one, that it is stated in a
   single place, and that both the export side and the material side read it from there
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). Conventions
   differ across renderers; inheriting one from a tutorial and a different one from a
   marketplace asset is how a project ends up with roughness in two channels.
2. **Mark the packed texture as linear data, never as colour.** This is the failure that
   costs days. A packed map carries numeric parameters, not colour; if it is tagged with
   a display transfer curve the values are gamma-decoded on read and every channel is
   silently wrong — mid-grey roughness reads as something else entirely, and the surface
   looks subtly plastic with no error anywhere
   ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
   Only the base-colour and emissive maps carry a display transfer curve. Everything
   else, packed or not, is linear.
3. **Choose a compression format that survives channel independence.** Block compression
   schemes designed for correlated colour will bleed one packed channel into another,
   because the three channels of a packed map are uncorrelated by construction. Use a
   format that stores channels independently where the data is sensitive — a mask that
   drives a hard threshold is the usual casualty.
4. **Pack the maps that are always used together.** Occlusion, roughness and metallic
   are read on every lit pixel of every material that has them, which is why that triple
   is the standard. Packing a rarely-sampled mask alongside constantly-sampled data
   makes the whole texture resident for the sake of the rare one.
5. **Reserve alpha deliberately or not at all.** A fourth channel is available but is
   compressed differently in most formats and is often the only place a full-precision
   value survives. Use it for the map that needs precision — height for parallax is the
   common choice — or leave it empty; do not fill it because it is there.

## The two costs, stated plainly

- **A packed channel cannot be reused independently.** Once roughness lives in the green
  channel of a shared texture, it cannot be swapped for a variant, streamed at a
  different resolution, or reused by a second material that wants a different occlusion.
  Packing trades flexibility for slots, and the trade is worth it for a shipping surface
  and wrong for a library asset meant to be recombined.
- **A colour-space mistake corrupts silently.** There is no error, no warning, and the
  result is a material that looks *almost* right. This is the one packing failure that
  survives review, because reviewers judge the whole surface and the defect reads as a
  lighting problem.

## Decision rules

- **When a material is within two samplers of the soft cap, pack before you drop a
  feature.** Packing costs nothing visible; dropping a feature costs the look.
- **When two maps are semantically inverses, do not pack both.** Smoothness and
  roughness, or gloss and roughness, are one quantity; storing both is a second
  authority for the same number and they will disagree after one edit.
- **When a packed layout changes, treat it as a breaking change to every asset that uses
  it.** There is no compatibility path — a re-channelled texture read by an old material
  is corruption, not degradation. Version the convention.
- **When you cannot state which channel holds what, the packing is not done.** A packed
  texture without a recorded layout is a puzzle for whoever opens it next, and they will
  guess.

## When not to use it

- **When the sampler count is comfortably under the soft cap.** Packing has real costs
  and buys nothing you need. Unpacked maps are easier to iterate on, and iteration
  speed is the scarce resource until the ceiling is the scarce resource.
- **When the maps have genuinely different resolution needs.** A normal map at high
  resolution and an occlusion mask that would be fine at a quarter of it should not share
  a texture; packing forces the low-need map up to the high-need map's size and can spend
  more memory than it saves.
- **When a source channel could not honestly be derived in the first place.** Packing
  does not launder provenance. A roughness channel guessed from a colour image is still a
  guess after it is packed, and it is now harder to replace.
