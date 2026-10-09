---
layer: technique
type: technique
subject: drawn-gesture-command-recognition
technique: pen-down-stroke-segmentation
status: draft
laws: [structural-proof-is-never-sufficient, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a continuously tracked hand must be cut into discrete drawn strokes, a recognizer fires on the hand's return path, deciding what starts and ends a drawn command]
---

# Pen-down stroke segmentation

The named concern: a tracked hand never lifts off anything. Its position arrives every
frame whether the player is drawing, resting, reaching or returning to a start point. A
drawn command exists only between a pen-down and a pen-up that the game invents, and the
segmentation that invents them decides more of the feature's felt quality than the
matcher does.

## The pen signals, and what each costs

**An explicit pose held for the whole stroke**, such as a pinch or an extended index finger
with the other fingers curled. It gives the cleanest boundaries and a clear sense of
control. Its costs are fatigue, a pose the tracker sometimes loses during fast motion, and
a release that tends to flicker at the end of a stroke.

**A pose to start and a dwell to end.** Fatigue is lower, but the dwell adds its full
length to every command's latency, and a player who pauses mid-shape ends the stroke early.

**Speed alone**: the stroke starts when the hand speeds up and ends when it slows down.
It needs no pose, and it is the source of the return-path defect. The travel back to the
next start point is as fast as the stroke, so it is segmented as a stroke.

**Proximity to a declared drawing surface**, a plane in front of the player that the hand
pushes through. It brings back something like contact. It needs a visible surface and
assumes the player stays where the plane is.

Choose the signal the player can feel, and show its state. A player who cannot see whether
the pen is down cannot tell a missed command from a rejected one.

## Procedure

1. **Debounce both edges with hysteresis.** Pen-down requires the pose or the condition to
   hold for a few consecutive samples above an entry threshold. Pen-up requires it to fall
   below a lower exit threshold for a few samples. A single-threshold edge flickers at the
   boundary, and every flicker is a split stroke.
2. **Keep a pre-roll buffer.** Retain the last fraction of a second of samples before
   pen-down and attach them to the stroke as history, not as shape. The shape starts at
   pen-down. The onset of the motion may lie earlier, and the timing subject needs to see it.
3. **Reject strokes that are too short or too fast to be drawn.** A minimum path length
   and a minimum duration, both in data, remove twitches and tracker spikes before they
   reach the matcher.
4. **Abort on tracking loss, never commit.** If the hand is lost or confidence falls below
   the floor mid-stroke, the stroke ends as aborted. Treat a gap shorter than a few samples
   as a gap and interpolate it. Treat a longer one as the end of the attempt. A stroke
   completed by joining the last good sample to the first sample after the gap is a shape
   the player never drew.
5. **Cut the return path explicitly.** With a pose pen, the return happens with the pose
   released. With a speed pen, require a pause below the speed floor before a new pen-down
   may fire, and discard any stroke that starts within a short refractory interval after
   the previous pen-up.
6. **Time the confirmation.** Log the interval between the real end of motion and the
   moment pen-up is confirmed. That interval is pure latency added to every command, and it
   is the debounce's price.

## Decision rules

- **When the vocabulary has multi-stroke shapes, set a joining gap and say so.** Strokes
  separated by less than the gap form one command. The gap is added latency for every
  single-stroke command, so a vocabulary that needs it should be small.
- **When the pen pose is also a game action** (a pinch that grabs, a fist that defends),
  **resolve it by context, not by timing races.** A pose with two meanings is decided by
  what the hand is near or which mode is active. Two recognizers listening to one pose fire
  together.
- **When strokes split mid-shape, inspect confidence first and thresholds second.** Most
  splits come from the tracker losing the pose during fast motion, and the fix is a
  confidence-aware debounce rather than a wider threshold.
- **When latency is over budget, shorten the confirmation before you shorten anything else.**
  The matcher is rarely the cost.
- **When a gate measures how big a stroke or a mark is, measure its reach, not its path.**
  Reach is the extent of its bounding box. A tracker that predicts between its camera
  samples runs past every corner and every stop, then snaps back at the next sample. Each
  overshoot is counted twice in the path length and barely at all in the reach. A jagged
  mark's path grows past a straight line's, while its reach stays small.
- **When the sensor updates more slowly than the game frame, a re-sent sample is not a new
  sample.** Speed computed against a repeated pose reads as a stop, and a speed pen ends the
  stroke there. Carry the last measured speed across repeated samples.
- **When a stroke's sample count is zero or near zero, the segmenter reports it.** A
  recognizer fed an empty stroke reports a match on nothing. An instrument proves it had
  input before it reports a verdict.

## When not to use it

- **For held poses with no path.** A static pose, such as an open palm held out as a ward,
  needs a pose classifier with a hold time, not a stroke segmenter. The two may share a
  debounce, but nothing should be resampled.
- **When input already has contact**, such as a touch screen or a stylus. The surface gives
  the pen for free. Do not rebuild it from speed.
