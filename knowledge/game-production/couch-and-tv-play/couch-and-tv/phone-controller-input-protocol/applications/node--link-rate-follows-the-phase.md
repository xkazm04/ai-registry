---
layer: application
type: application
subject: phone-controller-input-protocol
technique: link-rate-follows-the-phase
stack: node
status: forged
verified_on: 2026-10-07
---

# Thirty frames a second in the race, four in the garage

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. The controller is a single browser page served by the Kotlin host on a Fire TV
stick; neither end is a Node runtime, and `node` is the nearest member of the closed stack set for a
browser page speaking to a socket host, so no `verified_against` is given. The changes are findings L5,
L6, L7 and L13 of the 2026-10-06 optimize wave. Figures come from `tools/controller-bench.mjs` driving the
page in desktop Chrome against the `FakeHost` stand-in, and from `tools/reconnect-bench.mjs`; no handset
was measured.

## The rate and its thresholds, from one function

`deathride/controller/index.html:163 "const hot=curPhase==='race'||curPhase==='countdown'||steerPointer!==null||held.size>0"`
— the page is hot in the countdown and the race, and in any phase while any control is held, which is
the technique's condition: holding, not the phase alone. The same line sets the interval,
`deathride/controller/index.html:163 "const ms=hot?33:250"`, and gives the switch its grace by moving the
last-acknowledgement time forward when the page turns hot,
`deathride/controller/index.html:163 "if(hot)lastAck=Math.max(lastAck,performance.now())"`. The loss
threshold follows the interval in the tick that uses it,
`deathride/controller/index.html:162 "performance.now()-lastAck>(hbMs===33?250:1500)"` — 250 ms hot,
1.5 s idle. A phase change from the host re-runs the decision,
`deathride/controller/index.html:119 "if(m.phase!==curPhase){curPhase=m.phase;retime()}"`, and every
contact change still sends immediately through `sendSoft`, capped near 60 frames a second (re-verified at
62 per second under 250 Hz of pointer moves).

Idle in the lobby at 1x CPU (`fb6f0d9f`): 31.7 → 5.4 frames a second including the 1 Hz ping, 1,475 →
242 B/s, page main thread 6.2 → 1.0 ms per second. The host's acknowledgement work for two idle phones
falls from 2 × 30 to 2 × 4 a second.

## Reconnection that gives up gracefully

`deathride/controller/index.html:136 "0.8, 1.6, then every 3.2 s; a hidden page waits for visibilitychange. A dead TV cost 53 sockets a minute."`
With the host killed, attempts per minute fell 53 → 20 over a 40 s window (`ca877afc`); the worst
recovery after the television returns grows by up to 3.2 s. The backoff has no jitter, which is right for
a couch of a few phones and would not be for many clients reconnecting to one host at once.

## Hidden pages

On `visibilitychange` the page reports its state to the host, neutralises its controls and releases its
wake lock, and on becoming visible it reconnects if the socket is gone; the host pauses that seat's
display stream and resumes with a full snapshot (`c159c2f0`; the host side is in this subject's
send-on-change application).

## Deviations

- **The page does not stop its own uplink when hidden.** The heartbeat interval keeps running at the idle
  rate and the 1 Hz ping keeps running while the page is paired; only the browser's throttling would slow
  them. MDN notes that tabs holding a WebSocket are exempted from timer throttling so the socket does not
  time out (https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), so a hidden page here
  can be expected to keep sending four frames and one ping a second. Whether a given phone's browser
  freezes it instead is unmeasured.
- **No handset, no battery claim.** The finding's expected benefit names battery and Wi-Fi wakeups; what
  was measured is frames, bytes and desktop-browser milliseconds. Android's own guidance warns that even a
  request every 15 s can keep a mobile radio awake
  (https://developer.android.com/develop/connectivity/minimize-effect-regular-updates), so a 4 Hz heartbeat
  is a saving in bytes and work, not evidence that the radio sleeps.
