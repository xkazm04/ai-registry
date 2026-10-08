---
layer: application
type: application
subject: phone-controller-input-protocol
technique: send-on-change-with-a-heartbeat-floor
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# Death Ride's display stream: one frame a second when nothing moves

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The host is a Kotlin 2.0.21 program on a Fire TV stick serving a WebSocket over
Ktor; the controller is one browser page it serves. The changes are the link context of the 2026-10-06
optimize wave (findings L2, L3, L4, L5, L12, L13). Every figure below was measured on a desktop: the
`LinkBenchTest` real-socket bench, or the controller page in desktop Chrome against the `FakeHost`
stand-in. No physical phone and no stick were in the loop; the byte and frame counts transfer, the page
milliseconds are a desktop browser's.

## Compare, then send — or wait for the floor

`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:197 "an unchanged snapshot is not resent (only a 1 s heartbeat)"`.
The host builds each tick's display snapshot into one of two reused builders and sends only when
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:212 "now-lastSentMs>=HUD_HEARTBEAT_MS || !sameChars(cur,last)"`,
with the floor at `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:317 "const val HUD_HEARTBEAT_MS=1000.0"`.
Numbers go out fixed-point at the precision the page shows,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:207 "appendFixed(s.speed,2)"`. The test
holds both halves of the contract, a quiet stream that is heartbeat only and a change that is sent at once:
`deathride/link/src/test/kotlin/dev/deathride/link/HudPayloadTest.kt:26 "anIdleSnapshotIsHeartbeatOnlyAndAChangeIsSentAtOnce"`.
Idle, per phone, per 10 s: 92 frames and 9.3 KB/s before, 12 frames and 3.5 KB/s after (`81e1c244`).

## The slow block, on a reliable socket

`deathride/link/src/main/kotlin/dev/deathride/link/HudMetadata.kt:5 "The socket is reliable and ordered, so the periodic full snapshot is only a safety net."`
The garage, career, car, track and feel blocks go out in full on a phase change, on the first message
and on a 60 s safety refresh (it was 5 s), and otherwise only the fields that changed. Idle downlink per
phone fell 9.3 → 0.62 KB/s and racing downlink 9.46 → 6.42 KB/s (`b369b708`), and the phone no longer
re-parses and rebuilds about 15 KB of menus every five seconds.

## Only what the page reads

`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:865 "What the phone hud reads of [combatJson]; the full object is served by /stats."`
The racing payload dropped the fields the page never read; the full object is built for `/stats` when
that endpoint asks, `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:64 "combatFull"`.
Combat object 530 → 395 characters, message 857 → 722, racing downlink 7.7 → 6.6 KB/s at 10 Hz
(`7d082ae0`) — short of the 400 characters the finding hoped for, and the commit says why: what remains
is live numbers. The uplink frame shrank the same way: axes to three decimals, a send time to 0.1 ms, and
held-button channels only when non-zero, read as zero when absent; 141 → 56 bytes per driving packet
(`4ce6feeb`). The host's differential test reads an absent channel as zero,
`deathride/link/src/test/kotlin/dev/deathride/link/InputPacketTest.kt:20 "jsonPrimitive?.doubleOrNull?:0.0"`,
so the omission is a contract on both ends rather than a habit of one.

## The page writes only on change

`deathride/controller/index.html:95 "function setText(id,v){v=String(v);if(textCache.get(id)===v)return"`,
with the same guard for meters, classes and accessibility labels on the lines around it. Idle lobby,
desktop Chrome at 1x CPU: layouts 31 → 0 per second, mutations 91 → 0, main-thread time 18.8 → 5.7 ms
per second; driving: 46 → 4.7 layouts, 484 → 84 mutations, 41.8 → 25.2 ms per second (`f063ef95`).

## A hidden page gets nothing, then everything

`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:200 "a locked or backgrounded phone: no hud until it reports visible"`,
and on return `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:201 "resume with a full snapshot"`.
The test first proves the page was receiving, then that the hidden page gets nothing:
`deathride/link/src/test/kotlin/dev/deathride/link/HiddenPhoneTest.kt:28 "visible phone gets hud"` and
`deathride/link/src/test/kotlin/dev/deathride/link/HiddenPhoneTest.kt:31 "hidden phone must receive 0 hud frames"`
— zero frames over 1.5 s with a live speed, against ten a second before (`c159c2f0`).

## Deviations

- **No handset measured.** The bytes and frames are true counts; the page's main-thread figures are a
  desktop browser's, and nothing here measures a phone's battery or radio.
- **The heartbeat floor is downlink only.** The phone's own failure detector listens for acknowledgements
  of its input, not for the display stream; the floor keeps the page's view fresh, and liveness is decided
  elsewhere in the protocol. That is consistent, but the two meanings of "heartbeat" are not named apart in
  the code.
