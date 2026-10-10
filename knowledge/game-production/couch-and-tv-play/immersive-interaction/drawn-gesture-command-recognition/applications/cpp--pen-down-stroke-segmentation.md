---
layer: application
type: application
subject: drawn-gesture-command-recognition
technique: pen-down-stroke-segmentation
stack: cpp
status: draft
verified_on: 2026-10-10
verified_against: cpp@20
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A stroke that runs through a tracking loss, and how long a gap the matcher forgives

Source tree: `mage-arena-vr` on `master` at `a86c1c6` (the root of every path below). The
stack is C++ in an Unreal Engine 5.8 project. `cpp@20` is the engine's default language
standard: `apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"` (5.8) is the witness,
and no module overrides it. The sibling applications on reject-class recognition and
held-out acceptance describe the recognizer and its corpus. **Every number here is
synthetic.** The clips come from the project's seeded generator, and no tracked hand has
had a real dropout yet.

## The seam

The pen is the pinch, with hysteresis
(`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:37 "PinchDown = 0.7"`).
Nothing between the hand source and that pen reads tracking confidence. The subsystem passes
every frame that has an index tip straight to the builder:
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilRecognizerSubsystem.cpp:162 "HandBuilder.AddTip(Frame.Joints"`.
A loss reaches it as ordinary samples:
`apps/vr/Game/Source/MageArenaVR/Hands/HandClipPlayer.h:38 "Clip-level tracking loss. A playing clip keeps its pose and reports confidence 0."`
The only loss handling is the session pause, after
`docs/gameplay/09-pause-comfort-accessibility.md:31 "Tracking loss before a pause"` of
1.5 s. A stroke drawn through a shorter loss is joined across it and matched. That is the
case step 4 of the technique forbids.

## The instrument, and its positive control

No Unreal build was run. The arms ran through a line-for-line JavaScript port of the
stroke builder (both draw styles). It used the project's own JavaScript plane fit
(`apps/vr/tools/glyphs/stroke.mjs`) and its own point-cloud distance
(`apps/vr/tools/glyphs/qdollar.mjs`), with the reject floor at
`apps/vr/Game/Source/MageArenaVR/Gestures/QPointCloudRecognizer.h:39 "DefaultRejectDistance = 26000.0"`.
Templates were extracted from the committed template clips. The test corpus was regenerated
with the command the project documents (`--corpus 30 --seed 1000`, then the mouse paths).

Before either arm was read, the port had to reproduce every threshold the project's sigil
suite asserts. It reproduced all 83 checks: 36 templates self-classify, all extract under
the second draw style, corpus 257 of 270, mouse 87 of 90, every impostor kind 30 of 30
rejected, and 0 false casts over 180 s of noise. A port that failed any of them would have
stopped the run.

## The arms

One tracking loss was injected inside the first attempt of each of 360 drawings (270 corpus
and 90 mouse-shaped, all generated), at 20, 40, 60 and 80% of the attempt's span. That
gives 1,440 trials per loss length. The hand keeps drawing while it is untracked, which is
how the project's clip player models a drop. Each loss was run twice: as a held pose with
confidence 0, and as missing frames.

- **A** is the tree as it is.
- **B** is step 4 as the technique stated it. A frame under confidence 0.2 (the tree's own
  floor for a tracked hand) is a missing sample. A gap of up to 3 samples is bridged. A
  longer one aborts the attempt, and the pen must lift before the next stroke starts.
- **B'** is the same gate, with the bridge set at 15 samples (208 ms) after reading A's curve.

**Target:** wrong-line casts caused by a loss. **Floor:** the unperturbed suite, plus the
correct casts that survive a loss.

## What was read

| Loss | Chord | A correct | A wrong | A precision |
| --- | --- | --- | --- | --- |
| none | - | 1,376 | 64 | 95.6% |
| 42 ms | 3.3 cm | 1,383 | 57 | 96.0% |
| 100 ms | 6.4 cm | 1,368 | 72 | 95.0% |
| 200 ms | 9.7 cm | 1,368 | 72 | 95.0% |
| 300 ms | 11.6 cm | 1,240 | 162 | 88.4% |
| 400 ms | 12.1 cm | 621 | 207 | 75.0% |
| 600 ms | 12.7 cm | 275 | 235 | 53.9% |
| 800 ms | 13.8 cm | 159 | 92 | 63.3% |

The remaining A trials at 300 ms and beyond fizzled or produced nothing. The held-pose and
missing-frame runs matched to within 3 trials per row. The floor suite was identical in all
three arms, because the corpus's own confidence dips
(`apps/vr/tools/clipgen/generate.mjs:819 "conf = 0.4;"`, three frames at a time) sit above
the floor.

**B is not-better.** It cast nothing across a loss of 100 ms or more. At 100 ms and at
200 ms it discarded all 1,368 correct casts in order to stop 72 wrong ones, and only 8 of
those were caused by the loss (the unperturbed stream already casts 64 wrong). The target
moved, but the floor fell with it.

**B' matched A within 3 of 1,440 trials up to 200 ms,** then refused everything from 300 ms
on. At 300 ms that trades 1,240 correct casts for 162 wrong ones. At 600 ms it trades 275
correct for 235 wrong.

## What the seam says about the technique

The seam was chosen to falsify. A matcher that resamples a stroke and compares unordered
points might forgive a short straight chord, and the technique said that chord was "a shape
the player never drew". It was forgiven: a 200 ms loss, a 9.7 cm chord,
moved precision by 0.6 points. The rule survives only past a length that has
to be measured, and "a few samples" was about 5x too short for this matcher. The technique
now says so, and states how to measure the bridge.

The second draw style showed the other half. It is a speed pen with
`apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:13 "A 150 ms stillness ends it."`
A held pose reads as that stillness. A 200 ms held loss therefore ended strokes and produced
166 casts, 29 of them wrong, from clips that cast nothing unperturbed. The 15-sample bridge
removed all 166. That is step 4's "never commit" in its plainest form, and it applies only
when the gate stands in front of the pen.

## What this cannot say

- The loss model is an assumption: the hand keeps drawing while untracked, and recovers at
  the clip's position. A runtime that extrapolates during a loss would draw a different
  chord. No recorded hand has a dropout yet.
- The knee sits somewhere between 200 and 300 ms on this corpus. No finer step was run.
- Whether a 300-600 ms loss should cast at 88-54% precision or fizzle is a design trade
  between a wrong spell and a missed one. The experiment prices the trade but cannot choose.
- The second draw style is set only by tests (the default is
  `apps/vr/Game/Source/MageArenaVR/Gestures/SigilRecognizerSubsystem.h:55 "DrawStyle = ESigilDrawStyle::StyleA;"`).
  On this corpus it extracts every drawing, but every one classifies between 56,000 and
  117,000, far past the floor. The suite checks only that it extracts
  (`apps/vr/Game/Source/MageArenaVR/Tests/SigilTests.cpp:321 "Style B is one stroke."`).
  The likely cause is a cloud that keeps the reach-in against pinch-drawn templates. That
  was not isolated.

The project records the row in `.ai/applied.jsonl`. Its next change, if the pinch pen keeps
the session pause as its only loss handling, is a confidence gate with a bridge near 0.2 s
and an aborted event the HUD can show as a fizzle.
