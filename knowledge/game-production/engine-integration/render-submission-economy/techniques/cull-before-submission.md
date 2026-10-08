---
layer: technique
type: technique
subject: render-submission-economy
technique: cull-before-submission
status: forged
laws: [every-effect-on-the-rules-is-visible, an-instrument-proves-it-had-input, structural-proof-is-never-sufficient]
shared_with: []
use_when: [the renderer submits every object in the level although the camera shows a fraction of it, long static geometry is resubmitted whole every frame, objects pop in or vanish at the edge of the screen after a culling change]
---

# Cull before submission

The concern: a two-dimensional or top-down renderer commonly hands the driver every pickup,
decal, obstacle and road segment in the level each frame and lets clipping discard what lies
off screen. Clipping is cheap for the graphics processor; the work that preceded it is not. By
the time a quad is clipped, the render thread has already computed its transform, its
trigonometry and its vertices, appended it to a batch and perhaps flushed for it. On a weak core
that work, multiplied by everything the camera does not see, is a large part of the frame. A
cull moves the decision ahead of all of it: the object is tested against the visible area before
anything is computed for it, and the calls into the graphics interface for it are never made.
Vendor guidance for mobile graphics processors ranks this early cull first among what an
application can do for itself, for exactly that reason.

## Procedure

**1. Compute the visible area once per frame, from this frame's camera.** The stage rectangle in
world units, from the camera's focus and its pixels-per-unit scale, plus a slack margin. Compute
it after the camera has moved for this frame, never from the previous frame's position, or a cut
or a respawn draws one frame of nothing.

**2. Give every drawable a conservative bound.** The bound is the farthest point the draw can
reach, not the object's nominal size: its radius under any rotation, plus a drop-shadow offset,
plus a trail or glow, plus anything a painter adds around it. A bound set to the centre radius
makes objects pop at the edge, and the defect is visible only while the camera moves.

**3. Test before any work.** Each painter skips an invisible item before its trigonometry, its
line segments or its sprite lookup, not after; a cull placed after the vertex work saves only
the clipping, which was already cheap.

**4. Chunk long static geometry.** A road ribbon or a coastline of hundreds of segments is split
into fixed-size chunks with precomputed bounds and drawn as runs of visible chunks. The chunk
size trades the cost of testing against the cost of drawing slightly more than is visible; a
dozen segments per chunk is the right order for a ribbon a camera sees a fifth of.

**5. Keep an "everything visible" bound for audits.** Thumbnails, full-level screenshots and
asset audits render the whole level, and a cull that silently applies to them produces blank
regions that read as missing art. The default bound is the whole world; the race camera opts in.

**6. Count what was submitted, before and after.** Sprites, indices, draws and binds per frame,
over the same scenario and window. A cull that removes nothing in the test scene is untested; a
cull that removes everything is a bug that the counts expose before a screenshot does
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).

**7. Prove the picture at the edges.** Screenshots of every scene the cull touches, with the
camera moving, compared against the path without the cull. The margin is checked against the
largest bound in step 2, by arithmetic, not by eye; a cull that passes its unit tests and pops a
shadow at the screen edge has passed the structural rung only
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

## Decision rules

- **When the cull decides what is drawn, it decides nothing else.** An object off the stage
  still collides, scores, triggers and sounds; the cull lives in the painter, never in the
  simulation, and a cull result that reaches a rule is an invisible effect on play
  ([every-effect-on-the-rules-is-visible](../../../_laws.md#every-effect-on-the-rules-is-visible)).
- **When the margin is smaller than the largest bound, the cull is wrong for that class.** Raise
  the margin or give the class its own bound; do not tune it by watching for pops.
- **When the camera can move far in one frame, recompute bounds after the move.** A stale bound
  is a frame of missing objects at every cut.
- **When the engine or a lower layer already culls, do not cull twice.** Measure what the lower
  layer culls first; a second cull adds a test per object and saves nothing.
- **When the cull was measured on a host, report what it saved as counts.** Its device time is
  measured on the device or carried as unmeasured.

## When not to use

On a single-screen game where everything is always visible, there is nothing to cull. On a
frame bound by fill, fewer submissions of off-screen objects change little, because clipping
already kept them from costing pixels. And for objects whose draw is a single cheap quad from an
already-bound page, the test can cost as much as the draw; cull the classes that compute
something per object, not the ones that only copy four vertices.
