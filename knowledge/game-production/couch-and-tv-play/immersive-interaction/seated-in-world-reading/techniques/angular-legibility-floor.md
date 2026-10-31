---
layer: technique
type: technique
subject: seated-in-world-reading
technique: angular-legibility-floor
status: draft
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [choosing the smallest text or line a head-worn scene may draw, a label reads at the near edge of a surface and not at the far edge, a judge calls labels oversized against a concept, deciding whether to shrink, cut or drop text that does not fit]
---

# An angular legibility floor, checked where it binds

The named concern: every piece of text and every thin mark in a head-worn scene has a
smallest size below which nobody can read it. That size is an angle at the eye, not a font
size. Without a stated floor, each surface picks its own size by eye, at whatever distance the
author tested from. The scene then ships labels that read in one place and blur in another.

## Write the floor once, as an angle, with its basis

Keep one constant: the minimum cap height, in arcminutes, at the eye the scene is judged from.
Give its basis beside it:
- published minimum legible text in headsets is about 0.35 to 0.5 degrees (21 to 30
  arcminutes): 0.35 to 0.4 at 2 metres, 0.4 to 0.5 at 45 centimetres;
- comfortable reading is about 0.6 to 0.8 degrees (0.6 to 0.75 at 2 metres, 0.65 to 0.8 at
  45 centimetres);
- desktop display practice prefers 20 to 22 arcminutes.

A floor near 22 arcminutes is the bottom of the legible band, and at arm's length it sits just
under the published near minimum of 24 arcminutes. It is right only for labels a person
glances at. It is wrong as the size for anything a person reads line by line. Write a second,
larger constant for body text on reading panels, and name both. One authority means every
surface reads its size from these constants. No surface keeps a private minimum.

## Convert it in the instrument that binds

The floor is checked in the pixels of the instrument that resolves the fewest pixels per
degree. That is usually not the headset. A flat review capture of 1600 pixels across a 90-degree
field resolves about 14 pixels a degree at its centre, and a current consumer headset about 25. Text that
clears the floor in the headset can sit below it in every capture the team reviews. So the
floor is converted into capture pixels (in one project, 6 pixels of cap height at 1600 x 900,
because 5 pixels blurred digits together in test renders) and into arcminutes at the headset
eye, and the stricter of the two binds.

## Measure every text class at its worst placement

A text class is a recipe: a face, a weight, a preferred cap height. Measure each one where it
is smallest from the eye:
- the farthest corner of a panel;
- the far edge of a surface, where text lying on it is foreshortened by the sine of the viewing
  elevation;
- the smallest placement the data can produce.

Log the measurement at build time, not only in a review, so the number travels with the build
that produced it. In one project the reading panels logged their smallest cap at the farthest
corner on every layout: 7.6 to 8.1 pixels against a floor of 6, so they were legible and still
below the comfortable band.

## When it does not fit, change the content, never the size

When a class cannot meet the floor in the room it has, work through these options in order:

1. **Raise the far text.** Print text that lies on a surface taller toward the far edge, so it
   reads the same from the eye.
2. **Tilt it toward the eye.** A name on a small card tilted up from the surface reads at about
   three times the cap of the same name lying flat. In one project, 30 of 32 far names failed
   the floor flat, and all 32 cleared it tilted 60 degrees.
3. **Cut it at a word, with an ellipsis**, where a shortened label still identifies its object.
4. **Paginate** a panel's body rather than shrink it.
5. **Drop it**, and log the drop, so the drop is visible to whoever reviews the frame.

Drawing it smaller is not on the list. A shrunken label is worse than a dropped one, because a
missing label is noticed and an illegible one is not.

## Weight, contrast and thin marks

- **No thin weights at small sizes.** Thin vertical strokes vibrate in a headset and break up as
  a surface is minified toward its far edge. A medium weight is the light end of the usable
  range.
- **Glowing text stays under the bloom threshold.** A bloom kernel cannot tell a letter from a
  light, so a bright label bleeds into a blur.
- **Lines and marks have a floor too.** A shader-drawn line narrower than about one pixel
  shimmers whatever the anti-aliasing, because multisampling smooths only geometric edges. Clamp
  a thin line's width at about one pixel and fade its intensity instead, so it thins by fading
  and never by breaking.

## Decision rules

- **When a concept paints labels smaller than the floor**, the concept is cheating. Legible
  labels will be larger than the concept's, and a judge comparing the two will call them
  oversized. Record that as the element's device ceiling. Do not shrink the labels to win the
  comparison.
- **When text reads in the headset and not in the capture**, the capture binds. Fix the text
  for the capture, or decide explicitly that the capture is not the judge for that class.
- **When a panel is read rather than glanced at**, size its body to the comfortable band, not to
  the floor.
- **When a class is dropped**, log it with its reason. A silent drop is a missing feature nobody
  can find.

## When not to use this

- For decorative marks that carry no meaning: they may go below the floor, as long as nothing
  depends on reading them.
- For text on a compositor layer, the headset's own resolution binds. The world-space twin kept
  for the review capture still binds in the capture.
