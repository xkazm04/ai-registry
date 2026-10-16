---
layer: application
type: application
subject: cross-runtime-rules-conformance
technique: planted-mutation-proves-the-suite
stack: cpp
status: draft
verified_on: 2026-10-16
verified_against: cpp@20
applied: experiment
---

# One tier cap moved by one, three of 45 vectors noticed, and the vector named for it did not

Source tree: `mage-arena-vr` on `master` at `b7f1009` (the root of every path below). The
port is C++ in an Unreal Engine 5.8 project. `cpp@20` is the engine's default language
standard: `apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"` (5.8) is the witness, and
no module overrides it. The reference is a TypeScript rules kernel from a sibling project,
pinned by commit. The run was made on 2026-10-16 against base commit
`0a060b78911f3294898294f241b942b5218ab7c7`, a Win64 Development editor build without the
headset vendor plugins. No file under `apps/vr/Game/` or `apps/vr/data/` changed between that
base and `b7f1009`, so the anchors below are the code that was built.

## The three runs

The result is recorded in `docs/research/CONFORMANCE-2026-10.md`. Its title line reads
`docs/research/CONFORMANCE-2026-10.md:1 "MEASURED (45 of 45 green, planted mutation fails 3, restored green)"`.
All three runs used one command, the engine's automation runner on the test
`MageArena.Kernel.Conformance` with a null renderer:

| Run | Vectors | Passed | Failed | Exit | Wall time |
| --- | --- | --- | --- | --- | --- |
| Green, unmodified port | 45 | 45 | 0 | 0 | 147 s (first launch after a 194 s cold build) |
| Planted fault | 45 | 42 | 3 | 255 | 18 s |
| Restored | 45 | 45 | 0 | 0 | 17 s |

n = 45 vectors per run, one planted fault, one machine, one build configuration.

The test registers one case per JSON file in the vector directory:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1336 "IFileManager::Get().FindFiles(Files"`.
The runner reported `Found 45 automation tests`, and the record says the 45 test names were
diffed against the 45 file names, so no support file was counted as a vector and none was
skipped. That is the golden-trace technique's count rule applied before the result was read.

## The planted fault

One constant in the port, the highest tier the tier clock may reach:
`apps/vr/Game/Source/MageArenaVR/Kernel/SimConstants.h:31 "inline constexpr int32 TierCap = 4;"`,
changed from 4 to 5 and rebuilt. It is a port-side fault, not a data fault, so the pin check
could not catch it: the constant is restated in C++ with its reference location beside it,
`apps/vr/Game/Source/MageArenaVR/Kernel/SimConstants.h:30 "// kernel.ts:216"`.

Three vectors failed, each at its first differing tick with a field path, which is the
replayer's error format
(`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:40 "tick %d %s %s: %s"`):

- `creature-bout`: tick 3276, pre-ops `state.eventCount`, expected 211, got 213.
- `duel-competence-1-5`: tick 3300, pre-ops `state.eventCount`, expected 346, got 348.
- `soldiers-bout`: tick 3300, pre-ops `state.eventCount`, expected 238, got 240.

All three are long mixed bouts. The fault surfaced as two extra events, not as a changed
total, which is the event log doing the work the technique gives it.

After the run the constant was put back, the file was byte-identical to the base, the
restore build and run went green, and the pin check still printed `pin OK: 9 files @ baeac66`.

## What the map says

**The vector named after the rule stayed green.** `tier-clock` is the scenario about tiers:
`apps/vr/data/conformance/tier-clock.json:3 "With no perfects, tiers unlock at 0, 15, 30 and 45 seconds."`
It runs 2700 ticks (`apps/vr/data/conformance/tier-clock.json:12 "2700"`), which is 45 seconds
at the kernel's tick rate. The fourth tier unlocks on the last tick. A fifth tier, which the
mutation allows, would come after the vector has stopped. A scenario that stops at the cap
cannot see the cap move. The technique's reading rule names this case.

**Three catching vectors prove three vectors, for one rule.** The record says so itself:
`docs/research/CONFORMANCE-2026-10.md:63 "Only one mutation was planted, and it is caught by 3 vectors."`
The other 42 are not shown to catch anything. The rule families that still have no planted
fault (air, heat, water, enemies, the mage AI) are listed there as unproven.

**The bar met is "the suite can bite".** The project plan's draft bar is
`docs/PROJECT-PLAN.md:513 "≥20 green conformance vectors plus one planted-mutation failure"`.
45 green vectors and one planted fault caught by three meet it. They do not support a claim
that the suite catches porting errors in general.

## What this realization cannot show

- The vectors were not regenerated from the reference in this run. The committed vectors
  were replayed as they are, so agreement with a fresh reference run is unmeasured.
- One fault, in one rule family. No sensitivity map exists for the other families.
- Editor build on the desktop only. No packaged build and no device.
- The durations mix a cold first launch (147 s) with warm runs (17-18 s). They are not a
  performance figure.
