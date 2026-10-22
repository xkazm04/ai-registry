---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: stereo-draw-call-budget
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Checking a Quest draw-call cap for the path, the side and the unit

Source tree: `mage-arena-vr` on `master` at `be9a81b` (the root of every path below). The
stack is C++ in an Unreal Engine 5.8 project, witnessed by `"EngineAssociation": "5.8"` in
`apps/vr/Game/MageArenaVR.uproject`. There is no `CppStandard` override, so the language
level is the engine default, C++20.

**This is a desk-phase tree.** No APK has been built and no headset has run it. Everything
below is read from text and code. None of it is a device number.

## The seam, chosen to falsify

The technique says a cap that does not name its stereo path, its side of the frame and its
unit "is incomplete, not generous". This tree is a fair test of that, because its owners
already did the hard part: a research pass read the engine source and concluded that under
mobile multiview "draws are per frame, not per eye" and that one occlusion-query draw covers
both eyes (`docs/research/MOBILE-INSTANCING-2026-10.md:225` "Draws are per frame, not per
eye"). If the cap rows carried that reading, the technique would be redundant here.

A caught outcome would have taught something: that a project can hold the right reading in
research and still publish a cap that can be read two ways. A clean outcome would have been
every cap statement carrying all three terms.

- **Target:** cap statements naming path, side and unit together.
- **Floor:** no D-G4 verdict changes under either counting reading.

## Arm A: the cap as stated

Twelve verdict-bearing statements of the cap on `origin/master`:

| Where | Path | Side | Unit |
|---|---|---|---|
| `docs/PROJECT-PLAN.md:364` "Draw calls (multiview)" | yes | no | no |
| `docs/research/BASELINE-2026-10-07.md:388` "Draw calls (multiview)" | yes | no | no |
| `docs/DECISIONS.md:200` "for the whole frame" | no | no | yes |
| `docs/PROJECT-PLAN.md:47` and `:218` | no | no | no |
| `docs/research/BUDGET-DG4-2026-10.md:137`, `:561`, `:718` verdict rows | no | no | no |
| `apps/vr/Game/Source/MageArenaVR/Greybox/GreyboxCapture.cpp:906` "Targets->SetNumberField" | no | no | no |
| `apps/vr/Game/Source/MageArenaVR/Greybox/GreyboxCapture.cpp:927` "MaxDraws <= 150.0" | no | no | no |
| `apps/vr/tools/capture-greybox.ps1:151` "drawCalls = 150" | no | no | no |

Two name the path, one names the unit, none name the side, none name all three. The gate at
`apps/vr/Game/Source/MageArenaVR/Greybox/GreyboxCapture.cpp:927` decides pass or fail from a single-view desktop count and writes
no path into its JSON, although the same file labels the frame-time target "a desktop proxy,
not Quest truth".

The second rule of the technique, to confirm which path ran, has nothing behind it. The
multiview CVars are set (`apps/vr/Game/Config/Android/AndroidEngine.ini:6`
"vr.MobileMultiView=1"), and no line in the docs, tools or tasks asks a device to report
that the path was active. The research that assumes it says only "mobile multiview on" for
its source reading.

## Arm B: the cap with its terms

"Draw submissions per frame, mobile multiview, render thread", beside "triangles per eye" for
the GPU side, plus one device row that logs the active stereo path with the first device
count. This arm is priced, not run: the wording has not landed and the device row cannot run
without an APK.

The floor was computed. The desktop capture is one view, so its 183 median and 188 max
(`docs/research/BUDGET-DG4-2026-10.md:561`) are already a submission count, valid on a
multiview path. A multi-pass reading would double them to 366. Both fail 150, so no verdict
moves under either reading and the floor holds.

## What this shows, and what it cannot

The technique held in its substance and found a gap in its publication. The project's
research was right; the cap rows and the gate never inherited it. A reader who opens the
plan, or the capture JSON, cannot tell whether 150 is per frame or per eye.

- **No draw was counted on a headset.** The arm B text is untested.
- **The twelve are statements of one cap**, not twelve independent decisions. The count
  measures how often the cap travels without its terms.
- **The verdict is `unmeasurable`**, not `better`. Nothing in the project moved. The
  instrument that would settle it is the V1 device capture: a logged stereo path next to the
  first device draw count, and a re-run of this audit after the wording lands.
