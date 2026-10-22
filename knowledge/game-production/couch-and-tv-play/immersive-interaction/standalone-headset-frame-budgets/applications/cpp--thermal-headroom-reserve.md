---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: thermal-headroom-reserve
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# A 60 s desktop window beside a 7-10 minute session, and a request level nobody set

Source tree: `mage-arena-vr` on `master` at `3394744`, the root of every path below. The stack
is C++ in an Unreal Engine 5.8 project (`"EngineAssociation": "5.8"` in
`apps/vr/Game/MageArenaVR.uproject`, no `CppStandard` override, so C++20).

**This is a desk-phase tree.** No device capture exists, so no sustained figure below has a
size. What was read is whether the project's capture path could carry the technique's verdict
once a device exists.

## The seam, chosen to falsify

The technique makes four claims. Three can be read off the tree today: a proving capture is a
full session in time-ordered windows, the request level is not the maximum, and a reserve is
taken before the shares are divided. The seam was chosen to be able to refute the technique's
central instruction, "the verdict is the late windows, not the mean". A caught outcome would
have been a capture path that already records time-ordered windows, which would make the
instruction redundant here. The path does not, so the instruction held.

- **Target:** the number of the project's recorded frame-time artifacts from which a late-window
  verdict can be read.
- **Floor:** every recorded count verdict and figure stays as it is. No config, code or plan row
  changes.

## Arm A: the capture and budget path as written

| Fact | Where | Reading |
|---|---|---|
| The session is "10 minutes or less"; the plan says "one 7-10 minute session" | `docs/PROJECT-PLAN.md:71`, `:286` | 420-600 s of play |
| The budget proxy warms up 10 s and samples 60 s | `apps/vr/Game/Source/MageArenaVR/Budget/BudgetStressDriver.h:63-64` | the window is 6-10% of the session, taken right after a 10 s warm-up |
| The frame row is one ceiling, "13.9 ms; p95 ≤13.9 ms" | `docs/PROJECT-PLAN.md:362` | 72 Hz is 13.89 ms, so the ceiling is the whole interval and the reserve is 0% |
| Thermal "is recorded in every device perf capture ... if the capture exposes them" | `docs/PROJECT-PLAN.md:371` | a recording clause, not a reserve and not a late-window gate |
| The 17 committed proxy summaries carry run, label, counts and exit fields | `docs/research/budget-dg4/*.summary.json` | **0 of 17** hold a time-ordered frame series; the per-frame series is written to `runs/DG4/<run>/samples.json`, which the root `.gitignore` excludes (`.gitignore:26`) |

The project's own plan labels the proxy "not Quest truth; cannot prove 72 Hz". That is the
right label for a desktop frame time, and the count rows it gates (draw calls, triangles,
particles) do not heat a device the way a frame time does. The gap is for the time rows. When
the first device capture arrives, nothing in the committed record can say whether a late window
differs from an early one.

## Arm B: the technique applied

- A device capture of the full 420-600 s session, split into at least an early and a late
  window, with the CPU and GPU levels and the temperature read at each window. The verdict is
  the late window.
- A named reserve row taken off the top of the 13.9 ms interval before the class shares divide
  the rest, marked as a plan figure until the cold-versus-sustained gap is measured on the
  binding device.
- The late-window figure travels into the committed summary, so that a pulled capture can be
  gated without the ignored directory.

**Not measurable here.** Arm B's target is a late-window figure, and the only instrument that
can produce one is a headset. The structural count above (0 of 17) is what could be read now.

## What held and what the tree already does right

- **The request level is not the maximum.** `DefaultEngine.ini` sets no processor performance
  level in the `OculusXRHMDRuntimeSettings` section (`apps/vr/Game/Config/DefaultEngine.ini:61-68`),
  so the engine plugin default applies: CPU `SustainedLow`, GPU `SustainedHigh`, recorded in
  the project's own stack research (`docs/research/STACK-OPPORTUNITIES-2026-10.md:955-956`).
  Both are sustained levels, not a boost level. The technique's fourth heading, "lower the
  request and remeasure", has nothing to lower in this tree. The plugin source itself is
  installed under `Plugins/MetaXR` and is not tracked, so that default is witnessed on this
  machine, not by the repository.
- **The first fallback already trades the right thing.** Fallback P-3 lowers the render scale
  and P-2 caps the rate (`docs/PROJECT-PLAN.md:218`). The technique's "prefer dynamic resolution
  to absorb a step down" is not named, but nothing in the plan forecloses it.

## What this realization cannot do

It does not say a sustained run will fail. A desk tree holds no thermal fact: the research
record says "Thermal: no first-party statement found" (`docs/research/FEASIBILITY-2026-10.md:35`).
It also cannot size the reserve, which the technique says comes from the gap between a cold and
a sustained capture on the binding device. And a late window recorded in a committed summary
still reads one headset in one room; the room and charging state are the technique's own
decision rules and nothing here records them.

## Return condition

When the first device capture exists (the plan's V1 stage): split it into early and late
windows, commit the late-window summary beside the proxy summaries, and write the reserve row
with its measured gap. The instrument that would make this row measurable is a headset
capture that reads CPU and GPU levels and temperature per window.
