---
layer: application
type: application
subject: lan-pairing-and-session-continuity
technique: token-seat-reclaim-precedence
stack: node
status: forged
verified_on: 2026-10-01
---

# A two-seat racing host: token first, then the stranger checks

The source is a two-player racing game whose television host (a JVM server with a CIO
engine and WebSockets, so the `node` slot is the nearest registry fit, not the runtime)
pairs two phones through one browser controller page. Citations resolve against the working
tree at `C:\Users\kazda\kiro\firetv-deathride`, checked 2026-10-01. The seat logic is one
synchronized function; the phone's reconnect behaviour is one line of the controller page.
Verified by scripted socket clients and a scripted browser, never by a person with a phone.

## The precedence, as written

`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:91-102` is the whole
admission. The token is looked up first:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:92 "val returning=slots.firstOrNull{it.token==token && token.isNotEmpty()}"`
and on a hit the next line bumps the generation, marks the seat connected, clears the clock
sync and resets the input channel, then returns the seat with no further check. Only then
does the stranger path run. A newcomer is refused during a live race, at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:94 "phase=="`.
The secret is checked next at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:95 "if(providedPin!=pin) return null"`,
a free seat is taken at line 96, and a second claim of one profile is refused at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:98 "if(slots.any{it.claimed && it.profileId==id})return null"`.
This matches the technique's order, including the part that is easy to invert: the
race-in-progress refusal sits before the secret check, and the token beats both. The
automated witness is
`deathride/link/src/test/kotlin/dev/deathride/link/LinkTest.kt:69 "host.suspendLink(); assertFalse(host.running); host.start(); waitReady()"`,
after which a hello carrying only the token is seated in slot 0 and reported connected.

## The generation counter that makes stale cleanup harmless

A reclaim increments the seat's generation, and the old socket's HUD loop is guarded by
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:152 "while(isActive && generation==s.generation)"`,
after which it closes the replaced socket. The handler's cleanup at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:195 "if(s!=null && generation==s.generation) s.connected=false"`
marks the seat disconnected only when its own generation is still current, so a late close
from the old connection cannot disconnect the new one. Confirmed as the technique describes.
No test makes a half-open old socket outlive the new connection, so the guard is correct by
reading, not by observation.

## The refusal

One message serves every refusal, sent just before a policy-violation close:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:148 "press REWIND in the TV lobby to reset pairing"`.
It tells the person how the host resets seats, which the technique asks for. It does not
distinguish its four causes (wrong secret, race running, both seats held, profile taken), so
a person refused during a race is told to check the PIN. The phone drops its stored token on
any refusal and shows the pairing form:
`deathride/controller/index.html:74 "paired=false;token='';storage.set('token','')"`.

## Where the source falls short of the standard

- Seat lifetime is until the host resets or the process exits:
  `deathride/README.md:28 "Pairing reservations last until REWIND resets them or the process exits."`
  A phone that left for good keeps its seat reserved, the failure mode the technique warns
  of. The source decided this on purpose and documented it.
- A refusal does not stop the client's reconnect timer:
  `deathride/controller/index.html:75 "reconnectTimer=setTimeout(connect,800)"`
  re-enters the connect function every 800 ms after every close, and that function only stays
  out of the loop when the page holds neither a secret nor a token. A phone holding a stale
  stored secret is refused, closed and retried indefinitely. Read from the code, not
  exercised. Because the secret is four digits from
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:83 "(1000+SecureRandom().nextInt(9000))"`
  and the host counts no failed attempts, the loop is in principle also a guessing path.
- The secret is taken from the address and stored, and nothing strips it from the visible
  address afterwards:
  `deathride/controller/index.html:33 "let pin=params.get('pin')||storage.get('pin')"`.
- The token travels in the greeting and the welcome over a cleartext socket and is a bearer
  secret; see
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:150 "${s.token}"`.
  Acceptable for a room; the source's documents do not say so.
- The hello deadline wraps the claim as well as the read:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:141 "withTimeout(10000)"`
  encloses the claim call at line 145, so the cancellation seam in the hello-timeout
  technique applies. Read from the code, not observed, and no test exercises a silent peer.

## Evidence grade

Measured by script: the precedence and the token-only rejoin. Authored and unobserved: the
refusal wording, the reconnect loop, the reservation lifetime's feel, the deadline seam. No
human has been refused, read the message and recovered.
