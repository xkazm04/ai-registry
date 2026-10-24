---
layer: technique
type: technique
subject: concept-scene-parity
technique: grade-only-the-excess
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [fitting a colour grade or lookup table from a scene capture to a concept image, a fitted grade fixed the matched regions and shifted skin, accents or neutrals, an authored colour comes out wrong after tone mapping]
---

# Grade only the excess

The named concern: a colour grade fitted from a neutral scene capture to the concept image,
on a handful of matched regions, is the cheapest way to move the whole frame toward the
concept and the easiest way to damage it. The regions are few, the model can be large, and
a large model fitted to few regions reproduces those regions and invents everything else.

## Fit the fewest parameters that explain the deviation the regions show

Look at the matched regions before fitting anything and say, in a sentence, what is wrong:
*the paper is too saturated a blue*, *the shadows are too black*, *the whole frame is too
cool*. The grade fits that deviation and nothing else.

A full three-by-three colour matrix has twelve degrees of freedom with an offset, and five
regions are fifteen numbers. It will fit them, and it will do so by mixing channels in ways
the regions do not constrain; skin, which no region sampled, turns a colour no one chose.
Three independent channel curves are fewer parameters and fail the same way more slowly:
each channel bends to its own regions, and neutrals stop being neutral. The model that held
in practice is the narrow one: when the problem is a channel standing too high above the
others, fit only the amount by which it exceeds them, scale that excess, and leave every
pixel where the channel does not stand out untouched. Skin, warm accents and greys have no
such excess and pass through unchanged. Add a small black lift only if the regions show the
shadows crushed, and cap it.

The general rule behind the example: **the grade has no more free parameters than the
regions have independent observations of the named deviation.** If the deviation is one
number, the grade is one number.

## The tone curve owns highlight roll-off; the grade owns hue

Highlights are the tone curve's job: it rolls bright values off into a shoulder so that a
glowing edge reads as light rather than as a flat white shape. A grade applied after it
must not try to do that job, and the tone curve must not be switched off to make a grade's
job easier.

The temptation is specific. An authored colour, a deep blue paper, comes out shifted or
oversaturated through the tone curve, and switching the curve off makes it come out as
authored. It also removes the shoulder, so every emissive edge above white clips to a flat
white plate and the bloom halo has nothing to roll from. The trade is one colour for every
light in the frame. Keep the tone curve, capture neutrally through it, and let the narrow
grade bring the authored colour back.

## Procedure

1. Capture the scene through the shipping tone curve with no grade applied.
2. Pick matched regions, each a flat area that means the same thing in capture and
   concept. Weight the regions that carry the deviation.
3. Name the deviation in one sentence and choose the narrowest model that expresses it.
4. Fit, apply at less than full strength, and preview the whole frame, not the regions.
5. Inspect the elements no region sampled: skin, warm accents, neutrals, emissive edges.
6. Record the model, its parameters, the regions and the strength with the grade.

## Decision rules

- **When a fitted grade improves the regions and shifts an unsampled element, the model is
  too large.** Narrow it; do not add a region to pin the element and refit the large one.
- **When an authored colour comes out wrong through the tone curve, grade it back.** Never
  switch the curve off.
- **When the deviation cannot be named in one sentence, do not grade yet.** The gap is in
  the scene, and a grade will paint over it.
- **When the residual in a region stays large after the narrow fit, leave it.** A region
  the grade cannot reach is a finding for the asset or the light, not a reason to widen
  the model.

## When not to use this

- When the target is a defined colour space conversion or a film emulation known in
  advance; that is a transform to apply exactly, not a fit.
- When there are enough matched samples to constrain a richer model, such as a chart shot
  in the scene; then the parameter rule above allows it.
- When the device path cannot afford a grading pass at all; the colour work moves into the
  materials, under the device's feature allowance.
