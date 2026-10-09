---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: link-rate-follows-the-phase
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a phone sends controller frames at race rate while the player sits in a menu, choosing the heartbeat rate and the host's liveness thresholds together, a controller keeps retrying a host that is off or asleep]
---

# Link rate follows the phase

The concern: the snapshot cadence that makes a controller safe in a race is waste everywhere else.
A phone that sends thirty frames a second while its player browses a garage menu keeps its page's
main thread busy and the host acknowledging thirty frames a second per seat, for input the host
does not consume outside the race. Menus, lobbies and result screens are where a couch session
spends most of its minutes, so this is where a controller's processor and a weak host's socket
thread are actually spent. The remedy is to tie the cadence to the phase in which input is
consumed — and the trap is that the cadence is also the heartbeat every staleness rule in the
protocol is calibrated against, so the rate and the thresholds must change together, and the rate
may drop only when dropping it cannot make a held control look stale.

## Procedure

**1. Name the phases in which the host consumes continuous input.** Typically the countdown and the
race. Everywhere else the host reads discrete selections and administrative messages, which travel
as their own acknowledged messages or as indices in the next frame.

**2. Keep the full cadence while any control is held.** Whatever the phase, a held control is
reported at the rate the host's staleness limit was set for. The host zeroes an action channel it
has not heard about recently, so a held control reported at a menu rate would be released by the
host between frames. Holding is the condition, not the phase alone.

**3. Drop to a heartbeat rate when nothing is held outside those phases.** A few frames a second is
enough to keep the seat alive and the clock offset fresh. Contact changes still send immediately, at
any rate, so a press in a menu is never delayed by the slower cadence.

**4. Switch the thresholds with the rate, from one table.** The phone's acknowledgement-loss detector
and the host's quiet-link limit are both multiples of the send interval; at the slow rate they
widen, at the fast rate they narrow, and a short grace period covers the switch so the first slow
interval is not mistaken for a loss. The rate and its thresholds live in one place both ends read,
because a host limit tuned for thirty frames a second will declare a four-frame-a-second phone dead
([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).

**5. Stop sending while the page is hidden, and tell the host.** A locked or backgrounded phone sends
a visibility message; the host stops building and sending the display stream for that seat while
keeping the seat, and resumes with a full snapshot when the page returns. The page stops its own
send loop too, and must: browsers throttle a hidden page's timers, but commonly exempt a page with
an open real-time socket so that the socket does not time out, so a controller page keeps sending
at full rate while hidden unless it stops itself. A hidden page may also be frozen or discarded by
the browser, so the return to visibility reconnects rather than assuming the socket survived. The
neutral state on hiding is the loss-path technique's job; this step is about not paying for a link
nobody is looking at.

**6. Back off reconnection, and do not retry while hidden.** A controller whose host is off retries
at growing intervals with a cap — sub-second, then a few seconds — resetting on a successful welcome,
and schedules nothing while its page is hidden, because becoming visible reconnects at once. A fixed
short retry interval opens a socket every second for as long as the television is off.

**7. Measure each phase separately.** Frames per second, bytes per second and the page's main-thread
time per second, in a menu and in a race, before and after, with the host and the browser they were
measured on ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When the rate drops, the liveness thresholds widen in the same change.** A rate change alone
  produces false disconnects in exactly the phase where nobody is watching.
- **When a control is held, the race rate applies, in any phase.** The heartbeat exists for the
  staleness rule, and the staleness rule exists for held controls.
- **When a phase change raises the rate, raise it before the phase's first consumed frame.** The
  countdown is the place: input must be at race rate before the first step that reads it.
- **When the saving is claimed for a phone's battery or radio, say whether a handset was measured.**
  Fewer frames and fewer main-thread milliseconds in a desktop browser are counts and host timings;
  battery life on a handset is a separate, unmeasured claim until a handset is measured
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)). Do not infer radio
  savings from the rate: platform guidance for mobile radios notes that traffic as sparse as one
  request every fifteen seconds can hold a radio awake, so four frames a second saves bytes,
  acknowledgements and page work, and the radio rests only when the link goes quiet — a hidden
  page, not a slower one.
- **When many controllers may reconnect at once, add randomness to the backoff.** A couch has a few
  phones and a fixed schedule is harmless; a host restarted under many clients is not.

## When not to use

Not for a controller whose host consumes continuous input in every phase — a menu driven by an
analogue cursor, a game with no menus. Not where the transport has no other liveness signal and the
slow rate would make loss detection too slow for the phase that follows: then keep the rate and
shrink the frame. And not before the staleness and loss-path rules exist; a rate tied to the phase
in a protocol without them only makes a stuck control rarer, not impossible.
