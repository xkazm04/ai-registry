---
layer: application
type: application
subject: fire-tv-device-realities
technique: unhandled-bind-failure-kills-process
stack: process
status: forged
verified_on: 2026-10-01
---

# A bind failure that took the process, and the three fixes that followed

Source trees: `C:\Users\kazda\kiro\firetv-deathride` (root for the paths below) and, where
stated, the earlier proof-of-concept repo `C:\Users\kazda\kiro\firetv`. The stack is
`process` because the realization is a fix history kept in findings and pitfall logs, with
the code as its last step. Everything here was observed on one streaming stick (a 4K model,
1.7 GB reported, 32-bit userland only); no result was felt by a human player, and no other
device was tried.

## The first incident and its misleading symptom

The proof-of-concept repo records that the app "died outright if port 8765 was taken", and
gives the cause: `docs/POC-FINDINGS.md:248 "Ktor binds inside its own accept coroutine"` (proof-of-concept
repo), so the bind exception never returns from the start call and reaches the uncaught handler;
`docs/POC-FINDINGS.md:250 "Fire OS reports only as"` the generic "Unable to start activity". The
common trigger was the game's own previous process still holding the port, so it fired repeatedly
during development and `docs/POC-FINDINGS.md:252 "contaminated several measurements before it was recognised"`.
That last clause is the craft point: an intermittent failure that looks like a launch problem is
attributed to everything else first.

The fix in the TV app, `tv-app/src/main/kotlin/dev/telestrator/tv/transport/LanTransport.kt`,
is the technique's steps 1, 4 and 8 in one place. A coroutine exception handler owns the
server's parent context (`LanTransport.kt:83 "engine's parent context is what makes that failure ours to handle"`),
the failure is published as a state value that the pairing card renders
(`LanTransport.kt:80 "now a message on the pairing card instead of a dead app"`), and the bind is
retried ten times at 300 ms (`LanTransport.kt:31 "BIND_ATTEMPTS = 10"`). It was verified by stealing
the port on the device with a reverse tunnel
(`docs/POC-FINDINGS.md:256 "Verified by stealing the port on-device"`, proof-of-concept repo): step 7, the guard made to fire.

## The upward lesson: the preflight disagreed with the listener

The same file contains the trap the draft of this technique did not have. The free-port
preflight `portIsFree` sets it off (`LanTransport.kt:37 "it.reuseAddress = false"`). Later, the racing
game's pitfall log records the consequence: *"the port preflight reporting busy although no
server listened"* because *"recently closed TCP connections could block startup through
TIME_WAIT"* (`docs/concepts/deathride/PITFALLS.md:3 "Set reuse before binding"`). The racing game's server does it right:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:112 "socket.reuseAddress=true"`
sits in its ten-attempt, 300 ms loop. The preflight must use the listener's options: technique step 10.

## Where the tree falls short of the standard

- The older transport still carries the pre-fix preflight: `LanTransport.kt:37 "it.reuseAddress = false"` keeps
  the old option, so the same false "busy" can recur wherever that file is reused. The
  lesson was written into the later game's log and not back into the earlier file.
- The racing game's retry loop reports the failure as a status string
  (`RaceServer.kt:113 "Port 8765 busy; retry"`), which is a state
  value, but nothing in the tree provokes a bind failure on purpose for the racing server on
  the device. The occupied-port and suspend/rebind cases are covered by a unit test named
  in the racing game's spike notes (`deathride/docs/concepts/DEATH-RIDE-PITFALLS.md:5 "tests occupied port and suspend/rebind/reconnect"`), on a JVM and not on the
  stick. Step 7 holds there only as a simulation.
- No last-resort process-level recorder (step 6) was found in either tree.

## What this application does not show

It shows the failure and its fixes on one device. It does not show whether the platform will
permit the bind on a different platform generation; that is a separate question, taken up in
the portability hedge technique.
