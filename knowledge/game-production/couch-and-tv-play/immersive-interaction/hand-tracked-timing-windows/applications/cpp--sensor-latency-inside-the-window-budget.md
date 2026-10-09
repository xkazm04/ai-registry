---
layer: application
type: application
subject: hand-tracked-timing-windows
technique: sensor-latency-inside-the-window-budget
stack: cpp
status: draft
verified_on: 2026-10-09
verified_against: cpp@20
---

# A pinned window that was never widened, and a live session that judges it late

Source tree: `mage-arena-vr` on `master` at `be7583a` (the root of every path below), read-only.
The stack is C++ in an Unreal Engine 5.8 project with a combat kernel shared, as data, with a
desktop and TV build. The window is the perfect absorb of a palm ward. The onset recovery that
feeds it is described in the sibling application. **Every number here is synthetic or a model.**
No device latency has been measured. The plan schedules that for November.

## The width has one authority, and nobody widened it

The window lives in the pinned design data and is read rather than retyped:
`apps/vr/tasks/T04-ward-detection.md:12 "perfect.windowS 0.15"` and
`apps/vr/tasks/T04-ward-detection.md:13 "never retype them."`.
The gameplay reference states it in ticks:
`docs/gameplay/02-verbs-and-gestures.md:208 "hit resolves no more than 0.15 s (9 ticks, inclusive) after a fresh raise"`.
The card forbids compensation by width:
`apps/vr/tasks/T04-ward-detection.md:62 "Do not change the pinned numbers or widen the window."`.
The plan's first fallback is a data change with a stated rule:
`docs/PROJECT-PLAN.md:217 "do not widen by feel"`.
That matches the technique's separation, with the width in the canon and latency kept apart.
The risk is named at plan level:
`docs/PROJECT-PLAN.md:546 "Perfect window unreachable through tracking latency or jitter"`.

## What the desk proved: latency drops out once the onset is recovered

The D-G3 sweep injects 0 to 100 ms between the motion and the moment the pose becomes
classifiable, on a 72 Hz stream and on held and extrapolated 30 Hz models (`538f815`,
2026-10-07, the `HeldSample.Latency` test, run with
`apps/vr/tasks/T04-ward-detection.md:70 "Automation RunTests MageArena;Quit"`).

| Figure | Value | n | Label | Anchor |
|---|---|---|---|---|
| Hit at the authored tick and interior probes, perfect | 36/36 per 30 Hz stream | 36 | model | `docs/research/FEASIBILITY-2026-10.md:175 "are perfect in 36/36 cases on each stream"` |
| D-G3 go (perfect at ≤60 ms injected) | holds | - | model | `docs/research/FEASIBILITY-2026-10.md:206 "the perfect window holds to 60 ms on both the held worst case and the extrapolated model"` |
| D-G3 strict "authored tick ±1 frame" | fails on 30 Hz streams, from the camera grid | 36 | model | `docs/research/FEASIBILITY-2026-10.md:206 "Strict "authored tick ±1 frame" timing does not hold"` |

The first two rows are this technique's desk check: with recovery working, the verdict is the
same at every injected delay. The third row is the sample grid, not latency, and it is recorded
as a failed predicate. None of these rows is a device latency. The plan names the device
instrument, which is the instrumentation subject's flash protocol:
`docs/PROJECT-PLAN.md:241 "ward latency by the flash method"`, against the hands gate's
`docs/PROJECT-PLAN.md:49 "ward p95 ≤60 ms"`. Both are **unmeasured** today.

## The deviation: the live session judges at the raise event

The recovered onset feeds the tests' resolver. It does not feed the game:
`docs/gameplay/02-verbs-and-gestures.md:219 "not the detector's motion-onset time"`,
`docs/gameplay/02-verbs-and-gestures.md:219 "The onset time is logged and not used to back-date the"`, and
`docs/gameplay/02-verbs-and-gestures.md:221 "is exercised by the ward tests only."`
So the shipped window is judged in classification time. The sweep's 36/36 describes the resolver
the game does not run. On a device, every raise in the live session would be stamped late by the
whole tracking pipeline plus the pose's confirmation. That shifts the window against the
player's motion: a raise begun just before the hit is confirmed after it and misses, while a
raise begun earlier than the window allows can still count. This is the technique's "fair verdict in a
test, unfair verdict in play" failure. It is recorded here as a **deviation**, and the standard
stays. The tree carries it as an open question:
`docs/gameplay/02-verbs-and-gestures.md:321 "Should the perfect window be anchored to motion onset in the session"`.

## Where the tree falls short of the standard

- **The live window is judged in classification time** (above). Until the session back-dates the
  kernel's fresh tick to the onset, a device latency figure would change who earns a perfect.
- **No resolution horizon.** The kernel resolves each hit on its tick. Nothing waits for late
  samples, because nothing in the live path is onset-timed yet. Once it is, the horizon becomes
  necessary.
- **No measured channel latency, and no capture time.**
  `docs/research/FEASIBILITY-2026-10.md:69 "So the app never sees when the cameras sampled."`
  The channel's latency parameter has no value and no protocol run on `master`.
- **The owner's desk perfects are unmeasured** in committed evidence:
  `docs/PROJECT-PLAN.md:217 "owner ≥3 perfects in 10 at the desk"`.
