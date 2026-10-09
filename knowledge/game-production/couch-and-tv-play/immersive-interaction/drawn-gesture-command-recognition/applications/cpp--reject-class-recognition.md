---
layer: application
type: application
subject: drawn-gesture-command-recognition
technique: reject-class-recognition
stack: cpp
status: draft
verified_on: 2026-10-09
verified_against: cpp@20
---

# A floor that rejected nothing, and the stroke gates that took over

Source tree: `mage-arena-vr` on `master` at `be7583a` (the root of every path below), read-only.
The stack is C++ in an Unreal Engine 5.8 project: a port of the $Q point-cloud recognizer behind
a stroke builder that turns index-fingertip samples into a projected 2D gesture, which is a loop
with an inner stroke that picks one of three spell lines. **Every number here is synthetic.**
The clips come from a seeded procedural hand (`apps/vr/tools/clipgen/`), including those whose
source field says "mouse" (see the sibling application on held-out acceptance). No tracked hand
and no person drew any stroke counted below.

## First run: a floor above everything

The first accepted run had a reject distance set above the worst correct match. The
orchestrator's retry records it:
`apps/vr/tasks/T03-sigil-recognition.md:95 "Rejection is inactive."` and
`apps/vr/tasks/T03-sigil-recognition.md:96 "so every reject rate is 0 %"`. At that point the
tests showed that every drawing was classified as something. They did not show that only real
sigils cast. The retry added six seeded impostor kinds (bare circles, dot, zigzag, short hook,
open arc, stray swipe) and required each to be rejected at least 90% of the time. This is the
technique's "a zero reject rate is inactive, not perfect" rule, found by review rather than by
a test.

## Second run: the floor cannot do it alone

With impostors scored, the distributions overlap. The recognizer header records the measurement
and the decision it forced:

- `apps/vr/Game/Source/MageArenaVR/Gestures/QPointCloudRecognizer.h:32 "Correct matches on this corpus top out at 23595"`
- `apps/vr/Game/Source/MageArenaVR/Gestures/QPointCloudRecognizer.h:33-34 "Bare circles sit at 13084-14583 and a short inner mark at"`, overlapping the correct tail.
- `apps/vr/Game/Source/MageArenaVR/Gestures/QPointCloudRecognizer.h:36 "so the stroke builder rejects those shapes"`. A lower cut would have taken sloppy accuracy from 82/90 to 80/90, below its bar.
- `apps/vr/Game/Source/MageArenaVR/Gestures/QPointCloudRecognizer.h:37 "26000 is 2405 above the worst correct match"`

So the floor (26000) guards only against far impostors such as open arcs, which start at 49796.
The near impostors are refused structurally, before matching:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:28 "A gesture must contain a loop."`
and
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:31 "A later stroke that reaches less far than a spell line rejects."`
This is the **upward lesson** that the technique's first refusal, structural preconditions, came
from. Scale normalisation erased the one property (the mark's size relative to the loop) that
separates a scribble from a spell line.

## Third run: the gate measured the wrong size

Under a modelled predicting tracker (linear extrapolation between 25 or 30 Hz camera samples,
labelled a **model** in the source), zigzag impostors started casting. The study records why:
`docs/research/FEASIBILITY-2026-10.md:211 "Every distance is far under the reject."` The
builder's gate measured the inner stroke's path, and the extrapolation's overshoot and snap-back
at every corner inflated it. The fix, in commit `9f824a3` (2026-10-07), measures reach:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:43 "The inner mark is measured by its reach"`
with `apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:60 "MinInnerStrokeRatio = 0.28"`.
This is an **upward lesson** for the segmentation technique: measure reach, not path.

| Figure (synthetic, seed 1000 corpus, camera phase 0) | Before `9f824a3` | After | Anchor |
|---|---|---|---|
| extrap25 accuracy | 237/270 | 251/270 | `docs/research/FEASIBILITY-2026-10.md:230 "251/270 (93.0%)"` |
| extrap25 impostor casts | 30/180 | 0/180 | same row |
| Each impostor kind at 72 Hz, rejected | - | 30/30 | `docs/research/FEASIBILITY-2026-10.md:232 "every impostor kind rejected 30/30"` |
| Noise false casts at 72 Hz | - | 0 over 180 s fed | `docs/research/FEASIBILITY-2026-10.md:232 "is 0 over 180 s"` |

The command is the card's acceptance line,
`apps/vr/tasks/T03-sigil-recognition.md:78 "Automation RunTests MageArena;Quit"`,
after the corpus generation at `apps/vr/tasks/T03-sigil-recognition.md:74 "--corpus 30 --seed 1000"`.
The date is 2026-10-07 and the build is `9f824a3`. A mutation proof backs the fix: reverting
the builder fails three assertions, and restoring it turns them green
(`docs/research/FEASIBILITY-2026-10.md:237 "on 3 assertions"`).

## Rejection is visible to the game

Both refusals raise one event. A structural rejection is broadcast with a sentinel distance,
and a floor rejection with its distance:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilRecognizerSubsystem.cpp:178 "OnSigilRejected.Broadcast(-1.0);"`,
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilRecognizerSubsystem.cpp:190 "OnSigilRejected.Broadcast(Result.Distance);"`.
Whether the player sees a fizzle is presentation work that this tree does not show on `master`.

## Where the tree falls short of the standard

- **No margin.** The recognizer returns the nearest template and a floor verdict. Nothing
  compares the best and second-best distances, so a stroke halfway between two lines resolves
  by whichever is nearer. All 19 extrap25 misses that remain after the fix are label
  confusions between lines (`docs/research/FEASIBILITY-2026-10.md:233 "All 19 extrap25 misses left are $Q labels"`),
  and those are the cases a margin would turn from wrong casts into fizzles.
- **The negatives do not move with the held-out seed.**
  `docs/research/FEASIBILITY-2026-10.md:236 "seeds the impostor and noise clips from fixed bands"`.
  Every false-cast figure is measured on the same 180 impostors.
- **No recorded negative motion.** The noise corpus is generated, so the false-accept rate on
  real non-command hand motion is **unmeasured**.
- **No cost model beside the floor.** The floor is placed by the corpus gap, and the comment
  states that margin. Whether a false cast or a fizzle costs more in combat is not written down.
