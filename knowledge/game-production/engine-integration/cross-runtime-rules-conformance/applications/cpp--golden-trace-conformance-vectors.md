---
layer: application
type: application
subject: cross-runtime-rules-conformance
technique: golden-trace-conformance-vectors
stack: cpp
status: draft
verified_on: 2026-10-16
verified_against: cpp@20
applied: code
---

# 45 vectors from the reference kernel, replayed tick by tick with checkpoints

Source tree: `mage-arena-vr` on `master` at `b7f1009` (the root of every path below). C++ port
in an Unreal Engine 5.8 project (`apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"`).
On 2026-10-16 all 45 vectors passed against build base
`0a060b78911f3294898294f241b942b5218ab7c7` (n = 45, one run, exit 0).

## Written by the reference, replayed by the port

The vector generator states the split in its first two lines:
`apps/vr/tools/conformance/oracle.mjs:1 "Runs the pinned TypeScript kernel and writes one JSON vector per scenario."`
and
`apps/vr/tools/conformance/oracle.mjs:2 "it does not re-decide these inputs."`.
Expected values come from the reference, so the suite cannot be the port agreeing with itself.

The 45 files in `apps/vr/data/conformance/` mix short single-rule scenarios (one per spell
line and step, such as `lash-1` to `lash-4` and `mire-1` to `mire-4`) with long mixed bouts
(`creature-bout`, `soldiers-bout`, `duel-competence-1-5`). Only the long bouts caught the
planted tier-cap fault; see the sibling application.

## Checkpoints, not only the end

The replayer compares state at tick 0 and before the operations of each checkpointed tick:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1281 "if (!Consume(Tick, TEXT("`.
A failure names the tick, the phase and the field
(`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:40 "tick %d %s %s: %s"`),
which is how the planted fault was reported as `tick 3276 pre-ops state.eventCount`. At the
end it checks the event log count and every event.

## The count rules

One test per file, discovered from the directory
(`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1336 "IFileManager::Get().FindFiles(Files"`),
and an empty directory fails instead of passing:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1355 "No conformance vectors in "`.
A replay that stops before the end of its vector fails on the rows it never consumed
(`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1317 "unconsumed checkpoints: %d of %d"`).

## What this realization cannot show

- Whether a vector reaches every limit it is named for. `tier-clock` stops at the tick the
  fourth tier unlocks, so it cannot see the cap change.
- Freshness against the reference. The vectors were not regenerated in the 2026-10-16 run.
- Coverage per rule family. With one planted fault, only three vectors are shown to be able
  to fail.
