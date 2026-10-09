---
layer: application
type: application
subject: fire-tv-device-realities
technique: price-the-durable-save-on-the-device
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# A profile save that gates the race ticket, priced on the stick and left where it is

Source tree: `firetv-deathride` on branch `deathride/main` at `4bbae5d2`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21; the save code is in the platform-independent core and runs on
Android's runtime on one Fire TV stick (model AFTKM, Android 11). The figures come from the P10 session of
2026-10-07: four **profiled** 360 s runs over two APKs plus one confirmation run, on a host shared with
other sessions. This application records a measured constraint and its alternatives. **Nothing here was
fixed**, and nothing here recommends a fix: where the save runs is an open owner decision on the money path.

## The save does everything the technique lists

`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:125 "fun save(profile: Profile) {"`
encodes and verifies the new state before touching storage,
`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:129 "ProfileCodec.decode(encoded,profile.id) // Never replace a valid save with invalid state."`,
writes and flushes a temporary file,
`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:130 "FileOutputStream(temporary).use { it.write(encoded.toByteArray(Charsets.UTF_8));it.fd.sync() }"`,
re-reads and verifies the old save before it becomes the backup,
`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:132 "if(runCatching { ProfileCodec.decode(main.readText(),profile.id) }.isSuccess)main.copyTo(backup,overwrite=true)"`,
sets a corrupt one aside instead of backing it up,
`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:133 "if(!corrupt.exists())main.copyTo(corrupt)"`,
and replaces the file by an atomic move. The load side uses the backup:
`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:122 "Recovered previous save"`.
The upward lesson for the draft was the verify-before-backup step: a backup that is never checked can
preserve the corruption it was meant to recover from.

## The save gates the change

The caller applies the change only after the save has succeeded, and a failed save cancels it:
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:129 "if(runCatching{profileStore.save(updated)}.isFailure)"`
(the player is told "Save failed - change cancelled"), and only then
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:131 "profiles[i]=updated;"`.
The race ticket is issued inside such an edit,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:309 "if(editProfile(i){ticket=Economy.start(it)})"`,
so a seat's ticket is recorded for the race only if the save that recorded it completed. That is the contract the
technique's second step asks to be named before any alternative is weighed, and it is why the source calls
this the money path:
`docs/concepts/deathride/P10-race-start-hitch.md:141 "to a writer thread changes when a save is known to have happened, which is an owner decision (see"`.

## What it costs on the stick

The P10 request timers (one log line per save, not per frame) give the price on the render thread:
`docs/concepts/deathride/P10-race-start-hitch.md:121 "| 49.5-133.3 | 51.6-123.6 | 60.0-156.1 | 56.2-121.3 |"`.
That is 49.5–156.1 ms per save, min–max per run over four runs, each followed by a garage publish of
8.2–58.3 ms; a race start, which saves twice, cost 144.5–366.5 ms. The confirmation run read 50.2–107.7 ms
per save. The source states the placement plainly:
`docs/concepts/deathride/P10-race-start-hitch.md:138 "That durability work on the Stick's flash costs 50-156 ms, on the render thread, for every"`.
One settle at a race finish ran its two saves inside the simulation step and charged 231.6 ms to the
simulation phase:
`docs/concepts/deathride/P10-race-start-hitch.md:134 "two saves run inside the sim block."`
After P10 removed the course bake, these saves are what is left over 100 ms in every lobby-to-race switch
(41–43 failing windows per run against P10's bar), and the source declines to move them:
`docs/concepts/deathride/P10-race-start-hitch.md:139 "**This is not fixed here.**"`.
The finding card keeps it open as backlog with the same reason:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-S.jsonl:18 "moving it to a writer thread changes when a save is known to have happened, which is an owner decision"`.

## The alternatives, laid out for the owner

Each is the technique's list applied to this save; none was built or measured.

| Alternative | What the frame gains | What the money path risks |
|---|---|---|
| Keep it synchronous, move it to a covered moment | The stall lands under a transition cue; a car pick in the garage has none today | Nothing to durability; P10's bar counts transition frames too, so it would still fail |
| Worker writes, the transition waits for the result | No save on a frame; the countdown holds until the ticket save reports success | The gate is kept; a second edit to the same profile must queue; the transition lengthens by the save |
| Worker writes, the game carries on | No save on a frame and no wait | A ticket or settled cash the player has seen can be lost to a kill before the write reaches the system, or to a power cut before the flush; a failed write can no longer cancel the change |
| Cheaper save | Fewer storage operations per save (verify read-back, backup read and copy, one flush per batch) | Each removed step was a protection: against a bad encode, a corrupt backup, a lost update |
| Append a record per change | One short write per change | A new format and replay code on the money path |

## Deviations

- **The save is timed as one number.** `deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:132 "saveMs="`
  covers the whole sequence; the technique's first step asks for each storage step separately, so whether
  the flush, the backup read or the copy dominates on this flash is unmeasured.
- **A save inside the simulation step** is charged to the simulation phase by the phase profile; the request
  timer names it, the phase split does not.
- **The atomic move has a non-atomic fallback**,
  `deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:136 "catch(_: AtomicMoveNotSupportedException)"`,
  and the directory entry is not flushed after the rename; whether either matters on the stick's filesystem
  was not tested. No power-cut or kill-mid-save recovery test was found in the sources read.
- **Thin sample.** Min–max per run over four profiled runs and one confirmation run on one stick, host at
  96–100% CPU; no distribution per save, no unprofiled run.

## Outside corroboration

Storage access on this operating system is "usually fast" with rare, much slower cases caused by other
processes' I/O (`StrictMode` Javadoc,
https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/os/StrictMode.java).
A barrier-enabled I/O stack study measured one `fsync()` on UFS phone storage at about 1.2 ms median with a
99.99th percentile of 33 ms (https://ar5iv.labs.arxiv.org/html/1711.02258, Table 1), so the stick's 50–156 ms
is a multi-operation save on cheaper eMMC-class flash, not the price of one flush; stock Android's SQLite at 39
durable inserts per second (https://www.usenix.org/conference/atc13/technical-sessions/presentation/jeong) is
the same order of cost per durable write. Android's own `AtomicFile` writes, syncs and renames with no backup
copy (https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/util/AtomicFile.java).
The write-behind risks are documented too: `SharedPreferences.apply()` commits in memory "immediately but starts
an asynchronous commit to disk and you won't be notified of any failures"
(https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/java/android/content/SharedPreferences.java),
and its pending `fsync()` calls block the UI thread at the next pause
(https://android-developers.googleblog.com/2020/09/prefer-storing-data-with-jetpack.html); SQLite separates a
process crash, which loses nothing handed to the system, from power loss, which can roll a commit back
(https://www.sqlite.org/pragma.html).

**Headsets.** On Meta's standalone headsets an unmounted headset sends a pause after the auto-sleep delay
(https://developers.meta.com/horizon/documentation/unity/unity-lifecycle/), paused background processes are
killed first under memory pressure (https://developers.meta.com/horizon/resources/reduce-app-crashes/), and a
missed refresh re-displays the previous frame as a stale frame
(https://developers.meta.com/horizon/documentation/unity/os-missed-frames/). The constraint's mechanism
transfers; its size does not, because no headset storage timing was found or taken. There is no Death Ride VR or
XR build and no headset evidence of any kind behind this application.
