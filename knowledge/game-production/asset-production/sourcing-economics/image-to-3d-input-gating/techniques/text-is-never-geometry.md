---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: text-is-never-geometry
status: forged
laws: [a-budget-shapes-the-output]
use_when: [briefing a source image that carries lettering or a logo, a reconstruction returns unreadable extruded relief, deciding what to strip from an input before generating]
---

# Text is never geometry

## The concern

Some content in a source image is not merely difficult to reconstruct — it is guaranteed to
come back as noise, at any budget, from any model. Lettering is the clearest case. A word on
a sign, a number on a jersey, a logo on a chest plate, interface text in a screenshot: all of
it reconstructs as extruded, deformed, unreadable relief. Not blurry text. Not slightly wrong
text. Meaningless bumps in roughly the right place, which then consume polygons and always
require manual removal.

The mechanism is straightforward. A reconstruction has no concept of a glyph — no notion that
these particular dark shapes are a discrete symbolic system where near-misses are worthless.
It treats lettering as surface variation, and surface variation is what it produces.
Everything that is *symbolic rather than volumetric* fails the same way.

## The family

Text is the headline; the rule covers a family.

- **Lettering, numerals, logos, insignia, interface text.** Never survives. Strip it.
- **Fine repeated pattern** — chain mail, mesh, perforations, woven detail. Reconstructs as
  lumpy approximation and eats budget doing it.
- **Thin structures** — wires, antennae, whiskers, straps, chains. Below the reconstruction's
  effective resolution; they come back fragmented or fused, and fragments are the debris that
  survives all the way to import.
- **Transparent and refractive material** — glass, lenses, visors. Reconstructed as opaque
  solid, or as a hole. Neither is what was meant.
- **Hair as strands.** Reconstructs as a helmet-like shell. That may be acceptable — for many
  asset classes a shell is what is wanted — but it must be a decision, not a surprise.

The shared property: each of these encodes information at a scale or in a physical mode that
volume reconstruction does not represent.

## What to do instead

The intervention is at briefing time, not at gate time — by the time the gate sees the image,
the cheapest fix has already been missed.

1. **Strip symbolic content from the source.** Generate or select the subject with the plate
   blank, the chest clean, the sign empty. The reconstruction then produces a clean surface.
2. **Apply the symbol as texture afterward.** A decal, a texture layer, or a material variant
   on flat geometry. This is where lettering belongs and where it is editable, localisable
   and correct at every distance.
3. **Where the shape genuinely must be geometric** — raised studio-cut lettering that catches
   a light, a sculpted crest — author it. Reconstruction is the wrong tool for a shape whose
   value is its precision.
4. **Simplify fine pattern into a single form** in the source, and restore it as normal or
   roughness detail on the surface.
5. **Decide the hair case explicitly** and record the decision, so the output gate does not
   report a shell as a defect when a shell was the plan.

## The budget angle

The cost is not only rework. Reconstructed lettering consumes real polygon budget on
meaningless relief — budget that was allocated to the silhouette and the readable detail of
the asset class. A source image carrying a paragraph of text spends a measurable share of the
mesh on noise, and the finishing pass then removes it, meaning the budget was spent twice to
end up where a blank plate would have started. State it in the brief as a target, not as a
prohibition: the source should show the subject *without* symbolic content, so the budget
lands on form.

## Decision rules

- **If the source carries lettering and the lettering matters, fail the input** and send it
  back for a clean version. Do not generate and plan to fix, because fixing means removing
  geometry and repairing the surface underneath it.
- **If the lettering is incidental** — a small maker's mark, background signage inside an
  isolated subject — strip it in preparation and proceed. This is a middle-band fix.
- **If the asset class tolerates a shell** — hair, mesh, fine pattern at silhouette distance —
  downgrade to a warning and record the expectation, so the output is judged against what was
  actually asked for.
- **Never accept "the model has improved on text"** without a measurement on your own asset
  class. It is the most persistently claimed and most persistently false improvement in this
  space, and the test is cheap.

## When not to use this

- **Flat signage and decal assets** where the deliverable is a plane with a texture: there is
  no reconstruction, and the rule has nothing to say.
- **Sculpted-relief pipelines** where lettering is authored as geometry deliberately and by
  hand — the rule is about what reconstruction produces, not about whether geometric lettering
  is ever legitimate.
- **High-resolution capture of a real object**, where a physically embossed inscription is
  measured rather than inferred and can survive if coverage and resolution support it.
