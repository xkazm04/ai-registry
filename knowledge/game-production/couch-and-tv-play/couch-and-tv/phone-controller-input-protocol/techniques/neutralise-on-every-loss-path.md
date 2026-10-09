---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: neutralise-on-every-loss-path
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a held button or throttle survives the phone going away, enumerating how a controller can stop being trustworthy, a harness reports a latched control and nobody is sure whether the protocol or the harness is wrong]
---

# Neutralise on every loss path

The named concern: every way a controller can stop being trustworthy is listed, and each
one drives both ends to a neutral state: zero actions, zero pressure, no pointer held. The
defect this prevents is the stuck input: the last pressed state persisting because the
event that would have cleared it was one of the paths nobody listed.

## Two ends, because neither can report every loss

A loss path is a way the controller's meaning ends. The phone detects some of them and
cannot report them (it may be about to be frozen); the host detects others and has no
channel back to a dead phone. So neutrality is owned by both, independently, and each end
treats the other as unreliable.

**Phone-side paths**, each of which clears every held contact, zeroes every channel and
sends a final neutral frame if it can:

- the page loses visibility (tab switched, screen locked, app backgrounded);
- the window loses focus;
- the page is being unloaded;
- an overlay or settings sheet opens over the pad, because a thumb on the pad is now on a
  menu and its release will go to the menu;
- the control layout or mirror changes under a held thumb, because the contact the old
  layout tracked has no meaning in the new one;
- a pointer is cancelled by the system or loses its capture, which is the platform's way of
  saying the release will never come;
- the socket closes or errors;
- the link's own failure detector fires: no acknowledgement from the host for a bounded time
  while frames are being sent.

**Host-side paths**, which zero actions in the same mailbox the simulation reads:

- the frame is stale (see the stale-policy technique);
- the connection for the seat was replaced or closed;
- a new connection claims the seat, which discards the previous session's pressed state;
- the seat is released or pairing is reset;
- the phase of the game changes in a way that invalidates held actions (a race ends).

## The phone must detect its own disconnection

A phone cut off from the host does not get a polite message. A socket on a degraded radio
can be half-open for tens of seconds, reporting itself open while nothing moves in either
direction. The only way the phone learns the link is dead is that acknowledgements stop
arriving. So the phone runs a failure detector: it expects an acknowledgement for the
frames it sends, and when none has arrived for a bounded time (comparable to the host's
staleness limit, so both ends go neutral together), it declares the link lost, clears the
held channels, shows the player that the link is gone, and treats the next acknowledgement
as the signal to resume, with the player re-pressing rather than the pressed state
resuming on its own. A phone that keeps a pad *looking* pressed while the host has dropped
it teaches the player to distrust the display.

The same phone must not let a backed-up socket become a queue of old frames. If the send
buffer holds more than a small amount of unsent data, the phone does not append: it closes
and reconnects, or at least drops, because every queued frame is older than the one it would
send now, and queued frames deliver in a burst that the host will then reject as stale. A
controller that buffers is a controller that lies about the present.

## Resuming is a separate act from clearing

Clearing is immediate and unconditional. Resuming is deliberate: after a loss, a held
throttle does not spring back when the link recovers. The player presses again. This is the
same asymmetry as the host's stale policy, and for the same reason: a pressed state
restored from before a gap is a state nobody is currently producing.

## The instrument must be verified too

Neutrality is proved by driving the pad with multi-touch input and asserting what the host
saw. The dangerous instrument defect is releasing the wrong contact. In an emulated touch
protocol, an end event with a non-empty list of contacts may end the *listed* contacts
rather than keep them; a harness that lists the remaining contacts to model one release
actually releases the remaining ones, and the control that should stay held shows as
released, or the one that should have been released shows as latched. The false finding is
"latched button" or "release not seen", and a worker will chase a protocol bug that is a
harness bug. State the instrument's release semantics in the harness, test the instrument
against a known pad before the pad against the protocol, and never accept a latched-control
report whose harness has not been checked.

## Decision rules

- **When a new way to lose the controller is identified, add it to the list and to both
  ends.** The list is a document, and a path missing from it is an unexamined case.
- **When any path fires, send a neutral frame if the link is alive, then stop sending
  action state.** The host's own policy is the net under it, not the plan.
- **When the phone cannot reach the host, assume the host has already gone neutral.** The
  phone does not trust its display of the last state.
- **When the phone recovers, require a fresh press for any action.** Never restore from
  memory.
- **When a harness reports a latched control, check the harness's contact semantics first.**

## Evidence status

Measured by scripted checks on the host side: opening a fresh connection on a mailbox
zeroes the throttle, brake, handbrake, fire and mine; a stale frame zeroes the actions;
and the phone-side neutralisation was driven by scripted multi-touch on a real device
through the host's connection, including independent release of each pad. Authored and
simulated only: the phone-side visibility, blur, unload and failure-detector paths are read
from the page's code and exercised by scripts on an emulated browser; they have never been
exercised by a real handset locking, sleeping or losing its radio. The completeness of the
list is itself unproven: it is the list a developer thought of.

## When not to use this

- **For a controller whose actions are idempotent and harmless** (a menu cursor).
  Neutralising a cursor on blur is friction without a benefit.
- **For a session where the player expects to hold across a short interruption** and the
  game is turn-based. Resume from memory is then a feature and the cost of a mistaken
  action is small.
- **As an excuse not to build the host-side policy.** Phone-side neutrality fails exactly
  when the phone is dead; the host's policy is not optional.
