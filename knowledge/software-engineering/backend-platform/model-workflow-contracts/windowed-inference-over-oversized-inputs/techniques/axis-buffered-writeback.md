---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: axis-buffered-writeback
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [stitching on the host is dominated by per-window transfers from the accelerator, deciding whether a device-to-host copy may be non-blocking, deciding whether the output canvas may be allocated uninitialised]
---

# Axis-buffered write-back

With the canvases on the host and the windows on the accelerator, the naive
loop transfers every prediction across the device boundary and accumulates it
into host memory one window at a time. Each transfer is small, each accumulate
touches a large slow allocation, and the accelerator idles while the host
catches up. The stitch becomes the bottleneck of the run, and the fix is to do
the accumulation where it is fast and cross the boundary less often.

## The band

Choose one spatial axis — the buffer axis — and a number of window positions
along it — the buffer steps. A **band** is the set of windows whose position
along the buffer axis falls in one run of that many steps, at every position on
the other axes. Allocate an accumulator on the accelerator that is the size of
the band's footprint in the output — full extent on the other axes, the band's
extent on the buffer axis — and run the band's windows into it exactly as the
full numerator canvas would be run: prediction times weight, added at the
window's offset within the band. When the band is complete, transfer the band
accumulator to the host and add it into the full numerator canvas at the band's
position. Then allocate or reuse the band accumulator for the next band.

Only the numerator is banded. The normaliser canvas is a function of the
schedule alone ([overlap-weighted-stitching](./overlap-weighted-stitching.md))
and is built once on the canvas device before the first band runs; it never
crosses the device boundary per band, which halves the transfer the buffer
exists to reduce.

The accelerator now holds the model, a batch, and one band-sized accumulator.
The host receives one transfer per band instead of one per window, and each
transfer is a large contiguous copy. The buffer axis should be the longest
spatial axis, because that gives the fewest bands and the widest transfers; the
buffer step count is a memory knob, and halving it is the middle of the ladder
in [failure-driven-memory-degradation](./failure-driven-memory-degradation.md).

## Bands overlap unless proven otherwise

Consecutive bands share output positions along the buffer axis whenever the
windows overlap, because the last window of one band and the first window of
the next overlap in the output by the overlap fraction. Where they share, both
bands contribute to the same host positions and the host add must be a real
accumulate — read, add, write — on the shared strip. That is correct and it
forbids two optimisations that are otherwise attractive.

The first is a **non-blocking transfer**. A copy that returns before it
completes lets the accelerator start the next band while the host is still
receiving the last one. If the bands overlap, the next band's accumulation
and the previous band's copy touch the same host strip, and the order in which
they land is undefined. The rule is that the non-blocking copy is enabled only
after the implementation has **proved the bands do not overlap** — computed
from the actual window schedule along the buffer axis, by checking that each
band's output extent ends before the next begins — and disabled otherwise. The
proof is computed, never assumed from the overlap parameter: a pulled-back last
window can make the final band overlap its predecessor even when every interior
pair is disjoint.

The second is an **uninitialised canvas**. When the bands do not overlap, every
output position is written by exactly one band, and the host canvas can be
assigned band by band rather than accumulated into, which means it need not be
zeroed first. Zeroing a canvas the size of the output is a full pass over slow
memory and skipping it is worth having. It is licensed by the same proof and
only by it. An uninitialised position that no band writes holds whatever the
allocator left there, and it is returned to the caller as a prediction —
unknown rendered as a definite value, in the exact shape the law forbids
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
rule is that the canvas is allocated uninitialised only under the non-overlap
proof, and allocated zeroed the moment the proof fails.

When the bands do overlap, the shared strip is accumulated on the host, the
copy is blocking, and the canvas is zeroed. The buffer still pays for itself
— most of each band lands as one wide copy — and only the strip between bands
takes the slow path.

A non-blocking copy has one more obligation, easy to forget because nothing
fails when it is missed: the copies must be **synchronised before the division**
reads the canvas. The last band's copy may still be in flight when the loop
ends, and a division that reads the canvas before it lands divides stale or
uninitialised memory by a correct normaliser and returns it. The rule is one
explicit synchronisation on the transfer stream, between the last band and the
division, executed whenever the non-blocking path was taken.

## Ordering the windows so the band is a band

The buffer requires that windows arrive grouped by band, which means the window
schedule iterates the buffer axis outermost and the other axes inside it. A
schedule that iterates in the input's natural axis order with the buffer axis
innermost produces bands of one window and a buffer that flushes constantly.
The rule is that the schedule is generated with the buffer axis outermost when
buffering is on — simplest as a stable sort of the existing slice list by start
position along the buffer axis, stable so that the order within a band is the
schedule's own — and the band boundary is detected by watching the position
along that axis change. Each band's output extent, start of its first window to
end of its last, is recorded as the band is formed; that record is what the
non-overlap proof above reads.

Batching — running several windows through the model in one forward pass —
composes with banding as long as a batch never straddles a band boundary; the
simplest guarantee is to size batches so the band is a whole number of them.

## When not to use this

When the canvases fit on the accelerator, there is no boundary to cross and the
buffer is pure overhead; the full canvases *are* the buffer. When the input has
only one spatial axis long enough to band along and the windows do not overlap
along it, the bands are the windows and the buffer degenerates to a per-window
transfer with extra bookkeeping. And never enable the non-blocking copy or the
uninitialised canvas by parameter: both are consequences of a proof about the
schedule, and a parameter that asserts them is a parameter that will be set
wrong.
