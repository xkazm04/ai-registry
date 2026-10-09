---
layer: application
type: application
subject: lan-pairing-and-session-continuity
technique: token-seat-reclaim-precedence
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: code
ab_verdict: better
---

# A two-seat racing host: token first, then the stranger checks

The source is a two-player racing game. Its television host is a Kotlin 2.0.21 program
running Ktor's CIO engine and WebSockets, and it pairs two phones through one browser
controller page. The first forge filed it under `node` as the nearest fit; it is now filed
as `kotlin`. Citations resolve against `firetv-deathride`, branch `deathride/main`, re-read 2026-10-09 at `10974fa3` and
re-resolved at `d9990777`, after this run's two commits to the socket route (below).

The seat logic is one synchronized function. The phone's reconnect behaviour is two
handlers on the controller page, and the 2026-10-06 optimize wave changed one of them
(below). It was verified by scripted socket clients and a scripted browser, never by a
person with a phone.

## The precedence, as written

`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:146-157` is the whole
admission. The token is looked up first:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:147 "val returning=slots.firstOrNull{it.token==token && token.isNotEmpty()}"`.
On a hit, the next line bumps the generation, marks the seat connected, clears the clock
sync and resets the input channel, then returns the seat with no further check. Only then
does the stranger path run.
- A newcomer is refused during a live race or countdown:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:149 "countdown"`.
- The secret is checked next:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:150 "if(providedPin!=pin) return null"`.
- A free seat is taken at line 151.
- A second claim of one profile is refused:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:153 "if(slots.any{it.claimed && it.profileId==id})return null"`.

This matches the technique's order, including the part that is easy to invert: the
race-in-progress refusal sits before the secret check, and the token beats both. The
token itself is `UUID.randomUUID()` at line 155, a random identifier from a sound source.

The automated witness is
`deathride/link/src/test/kotlin/dev/deathride/link/LinkTest.kt:81 "host.suspendLink();host.consume(0,host.nowMs(),input)"`,
followed on the next line by a hello carrying only the token, which is seated in slot 0.
The same test refuses a bad secret first:
`deathride/link/src/test/kotlin/dev/deathride/link/LinkTest.kt:53 "val bad=Listener(); val badWs=connect(bad); badWs.sendText("`.

## The generation counter that makes stale cleanup harmless

A reclaim increments the seat's generation, and the old socket's HUD loop is guarded by
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:232 "while(isActive && generation==s.generation)"`.
On leaving that loop it closes the replaced socket at line 252. The handler's cleanup,
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:315 "if(s!=null && generation==s.generation) { s.connected=false;s.hidden=false }"`,
marks the seat disconnected only when its own generation is still current. So a late close
from the old connection cannot disconnect the new one. This is confirmed as the technique
describes. No test makes a half-open old socket outlive the new connection, so the guard is
correct by reading, not by observation.

## The hidden phone, new since the first forge

The page now reports its own visibility, and the host stops the HUD for a hidden phone
without touching the seat:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:282 "s.hidden=hide"`.
A test holds it:
`deathride/link/src/test/kotlin/dev/deathride/link/HiddenPhoneTest.kt:20 "hiddenPhoneReceivesNoHudAndResumesFull"`.
On hide, the page neutralises its controls and releases the wake lock. On show, it
re-acquires the lock and reconnects if its socket is gone:
`deathride/controller/index.html:157 "if(document.hidden){neutral();wake?.release()}else{lockWake();if(!ws||ws.readyState>1)connect()}"`.
This is the phone's side of the gap that the listener-release technique describes. It is
measured on a desktop browser and a scripted client; a locked phone was not observed.

## The refusal

One message serves every refusal, and it is sent just before a policy-violation close:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:224 "press REWIND in the TV lobby to reset pairing"`.
The wording now also says "Two cars may already be reserved", so it names two of its four
causes. It still does not distinguish them (wrong secret, race running, both seats held,
profile taken), so a person refused during a race is told to check the PIN.

The phone drops its stored token on a refusal and shows the pairing form:
`deathride/controller/index.html:135 "if(m.t==='error'){paired=false;token='';storage.set('token','');"`.

## Where the source falls short of the standard

- **Seat lifetime** is until the host resets or the process exits:
  `deathride/README.md:30 "Pairing reservations last until REWIND resets them or the process exits."`
  A phone that left for good keeps its seat reserved, the failure mode the technique warns
  of. The source decided this on purpose and documented it.
- **A refusal is still not a verdict to the reconnect loop, though the loop is now slower.**
  Since the first forge, the close handler backs off (0.8 s, 1.6 s, then every 3.2 s) and
  does not retry while the page is hidden:
  `deathride/controller/index.html:136 "if(!document.hidden)reconnectTimer=setTimeout(connect,800*2**Math.min(retries++,2))"`.
  The comment on that line records that a dead TV had cost 53 sockets a minute. The refusal
  handler clears the token but not the secret. The secret is read from the address or from
  storage, `deathride/controller/index.html:51 "let pin=params.get('pin')||storage.get('pin')"`,
  and stored again on every welcome at line 116. The connect function stays out of the loop
  only when the page holds neither a secret nor a token:
  `deathride/controller/index.html:115 "if(!pin&&!token){$('pair').hidden=false;return}"`.
  So a phone holding a secret rotated since its last visit presents it about every 3.2 s
  until someone types a new one. The rate dropped about fourfold; the loop remains. The same
loop is also what seats a phone that scanned the code during a race, once the race ends.
Clearing the secret on every refusal would give that up, and the single refusal message
leaves the page no way to tell the two cases apart. This is
  read from the code, not exercised.
- **The secret is not rate-limited.** It is four digits,
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:133 "(1000+SecureRandom().nextInt(9000))"`,
  and the host counts no failed attempts. So any client, not this page, can still guess
  without limit.
- **The secret stays in the visible address.** It is taken from the address and stored,
  and nothing strips it from the address afterwards (line 51; there is no history
  replacement anywhere in the page).
- **The token is a bearer secret over cleartext.** It travels in the greeting and in the
  welcome over a cleartext socket:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:227 "${s.token}"`.
  That is acceptable for a room; the source's documents do not say so.
- **The socket upgrade did not check the page's origin, until this run.** At `10974fa3` no
  handler read the `Origin` header. A new test opened `/ws` as a page from
  `http://evil.example` with the right secret, and against the code as shipped that page
  was welcomed into slot 0 with a seat token. Commit `db9c3792` closes such a socket with
  a policy-violation code before any admission check:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:189 "if(origin!=null && !origin.substringAfter("://").equals(call.request.headers[HttpHeaders.Host],ignoreCase=true))"`.
  The same test then holds three outcomes:
  `deathride/link/src/test/kotlin/dev/deathride/link/ForeignOriginTest.kt:29 "foreignPageWithTheRightPinTakesNoSeat"`.
  - The foreign page is closed with code 1008, and no seat is claimed.
  - The controller's own origin still pairs.
  - A client with no `Origin` header, which is not a browser, still pairs.

  The whole `:link` suite passed with the change. The page's real origin on a phone was not
  exercised; it is the same host and port the page was loaded from, which is what the check
  compares.
- **The hello deadline wrapped the claim as well as the read, until this run.** At
  `10974fa3` the claim was the last statement inside `withTimeout(10000)`.
  - The coroutine library's own documentation says its timeout may fire after the block
    finishes and before the caller resumes.
  - The handler's `catch(_: Exception)` swallowed that timeout.
  - The cleanup compared the seat's generation with a local copy that was set only after
    the block.

  So a deadline landing there left a seat that was claimed and marked connected, holding a
  token no phone received, and nothing released it until a pairing reset. Commit
  `d9990777` bounds only the receive and parse:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:215 "val greeting=withTimeout(10000)"`.
  The claim now runs after the block:
  `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:222 "slot=claim(greeting.text("`.
  The generation is recorded at line 225, with no suspension point in between. The race
  cannot be reproduced by a test, so this is a fix by construction. The `:link` suite
  passed with it, and still no test exercises a silent peer.

## Evidence grade

- **Measured by script:** the precedence, the bad-secret refusal, the token-only rejoin, and
  the hidden-phone pause.
- **Authored and unobserved:** the refusal wording, the reconnect loop with a stale secret,
  how the reservation lifetime feels, and the deadline seam.

No human has been refused, read the message and recovered.
