---
layer: application
type: application
subject: adaptive-fidelity-tiers
technique: measurement-settle-budget
stack: kotlin
status: forged
verified_on: 2026-10-22
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Measurement settle budget: the session-long frame sampler in Death Ride

Death Ride is a libGDX racing game for a TV stick with phones as controllers. It lives
in xkazm04/firetv, which is public, and was read on branch `deathride/main` at
`2d9518b5`. The witness for `verified_against` is `kotlin = "2.0.21"` in
`deathride/gradle/libs.versions.toml:3`. This is the subject's first application outside
React. It is also its first seam where a per-frame sampler runs all session and no
fidelity tier exists at all. The seam was chosen to falsify the technique: the
technique's use-when line, "a per-frame sampler is running for the whole session",
matches this seam exactly, so it predicts the sampler should be given a deadline. The
experiment asked whether that prediction holds.

## The seam

`RaceGame.render()` (`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:352`)
computes each frame's interval and calls `server.metrics.frameMs.add(actual*1000,now)`
on every frame, in every build, for the whole process lifetime. `Distribution`
(`deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:6-31`) is a fixed
4096-row ring of values and timestamps plus a 0.1 ms lifetime histogram. `add` is
synchronized and does a constant amount of work. `json`, served by `GET /stats`
(`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:180`), sorts the last ten seconds into a scratch array that is reused
under the same lock. The file's own comment at `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:14-15` records that a fresh
32 KB array per read was once a large allocation made while the render thread waited.
The project has already priced the *reader* side, and it keeps the *writer* side
permanent. Nothing in the tree says that the permanence is deliberate.

Quoted anchors, checkable against the tree at `2d9518b5`:

- deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:352 "server.metrics.frameMs.add(actual*1000,now)"
- deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:17 "@Synchronized fun add(valueMs: Double, nowMs: Double)"
- deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:14 "Sort scratch for [json], reused under this lock"
- deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:180 "call.respondBytesWriter(ContentType.Application.Json"
- deathride/game/src/main/kotlin/dev/deathride/game/FrameProfiler.kt:5 "the normal build does not call them"

## The two arms

- **A (as is):** the sampler records every frame, all session.
- **B (the technique applied):** the sampler stops at a wall-clock deadline from its
  first sample. The technique asks for "long enough to comfortably span the
  application's early load and its first real interaction", which is taken here as
  60 s.

**Target**, the number the technique says will move: the per-frame cost of the sampler.
**Floor**, the number that must hold: the project's ability to see a frame over
100 ms at a race transition. That is the measurement the project's own optimize card
used to find its race-start hitch and to verify each fix for it.

## What was read

**Target.** The project's built `link.jar` is newer than the last change to
`Metrics.kt`. Driving its `Distribution.add` from a JVM harness, with 2M calls per
repetition and the best of 10 repetitions after 5 warm-ups, gave **5.6-5.7 ns per call**
across three runs on a desktop JIT (Zulu 22). `json` took 43-46 us per call. The stick's
ARM core is slower. Even at 50x, the write is about 0.3 us, which is 0.002% of a 16.7 ms
frame. The write runs inside a frame callback the game runs anyway, so arm B cancels no
wake-up. The technique names the wake-up as "most of the cost", and here there is no
wake-up to remove.

**Floor.** The project keeps five paired 360 s stick runs of its P10 card
(`deathride/evidence/perf/p10/{prep,fix,final}-run*/p10-readings.json`). Each holds the
`/stats` windows over 100 ms, tagged by round, and the profiler's frames over 100 ms,
timestamped from startup. Six race starts were replayed against a 60 s deadline from the
first recorded frame:

| run | race starts with a >100 ms window | first one after startup | visible under B |
| --- | --- | --- | --- |
| prep-run1 | 6 | 33 s | 1 of 6 |
| prep-run2 | 6 | 32 s | 1 of 6 |
| fix-run1 | 6 | 25 s | 1 of 6 |
| fix-run2 | 6 | 35 s | 1 of 6 |
| final-run1 | 6 | 26 s | 1 of 6 |

The other five bursts in every run (maxima of 155-258 ms) arrive 83-368 s after
startup. Across runs, 25-30 of 34-40 render frames over 100 ms fall after the deadline.
Under B, the card's evidence would have shown one hitch per session, and the course-bin
fix that took the transition maximum from about 2.3 s to 246-374 ms could not have been
measured past the first course.

## Verdict

**not-better.** The target moved by a few nanoseconds per frame, which no frame budget
can see. The floor fell from 6 of 6 race starts visible to 1 of 6. No product code was
changed. The finding went into the technique instead: a whole-session sampler whose
reader is a pulled diagnostic, not a fidelity decision, is the boundary where the settle
budget inverts. The technique gained a section that says so.

## What the tree's shape says

The project already applied the rest of the technique without naming it. The reader is
pulled, not pushed. Its aggregation is paid only on request, and its scratch buffer is
retained so it does not allocate under the writer's lock. The sampler is also split by
cost: the heavy per-phase profiler (`FrameProfiler`, 40 columns, platform counters) runs
only in the debuggable perf package (`deathride/game/src/main/kotlin/dev/deathride/game/FrameProfiler.kt:5`, "the normal build does not
call them"), while the always-on half is the cheap ring. That is the split the amendment
asks for, built by a team that never read it. The one gap is a statement. The
always-on sampler does not say that it is permanent on purpose, and the amendment asks
for that statement where the sampler is defined.

## What this cannot show

The write cost was measured on a desktop JIT, not on the stick. The 50x factor is a
generous bound, not a reading. Lock contention between `add` and a `/stats` read was
not measured on the stick: the read happens about once a second and holds the lock for
tens of microseconds on desktop. The floor replay uses the project's recorded runs and
does not re-run the game. A fidelity tier added to this game later would be a decision
probe, and the settle budget would apply to it.
