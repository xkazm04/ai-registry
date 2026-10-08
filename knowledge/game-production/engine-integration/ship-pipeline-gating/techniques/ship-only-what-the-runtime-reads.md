---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: ship-only-what-the-runtime-reads
status: forged
laws: [declaring-an-input-is-not-consuming-it, structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a distributable is over its size budget or growing, audit or test material lives beside runtime content in the asset tree, turning on code and resource shrinking for a shipping build, the package carries native code for architectures the target device cannot run]
---

# Ship only what the runtime reads

## The concern

The size gate says a distributable is too large or growing; it does not say what to take out. The
largest and safest cut is almost never compression. It is content and code that the shipped game never
reads: reference bundles kept for an audit, fixtures for a test, alternative art sets a review compared,
native libraries for architectures the target device cannot load, classes only the development build
reaches. They are in the package because the packaging rule includes a whole directory, and a file in the
package is indistinguishable, from the packaging side, from one the game depends on. The question that
finds them is not "what did we put in" but "what does the running game open" — a census of readers, not
of writers ([declaring-an-input-is-not-consuming-it](../../../_laws.md#declaring-an-input-is-not-consuming-it)).

## Procedure

1. **List the package's contents with sizes.** The artifact is an archive; read it, per directory and per
   file, largest first. The build configuration is an intention, the archive is the fact.
2. **Find the runtime's readers for each large group.** Search the runtime code roots — not the tools, not
   the tests, not the audits — for every load of each bundle or directory. A group with no runtime reader is
   a candidate; a group read only by an audit or a test belongs to that audit or test and is reached from the
   source tree, not from the package.
3. **Exclude by a packaging rule, not by deletion.** The audit material stays in the repository where its
   readers are; the packaging rule names the pattern it excludes and says why. Deleting tracked evidence to
   shrink a package destroys the thing the audit exists to check.
4. **Shrink code and resources in the shipping configuration only.** Enable the shrinker for the shipping
   build and leave the development build as it was, so diagnosis and stack traces stay readable where they
   are needed. Write keep rules for everything reached by reflection or by name — serialisers, plugin
   loaders, network handlers registered by string — before the first shrunk build.
5. **Prove the shrunk package starts and serves.** A shrinker that removed a class reached only by reflection
   produces a package that builds, installs and dies on first use of that path. Launch the shrunk package on
   the target device and exercise the paths the keep rules protect — the game reaches its first screen, the
   hosted server listens — before calling the shrink done
   ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
6. **Trim architectures after the device has answered.** Once the target device class's loadable
   architectures are known from the device itself, the shipping build drops those no device in the class
   can use; an architecture needed only by an emulator stays available behind an explicit build switch
   rather than in every package. Read the store's own architecture guidance before trimming further: a
   platform can ask for an architecture today's units cannot load, because its next units will, and can
   forbid dropping one that today's units need.
7. **Measure each cut on one basis.** Before and after the same packaging step, same configuration, bytes
   from the archive. A cut that is only available in the shipping configuration is measured as shipping
   without it against shipping with it ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When a large group has no runtime reader, exclude it and record the census.** The search that found no
  reader is the evidence; keep the command and its result with the change.
- **When a group is read by the runtime only on a path nobody exercises, it is still read.** Remove the path
  first, then the content; never the other way round.
- **When the shrinker is enabled, the launch on the device is part of the change.** A shrunk build verified
  only by compiling is unverified.
- **When the only available comparison crosses configurations, say so.** A development package against a
  shipping one attributes every configuration difference to the shrinker; report it as that comparison, or
  build the shipping configuration twice.
- **When an architecture is dropped, read the package afterwards.** The architecture list of the produced
  archive is the fact; a configuration change that did not reach the archive changed nothing.

## When not to use

When the package is far under every external constraint and growth is flat, hunting for unread files costs
more than it saves. And where content is streamed or downloaded on demand, the census applies to the
streamed set and the size that matters is the first download, not the archive.

## Evidence status

From one project: audit-only art bundles excluded from the package removed nearly half of its bytes,
release-only shrinking was verified by a launch on the target device, and dropping an emulator architecture
saved a small fraction. The order of the procedure is authored; the cuts are measured on one package.
