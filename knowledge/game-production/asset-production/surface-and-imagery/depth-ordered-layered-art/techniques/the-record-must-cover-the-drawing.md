---
layer: technique
type: technique
subject: depth-ordered-layered-art
technique: the-record-must-cover-the-drawing
status: forged
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a check runs on shapes the author records as they build, a check passes and says nothing about a part you know is awkward, any gate whose input is written by the party being gated]
---

# The record must cover the drawing

## The concern

A geometry check does not look at the picture. It looks at a record of shapes written as the
parts were built, and the record is written by the same person whose work is being checked.
That person can silence the check deliberately, or by laziness, without ever breaking a rule.
In the measured case a builder recorded a thin disc at the tip of each of five overlapping
rods and a sliver for a sixth rod that was drawn sunk into its housing. The check passed. It
said nothing about any of the six rods, and the lit rod's outline was notched along its
length while it moved.

So the first thing the checker measures is whether the record is a stand-in. This is the
general rule: **whenever a gate's input is authored by the party being gated, gate the input's
coverage of the output before gating the output.** A gate that grades its own author's
summary is the case the law on self-certification describes
([no-gate-self-certifies](../../../../_laws.md#no-gate-self-certifies)).

## Procedure

1. **For each layer with a record, compute two footprints on screen.** The drawn footprint is
   the box of what the layer draws. The recorded footprint is the box of the union of its
   recorded shapes, projected the same way.
2. **Compute the share.** The area of the intersection of the two boxes, each grown by a small
   pad to forgive rounding, over the area of the grown drawn box.
3. **Fail below a stated share.** Sixty percent is a defensible working value, with the unit
   written beside it: a share of the drawn box's area, not of the shape's volume. List the
   failures sorted worst first, each with its share and both boxes.
4. **Report an empty record as its own state.** A layer with no recorded shapes has no
   footprint to compare, so a coverage computation skips it. If that skip is silent, the
   cheapest way to pass the coverage check is to record nothing. Count the layers with no
   shape and print the count as a failing line of its own, beside the coverage result.
5. **Keep an excuse list, and look before granting.** Some layers legitimately draw beyond
   their body: a glow, a shadow, a label plate. Excuse them by name, in a list the check
   prints, and grant each only after looking at the layer at high zoom.
6. **State the size of what was examined.** The number of layers checked and the number
   skipped (excused or empty) go beside the verdict
   ([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).

## The limit of the measure, stated with the measure

The share compares **boxes**. It reads the area of the union of the recorded shapes' footprints
against the box of the drawing, and it asks whether the record is a plausible stand-in. It does
not ask whether the record is the right shape. A shape undersized by about a fifth on each
axis can still pass at a sixty percent threshold, and a record that covers the box but not the
silhouette passes too. A synthetic probe over the source's check showed this: a slab drawn in
full with its true shape recorded passed; the same drawing with a tiny box recorded failed at
a share near zero; recorded shapes scaled to 0.7 of each dimension failed, and 0.8 passed. So
this check settles one question, whether the author recorded something real, and leaves
another open, whether what was recorded is accurate. The second is answered by the order
measurement agreeing with a person's close look, not by raising the threshold toward 100%,
which makes honest rounding fail.

## Boundary against the unmeasured-is-not-pass contract

The mesh-acceptance technique on unmeasured states makes an **absent** measurement visible: a
property nobody examined must read as not measured and never as compliance. This technique is
the neighbouring failure in the other direction. The measurement exists, it ran, it returned a
clean number, and it measured a **stand-in**. The unmeasured contract does not catch it,
because nothing is missing; this one does not catch an absent record, which has no footprint
until step 4 gives it a line. Each technique needs the other: a pipeline that implements only
the first reads a recorded sliver as measured; one that implements only this skips a layer
that recorded nothing.

## Decision rules

- **When the record covers less than the stated share, fix the record, not the threshold.**
  Record the true shape of what is drawn. A rod that slides out of a gland is one rod with a
  sliding shape, not two shapes.
- **When a layer is excused, the list prints at the end of every run.** An excuse that is
  invisible is the same as a stand-in.
- **When the record and the drawing are generated by the same helper, check anyway.** The
  helper can have the same blind spot as the author.
- **When a gate's input is a score, a label or a report written by the producer, apply the same
  rule outside drawing.** Gate whether the input covers the output (the files, the frames, the
  tests it claims to describe) before reading what it says.

## When not to use it

- **Where the check reads the picture itself.** A pixel-level depth probe over the rendered
  output has no author-written record to cover.
- **For a layer that is purely decorative and takes no part in any overlap.** Excuse it by
  name; do not record a shape for a mark that cannot be wrong.
