---
layer: application
type: application
subject: on-device-verification-harness
technique: attribute-every-stall-before-judging-it
stack: process
status: forged
verified_on: 2026-10-07
---

# Ten host stalls that were the probe's, and every slow frame named

Source tree: `firetv-deathride` on branch `deathride/main` at `4bbae5d2`, read 2026-10-07; paths are
relative to its root. The stack is `process`: what is realized is an attribution method spread over three
tools — a Node.js load probe on a Windows host, a heartbeat worker beside it, and request timers inside the
Kotlin game on one Fire TV stick (model AFTKM, Android 11) — and the way two device sessions of 2026-10-07,
P9 and P10, used it to decide which failures were the stick's. Both sessions ran **profiled** (`--profile`)
on a host shared with other sessions.

## The heartbeat that cleared the device

The probe drives two 30 Hz controllers from one event loop and records any frame it sends more than
100 ms late,
`deathride/tools/ability-stick-probe.mjs:56 "if(now-next>100){const stall="`. Beside it runs a worker thread
that does nothing but tick:
`deathride/tools/perf-host-heartbeat.mjs:1 "Independent isolate: distinguishes main-loop stalls from whole-host scheduling gaps."`,
reporting any gap over 150 ms at a 50 ms cadence,
`deathride/tools/perf-host-heartbeat.mjs:5 "if(gapMs>150)parentPort.postMessage"`. That is the technique's
first step as built: one witness that shares no loop with the pump.

It decided the reading of every failed input gate in both sessions. P9:
`docs/concepts/deathride/P9-stick-validation.md:165 "All 10 host pump stalls across the three runs (104.8-731.2 ms) start within 2 s"`
of the probe's own memory sample, and
`docs/concepts/deathride/P9-stick-validation.md:168 "isolate recorded 0 stalls, so these were main-loop pauses, not a host-wide gap."`
The verdict that followed is the one the technique asks for:
`docs/concepts/deathride/P9-stick-validation.md:170 "gates fail on every P9 run for this reason, not because of the Stick."`
P10 found it again with a different APK,
`docs/concepts/deathride/P10-race-start-hitch.md:213 "fix-run2 had 4 host pump stalls (154-835 ms), 1 in prep-run1 and 1 in prep-run2. All 6 start within"`,
`docs/concepts/deathride/P10-race-start-hitch.md:215 "isolate recorded 0 in every run. This is P9's finding again."`

## The probe was already asynchronous

The budget that the soak serves had asked for exactly the protection that failed:
`docs/concepts/deathride/I2-stick-budget.md:23 "Run memory sampling asynchronously so it does not block controller input."`
The probe does call the device through the promise form of the child-process interface,
`deathride/tools/ability-stick-probe.mjs:25 "run=promisify(execFile)"`, issuing both readings at once:
`deathride/tools/ability-stick-probe.mjs:40 "adb('shell','dumpsys','meminfo','--local',testPackage),adb('shell','dumpsys','thermalservice')"`.
The pump still paused next to every sample in two sessions. Which part of the call holds the loop — the
process start on a loaded Windows host, or the handling of the large text it returns — was not isolated;
the correlation (10 of 10, then 6 of 6, with a clean heartbeat each time) is the evidence, and it is the
upward lesson the draft took: an asynchronous interface is cleared by the heartbeat, not by its signature.

Host load was recorded per run in P10,
`docs/concepts/deathride/P10-race-start-hitch.md:70 "now records host CPU at the start and end of"`, and it
lines up: `docs/concepts/deathride/P10-race-start-hitch.md:216 "and fix-run1 is the run with no stall."` —
the only run that started on a host at 35–44% rather than 96–100%.

## Every slow frame on the stick has a name

P10 added one timer per request on the render thread,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:134 "one log line each (no per-frame cost)"`,
covering lobby, track, car and start requests, world and scene construction, and each profile save and
publish: `docs/concepts/deathride/P10-race-start-hitch.md:52 "publish. There is nothing per frame and no change in behaviour."`
With them, the attribution closed:
`docs/concepts/deathride/P10-race-start-hitch.md:130 "Every render over 100 ms after the probe started falls in one of three groups."`
The groups are the ones the technique's fourth step describes — the frame where a car, start or finish
request ran (12–14 per run), a frame whose interval includes such a frame (16–18 per run), and car frames
just under 100 ms plus a simulation catch-up (0–3 per run). Nothing was left unattributed, which is what
let P10 hand the remaining cost to a named owner — the profile save — instead of to rendering.

## Deviations

- **The probe was not moved.** `docs/concepts/deathride/P9-stick-validation.md:172 "Moving the sampling off the pump thread would change the procedure, so it was not"`
  done mid-A/B, and P10 kept the same procedure; every input-stream gate in both sessions therefore fails on
  a known harness cause, and the probe's own assertion still counts the stalls against the run,
  `deathride/tools/ability-stick-probe.mjs:116 "assert.equal(result.pumpStalls.length,0)"`.
- **No known positive.** No run injected a stall into the pump or the host to show the heartbeat firing; its
  zero in every run is a clean result from an instrument whose sensitivity was not demonstrated here.
- **Self-reported timers.** The request timers are the game timing itself; the platform's own frame
  statistics were not read beside them on the stick.
- **A threshold mismatch.** The pump flags lateness over 100 ms and the heartbeat gaps over 150 ms, so a host
  gap between the two would show as a pump stall with a clean heartbeat; the recorded stalls (104.8–835 ms)
  include values in that band.

## Outside corroboration

Node.js documents that its synchronous child-process methods block the event loop until the child exits
(https://nodejs.org/api/child_process.html), and its loop-delay histogram is driven by a timer on the same
loop (https://nodejs.org/api/perf_hooks.html), which is why an in-loop monitor sees a stall only afterwards
and a separate worker is the independent witness. Sampling memory loads the device side as well: an Android
engineer on the kernel mailing list reports 200–300 ms of constant CPU work in the main system process that
"was always PSS collection" (https://lkml.iu.edu/hypermail/linux/kernel/1708.1/03106.html). Perfetto's frame timeline attributes each janky
frame to the app or the compositor (https://perfetto.dev/docs/data-sources/frametimeline), the platform-side
counterpart of the game's request timers.

**Headsets.** On Meta's standalone headsets a missed refresh re-displays the previous frame and is reported as
a stale frame (https://developers.meta.com/horizon/documentation/unity/os-missed-frames/), and Meta's guidance
notes that "an app can run at 72fps, but have 72 stale frames per second"
(https://developers.meta.com/horizon/blog/ovr-metrics-tool-vrapi-what-do-these-metrics-mean/); its Perfetto guide
warns that system-wide instrumentation "might add significant additional overhead"
(https://developers.meta.com/horizon/documentation/spatial-sdk/ts-perfettoguide/). The method transfers and gains
a platform-side witness there. No Death Ride VR or XR build exists, and no headset harness was run.
