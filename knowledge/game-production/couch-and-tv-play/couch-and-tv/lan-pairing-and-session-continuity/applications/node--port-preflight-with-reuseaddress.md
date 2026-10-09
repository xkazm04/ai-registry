---
layer: application
type: application
subject: lan-pairing-and-session-continuity
technique: port-preflight-with-reuseaddress
stack: node
status: forged
verified_on: 2026-10-01
---

# A television host's bind loop, and the preflight that was stricter than the bind

The source is the same two-seat racing game, a JVM host with a CIO server engine, filed
under the `node` slot as the nearest server stack. Citations resolve against
`firetv-deathride`, checked 2026-10-01; the proof-of-concept findings
document cited first exists identically in that tree. The history is two incidents about a
month apart in the lineage, and the code carries both fixes.

## Incident one: the bind failure that took the process

`docs/POC-FINDINGS.md:248 "The app died outright if port 8765 was taken."` and the lines
that follow record that the exception never returned out of the start call, reached the
uncaught handler and ended the process, which the device OS reported only as "Unable to
start activity". The recorded fix, a bind probe, an owned parent coroutine context and ten
retries, ends with
`docs/POC-FINDINGS.md:256 "Verified by stealing the port on-device"`.
It survives in the racing host. The engine is handed the host's own failure handler:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:114 "parentCoroutineContext=errors"`,
whose handler sets the link not running and a status string,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:87 "Link error: ${e.javaClass.simpleName}"`.
The retry cap is
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:111 "repeat(10)"`
and the loop ends in a readable status,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:133 "Port 8765 unavailable. Close the other race app, then reopen."`
This incident was reproduced on a real television stick, so it is the best-evidenced claim
in the subject.

## Incident two: the probe that disagreed with the bind

`docs/concepts/deathride/PITFALLS.md:3 "The preflight disabled address reuse"` records a
restart soon after a two-socket probe that reported the port busy while nothing listened.
The fixed probe sets reuse before the bind and binds the interface and port the real
listener uses:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:112 "socket.reuseAddress=true; socket.bind(InetSocketAddress("`
and the next line sets the visible status and waits:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:113 "delay(300)"`.
The occupied-port path has a real test that holds a bound listener and expects the host to
reach an unavailable status without dying:
`deathride/link/src/test/kotlin/dev/deathride/link/LinkTest.kt:15 "occupiedPortReportsFailureWithoutKillingTheHost"`.
The reinstall-then-restart symptom was observed on a real device; the test runs on a
development machine. Reuse semantics differ by operating system, so a pass there does not
prove that a live listener still fails the probe on the device, and the source does not
claim it does.

## The probe stays advisory, as the technique requires

The real start is wrapped in its own catch,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:126 "candidate.start(false)"`,
and a failed start tears down the half-built engine and loops,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:131 "candidate.stop(0,0)"`,
so a port taken between probe and bind is handled by the same retry. One subtlety the source
leaves open: the engine's failure handler can clear the running flag after the success
branch has set it, when a bind fails asynchronously, so the retry loop and the handler can
both report. Read from the code, not reproduced.

## Release on pause, rebind on resume

The lifecycle hooks are
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:185 "server.paused=true; server.suspendLink()"`
and
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:186 "server.paused=false; server.start()"`.
The release clears the running flag, cancels the network job, stops the engine with a short
grace and bumps every seat's generation without clearing tokens:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:221 "engine?.stop(100,500)"`.
Start is idempotent:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:107 "if(running || networkJob?.isActive==true)return"`.
The secret is replaced only by the explicit reset, so the code on the screen survives a
pause. The stated reason and the limit are
`deathride/README.md:28 "Backgrounding the game stops its listener so another variant can use port 8765"`
and, on the same line, that application process death resets the session.

## The address on the pairing code

The address is re-polled on a slow timer:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:128 "delay(10000); address=lanAddress()"`.
The chooser keeps up, non-loopback, non-link-local IPv4 addresses and prefers a private
range one:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:233 "it.isSiteLocalAddress"`.
The source falls short of the technique's rule on the final fallback:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:234 "127.0.0.1"`
is the loopback fallback, so a network-less television would draw a code that can only reach itself. The chooser also takes the first
private address of any interface, which a virtual or tethering interface can win. Both read
from the code; no network-less or multi-interface run was made.

## Evidence grade

Real device: the port-theft crash and its fix, and the reinstall symptom. Scripted,
development machine: the occupied-port test and the suspend-restart-rejoin test. Authored
only: the retry count, the 300 ms interval, the ten-second re-poll, and the asynchronous
status race above.
