---
layer: technique
type: technique
subject: hand-tracked-timing-windows
technique: onset-recovered-from-tracking-history
status: draft
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a gesture is classified some frames after it began, a timed defence must be judged at the instant the hand started moving, a confidence threshold is delaying the timestamp]
---

# Onset recovered from tracking history

The named concern: a tracked motion is recognised after it has happened. The recognizer's
instant is late by the sensor pipeline and by the recognizer's own need for confident,
repeated samples, and the amount varies per motion. The instant the player experiences as
the action is the motion's onset. That onset is already in the sample history when the
recognizer fires, so the game recovers it from there.

The general rule, that a window is judged from an input's onset rather than its recognition,
belongs to the combat semantics subject. This technique is the sensor-side procedure that
makes the rule possible for a tracked hand.

## What the history must hold

- **The best timestamp the sensor offers**, in the game's clock. A sample's capture time is
  ideal. Some runtimes never expose it. They predict each pose forward to the display time
  the game asked for and stamp the sample with that same time. In that case the onset can
  be no earlier than the first predicted sample that shows motion, and the record should say
  which timestamp was used. A history stamped with processing time recovers the processing
  time's onset.
- **Position and orientation** of the tracked point the motion is about (the palm centre for
  a ward, a fingertip for a stroke), plus the confidence of each sample.
- **A tracking-state flag** per sample: tracked, low confidence or lost. Gaps are marked,
  never filled with copies of the last sample.
- **Whether the sample is new.** When the sensor updates more slowly than the game frame, the
  same pose is re-sent for several frames. Speed computed against a re-sent pose is zero, and
  a backward walk stops on it as if the hand had come to rest. Carry the last measured speed
  across re-sent samples.
- **Enough depth**: at least the longest lookback the rules allow, plus a margin. A short
  ring buffer silently clamps every recovered onset to its oldest entry.

## Procedure

1. When the recognizer fires, take the classification sample as the search start.
2. Measure speed over a span of at least one sensor period, not between consecutive game
   frames. A predicting runtime jumps at each new camera sample and runs on at the old
   velocity in between, so frame-to-frame speed shows spikes that are not motion. Where the
   motion has a direction, measure speed along it, so that a prediction's snap-back reads as
   slowing and not as a new motion.
3. **Walk past the settle first.** A hand often reaches the target position, holds nearly
   still, and only then turns into the pose the classifier accepts. Walking back from the
   classification therefore meets stillness before it meets the motion. A search for "the
   most recent rest" stops there and returns an onset after the motion has ended. Bridge
   slow samples backwards only while the hand stays where the pose is held, and only for a
   bounded **settle tail**. Measure that tail on a test clip that rises, settles and then
   turns, at the largest latency the window must tolerate.
4. **Then walk the fast region** back to the first sample above the **onset threshold**. Set
   the onset threshold above measured tracking jitter at rest and below the motion's early
   speed. That sample is the onset.
5. **Bound the walk at the last release.** A quick re-raise must not walk into the lowering
   that came before it, or the onset lands before the release and freshness rules are judged
   on a negative gap. For the first action of a session, bound the walk at the first sample
   seen in the rest position, so the onset cannot be an earlier fidget.
6. **Stop the search at a gap.** If the backward walk meets a lost or untrusted sample before
   finding the onset, the onset is unrecoverable. Fall back to the first trusted sample
   after the gap and flag the verdict as onset-uncertain.
7. Record both instants, onset and classification, with the verdict. The difference is a
   per-action measurement of recognition delay and should be logged as a distribution.

## The floor of the error is the sensor's sample grid

Onset recovery removes the pipeline's latency from the verdict. Once it is in place, injecting
more latency moves the classification but leaves the recovered onset where it was. It cannot
remove the sensor's sampling. When the sensor updates more slowly than the game runs, the
first sample that shows motion arrives up to one sensor period after the motion began, and
how late it is depends on the phase of the motion relative to the sensor's clock. That
residue is the error floor. A bar of "the authored instant, plus or minus one game frame" will
fail on the grid even when latency is fully compensated. Two fixes exist. One is a window
that tolerates one sensor period. The other is stamping the onset earlier by a measured
fraction of the period, which requires knowing the real sensor rate.

## Decision rules

- **When the onset threshold is set, measure the jitter first.** Hold a hand still in front of
  the sensor, record speed, and place the threshold above a high percentile of it. A
  threshold under the jitter finds an onset in noise at every sample.
- **When the defence is a pose rather than a motion** (an open palm raised), **the onset is
  the start of the raise**, not the instant the pose became classifiable. Recover it the same
  way, from the palm's speed.
- **When the settle tail is chosen, choose it from the settle clip, not by feel.** A tail that
  is too short returns "classification minus the tail" for every slow settler.
- **When recovered onsets cluster at a bound, the bound, the tail or the threshold is
  wrong.** Inspect them before trusting any verdict.
- **When the error is tested, inject latency into replayed clips and check that the onset
  does not move.** If it moves with the injected latency, the recovery is not working.
- **When onset recovery is added to a live game, re-tune nothing on the same day.** Windows
  tuned against classification time were compensating for the delay. Measure how much
  earlier onsets land, then narrow the widths by a measured amount.
- **When the input is a button, skip this technique.** The press is the onset, to within the
  polling interval.

## When not to use it

- **For commands whose timing does not matter**, such as drawing a shape to choose a spell.
  The classification instant is fine there.
- **When the sensor's history is not retained or not timestamped.** Then the onset is not
  recoverable. The game must say that its windows are judged in classification time and
  widen them by a measured latency, as a labelled compromise.
