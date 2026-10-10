---
layer: application
type: application
subject: imported-material-conformance
technique: colour-space-is-per-texture-role
stack: python
status: forged
verified_on: 2026-10-10
verified_against: python@3.11
applied: code
ab_verdict: better
proof: ab-paired
---

# A second role table in a headless bake script, in a Python mesh-finish stage

## What was opened

The same game-production pipeline as the
[node application](node--a-fixer-script-is-the-edge-in-the-wrong-place.md), at a different
edge. Its local 3D stage turns a dense generated mesh into a game-ready low-poly. A
TypeScript runner builds the argv, and a headless Blender Python script decimates,
unwraps and bakes the high-poly detail into normal, AO, base-colour and roughness PNGs,
then exports a GLB.

The pipeline already had what this technique asks for. One TypeScript module holds the
per-role table (albedo is sRGB; normal, metallic, roughness and AO are linear), and a
swatch test asserts that the three material projections read it and state no
colour-space literal of their own. The bake script was not one of the three. It held its
own list:

```python
# Data maps must not be colour-managed; only base colour is sRGB.
NON_COLOR_MAPS = ("normal", "roughness")
```

AO is missing from that list. So the AO bake target was a byte image left at Blender's
default, sRGB, and Cycles encoded the scene-linear AO through the display curve when it
wrote the pixels. The glTF occlusion slot and the pipeline's own table both read that
map as linear. Nothing errored, and the PNG looks like any other AO map.

**The witness for that version:** the script's own comments pin its measurements to
Blender 4.2, and Blender 4.2.1 LTS on the machine that ran both arms reports a bundled
Python 3.11.7.

## Why this seam was chosen to falsify

The table had one owner and a test guarding it, which is the end state the technique's
procedure describes. If a single-owner table were enough, no per-role encoding error
could survive in this tree, and the seam would return nothing. It returned a live error
in the one projection the guard did not enumerate.

## The paired run

Both arms are the pipeline's own `bake_high_to_low`: A from the commit before the change,
B from the change, with B's colour spaces taken from the argv the TypeScript runner
builds. Both ran in Blender 4.2 headless over one fixture, a subdivided plane with a box
on it under a single material at a known linear base colour (0.2) and roughness (0.3),
baked at 128 px. The reference comes from a separate layer: the harness repeats each bake
into a float image it owns, which holds scene-linear values with no encode. Each saved
PNG is re-read raw, the way a consumer samples it. Linear roles are read as stored, and
base colour is decoded through the sRGB curve.

| Map | A: image colour space | A: error, mean / occluded band / max | B: image colour space | B: error, mean / band / max |
| --- | --- | --- | --- | --- |
| AO | sRGB | 0.0709 / 0.1193 / 0.2873 | Non-Color | 0.0006 / 0.0009 / 0.0039 |
| Normal | Non-Color | 0.0013 / 0.0019 / 0.0020 | Non-Color | identical PNG |
| Roughness | Non-Color | 0.0019 / 0.0020 / 0.0027 | Non-Color | identical PNG |
| Base colour | sRGB | 0.0008 / 0.0009 / 0.0455 | sRGB | identical PNG |

The occluded band is the 29,172 pixels whose true AO lies strictly between 0.05 and 0.95.
The error goes in the direction the technique predicts: the consumer's mean AO is 0.773
against a true 0.702, so A lifted the contact shadows.

**Target:** AO error as a linear reader sees it. 0.119 mean across the band in A, 0.0009
in B. **Floor:** the other three PNGs are byte-identical between arms (same sha256), and
the pipeline's visual-generation suite is green (1,412 passed, 3 skipped). The floor
held. A third run with AO's colour space left out of the argv refused the AO bake and
named it, while the other three maps baked unchanged.

## What the change is

The runner passes `kind=<colourspace>` for every bake. It reads each value from the
table's Blender column through a bake-kind-to-role map (a diffuse colour pass is the
albedo). The script states no colour space of its own. A bake whose colour space was not
passed is refused rather than defaulted, because a byte image's default is sRGB and a
defaulted role cannot be told apart from a correct one afterwards. The swatch test now
also reads the bake script and fails if it contains a colour-space literal.

## What the run says about the technique

It held, and step 3, one owner, was the half that decided it. The narrower point is
about where the owner's readers end. The procedure lists the table's readers as the
import, any conversion or repacking step, and the validator. The copy that drifted lived
in a fourth reader: a step that **creates** a texture rather than receiving or rewriting
one. The guard enumerated the projections someone thought of as material edges, and a
bake does not look like one. That is a boundary case of the existing rule, not a new
mechanism. As an amendment it scored GAIN 1 / RISK 0, under the admission bar, so it is
banked here. **Return condition:** a second tree where a texture producer (a bake, a
procedural generator, a render-to-texture step) holds its own role table.

## What this realization cannot do

- **The fixture is synthetic.** It is one shape, one bake size and one sample count. No
  generated asset was finished, and no engine or viewer loaded the AO into an occlusion
  slot. The return condition is one mesh-finish over a real generated asset, read back
  in the engine against a float bake.
- **Metallic is not baked.** The pipeline refuses a metallic bake before Blender runs, so
  that role's row in the table is not exercised here.
- **The AO PNG still travels loose.** AO has no socket on the bake material, so the GLB
  carries no occlusion texture. The fix corrects the file a later step will load. It does
  not wire the file into the GLB.
