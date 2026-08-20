---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: reference-role-tagging
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
use_when: [handing more than one reference image to a reconstruction, references are fighting each other, deciding what a colour reference may and may not carry]
---

# Reference role tagging

## The concern

The naive model of references is a bag: here are five pictures, please use them. It degrades
results rather than improving them, and it degrades them in a way that is hard to diagnose,
because the output looks like a bad reconstruction rather than like a bad brief.

References are not interchangeable. **Each one plays a declared role in the reconstruction,
and the role determines what the reconstruction is allowed to take from it.** An image tagged
as a colour reference must not contribute silhouette. An image tagged as a material reference
must not contribute proportion. Untagged, every image contributes everything, and the model
resolves the conflicts by averaging — which is how a clean concept plus a mood board produces
a subject that is neither.

The general craft of composing prompts and locking a visual style across generated images
belongs to generative media at large. What is specific here is that a **reconstruction**
consumes these images to build a solid, so each role is defined by which property of the solid
it constrains.

## The roles

A working set, each defined by what it authoritatively supplies:

- **Blocking / form anchor** — the reference that fixes composition, framing and, for a
  moving shot, camera path and timing. Supplies shape and layout, supplies nothing about
  surface. Flat-shaded or grayscale is a feature here, not a defect.
- **Colour** — the palette and where colours sit on the subject. Supplies hue and value
  placement, and must not supply shading or shape.
- **Material / surface** — roughness, metalness, weave, wear, grain, and the lighting
  response. Usually a close crop of a surface, not a view of the subject at all.
- **Multi-view set** — several angles of the same subject, supplied so the reconstruction
  holds identity on the angles it was never shown. Judged as a set, for consistency.
- **Identity / master** — the subject's exact design, proportions and key details: the thing
  the output must match. Exactly one. It is the only reference gated against the full
  reconstruction rubric, because it is the only one that must itself reconstruct.

The exact vocabulary matters less than that it is **closed and declared**. What is not
negotiable is the separation of colour from material, and the singularity of the master.

Each role also owns a **fixed phrasing template** that states the role in the request itself
— "use this as the master identity reference; the subject must match it exactly in shape,
proportion and key details". The role is not metadata the model can see; it is a sentence, or
the tag does nothing. A role tracked in a record and omitted from the request is a role that
was never applied.

## Why colour and material must be separate

A single reference asked to do both teaches the reconstruction that a highlight is a colour.
That is the mechanism behind the most common surfacing defect in generated assets: baked
lighting in the albedo. A brightly lit metal reference contributes a white streak that lands
in the base colour and can never be lit correctly afterwards, because it is already lit.

So: **the colour reference is flat and evenly lit; the material reference carries the
lighting response and nothing about the subject's identity.** If only one image exists, it is
a colour reference and the material is described in words instead. Do not let one image hold
two roles because it is the only one available.

## Assembly order

The order references are supplied in is not cosmetic — later references are read as
refinements of earlier ones, and **the last one to speak on a property tends to win.** That
single fact determines the order, and it produces an arrangement most people get backwards.

1. **The blocking anchor first.** It establishes the frame everything else modifies.
2. **Colour, then material.** Palette before surface response, in that order, so the surface
   reference is understood as *how this colour behaves* rather than as new colour.
3. **The multi-view set next**, filling in the angles nothing else covers.
4. **The identity master last.** This is the counter-intuitive one. The master is not first
   because it is most important — it is *last* because it is most important. It must have the
   final word on shape, proportion and key details, and anything placed after it gets to
   overrule it on the properties it claims.

Carry the order as a declared numeric rank on the role itself, so the assembler sorts by role
rather than by arrival. An assembler that concatenates references in upload order produces
results that depend on the sequence an artist happened to attach files in, which is the kind
of non-determinism that costs a day to find.

## Decision rules

- **If two references claim the same role, one of them is wrong.** Pick, or promote one to a
  different role. Two masters is the defect that produces a hybrid subject.
- **If a reference has no role, it is not a reference.** Drop it. "It's just for vibes" is how
  an unrelated silhouette enters the reconstruction.
- **Tag before gating, not after.** The rubric applied to a material crop is not the rubric
  applied to a master, and running the wrong one produces a confident wrong verdict — a
  material swatch fails subject isolation trivially and should never have been asked.
- **Carry the tag on the artifact,** not in the request that used it. The set will be reused,
  re-assembled and re-gated, and a role that lives only in one call is lost by the second.

## When not to use this

- **Single-reference reconstructions.** One image, no ambiguity, no ceremony. Adding a role
  taxonomy to a one-image flow is overhead with no return.
- **Capture-based pipelines**, where every image is a registered view of the same subject and
  the concept of role does not apply.
- **Human-facing mood boards**, where breadth and contradiction are the point. Those are
  inputs to a person, not to a reconstruction, and constraining them serves nobody.
