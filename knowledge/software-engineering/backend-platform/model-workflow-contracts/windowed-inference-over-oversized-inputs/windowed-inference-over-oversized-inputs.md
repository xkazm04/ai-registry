---
layer: golden-path
type: golden-path
subject: windowed-inference-over-oversized-inputs
status: forged
use_when: [running a fixed-input-size model over a volume or image that does not fit accelerator memory, a stitched prediction shows a grid of seams or a band of not-a-number values, the same inference code must run on a laptop and on a large server, a model emits output at a different resolution than it consumes]
techniques:
  - overlap-weighted-stitching
  - strictly-positive-blend-weights
  - resolution-decoupled-window-mapping
  - split-device-inference-and-stitching
  - failure-driven-memory-degradation
  - axis-buffered-writeback
---

# Windowed inference over oversized inputs

A model trained on fixed-size crops — a few hundred voxels a side, chosen so a
batch fits the training accelerator — is asked at inference time for a
prediction over the whole thing the crops came from: a scan a thousand slices
deep, a mosaic tens of thousands of pixels wide, a recording hours long. The
whole input exceeds accelerator memory by one or two orders of magnitude, and
the model's first layer cannot be told a different size anyway. The only route
is to run the model over a grid of windows the size it was trained on and
reassemble the pieces into one result that has no visible evidence of having
been pieced together. This subject owns that reassembly: the window schedule,
the blending rule, the coordinate arithmetic, the placement of memory, and the
policy for what happens when the placement was wrong.

The naive version is ten lines and produces a grid. Tile the input with
non-overlapping windows, run each, paste each prediction into its slot. The
result is correct in the interior of every window and wrong along every
window edge, because the model's receptive field was truncated there — the
prediction at a border voxel was made without the context the model was trained
to have, and it shows as a seam, a discontinuity in the label field or a line in
the reconstructed intensity. Every design decision below exists to remove that
seam without paying for it twice over in memory.

## The result is a weighted average, computed once

Seams disappear when windows overlap and the overlapping predictions are
blended, with each window's contribution tapering toward its own border so that
a voxel is decided mostly by the window that saw it near its centre. That
sentence contains the whole numerical design, and the naive implementation of
it is wrong in a way that survives testing on small inputs.

The rule is that the stitched result is a **normalised weighted average**: for
every output position, the sum over covering windows of prediction times weight,
divided by the sum of the weights. The implementation carries two canvases the
size of the output — one accumulating prediction times weight as the windows
run, one holding the summed weight, built in a single pass from the schedule
before any window runs — and performs the division exactly once, after the last
window has been added. Nothing about overlap geometry enters the code: the last window on
each axis is pulled back to end flush with the input, so the overlap near the
far edge differs from the overlap in the interior, and positions near corners
are covered by more windows than positions along faces. The normaliser canvas
absorbs all of it. An implementation that assumes uniform coverage and divides
by a constant is right on the interior and wrong at every boundary; one that
averages incrementally as windows arrive is a running mean whose weighting
depends on arrival order. Constant blending — every position averaged with equal
weight — is not a separate algorithm but the special case where the weight is
one everywhere, and treating it as its own code path is how the two drift. This
is [overlap-weighted-stitching](./techniques/overlap-weighted-stitching.md).

The tapered weight has a hazard the constant weight does not. A bell-shaped
window falls toward zero at the border, and in a reduced-precision accumulator
it reaches zero. A position covered only by the tail of one window then has a
normaliser of zero, and the division produces a not-a-number that propagates
into whatever consumes the canvas. The rule is that **every weight is strictly
positive everywhere the window covers**, enforced by flooring the weight map
above zero before it is used, not by trusting the shape of the taper. This is
[strictly-positive-blend-weights](./techniques/strictly-positive-blend-weights.md).

## Input coordinates and output coordinates are two systems

A segmentation model returns a map the same size as its input, and for that
case the window's position in the input is the prediction's position in the
output. Not every model does. A super-resolution model returns a crop twice as
large; a coarse-labelling head returns one an eighth the size; a model with
several heads returns several crops at several sizes. The moment the output
size differs from the input size there are two coordinate systems, and the
window schedule — computed in input coordinates because that is what is sliced
from the input — has to be mapped into output coordinates to place each
prediction.

The naive fix is to resize every prediction back to the window's input size and
proceed as before. It destroys the resolution the model was built to provide,
and it is the wrong direction anyway. The rule is that the implementation
carries a **per-axis scale** — output size over input size, discovered from the
first prediction, not declared — and rescales the *weight map* and the *slice
coordinates* into output space, leaving the predictions untouched. That
arithmetic only lands on whole positions when overlap, window size and scale
combine to an integer step in output coordinates; the standard states that
obligation as a contract at the entry and refuses an input that violates it,
because a silently rounded step produces an off-by-one misalignment that reads
as a seam nobody can explain. Padding removal has the same two-system shape: the
input was padded to reach the window size, and the crop that removes the padding
is computed in output coordinates through the same scale. This is
[resolution-decoupled-window-mapping](./techniques/resolution-decoupled-window-mapping.md).

## Memory has two places to live, and the result decides neither

The windows must run where the model is fast. The canvases must live where
there is room for them, and for an oversized input those are frequently
different devices. A design that carries one device parameter conflates two
decisions and forces the canvas onto the accelerator, at which point the whole
subject collapses: the memory for the result is proportional to the input size,
and the input was oversized by premise.

The rule is **two independent parameters** — the device the windows execute on
and the device the canvases are allocated on — with the second defaulting to the
first for the common case where everything fits, and a stated threshold on
output size above which the canvases move to the large device automatically.
Split this way, the accelerator's memory bound is a function of the window size
and the batch of windows, never of the input, which is the property the subject
exists to deliver. The cost is a transfer per window across the device boundary,
and that cost is what the next two sections are about. This is
[split-device-inference-and-stitching](./techniques/split-device-inference-and-stitching.md).

Transferring every window individually to the large device and accumulating it
there is correct and slow; the accumulation on the large device is memory-bound
and the transfers are small and many. The rule is to **buffer along one axis**:
run the windows of one band — a run of consecutive positions along the longest
spatial axis — into a device-local canvas that is only band-sized, and write the
band back to the large canvas once. Two refinements make it fast, and both have a
proof obligation. The band write-back may be non-blocking only when consecutive
bands do not overlap in the large canvas — otherwise a later band's accumulation
can race an earlier band's copy — and the large canvas may be allocated
uninitialised only when every position is written exactly once, because an
uninitialised position that is never written renders as a confident value. Both
proofs are computed from the schedule, not assumed from the parameters. This is
[axis-buffered-writeback](./techniques/axis-buffered-writeback.md).

## The memory policy learns from failure

Every threshold above — the output size at which canvases move off the
accelerator, the band size — is a guess about a machine. The same code runs on
a workstation with a small accelerator and a server with a large one, and on the
same server it runs beside other processes whose memory use it cannot see. A
policy that picks one configuration and fails when it does not fit has made the
operator into the memory manager.

The rule is a **fixed ladder of equivalent strategies, descended on failure**:
try stitching on the fast device; on out-of-memory, retry with the band buffer;
on out-of-memory again, halve the band and retry, until the band is a single
window; then retry with the canvases on the slow device, which fits by
construction or the input was never going to be processed on this machine. Every
rung produces the same result to within floating-point reassociation; only speed
changes. Two properties separate this from a retry loop. The number of trials is
bounded, and exhausting them raises the original failure rather than returning a
partial canvas. And the failure is **remembered**: the size at which the fast
rung failed is written back as the threshold, so the next input of that size
starts on the rung that worked instead of failing its way down again. Remembering
is a ratchet — it only tightens — and a threshold that tightened because of a
transient neighbour is a real cost, so the write-back is logged and resettable
rather than silent. This is
[failure-driven-memory-degradation](./techniques/failure-driven-memory-degradation.md).

## What this subject owns, and what the neighbours own

The seam with
[optional-dependency-degradation](../../resilience/optional-dependency-degradation/optional-dependency-degradation.md)
is the one a reader draws wrong first, because both subjects step down when
something is not available. That subject's ladder is driven by a **capability**:
a dependency is absent or its grant was withdrawn, the fact is stable for the
deployment, it is read at boot or at first use, and each rung is a *different
behaviour* with a named consequence — writes go to memory and are lost, a
surface refuses honestly. Its probe-the-grant rule attempts an operation to
learn a permission the configuration cannot reveal; its
degradation-coupled-to-hardening rule ties each fallback to the grant it
depends on. This subject's ladder is driven by a **resource event**: the device
is present, working and permitted, and one allocation on one input did not fit.
The fact is transient and input-sized, it is learned mid-run, and every rung
produces the *same result* at a different speed. The discriminator is whether
the output changes. If descending a rung changes what the caller receives, that
is capability degradation and it belongs next door; if descending a rung changes
only how long the caller waits and where the memory went, it is a memory policy
and it belongs here. The one place they touch is the remembered threshold: it is
a learned capability fact about the machine, and were it persisted across
processes it would need the neighbour's discipline about what invalidates it.

[pipeline-dag](../../work-execution/pipeline-dag/pipeline-dag.md) executes an
explicit, user-authored graph of heterogeneous steps, each with an identity, a
durable status and a place in a topology someone drew. A windowed run looks like
a graph of many small steps and is not one: its steps are homogeneous, generated
by arithmetic from three parameters, transient, unnamed and never persisted, and
their only observable product is the canvas. Nobody inspects the status of
window four hundred and twelve. The rule for picking is whether a step has an
identity that survives the run. When the steps are nodes a person authored and
will ask about, that is a pipeline, and a whole windowed inference is one node
of it; when the steps are index positions in a loop whose failure policy is
"retry the whole thing on a lower rung", that is this subject.

accumulate-then-aggregate-metrics is a sibling in the same wave and owns
everything that happens to the stitched canvas after it exists — per-sample
scores, missing-label handling, cross-rank reduction. This subject ends when the
division is performed and the padding is cropped; a metric over the canvas is
theirs, the canvas being correct at every position is ours.

## What this subject refuses

It refuses to make the model accept a different input size, which trades a
solved problem for an unsolved one and invalidates the training distribution.
It refuses to downsample the whole input to fit, which discards exactly the
detail a fixed-size model was trained to see. It refuses to resize predictions
to match input windows when the output resolution differs, because placing them
at native resolution is cheap and the resize is lossy. It refuses to average
incrementally, to divide by an assumed coverage count, to let a tapered weight
reach zero, and to carry a single device parameter. And it refuses a memory
policy that fails once and asks the operator to guess a better number — the
machine observed the failure, and the machine remembers it.

## The techniques

- [overlap-weighted-stitching](./techniques/overlap-weighted-stitching.md) — two
  canvases, one division, the schedule-derived normaliser, unit weight as constant blending.
- [strictly-positive-blend-weights](./techniques/strictly-positive-blend-weights.md)
  — the taper's floor, relative before absolute, and the compute-floor-cast order.
- [resolution-decoupled-window-mapping](./techniques/resolution-decoupled-window-mapping.md)
  — the measured per-axis scale, what is rescaled, the integrality contract, several heads.
- [split-device-inference-and-stitching](./techniques/split-device-inference-and-stitching.md)
  — two device parameters, the derived size threshold, the memory bound delivered.
- [failure-driven-memory-degradation](./techniques/failure-driven-memory-degradation.md)
  — the fixed ladder, bounded trials, one classification door, the logged ratchet.
- [axis-buffered-writeback](./techniques/axis-buffered-writeback.md) — the band along
  the longest axis, and the non-overlap proof that licenses non-blocking and uninitialised.
