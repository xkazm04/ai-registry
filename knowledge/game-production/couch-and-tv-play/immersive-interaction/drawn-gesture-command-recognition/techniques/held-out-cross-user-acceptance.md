---
layer: technique
type: technique
subject: drawn-gesture-command-recognition
technique: held-out-cross-user-acceptance
status: draft
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, no-gate-self-certifies]
shared_with: []
use_when: [a recognizer is about to be called accurate, accuracy was measured on the author's own strokes, setting the accuracy and latency go/no-go numbers]
---

# Held-out cross-user acceptance

The named concern: a gesture recognizer is accepted on a number, and that number means
something only if it was measured on strokes the recognizer has never seen, from people whose
strokes formed no template, with false accepts and latency reported beside accuracy. Every
shortcut flatters the result. The author's own strokes flatter it most, because they share
the templates' proportions, speed, start points and habits.

## What is measured

- **Accuracy per shape and per person**: accepted-and-correct over attempts. Report the
  per-person spread, not only the pooled mean, because a recognizer that works for nine
  people and fails one has a defect the mean hides.
- **Confusion and rejection**: the full matrix, with rejection as a column.
- **False-accept rate**: the fraction of negative-corpus strokes accepted as any command,
  and the rate per minute of ordinary non-command play where one can be recorded. Per-minute
  is the figure the player feels.
- **Latency**, with stage boundaries named: from the end of motion to pen-up confirmation,
  from pen-up to recognition, and from recognition to the command's first visible effect.
  Report the median and a high percentile with the count. A latency from the matcher alone
  is labelled as such and never stands for the command latency.

## The split

Hold out by person, not by stroke. Templates come from one group of people, and the test
strokes come from a different group. With few people, rotate: build templates without
person k, test on person k, and repeat for each person. Report each fold. When the product
lets players record their own templates, measure that condition separately and label it
user-dependent. It is a different, easier claim.

## Corpus labels

Every figure carries the corpus it came from:

- **synthetic**: strokes generated from the templates by perturbation, resampling or a
  motion model. They test the matcher's tolerance to variation the generator was told to
  produce, and nothing about people.
- **mouse**: strokes drawn on a flat device by people. They test people's shape variation
  without tracking noise, depth, fatigue or the return path.
- **hands**: strokes drawn by tracked hands, with the device and the tracking runtime version
  named.

**A corpus is labelled by what produced it, not by what it imitates.** Paths generated to
look like mouse drawings are synthetic, even when a source field in the file says "mouse".
A label that names the imitated source makes a generator's output read as a person's.

The rule that injected or emulated input is not evidence about hands is owned by the
on-device verification subject's
[emulated-touch-is-not-physical-touch](../../../couch-and-tv/on-device-verification-harness/techniques/emulated-touch-is-not-physical-touch.md).
This technique applies it to strokes: a mouse or synthetic pass is the precondition for a
hands gate, never its substitute, and the hands row reads **unmeasured** until it is filled.

## Procedure

1. **Set the go/no-go numbers before measuring**: minimum per-person accuracy, maximum
   false-accept rate, maximum latency at the chosen percentile. They live in the design
   canon. A threshold chosen after seeing the result certifies the result.
2. **Freeze the recognizer and the templates** at a named build or commit. The verdict is
   bound to that content.
3. **Run the held-out evaluation** with a command that someone else can repeat, and record n
   (strokes and people), the date, the build, the command and the corpus label.
4. **Record the verdict as it stands**, including a failure. A failed gate with its numbers
   is evidence for the next decision, and it is kept. It is not re-run until it passes and
   then reported as the only run.
5. **Re-run on any change** to segmentation, projection, normalisation, templates or
   thresholds.

## Decision rules

- **When fewer than about five people contributed held-out strokes, call the figure
  preliminary.** Person-level variance dominates at that size.
- **When accuracy passes and false accepts are unmeasured, the gate is open, not passed.**
- **When the recognizer and its test corpus were produced by the same process** (templates
  and synthetic strokes from one generator, judged by its author), **the result certifies
  the generator.** Independent evidence needs strokes the generator did not make.
- **When the split is re-drawn, it must reach the negatives too.** Re-seeding the positive
  strokes while the negatives come from a fixed set tests accuracy on new strokes and the
  false-accept rate on the same old ones.
- **When a harness skips an input it could not load, or counts time it never fed, the test
  certifies less than it reports.** A template that fails extraction fails the test. A
  per-minute false-accept rate divides by the seconds that actually reached the recognizer.
- **When a hands figure arrives that contradicts the proxy figures, the hands figure wins.**
  Record what the proxy missed.

## When not to use it

- **For a quick tuning loop during development.** Use whatever corpus is at hand, and
  label it. This technique is for the claim, not for the iteration.
