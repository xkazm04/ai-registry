---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: optical-flash-frame-count-protocol
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a real input-to-photon figure is required, a consumption-age figure is about to be quoted as screen latency, planning a hardware gate on a television]
---

# Optical flash frame-count protocol

Software cannot see the display. Every timestamp a program takes ends at the moment it
handed a frame to the system; what the panel does afterwards is invisible to it, and on a
television that tail is large, variable and set by settings the player may or may not have
changed. The only honest input-to-photon figure comes from a camera that watches both the
input and the screen in the same exposure, so that one clock, the camera's frame counter,
times both events.

## Making the event unmistakable

Build a flash mode into the controller and the screen. When the player triggers it, the
controller shows a full-bright field as soon as it can after the touch, and the input it sends
carries a flag; the screen, on accepting that input, replaces exactly one following frame
with a full-bright field. Now both devices produce a high-contrast event that a human or a
script can find in video without interpreting game content. Three rules keep the event
honest. The flash must be a single frame, so the end of the interval is unambiguous. The
screen must act only on an input that was accepted, so a stale or rejected input does not
produce a flash that an unrelated later input claims. And the flash must go through the
same path as ordinary input and the same render path as ordinary frames, not a special
fast lane, or the test certifies a path the player never uses.

## Where the clock starts

The controller's bright field is not the touch. The phone takes the touch, runs the handler,
sends the message, and only then composes and scans out the frame that carries its own flash.
So the message is already on its way, and often already at the screen device, before the
start marker appears. The interval from the controller's flash to the television's flash is
the true touch-to-photon latency minus the phone's own touch-to-photon latency. Every term in
that subtraction is positive, so the reading is a strict lower bound. It is a flattering
reading, the kind this subject exists to stop.

The missing part is large. A published comparison of touch devices and toolkits measured
end-to-end touch latency from 48 to 276 ms depending on the device, system and toolkit, and a
browser page sits toward the slow end. It is not a constant either. The phone's flash waits
for the phone's own refresh, so the shortfall jumps by a whole phone frame from tap to tap,
independent of the television's phase. That widens the measured distribution instead of
shifting it, so it cannot be subtracted once.

Two honest starts exist, in order of preference:

- **An instrumented touch.** A conductive stylus or a probe that closes a small light circuit
  on contact puts the physical touch in the camera's frame. Or replace the camera with two
  light sensors and a logger, which resolve in microseconds and automate a hundred taps. This
  removes the phone's display from the start entirely.
- **A measured phone leg, carried beside the figure.** Film the finger against the
  controller's flash in the same session to get the phone's touch-to-photon distribution, and
  report it next to the flash-to-flash distribution. The sum is a derived estimate. Label it
  that way, with the error of both.

A flash-to-flash figure with neither of these is labelled *flash-to-flash, lower bound*. It is
never input-to-photon, and never set beside a budget.

## Procedure

1. Frame the start event (the instrumented touch, or the controller screen) and the
   television in one shot, with the camera steady and fixed exposure so bright fields do not
   bloom across several frames. Put both at the same height in the frame: a high-speed phone
   camera reads its sensor row by row, so two events at different heights are timed with
   different offsets. Set the controller to full brightness, because a dimmed panel can flicker
   the flash.
2. Record at the highest frame rate the camera captures natively, without dropping frames,
   and never in a mode that interpolates frames into a slow-motion clip; at two
   hundred and forty frames per second one frame is about four milliseconds, at sixty it is
   seventeen and the instrument is too coarse to resolve the budget it is meant to judge.
3. Take at least thirty taps, spaced irregularly so the touch does not lock to the display
   refresh phase. Thirty is a floor for reading a median. At thirty the ninety-fifth
   percentile is about the second-worst tap, so label it rough. About sixty taps are needed
   before even the worst one bounds the ninety-fifth percentile with ordinary confidence.
4. For each tap, count the camera frames from the first frame in which the start event is
   visible to the first frame in which a fixed region at the vertical centre of the
   television visibly changes from black. Multiply by the camera's frame period. A
   television draws its picture from top to bottom over one refresh. A full-screen field is
   seen first in the top band, which reads up to half a refresh earlier than the centre that
   display testers measure at. "Changes" means the onset of the change, not some fraction of
   the full transition, so the panel's response time is not counted.
5. Report the median, the ninety-fifth percentile and the maximum, with the tap count, the
   camera rate, the start event used, and the device models, firmware, radio band and
   television settings that were in force: picture mode, and whether the television's
   automatic low-latency switch actually engaged.

## Error and bias

The reading is quantised at one camera frame, and the interval has a further uncertainty of
about one camera frame at each end, since the true event happened somewhere inside the first
bright frame. Report the resolution as plus or minus one camera frame, and never quote a
median finer than that. That bar covers quantisation only. The row offset of the camera's
rolling readout and the screen position read come on top, and are controlled by the framing
and region rules above, not by the bar. The start event's own bias is the subject of the
section above and is not an error bar at all. The television's game mode, motion
smoothing and refresh rate change the answer by tens of milliseconds, so the figure holds
for the television as configured and for no other.

The interval is a sum of the stages the earlier numbers cover and the ones they do not: the
radio, the queue before consumption, the simulation step, rendering, presentation and the
panel. Comparing the optical median with the consumption-age median at the same time gives
the display-side remainder as a derived figure; carry it as derived and say what it was
derived from.

## Decision rules

- **When the camera period is more than a quarter of the budget under test, change the
  camera.** An instrument whose resolution is the size of the effect cannot judge it.
- **When any tap's flash is not visible in the next several frames, record it as a miss.**
  Dropping it silently selects for the good cases.
- **When the figure is for a pass or a fail, state the verdict's basis in the same
  line.** "Optical median" carries its tap count, camera rate and setting.
- **When the start event is the controller's own flash, the figure is a lower bound.**
  Report it as flash-to-flash, carry the phone leg beside it if one was filmed, and never
  compare it to a budget.
- **When no film exists, the optical figure is not measured.** Print it as such; never
  substitute the consumption age, the round trip, or a literature figure.
- **When the procedure is only written down and was never run on a human's setup, say that
  too.** A protocol is a plan, and a hardware gate whose figures nobody collected is open.
- **When the figure will be compared to a genre budget, take the tail, not only the
  median.** The player feels the bad taps.

## When not to use it

- **For regression tracking over a long soak.** Filming is manual and sample-limited; the
  continuous consumption-age distribution is the right instrument for drift and tails, and
  the optical run is a periodic calibration of it.
- **When the claim is about perception.** A frame count says when the pixels changed; it
  does not say whether a player noticed, which needs people.
- **On a setup that cannot be filmed in one shot**, such as one where the controller and
  television are in different rooms. Use a second clock-synchronised camera or do not claim
  an optical figure.
