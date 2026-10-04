---
layer: application
type: application
subject: phone-controller-input-protocol
technique: neutralise-on-every-loss-path
stack: node
status: forged
verified_on: 2026-10-01
---

# A controller page and a host that both go neutral, and a seat that survives the loss

Read against the racing game's source tree at `C:\Users\kazda\kiro\firetv-deathride` as it
stood on 2026-10-01. The host is a JVM socket server and the controller is a browser page it
serves; `node` is the nearest member of the closed stack set, so no `verified_against` is
given. This application covers the phone's neutralisation and failure detector, and the
host's seat reclaim, because the code realizes them as one loop.

## The phone: every path calls one function

`deathride/controller/index.html:55 "function neutral(){fire=0;mine=0;firePointer=minePointer=null;"`
clears every action, every held pointer and the on-screen held state, zeroes the steer, and
sends a frame. The paths that call it are the technique's list.
`deathride/controller/index.html:83 "document.addEventListener('visibilitychange',()=>{if(document.hidden){neutral();"`
covers a hidden or locked page; the same line wires `window.addEventListener('blur',neutral)`
and `'pagehide'` (neutralise and close). The settings, car, career and garage buttons each call
`neutral()` before opening their sheets, and the layout switch is, per the design contract at
`docs/concepts/deathride/W4-weapons-and-damage.md:35 "A stale/disconnected/layout-switched phone clears all attacks."`, a clearing path too. Pointer cancellation is covered because the
drift pad releases on `'pointerup','pointercancel','lostpointercapture'` at line 83.

The page does not trust a half-open socket. At
`deathride/controller/index.html:84 "if(performance.now()-lastAck>250)fail();send()"` the
page runs a thirty-per-second tick that declares the link lost when no acknowledgement has
arrived for a quarter second, which is the host's stale limit, so both ends go neutral
together. `fail()` at line 56 clears actions, the drift pad and the gas and brake pointers
and shows "Connection lost" without touching steering, which mirrors the host's steer hold.
`ws.onclose` at line 75 calls the same `fail()`. The acknowledgement handler at
`deathride/controller/index.html:62 "status('Linked · hold GO again',true)"` is the
technique's "resume is a separate act": it tells the player to press again instead of
restoring the pressed state.

A backed-up socket is not allowed to queue. At
`deathride/controller/index.html:54 "if(ws.bufferedAmount>1024){ws.close();return}"` the send
function closes the socket rather than appending to a buffer, which then reconnects.

## The host: acknowledging, reclaiming, fencing

The host answers every input frame at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:174 "socket.send("{\"t\":\"ack\",\"q\":$q,\"tvNow\":$now,\"accepted\":$accepted}")"`
including refusals; that acknowledgement is what the phone's failure detector listens for.
Seat claim is at `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:91 "private fun claim(token: String, providedPin: String, profile: String): Slot?"`,
and the returning-controller branch at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:93 "returning.generation++; returning.connected=true; returning.clockSynced=false; returning.input.newConnection()"`
admits a token match before the phase check at line 94 (`if(phase=="race" || phase=="countdown")return null`), which
refuses only strangers during a race. The reclaim resets exactly what the technique says: the
mailbox goes neutral through `newConnection()` at `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:73 "fun newConnection() { seq = -1;"`, and the clock estimate is
marked unsynchronised.

The generation fence is at `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:152 "while(isActive && generation==s.generation)"`
for the periodic sender, `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:159 "if(generation!=s.generation)break"` for the
reader, and the cleanup at
`deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:195 "if(s!=null && generation==s.generation) s.connected=false"`. The last
is the late-close guard: an old connection's cleanup does nothing to a seat that has since
been reclaimed. The scripted check is
`deathride/core/src/test/kotlin/dev/deathride/core/CombatTest.kt:87 "box.newConnection();box.consume(20.0,out);assertEquals(0.0,out.fire)"`.

## Deviations and an instrument lesson

**No check exercises the fence under a real race.** The three-test link suite sends frames
and checks fields; none opens a second connection to the same seat while the first is closing.
The fence is read, not run.

**`newConnection()` does not clear the selection or the steer.** The mailbox
zeroes throttle, brake, handbrake, fire and mine, but `weapon` and `steer` stay, so a
reclaimed seat starts with its old steer until the first fresh frame. It is bounded by the
next frame in practice; the standard says reset the connection's state.

**The instrument lesson.** `docs/concepts/deathride/PITFALLS.md:9 "Sending the remaining contacts creates a false latched-button finding."` records that an emulated multi-touch end
event with a non-empty contact list ends the listed contacts, so a test that released one
pad by listing the others reported a latched button the protocol did not have. The fix is in
the harness, and the finding was withdrawn: the technique's instrument rule, learned here by
being wrong once.

## What this evidence does and does not show

Real device, scripted and emulated clients only. The phone-side events (visibility, blur,
pagehide, the quarter-second detector) are read from the page and driven by scripts; no
physical handset has locked, slept or lost its radio under them.
