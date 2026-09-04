---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: split-device-inference-and-stitching
status: forged
laws: [limits-are-derived]
shared_with: []
use_when: [the stitched canvases do not fit on the accelerator beside the model, designing the device parameters of an inference entry point, an inference call fails on allocation of the output rather than on the model]
---

# Split-device inference and stitching

An inference entry point that takes one device and puts everything on it has
decided, without saying so, that the result fits where the model runs. For an
oversized input that is false by premise: the accumulators are the size of the
output, the output is the size of the input, and the input did not fit. The
model's memory is bounded by the window; the canvases' memory is bounded by
nothing the model controls.

## Two parameters, two decisions

The rule is that the entry point takes **the device the windows run on** and,
separately, **the device the canvases are allocated on**, and that the two are
independent. The window device is where the model is fast — the accelerator.
The canvas device is where there is room — the accelerator when the output
fits beside the model, the host otherwise, and in principle any device with an
allocator, since the canvases are touched only by adds and one division.

The second defaults to the first, because the common case is a moderately sized
input on a machine with room, and forcing every caller to think about the
canvas device would move the cost of the rare case onto everyone. The default is
supplemented by a **size threshold**: when the output's element count exceeds
it, the canvases go to the host regardless of the default. The threshold is a
memory budget divided by the element size and the number of canvases, and the
derivation is written next to it
([limits-are-derived](../../../../_laws.md#limits-are-derived)) — a raw
element count chosen by feel is raised by feel when a larger accelerator
arrives and lowered by nobody when a smaller one does.

## What the split buys

With the canvases off the accelerator, the accelerator's peak memory is the
model's parameters plus the activations for one batch of windows plus one
batch of predictions. None of those terms mentions the input. That is the
property the subject exists to deliver: the same model, the same code and the
same window size process a two-hundred-slice scan and a two-thousand-slice scan
with identical accelerator memory, and the difference is time and host memory.

The cost is one transfer per window from the accelerator to the canvas device,
and an accumulate on the canvas device that is slower than it would have been
on the accelerator. Neither is avoidable when the canvases genuinely do not
fit; both are reducible by batching the transfers, which is
[axis-buffered-writeback](./axis-buffered-writeback.md).

## Decision rules

When the output fits beside the model with margin, leave both devices the same;
the transfer is pure cost. When it does not, move the canvases and leave the
windows where they are; never move the windows to the host to keep everything
on one device, because that is the slow path for the wrong half of the work.
When the threshold is exceeded on some inputs and not others, let the threshold
decide per input rather than fixing the canvas device for the deployment; the
small inputs stay fast.

When an out-of-memory failure arrives, the split makes it classifiable: a
failure during the model's forward pass means the window batch is too large,
and a failure during allocation of the canvases means the canvas device is
wrong. The first is fixed by a smaller batch; the second by moving the
canvases. A single-device design cannot tell them apart, and the operator's fix
for the second — a smaller window — silently degrades the model's context to
solve a problem the model did not have.

The input tensor itself lives on whichever device it arrives on, and each window
is moved to the window device as it is sliced. Moving the whole input to the
accelerator to slice it there is the same mistake as putting the canvases there.

## When not to use this

When the model itself does not fit on the accelerator, no placement of the
canvases helps; that is model parallelism and a different problem. When the
input fits comfortably beside the model and the run is latency-bound, a single
device is correct and the second parameter should equal the first. The split
is for outputs that are large, not for every output.
