---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: overdraw-and-transparency-ceiling
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Setting a Quest particle count budget beside the fill it does not see

Source tree: `mage-arena-vr` on `master` at `c1b94cc` (the root of every path below). The
stack is C++ in an Unreal Engine 5.8 project, witnessed by `"EngineAssociation": "5.8"` in
`apps/vr/Game/MageArenaVR.uproject`. There is no `CppStandard` override, so the language level
is the engine default, C++20.

**This is a desk-phase tree.** No build has run on a headset. Everything below is geometry
read from the code that places the effects. None of it is a device cost.

## The seam, chosen to falsify

The project's budget gate judges particles by count. `BudgetFx.h` holds
`inline constexpr int32 MaxLiveParticles = 2000;`, and the three stress runs passed it at
1,468 live particles. The technique says fill cost "is coverage times layers, not object
count". The test is fair, because the plan already guards coverage in words. Its particle row,
`docs/PROJECT-PLAN.md:366` "additive, small screen coverage", also allows no full-screen
translucency except the blink vignette. The proxy also keeps sprites small "to respect small screen
coverage". Suppose the count tracked fill on this content: the rows that make up most of the
count also make up most of the fill, and moving effects around at a fixed count changes
little. Then the plan's prose and the count row together would do the ceiling's job, and the
technique would need a boundary for content authored small.

- **Target:** whether count ranks the six proxy rows the way fill does, and how far fill moves
  at a fixed count.
- **Floor:** every D-G4 count verdict stays as measured. The experiment changes no config and
  no code.

## Arm A: the count row

Six systems, 1,470 authored live particles, 73% of the row, one GPU emitter, pass. The gate
has no input for distance, sprite size or blend mode, so it cannot rank the rows except by
count. Motes (600) are the largest row, then the bolt trail and the telegraph (300 each).

## Arm B: blended layers per pixel

A harness (`apps/vr/tools/budget/fill-estimate.mjs` in the project) treats each live sprite as
a camera-facing quad drawn in full. Additive blending gets no early rejection. The harness
sums each sprite's share of the eye buffer's tangent-plane area. It takes sprite sizes from
`FxRows`, placements from `SpawnFx` and the projectile lanes, and the eye height from the
layout data. The Quest 3 field of view, 110 by 96 degrees, is an assumption.

| Row | Distance | Share of count | Share of fill |
|---|---|---|---|
| Ward absorb | 0.61 m | 8.2% | 59.6% |
| Perfect flash | 0.61 m | 4.1% | 29.8% |
| Bolt trail, at arrival | 0.93 m | 20.4% | 8.5% |
| Motes | 2.5 m | 40.8% | 1.1% |
| Sigil ribbon | about 0.45 m | 6.1% | 0.7% |
| Telegraph | 15 m | 20.4% | 0.2% |

Mean fill is 0.32 blended layers per pixel.

**The falsifier did not fire.**

- **Count ranks the rows backwards.** The two palm-height rows are 12% of the count and 89% of
  the fill. Motes and the telegraph are 61% of the count and 1.3% of the fill.
- **Placement moves fill at a fixed count.** Swap the ward's and the telegraph's positions and
  fill goes from 0.32 to 0.61 layers, while the count still reads 1,470. The count row's own
  worst case is 2,000 sprites of 8 cm at the palm point, which is 5.5 mean layers, and it
  passes that too.
- **The largest blended layer sits outside the row.** The proxy budgets the blink vignette
  inside its motes row. Fully closed, the vignette's four camera quads cover 95.5% of each eye
  buffer: 0.955 layers, three times the whole particle proxy. The motes row adds 0.0035. The
  blink's camera fade is a further full-screen layer.

The project now carries `docs/research/OVERDRAW-CEILING-2026-10.md` with this table. It also
has five proposed ceiling rows beside the count rows: a mean over the view, a peak over the
gaze region, nearest legal distance per effect class, comfort overlays in the ceiling, and a
size for the unsized flash sprite. Each is marked open, with V1 as the decision point.

## The structural fact

The budget's instrument was built so that zeros never pass, and that discipline is real. The
gate refuses a window in which any system went dark. But its data shape has no field that
could carry the decisive input. `FBudgetFxRow` has sizes and an `Attach` string, and the
distance the cost depends on exists only as an offset inside the driver. The table that
judges the budget and the table that decides the cost sit in different files. The count row
is not careless. It answers a different question, simulation load on the game thread, and it
answers that one well.

## What this cannot show

- **No pixel was shaded on a headset.** The table locates the fill and shows the count row
  misranking it. It prices nothing. The instrument that would do so is a GPU capture of the
  stress scene at the first device sprint, with the vignette closed on one frame.
- **The bursts' spread is not readable from source**, so the peak over the gaze region is a
  range: 2.4 to 9.5 layers for a 15-30 cm spread. The ranking does not depend on it.
- **The verdict is about what the budget can see, not about speed.** `better` means the
  ceiling surfaced a cost the count row cannot rank, and it changed no D-G4 verdict.

## The boundary this tree adds

The technique counts world-space interface panels in the ceiling. This tree shows that a
comfort overlay belongs there too: a vignette or a fade drawn over the view is a blended layer
over most of the eye buffer. A budget that files it inside a particle row has budgeted it at
the particle row's coverage, which here was less than a two-hundredth of it. This is now a decision
rule in the technique.
