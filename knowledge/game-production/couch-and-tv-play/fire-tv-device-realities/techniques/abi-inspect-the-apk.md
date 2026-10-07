---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: abi-inspect-the-apk
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a package installs and then dies on the first native library load, choosing which processor architectures to build for a TV device, a build configuration lists architectures and nobody has looked at what shipped]
---

# ABI inspect the package

## The concern

Three things are called "the architecture" and they are different facts. The silicon's
instruction set, which a datasheet states; the operating system's application layer, which
decides which native libraries a process may load; and the architecture list a build was
configured to produce. A processor that can run 64-bit code may sit under an application
layer that is 32-bit only, and that combination is common on low-cost streaming sticks, where
the platform vendor kept the older userland on newer silicon. A package carrying only 64-bit
native libraries installs without complaint on such a device and fails at the first load of a
native library, with an error that reads as "library not found". The file is there. The loader
looked for the one built for the architecture it can use.

## Procedure

1. **Ship all three plausible architectures** in the first build for a new device class: the
   32-bit ARM one, the 64-bit ARM one, and the 64-bit x86 one for emulators and the occasional
   box. Package size is the cost, and a size budget can be argued later with the device's real
   answer in hand; a build that does not run on the device cannot be argued with at all.
2. **Read the architecture list out of the produced package.** A package is an archive. List
   its native-library directories and record which architecture folders exist and which
   libraries each contains. This is the step; the configuration is only an intention, and
   incremental builds, cached outputs, a library that does not build for one architecture and
   is silently dropped, and a dependency that carries its own architecture folders all make
   the artifact differ from the plan.
3. **Ask the device what it supports.** The device's property list names its primary and
   secondary application architectures, in order of preference. Record both. This is the fact
   the loader uses, and it is the one the datasheet cannot supply.
4. **Compare, and require an intersection.** The package's architectures must include the
   device's primary architecture, or a listed fallback. Compare per library, not per
   directory: a package with a 32-bit folder containing four libraries and a 64-bit folder
   containing five has a hole, and the missing library is the one that will fail.
5. **Make the comparison a gate on the install step**, with the expected architectures
   derived from the device query, not typed into the script.
6. **Re-read after every change to the native dependency set.** A new engine module or a new
   third-party library changes the architecture list without touching the configuration.

7. **Record the unit's memory beside its architecture.** The class of device with the narrow
   userland tends also to have little memory, and a native build that loads can still be
   starved; state the device's reported total with the finding so the two travel together.

## Decision rules

- **When the silicon is 64-bit, do not infer a 64-bit userland.** Read the device's
  property. The inference is the failure.
- **When the package lists an architecture the device does not support, that is not
  waste in isolation, but it is a signal**: either the build target was wrong or the device
  class changed. Report it as a finding and do not strip it silently.
- **When the device's answer is in hand and the package is being trimmed, trim openly.** Drop an
  architecture only for a stated reason, keep the one an emulator needs behind an explicit build
  switch rather than deleting it, and read the archive afterwards; the shipping-gates subject owns
  the trimming itself, this check owns the reading.
- **When the device's supported list is 32-bit only, a 64-bit-only build is a blocker,
  not a warning.** It will not run, and no later fix in game code changes that.
- **When one device reports a list, the claim is about that device.** A different model of
  the same product line may differ, and a newer platform generation may drop the older
  architecture altogether; carry that as an assumption with the model named.
- **When an install succeeds and the process dies in under a second, read the crash log's
  first native-load line before anything else.** A library that failed to load names the
  architecture it looked for, which is the whole diagnosis.

## What it does not prove

An intersection of architectures proves the loader can find libraries for this device. It does
not prove the libraries are correct, that their dependencies are present, or that the game
starts; it excludes one silent cause. Memory is a separate constraint on the same class of
device and a package that loads can still be killed for size at runtime.

## When not to use this

When the game has no native code - a pure managed or scripted build - there is no
architecture to mismatch, and the check is reduced to confirming that, by listing the
archive and finding no native-library folders. Do it once; it is cheap, and the claim "no
native code" is itself one that dependencies quietly falsify.

## Evidence status

The observed fact is one device whose application layer was 32-bit only on 64-bit silicon,
and a build that was only correct after the architectures were packaged and the package
inspected. That the three-architecture default is the right first build for the whole device
class is an authored rule, not a measured one.
