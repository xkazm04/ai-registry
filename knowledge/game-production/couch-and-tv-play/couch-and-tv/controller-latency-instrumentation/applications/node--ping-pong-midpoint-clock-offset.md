---
layer: application
type: application
subject: controller-latency-instrumentation
technique: ping-pong-midpoint-clock-offset
stack: node
status: forged
verified_on: 2026-10-10
---

# Phone controller clock offset and bounded latency recorders in a racing game

Verified 2026-10-01 against the racing game's source tree as checked out in its worktree,
and re-anchored on 2026-10-10 at `deathride/main@d9990777`. Every quote still held there,
and every line number had moved. All paths are relative to that tree's root. The stack label is the nearest fit in the closed
list: the controller is a browser page in plain script, the screen-device host is a Kotlin
server, and the repeatable clients are Node scripts. Nothing here was measured on a human's
setup. What was measured is a Fire TV stick driven by two scripted clients; the optical
figure was never collected.

## The exchange

The controller pings once a second for the life of the connection and once at welcome.

- `deathride/controller/index.html:164` "raw({t:'ping',ts:performance.now()})},1000)"
- `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:281` "if(ts.isFinite())socket.send(" echoes the controller's own stamp back with the TV clock as `tvNow`.

The echo is verbatim, which is what the technique requires. The controller computes the
offset as the TV reading minus the midpoint of its send and receive instants, and publishes
the round trip with it:

- `deathride/controller/index.html:117` "clockOffset=m.tvNow-(m.ts+now)/2"

Confirmed against the draft: monotonic clock on the phone, midpoint formula, round trip sent
with the offset. The same line is the best-round-trip selection in one statement: the record
resets per connection at `deathride/controller/index.html:115` "bestRtt=Infinity" and a sample
replaces it only when strictly smaller.

## Applying it at the consumer

- `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:283` "offset=value; calibrated=true; s.clockSynced=true"
- `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:256` "val timestamp=if(calibrated)"

Before the first sync the receive time is the stamp, so the age is a lower bound, and the
stats expose `clockSynced` per slot so a reader can tell. The documentation says so beside
the selection rule: `deathride/README.md:40` "the lowest RTT sample on the phone is preferred" and `deathride/README.md:40` "it is not an optical latency measurement."

A future-stamp rejection exists, as the decision rules require:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:63` "generatedMs - nowMs > 100.0"

## Deviations from the standard

- **The best-round-trip record never ages.** The record at line 117 is only ever lowered
  within a connection, so one lucky early sample freezes the offset while the two clocks
  drift. The soak runs were fifteen minutes; no run compared early and late offsets. The
  standard stays: a windowed re-selection is wanted.
- **The TV drops the round trip.** Line 283 stores only the offset; the sample's
  half-round-trip error bar is not exported beside the input age, so a reader cannot
  compute the bound.
- **Negative ages are clamped silently.** `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:70` "max(0.0, nowMs-stampMs)" clamps at zero with no count, so a
  mis-estimated offset cannot appear in the distribution.
- **Offset steps are not logged**, so a clock jump or path change would be invisible.
- **A resume keeps the record if the socket survived** (2026-10-10, predicted, not observed).
  On a visibility return the controller reconnects only when the socket is already dead:
  `deathride/controller/index.html:157` "if(!ws||ws.readyState>1)connect()". The record
  resets only in `connect()`. A phone page's clock can pause during sleep, so after a screen
  lock that left the socket open, the old best sample would stay in force with an offset
  short by the sleep. A sleep longer than the 250 ms staleness limit would then make every
  input arrive "stale" while acknowledgements keep flowing. Nobody has locked a phone
  mid-race on this build and recorded the result.
- **A second silent clamp sits in the recorder.**
  `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:18` "val value=valueMs.coerceAtLeast(0.0)"
  repeats the mailbox's clamp at the histogram, so even a fixed mailbox would not surface
  negative ages in the distribution.

What held up under the 2026-10-10 counter-evidence: the screen device reads its clock in the
receive loop, just before the pong is sent, and not on a game tick:
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:279` "val now=nowMs()". The
handling bias of the three-instant form is therefore one JSON parse, not a simulation step.

## Bounded recorders

The recorder is the exact-window plus histogram pair:

- `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:5` "Window quantiles exact; lifetime histogram has 0.1 ms bins."
- `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:6` "capacity: Int = 4096, private val binMs: Double = .1"
- `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:28` "fun lifetime(p: Double)"
- `deathride/link/src/main/kotlin/dev/deathride/link/Metrics.kt:40` "Distribution(binMs=.001,capMs=50.0)" gives the simulation step its own geometry.
- Recorded once per simulation consumption: `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:321` "metrics.inputAgeMs[id].add(slot.input.ageMs,now)"

Confirmed: a ring of 4096 against a ten-second window at sixty steps a second (about 600
samples), exact maximum and count beside the histogram, per-quantity geometry, and the
geometry printed in the stats response. Upward lesson folded into the technique: stale held
input keeps ageing, so a disconnected slot's lifetime quantiles climb to the cap while the
exact maximum shows the true age; `deathride/README.md:41` "bounded lifetime histograms" states it with the cap.

One small deviation: `lifetime()` returns the bucket's lower edge, so every lifetime
quantile is biased low by up to one bucket. At 0.1 ms the bias is below the question, but
the report does not state it.
