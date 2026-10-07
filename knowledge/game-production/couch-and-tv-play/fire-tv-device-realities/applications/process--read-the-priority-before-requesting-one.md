---
layer: application
type: application
subject: fire-tv-device-realities
technique: read-the-priority-before-requesting-one
stack: process
status: forged
verified_on: 2026-10-07
---

# A display priority that lowered the main thread, and a link pool set to background

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The stack is `process`: what is realized is a measurement procedure and one
scheduling decision, across the P8 frame-pacing wave (written up 2026-10-03) and finding L10 of the
2026-10-06 optimize wave. The device is one Fire TV stick, model AFTKM, on Fire OS; every device fact
below is about that unit.

## What the device had already done

P8 tested explicit thread priorities as one of its pacing arms, and read the device before believing the
arm: `docs/concepts/deathride/P8-vsync-slot.md:49 "foreground main thread already at nice"` −10, while
`docs/concepts/deathride/P8-vsync-slot.md:50 "requested Android DISPLAY is -4"`. The conclusion was
written down at once:
`docs/concepts/deathride/P8-vsync-slot.md:51 "arm is a lower-priority control on this device, not an assumed priority boost"`,
and so was the procedure the technique asks for,
`docs/concepts/deathride/P8-vsync-slot.md:52 "Retain actual thread priorities in each later receipt"`.
The final selection re-read its arms in that light — the explicit display-priority control ran
`docs/concepts/deathride/P8-vsync-slot.md:77 "active p95/max 20.848/38.248 ms"` with
`docs/concepts/deathride/P8-vsync-slot.md:81 "versus the system's -10 default"` — and adopted no priority
override. A wave that had not read the nice values would have concluded that raising priority does not
help, from an experiment that lowered it.

## Lowering the competitors instead

L10 took the other route: the link server's workers run below the render thread rather than the render
thread above them,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:114 "Link work runs below the render thread's priority"`,
from a pool whose factory sets
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:117 "priority=Thread.NORM_PRIORITY-2"`.
The test proves the pool did the work and every worker in it is below normal,
`deathride/link/src/test/kotlin/dev/deathride/link/LinkThreadPriorityTest.kt:25 "link work must run on the link pool"`.
On the desktop the change cost nothing measurable (acknowledgements 2,998 of 3,000, 6.5 KB/s display
stream, unchanged; commit `5e380025`), and the commit is explicit that this says nothing about the stick:
the effect on its frame percentile is unmeasured, because Windows maps priorities differently.

## Deviations

- **The level was chosen by name, not by its nice value.** Java priority 3 (`NORM_PRIORITY-2`) maps on
  Android's runtime to nice 13 — `ANDROID_PRIORITY_BACKGROUND + 3` in ART's priority table
  (https://android.googlesource.com/platform/system/libartpalette/+/refs/heads/main/palette_android.cc) —
  which is inside the band meant for background work, not a step below normal. The workers parse every
  input packet; at nice 13 they yield to every ordinary thread, and the input latency that follows on the
  stick is unmeasured. The comment's "a positive nice value" is true and understates it.
- **No device receipt for L10.** The technique asks every performance run to record the priorities
  threads actually had; no stick run after `5e380025` exists to carry one.

## Outside corroboration

AOSP's `Process.java` defines `THREAD_PRIORITY_DISPLAY` as −4, notes that applications cannot normally
change to it, and boosts the top application's main thread and render thread to −10
(`THREAD_PRIORITY_TOP_APP_BOOST`;
https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/os/Process.java),
which is the mechanism behind what P8 read on the device.
