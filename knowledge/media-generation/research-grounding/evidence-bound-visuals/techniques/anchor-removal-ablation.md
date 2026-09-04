---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: anchor-removal-ablation
status: forged
laws: [output-never-outruns-evidence, checkability-routes-the-pixel, unmeasured-is-not-pass]
shared_with: []
use_when: [a generator fills unobserved regions from world knowledge, an output cannot be separated into a generated plate and a drawn layer, deciding which parts of a reconstruction are evidence and which are invention, a single surface mixes sourced and imagined content at the pixel]
---

# Anchor removal ablation

## The concern

[Epistemic draw routing](./epistemic-draw-routing.md) splits a frame by layer: checkable
elements are drawn by code from fact records, the rest is a generated plate. The split
works because the layers are separable — you decide per element, before rendering, which
owner draws it.

A whole class of output breaks that precondition. When a generator is handed a set of
real observations and asked to produce a view they do not fully cover, it fills the
uncovered regions from general world knowledge, and it fills them **plausibly** — that is
the capability, not a defect. The result is one surface on which sourced and invented
content are interleaved at the pixel, in the same style, at the same fidelity, with no
seam. There is no element list to route: the imagined lawn and the photographed building
arrive in the same image, and inspection cannot tell them apart. That is precisely what
makes the output useful and precisely what makes it dangerous — per
[output never outruns evidence](../../../_laws.md#output-never-outruns-evidence), a surface
that asserts uniformly while being grounded only in patches is asserting more than its
evidence supports, everywhere the patches are not.

The subject's standing remedy — break the claim rather than soften it, trim the region
where the invention became obvious — assumes the invention *became obvious*. Here it
does not. The whole point of the model is that it does not.

## The instrument: invention is what moves when an anchor leaves

There is one property that separates a grounded region from an invented one, and it is
not visible in any single output. **A grounded region is determined by the inputs; an
invented one is determined by the model.** So remove an input and re-render: what holds
was supported by evidence, and what changes was never evidence at all.

This turns an unanswerable question about a finished image into a cheap, mechanical
measurement, and it needs nothing from the generator beyond the ability to run it twice.

## The procedure

1. **Fix the output view.** The camera, the framing, the seed and every generation
   parameter are held constant across the ladder. The input set is the only variable —
   the ordinary rule, applied to a comparison against yourself rather than against
   another arm.
2. **Render the ladder.** Produce the same view from the full input set, then from
   reduced sets: leave-one-out where the set is small, or a shrinking prefix where it is
   large. Three or four rungs is usually enough to separate the stable core from the
   rest.
3. **Diff the rungs into an instability map.** Per region, record whether it survives the
   ablation unchanged, shifts, or is replaced wholesale. The map — not any single
   render — is the artifact, and it is what the ladder was run to produce.
4. **Route by the map, not by appearance.** Stable regions carry the standing of the
   inputs behind them. Unstable regions get exactly the treatment the generated plate
   gets under [checkability routes the
   pixel](../../../_laws.md#checkability-routes-the-pixel): they may set mood and they may
   not carry a claim, be captioned as a record of a place, or be measured off.
5. **Store the map with the asset.** A reconstruction without its ablation is
   unattributable later, and it will be re-used by somebody who was not there when it was
   made. An asset that cannot say which of its regions were observed should be filed as
   fully imagined — per [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass),
   the missing measurement is not a presumption of grounding.

## Decision rules

- **The ladder's direction is known in advance, so use it as a control.** More
  observations of a scene monotonically shrink the invented fraction: the model has less
  to fill and less freedom to fill it. If a region does *not* stabilise as inputs are
  added, the failure is in the pipeline — a bad pose, an input the model is discarding,
  a view nothing actually covers — and that is a finding about the capture, worth more
  than the render.
- **Stability is necessary, not sufficient.** Two inputs that agree can be consistently
  wrong, and a region can be stable because every rung inherits the same prior rather
  than because anything observed it. Stability licenses a region to carry a claim only
  when at least one input actually *sees* it; the map answers "was this determined by
  input", not "is this true".
- **When a region must be faithful and will not stabilise, add an anchor of that region.**
  This is the cheapest available fix and it is reliably cheaper than prompt work, which
  cannot supply information the inputs do not contain. Ranking regions by instability
  ranks the shots still worth capturing — the ablation doubles as a capture plan.
- **When the ablation is expensive, run it small.** The instability map is a spatial
  question, not a fidelity one; a low-resolution or short ladder locates the invented
  regions as well as a full one and costs a fraction. Cost is a reason to run it
  cheaply, never a reason to skip it.
- **When the generator emits its own per-region confidence, do not substitute it for the
  ladder without checking it against one.** A self-reported confidence is a claim by the
  thing being audited; calibrate it against a real ablation once, and then it may be
  trusted for the class it was calibrated on.
- **When the deliverable is explicit geometry rather than an image, the rule is
  unchanged and the stakes rise.** Invented geometry is measured off downstream by
  something that cannot see it was invented, so the instability map travels with the
  mesh, the cloud or the depth output as a required companion — not as documentation.

## When NOT to use this

- **For fully imaginative work with no referent.** Nothing is being asserted about a real
  place, so there is no invented fraction to find and the ladder measures nothing.
- **For layer-separable composites.** Where the output can be split into a plate and
  drawn elements, [epistemic draw routing](./epistemic-draw-routing.md) is the cheaper and
  stronger instrument: it prevents the mixing rather than measuring it afterwards.
- **When the inputs cannot be varied** — a single fixed observation with no alternative
  set. Then the honest answer is already known: everything outside what that one input
  covers is invention, and no ladder is needed to say so.
