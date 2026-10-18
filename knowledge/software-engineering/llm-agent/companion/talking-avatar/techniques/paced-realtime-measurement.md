---
layer: technique
type: technique
subject: talking-avatar
technique: paced-realtime-measurement
status: forged
laws: [limits-are-derived, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether an avatar route is realtime, a talking-head model is fast on a benchmark and falls behind the voice, reporting what an avatar costs to run]
---

# Paced realtime measurement

## The concern

"Realtime" for a talking avatar means one thing: **the picture keeps up with the
voice for as long as the voice keeps talking.** Throughput — frames per second
over a clip rendered as fast as possible — does not measure that. A model can
average thirty frames a second and still fall a second further behind the audio
every few seconds, because it is bursty, because its first call is slow, or
because something contends with it. The measurement that answers the question
is paced: feed the audio at wall-clock speed, as a synthesizer would deliver it,
and watch the lag between the audio clock and the frame clock over a long line.

## The procedure

1. **Pace the input.** Release audio to the route at real time, in the chunk size
   the voice pipeline uses. Use the longest bench line; lag growth hides in short
   ones.
2. **Measure lag against the audio clock** at every emitted frame and report its
   median, its 95th percentile, and whether it is **flat or growing**. A flat lag
   of one second is a latency; a growing lag is a failure, whatever the frame rate.
3. **Report frame rate at the 5th percentile next to the median**, and the first
   frame's time from the first audio. A model that emits frames in chunks reports
   per-chunk throughput and puts a fixed-rate player with a queue between
   generator and display, which turns bursts into a steady clock at the cost of
   one chunk of latency.
4. **Report memory per process, at its peak, from the process's own allocator**,
   not device-wide deltas polluted by whatever else loaded at the same moment.
   An absent measurement is omitted, never written as zero
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
5. **Separate cold from warm.** Compiled graphs and loaded weights make the first
   process slow and later ones fast; report both, because a live product must
   keep the process warm and pay that memory permanently.
6. **Serialise the accelerator during measurement.** One job at a time, under a
   lock every measuring command takes; a figure taken while another track shared
   the device is labelled contended and kept apart from clean figures.

## When a route is "not realtime"

Profile per stage before concluding anything about hardware. The bottleneck is
often a small stage launch-bound in eager execution — a few denoising steps of a
small motion model — not the renderer that looks expensive. Compilation fixes
that kind of stage; warm it with a full throw-away pass **through the same worker
threads** that will run it, because a warm-up on the main thread can leave the
first live frame slow, and a cold first call from several worker threads can
deadlock. Leave convolution autotuning off unless it buys measured frames; it can
multiply peak memory for nothing.

## Budgets for the drawing side

A rig's per-frame budget is derived from the host's frame budget, not chosen
([limits-are-derived](../../../../_laws.md#limits-are-derived)): with a frame time
budget and the host's other work known, the rig gets a number of draws, a mesh
size and zero allocations per frame. Measure it at the target output size, on the
class of hardware the product targets — a desktop accelerator's number says
nothing about an integrated one, and an unmeasured class is reported as
unmeasured, not inferred.

## Reporting the honest cost

A route's cost is the sum of what it needs to run, wherever it runs:

| Route | Playback | Motion generation |
| --- | --- | --- |
| rig, procedural | a few draws per frame | none |
| hybrid | the same as the rig | the motion model's accelerator, memory, load time and window latency, per utterance |
| neural | the model resident, warm, on an accelerator | inside playback |

Writing only the left column for a hybrid is the most common way a report
overstates what it proved ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## When not to use this

For pre-rendered clips, pacing is irrelevant; measure offline seconds per output
second and the quality, and stop there.
