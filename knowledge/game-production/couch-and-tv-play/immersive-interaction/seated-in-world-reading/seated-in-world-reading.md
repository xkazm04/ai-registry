---
layer: golden-path
type: golden-path
subject: seated-in-world-reading
status: draft
use_when: [text, labels or screens must be read inside a head-worn display, placing world-space panels around a seated user, a judge calls labels oversized or panels tilted and small, designing how a seated user moves between contexts without moving]
techniques:
  - angular-legibility-floor
  - panel-placement-in-the-view-band
  - fade-the-content-not-the-view
---

# Seated in-world reading

A seated head-worn experience is mostly reading. Labels lie on a surface in front of the
person, screens of findings stand above it, a panel rides on a wrist, and a short caption
hangs by a character. Every one of them is text in a three-dimensional world, seen at an
angle and a distance the author did not choose freely. On top of that sits a person who must
not feel sick. On a flat screen a type scale in points solves most of this. Inside a headset
the same scale fails in three ways: the size that matters is an angle, the surface the text
lies on is foreshortened, and the place a panel stands is constrained by the furniture and the
eye before it is a matter of taste.

This subject owns the reading half of a seated experience and the comfort rule that bounds it:
how small text and marks may get, where reading panels may stand, and how the person moves
between contexts without the world moving under them.

## Where this subject stops

- **Frame cost** belongs to the standalone headset frame budgets subject. A reading surface is a
  translucent, often alpha-blended panel, and its cost is that subject's to count. This subject
  says what must be legible, and that one says what it may cost.
- **Scoring a scene against a painted concept** belongs to concept scene parity. Concepts paint
  labels as unreadable marks. When a floor from this subject forces a label to be larger than the
  concept's, parity records that in its cheat column as a device ceiling. It is not a defect in
  the label.
- **Type scales and minimum sizes on flat screens** belong to the design-token craft in the
  software bundle. The discriminator is the unit. A flat screen's minimum is a size in points at
  a known viewing distance. A head-worn minimum is an angle at the eye, and that angle changes
  with every placement of the same text.
- **Hand-tracked input**, its timing and its gestures belong to their own subjects. This one
  owns what the hands point at once it is drawn.

## The size that matters is an angle

Legibility in a headset is set by the angle a character subtends at the eye. One platform
vendor's user research puts the minimum legible text height at about 0.35 to 0.5 degrees
(21 to 30 arcminutes) and comfortable reading at about 0.6 to 0.8 degrees. A desktop display
standard prefers 20 to 22 arcminutes for display text. The first rule follows: a floor is
written as an angle, and each surface converts it into its own units at its own worst
placement.

The second rule is the one teams miss. The instrument that judges the scene usually resolves
fewer pixels per degree than the headset does. A flat 1600-pixel capture at a 90-degree field
resolves about 14 pixels a degree, where a current consumer headset resolves about 25. So
the binding check is in the capture's pixels, not the headset's. A label that reads in the
headset can still blur in every review frame, and the review frames are where decisions get
made. The floor is checked where it binds, and that is usually the capture. See
[angular-legibility-floor](./techniques/angular-legibility-floor.md).

A minimum is not a reading size. A floor at the bottom of the legible band keeps a label
recognisable. It does not make a screen of findings pleasant to read for ten minutes. Body
text on panels a person reads, rather than glances at, belongs in the comfortable band.

## Text that lies on a surface is foreshortened

A label printed on a table seen from a seated eye is viewed at a grazing angle. Its height on
screen shrinks with the sine of the viewing elevation, and the far half of a table is seen at
the lowest elevation of all. A name that clears the floor at the near edge drops below it at
the far edge at the same printed size. There are three honest answers:
- print far text taller, so every row reads alike from the eye;
- stand the text on a small card tilted up toward the eye;
- drop the text and let the structure carry the meaning.

Shrinking it to fit is not one of them. In one project, the far rooms' names could not meet
the floor flat and 30 of 32 were dropped. Stood on cards tilted 60 degrees toward the eye, all
32 read.

## A panel's place is measured, not chosen

A screen "at 60 centimetres, above the far half of the table" sounds like a placement. It may
be two incompatible ones. If the far half is 75 centimetres or more from the eye, a screen at
60 stands over the near half, and is seen against the far one. Panels are placed from measured
geometry:
- the eye at the seated pose;
- the band of the view not already taken by the surface the person works on;
- the depth of that surface;
- the frame edge, at which nothing may be cropped.

Inside those constraints, the reading panel goes where "in front of me" means: straight
ahead, upright, facing the eye. A queue of panels fans to the side as spines rather than
stacking behind the front one, where a rear panel's bright text bleeds over the panel being
read. See [panel-placement-in-the-view-band](./techniques/panel-placement-in-the-view-band.md).

A panel anchored to the body is a special case, because anatomy sets its size and angle. A
wrist panel is small and oblique at every placement a real forearm allows. It carries a few
rows in large type and hands longer reading to a panel in front.

## The seated person never moves, and neither does the world

Comfort for a seated user is decided by one rule: **the view moves only when the head moves
it.** No locomotion, no camera glide, no snap of the world to a new place. Moving between
contexts (one room of a model to the next, one queue to another) is a change of content, not
of position. The surfaces that show the content cross-fade, and the room around them stays
exactly where it was, as the rest frame the vestibular sense agrees with.

The tempting borrow from locomotion design is the blink: a brief fade of the whole view to
black. It exists to hide a position change. With no position change it hides nothing. It
removes the rest frame for a moment and turns a calm change of content into a cut. See
[fade-the-content-not-the-view](./techniques/fade-the-content-not-the-view.md).

## The sharpest path is not the scored path

A compositor layer samples a panel's texture once, at the display's own resolution, and is
the sharpest text a headset can show. It is also composited outside the engine's frame, so it
is absent from every flat capture. A team that moves its text to layers for the headset keeps a
world-space twin for the review camera. Otherwise the review scores a frame the headset never
shows, which is the parity subject's device-only rule, reached here from the reading side.

## The failure modes of the naive reading

- **Sizing text in points.** The same label is legible at the near edge and illegible at the
  far one.
- **Checking the floor in the headset only.** The review frames resolve about half the
  headset's pixels per degree, and decisions are made on them.
- **Treating the minimum as the body size.** The panel stays recognisable and is tiring to read.
- **Shrinking to fit.** Every shrink trades a dropped label for an illegible one, and the
  illegible one costs more, because nobody notices it is missing.
- **Thin weights for elegance.** Thin vertical strokes vibrate in a headset and break up as the
  surface is minified toward the far edge.
- **Placing a panel by a nominal distance.** It lands over the wrong part of the furniture,
  cropped by the frame, or across the thing the person was working on.
- **Stacking a queue behind the front panel.** The rear panels' text shows above and through the
  front one.
- **A document on the wrist.** The anatomy makes it small and oblique, and no placement fixes
  that.
- **A blink to change context.** It borrows a locomotion device for an experience with no
  locomotion and removes the rest frame.
