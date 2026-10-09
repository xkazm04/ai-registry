---
layer: technique
type: technique
subject: hand-tracked-timing-windows
technique: sensor-latency-inside-the-window-budget
status: draft
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [setting a reward window on an input channel with measurable sensor delay, one rule ships on a button channel and a tracked-hand channel, a runtime update changed the measured delay]
---

# Sensor latency inside the window budget

The named concern: a tracked-hand channel delivers its samples tens of milliseconds after
the motion, and the delay differs between devices, runtime versions and tracking modes. A
window that silently absorbs that delay, because it was widened until it felt right, holds
an unknown amount of compensation that no one can update. This technique keeps the window
and the delay as separate quantities, each with one authority.

## Three quantities, three owners

- **The window width, in onset time.** This is a design decision about how forgiving the
  defence is, and it is the same number for every input channel. It lives in the design
  canon.
- **The channel's latency**: from the physical motion to the sample's delivery to the game,
  measured per device and runtime and recorded with its protocol, date and label. It lives
  beside the channel's configuration, and it is never typed into the window.
- **The classifier's hold**: the samples the recognizer needs before it fires. This is a
  property of the recognizer, and it is read from the recognizer's own configuration.

With onset recovery in place, the verdict needs only the width. The latency and the hold
set two other things: the **resolution horizon**, which is how long after the window closes
the game must wait before declaring a miss, and the **feedback delay**, which is how long
after the onset the player can first see the result.

## Procedure

1. **Measure the channel.** Obtain the tracked-hand latency with the instrumentation
   subject's protocols. A filmed motion against the rendered hand gives an input-to-photon
   figure. Logged capture and delivery timestamps give the pipeline share. Label each
   figure as the instrumentation subject requires. A figure from someone else's device,
   article or runtime is a reference, not a measurement of this build.
2. **Set the resolution horizon** to the measured high-percentile delivery latency plus the
   classifier's hold, plus one sample. Until the horizon passes, an unresolved window
   remains open, even though game time has passed its end.
3. **Design the presentation for the feedback delay.** Where the feedback delay is close to
   or larger than the window width, the effect of a block cannot be shown at the onset.
   Start the defensive animation from the onset-recovered pose as soon as classification
   lands, and resolve the incoming hit's impact only after the horizon. Never let the hit
   land visually and then be retracted.
4. **Write both figures into the build's evidence record**: width (canon), latency (measured,
   labelled), hold (recognizer), horizon (derived). Name the derivation.
5. **Re-measure on every runtime or tracking-mode change.** A changed delivery latency changes
   the horizon and the feedback delay. It does not change the width.

## What latency testing can and cannot show on the desk

Replayed clips with an injected delay between the motion and the moment the pose becomes
classifiable test the recovery. With onset recovery working, the verdict should be identical
at every injected delay up to the horizon. They also test the sensor's sample grid, if the
replay resamples clips at the sensor's rate and at several phases. They do not measure the
device's real latency, which still needs the instrumentation subject's protocols on the
device. A desk result is labelled as a model or as synthetic, and it never fills the
device row.

## Decision rules

- **When the tracked channel feels harder than the button channel at the same width, measure
  before widening.** The cause is usually a missing onset recovery or a premature miss, and
  a wider window hides both.
- **When a channel's latency cannot be measured yet, mark it unmeasured and use a stated
  provisional value with its source.** Do not tune a width to cover it.
- **When the high-percentile latency is much larger than the median, set the horizon from the
  high percentile.** Setting it from the median declares misses for exactly the tail where
  tracking is struggling.
- **When a separate easier width is wanted for a tracked channel, it is a difficulty decision
  and is named as one** in the canon, not hidden as latency compensation.
- **When two runtime versions are supported at once, carry two measured latencies.** Their
  average describes neither.

## When not to use it

- **For an untimed command**, where the classification instant is good enough and no window
  exists.
- **When the game deliberately judges in classification time** because history is
  unavailable. Then the measured latency must be added to the width, and the canon records
  that compensation as a labelled compromise with its measurement.
