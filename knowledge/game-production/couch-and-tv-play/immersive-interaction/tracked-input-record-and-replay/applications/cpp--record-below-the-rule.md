---
layer: application
type: application
subject: tracked-input-record-and-replay
technique: record-below-the-rule
stack: cpp
status: draft
verified_on: 2026-10-21
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: structural-only
---

# A pose recording that carries the runtime's pinch verdict

Source tree: `mage-arena-vr` on `master` at `a31989a` (the root of every path below), read
in a detached checkout. The stack is C++ in an Unreal Engine 5.8 project, as in this
subject's other application. Node scripts generate the clips. The change this run landed
in the project is `b0ce3c7`, with its project row at `c1b94cc`.

**No tracked hand made any clip counted here.** All 113 committed clips under
`apps/vr/Game/Clips` and `apps/vr/Game/TestData/Clips` carry `"source":"synthetic"`. Real
hands are planned for the V2 window, 5 to 8 November 2026.

## The seam

The clip frame (`docs/CLIP-SCHEMA.md`, schema `@1` and `@2`) carries 26 joint poses, and
beside them `conf`, `pinch` and, from `@2`, `sys`. `apps/vr/Game/Source/MageArenaVR/Hands/HandFrame.h:28` "float Pinch = 0.0f;".
The November recorder rules say `pinch` is "the runtime thumb-index contact" and `conf` "the
runtime tracking confidence". So one frame mixes two layers: tracked poses, and values the
runtime has already decided.

Every rule that reads a frame was sorted by the fields it reads.

| Rule | Reads | Layer of the deciding field |
| --- | --- | --- |
| Sigil pen state, style A | index tip joint and `Pinch` against 0.7 down and 0.5 up | runtime decision |
| Staff grip | `Pinch >= 0.70` on both hands, palm spacing from joints | runtime decision |
| System-gesture gate | `bSystemGesture` | runtime decision |
| Session tracked and lost checks | `Confidence` | runtime decision |
| Blink, ward | joints only | tracked pose |
| Sigil pen state, style B | pen synthesised from tip motion in game code | above the clip |

The pinch reads are at `apps/vr/Game/Source/MageArenaVR/Gestures/StaffDetector.cpp:60` "Left.Pinch >= GripPinch && Right.Pinch >= GripPinch"
and `apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.cpp:243` "if (Pinch >= PinchDown)".

## Arm A and arm B

- **Arm A (the subject's other three techniques, as written):** the corpus is versioned and
  carries runtime, confidence and timestamps, the replay runs the shipped detectors, and
  proxy figures are labelled. None of them asks which layer a rule reads. Before this run
  the schema named 0 of the 4 runtime-decided reads as such.
- **Arm B (this technique):** the field-layer table and the cross-layer check.

**Target:** rules whose verdict hangs on a runtime-decided field, named as such: 4 of 4
after the Field layers section landed in `docs/CLIP-SCHEMA.md`.
**Floor:** no code, threshold or clip changed. Held.

**Chosen to falsify.** The cross-layer check adds nothing if the synthetic corpus can
already produce a frame where `pinch` and the joints disagree. A script read every frame of
the 113 clips and measured the thumb-tip to index-tip distance against `pinch`.

| Frames | n | Tip distance, cm (min / median / max) |
| --- | --- | --- |
| `pinch >= 0.7` | 8,995 | 0.14 / 0.99 / 3.39 |
| `pinch < 0.5` | 4,947 | 3.97 / 10.61 / 11.69 |
| between | 360 | 1.75 / 3.70 / 5.18 |

The two groups do not overlap, and no frame has the layers disagree. A control clip with five
pen-down frames whose thumb tip was moved 8 cm read 5 of 5, so the zero was not produced by
the instrument. The cause is in the generator, which places the thumb from the authored pinch
(`apps/vr/tools/clipgen/generate.mjs:331` "function placeThumb(meta, side, pinch, indexTip)").
The proxy cannot show a disagreement between layers, and a device recording can.

**The project's own measurement shows that the held field matters.** Its extrapolation
model holds `pinch` while it degrades the joints, and records the other arm once:
`apps/vr/Game/Source/MageArenaVR/Tests/HeldSampleTests.cpp:133` "Measured once with pinch extrapolated too: the extrapolated".
That arm gave 30 zigzag impostor casts instead of 9 on the extrapolated 30 Hz corpus.
The figure comes from synthetic clips and a modelled input path, so it is a proxy figure.

## Verdict

`better`, at the experiment rung, with structural proof only. The technique found a class of
reads that the other three techniques do not name. The project's November recorder spec,
as written, would write V2 recordings that leave the pinch-extrapolation question open,
because a 72 Hz `pinch` with no capture time cannot tell an extrapolated value from a sampled
one. The project already reserves `captureTime` for joints (its G2), and the same field is
what settles pinch.

## What this realization cannot do

It cannot measure the runtime's pinch layer: there is no recording yet. Return in the V2
window. Count, per recorded clip, the frames where `pinch` says contact while the tips are
apart, and the reverse. Write that count as the first row of a proxy miss ledger for pinch.
Run the extrapolation model both ways on the recorded clips.
