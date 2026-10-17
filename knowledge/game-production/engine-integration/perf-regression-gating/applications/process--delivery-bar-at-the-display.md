---
layer: application
type: application
subject: perf-regression-gating
technique: delivery-bar-at-the-display
stack: process
status: forged
verified_on: 2026-10-16
---

# A 900-second sound-on stick soak graded at the screen: the percentile passed, the maximum missed by 4.6 ms

Source tree: `firetv-deathride` on branch `deathride/main` at `e6ef6752`, read 2026-10-16; paths are
relative to its root. The stack is `process`: what is realized is how one device session, P22 of 2026-10-16,
graded a game's first performance goal on one Fire TV stick (model AFTKM, Android 11) with a line written in
what the player sees, read from the platform compositor beside the game's own frame log. The run is one
900 s soak of the `deathride/main` build `a443f12f`, sound on, **profiled** (`--profile`), on a host shared
with other sessions that never settled. Summaries are committed under `deathride/evidence/perf/p22/`
(`c6e08fb4`); every figure below is a stick figure.

## The bar was rewritten in the display's unit

The earlier budget graded the render thread's interval percentile against a 16.7 ms line, and every soak
failed it at 20 to 25 ms while the picture was smooth. The owner replaced the percentile line with one read at
the screen; the session's table states both the line and its reading:
`docs/concepts/deathride/P22-soak.md:20 "16.667 ms in 629 of 629 windows"`.
The old figure stays in the report as comparison, not grade:
`docs/concepts/deathride/P22-soak.md:28 "The render-interval worst-window p95 was 20.824 ms."`
That gap is the technique's first decision rule in one run: the render thread ran long often enough to fail a
render-clock percentile, and the presentation queue absorbed it.

## Presentation read from the compositor

The game cannot see when a frame reached the screen, so a poller reads the compositor's own per-layer present
ring on the device:
`deathride/tools/perf-p17-present.py:1 "each frame's actual present time on the Stick's display, from SurfaceFlinger's per-layer latency ring"`.
The join classifies every slow render by what the display did with it, at a threshold written into the reader:
`deathride/tools/perf-p17.py:33 "under 1.5 periods (presented on the next refresh), and class (b), a missed refresh, at 1.5 periods or more"`.
The result is the technique's third step as a count:
`docs/concepts/deathride/P22-soak.md:34 "1,018 presented on the next refresh anyway (class a)"` — of 1,046 renders over
20 ms in 49,381 active frames. Of the slow renders, back-pressure on the presentation queue is a named cause in
its own right, `docs/concepts/deathride/P22-soak.md:58 "is the cause of 276 of the 1,046 frames"`, and of none of the misses.

## The maximum line, on its own clock, attributed

The maximum line stayed on the render interval, and the report says which clock and gives the other:
`docs/concepts/deathride/P22-soak.md:21 "**37.599 ms** (render interval)"` against a 33 ms limit.
`docs/concepts/deathride/P22-soak.md:31 "Five active frames were over 33 ms (37.321, 37.599, 36.463, 34.589, 35.897 ms)."`
Each was a missed refresh and each was attributed:
`docs/concepts/deathride/P22-soak.md:32 "all five were attributed to a preempted render thread"`, and read at the display the
same five frames are two-refresh intervals, `docs/concepts/deathride/P22-soak.md:83 "In present terms the same five frames are"`
33.33 ms, still over the limit. Who preempts was settled in earlier sessions on the same device: the platform's
audio mixer and its hardware writer,
`docs/concepts/deathride/P11-frame-tail.md:39 "took 71% and 83% of its preempted time in frames over 33 ms."`,
and the cost does not scale with what the game plays:
`docs/concepts/deathride/P12-audio-lever.md:33 "the platform's cost is on or off, not per voice or per update."`
A muted arm cut active frames over 33 ms from 128 / 120 to 3 / 1 per 360 s run (P12), and the owner had ruled
that the sound stays. That is the technique's decision rule for a miss owned by a platform service kept on by
design.

## The ruling, and how the figure is carried

The operator's delegate ruled on 2026-10-16 that the goal counts as met with the maximum as a known limit: 37.6 ms,
five frames, all preempted, against the 33 ms line. That ruling was given in the run brief that forged this
application and is not recorded in the source tree at `e6ef6752`; the session's own question is
`docs/concepts/deathride/P22-soak.md:110 "misses only the"` 33 ms max. The maximum line is **not met**, and is
carried here as measured: a known limit accepted by the owner, never a met 33 ms maximum.

## The poller's price and proof

`docs/concepts/deathride/P22-soak.md:70 "It costs 3.37% of one core on the device"`, and the run that graded the line ran
with it; a poller-free reading of the maximum, median and memory lines was left as a question rather than
assumed. The poller's alignment with the display is stated:
`docs/concepts/deathride/P22-soak.md:85 "Present times are SurfaceFlinger's own grid (residual 0 ns)."`, and its coverage is
the frame count: 49,346 of 49,381 active frames presented one refresh after the previous one and 35 two refreshes
after, which accounts for every active frame the game logged.

## Deviations

- **One run, unsettled.** Two 900 s settle waits failed and the host was at 71–81% CPU when the soak started. The
  five missed refreshes were all preemptions, so a quieter host may read lower; not shown.
- **The poller runs in the graded run.** The 3.37% of a core is on the device the bar measures, so every line is a
  slightly pessimistic reading of a run without it.
- **Coarse grid.** The present line catches missed refreshes, not jitter inside one refresh; the session says so.
- **No known positive for the classifier.** No run injected a missed refresh to show class (b) firing; its five
  detections in this run are the only evidence that it can.

## Outside corroboration

Android's frame-pacing guidance states the display behaviour this line reads: when no new frame is ready, "the
hardware displays the previous frame again", and "Short frames followed by long frames are perceived by the player
as stuttering"; it describes the presentation queue, typically two frames deep, whose back-pressure blocks the render
thread (https://developer.android.com/games/sdk/frame-pacing). Perfetto's frame timeline attributes each janky frame
to the application or the compositor from the platform side (https://perfetto.dev/docs/data-sources/frametimeline).

**Headsets.** Meta documents that its headsets refresh "at a fixed rate (72, 90, or 120 Hz", that a frame not ready
in time "is called a missed frame or stale frame", and that the compositor "re-displays the previous frame"
(https://developers.meta.com/horizon/documentation/unity/os-missed-frames/) — a delivery line the platform counts
itself. No Death Ride VR or XR build exists, and nothing here was measured on a headset.
