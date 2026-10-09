---
layer: technique
type: technique
subject: drawn-gesture-command-recognition
technique: vocabulary-distinctiveness-audit
status: draft
laws: [law-and-check-share-one-source, unmeasured-is-not-a-pass]
shared_with: []
use_when: [adding a command to an existing gesture vocabulary, two commands are confused with each other more often than with noise, a proposed shape differs from another only in size or direction]
---

# Vocabulary distinctiveness audit

The named concern: a gesture vocabulary is a set of shapes that a particular recognizer,
with particular invariances, must keep apart when real people draw them. A shape is admitted
because it can be told from every other admitted shape under those conditions, not because
it is evocative. The audit is the check that runs before a shape is admitted and again
whenever the recognizer changes.

## Invariances first, shapes second

Write down what normalisation removes. Each removal deletes a dimension the vocabulary can
use:

- **position**, almost always removed, so no two shapes may differ only by where they are drawn;
- **scale**, usually removed, so a small and a large version of one shape are one command;
- **rotation**, sometimes removed, so a stroke and the same stroke turned are one command,
  which deletes every pair of directional strokes;
- **direction and start point**, removed by point-cloud matching, so a shape and the same
  shape drawn backwards are one command;
- **aspect ratio**, partly removed by non-uniform scaling, which makes a tall narrow shape
  and a wide flat one converge and distorts straight lines.

A proposed command that differs from an existing one only along a removed dimension is
rejected at once, with no measurement needed. The invariance list lives with the vocabulary
in one source, and the audit reads it from there. A vocabulary document that claims
direction matters while the matcher ignores direction is two sources that disagree.

## The audit

1. **Pairwise template distance.** Score every template against every other under the
   production normalisation. The smallest off-diagonal distance is the vocabulary's
   tightest pair. A new shape whose distance to its nearest neighbour is below the current
   tightest pair makes the vocabulary harder, and it must justify that.
2. **Prefix and containment.** Check whether any shape's opening is another complete shape.
   With early commitment, or a dwell that ends a stroke at a pause, the longer shape is cut
   at its prefix and recognised as the shorter one.
3. **Mirror and rotation pairs.** List every pair that is related by a reflection or a
   quarter turn. Each such pair depends on the projection getting its axes right for every
   player, and is tested specifically.
4. **Cross-user confusion matrix.** On a held-out corpus, count each true shape against each
   recognised shape, with rejection as an extra column. Read off-diagonal cells as
   vocabulary defects and the rejection column as threshold or segmentation defects.
5. **Negative proximity.** Score the negative corpus against each template. A command
   that sits close to everyday motion, such as a downward swipe close to the hand dropping
   to rest, will be accepted by accident however distinct it is from other commands.

## Decision rules

- **When two commands confuse each other above the agreed rate, change a shape, not a
  threshold.** Lowering the margin to separate them raises the false-accept rate everywhere.
- **When a shape is confused mostly with rejection, look at segmentation and projection
  before the shape.** It is probably being drawn in a way the pipeline mangles.
- **When the recognizer's invariances change, rerun the whole audit.** A change from ordered
  paths to point clouds silently merges every directional pair.
- **When the vocabulary is taught gradually, audit each stage's subset as well as the full
  set.** Early players with three shapes deserve a vocabulary that is distinct at three.
- **When no cross-user corpus exists yet, steps 1-3 may run and step 4 is unmeasured.**
  Template distances are structural evidence, and they never stand in for the matrix.

## When not to use it

- **For a vocabulary of one or two shapes**, where the confusion matrix is trivial. The
  negative-proximity step still applies.
- **As a substitute for teaching.** A distinct shape can still be hard to learn. That belongs
  to the learning-curve subject.
