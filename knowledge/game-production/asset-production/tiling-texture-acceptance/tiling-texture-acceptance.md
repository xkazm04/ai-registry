---
layer: golden-path
type: golden-path
subject: tiling-texture-acceptance
status: forged
use_when: [accepting a generated tiling texture before it enters an engine, a surface shows a repeating line or grid in the build, deriving material channels from a single colour image, deciding how densely a texture should repeat across a surface]
techniques:
  - wrap-around-edge-diff
  - seam-threshold-calibration
  - luminance-heightfield-normal-derivation
  - derive-only-what-the-source-encodes
  - biome-themed-tile-prompting
  - texel-density-and-uv-tiling
---

# Tiling texture acceptance

A tiling texture has a property no other generated image has: it must be continuous with
a copy of itself. Every other quality of an image — composition, palette, subject, style
— is a judgment call that needs an eye. This one is arithmetic. The right edge column and
the left edge column of the same image either agree or they do not, and the difference
between them is a number you can compute in the time it takes to decode the file.

That combination — cheaply checkable, routinely unchecked, expensive to discover late —
is what makes the subject worth naming. The generic craft of prompting an image model,
locking a style and grading an output as a finished picture belongs to the neighbouring
discipline of generative media. What belongs here is the narrower and harder question:
**can this image tile, can it carry a material, and will it hold up at a stated density
in an engine?** Those three questions have to be answered before an import-and-build
cycle, because a build cycle is the most expensive possible seam detector.

## Why the seam is discovered late by default

The failure has a shape. Nobody sees a seam in the generated image, because a seam is not
visible in a single tile — it is visible only where two copies meet. The image looks
excellent in the browser, in the review sheet, in the approval thread. It is accepted, it
is imported, it is applied to a wall, the wall is 8 metres long, the texture repeats four
times, and now there are three vertical lines down the wall that were not in anything
anyone looked at.

Between acceptance and discovery sits an import, a material setup, a build and a
playthrough — minutes at best, a day of someone else's time when the asset moved between
people. The cost of the check is milliseconds. The cost of the miss is a round trip
through the whole pipeline. Any check with that ratio should be mandatory and automatic,
and the reason it usually is not is that a seam feels like an aesthetic problem, and
aesthetic problems feel like they need a human. This one does not.

**The base rate is the argument.** Measure it on a real corpus rather than asserting it:
across a body of generated tiling outputs from current image models with tiling requested
in the prompt, roughly one in four comes back with a visible seam. That figure — not the
elegance of the method — is what justifies the check. A defect rate of one in a thousand
would not be worth automating; one in four means that without a check, a quarter of
everything shipped is broken, and the breakage is invisible until it is embarrassing.

Note what the base rate also tells you: **asking a general image model for a tiling
texture does not reliably produce one.** Tiling is a structural constraint, and a model
that was not constrained to satisfy it satisfies it only by luck. Generators that enforce
tiling structurally — wrapping the sampling window during generation so the image's
edges are literally computed as neighbours, rather than hoping the prompt was persuasive
— fail far less often. When such a generator is available, prefer it; the check still
runs, because a structural guarantee that nothing verifies is a wish (see
[`law-and-check-share-one-source`](../../_laws.md#law-and-check-share-one-source)), but it
runs against a much better base rate.

## The material is not the image

The second half of the subject begins the moment the image passes. A surface in a
real-time renderer is not a picture; it is a set of channels, each answering a different
physical question. What colour is the surface under neutral light. Which way does it face
at each point. How sharply does it reflect. Is it a metal. A single generated colour
image answers the first question well, the second approximately, the third by convention,
and the fourth not at all.

This is the load-bearing distinction of the subject, and it is an epistemics rule
before it is a graphics one:

| Channel | Relationship to a colour source | Honest label |
| --- | --- | --- |
| Base colour | it *is* the source (minus any baked lighting) | measured |
| Normal / surface direction | recoverable from luminance as a height proxy — usually right, wrong wherever brightness came from pigment rather than relief | **derived** |
| Roughness | not present in the source at all; a stated convention maps appearance to a value | **heuristic** |
| Metalness | not present, not inferable, and wrong answers are catastrophic | **refused** |

A pipeline that emits all four channels as files of the same kind, at the same moment,
with the same confidence, is lying about most of its output. The files look identical in
a folder. Their epistemic status is not remotely identical. **Every derived channel
carries a label saying how it was obtained** — measured from the source, derived by a
named operator, asserted by a named convention, or absent — and a downstream consumer is
entitled to treat those differently. That is the whole of
`derive-only-what-the-source-encodes`, and it transplants far outside texturing: it is
the rule for any pipeline that turns one artifact into several.

Refusing a channel is a result. An absent metalness map that says *the source does not
encode this; author it or supply it* is strictly better than a plausible grey image that
makes a stone wall faintly conductive and sends someone hunting through lighting settings
for a week. Absence is loud; a wrong plausible number is silent
([`unmeasured-is-not-a-pass`](../../_laws.md#unmeasured-is-not-a-pass)).

## The derivation must preserve the property that was checked

A subtlety that is missed almost every time: a tileable image put through a naive
derivation comes out non-tileable. Any operator with a neighbourhood — the gradient
filter that turns brightness into surface direction, a blur, a sharpen — has to decide
what lies beyond the image edge. Clamping to the edge pixel, the default in most image
libraries, invents a flat border one pixel wide on all four sides. That border is
invisible in the colour image and glaringly visible in the lighting response, and it
recreates exactly the seam the acceptance check just cleared.

The fix is trivial and must be stated as a rule because it is never the default:
**every neighbourhood operator in a tiling material chain samples with wrap-around, so a
pixel at the right edge reads its right-hand neighbour from the left edge.** Then re-run
the seam check on the derived channels, not only on the source. A chain that checks the
input and not the output is checking the wrong artifact.

## Two roads to a normal map, and they are not rivals

There are exactly two ways to obtain surface direction. One is geometric: model the
detail as real geometry and bake the difference between a dense mesh and the sparse one
that ships. That is the business of mesh finishing for engine readiness, and it produces
a normal map that is *true* — it encodes measured geometry. The other is photometric:
treat the source image's luminance as a height field and take its gradient. That produces
a normal map that is *plausible* — it encodes an assumption that brighter means higher.

The distinction is not quality, it is provenance, and it decides where each belongs. Bake
from geometry when the detail is structural and unique: a bolt, a panel line, a carved
relief, anything a player can walk up to. Derive from luminance when the detail is
statistical and repeating: gravel, bark, plaster, woven cloth, rust — surfaces where
nobody can name an individual feature and the eye only wants the surface to stop being
flat. Derived normals fail loudly on exactly one class of input: a source whose brightness
variation is pigment rather than relief. A painted checkerboard on flat concrete derives
as embossed tiles. Where a source mixes pigment and relief, the derived map is wrong in
the pigment regions and no amount of parameter tuning fixes it, because the information
was never in the image.

## The tile is only half a texel density

An accepted, seamless, correctly-derived texture can still read as an obvious quality
failure in an environment, because tiling has a second number attached: how often it
repeats across the surface it is on. The image's pixel dimensions and the surface's world
size and the repeat count together fix one quantity — texture pixels per unit of world
space — and that quantity is a property of the *environment*, not of any single asset.

Inconsistency here is more visible than absolute value. An environment built entirely at
a modest density reads as a stylistic choice; an environment where the wall is crisp and
the floor beside it is soft reads as broken, and no reviewer will describe it as a texel
density problem — they will say the floor looks bad. So the density is declared once per
environment class as a target with a unit and a basis
([`a-number-carries-its-unit-and-basis`](../../_laws.md#a-number-carries-its-unit-and-basis)),
every surface's repeat count is derived from it rather than dialled by eye, and the
derived value is checkable. A generated texture is accepted *against a stated density*,
not in the abstract, because the same image is excellent at one density and a blurry
smear at a quarter of it.

## Under-specified prompts collapse toward a generic default

The last failure mode is upstream of all of this, and it is the one that produces the
most confusing bug reports. Ask a general image model for "a tiling ground texture" for a
dozen different environments and a surprising number of them come back looking like the
same grey-black granular asphalt. The model is not disobeying; it is doing what an
under-constrained generator does, which is fall toward the densest region of its training
distribution. The environment word in the prompt did not carry enough weight to move it.

The fix is not a longer prompt, it is a **themed vocabulary per environment class**:
material nouns, surface condition, and colour language specific to that class, composed
into the query rather than appended to it — plus a declared fallback for classes with no
entry, so that an unknown class produces a stated generic result rather than a silent
one. This is a small mapping table, and like every mapping table that both authors and
interprets, it must have exactly one owner
([`one-authority-per-quantity`](../../_laws.md#one-authority-per-quantity)): the vocabulary
that composes the prompt is the same vocabulary that reads the result back into material
properties. Two copies drift, and the drift shows up as a texture that was requested
rough and interpreted glossy.

## The acceptance sequence

1. **Generate with tiling structurally enforced** where the generator supports it, and
   with a themed vocabulary for the environment class.
2. **Check the wrap-around edge difference** on the colour source against a calibrated
   threshold. Fail closed: a texture that cannot be checked is not accepted.
3. **Derive only what the source encodes**, with wrap-around sampling, labelling each
   channel by how it was obtained and refusing the ones that are not inferable.
4. **Re-check the derived channels** for seams introduced by derivation.
5. **Accept against a declared texel density**, deriving the repeat count from the
   surface's world size rather than choosing it.
6. **Hand the labelled channel set downstream**, where sampler budgets, channel packing
   and shading-model choice are somebody else's decision — the consumer of these maps
   needs to know which of them are trustworthy, and the labels are how it finds out.

Steps 2 through 5 cost milliseconds and run without a human. Step 1 is craft. The whole
argument of this subject is that steps 2 through 5 must never be skipped on the grounds
that step 1 went well.
