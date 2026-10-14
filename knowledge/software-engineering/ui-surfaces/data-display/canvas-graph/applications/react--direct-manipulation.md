---
layer: application
type: application
subject: canvas-graph
technique: direct-manipulation
stack: react
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# A state-machine editor's node drag: the threshold and the grab offset

An animation state-machine editor draws states as absolutely positioned
percent-coordinate nodes inside one container. Its node drag was written the
shortest way: a press sets "dragging", every mouse move on the container
writes the pointer position, converted to percent of the container, straight
into the node, and a window-level mouse-up clears the flag. The release half
was already right (the window listener means a drag that ends outside the
container cannot stick), which is why this seam was chosen to *falsify* the
technique's click-versus-drag and drag-math clauses rather than its capture
clause. They did not hold in the tree.

## What A did

- **No threshold.** The first mouse move after a press mutated the model, so a
  click with two pixels of travel relocated the node and marked the draft
  touched. Measured: a 2 px press moved a node from (50, 50) to (53.2, 52.25)
  percent.
- **Absolute pointer, not origin plus delta.** The node's anchor snapped to the
  cursor at the first move, so grabbing a node anywhere but its anchor made it
  jump by the grab offset (3 percent on a 1000 px canvas for a 30 px grab).
  The technique's formula is original position plus converted delta from the
  gesture origin.
- **No cancel.** Nothing restored the origin, because the model had already
  been written to.

## What B does

A press now records gesture state only: node identity, pointer position in
screen pixels, and the node's position at press. The first sample that travels
four screen pixels flips the gesture to a drag; from then on the node sits at
origin plus the screen delta converted through the container size, clamped to
the container. Release clears the gesture. Escape restores the recorded
origin. The resolve step is a pure function so the threshold and conversion
are testable without a DOM.

## Read against target and floor

Target: model writes on a sub-threshold press, A 1 of 1, B 0 of 1; grab-offset
jump after the threshold, A 3 percent, B 0; cancel restoring the origin, A no,
B yes (three paired tests, red on the old code, green on the new). Floor: the
five existing animation-editor suites (32 tests), the type check and the
linter's error level unchanged.

Not measured: a live drag in the running app; whether a four pixel threshold
suits touch input on this surface (a desktop-only canvas, so left at the
pointer default); the mouse-event stream still lacks pointer capture, which the
window listener makes safe for release but not for tracking moves that leave
the container.
