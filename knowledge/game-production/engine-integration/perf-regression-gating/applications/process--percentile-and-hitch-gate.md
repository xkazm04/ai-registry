---
layer: application
type: application
subject: perf-regression-gating
technique: percentile-and-hitch-gate
stack: process
status: forged
verified_on: 2026-10-07
---

# A 900-second stick soak graded against a budget written first, and a window bar that hid a tenfold gain

Source tree: `firetv-deathride` on branch `deathride/main` at `4bbae5d2`, read 2026-10-07; paths are
relative to its root. The stack is `process`: what is realized is how two device sessions of 2026-10-07 on
one Fire TV stick (model AFTKM, Android 11) chose and read the statistics that carried their verdicts — P9, a
900 s soak of the post-wave build against the I2 budget, and P10, whose bar for the race-start fix was a
per-window maximum. Both sessions ran **profiled** (`--profile`), on a host shared with other sessions. Every
figure here is a stick figure; none is a desktop figure.

## The budget fixed the statistics before the run

I2 (2026-10-01) wrote down what would be compared, and against what, before any sustained measurement:
`docs/concepts/deathride/I2-stick-budget.md:25 "Compare active-window p95 against G1's 21.60 ms and the original 16.7 ms ambition without calling either an automatic pass."`
and, in the same paragraph, a median band, an active maximum of 33 ms, and active and transition maxima kept
separately. That is the technique's first step in the form a small team can afford: a percentile for the slow
end, a maximum kept as its own reading, and the median beside them as context.

## P9 against I2

The arm: `docs/concepts/deathride/P9-stick-validation.md:45 "900.147 s, 14 rounds, all ten classes active, thermal status 0 throughout."`
— two 30 Hz probe controllers, the five-theme course cycle, the build at `86cb512d` that includes the 10-06
render wave. The readings, against the bars I2 set:

| Reading (P9 baseline, 2026-10-07, n = 1 run) | P9 | I2 bar | Verdict |
|---|---:|---|---|
| Active p50 range | 16.653–16.711 ms | 16–18 ms | pass |
| Worst active-window p95 | 21.964 ms | 16.7 ms; G1 21.60 for comparison | fail against both |
| Active maximum | 79.611 ms | < 33 ms | fail |
| Transition maximum | 2,376.901 ms | none set | reported |
| PSS range | 171.495–187.878 MiB | < 192 MiB | pass |
| Owned textures / art | 39.970 / 18.750 MiB | 52 / 32 MiB | pass |

`docs/concepts/deathride/P9-stick-validation.md:50 "| Worst active-window p95 | 21.964 ms | 16.7 ms (G1 21.60 for comparison) | fail (both) | 22.433 |"`
and `docs/concepts/deathride/P9-stick-validation.md:51 "| Active max | 79.611 ms | < 33 ms | fail | 54.923 |"`.
Each window is a rolling 10 s of about 600 frames, so a window's p95 rests on roughly thirty frames beyond it
(*N*(1 − *p*) in the technique's fifth step), and the worst window's p95 is a maximum over many such windows.

The maximum was used as the technique says, as a locator. The worst active frame was opened rather than
gated on, and it pointed away from rendering:
`docs/concepts/deathride/P9-stick-validation.md:64 "The worst active frames are not fill-bound."`
— wall time exceeded the thread's CPU time on every frame above 54 ms, with the scenery draw at 0.6–3.6 ms.
The transition maximum, which I2 set no bar for, was reported on its own line and became P10's subject.

The comparison P9 could not make is stated in the source:
`docs/concepts/deathride/P9-stick-validation.md:39 "The P8 delivery run was unprofiled and"`
`docs/concepts/deathride/P9-stick-validation.md:40 "used the old courses, so every P8 comparison below is across both differences."`
The P8 column is context, not a baseline; the wave's own stick delta (the 10-06 render chain against its
parent) remains unmeasured.

## The window bar that could not see the fix

P10's bar was written per window:
`docs/concepts/deathride/P10-race-start-hitch.md:72 "is no frame over 100 ms in any lobby-to-race transition window"`.
The windows are the game's rolling last ten seconds,
`deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:21 "if(nowMs-times[i]<=10000) window[n++]=values[i]"`,
read by the probe once a second, `deathride/tools/ability-stick-probe.mjs:80 "nextWindow=second+1"`, and the
grader takes each window's maximum,
`deathride/tools/perf-p10.py:31 "over = [w for w in transition if w['maxMs'] > LIMIT_MS]"`. So one slow frame
fails every window read in the ten seconds after it. The fix removed a 1.1–2.3 s freeze, and the count did not
move:
`docs/concepts/deathride/P10-race-start-hitch.md:93 "The transition max falls from 2,272.8-2,376.9 ms (P9) to 245.8-374.4 ms. The window count barely moves"`
— 42 windows over 100 ms on P9's diagnostic APK, 41–43 on every run after the fix. The source gives the
reason in its own words:
`docs/concepts/deathride/P10-race-start-hitch.md:94 "because a 10 s window holds every frame of the lobby-to-race switch, and every switch still has at least"`
one profile save over 100 ms. The frame-level reading carried the information the window count lost: P10
counted the renders over 100 ms by cause (12–14 request frames per run, 16–18 neighbours whose interval
contained one, 0–3 catch-ups), which is the event count the technique's fourth step asks for.

## Deviations

- **Single runs.** P9 is one 900 s run per APK; P10 two 360 s runs per APK. No percentile here has a spread
  from unchanged replicates, so the technique's sixth step — choose the percentile by its spread — was not
  possible, and a difference between two runs below a few milliseconds is not resolvable from these data.
- **A maximum is a bar.** I2's 33 ms active maximum and P10's 100 ms per-window maximum both put the worst
  frame into the verdict, which the technique keeps out of it. Both are policy statements a person wrote and
  both are honest as such; neither is the gate's statistic.
- **Windows, not events, are the counted unit.** 41–43 failing windows over six rounds per run is about seven
  windows per round (arithmetic on the source's figures, not a source figure): the count follows how many
  once-a-second reads fall within ten seconds of each switch's slow frames, not how many slow frames there
  were or how slow. It is what the P10 summary headlines.
- **Profiled runs only.** No unprofiled 900 s run of either build was taken; the profile's own cost is inside
  every figure here.

## Outside corroboration

Platform frame-quality gates count events or fractions rather than window maxima: Android vitals calls a session
slow when "more than 25% of the frames are slow" (https://developer.android.com/games/optimize/vitals/slow-session)
and gates frozen frames as "more than 0.1% of frames with a render time greater than 700 ms"
(https://support.google.com/googleplay/android-developer/answer/9844486), while its rendering guidance keeps a
hard ceiling at freeze scale: "No frames in your app should ever take longer than 700ms to render"
(https://developer.android.com/topic/performance/vitals/render). JankStats defines jank per frame, by default "a
frame taking twice as long to render as the current refresh rate"
(https://developer.android.com/topic/performance/jankstats).

**Headsets.** Meta's standalone-headset guidance counts stale frames as events and warns that "an app can run at
72fps, but have 72 stale frames per second"
(https://developers.meta.com/horizon/blog/ovr-metrics-tool-vrapi-what-do-these-metrics-mean/), and its store
check is about sustained slowness: "The application should not experience extended periods of rendering rate
below 60 fps" (https://developers.meta.com/horizon/resources/vrc-quest-performance-1/). The event-count rule
holds there and is the platform's own. No Death Ride VR or XR build exists and no headset was measured.
