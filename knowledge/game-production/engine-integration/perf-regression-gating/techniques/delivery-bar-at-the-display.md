---
layer: technique
type: technique
subject: perf-regression-gating
technique: delivery-bar-at-the-display
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a bar is written in what the player sees on a fixed-refresh display and the run measures the render thread, the render-thread percentile fails while players report a smooth picture, deciding which clock a frame bar is read on, a soak passes a percentile line and misses a maximum line]
---

# Delivery bar at the display

The concern: two different questions are asked of a frame, and each has its own clock. *Did the
build's cost rise?* is read on the busy time of each stage, uncapped, because a display-synchronised
interval hides every regression that still fits the refresh. *Did the player see a missed refresh?*
is read where the player reads it: on the interval between two frames the display actually showed.
A team that reads the delivery question on the render thread fails builds whose frames all reached
the screen on time, because the presentation queue absorbed a render that ran long; a team that reads
the cost question at the display passes builds that are quietly spending their headroom. This
technique is the second question's procedure. The first is the subject's other techniques.

## Procedure

**1. Write the bar in the display's unit.** On a fixed-refresh display the only intervals the player
can see are whole refresh periods: one refresh after the last frame, or two, or more. A delivery bar
is stated in those periods — "in every active window the high percentile of present intervals is one
refresh" — and its limit is the refresh period itself, not a round millisecond figure near it.

**2. Read presentation from the compositor, not from the game.** The time a frame reached the screen
is known to the system compositor, which latches each frame onto a refresh. The game's own clock
measures when it finished submitting, which is earlier by however deep the presentation queue is.
Poll the compositor's per-frame present times beside the game's frame log and join them by frame,
so that each frame carries both its render interval and its present interval.

**3. Classify every slow render by what the display did with it.** A render over the refresh period
whose frame still presented one refresh after the previous one was absorbed by the queue: the player
saw nothing. A render that made the display show the previous frame again is a missed refresh. Count
both classes, and attribute the missed ones — the thread was preempted, the queue was full and the
render thread waited on a buffer, it ran long, it slept on a collection — because only the missed
class is a delivery defect, and its causes have different owners.

**4. Keep every line on one clock, and say which.** A bar with several lines — a percentile, a
maximum, a median — is read on the clock each line names. If the percentile is read at the display
and the maximum on the render thread, the report says so line by line, and gives the other clock's
reading beside it where it exists: a frame that missed its refresh is also a present interval of two
periods, which is over any limit set between one and two
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

**5. Price the poller.** Reading the compositor costs the device something: a process polling it, a
share of a core, the compositor's own work answering. Measure that share once, state it beside every
graded figure, and say which lines were read with it running. A delivery line read with the poller is
a slightly pessimistic reading of a run without it, not the same reading.

**6. Prove the poller saw the run.** The number of frames the compositor reported against the number
the game rendered over the same span, and the residual between present times and the refresh grid.
A poller that silently returned a short or empty window passes every delivery line it was asked about
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).

**7. Report the render-side figures as context.** The render-interval percentile, the count of
renders over the period and the causes of the slow ones stay in the report, marked as comparison
rather than as the grade. They are where the next cost regression will first be seen.

## Decision rules

- **When the delivery line passes and the render percentile fails, the player saw a smooth picture
  with less headroom than it looks.** Grade the delivery line; carry the render figure to the cost
  gate, where it belongs.
- **When a maximum line fails by a few frames, attribute each frame before choosing a fix.** Missed
  refreshes caused by the platform preempting the render thread are not lowered by making the frame
  cheaper; they are lowered by changing what the platform runs, or not at all.
- **When a missed-refresh frame's cause is a platform service the owner keeps on by design, record the
  miss as a known limit, with its figure.** The bar is not met, and the report never states it as met.
  Whether the limit is accepted is the owner's decision, written down with the figure it accepts.
- **When the compositor cannot be read on the target, the delivery line is unverifiable.** Not a pass
  on the render interval, which answers the other question
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When the present grid is coarse, the line catches missed refreshes, not jitter.** Small timing
  variation inside one refresh is invisible to it by construction. If the product needs a jitter bar,
  that is a separate line on a finer clock.

## When not to use

Not for a cost-regression gate: a display-synchronised interval floors every frame under the refresh
at the refresh, and a gate on it sees nothing until the headroom is gone. Not on a variable-refresh
display, where present intervals are not whole periods and the line has to be written differently.
Not for an offline or uncapped benchmark run, which has no display to deliver to.

## On fixed-refresh standalone headsets

The technique holds there and the platform does most of step 2 for the team. A standalone headset's
display refreshes at a fixed rate; a frame not ready for a refresh is replaced by the previous one,
re-projected, and the platform counts it as a stale frame. That count is a delivery line read at the
display by the platform itself, and a frame rate read per window can look healthy while it climbs. The
platform's published guidance also states the arithmetic this technique depends on: the budget per
frame is the refresh period at the rate the application requested. The classification in step 3
transfers unchanged; the causes differ in weight, because a headset's compositor also runs timewarp on
the same processor. No headset was measured for this technique; the transfer is a statement about the
method, supported by that guidance.
