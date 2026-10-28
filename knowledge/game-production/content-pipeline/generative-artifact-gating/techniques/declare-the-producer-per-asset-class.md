---
layer: technique
type: technique
subject: generative-artifact-gating
technique: declare-the-producer-per-asset-class
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve, one-authority-per-quantity]
shared_with: []
use_when: [deciding whether an asset class should be generated, built by script or acquired, a generator is offered as a replacement for scripted props, a generated asset came back fused, mis-sized or without a slot the engine needs, deciding where a paid image-to-3D trial is worth running]
---

# Declare the producer per asset class, from a paired trial

The named concern: this subject treats which producers are terminal for a class as a
declaration made once per asset class. It does not say how to make that declaration. Without a
rule, the declaration follows fashion: the newest generator is pointed at every class, or at
none. This technique gives the questions that decide it and the trial that settles the ones the
questions cannot.

## Ask four questions about the class, in order

1. **Is its shape derived from data?** Cells drawn from a floor plan, walls along a graph, a chart
   in three dimensions. Then it is constructed by definition. A generator has nothing to add, and
   every regeneration would have to be reconciled with the data. Script it.
2. **Does its look depend on an exact profile or dimension?** A chamfer of a few millimetres that
   catches a strip light, a rim the hands rest on, a height another asset clamps onto. A
   generator returns plausible proportions, not specified ones. Script it.
3. **Must it carry separate material slots or moving parts?** An emissive strip the engine drives,
   a glass slot replaced at runtime, a hinged arm. Generators fuse parts and paint emission into the
   colour texture. If the slot must survive, script it, or generate the parts separately and
   assemble them under the part-cut plan.
4. **Is it read by fine silhouette at the distance it is seen from?** Chairs with legs, a plant, a
   small prop on a desk seen close. That is where a generator earns its cost. A script spends
   hours on detail a generator returns in minutes.

When the answer to all four is no, the class reads by mass, not by detail. Acquire it from a
licensed library if a fitting asset exists, or script it as simple, exaggerated blocks.

## Check the recognisability threshold before paying

A generator's advantage is fine detail. Fine detail is invisible below a size on screen. Render
both candidates at the size the player actually sees, with the scene's own shading. If the
difference is not readable there, the generated asset buys nothing at that distance. In one
trial, generated furniture glyphs (thin legs, five-star chair bases, cushions) read as real
furniture where the scripted ones read as boxes. That was clearly better leaning in, and not
significantly better at the player's distance, about 30 pixels a glyph. The scripted glyphs won
back the distance view by exaggeration: taller chairs and thicker tops than any true-proportioned
model, so their mass read as fast. True proportions made the generated sofas 0.8 centimetres tall
against the scripted 1.3, and hid the desks' monitors behind the chairs.

## Run the paired trial where the questions do not settle it

For each class still open, run one paired trial:

1. **Same reference.** One clean reference per object, prepared under the input gate's rules.
2. **Same render.** The scripted and the generated candidate under the same camera, lights and
   material, at the true viewing distance and leaning in.
3. **Generator's route recorded.** Single image or multiple views, its detail mode, any
   retopology, and the credits each call consumed.
4. **Delivered numbers, not requested.** Triangle targets overshoot (800 requested came back as
   808 to 879), so record what came back.
5. **Cleanup counted.** Every generated mesh needed stray-face removal, re-orientation, rescaling,
   material replacement and a trim to budget before it could stand beside the scripted one.

In one sprint the trial cost 18 paid calls (about 7 currency units at one service's published
prices; about one unit and two to four minutes per finished asset). Its verdicts:

- **Small furniture:** generator slightly better close up, no significant difference at distance.
- **The table frame:** generator same to worse. It came back one fused part at 0.75 metres tall
  against the specified 0.95, with non-manifold edges, a soft rim where the hands rest, and the
  glow strip painted into the texture.
- **Plan-derived rooms:** not tried, because there was nothing to generate.

An earlier trial on a rigid character with few primitives found the scripted build at about 8,000
triangles with 4 open edges, and the generated one with 26 open edges across three seeds.

## Write the declaration down, per class

The result is a row per class: its producer (constructed, generated, acquired), the question that
decided it, and the trial that settled it if one ran. The gate reads that row. A deferral filed
against a constructed class, or a generator pointed at one, is then refused by the declaration
rather than argued case by case.

## Decision rules

- **When a class is data-derived, needs an exact profile, or needs a separate slot**, declare it
  constructed. Do not trial it.
- **When a class reads by fine silhouette close up**, trial a generator against the script at the
  true viewing distance.
- **When the generated candidate wins only leaning in**, the declaration follows the distance the
  player sees from. Exaggerated scripted mass can beat true-proportioned detail there.
- **When a trial's generated asset needs the slot structure of the scripted one**, count the
  reassembly in its cost before calling it a win.
- **When a generator's output path carries a licence condition** (ownership only on a paid tier, or
  a texture stage under a research-only licence), the declaration names it. Shipping geometry while
  discarding a restricted texture stage is a valid route.

## When not to use this

- For classes nobody has tried to build either way. Build the cheapest placeholder first, and
  declare when the class matters.
- For one-off hero assets made by hand by an artist. The declaration is for classes produced in
  volume.
