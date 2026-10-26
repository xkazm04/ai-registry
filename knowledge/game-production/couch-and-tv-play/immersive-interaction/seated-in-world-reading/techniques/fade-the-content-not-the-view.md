---
layer: technique
type: technique
subject: seated-in-world-reading
technique: fade-the-content-not-the-view
status: draft
laws: [one-authority-per-quantity]
shared_with: []
use_when: [a seated user must move between contexts, levels or rooms of a model, designing a transition in a stationary head-worn experience, someone proposes teleporting or flying the user to the next thing]
---

# Fade the content, never the view

The named concern: a seated experience still has to move the person between contexts. A model
has many rooms, a queue has many items, a map has many levels. The reflex borrowed from games
is to move the person: fly the camera, teleport them, blink the view to black and back. For a
person sitting still, every one of those moves the world under a body that did not move. The
mismatch between what the eyes report and what the inner ear reports is the best-established
cause of simulator sickness.

## The rule

**The view moves only when the head moves it.** Nothing else moves the camera: no locomotion,
no glide, no snap, no zoom of the whole world. Moving to a new context is a change of content.
The surfaces that show the content (a sheet, a map, a deck of panels) cross-fade, slide or lift,
and the room around them stays exactly where it was.

The room that never moves is not set dressing. It is the person's rest frame: the stable
surroundings the brain uses to decide that the person is still. The rest-frame account of
simulator sickness predicts that a stable, independent background reduces discomfort even
while foreground content moves. Keep the background stable, and let the foreground move.

## Why not the blink

Locomotion design hides a teleport behind a brief fade of the whole view to black, so the eyes
never see the jump. That device exists to hide a change of position. With no change of
position, there is nothing to hide. A full-view fade removes the rest frame for a moment and
turns a calm change of content into a cut, so it is never used for a change of context.

## How the content moves

- **Cross-fade the surface.** The current context's content fades out while the next one fades
  in, over about a third of a second. In one project, entering a room cross-fades the table's
  sheet from the site plan to the room's map in 0.3 seconds. The studio, the table and the hands
  stay where they are.
- **Animate content toward the person, not the person toward content.** A room the person is
  about to enter may lift up off the plan as a column, hold for a moment, and then the sheet dives
  into it. The motion is all in the content.
- **Keep content motion short and eased.** A fifth of a second to a third for a swap, and well
  under a second for any lift. Long, linear content motion starts to read as self-motion when it
  fills the view.
- **Keep the motion small in the field of view.** A content transition that sweeps most of the
  visual field reads as the world moving. One that stays on the surface reads as the surface
  changing.

## What travels with the person

A person's own aids do not fade when the context changes. A wrist panel, a status line, the hands
and a character who speaks are anchored to the person or the room. They stay, and they update,
so the change of context is legible: the wrist panel's list now marks the new room, and a
caption names it.

## Decision rules

- **When someone proposes moving the camera, the person or the world**, replace the move with a
  content transition on the surfaces that changed.
- **When a transition fills most of the view**, shrink it to the surface or shorten it.
- **When a full-view fade is proposed for a context change**, reject it. It belongs to
  locomotion, and this experience has none.
- **When a "later" design wants a separate space for each context** (a room the person sits in),
  treat it as a new experiment with its own comfort trial. Do not let it slip in as a
  transition style.

## When not to use this

- For experiences built on locomotion, with standing or walking users. Their comfort rules
  (vignettes, snap turns, blinks) are a different subject.
- For a deliberate one-off cinematic moment the person opted into. Even then, keep the rest
  frame, or warn first.
