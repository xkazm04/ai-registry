---
layer: technique
type: technique
subject: depth-ordered-layered-art
technique: measured-draw-order
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a layered picture has more than a few dozen overlapping parts, a draw-order fix in one view breaks another, deciding whether an overlap needs a different key or different geometry]
---

# Measured draw order

## The concern

Hand-set sort keys scale to a dozen layers and stop scaling somewhere past a few dozen
overlapping parts. Each key is a compromise among all the neighbours the layer touches, so a
change that settles one pair silently unsettles another, and the author's only instrument is
a look at the view they just fixed. In one measured case a picture of several hundred parts
with hand-set keys had 190 pairs drawn the wrong way round when assembled and 133 when apart,
at a zoom where none of them were visible at the size the picture was first judged. Keys
derived from measured pairs took both counts to zero.

The technique is to derive the order from the geometry, and to treat the pairs that
geometry cannot order as a separate, named result.

This technique is stated for any stack of opaque layers with a known screen footprint,
including a plain sprite stack. It needs one thing from the pipeline: a record of each layer's
true shape in the scene, from which a nearer-surface test can run over the screen overlap of
two layers. Where the layers are flat cut-outs with no depth at all, the record is a depth per
layer and the technique degenerates to sorting by it; it earns its keep when layers have
extent in depth.

## Procedure

1. **Record the true shape of every layer.** The shape is what the layer is in the scene, a
   box, a cylinder, a swept tube, with its pose, not the outline of its drawing. Every check
   below is only as good as this record (see the record-covers-the-drawing technique).
2. **Find the overlapping pairs.** For each pair whose screen footprints intersect, measure
   which surface is nearer at each overlapped sample, by a depth probe over the overlap. Do not
   use the distance between layer centres or between layer bounding boxes: a long thin layer
   passing in front of a short wide one has the centre order reversed from the surface order.
3. **Classify each pair by who is nearer where.** Three outcomes. One layer is nearer over a
   meaningful area of the overlap and the other is nowhere nearer: that pair is a rule, *A
   after B*. Each is nearer somewhere: an interlock, which no key can fix. Neither is nearer
   over more than a sliver: no rule, the overlap is incidental. State the area threshold that
   separates a meaningful region from a sliver, with its unit.
4. **Raise each key just enough to satisfy every rule.** Start from the authored keys. For each
   rule, if the nearer layer's key is not above the farther one's by the stated gap, raise it.
   Repeat until nothing changes. Raising only as far as needed keeps the authored order
   wherever the measurement does not disagree with it, which is most places and is what keeps
   the diff reviewable.
5. **When the loop does not settle, find the loop.** Rules that chase each other form a cycle
   in the rule graph; the solver walks back from the layer that last moved until it meets a
   layer it has already visited. Drop the weakest rule in that loop (the one with the least
   overlap area behind it), record it as dropped, and solve again.
6. **Report three things separately.** Pairs that are wrong in the final order (a defect),
   rules the solver had to drop (a loop to inspect), and interlocks (a geometry problem). A
   dropped rule and a genuine interlock look alike from outside and are fixed differently.

## The interlock rule

**When each of two layers is nearer than the other somewhere in their overlap, change the
geometry. Never change the key.**

A key can only say which whole layer is later. An interlocked pair needs part of one layer
later and part earlier, and no single position for the layer provides both. Whatever the
key is set to, the picture is wrong over the region the other layer owns, and the bias just
chooses which region. The fixes are all geometry: split the layer at the interlock (see the
split-wrapping technique), gap the contact so the layers stop interpenetrating on screen, give
the contact a tangent or flush face, end a rod on a ball rather than through it, keep a pad
off the silhouette of its host. This is the same result the polygon literature gave for
cyclic and piercing overlap: the offending shapes are cut, because no order of the whole
shapes exists. (Newell, Newell and Sancha, 1972, for cutting cyclic overlap; Fuchs, Kedem
and Naylor, 1980, for the tree that does the cutting before sorting; the vector-graphics
rendering model's own statement that later markup paints over earlier markup is what makes
the key the only available lever. These were read through secondary summaries, not the
original papers; the rule itself is what the measured case independently produced.)

## Decision rules

- **When a pair is wrong and only one layer is nearer over the overlap, change the keys.** A
  rule exists and the solver will find it. Do not hand-patch.
- **When a pair is wrong and each layer is nearer somewhere, cut.** Do not retry keys.
- **When a loop is dropped, look at its pairs before accepting the result.** A dropped rule
  that is a true interlock needs a cut; one that is a measurement artefact (a thin overlap,
  a coarse probe step) needs a finer probe or a larger area threshold, with the new value
  stated.
- **When the picture has fewer than a few dozen overlapping layers and nobody has been
  surprised, keep the hand keys.** The measurement costs a record per layer and a probe step;
  it is not owed to a small scene.
- **When the probe step and the area threshold are chosen, state their units and the basis**
  (samples per drawing unit, share of overlap area). A threshold quoted without its unit
  moves silently when the picture is rescaled
  ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
- **When the checker can settle the keys itself, check the keys the artifact carries.** A
  check that solves the order before it verifies it validates its own solution, so a build that
  never ran the solve (or ran it after the keys were written out) passes. In the measured case,
  removing the solve call left the audit at zero problems while 271 of 478 written keys differed
  from the solved ones and the unsettled keys held 35 wrong pairs at rest or apart. Verify the
  keys serialised into the artifact against the measured pairs, or fail the build when the
  checker had to move any key.
- **A solver that raises keys is one workable realisation, not the only one.** A sort on
  measured pairwise order with cuts, or a tree built from the layers' own planes, answers the
  same question. What is not optional is that the order comes from a measurement of surfaces
  and that interlocks are a separate result.

## What rests on code only

The cut-the-cycle rule has strong corroboration in the hidden-surface literature. The
"raise each key just enough" solver, the drop-the-weakest-rule-in-the-loop step, and the
190-and-133 figures are the engineering of one toolkit and are given here as one realisation
with its measured result, not as the only method.

## When not to use it

- **When the engine owns the order.** A depth buffer decides per pixel; there is nothing to
  key.
- **When the layers are flat, never overlap, or have a fixed order by construction.** A
  ground tile under a sprite needs no measurement.
- **When the record cannot be trusted.** A measured order over made-up shapes is a precise
  wrong answer. Apply the coverage check first.
