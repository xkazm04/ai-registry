---
layer: application
type: application
subject: render-submission-economy
technique: prepare-off-the-render-thread-commit-on-it
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# The race-start freeze: lazy bins and region tiles moved to one worker

Source tree: `firetv-deathride` on branch `deathride/main` at `4bbae5d2`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21 on libGDX 1.13.5, where the game loop and the GL context share one
render thread. The work is two device sessions of 2026-10-07: P9, which attributed the freeze, and P10,
which removed it (`d3c68fec` bins, `0ed2537e` region tiles, `59f5605e` pick ordering). Every device figure
below is from one Fire TV stick (model AFTKM, Android 11) in **profiled** runs (`--profile`), on a host
shared with other sessions; desktop figures are labelled desktop.

## What P9 found on the frame

The 10-06 wave had left a 1.1 s maximum frame at every race start, undiagnosed. A diagnostic APK with
per-step bake timers, one 360 s profiled run, put it in one place:
`docs/concepts/deathride/P9-stick-validation.md:147 "thread, inside one bake step of the landmark section."`
The first projection onto each course built that course's lazy projection bins on the render thread:
`docs/concepts/deathride/P10-race-start-hitch.md:16 "1,138.5-2,268.3 ms per first visit and 0.056 ms on a revisit."`
P9 ruled out the two usual suspects by measurement, not assumption:
`docs/concepts/deathride/P9-stick-validation.md:149 "It is not a texture upload: upload time is 4.8-7.6 ms and those frames show 0"`
and `docs/concepts/deathride/P9-stick-validation.md:151 "It is not first-use class init: the cost recurs for every new course, grows"`.
This is the relocation the startup technique warned about: the bins were made lazy so that startup would
not pay for them, and the first visit to each course paid instead, on the frame.

## One worker, below the render thread, for the next course only

The guard stays a synchronized lazy, so whichever thread arrives first builds the value once:
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:56 "private val candidateBins=lazy(LazyThreadSafetyMode.SYNCHRONIZED) { bakeCandidates() }"`,
documented as the safety net it is,
`deathride/core/src/main/kotlin/dev/deathride/core/Tracks.kt:55 "a project() racing an unfinished bake waits on this lock"`.
The worker is a single thread two steps below normal priority,
`deathride/core/src/main/kotlin/dev/deathride/core/CoursePrewarm.kt:13 "priority=Thread.NORM_PRIORITY-2"`,
and its contract names both halves of the technique's third and fourth steps:
`deathride/core/src/main/kotlin/dev/deathride/core/CoursePrewarm.kt:9 "Only that course is ever submitted, never the catalogue: the eager bake of every course stalled Android startup."`
and `deathride/core/src/main/kotlin/dev/deathride/core/CoursePrewarm.kt:10 "Tasks run one at a time, in submission order, below the render thread's priority."`
The fire-tv-device-realities subject's priority technique explains why that level is safe on this
runtime: two steps below normal lands in the background band, below the boosted render thread.

Each decision that names the next course submits it: a phone's pick through `requestTrack`, the app's
launch course at construction while `create()` loads fonts, audio and art,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:60 "init { CoursePrewarm.submit(courseCatalog[selectedTrack]) }"`,
and the career screen for the next event,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:177 "CoursePrewarm.submit(event.courseIndex)"`.

## The render thread yields instead of waiting

The scene build checks readiness before its first projecting stage and gives back whole frames until the
worker is done:
`deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:204 "give back whole frames until they are ready"`,
`deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:208 "while(!course.projectionReady){binWaitFrames++;yield(Unit)}"`.
The same comment states the condition that keeps the render thread off the guard: the simulation and the
countdown wait for this scene, so nothing else projects onto the course first. The wait is counted in
frames and milliseconds, so a missed path shows up as a number rather than as a freeze.

## Proof that the prepared value is the lazy one

`deathride/core/src/test/kotlin/dev/deathride/core/CoursePrewarmTest.kt:16 "prewarmedProjectionEqualsTheLazyPathOnFixedPoints"`
projects 1,200 fixed points per course both ways and compares raw bits,
`deathride/core/src/test/kotlin/dev/deathride/core/CoursePrewarmTest.kt:34 "assertEquals(want.s.toRawBits(),got.s.toRawBits()"`,
and asserts its own input size, so an empty course list cannot pass it:
`deathride/core/src/test/kotlin/dev/deathride/core/CoursePrewarmTest.kt:41 "assertEquals(ids.size*1200,checked)"`.

## Result on the stick

Render-thread first projection per course, four profiled 360 s runs over two APKs:
`docs/concepts/deathride/P10-race-start-hitch.md:112 "The bins were always ready before the scene needed them (bin wait 0 in 24 of 24 bakes)."`
The first projection fell from 1,138.5–2,268.3 ms (P9 diagnostic, n = 5 first visits) to 0.034–0.389 ms
(P10, n = 20 first visits plus four revisits), and a later confirmation run on the final APK read
0.033–0.386 ms. The transition maximum fell with it:
`docs/concepts/deathride/P10-race-start-hitch.md:93 "The transition max falls from 2,272.8-2,376.9 ms (P9) to 245.8-374.4 ms."`

## The texture switch: the render thread only uploads

With the bins gone, the track switch was the slowest request not caused by a save, and only a small part
of it needed the context:
`docs/concepts/deathride/P10-race-start-hitch.md:149 "was GL upload. Its non-GL work is the materials manifest, each candidate's SHA-256, the PNG header check"`.
`0ed2537e` moved that work onto the same worker, after the bins and before the pick is queued:
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:156 "A region tile resolved, hash-verified, size-checked and decoded off the render thread; [selectRegion] only uploads it."`
The render thread takes the preparation only if it matches what it is selecting,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:199 "val ready=prepared.get()?.takeIf{it.selection==selection && prepared.compareAndSet(it,null)}"`,
and any mismatch falls through to the old synchronous path. The checks moved with the work: the header
size check runs before the decode on the worker,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:182 "The IHDR size is checked before a pixel is decoded (I2)"`,
and the residency check stays with the upload,
`deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:189 "require(textureBytes+tile.bytes+extraBytes()<=minOf(TextureBudget.ART,residentLimit))"`.
Stick, profiled: `selectRegion` on a switch 61.4–117.1 ms wall (fix APK, two runs; 4.0–6.9 ms of it GL
upload) to 5.8–16.5 ms (prep APK, two runs, ten switches), and the whole track request
`docs/concepts/deathride/P10-race-start-hitch.md:170 "request fell from 81.6-169.0 ms (fix runs; four of ten switches were over 100 ms) to 23.2-71.7 ms, so after"`.

## The regression the move created: a dropped pick

Making the pick asynchronous opened a window in which a later command could overtake it:
`docs/concepts/deathride/P10-race-start-hitch.md:57 "With the bake on a worker, a pick is queued 0.1-2.3 s after it is sent."`
and `docs/concepts/deathride/P10-race-start-hitch.md:58 "sent inside that window ran first, and the pick, landing in the countdown, was dropped"`.
The race started on the old course. `59f5605e` made the render thread hold every queued command while a
pick is in flight,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:337 "A pick still on the course worker holds the queued commands (start, lobby, garage, career) until it lands."`,
and wrote the read order down where the next maintainer will look:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:90 "Read it BEFORE taking [trackRequest]: a pick"`.
A newer pick supersedes an older one by ticket,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:99 "if(trackTicket.get()==ticket)"`, and
`deathride/link/src/test/kotlin/dev/deathride/link/TrackRequestTest.kt:61 "only the newest pick is queued, and its bins (and every branch's) were baked when it was"`.
One confirmation run on the final APK logged all six picks before their race start.

## Why the bake is not in the receive loop

The earlier fix (`e13d7cef`, 10-06) had moved the course build onto the phone connection's thread. The
bins were deliberately not put there:
`docs/concepts/deathride/P10-race-start-hitch.md:39 "receive loop, and a 1-2 s Stick bake there would have held that phone's inputs past the stale-input"`.
The request hands off and returns,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:94 "(a phone's receive loop must keep acknowledging inputs through a 1-2 s Stick bake)"`,
and `deathride/link/src/test/kotlin/dev/deathride/link/TrackRequestTest.kt:50 "jsonPrimitive.boolean"`
holds the worker and checks that an input is still acknowledged while two picks wait. This is a design
decision with a stated reason, not a measured incident: no run put the bins in the receive loop.

## Deviations

- **The render thread's wait has no bound.** The yield loop quoted above,
  `deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:208 "while(!course.projectionReady)"`,
  waits until the bins are ready, with no timeout; read from the code, a bake that threw would leave the scene yielding with
  nothing reported. The request path does settle on failure
  (`deathride/link/src/test/kotlin/dev/deathride/link/TrackRequestTest.kt:81 "a failed preparation still settles"`);
  the scene path does not. Not observed in any run.
- **A superseded pick still bakes to the end.** The single worker has no cancellation, so a quick change of
  mind makes the newest pick wait behind the old one's 1–2 s bake:
  `deathride/link/src/test/kotlin/dev/deathride/link/TrackRequestTest.kt:63 "the superseded pick still baked, off the render thread"`.
- **Prepared bins are never released.** `docs/concepts/deathride/P10-race-start-hitch.md:191 "Bins persist for every course a process visits, so a five-course"`
  soak holds about 10.2 MiB of them (desktop JVM estimate, not a device reading); unattributed against
  P9's 47.7 MiB rise in PSS.
- **The prepared path holds decoded pixels beside resident textures.** The comment above `selectRegion`
  still reads `deathride/game/src/main/kotlin/dev/deathride/game/AtlasArt.kt:194 "Release the old slot BEFORE decoding its replacement."`,
  which is true of the synchronous path only. The extra peak is at most four 256-pixel tiles (about 1 MiB,
  computed from the tile edge, not measured).
- **Texture equality is argued, not tested.**
  `docs/concepts/deathride/P10-race-start-hitch.md:175 "pixel equality of the prepared path was not re-checked on desktop"`;
  it rests on the identical texture-data construction and identical candidate bytes on the stick.
- **Thin comparisons.** One run per APK for P9's diagnostic, two per APK for P10, on a host at 96–100% CPU;
  no repeated-measures variance. The launch course is still selected synchronously at app start (73.4–127.9 ms).
- **The bar still fails, for a different reason.**
  `docs/concepts/deathride/P10-race-start-hitch.md:91 "The 1.1-2.3 s freeze is gone"`, but every switch keeps
  a profile save over 100 ms on the render thread; that cost is the fire-tv-device-realities subject's
  `price-the-durable-save-on-the-device`, attributed and deliberately not fixed.

## Outside corroboration

The engines this class of game is usually built on split the same way. Unity's asynchronous upload pipeline
keeps only the upload on the render thread and slices it — "time-sliced asynchronous texture and mesh data
uploads on the render thread" (https://docs.unity3d.com/ScriptReference/QualitySettings-asyncUploadTimeSlice.html) — and Unreal's
pipeline precaching will "Skip the draw until the PSO is ready" rather than stall
(https://dev.epicgames.com/documentation/en-us/unreal-engine/pso-precaching-for-unreal-engine). The same Unreal
page warns that background compilation on "75 percent of hardware threads" contends with foreground threads
and causes frame drops, the case for one worker rather than a pool. Android's threading guidance warns that a
thread priority "set too high" can "interrupt the UI thread and RenderThread, causing your app to drop frames"
(https://developer.android.com/topic/performance/threads). Meta's write-up on Unity scene loading shows the
commit step is where an asynchronous load still hitches — activating a loaded scene gives "one very long frame"
because "All lifecycle methods execute on the main thread"
(https://developers.meta.com/vr/blog/avoiding-hitches-when-loading-scenes-in-unity/).

**Headsets.** Meta's asset-streaming guidance for Quest says to load full fidelity only "when there is the
potential for the player to interact with them" and "don't try to cram all the expensive work into a single
frame" (https://developers.meta.com/vr/documentation/unity/po-assetstreaming/); OpenXR's Android thread hints
separate `APPLICATION_WORKER` ("background CPU tasks") from `RENDERER_MAIN`
(https://registry.khronos.org/OpenXR/specs/1.1/man/html/XrAndroidThreadTypeKHR.html); and a missed frame is
re-displayed with rotation-only correction, so "users may notice slight positional drift"
(https://developers.meta.com/horizon/documentation/unity/os-missed-frames/). The qualification is Meta's too:
its frame-rate check states that apps "are not required to maintain their rendering rate when a loading screen
or full-screen fade is present" (https://developers.meta.com/horizon/resources/vrc-quest-performance-1/), and its
compositor-layer guidance shows a loading layer kept at full rate while the application misses frames
(https://developers.meta.com/horizon/documentation/unity/os-compositor-layers/). So on a headset this technique
is required for first-use work inside a live scene and optional behind a compositor loading layer. There is
no Death Ride VR or XR build, and nothing in this application was measured on a headset.
