---
layer: golden-path
type: golden-path
subject: depth-ordered-layered-art
status: forged
use_when: [a picture is built from stacked opaque layers that overlap on screen, a part is drawn over something it should sit behind and fixing it breaks another view, a layered figure animates or explodes and the order goes wrong between the rest poses, a gate passes a drawing whose parts it never actually measured]
techniques:
  - measured-draw-order
  - split-wrapping-parts-at-the-wrap
  - order-across-every-reachable-pose
  - the-record-must-cover-the-drawing
  - texture-ends-on-an-edge-or-fades
---

# Depth-ordered layered art

A picture made of stacked opaque layers is correct under one condition: wherever two
layers overlap on screen, the one nearer the camera is drawn later. Isometric props, sprites
that wrap one another, a character who walks through an arch, a machine drawn as two hundred
flat shapes: all of them have no depth buffer. They have an order, and the order is the only
place depth exists. The rule is the painter's model, and it is old enough to carry its own
literature: a later layer paints over an earlier one, and that is the whole mechanism by
which one surface hides another.

A small scene lets a person hold the order in their head. Each layer gets a sort key and the
author nudges keys until it looks right. This works for a dozen parts and fails past a few
dozen, for a reason that is structural and not a matter of patience: every nudge settles one
pair by moving a layer relative to all its other neighbours, so every fix to one view can
break another. The failure is easy to miss because the check is a person looking at one
screenshot, and one screenshot is exactly the view the last nudge was made for.

This subject is how to get the order from geometry, how to know the check is looking at the
thing that is drawn, how to cover every pose a viewer can reach, and how to prove the parts of
the picture that no order check can see.

## The order is a measurement, and some pairs have no answer

The first move is to stop treating the order as taste. Give every layer a record of its true
shape in the scene, measure which surface is nearer wherever two layers overlap on screen,
and derive each key from the measured pairs. A depth probe over the overlap decides a pair;
the distance between two layer centres does not, because a long thin layer and a short wide
one can have centres in one order and surfaces in the other.

Measurement also reveals a class of pair that tuning only hides. When each of two layers is
nearer than the other somewhere in their overlap, they interlock, and no ordering of two
whole layers can be right. The only fix is to change the geometry: split one layer, give the
contact a flush or tangent face, gap the thing at its collar. A bias applied to an interlocked
pair does not fix it; it moves the error to a region the author happened not to look at. The
painter's-algorithm literature reached the same conclusion for polygons: cyclic overlap and
piercing overlap are resolved by cutting the offending polygons, not by a cleverer sort.

## Wrapping is the common cause

Most interlocks come from a part that wraps another: a spring round a rod, a frame round a
carriage, an arch round a walker. A wrapping part is in front of its inner part on one side
and behind it on the other, so it is two layers, a back half drawn before the inner part and a
front half drawn after it. The same logic cuts a long run that crosses another run into
chunks, each at its own depth. Learning to see a wrap, and to ask of every draw-order bug
whether it needs a split rather than a key, removes most of the work a measuring tool would
otherwise have to do.

## The order must hold in every pose a viewer can reach

A picture that moves has more orders than the ones at rest. Two layers that are ordered
correctly assembled and apart can be wrong in between, because every layer travels on its own
timing and the relative position at any instant is a blend. The check therefore samples the
real motion, with the real stagger, and the sample points are chosen from the structure of the
motion, its start and stop boundaries and the points where a viewer can reverse it, never from
round times. A defect a viewer sees for a tenth of a second on every interaction is still a
defect, and it is exactly the one that a handful of round-number probes steps over.

## A check is only as honest as its record

A geometry check runs on shapes somebody recorded as the parts were built. When the author is
also the party being checked, the record can be made to say anything: a thin disc recorded at
the tip of a rod makes the check pass and says nothing about the rod. So the first thing the
check does is measure whether the record covers the drawing, and an empty record is reported
as its own state, not skipped. The rule outlasts drawing: when a gate's input is written by
the party being gated, gate the input's coverage of the output before anything else
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)).

The coverage measure has a limit that belongs in the same breath: it compares the footprint of
what was recorded to the box of what is drawn. It says the record is not a stand-in. It does
not say the record is the right shape.

## What no order check can see

An order check sees recorded geometry. It does not see texture: a seam, rib, groove or tick
that stops in the middle of a face reads as broken at the zoom a viewer actually uses, and no
amount of correct ordering touches it. A second instrument, with a different blind spot,
checks every open stroke in the drawn markup for what it ends on. Each instrument states what
it cannot see, a clean run from one is evidence about its own domain only, and the run closes
with a person looking at close-ups ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
The two instruments are a pair because their blind spots do not overlap; neither is a proof.

## Where this subject stops

**Against sprite and atlas production.** That subject owns the finished sprite as a grid,
a palette, an anchor and a packed page. This subject owns the order in which separate layers
are drawn and the proof that the order is right. The rule for picking: if the defect is in
what one layer looks like or how it is packed, it is sprite production; if the defect is that
a correct layer is drawn over something nearer, it is here.

**Against generated mesh acceptance.** That subject owns the structural acceptance of a mesh,
including the three-state contract that makes an unmeasured property visible
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). This subject
inherits the contract and adds a failure that sits beside it: a measurement exists, and it
measures a stand-in. The first makes absence visible; the second makes the stand-in visible.

**Against the engine.** Where a depth buffer or a renderer's own sort decides the order, that
decision belongs to the renderer and this subject does not apply. It applies when the order is
authored: layers in a document, sprites in a list, shapes in markup.

## Failure modes of the naive reading

- **Tuning one screenshot.** The nudge that fixes this view breaks another view or another
  pose. The check has to be a measurement over every overlap, not a look at the latest frame.
- **Biasing an interlock.** A key cannot fix a pair that is each in front of the other
  somewhere. Cut the geometry.
- **Checking the rest poses.** Both ends of an animation are right and the middle is wrong for
  a fifth of the interaction. Sample the motion at its boundaries.
- **Recording a stand-in to quiet the check.** The check passes and speaks for nothing. Measure
  that the record covers the drawing.
- **Reading a zero as a clean picture.** The order check is blind to texture, the line check is
  blind to geometry, and both are blind to taste. Name the domain of every zero.
- **Fading what should end.** A texture that stops in mid-face reads as a mistake. End it on
  something or ramp it out.
