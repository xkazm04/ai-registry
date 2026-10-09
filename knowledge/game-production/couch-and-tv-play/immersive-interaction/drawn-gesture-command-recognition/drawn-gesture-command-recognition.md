---
layer: golden-path
type: golden-path
subject: drawn-gesture-command-recognition
status: draft
use_when: [a tracked hand draws or poses a shape that the game must turn into a command, a stray motion casts something the player never meant, a gesture recognizer is about to be called accurate or fast enough]
techniques:
  - pen-down-stroke-segmentation
  - stroke-plane-projection
  - reject-class-recognition
  - vocabulary-distinctiveness-audit
  - held-out-cross-user-acceptance
---

# Drawn gesture command recognition

A game that lets a tracked hand draw a shape in the air, or hold a pose, and turns that
shape into a command has built a recognizer. The recognizer itself is the easy part.
Template matchers that resample a stroke, normalise it and compare it point by point
against a few stored examples have been reliable on flat input for two decades. They need
no training run and they reach high accuracy with a handful of templates per shape. What
decides whether players feel the feature as magic or as a lottery is everything around
the matcher. That means where a stroke starts and ends, which flat picture of a
three-dimensional motion is compared, what happens when the motion matches nothing, which
shapes are allowed into the vocabulary at all, and whose strokes the accuracy figure was
measured on. This subject owns that surrounding machinery and the acceptance of it.

## The pipeline, and where each stage fails

A drawn command passes through six stages. Each has its own characteristic failure, and a
symptom seen at the end usually started earlier.

1. **Segmentation** cuts discrete strokes out of continuous tracking. It fails by
   including the hand's travel back to the start position, by splitting one stroke at a
   tracking dropout, or by waiting so long to confirm the end that the command arrives late.
2. **Projection** turns a stroke drawn in space into the flat picture the templates are
   drawn in. It fails when the player draws at an angle and the shape foreshortens, or when
   the projection's in-plane axes flip and a shape reads mirrored or rotated.
3. **Normalisation** removes what the vocabulary declares irrelevant: position, size,
   sometimes rotation, sometimes direction. Every invariance it grants is a pair of shapes
   the game can no longer tell apart.
4. **Matching** finds the nearest template. It never fails to answer, which is the problem.
5. **Rejection** decides that the nearest template is not near enough. It is the only stage
   that can say "that was not a command", and a recognizer without one turns every stray
   motion into a cast.
6. **Commitment** hands the command to the game with a timestamp. The timestamp a timed
   mechanic needs is the motion's onset, not the instant of recognition, and that recovery
   belongs to the sibling subject on hand-tracked timing windows.

## What a principal practitioner holds true

**A matcher always answers; rejection is a design decision, not a tuning detail.** A nearest-
template recognizer maps every input onto its closest template, so a reach for a cup, a
defensive raise and a wave each become a command unless something refuses them. The
refusal has two parts. An absolute floor rejects anything too far from every template. A
margin requirement rejects anything nearly as close to a second template as to the first,
because an ambiguous stroke is a coin flip. Both thresholds are set from a corpus of
motion that is not a command, recorded or synthesised on purpose, and never by watching the
author's own strokes pass. Some impostors cannot be refused by any score. Normalisation
scales a gesture to a unit box, so a small scribble inside a loop scores as close as a
sloppy real command, and the two score distributions overlap. Those impostors are refused
by structural gates on the gesture's own proportions, checked before normalisation.

**The pen is the hardest part of air drawing.** On a surface, contact marks where a stroke
begins and ends. In the air there is no contact, so the game must invent one: a held pinch,
a pointing pose, a dwell, a speed threshold, or proximity to a declared drawing plane. Each
choice trades false strokes against latency and fatigue. The most common defect it causes
is the return path. The hand travels back to start the next stroke, and that travel is
read as a stroke of its own. An explicit pen signal with hysteresis removes most of it.
Implicit segmentation by speed alone almost never does.

**Every invariance is a vocabulary rule.** Rotation invariance makes a stroke drawn upward
and one drawn to the right the same shape. Scale invariance makes a small circle and a
large one the same. Matching on an unordered point cloud makes clockwise and anticlockwise
the same. A team that picks the invariances for robustness and the vocabulary for flavour
ships pairs of commands that the recognizer was told to treat as identical. Choose the
invariances first, write them down, and admit only shapes that differ in something the
recognizer still sees.

**Air strokes are not flat, and the templates are.** A player facing slightly away from the
plane the game assumed draws a circle that the projection turns into an ellipse. A plane
fitted to the stroke itself removes the facing error. It also introduces a new one, because
a fitted plane has no natural "up", and a shape projected without a stable up axis can come
out rotated or mirrored. The projection takes its in-plane orientation from something the
player does not control: gravity, or the head's forward direction at the start of the stroke.

**Accuracy belongs to a population, and the author is not in it.** Strokes from the person
who drew the templates are the most flattering test set possible. They share that person's
proportions, speed, start points and habits. Recognition rates on held-out users routinely
fall well below the author's own figures, and a few examples from a new user recover much
of the gap. Acceptance is therefore a figure on strokes from people whose strokes formed no
template, reported per person and not pooled, with the false-accept rate on non-command
motion beside it.

**Latency is the stroke, not the match.** Matching a resampled stroke against a few dozen
templates costs well under a frame. The command arrives late because the stroke takes time
to draw, and because the end of the stroke must be confirmed before matching starts. A
latency figure that times only the matcher is true and useless. The figure that matters
runs from the end of the motion, and for timed mechanics from its onset, to the command
taking effect. It carries its unit, its basis and the stage boundaries it spans.

**A proxy corpus answers a narrower question, and says so.** Before anyone draws with a
tracked hand, strokes drawn with a mouse or generated synthetically test the matcher, the
normalisation and the reject floor. They cannot test tracking noise, depth jitter, the
return path, fatigue or the angle at which real people draw. The rule that an emulated
input is not evidence about hands is owned by the on-device verification subject's
[emulated-touch-is-not-physical-touch](../../couch-and-tv/on-device-verification-harness/techniques/emulated-touch-is-not-physical-touch.md).
This subject applies it to strokes. Every figure carries its corpus label, **synthetic**,
**mouse** or **hands**, and the hands row stays unmeasured until a hand has drawn.

## The load-bearing distinctions

- **Recognised versus accepted.** A stroke is recognised when the matcher names a template.
  It is accepted when the name survives the floor and the margin. Only accepted strokes
  become commands, and the gap between the two counts is a health metric.
- **Rejected versus missed.** A rejected command was drawn and refused, so the player
  should see it fizzle. A missed command was never segmented, so the player sees nothing.
  They are different defects with different fixes, and a single "failure rate" hides which
  one the game has.
- **Confusion versus noise.** Two commands mistaken for each other is a vocabulary defect.
  Random motion accepted as a command is a rejection defect. The confusion matrix separates
  them, and the fix for one makes the other worse if it is applied blind.
- **Shape recognition versus teaching.** Whether a shape can be recognised at all belongs
  here. Whether players can learn the vocabulary, and in what order it is introduced,
  belongs to the learning-curve subject. A shape that is learnable but unrecognisable fails
  here first.

## What the naive build gets wrong

- **It has no reject class**, so the game casts on every reach, wave and block.
- **It segments by speed alone**, and the return stroke becomes a second command.
- **It fits a plane and trusts its axes**, so a shape is mirrored for some players and not
  for others.
- **It admits shapes that differ only in an invariance it removed**, then tunes thresholds
  for weeks to separate two commands it declared identical.
- **It reports the author's accuracy**, measured on the strokes the templates came from.
- **It sets the reject threshold by eye** on positive examples only, so the false-accept
  rate is whatever the threshold happens to produce.
- **It times the matcher** and calls the result the command latency.
- **It counts mouse strokes as hands**, or lets a synthetic pass fill an empty hands row.
- **It labels a corpus by what it imitates**, so generated paths tagged "mouse" are
  reported as a person's drawings.
- **It measures a mark's size by its path length**, which a predicting tracker inflates at
  every corner, instead of by its reach.

## Seams with neighbouring craft

The timing of a command, meaning when the motion began and how a reward window is judged
under a tracked sensor, belongs to hand-tracked timing windows. This subject hands that
subject a stroke with its sample history intact, so the onset can be recovered. Teaching the
vocabulary belongs to learning-curve and teaching design. Recording real strokes as
versioned corpora and replaying them headlessly is the craft of recording and replaying
tracked input, and the held-out acceptance here consumes such corpora. Window widths, reject
floors and margins are thresholds, and they live in the design canon's single source like
any other.
