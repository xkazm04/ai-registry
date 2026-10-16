---
layer: application
type: application
subject: render-submission-economy
technique: spread-periodic-render-thread-bursts
stack: kotlin
status: forged
verified_on: 2026-10-16
verified_against: kotlin@2.0.21
---

# A telemetry burst split, its reader-only half moved, the reader's garbage cut, and one GPU job drawn in bands

Source tree: `firetv-deathride` on branch `deathride/main` at `e6ef6752`, read 2026-10-16; paths are
relative to its root. Kotlin 2.0.21 on libGDX 1.13.5 for the game and Ktor for the link server, one render
thread holding the GL context, all on ART. The work spans the 10-06 optimize wave and the device sessions P11,
P13c, P13e, P13f and P13g of 2026-10-07 and 10-08. Desktop figures are labelled desktop; device figures are from
one Fire TV stick (model AFTKM, Android 11, PowerVR GE9215) in profiled runs on a host shared with other
sessions.

## The periodic burst, split over three frames

The 10 Hz telemetry and interface refresh landed whole on one frame in six:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:3 "Every sixth frame carried a ~50 KB, ~2 ms burst"`,
the stick's telemetry p95 sitting on the frame-time p95. The render loop now stages it:
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:441 "The 10 Hz telemetry/UI refresh is split over three consecutive frames"`.
Desktop allocation per telemetry frame, `--profile` counters:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:3 "telemetry alloc mean 8,213 B/frame, worst 54,904 B"`
to `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:3 "mean 4,786 B, worst 21,104 B"`, with the
traffic and pickup text checked byte-identical over a 40 s soak before the check was removed.

## The reader-only half, moved to the reader

The middle stage is now empty on the render thread:
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:446 "was traffic/pickup JSON; now built by /stats readers"`.
The server states the contract the technique's fourth step asks for:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:117 "The /stats and metrics-log fields are built by the reader (an IO thread, 0.1 Hz or on request), never per frame on the render thread. Suppliers must tolerate a racing read."`
On the stick (P11, two profiled 360 s runs) the render-thread phase is gone as a cause:
`docs/concepts/deathride/P11-frame-tail.md:135 "The telemetry phase median is 0.007 ms,"`
`docs/concepts/deathride/P11-frame-tail.md:136 "and it leads in 0 of the 178 frames over 33 ms."`

## The reader's garbage was still the render thread's problem

Moving the build did not move the heap. P13f traced the stick's steady background collections to the probe's
own reads of that reply:
`docs/concepts/deathride/P13f-gc-churn.md:89 "1.378 MB per 77 KB reply, 18x its size."` Most of it was large objects,
which ART collects on its own schedule for every thread. Two in-place rebuilds, both serving the same bytes,
cut it: `bb49e716` built the text in place, then `db1ec55a` served it as pooled blocks sized under the runtime's
threshold,
`deathride/link/src/main/kotlin/dev/deathride/link/StatsReply.kt:75 "8 KiB: under ART's 12 KiB large-object threshold, so a block is an ordinary small object."`
Per read: `docs/concepts/deathride/P13f-gc-churn.md:31 "**1.378** | **0.426** (-69%)"`, then
`docs/concepts/deathride/P13g-stats-bytes-and-pair.md:29 "**0.275 / 0.272** (-37%)"` MB. Collections per 360 s run
fell from 115 to 47 after the first cut (one unsettled run) and read 36 / 37 in the settled pair after the second.
The probe is the only reader that loads it that hard, which makes this partly an instrument fix; the rule the
technique gained is general all the same: a reader on the same managed heap still pays its garbage into the
render thread's pauses.

## One-off request bursts, one output per frame

A car pick, race start or finish used to rebuild every seat's garage and career text and the interface inside the
request frame. P13c made the request mark what changed and let later frames build it:
`deathride/game/src/main/kotlin/dev/deathride/game/FramePublish.kt:7 "rebuilds the UI once and builds at"` most one dirty seat
per frame, by the same builders from the same state. Stick, two runs on one APK:
`docs/concepts/deathride/P13c-start-frames.md:29 "fell from 46.6-142.7 to 20.1-69.2 ms"` for the start request, and a car
pick from 18.9–118.6 to 10.4–32.7 ms.

## One GPU job that looked indivisible

The last transition stall was one draw: the scenery bake's full-target ground quad, which the driver deferred and
ran with later passes. P13e drew the same quad through scissored row bands, one per pass, each finished before
its frame ended:
`deathride/game/src/main/kotlin/dev/deathride/game/BakeShape.kt:24 "The shipped bake (P13e): the ground in 16 finished bands, none in the switch frame."`
`docs/concepts/deathride/P13e-bake-passes.md:38 "as 16 scissored, glFinished bands it is about 8-9 ms of GPU in each of 16 frames"`, and
`docs/concepts/deathride/P13e-bake-passes.md:30 "the k=11 interval fell from 93.4-110.7 ms to 16.3-29.6 ms"`. The arms that
failed are the decision rule's evidence: bands without a completion wait were batched by the driver,
`docs/concepts/deathride/P13e-bake-passes.md:94 "Unsynced (ground8, ground4) the driver batches the band passes and runs them together at"`
pass ten, and `docs/concepts/deathride/P13e-bake-passes.md:95 "glFlush does not make it run them"`. The split's cost is
stated: `docs/concepts/deathride/P13e-bake-passes.md:118 "The course shows about 0.3 s later."` With the save, publish and
bake work spread, the settled graded pair met the transition bar (no frame over 100 ms):
`docs/concepts/deathride/P13g-stats-bytes-and-pair.md:92 "run 1 max 83.9 ms"`, run 2 99.6 ms.

## Deviations

- **Skew is stated in the code, not tested.** The three-stage split lets stats fields describe moments up to two
  frames apart; no consumer test asserts that it tolerates the skew.
- **Thin device evidence per card.** The telemetry split was measured on the desktop host; P13c and P13e each rest on
  two stick runs on one APK, P13e's on a host that never settled.
- **Run 2's margin.** The 99.6 ms frame sat inside a background collection; the bar was met by 0.4 ms there.
- **The reader fix serves one heavy reader.** Players' phones do not read `/stats`; the saving is real on the device
  and mostly removes load that the measuring harness itself created.

## Outside corroboration

Unity's guidance states the spread rule as doing a fraction of the work every frame
(https://unity.com/how-to/advanced-programming-and-code-architecture), and Android's frame-pacing guidance warns that
"Short frames followed by long frames are perceived by the player as stuttering"
(https://developer.android.com/games/sdk/frame-pacing).

**Headsets.** Meta's asset-streaming guidance says "don't try to cram all the expensive work into a single frame"
(https://developers.meta.com/vr/documentation/unity/po-assetstreaming/), and its frame-timing page fixes the budget at
the refresh, 72, 90 or 120 Hz, with a missed frame re-displayed by the compositor
(https://developers.meta.com/horizon/documentation/unity/os-missed-frames/). Its compositor-layer guidance shows a
loading layer kept at full rate while the application misses frames
(https://developers.meta.com/horizon/documentation/unity/os-compositor-layers/), which is the wider phase-change escape
the technique names. No Death Ride VR or XR build exists, and nothing here was measured on a headset.
