---
layer: application
type: application
subject: cross-runtime-rules-conformance
technique: pinned-rules-data-across-runtimes
stack: cpp
status: draft
verified_on: 2026-10-16
verified_against: cpp@20
applied: code
---

# Nine pinned files, a hash check on both sides, and the constants the pin cannot reach

Source tree: `mage-arena-vr` on `master` at `b7f1009` (the root of every path below). C++ port
in an Unreal Engine 5.8 project (`apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"`).
On 2026-10-16 the pin check printed `pin OK: 9 files @ baeac66` before and after the
conformance runs against build base `0a060b78911f3294898294f241b942b5218ab7c7`.

## The pin

The manifest names the source revision:
`apps/vr/data/PINNED.json:3 "baeac6641790dcf526ec6d3bde35985553f84028"`,
and records a hash and a byte count per file. The check fails on any hash difference
(`apps/vr/tools/check-pin.mjs:129 "sha256 mismatch: ${rel}"`), and it carries a self-test that
dirties a byte and expects to be told
(`apps/vr/tools/check-pin.mjs:174 "const detected = !dirty.ok && dirty.errors.some("`).

## The generator reads only pinned bytes

Before the reference kernel writes a vector, every data file it compiles from is checked
against the manifest:
`apps/vr/tools/conformance/generate.mjs:98 "if (sha256(bytes) !== row.sha256 || bytes.length !== row.bytes) {"`.
A file the generator reads that the manifest does not list is a failure
(`apps/vr/tools/conformance/generate.mjs:95 "which is not in PINNED.json"`).

## Where the pin stops

Some rules are constants restated in the port, not data loaded from the pin. Each carries its
reference location, for example
`apps/vr/Game/Source/MageArenaVR/Kernel/SimConstants.h:30 "// kernel.ts:216"` above the tier
cap. The pin check cannot see a wrong value there. The planted fault in the sibling
application changed exactly that constant: the pin stayed green and the vectors caught it.

## What this realization cannot show

- Whether the pinned revision still matches the source project's current tables. The pin
  records what was taken on 2026-10-02, not what the source holds now. The project plan lists
  a drift alarm as a mitigation for that risk; it is not measured here.
- Whether every restated constant in the port has a vector able to fail on it.
