---
layer: technique
type: technique
subject: reversible-transform-pipelines
technique: deliberate-lossy-inverse
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [inverting a categorical output through a smooth resample, an inverse cannot be numerically exact and the caller must know, choosing interpolation for the reverse pass]
---

# Deliberate lossy inverse

Exact inversion of a geometric operation is usually not available. A
resample averages neighbours and discards the values it averaged; a crop
discards the region outside it; a rotation by a non-right angle lands
samples between grid points in both directions. The inverse of such an
operation is an approximation by construction, and the design question is
not how to make it exact but which approximation to make, on purpose, and
how to say so. An inverse that substitutes a parameter on the reverse pass
and declares the substitution is a tool; one that substitutes silently is a
defect with the same output.

## The canonical substitution: interpolation for categorical outputs

The forward pass resampled an intensity image with a smooth interpolation —
linear, cubic — because intensities are continuous and smoothing is the
right estimate between samples. The output being carried back is a label
map: an integer class per position. Resampling that with the recorded
smooth mode averages class identifiers, and the average of class two and
class four is class three, which may be a different organ or no organ at
all. The record says "linear"; the inverse must not use it.

The inverse therefore accepts an option that rewrites the recorded
interpolation to nearest-neighbour for this reverse pass, and the option
is named at the call site rather than defaulted. Nearest-neighbour is
itself lossy — a thin structure can vanish or thicken by a sample — but it
is the loss that preserves the output's meaning, and it is the caller's
choice to make because only the caller knows whether the output is a label
map or a probability map. A probability map inverts with the smooth mode
and the option is left off.

Rule: when the output's value type differs from the input's, the inverse's
interpolation is chosen for the output's type, overriding the record, and
the override is an explicit argument.

## Other substitutions worth naming

A crop is inverted by padding. The padded region is filled with a declared
constant — zero, background label — and the inverse states that the region
is filled, not recovered. A consumer who reads the padded region as data has
been told it is not.

A resample is inverted to the recorded original shape and spacing, which
exist in the record, but the values are re-estimated and the round trip
does not reproduce the input. An inverse pass can report the expected error
magnitude for the interpolation it used, and a consumer computing a metric
in the original frame should know the inverse contributed some of that
metric's error.

A random deformation whose forward field was recorded can be inverted by
inverting the field numerically, which converges to a tolerance and not to
zero. The tolerance is a parameter of the inverse, exposed, and the inverse
reports whether it was reached.

A rotation by an angle recorded to finite precision inverts to a rotation
by the negated angle, and the two compose to a near-identity whose residual
is bounded by the precision. That bound is small and it is not zero; a
pipeline that asserts exact equality after a round trip will fail
intermittently and be blamed on the wrong thing.

## Declaring the loss

Every inverse that is not exact carries its approximation as a stated
property, at three levels. At the call site, the substitution is an
argument with a name that says what it does — the interpolation override,
the fill value, the tolerance — so a reader of the calling code sees the
decision. In the record, the inverse can annotate what it substituted, so a
journal dumped after the fact shows that the reverse resample used a
different mode than the forward. In the result, the datum arrives with its
geometry fields restored — shape, spacing, orientation — and a consumer
comparing it to the original can see that geometry matches and values
approximately match, which is the honest claim.

A number produced downstream of an approximate inverse carries the
approximation with it, or it will be quoted as if the inverse were exact
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
A volume computed from a label map that was carried back with
nearest-neighbour resampling is a volume *under that resampling*, and the
report that quotes it says so.

## Decision rules

When the output is categorical, substitute nearest-neighbour and name it.
When the output is continuous, use the recorded mode and do not substitute.
When the output is a mixture — a one-hot probability stack that will be
thresholded later — invert the probabilities smoothly and threshold in the
original frame, because thresholding before the inverse and then resampling
nearest is a second approximation stacked on the first.

When an inverse cannot reach the recorded original shape exactly — an odd
resampling ratio that rounds — restore to the recorded shape by a final
crop or pad of at most one sample, and record that the inverse did so.
Returning a shape that differs from the original by one sample is not an
approximation; it is a datum that will fail to align with the original on
the next line.

## When not to use it

An operation with an exact inverse — a flip, a transpose, a reorientation
that permutes axes, an integer-factor crop and pad — substitutes nothing,
and offering a substitution option on it invites a caller to use it. The
lossy path is for operations whose inverse must estimate; for the rest, the
inverse is exact and the option does not exist.
