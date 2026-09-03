---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: pixel-grid-and-resolution-contract
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, one-authority-per-quantity]
shared_with: []
use_when: [setting the resolution a two-dimensional art class is authored at, sprite edges shimmer or crawl while the camera moves, deciding between a whole-number and a fractional presentation scale, a generated frame arrives at a size nobody specified]
---

# Pixel grid and resolution contract

## The concern

Two-dimensional art is authored in a unit — the **authored pixel**, the smallest mark
intended to be indivisible — and displayed in another, the screen pixel. The ratio between
them is the presentation scale, and it is the single number that decides whether the art
arrives on screen as drawn or as an approximation of itself.

Almost nothing carries this number. An image file records a width and a height; it does not
record that its author meant those as sixty-four indivisible marks rather than as six
hundred and forty smooth samples. The number lives in the pipeline or it lives nowhere, and
where it lives nowhere every downstream stage picks a plausible substitute: a generator
picks whatever its default output size is, a layout picks whatever fills the panel, a camera
picks whatever the window happens to be.

## Procedure

1. **Fix the authored pixel per art class.** Not per asset. A class — character, prop, tile,
   interface element, effect frame — gets one authored resolution and one relationship to
   world space, expressed as a quantity with a unit: *authored pixels per world unit*.
   Sixteen per unit and thirty-two per unit are both defensible; mixing them inside one
   scene is the thing that looks broken, exactly as inconsistent texel density does on
   three-dimensional surfaces.
2. **Fix the presentation scale as a whole number, and derive the render target from it.**
   Decide the internal resolution the game is composed at, then choose the whole-number
   multiple that fits the display. The remainder is letterboxed or filled with background —
   never absorbed by stretching the art.
3. **Fix the filtering rule in the same record.** Art authored on a grid is sampled without
   interpolation, so an authored pixel maps to a block of identical screen pixels. Art
   authored as smooth painterly work is sampled with interpolation. The choice belongs to
   the class, not to whoever imported the asset.
4. **Snap what moves.** With the grid declared, the remaining source of crawl is sub-pixel
   placement: a camera or a sprite positioned at a fractional coordinate is resampled every
   frame at a different phase. Quantise placement to the grid at the point of rendering, and
   keep the unquantised value as the authority for movement so the motion itself stays
   smooth.
5. **Check delivered dimensions against the contract before anything else.** This is a
   comparison of two integers and it is the cheapest gate in the pipeline. A frame whose
   dimensions are not the class dimensions, or not a whole-number multiple of them, is
   rejected at intake rather than resampled into compliance.
6. **Record the contract with the asset**, not only in the tool that enforced it. The next
   consumer — a packer, an exporter, a second renderer — needs the same number, and a
   number that exists only inside the gate that checked it will be re-guessed by everyone
   downstream.

## Decision rules

- **When the scale is fractional, the art is damaged, not softened.** At a scale of 2.5,
  half the authored pixels occupy two screen pixels and half occupy three, so a uniform line
  becomes uneven along its length and the unevenness migrates as the camera moves. Treat a
  fractional scale as a defect with a visible symptom, not as a quality setting. When the
  window will not divide evenly, letterbox to the nearest whole multiple; the border is
  cheaper than the crawl.
- **When the art class is grid-authored, interpolated sampling is the wrong default and
  making it configurable per asset is worse.** Per-asset filtering choices produce a library
  where some sprites are crisp and their neighbours are soft, which reads as a bug in the
  art rather than as a setting.
- **When a generator will not emit the class resolution, generate above it and reduce by a
  whole-number factor, never by an arbitrary one.** Reduction by two or four averages whole
  blocks and preserves the grid; reduction by 1.7 invents intermediate colours along every
  edge and cannot be undone. If no whole-number factor lands on the class resolution, the
  generation request itself is wrong.
- **When more resolution is available for free, do not take it.** A budget handed to a
  generative process is an instruction about the target
  ([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)): asked for
  a large frame, a model spends the space on detail finer than the authored pixel, and that
  detail is destroyed on the way down — leaving noise along edges where the art wanted flat
  regions. The correct size is the class size, and asking for more produces a measurably
  worse asset, not merely a larger one.
- **When two systems both compute the scale, one of them is wrong and nobody knows which.**
  The class record is the authority and the camera, the packer, the importer and any preview
  surface read from it
  ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). A preview
  that renders at a scale the game will never use certifies nothing.
- **When the class dimensions are stated without a unit, they are not a contract.** "128" is
  a number; "128 authored pixels tall at 16 per world unit, shown at 3× on a 1080-line
  target" is a contract, and only the second lets a reviewer say whether a delivery honoured
  it ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## When NOT to use it

- **Painterly and photographic two-dimensional art** that was never authored on a grid.
  There is no authored pixel to preserve, interpolated sampling is correct, and fractional
  scaling costs a little sharpness rather than destroying the style. The class record still
  states a resolution and a world relationship — that part is universal — but the
  whole-number rule and the snapping rule do not apply and enforcing them wastes memory.
- **Vector-defined or signed-distance interface art**, which is resolution-independent by
  construction and is rasterised at the size it will be shown. Imposing an authored pixel
  on it throws away the one property it was chosen for.
- **A single hero image** — a title screen, a full-screen illustration — shown at one size,
  in one place, forever. The contract exists to keep a library coherent; a population of one
  does not need it.

## What this technique does not tell you

Passing means the art is on the grid at the size it will be shown. It says nothing about
whether the art is *good*, whether it matches its siblings, or whether the smallest mark is
legible at the chosen scale. Legibility in particular is a perceptual judgment that a
correct grid does not supply: a sixteen-pixel-tall character can be perfectly on-grid and
still unreadable, and only an eye or a rubric can say so.
