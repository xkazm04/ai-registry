---
layer: application
type: application
subject: cross-runtime-rules-conformance
technique: declared-numeric-tolerance
stack: cpp
status: draft
verified_on: 2026-10-16
verified_against: cpp@20
applied: code
---

# A tolerance written in every vector, and a ceiling the replayer will not cross

Source tree: `mage-arena-vr` on `master` at `b7f1009` (the root of every path below). C++ port
in an Unreal Engine 5.8 project (`apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"`),
replaying vectors written by a pinned TypeScript reference kernel. The suite that enforces
this ran 45 of 45 green on 2026-10-16 against build base
`0a060b78911f3294898294f241b942b5218ab7c7`; see the sibling application on the planted fault.

## Declared in the vector, by the reference

The generator writes one tolerance for every vector:
`apps/vr/tools/conformance/oracle.mjs:39 "const TOLERANCE = { relative: 1e-6, absolute: 1e-9 };"`.
It lands in each file, for example `apps/vr/data/conformance/tier-clock.json:8 "tolerance"`,
so the expectation and its tolerance travel together.

## Enforced by the port, with a ceiling

The replayer reads the tolerance from the vector and refuses a vector without one
(`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1045 "tolerance is missing"`).
It then refuses any vector looser than the ceiling:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:1048 "if (!(Check.Rel <= 1.0e-6) || !(Check.Abs <= 1.0e-9))"`.
Editing a vector file to admit a failing value therefore fails the vector instead of passing
it. That is the ceiling the technique asks for.

The comparison is identity first, then the absolute floor, then the relative bound against
the larger magnitude:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:53 "return Diff <= Abs || Diff <= Rel * Scale;"`.

## Exact fields stay exact

Integer fields go through a separate path that rounds the stored number, fails when it is not
integral, and then compares exactly:
`apps/vr/Game/Source/MageArenaVR/Tests/KernelConformanceTests.cpp:90 "not an integer"`.
Booleans and strings compare exactly too. Event kinds and ticks go through those paths, which
is why the planted tier-cap fault surfaced as an exact `eventCount` mismatch rather than as a
toleranced drift.

## What this realization cannot show

- How the tolerance was chosen. Nothing in the tree records a measured largest difference
  between the runtimes, so the margin between the observed differences and 1e-6 / 1e-9 is
  unmeasured. The technique's procedure step 2 is not yet done here.
- Whether any vector sits on a threshold boundary that a rounding difference could flip. No
  failure of that kind has been recorded.
- The port's task card forbids loosening the tolerance silently
  (`apps/vr/tasks/T06-kernel-port.md:55 "do not loosen the tolerance silently: report the divergences."`).
  That is a rule for the worker. The ceiling in the replayer is what enforces it.
