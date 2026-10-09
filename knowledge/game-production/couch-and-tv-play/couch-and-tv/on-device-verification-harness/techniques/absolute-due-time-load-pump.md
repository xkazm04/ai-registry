---
layer: technique
type: technique
subject: on-device-verification-harness
technique: absolute-due-time-load-pump
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a scripted client must send input at a fixed rate to load a game, a soak reports a load rate nobody measured, the rate a test delivered is lower than the rate it asked for]
---

# Absolute due-time load pump

The named concern: a scripted client that stands in for a player at a fixed rate must
schedule each frame against the time it was due, not against the time the previous frame
was sent, and must report the rate it actually delivered.

## What goes wrong with a relative interval

A repeating timer asks the host to run a callback "about every N milliseconds after the last
run". Three effects stack. The host rounds the period to its own timer resolution, which on
some hosts is coarser than the period itself. Each callback starts late by whatever the
scheduler cost, and the next period is counted from the late start, so lateness accumulates
instead of cancelling. And a busy script, a collection pause or an unrelated process
stretches single periods without anything being made up afterwards. The result is a load
generator that delivers materially less than it was told to, steadily, while its
configuration says otherwise. A thirty hertz request that arrives as twenty-two is a
quarter of the load missing, and every conclusion drawn about headroom is drawn at the
wrong operating point.

This is the same disease as the closed-loop load generator in service benchmarking: a
generator whose next send is triggered by its own previous send slows down exactly when the
system under test slows down, and so under-reports the stall it caused. A fixed-rate
generator must behave as an open one: the schedule is a property of the clock, not of the
generator's progress.

## The pump

Hold a monotonic start time and a counter. The due time of frame *k* is the start time plus
*k* times the period. On each wake, read the clock; if the due time has passed, send one
frame and advance the due time by exactly one period; then arm the next wake for the
interval remaining until the due time, floored at zero. The accumulated error is zero by
construction because every due time is derived from the start, not from the last wake.

Three guards make it safe on a shared, small machine.

**Bound the catch-up.** If the pump is so late that several frames are overdue, sending them
back to back is a burst the real client would never produce, and it can itself cause the
stall it is meant to measure. When lateness exceeds a stated limit, a few periods, discard
the backlog and re-anchor the schedule to now. Count each re-anchor; a pump that re-anchored
often was starved, and its run is a statement about the host machine.

**Compute the content from the due time, not from the wake time.** Steering that is a sine
of elapsed time should read the elapsed time of the scheduled frame, so a late wake does not
distort the waveform.

**Report the delivered rate.** At the end, divide frames sent by elapsed monotonic seconds
and publish that beside the requested rate and the number of re-anchors. A load figure with
only the requested rate is a wish.

## Where the pump runs

The pump belongs on a quiet machine. Run it on the controlling host, not on the device under
test, and keep the host's own load low: a measurement command that shells out to the device
every few seconds can starve a single-threaded pump, so slow, expensive probes run
asynchronously beside it and never inline with it. State which host ran the pump, because a
laptop and a desktop of different timer resolution deliver different rates for the same
script.

A pump on the controlling host removes the host's timer error and leaves the network in
the path. The input still crosses a wireless link and the device's own scheduler before it is
consumed. The pump measures what was sent on time, not what arrived on time.

## Decision rules

- **When the requested rate is not delivered within a stated tolerance, the run is invalid for
  any rate-dependent claim.** Report it as a run at the delivered rate, not at the requested
  one.
- **When the requested period is below the host timer resolution, pace in batches against the
  absolute schedule rather than shortening the period.** The honest alternative is to say the
  host cannot generate this rate.
- **When several simulated clients run, give each its own schedule but a common start.** Their
  relative phase is then fixed and stated, not an accident of the order they were created.
- **When a long run drifts from its schedule at all, that is a defect in the pump.** An
  absolute schedule has no drift; any residual is the host's lateness, and it belongs in the
  re-anchor count.
- **When the pump is used to prove a limit of the game, such as stale-input rejection, send
  the deliberately stale frame as a separate, labelled act.** Never let the load waveform
  double as the fault injection.

## When not to use it

When the point of the run is to observe behaviour under an irregular, human-like input, drive
it from a recorded trace of real timestamps instead, and say that the trace, not the pump, set
the timing. And when a single frame is the stimulus, no pump is needed at all.

## Evidence status

Measured on one controlling machine and one device: a naive thirty-three millisecond interval
delivered about twenty-two and a half hertz; the absolute-schedule pump reached about thirty,
and the delivered rate was printed. The effect of a real phone's own timer jitter, and of a
radio link with other traffic, was not measured; the clients were scripts, never a person.
