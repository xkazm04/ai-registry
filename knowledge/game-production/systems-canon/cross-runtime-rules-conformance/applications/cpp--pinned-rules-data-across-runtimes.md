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

## The pin has to travel with the package

Read against `mage-arena-vr` `master` at `7daeb25`. The kernel resolves the pinned directory
from the project directory
(`apps/vr/Game/Source/MageArenaVR/Kernel/KernelData.cpp:22 "../data/pinned"`), a
location outside the packager's content tree, so a package has it only if staging says so. The
project lists it explicitly
(`apps/vr/Game/Config/DefaultGame.ini:16 "+DirectoriesToAlwaysStageAsNonUFS=(Path="`),
beside the two staging lines above it for clips and the other data directory.

At boot the kernel logs where it looked, how many files it read and the chained hash over them
(`apps/vr/Game/Source/MageArenaVR/Kernel/KernelData.cpp:719 "kernel data: pinned dir %s, %d files, SHA1 %s"`),
or, when loading fails, an error naming the directory it expected
(`apps/vr/Game/Source/MageArenaVR/Kernel/KernelData.cpp:723 "expected pinned data in %s"`). The
hash chains each file's text onto the previous hash
(`apps/vr/Game/Source/MageArenaVR/Kernel/KernelData.cpp:47 "// Chain: hash = SHA1(previous hash text + this file's text)"`),
so the order of reads is part of the value. It is a runtime fingerprint, not the manifest's
per-file hash.

Proven, recorded in the project's findings note on 2026-10-07: the Win64 editor build, the
`MageArena.Kernel.PinHash` automation test, and a Win64 package-and-stage run whose staged
output lists all 9 files named in the manifest.

Not proven: the packaged executable was not run, so the boot line has not been read from a
package. Whether the `../..` staged path resolves the same inside an Android package is
unconfirmed; the project plans to prove it on the first device package.

## What this realization cannot show

- Whether the pinned revision still matches the source project's current tables. The pin
  records what was taken on 2026-10-02, not what the source holds now. The project plan lists
  a drift alarm as a mitigation for that risk; it is not measured here.
- Whether every restated constant in the port has a vector able to fail on it.
