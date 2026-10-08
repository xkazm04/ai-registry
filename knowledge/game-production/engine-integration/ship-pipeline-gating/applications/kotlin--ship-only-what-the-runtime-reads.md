---
layer: application
type: application
subject: ship-pipeline-gating
technique: ship-only-what-the-runtime-reads
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# 74 MB to 35 MB for a Fire TV package, without touching a pixel

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The Android app module is Kotlin 2.0.21 with the Android Gradle plugin 8.7.3 and
libGDX 1.13.5, packaged for Fire TV sticks. The changes are findings B1, B2 and B3 of the 2026-10-06
optimize wave (`1c823135`, `3a35efb5`, `cb0b1040`). All sizes are bytes read from the archive with
`unzip -l` on the build host; the device was used only to launch the shrunk package.

## The census of readers

`deathride/app/build.gradle.kts:29 "Runtime loads only phase2-states, story-art, regions, audio (+controller)."`
The other art bundles are read by the desktop audits and by tests, which load them from the source tree:
`deathride/app/build.gradle.kts:30 "are audit/test inputs (desktop AtlasAudit, tests read ../assets directly) and stay in the repo."`
The finding records the evidence for that sentence as the archive listing and a search of the runtime
code roots,
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-B.jsonl:1 "grep of Gradle/Kotlin runtime roots"`.
The exclusion is a packaging rule, `deathride/app/build.gradle.kts:31 "androidResources { ignoreAssetsPattern"`,
and nothing was deleted. Debug APK 74,062,061 → 41,410,447 B, −44%.

## Shrink in the shipping configuration only

`deathride/app/build.gradle.kts:16 "R8 + resource shrink for release only (debug unchanged); -PnoMinify=true opts out. Verified: starts on Fire TV, race server listens."`
The keep rules were written for what is reached by name before the first shrunk build,
`deathride/app/proguard-rules.pro:1 "natives bind to Java fields/methods by name; reflection-based ApplicationListener loading."`,
and the proof was a launch on the stick with the hosted server listening — the two paths a missing keep rule
would break first. Release 35,068,935 B against the debug package's 41,247,693 B.

## Architectures, after the device answered

`deathride/app/build.gradle.kts:3 "Fire TV is arm only; -PemulatorAbi=true keeps x86_64 for emulator builds."`
Both ARM architectures stay; the emulator's x86-64 libraries leave the package and remain one build switch
away. 41,444,451 → 41,247,693 B, −196,758 B — under half a percent, and the finding called it a tiny gain.
Its value is that the package now carries only what a Fire TV device can load, which the device-realities
subject's architecture check can confirm by reading the archive.

## Deviations

- **The shrink figure crosses configurations.** −6.18 MB is release against debug, so it includes every
  difference between the two configurations, not only R8 and resource shrinking; a release build with
  `-PnoMinify=true` is the matching baseline and was not measured.
- **The keep rules are broad.** `deathride/app/proguard-rules.pro:14 "-keep class dev.deathride.** { *; }"`
  keeps the whole game, the libGDX, Ktor, coroutine and Kotlin packages are kept wholesale, and
  `deathride/app/proguard-rules.pro:22 "-dontoptimize"` turns optimisation off. That is a safe first shrink;
  it leaves most of the code saving on the table, and narrowing it needs more than a launch as proof.
- **Launch-verified only.** The wave's ledger says so,
  `.claude/scan-history/scan-sweep.jsonl:34 "release minify launch-verified only"`; no race was played on the
  shrunk package.

## Outside corroboration

Android's guidance enables `isMinifyEnabled` and `isShrinkResources` together for release and says lint does
not see assets referenced by reflection
(https://developer.android.com/topic/performance/app-optimization/enable-app-optimization,
https://developer.android.com/topic/performance/reduce-apk-size). Amazon's guidance on architectures has
moved: its submission page (updated 2026-02-17) says to bundle only `armeabi-v7a`, while its device-filtering
page (updated 2026-05-27) says not to remove 32-bit support and to add 64-bit for newer devices
(https://developer.amazon.com/docs/app-submission/understanding-submission.html,
https://developer.amazon.com/docs/app-submission/device-filtering-and-compatibility.html). Keeping both ARM
architectures matches the newer page; Amazon's device table lists every current Fire TV stick with a 32-bit
userland (https://developer.amazon.com/docs/device-specs/device-specifications-fire-tv-streaming-media-player.html).
