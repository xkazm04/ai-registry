---
layer: application
type: application
subject: lan-pairing-and-session-continuity
technique: port-preflight-with-reuseaddress
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
---

# A television host's bind loop, and the preflight that was stricter than the bind

The source is a two-seat racing game. Its television host is a Kotlin 2.0.21 program on a
Fire TV stick, serving a WebSocket over the Ktor 2.3.12 CIO engine. The first forge filed
this page under `node` as the nearest server stack; it is a JVM host and is now filed as
`kotlin`. Citations resolve against `firetv-deathride`, branch `deathride/main`, re-read 2026-10-09 at `10974fa3` and
re-resolved at `d9990777`, after the two commits this run made to the socket route (see the
reclaim application). The 2026-10-06 optimize wave moved most of the host's
lines, so every line number below is new; the behaviour they cite held. The history is two
incidents about a month apart in the lineage, and the code carries both fixes.

## Incident one: the bind failure that took the process

`docs/POC-FINDINGS.md:248 "The app died outright if port 8765 was taken."` and the lines
that follow record that the exception never returned out of the start call, reached the
uncaught handler and ended the process. The device OS reported it only as "Unable to start
activity". The recorded fix was a bind probe, an owned parent coroutine context and ten
retries. It ends with
`docs/POC-FINDINGS.md:256 "Verified by stealing the port on-device"`.
It survives in the racing host. The engine is handed the host's own failure handler, now
together with the link's own thread pool:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:169 "parentCoroutineContext=errors+linkDispatcher"`.
That handler sets the link not running and a status string:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:137 "Link error: ${e.javaClass.simpleName}"`.
The retry cap is
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:166 "repeat(10)"`.
The loop ends in a readable status:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:201 "Port $port unavailable. Close the other race app, then reopen."`
This incident was reproduced on a real television stick, so it is the best-evidenced claim
in the subject.

The recorded mechanism needs one correction, read from the Ktor 2.3.12 bytecode this build
resolves. In that version the start call does wait for the bind:
- `CIOApplicationEngine.start` blocks on its startup job;
- the server job completes that job exceptionally when the bind fails;
- so a refused bind is thrown out of `start(false)`.

The same failure also ends the server job, which runs in the parent coroutine context. With
no handler there, that is the path that reached the uncaught handler and killed the process.
The fix covers both paths: the handler on the parent context, and the catch around the start
call (below).

## Incident two: the probe that disagreed with the bind

`docs/concepts/deathride/PITFALLS.md:3 "The preflight disabled address reuse"` records a
restart soon after a two-socket probe. The port was reported busy while nothing listened.
The fixed probe sets reuse before the bind, and binds the interface and port that the real
listener uses:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:167 "socket.reuseAddress=true; socket.bind(InetSocketAddress("`.
The next line sets the visible status and waits:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:168 "delay(300); return@repeat"`.
The occupied-port path has a real test. It holds a bound listener and expects the host to
reach an unavailable status without dying:
`deathride/link/src/test/kotlin/dev/deathride/link/LinkTest.kt:15 "occupiedPortReportsFailureWithoutKillingTheHost"`.

## What the listener itself sets, read from the engine

The pitfall entry says to set reuse "as the listener does". The listener's own configuration
does not set it.
- The engine is built with only a host, a port and a parent context, and no engine
  configuration block:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:169 "embeddedServer(CIO, host="`.
- In the Ktor 2.3.12 artifacts this build resolves, the CIO engine's `reuseAddress` setting
  defaults to false; the configuration's constructor sets only the idle timeout.
- The network layer writes the socket option only when the setting is true. When it is
  false, it leaves the option untouched (disassembled `CIOApplicationEngine$Configuration`
  and `JavaSocketOptionsKt` in `ktor-network-jvm-2.3.12`).

So the listener runs on the platform's default. On this repository's Windows development
machine that default is off: JDK 22's `ServerSocketChannel.open()` reports `SO_REUSEADDR`
false. That is consistent with the JDK source, read by this run's research lane: Windows uses an
exclusive bind and only emulates the reuse setting, while on Unix-like systems a server
channel requests reuse when it is created. On the stick, the on-device fix working implies
the default is on there too. That is an inference from the incident and from the library
the runtime derives from, not a reading of the stick's runtime.

That default matters more than the probe, for a reason measured on 2026-10-09 (one run per
cell, recorded on the technique). On a Linux kernel, a wait-state connection left on the
listening port blocks a later bind unless both of these set reuse:
- the new socket;
- the listener that accepted the connection.

A probe that sets reuse cannot rescue a previous run whose listener did not. The retry budget
cannot either: ten attempts about 300 ms apart give roughly three seconds, against a
sixty-second wait on Linux.

The host closes its phones' connections itself on pause (below), which is exactly what puts
those wait states on its own port. The standard asks for the reuse flag on the real listener,
set explicitly; here that is the engine's `reuseAddress = true` in a configuration block.
That change is not made and not measured on the stick.

## Why the test on the development machine could not see incident two

The occupied-port test holds a live listener. Both a JDK 22 probe and Node's `listen` on
Windows 11 refused it, with or without reuse (measured 2026-10-09), so the test's assertion
holds there. The TIME_WAIT variant is a different case.
- On Windows, a fresh bind over a server-side TIME_WAIT on the same port succeeded with
  reuse off as well as on, while `netstat` showed the TIME_WAIT row.
- On a Linux kernel (WSL2, 6.6), the same sequence was refused without reuse.

A Windows development machine cannot reproduce incident two at all. That is why it was found
only on the stick, after a reinstall.

## The probe stays advisory, as the technique requires

The real start is wrapped in its own catch:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:194 "if(runCatching { candidate.start(false) }.isSuccess)"`.
A failed start tears down the half-built engine and loops:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:199 "runCatching { candidate.stop(0,0) }; delay(300)"`.
So a port taken between the probe and the bind is handled by the same retry.

One subtlety the source leaves open. When a bind fails asynchronously, the engine's failure
handler can clear the running flag after the success branch has set it, so the retry loop
and the handler can both report. This is read from the code, not reproduced.

## Release on pause, rebind on resume

The lifecycle hooks are
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:347 "server.paused=true; server.suspendLink()"`
and
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:348 "server.paused=false; server.start()"`.
The release clears the running flag, cancels the network job and stops the engine with a
short grace:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:402 "engine?.stop(100,500)"`.
It then bumps every seat's generation without clearing tokens, at line 403.
Start is idempotent:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:162 "if(running || networkJob?.isActive==true)return"`.
Resume goes through the same probe and retry loop as a first start.

The port is a constant. That matters beyond the pairing code: the phone's stored seat token
lives in storage keyed by the page's origin, and its socket targets the page's own host and
port (`deathride/controller/index.html:115 "ws=new WebSocket('ws://'+location.host+'/ws')"`).
A resume onto any other port would orphan both.

The stated reason and the limit are in
`deathride/README.md:30 "Backgrounding the game stops its listener so another variant can use port 8765"`.
The same line says that application process death resets the session.

## The address on the pairing code

The address is re-polled on a slow timer:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:196 "delay(10000); address=lanAddress()"`.
The chooser keeps addresses that are up, IPv4, not loopback and not link-local, and prefers a
private-range one:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:414 "it.isSiteLocalAddress"`.

The source still falls short of the technique's rule on the final fallback:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:415 "127.0.0.1"`
is the loopback fallback. A network-less television would draw a code that can only reach
itself. The chooser also takes the first private address of any interface, which a virtual
or tethering interface can win. Both are read from the code; no network-less or
multi-interface run was made.

## Evidence grade

- **Real device:** the port-theft crash and its fix, and the reinstall symptom.
- **Scripted, on a development machine:** the occupied-port test and the
  suspend-restart-rejoin test.
- **Measured on 2026-10-09, outside the project:** the Windows-versus-Linux TIME_WAIT
  difference, with a fresh JDK and Node bind on Windows and a Python bind in a Linux
  container. A live listener was the control that must refuse.
- **Read from the artifacts:** the engine's reuse default.
- **Inferred, not observed:** that the stick's platform default is on.
- **Authored only:** the retry count, the 300 ms interval, the ten-second re-poll, and the
  asynchronous status race above.
