---
layer: technique
type: technique
subject: depth-ordered-layered-art
technique: split-wrapping-parts-at-the-wrap
status: forged
laws: []
shared_with: []
use_when: [a part wraps or passes through another and is wrong from one side, a long run crosses another run, deciding whether a draw-order bug needs a split or a key]
---

# Split wrapping parts at the wrap

## The concern

A part that wraps another is in front of it on one side and behind it on the other. As one
layer it has a single key, so it is wrong on one side whatever the key is. This is the most
common source of the interlocks that measurement finds, and a person who knows the pattern
fixes it at authoring time without needing a measurement at all.

## When a draw-order bug needs a split rather than a key

Ask one question of any wrong overlap: **is the part nearer than the other somewhere and
farther somewhere else within the same overlap?** If it is nearer everywhere, move its key. If
the answer is both, the layer needs a cut, and the cut belongs where the surface order changes.

The usual shapes of "both" are these.

- **A spring, a coil or a frame round an inner part.** Two layers: the back half, drawn before
  the inner part, and the front half, drawn after it. A frame round a carriage becomes back
  bars, carriage, front bars. Order everything in the stack by this pattern: back frame bars,
  rods with their back coil halves, carriage, glass, front coil halves, front bars, then any
  dial in front.
- **A vertical part through a horizontal one.** A post through a clamp is drawn in two
  segments, the part below the horizontal part and the part above, with the horizontal part
  between them in the order.
- **A run that crosses another run.** A pipe, cable or rope is drawn as chunks, each its own
  layer at its own depth, because one line can pass in front of one part and behind the next. Two
  runs that cross on screen order correctly only if neither chunk also runs behind the other
  somewhere else, so break long chunks at the crossing.
- **A character through an arch.** The arch is two layers, its back and its front, and the
  character sits between them. One sprite for the whole arch makes the walker pass behind it or
  in front of it for the whole walk.
- **A stepped surface.** Things standing on steps are ordered with the taller steps further
  back, so an object resting on a lower step cannot be hidden by a taller step drawn in front of
  it. This is not a split; it is the rule that keeps the ordering consistent without one.

## Procedure

1. Name the inner part and the wrapping part. Cut the wrapping part at the surface of the inner
   one, not at its centre line: the cut must be where the wrap changes sides.
2. Make each half a full layer with its own shape record and its own key. A half that shares a
   record with its sibling cannot be measured separately.
3. Draw the cut so it is not seen. The two halves must meet flush, with no visible seam, no
   gap and no stroke along the cut unless the real part has an edge there.
4. Where a cut is an edge the viewer will see (a clip that ends one part against another),
   draw a stroked edge along the cut that moves with the cut part. A clip section that reaches
   past the joint, drawn into a hollow with no stroke at the end, reads as a line that stops in
   mid-air, and re-keying cannot fix it because the end face really is behind.
5. Re-run the order measurement. Splitting changes the pair set; a pair that was an interlock
   becomes two rules.

## Decision rules

- **When a moving layer can pass in front of and behind the same neighbour, split the
  neighbour or bound the motion so the order never changes.** A key cannot change during
  motion without the layer being re-sorted every frame; splitting the neighbour makes the
  order constant, which is cheaper and checkable once.
- **When a run needs to cross another run, cut at the crossing, not before it.** A chunk that
  extends past the crossing on the wrong side re-creates the problem.
- **When a split would produce a visible seam, prefer geometry that avoids the wrap.** Gap the
  pipe at its collar, make a volute tangent, put a valve on a straight run. A wrap that does not
  occur needs no split.
- **When only one side of a wrap is ever visible from the chosen camera,** do not split. A
  part wrapping the back of something the viewer cannot see round needs no back half.
- **Do not split to quiet a check.** A split exists because the surface order changes within the
  overlap. A split made so a pair stops being reported leaves the picture as wrong as it was.

## When not to use it

- **Where one key is right everywhere in the overlap.** Splitting adds layers, records and
  seams for nothing.
- **Where a depth buffer is available.** It orders per pixel and wraps need no splits.
- **Where the part is a flat decal.** A decal has no front and back.
