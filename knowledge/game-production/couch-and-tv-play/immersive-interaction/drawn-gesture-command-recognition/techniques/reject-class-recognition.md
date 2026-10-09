---
layer: technique
type: technique
subject: drawn-gesture-command-recognition
technique: reject-class-recognition
status: draft
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [choosing a recognizer for a small command vocabulary, a stray motion triggers a command, every input is forced onto its nearest template]
---

# Reject-class recognition

The named concern: a nearest-template recognizer is a function from every possible input to
one of its templates. It has no way to say "none of these" unless one is built for it. In a
game where the same hand draws commands, defends, reaches and gestures at the screen, most
motion is not a command. A recognizer without a reject class turns that motion into casts.

## Choosing the recognizer

For a small vocabulary (roughly up to twenty shapes) drawn by one tracked point, a template
matcher of the resample, normalise and compare family is the right default. It needs a few
examples per shape, no training run and no data set. Its scores are bounded and comparable
across inputs, which is what makes a reject threshold possible. It runs in microseconds per
template, and its failures can be read by plotting the stroke over the template. Reach for a
trained classifier when the vocabulary is large, when shapes differ by dynamics rather than
path, or when a held-out cross-user corpus of hundreds of strokes per shape exists. The
reject discipline below applies to both kinds.

Decide what the matcher compares: an ordered path, which is sensitive to direction and
start point, or an unordered point cloud, which is not. That choice is a vocabulary
decision, and the distinctiveness audit has to know it.

## The four refusals

1. **Structural preconditions, checked before matching**, for properties that normalisation
   erases. Scaling a whole gesture to a unit box makes a small mark inside a large loop look
   like a full-size mark. A loop with a tiny scribble then scores as close to a real command
   as the sloppiest real drawings do. When impostor scores overlap the tail of correct
   scores, no floor can separate them: any floor that rejects the impostors also rejects
   real commands. A gate on the gesture's own proportions, measured before normalisation,
   can. Examples are "a closed loop is present" and "the inner mark reaches at least a given
   fraction of the loop's size".
2. **An absolute floor.** Reject when the best score is below a threshold. The floor is the
   main guard against non-command motion.
3. **A margin.** Reject when the best and second-best scores are too close, either as a
   difference or as a ratio. An ambiguous stroke must not be resolved by a coin flip that
   favours whichever template sorts first.
4. **Explicit garbage templates**, where the vocabulary has known look-alikes: the defensive
   raise, the reach, the hand dropping back to rest. When the nearest template is a garbage
   template, the stroke is rejected however well it scores. This is cheaper and more honest
   than raising the floor until the look-alike fails, because a raised floor also rejects
   real commands.

Thresholds may differ per template, because shapes differ in how tightly people draw them.
Every threshold lives in the design canon's data, with its corpus and date beside it.

## Setting the thresholds from a negative corpus

A threshold set by watching positive examples pass is not set, it is guessed. Assemble a
**negative corpus**: segmented strokes that are not commands. Include recorded idle motion,
reaches, defensive motions, return paths, and synthetic noise shaped like hand motion. Then:

1. Score every negative and every held-out positive against the vocabulary.
2. Plot both score distributions per template.
3. Choose the floor for a target false-accept rate on the negatives. Do not choose it to
   maximise accuracy on positives, because continuous input is mostly negatives and a
   threshold tuned on positives is tuned for the rare case.
4. Report the resulting false-reject rate on positives beside it. The pair is the
   operating point. Neither number alone is.

When no negative corpus exists, the false-accept rate is **unmeasured**, and the report says
so instead of omitting the row.

## Making rejection visible

A rejected stroke was an attempt. Show it: a fizzle, a dissolving trace, a brief cue that
the shape was seen and refused. A player who gets no feedback cannot tell a rejection from
a segmentation miss. They will draw harder, faster and larger, which makes the next stroke
worse. Log every rejection with its best template, best score and margin. The rejection log
is the input to the next round of threshold and vocabulary work.

## Decision rules

- **When a false accept costs more than a false reject, raise the floor. When it is the
  other way round, lower it and say why.** In combat an unwanted cast usually costs more
  than a fizzle that is redrawn, but a cast that the player needs in order to survive
  reverses that. The cost model belongs in the canon beside the threshold.
- **When one look-alike motion causes most false accepts, add a garbage template or a
  structural gate before moving the floor.**
- **When every bucket reports a zero reject rate, rejection is inactive, not perfect.** A
  floor placed above the worst correct match without scoring any impostor rejects nothing.
  The tests then prove only that every drawing is classified as something.
- **When the margin rejects many strokes between the same two templates, the vocabulary is
  the defect.** Hand it to the distinctiveness audit and do not tune the margin down.
- **When scores are compared across recognizer versions, re-derive the thresholds.** A
  change to resampling or normalisation moves every distribution.

## When not to use it

- **When the input is already a deliberate, discrete command**, such as a button press or
  a menu selection. Rejecting it adds friction with no benefit.
- **In a pure practice mode where every shape is wanted**, a reject class may be relaxed for
  feedback. It is never relaxed in the mode that is scored.
