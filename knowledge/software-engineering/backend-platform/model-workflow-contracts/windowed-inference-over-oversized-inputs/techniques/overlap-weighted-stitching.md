---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: overlap-weighted-stitching
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [blending overlapping window predictions into one canvas, a stitched result is right in the interior and wrong at the far edge of each axis, deciding whether constant and tapered blending need separate code]
---

# Overlap-weighted stitching

Two windows overlap, and the position inside the overlap has two predictions.
The implementation has to say what the result at that position is, and the
answer that generalises to every overlap geometry is a normalised weighted
average: the sum of prediction times weight over every window covering the
position, divided by the sum of those weights. This technique is the procedure
that computes it exactly, once, without ever knowing how many windows cover
any position.

## The schedule that makes the geometry irregular

Windows are placed along each axis at a scan interval derived from the window
size and the overlap fraction: interval equals window size times one minus
overlap, truncated to a whole number and floored at one so a large overlap
cannot stall the scan. The last window on each axis is not allowed to run past
the input; its start is pulled back so it ends flush with the far edge. That
pull-back is what makes the coverage irregular. In the interior every position
is covered by the same number of windows; near the far edge the pulled-back
window overlaps its predecessor by more than the nominal fraction, and a
position in a corner is inside the pulled-back window of every axis at once.
The scan interval is a derived quantity and the code that derives it is the one
place the overlap fraction is read
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation));
no other part of the implementation may assume anything about how many windows
cover a position.

When the input is smaller than the window on any axis, pad it up to the window
size first and remember the padding, so the schedule always has at least one
window per axis and the pad is cropped from the result afterwards.

## Two canvases and one division

Allocate two accumulators the size of the output. The first collects prediction
times weight; the second collects weight alone. For every window, slice the
input, run the model, multiply the prediction by the weight map, and add the
product into the first canvas at the window's position. When the last window
has been added, divide the first canvas by the second, elementwise, once.

The second canvas is filled differently, and the difference is worth having.
Its content depends on nothing the model produces: it is the weight map added at
every position in the schedule, and the schedule is known before the first
window runs. So the normaliser is built in **one pass over the slice list**,
before any prediction is accumulated, rather than incrementally beside the
numerator. That makes it a pure function of three inputs — the schedule, the
weight map, the output size — which can be inspected before the model runs (its
minimum is the coverage guarantee, and a zero there is a fault to raise now, not
a not-a-number to discover later), and which never has to travel across a device
boundary per window when the numerator does.

The division is the only place normalisation happens. It is exact for every
coverage count because the second canvas *is* the coverage count, weighted: at a
position covered by three windows with tapered weights, it holds the sum of the
three tapers at that position, and the quotient is the weighted mean of the
three predictions. The corner covered by eight pulled-back windows and the face
covered by two need no special case.

The weight canvas has one channel; the prediction canvas has as many as the
model emits. Build the weight canvas once, on the first window, at the output's
spatial size, and broadcast it across channels at the add — a per-channel weight
canvas is the same number repeated and a memory cost equal to the output.

## Why not incrementally

The alternative that looks cheaper is to keep one canvas and update it as
windows arrive: paste the first prediction, then average subsequent overlapping
predictions into what is already there. It saves the second canvas and produces
a result whose weighting depends on arrival order — the position that was
pasted first and averaged twice carries the first prediction at a quarter of the
weight it would receive under the correct rule, and the last window on each axis
dominates. It is also numerically worse, because a running mean re-reads and
re-writes the canvas per window, and the canvas is the large, slow allocation.
The two-canvas rule reads the canvas once at the end.

The other alternative divides by a constant — the nominal number of covering
windows in the interior — and is correct everywhere the coverage is nominal,
which is everywhere except the boundary band. It survives small-input testing
because a small input is mostly boundary and the seam is dismissed as edge
noise; on a real input the boundary band is a visible frame around every axis.

## Constant blending is unit weight

Constant blending averages every covering prediction with equal weight, and the
temptation is to implement it as its own path that counts windows instead of
summing weights. The rule is that constant blending is the weight map filled
with one. The procedure is identical, the second canvas counts coverage, the
division is the same division. Two code paths would drift — the pulled-back
window handled in one and forgotten in the other — and the only thing the
constant mode saves is the multiply by one.

Tapered blending replaces the constant map with a bell-shaped one, high at the
window centre and low at the border, so a position near a window's edge is
decided by the neighbour that saw it near its centre. That map has its own
hazard, owned by [strictly-positive-blend-weights](./strictly-positive-blend-weights.md).

## Decision rules

When the model is fully convolutional and its border predictions are
demonstrably as good as its interior ones — rare, and provable only by
measuring on held-out data — use constant blending and a small overlap;
tapering buys nothing and costs windows. When seams are visible under constant
blending, raise the overlap before switching to a taper, because the taper's
border weight is already near zero and cannot remove a seam produced by
insufficient coverage. When the overlap is at half and the seam persists, the
taper is the fix. When the canvases would not fit beside the model, do not
shrink the overlap to compensate; move the canvases, which is
[split-device-inference-and-stitching](./split-device-inference-and-stitching.md).

## When not to use this

When windows do not overlap at all — a tiled classification where each window
yields one label for its own slot — there is nothing to blend; paste. When the
output of each window is not spatial at all, a scalar or a vector per window,
the canvas is a list and the reduction is a metric, which is downstream of this
subject.
