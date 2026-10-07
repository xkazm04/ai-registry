---
layer: application
type: application
subject: fire-tv-device-realities
technique: startup-work-belongs-at-first-use
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# Sixty-six courses at class load, and the menu that built them all again

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21; the content core runs on a desktop JVM in tests and benches, and on
Android's runtime on one Fire TV stick (model AFTKM, 32-bit userland). The work is three commits of
2026-10-06: `54a66fcf` (lazy projection bins), `baf5181a` (finding S1, lazy courses) and `e13d7cef`
(finding S14, the aggregate-accessor fix). Desktop figures are labelled desktop; the one device
observation is labelled for what it is.

## The stall on the device

The first fix came before the optimisation wave, from the device:
`54a66fcf` "bake course projection bins lazily; eager bake of all 66 courses stalled Android startup for
minutes". The bins became a lazy property,
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:55 "by lazy(LazyThreadSafetyMode.SYNCHRONIZED) { bakeCandidates() }"`.
The duration was reported in the commit, not timed; the wave brief repeats it as "startup was minutes
until the lazy candidates fix". It is the observation that earned this reality its place.

## Courses that exist only when asked for

`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:187 "Built on first use. A course bakes a spline, obstacles, branches and junctions"`.
Each course is built behind a lock on first access,
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:195 "fun course(index: Int): Course = synchronized(built)"`,
the public list keeps its indices and builds on `get`,
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:197 "val all: List<Course> = object: AbstractList<Course>(),RandomAccess"`,
and an identifier is answered from the table of identifiers without building anything,
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:202 "fun indexOf(id: String)=ids.indexOf(id)"`.
The test holds the catalogue JSON byte-identical and the slots identity-stable,
`deathride/core/src/test/kotlin/dev/deathride/core/LazyCoursesTest.kt:10 "lazySlotsKeepIndexIdentityAndSingleInstance"`.
Desktop, `StartupBench` on a cold JVM 22, three to four runs: the `Courses.all` phase 271–308 ms → 21–24 ms,
with the first world paying about 21 ms for its own course.

## The caller in another module

The laziness was undone by code outside the content module that predated it. The network handler found
a picked track with `Courses.all.indexOfFirst`, which walks the lazy list and builds every course, and the
routes endpoint joined the whole list — the finding, S14, warned that this would move a startup stall to
the first time a phone picked a track. The fix replaced the walk with the identifier lookup and moved the
picked course's bake to the socket thread,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:257 "bake on this IO thread so the render thread only swaps"`.
Desktop: the track pick 71 ms → 0.007 ms; the picked course's cold bake 27 ms, off the render thread.

## Laziness relocates; it removes only what is never used

The wave also tried a lazy catalogue JSON and precompiled region patterns, and kept the result as a loss:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:12 "The 14 ms is Regions/CarCatalog first-touch, paid again by the first World; total unchanged"`.
What the first race needs is paid by the first race whichever way it is scheduled.

## Deviations

- **No device timing of startup.** The finding that would have timed class initialisation and the first
  bake on the stick (S16) was recorded as unmeasurable in that round; every startup figure after the
  device stall is a desktop figure. The comment above the lazy course list estimates the eager cost as
  "several seconds on a Stick", which is an estimate, not a measurement. Amazon's own target for a Fire TV app is a
  cold-start first frame under 2.0 s
  (https://developer.amazon.com/docs/app-testing/measure-kpis-fire-tv-apps.html), and nothing here shows
  whether the game meets it.
- **Two aggregate callers remain, on the preview path.**
  `deathride/core/src/main/kotlin/dev/deathride/core/TrackDraft.kt:18 "Courses.all.singleOrNull"` and
  `deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:18 "Courses.all+trackPreview.course"`
  build every course when the track-preview mode runs. The race path does not reach them.
- **The routes endpoint still builds every playable course** once, lazily, on its first request:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:314 "private val routesJson by lazy { Courses.playable.joinToString"`
  needs geometry, so it builds all 38. It runs off the render thread; on the stick it still competes with
  the render thread for the same four cores.
- **The race-start frame is a separate cost.** A 1,139–1,145 ms maximum frame at every race start,
  attributed to the stick in two runs (finding S17), survived both the lazy courses and the off-thread
  bake; it is a transition cost this technique moves but does not diagnose.

## Outside corroboration

Android's startup guidance gives the same remedy — "move to a singleton pattern where the app initializes
objects only the first time it needs them" — and counts a cold start of five seconds or more as excessive
(https://developer.android.com/topic/performance/vitals/launch-time). The television platform's target
above is less than half that threshold.
