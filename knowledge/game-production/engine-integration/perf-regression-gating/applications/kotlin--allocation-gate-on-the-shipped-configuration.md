---
layer: application
type: application
subject: perf-regression-gating
technique: allocation-gate-on-the-shipped-configuration
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# From the oval without combat to two real courses with six armed cars

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21; the simulation core is tested on a desktop JVM, and the shipped game
runs on Android's runtime on a Fire TV stick. The gate was added in `2af3e390` on 2026-10-06, as finding
S8 of that day's optimize wave, while five other changes were reshaping the step it guards.

## What it replaced

`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:8 "The only per-step allocation test ran the oval without combat."`
That test certified a scenario the game does not ship. The new one says what it is for in its header,
`deathride/core/src/test/kotlin/dev/deathride/core/SimAllocationTest.kt:7 "must stay allocation-free per step, not just the oval"`,
and runs two playable courses, six cars with real classes, rival styles and Pro skill, combat on.

## The window and the instrument

Warm-up first, `deathride/core/src/test/kotlin/dev/deathride/core/SimAllocationTest.kt:17 "repeat(9000){w.step(input)}"`,
then the measured window, `deathride/core/src/test/kotlin/dev/deathride/core/SimAllocationTest.kt:19 "repeat(6000){w.step(input)}"`,
read with the per-thread allocated-bytes counter before and after, and a threshold stated against that
window, `deathride/core/src/test/kotlin/dev/deathride/core/SimAllocationTest.kt:22 "assertTrue(bytes<4096"`.
On landing the two courses measured 144 B and 0 B over the 6,000 warmed steps (desktop JVM, 2026-10-06,
one run each). The five step optimisations that landed the same evening were held to it.

## The compiler that hid an allocation

The project had already learned why the host compiler cannot be trusted with this gate. In the P4 audio
work, `docs/concepts/deathride/P4-render-allocation.md:24 "An initial allocation test passed with escape analysis but a later run exposed"`
64 bytes per update; the fix made the test pass with the analysis off
(`docs/concepts/deathride/P4-render-allocation.md:27 "-XX:-DoEscapeAnalysis"`), and the failed log was
kept. The switch exists as an evidence init script,
`deathride/evidence/perf/p4/no-escape-analysis.gradle.kts:2 "configureEach { jvmArgs("`.

## Deviations

- **The default gate runs with escape analysis on.** The core test task is
  `deathride/core/build.gradle.kts:5 "tasks.test { useJUnitPlatform()"` with no JVM flag; the
  escape-analysis-off configuration is applied only when someone passes the init script. The gate the
  pipeline runs can still be satisfied by the desktop compiler removing an allocation the device's runtime
  may keep.
- **An unsupported counter passes.** The test returns early when the allocation counter is unavailable,
  `deathride/core/src/test/kotlin/dev/deathride/core/SimAllocationTest.kt:11 "if(!bean.isThreadAllocatedMemorySupported)return"`,
  and a JUnit test that returns is green. That is an instrument with no input reporting a pass; it should
  be an assumption failure, reported as skipped.
- **The scenario is not proven to have happened.** The test asserts bytes, not what ran: no count of
  contacts, shots or ability triggers in the window. The same repository's collision golden does assert
  contact counts, so the pattern is available.
- **The render thread has no gate.** Render-side allocation is measured by a soak audit on the desktop
  (4,971 B per frame across the render chain after the R6 change), not held by a test.

## Outside corroboration

HotSpot's server compiler runs escape analysis by default and removes scalar-replaceable allocations,
and `-XX:-DoEscapeAnalysis` turns it off
(https://docs.oracle.com/javase/8/docs/technotes/guides/vm/performance-enhancements-7.html,
https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html). ART's optimizing compiler also
eliminates allocations of non-escaping objects in its load-store elimination pass
(https://android.googlesource.com/platform/art/+/refs/heads/main/compiler/optimizing/load_store_elimination.cc),
so the claim is not that the device eliminates nothing; it is that the two compilers do not eliminate the
same set, which this repository observed once and which the gate should not depend on.
