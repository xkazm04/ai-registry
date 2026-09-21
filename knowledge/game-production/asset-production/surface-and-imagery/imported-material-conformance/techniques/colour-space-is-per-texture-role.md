---
layer: technique
type: technique
subject: imported-material-conformance
technique: colour-space-is-per-texture-role
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [wiring texture import for a delivered material, imported albedo reads washed out or muddy while the shading response looks right, an importer applies one colour-space setting to every texture in a delivery, some maps in a delivery look correct and others do not]
---

# Colour space is a per-texture-role property

## The concern

A texture is a grid of numbers. What those numbers mean depends on whether they were
written to be *looked at* or to be *computed with*, and the two are encoded differently:
appearance data carries a display transfer curve, and measurement data is linear. Reading
one as the other does not produce an error. It produces different numbers, silently.

The interchange formats in common use therefore fix the colour space **per texture role,
not per delivery**: base colour and emissive carry a display curve; metallic-roughness,
normal and occlusion are linear. Three of those five maps drive arithmetic inside a shading
model; two are pictures. An importer that holds one colour-space policy for a whole
delivery is wrong about three maps out of five whichever policy it picks, and the two
directions of the mistake have different, recognisable symptoms.

**A measurement map decoded through a display curve** returns values that are wrong in a
smooth, monotonic way. Nothing is broken, no boundary is crossed, no clamp fires — a
mid-range roughness reads as something else entirely and the surface looks faintly plastic,
faintly waxy, wrong in a way reviewers describe as a lighting problem. A normal map read
this way tilts every surface direction slightly and flattens the relief; an occlusion map
read this way lifts or crushes the contact shadows.

**An appearance map read as linear** is the loud direction, and it is the one that gets
noticed: the albedo reads washed out or muddy, and the shading response — the way the
surface catches light as it turns — is entirely correct. That combination is the
diagnostic, and it is the whole value of this technique: **colour wrong, shading right,
means the colour-space policy, not the shading model.**

## Procedure

1. **Write down the colour space of every texture role, per format the pipeline reads and
   per renderer it targets.** Five or six facts each. Two of them are appearance; the rest
   are measurement. A number handed across a boundary without the transform it was encoded
   under is not information
   ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)),
   and a transfer curve is exactly that basis.
2. **Make the import decide per role, from the delivery's own declaration of the role.**
   The role is stated in the delivery; it does not have to be guessed from a filename, a
   suffix convention or a preview thumbnail, and any pipeline that guesses will eventually
   meet an asset whose author named things differently.
3. **Give the mapping one owner.** The table that says which role is linear is read by the
   import, by any conversion or repacking step, and by whatever validates a finished
   material. Three copies drift and the drift shows up as a map that was decoded one way
   and written back another
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).
4. **Handle the shared texture as a measurement, whole.** Where several single-channel
   quantities share one texture, that texture is measurement data in every channel — there
   is no mixed case, because a display curve applies to the whole image and cannot be
   applied to two of its three channels.
5. **Assert it, do not inspect it.** Push a known ramp through each role and read the
   values back. A display curve applied to a linear ramp is obvious in numbers and nearly
   invisible to an eye that is also judging the material's design.

## Decision rules

- **When the colour reads wrong and the shading response reads right, suspect the
  colour-space policy before the shading model.** The split is per role, so the failure
  lands on some maps and not others.
- **When only half a delivery's maps look correct, that is the signature, not a
  coincidence.** A uniform policy applied to a non-uniform contract produces exactly this
  pattern, and a team that reads it as "some textures came out badly" will go looking for
  the bad textures.
- **When a texture's role cannot be determined, refuse it rather than defaulting it.** A
  map imported under a guessed role is a map whose numbers have an unrecorded basis, and it
  will be indistinguishable from a correct one in every later inspection.
- **When a step in the pipeline rewrites a texture, it re-states the role rather than
  inheriting it.** Repacking, resizing and format conversion all pass through code that has
  an opinion about colour, and a linear map that makes one such round trip untagged comes
  back as appearance data.
- **When a renderer exposes a per-texture colour-space switch, treat a wrong setting there
  as the same defect as a wrong conversion at the edge.** It is one authority in two
  possible locations, and only one of them may hold it.

## When not to use it

- **Where a pipeline consumes a single texture role and nothing else** — a purely
  unlit or purely appearance-driven presentation has no measurement maps and therefore no
  split to get wrong.
- **As a substitute for deciding what the channels mean.** This technique settles how a
  channel's numbers are encoded, not what quantity lives in it; a correctly linear texture
  can still have roughness where the receiver expects something else entirely.
- **As a place to correct a badly authored texture.** A base colour map with lighting baked
  into it is wrong in a way no transfer curve fixes, and absorbing that into the boundary's
  policy makes every other delivery wrong.
