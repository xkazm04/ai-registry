---
layer: technique
type: technique
subject: drawn-gesture-command-recognition
technique: stroke-plane-projection
status: draft
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
shared_with: []
use_when: [an air-drawn stroke is compared with flat templates, the same shape reads differently when drawn at an angle, accuracy depends on which way the player faces]
---

# Stroke plane projection

The named concern: templates are flat pictures and an air stroke is a path through space.
Something has to choose the plane the stroke is flattened onto and the orientation of the
axes inside that plane, and both choices change what the matcher sees. Get the plane wrong
and shapes foreshorten. Get the in-plane axes wrong and shapes come out rotated or mirrored.
Neither error shows up as a crash, so both survive until someone draws at an angle.

## Three ways to choose the plane

**A fixed plane in the world**, such as a vertical plane facing the play area's forward
direction. It is simple and stable. It is wrong for every player who turns, and a seated
player turns more than the designer expects.

**A plane fixed to the body**, perpendicular to the head's forward direction captured at
pen-down. It follows the player's facing and stays stable for the length of one stroke.
This is the default for seated play. Capture the frame once per stroke. A plane that keeps
following the head while the player draws turns a head movement into a stroke distortion.

**A plane fitted to the stroke** by least squares, with the normal taken as the direction of
least spread. It removes facing error completely. It is unstable for strokes that are
nearly straight lines, because a line lies in infinitely many planes. Its axes also carry
no meaning: the two in-plane directions come out in an arbitrary order and with arbitrary
signs.

## Fixing the orientation inside the plane

Whatever chooses the normal, the up axis inside the plane comes from something the player
does not control. Project gravity's up direction onto the plane and use it as up. When the
plane is nearly horizontal and gravity projects to almost nothing, fall back to the head's
forward direction projected the same way. Choose the normal's sign so that it points toward
the player. A normal pointing away mirrors every shape, and a mirrored shape is a different
shape in any vocabulary with handed pairs.

Write down which frame is in force. Two code paths that each project strokes with their own
frame will disagree about every shape that is not symmetric, so one function owns the frame
and everything calls it.

## Procedure

1. Capture the reference frame at pen-down: head position and forward direction, and gravity.
2. Choose the normal: body-fixed by default, fitted when the vocabulary is rotation-sensitive
   in depth or when players draw on tilted surfaces.
3. Measure the stroke's out-of-plane spread against its in-plane extent. When the ratio is
   above a declared limit, the stroke was not drawn on a plane. Reject it as a malformed
   stroke rather than matching its shadow.
4. Measure foreshortening: the angle between the stroke's own fitted normal and the chosen
   plane's normal. Past a declared angle, a fixed or body plane is reading an ellipse as a
   circle. Either switch to the fitted plane for that stroke or reject it.
5. Project, then hand the flat stroke to normalisation, keeping the three-dimensional samples
   beside it for logging and replay.

## Decision rules

- **When accuracy differs by facing direction, the plane is the suspect.** Bin the
  confusion matrix by the angle between head forward and the fitted normal. Accuracy that
  falls with the angle is a projection defect, not a template defect.
- **When a handed pair (a shape and its mirror) is in the vocabulary, test the normal's
  sign explicitly** with strokes drawn by both hands and with the player turned both ways.
- **When the fitted plane is chosen, gate on linearity first.** A stroke whose
  second-largest spread is a healthy fraction of its largest has a plane. A stroke with one
  dominant spread has no stable plane, so project it onto the body plane instead. The
  fraction is a threshold and lives in data.
- **When depth jitter is large compared with the drawing size, prefer the body plane.** A
  plane fitted to noise tilts with the noise.

## When not to use it

- **For shapes whose depth is the point**, such as a push toward the target or a spiral
  drawn forward. Flattening removes the feature. Match them in three dimensions, or
  classify them by direction before shape.
- **For static poses.** A pose has no path to project.
