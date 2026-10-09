---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: stale-hold-steer-drop-actions
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding what the host feeds the simulation when a controller goes quiet, a vehicle keeps driving after the phone stopped, steering snaps to centre on every network hiccup]
---

# Stale: hold the steer, drop the actions

The named concern: a per-channel policy for the moments when the host's newest accepted
frame is too old to describe a hand. The simulation needs a value every step, silence does
not exempt it, and the wrong value is either a car that drives itself or a car that
twitches.

## The policy

Define a staleness limit in milliseconds, and compare it two ways: the time since the host
last *received* an accepted frame, and the age of that frame's own send time translated to
the host clock. Stale means either exceeds the limit. Then, per channel:

**Hold** the channels that are positions and fail gently: the steering axis. The last known
value is the best estimate of a posture that changes over a fraction of a second, and
snapping it to centre when the link hiccups makes a vehicle jerk across the road for no
reason the player did.

**Drop to zero** the channels whose continued application is the hazard: throttle, brake,
handbrake, every fire or deploy channel. Zeroing a throttle is survivable; sustaining a
throttle for a phone that is face-down is not. Fire is the sharpest case, because a held
fire channel spends a finite resource and may hit a person who is not playing.

**Carry** the selected index of a selection unchanged. A selection is not a held command; it
selects, and applying it twice or forgetting it changes nothing until an action channel is
used, and the action channels are zeroed. (If your selection can itself be harmful, treat
it as an action.)

The result is applied at *consume* time, per simulation step, by a pure function of the
mailbox and the current time. Nothing is mutated; the last accepted frame stays in the
mailbox. A fresh frame ends staleness on its own, with no recovery handshake.

## The bound on holding

Holding the steer is correct for a short interval and wrong for a long one. A seat that
has been silent for ten seconds is not steering, and a held full-lock value will turn the
vehicle in circles for as long as the seat stays gone. The standard is a second, longer
limit after which the held channel also decays to neutral, by a ramp rather than a step so
the vehicle does not twitch. Without it the policy has no end: the hold is correct at the
moment of the first hiccup and an unexamined hazard ten seconds later. Choose the second
limit from the shortest time in which the vehicle could do real harm holding that steer,
and write it as a number with a unit next to the first.

## A late frame must not undo the policy

The failure that gives this technique its second half: a frame stamped long ago arrives
after the host has already zeroed the actions, and the mailbox accepts it because it is
newer than the previous frame by sequence. The throttle is restored from a ghost. The
mailbox therefore applies the age check on *receipt* as well as on consume, rejects the
old frame, and still advances the sequence so even older frames are rejected after it. A
frame that is both newer by sequence and too old by age is dropped and counted; it does not
revive anything.

## Decision rules

- **When a channel's continued application causes harm, zero it on staleness.** Default to
  zero and justify every exception in writing.
- **When a channel is a slow position, hold it, and bound the hold.** Hold without a bound
  is a bug with a delay on it.
- **When a stale frame arrives, count it as stale and expose the count.** A policy that
  never reports how often it fired cannot be tuned.
- **When tuning the limit, set it against the sending cadence.** A limit under two or three
  send intervals zeroes the throttle on ordinary jitter; a limit over half a second hands
  the player a vehicle with a dead phone for a perceptible time. A quarter of a second is a
  starting value for a thirty-per-second link, not a measured optimum.
- **When the policy zeroes the actions, tell the phone.** A phone that does not know its
  frames were treated as stale shows a pressed button the host ignores, which feels like a
  bug in the game.

## Evidence status

Measured by scripted checks on the mailbox: with a quarter-second limit, a frame just under
the limit passes throttle through, a frame just over it returns steering held and throttle
and brake zero, a late-stamped frame is refused and cannot restore throttle, and a stale
check counts. Simulated: nothing about real jitter. Authored, and not yet satisfied by
the reference implementation: the second, longer limit that decays a held steer. The
check holds steering at both a quarter second and 400 ms; no check shows it ever returns
to neutral. Whether a quarter second feels right to a human, or whether the unbounded hold
matters in a real race, is unmeasured and no human has driven it.

## When not to use this

- **For input that is not self-correcting under a hold either way.** A vehicle whose steering
  is itself a rate command (held input means turning faster) must zero it too.
- **For a game whose host can pause on silence.** A turn-based or couch party game may
  prefer to freeze the simulation and wait for the seat; the policy exists for simulations
  that cannot wait.
- **As a substitute for the phone neutralising itself.** Both ends zero; the host policy
  covers the cases the phone cannot report.
