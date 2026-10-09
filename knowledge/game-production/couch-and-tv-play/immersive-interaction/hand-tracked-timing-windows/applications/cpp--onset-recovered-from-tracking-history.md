---
layer: application
type: application
subject: hand-tracked-timing-windows
technique: onset-recovered-from-tracking-history
stack: cpp
status: draft
verified_on: 2026-10-09
verified_against: cpp@20
---

# A palm ward's onset, walked back past the settle and stopped at the lowering

Source tree: `mage-arena-vr` on `master` at `be7583a` (the root of every path below), read-only.
The stack is C++ in an Unreal Engine 5.8 project. An off-hand open palm raised toward the threat
is a ward, and a fresh raise just before a magic hit is a perfect absorb. The detector stamps the
raise with a motion onset recovered from palm-speed history. **Every number here is synthetic or
a model.** Hands are procedural clips. The slower camera is modelled in memory, either holding
each pose for one camera period or extrapolating linearly between camera samples. The source
labels the second stream a **model**, because the runtime's own prediction method is not
published. No tracked hand produced any figure below.

## The walk, as built

The onset threshold is measured on the clip, not chosen:
`apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.h:14 "Height, hysteresis and 0.30 m/s are measured off"`,
which sets `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.h:34 "OnsetSpeedMps = 0.30"`.
The walk has two phases, which is the technique's procedure:

1. **Bridge the settle.** The settle clip was built to break a naive walk:
   `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.h:18 "ward-raise.normal.settle rises, sits still for 0.30 s short of the pose"`.
   The tail was measured, not felt:
   `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.h:20 "puts the shortest working tail just over 28 frames"`.
   The bridge also has a spatial condition:
   `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.h:24 "Sub-threshold frames are bridged only while the palm stays above LowerHeightM."`
2. **Walk the fast region** back to the threshold's rising edge.

Bounds stop the walk:
`apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp:141 "A re-raise stops at the lowering."`
For the first raise, `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp:142 "a fidget before the hand was seen in the lap would be the onset."`,
so the walk is bounded at the first sample seen in the lap.

## How it got there: three upward lessons from one review

The first version passed all of its tests. The orchestrator's retry then listed real-hand
failures that the synthetic tests could not see. Each one became part of the technique:

- `apps/vr/tasks/T04-ward-detection.md:85 "Onset walks into the previous lowering"`: with no
  lower bound, a quick re-raise reported an onset before the lowering. A freshness assertion
  then passed for the wrong reason. The technique now bounds the walk at the last release.
- `apps/vr/tasks/T04-ward-detection.md:89 "80 ms walk-back tail"`: a hand that settles at the
  top for longer than the tail returned "confirmation minus the tail", not the onset. That
  is the settle trap, now step 3 of the procedure, with the tail chosen from a settle clip.
- `apps/vr/tasks/T04-ward-detection.md:93 "Starting already raised counts as fresh"`: a hand
  entering tracking in the pose could earn a perfect. The fix reads
  `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp:272 "A hand that is already raised when tracking starts has not been seen lowered, so it is not fresh."`
  This lesson went to the tracking-loss technique.

A fourth lesson came from modelling a 30 Hz camera under a 72 Hz game:
`apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp:237 "A held sample keeps the last measured speed, so neither onset walk stops on a re-sent pose"`
(commit `43675ff`, 2026-10-07).

## What the sweep measured (model and synthetic)

The latency sweep and the ward stream models are `HeldSample.Latency` and `HeldSample.WardModels`.
They landed in `538f815`, `ec477e0` and `20e034a` on 2026-10-07 and were run with the card's
acceptance command,
`apps/vr/tasks/T04-ward-detection.md:70 "Automation RunTests MageArena;Quit"`.
For the sweep, n is 12 cases at 72 Hz and 36 per 30 Hz stream (12 at each of three camera
phases). The injected latencies run from 0 to 100 ms over the normal, slow and sloppy
raise clips. For the onset comparison, n is 9 per stream.

| Figure | Value | Label | Anchor |
|---|---|---|---|
| Onset error against injected latency, 0-100 ms | does not change | model | `docs/research/FEASIBILITY-2026-10.md:173 "The onset error does not change with latency on any stream."` |
| Onset error at 72 Hz | 0 ms, go 12/12 | synthetic | same line |
| Onset error, held and extrapolated 30 Hz | +13.9 to +41.7 ms, by camera phase | model | `docs/research/FEASIBILITY-2026-10.md:174 "depending only on the camera phase"` |
| "Within one 72 Hz frame" predicate, 30 Hz | 12/36 per stream (fails) | model | `docs/research/FEASIBILITY-2026-10.md:174 "holds in 12/36 cases on each stream"` |
| Ward onset against 72 Hz, four streams | +13.9 / +27.8 / +41.7 ms (min / median / max) | model | `docs/research/FEASIBILITY-2026-10.md:176 "+13.9 / +27.8 / +41.7 ms (min / median / max)"` |

The study's own verdict is the technique's "sample grid is the floor" section:
`docs/research/FEASIBILITY-2026-10.md:206 "the onset lands 14 to 42 ms late, from the camera grid, not from latency"`.
The failed ±1-frame predicate is recorded as it stands. It is evidence that the residue is the
grid, and that only an earlier stamp by a measured fraction of the camera period, or a window
that tolerates one period, removes it.

## Speed over a camera period

The blink detector, a neighbouring flick recognizer on the same stream, showed what
frame-to-frame speed does on a predicting runtime:
`docs/research/FEASIBILITY-2026-10.md:249 "So the early fire is the camera grid read as the fall."`
The fix measures over one camera period and along the flick's direction:
`docs/research/FEASIBILITY-2026-10.md:252 "(40 ms: one 25 Hz period, three frames at 72 Hz)"`
(commit `59fe5ea`, 2026-10-08). That is step 2 of the technique.

## Where the tree falls short of the standard

- **No capture timestamp.** The runtime path stamps samples with the predicted display time:
  `docs/research/FEASIBILITY-2026-10.md:69 "So the app never sees when the cameras sampled."`
  The onset is therefore the first predicted sample that shows motion. The study's G2 proposes
  a day-one device probe for the real rate and unextrapolated poses. Until then, the 30 Hz and
  25 Hz rates are models.
- **The ward's speed is frame-to-frame.** The ward walk uses per-sample speed with the held-pose
  carry. The camera-period span the blink adopted is not applied to the ward.
- **No gap stop.** The walk has no tracking-state flag to stop at, because no detector reads
  tracking state or confidence yet (see the sibling application).
- **The live game does not use the recovered onset.** See the sibling application on the
  latency budget.
