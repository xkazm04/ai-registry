---
layer: technique
type: technique
subject: imported-material-conformance
technique: gloss-axis-inversion-and-the-midpoint
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [converting a material between a roughness convention and a smoothness convention, every imported surface looks uniformly glossy or uniformly flat, a material reads correct at mid grey and wrong at both ends, deciding what an import edge must do to a gloss map]
---

# The gloss axis is inverted, and the midpoint hides it

## The concern

Two conventions describe the same physical property with the same range and opposite ends.
One names it roughness: zero is a mirror, one is fully diffuse. The other names it
smoothness: zero is fully diffuse, one is a mirror. Both are stored as a number between
zero and one, both are perfectly reasonable, and **neither is labelled at the boundary** —
what crosses is the number.

Copying it across without negating maps the roughest possible surface onto the glossiest
possible one. That is not a scale error and it is not a precision error; it is a reflection
of the axis about its centre, and it has two consequences that decide how it is found and
how it is fixed.

**The midpoint is a fixed point.** A material sitting at the centre of the range is
unchanged by the inversion, so it arrives correct under the bug. Every spot check performed
on a mid-value material passes. This is the single reason the defect ships: the check that
would catch it is the same check that certifies it, whenever the material under the check
happens to be unremarkable.

**The quantity usually moves as well as inverts.** The two conventions rarely agree on
where the number lives. One family packs the gloss quantity into a colour channel of a
shared measurement texture alongside metalness; a receiving renderer may expect it in the
alpha channel of a different texture, and may take metalness from a different channel again
of that same texture. So the conversion is a **relocation and a negation at once**. A
pipeline that negates without relocating drives the surface from whatever unrelated
quantity happened to occupy the destination channel — occlusion, a mask, or nothing — and
the result is not merely inverted, it is unrelated to the delivery. A pipeline that
relocates without negating gets the familiar uniformly-shiny import.

## Procedure

1. **Record, for each participant, the axis name, its sense, its range and its storage
   location** — which texture, which channel, and whether a scalar factor multiplies it.
   Four facts, per side, per direction. A gloss value with no convention attached is not a
   value ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
2. **Implement the conversion as one named function per direction**, which negates and
   relocates together. Exactly one place knows the mapping; a second place that also knows
   it will eventually be edited alone
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).
3. **Apply the scalar factor and the map in the order the source convention defines**,
   which is normally multiplication of the sampled value by the factor. Negate the
   *product*, not the map and the factor separately — negating twice restores the original
   and looks, from outside, exactly like a conversion that never ran.
4. **Calibrate off the midpoint, at both ends.** Assert the conversion against values at
   both extremes and at least one asymmetric intermediate. A test built around a single mid
   value is a test that cannot fail for the reason the code exists.
5. **Keep convention conversion separate from artistic correction.** A delivery that is
   genuinely too glossy for the art direction and a delivery that is inverted are different
   facts; a single combined multiplier records neither, and the next person cannot tell
   which half they are adjusting.

## Decision rules

- **When a material reads correct in the middle and wrong at both ends, the axis is
  inverted, not mis-scaled.** This is the cheapest diagnosis at this edge and it costs one
  strip of test quads.
- **When every delivered surface is glossy in the same direction, do not touch the
  deliveries.** A uniform error across unrelated assets is a property of the boundary.
- **When the conversion is correct and the surface is still wrong, check the channel before
  checking the maths.** A negation applied to the wrong channel produces a plausible,
  varying, completely fictional surface — which reads as a bad map rather than as a
  pipeline bug, and so is blamed on the delivery.
- **When two names for the axis appear in one project, delete one.** Storing both a
  roughness and a smoothness value for the same surface is a second authority for one
  quantity, and they will disagree after the first edit that touches only one.
- **When a receiving renderer offers to interpret the axis for you, verify which way it
  went rather than trusting the label.** An import option named for the source convention
  and an import option named for the destination convention read identically in a
  screenshot of a settings panel.

## When not to use it

- **Inside a single-convention pipeline** with no interchange step and no second renderer:
  there is no boundary, and a conversion invented where none is needed is a degree of
  freedom someone will later set wrongly.
- **For a delivery that is simply too glossy.** That is an authoring judgment about one
  asset and belongs on the asset, not in a boundary that every other asset also crosses.
- **As a global corrective multiplier.** A negation is exact and total; a multiplier that
  approximates it is correct at one value, and the value it is correct at is usually the
  midpoint, which is the one place the bug was never visible.
