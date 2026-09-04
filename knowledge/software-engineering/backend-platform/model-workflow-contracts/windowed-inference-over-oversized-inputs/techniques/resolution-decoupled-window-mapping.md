---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: resolution-decoupled-window-mapping
status: forged
laws: [gate-sees-target, limits-are-derived]
shared_with: []
use_when: [a model returns a window prediction at a different spatial size than the window it consumed, a model has several heads at several resolutions, a stitched result is misaligned by a voxel along one axis]
---

# Resolution-decoupled window mapping

The window schedule is computed in the input's coordinates because the input is
what gets sliced. The predictions are placed in the output's coordinates because
the output is what gets assembled. For a model whose output is the same size as
its input the two systems coincide and the schedule is used twice. For a model
whose output differs — a super-resolving model that returns twice the size, a
coarse-labelling head that returns an eighth, a multi-head model that returns
several — the schedule has to be mapped, and the mapping is the technique.

## The scale is discovered, not declared

Run the first window and read the spatial size of what came back. The per-axis
scale is the output size over the input window size, one number per spatial
axis, and it is measured from the first real prediction rather than taken from
a parameter, because a declared output size is a claim about the model and the
prediction is the model. A model whose head was changed, a wrapper that crops,
an export that rounds — each makes the declaration wrong and the measurement
right. The check that the arithmetic below is satisfiable runs against the
measured scale ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The scale may differ per axis. A model that halves depth and preserves the
in-plane axes is common in volumetric work, and a scalar scale is wrong for it.

## What is rescaled, and what is not

Three things are expressed in output coordinates, and the prediction is not one
of them.

The **weight map** is built at the input window's size, because the taper is a
statement about where the model had context, and that is an input-space fact.
It is then resampled to the output window's size with nearest-neighbour
sampling — nearest because the map is a smooth profile and interpolation would
introduce nothing but an extra pass; exact-nearest rather than a rounding
variant, because the two disagree at the last position on an axis when the
scale is not a whole number, and disagreement there is a one-voxel misalignment
of every window's weight.

The **slice coordinates** of every window are multiplied by the per-axis scale:
the window that starts at input position forty and spans ninety-six, under a
scale of two, is placed at output position eighty and spans one hundred and
ninety-two.

The **padding crop** at the end is computed the same way. The input was padded
to reach the window size on any short axis; the padding amounts are known in
input coordinates; the crop that removes them from the canvas is the padding
amounts times the scale, applied to the canvas in output coordinates.

The prediction itself is never resized. The alternative — resizing every
prediction back to the input window's size and stitching as if the model
preserved resolution — is a lossy operation performed hundreds of times to
avoid a multiplication, and it discards the resolution the model was built to
deliver.

## The integrality contract

The mapping only lands on whole positions when it produces whole numbers. The
scan interval in input coordinates is window size times one minus overlap; in
output coordinates it is that times the scale; and the window's output extent
is the window size times the scale. Both must be integers on every axis, or
some window is placed at a fractional position and the implementation rounds
it, and a rounded placement is a one-voxel seam that no amount of blending
removes.

The contract, stated for the caller: **overlap times window size times scale
is an integer on every axis**, and the window size times scale is an integer
on every axis. These are derived limits and the derivation is written beside
them ([limits-are-derived](../../../../_laws.md#limits-are-derived)): the
caller who picks an overlap of a quarter, a window of ninety-six and a scale of
one half has an output step of thirty-six and is fine; the same caller with a
window of one hundred has an output step of thirty-seven and a half and is not.

The standard checks this at the entry, after the scale is measured, and refuses
with a message that names the axis and the three numbers whose product is not
whole. Documenting the obligation and rounding silently is the reading to
refuse: the failure it produces is a misalignment that a reader will attribute
to the model.

## Several heads at several resolutions

A model that returns a tuple or a mapping of predictions, each at its own
resolution, is handled by flattening the structure into an ordered list on the
first window, carrying one scale, one weight canvas and one accumulator per
entry, and repacking the list into the original structure after the divisions.
The order must be stable across windows, which for a mapping means sorting its
keys once rather than trusting insertion order; a head that appears in a
different position on window two is added into the wrong canvas without an
error.

## When not to use this

When every head returns the input window's size the scale is one on every axis,
the checks pass trivially and the technique costs a measurement on the first
window. It is still worth running the measurement, because the day the model
changes is the day the declaration would have lied.
