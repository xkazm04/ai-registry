---
layer: technique
type: technique
subject: render-submission-economy
technique: batch-by-page-where-order-is-invisible
status: forged
laws: [an-instrument-proves-it-had-input, structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a sprite renderer flushes several times per object because consecutive draws use different textures, sorting draws by texture page to cut draw calls and binds, a separate small texture for overlays or flat shapes keeps breaking batches]
---

# Batch by page where order is invisible

The concern: a sprite renderer accumulates quads into one batch and must flush it — one draw,
often one texture bind — every time the next quad samples a different texture. A loop that
draws each object completely before the next one (its body from one atlas page, its overlay
from a second texture, the next body from another page) flushes several times per object, and
on a driver that charges for each flush the loop's cost is the flushes, not the quads. Grouping
draws by page removes the flushes. It also changes the order in which things are drawn, and
order is visible wherever two translucent things overlap. The technique is the regrouping
together with the proof that, in this frame, the reorder cannot be seen.

## Procedure

**1. Count flushes and binds, and attribute them.** Per frame, the number of draws and texture
switches, and which pass issued each switch. A per-object loop that alternates between pages,
or between a page and a one-texel helper texture, shows up as a pass whose switches scale with
its object count.

**2. Remove the helper texture before reordering anything.** A one-texel white texture used to
draw tinted shapes, or a separate small texture for an overlay, breaks every batch it touches.
A small solid region on the page itself, padded like any other region, lets those shapes draw
from the page already bound. This is the cheapest batch win available and it involves no
reordering at all.

**3. Decide per frame, and per reorder, whether it is visible.** Two different reorders are on
offer and each has its own test. For the objects a pass draws, build conservative shapes cheaply
— an oriented box for each body, padded by a small margin, and a disc for each overlay. Moving
every overlay after every body is invisible if no overlay touches the body of an object drawn
*later* in the original order. Grouping the bodies by page is invisible if no two bodies on
*different* pages touch. The answers combine into three paths, not two: both hold, so bodies go
out grouped by page and overlays follow in one batch; only the first holds, so bodies keep their
order and the overlays still follow in one batch; the first fails, so the frame keeps the
original per-object order. Every path produces the same pixels; they differ in how many flushes
it takes. Treating the two tests as one throws away the middle path, which is the common case
in a pack of objects that touch only within a page.

**4. Fall back to the original order whenever the bounds are unknown.** An object drawn by a
procedural fallback, or whose bounds metadata is missing, has no shape to test, and the safe
reading of an unknown bound is "may overlap".

**5. Count which path each frame took.** Two counters — frames batched, frames kept in order —
reported with the draw and bind counts. A batched path that the scenario never selected has not
been proven to run, and a test scene in which nothing overlaps never exercises the fallback
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)). The
packs where objects actually touch — a starting grid, a collision — are the frames that
exercise both, and they are the ones a screenshot check must include.

**6. Prove the picture, then report the counts.** Geometry tests for the overlap shapes; a
comparison of frames from the scenes where both paths run; then the before and after draws and
binds with the scenario, window and number of frames they were averaged over
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When two translucent primitives may overlap, keep painter's order between them.** Sort
  only within runs that are provably independent; a blended sprite drawn in the wrong order is a
  visual defect, and a correctness check that never saw an overlap has not ruled it out
  ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
  General-purpose two-dimensional renderers apply the same rule when they merge draws: a draw
  may move past another only when their bounds do not overlap.
- **When a layer is fully opaque, draw it first and as opaque.** Discard and alpha testing stop
  a tile-based processor from rejecting hidden pixels before shading them on every design of
  this kind; blending does on some and costs bandwidth on all, so an opaque ground submitted as
  blended may pay for every pixel it covers. The vendor order is opaque, then alpha-tested,
  then blended. Verify that the layer's art really is opaque, compare its edges, and measure the
  change on the device: the size of the saving depends on the processor, and a host cannot
  show it.
- **When the opaque layer sits on a layer that must stay blended, expect nothing.** Rejection
  removes hidden work only if the hidden layer is eligible to be rejected; a full-screen layer
  that keeps translucent edge texels is shaded before the opaque layer covers it, so turning
  blending off above it removes nothing. Making the lower layer eligible means writing it fully
  opaque, which changes its edge pixels and is a visual change judged as one. One device A/B of
  exactly this cut — two profiled fifteen-minute runs on one streaming stick, one per build,
  2026-10-07 — measured no gain while a host proved the picture identical: a proven-identical
  picture is the precondition for keeping a change, not a reason to keep it, and the change was
  reverted.
- **When art that is always drawn together lives on different pages, fix the page plan.** The
  renderer can only reorder what the overlap test allows; the atlas plan decides how many pages
  a pass needs at all.
- **When the overlap test costs more than the flushes it saves, skip it.** A pass with two
  objects has little to gain; a pass with a dozen on two pages is where it pays.
- **When text is drawn from several font pages after the interface atlas, count those flushes
  too.** A text layer often costs more switches per frame than the scene, and merging its pages
  is the same technique applied to glyphs.

## Alternatives that lose

**Sorting by texture unconditionally.** Fewest flushes, wrong pictures whenever translucent
objects overlap; the defect appears only in the busiest frames, which is where nobody looks
closely.

**Instancing or a custom shader to avoid the bind.** Worth it at large populations; at a dozen
sprites it adds a code path and a device-compatibility risk for a saving the regrouping already
captured.

## When not to use

On a renderer that already sorts by state with a depth buffer — opaque three-dimensional
geometry is order-independent under depth testing and is sorted for state as a matter of course.
On a frame bound by fill rather than submission, where fewer flushes change nothing measurable.
And where one texture serves the whole pass already: there is nothing to group.
