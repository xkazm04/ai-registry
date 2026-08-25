---
layer: technique
type: technique
subject: generated-output-grading
technique: replication-as-comprehension-test
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [validating that a controlled vocabulary actually carries meaning, checking whether an annotation is rich enough to act on, deciding which schema fields to keep, no ground truth exists for a labelling task]
---

# Replication as comprehension test

An annotation cannot be graded by reading it. Descriptions of an image are
fluent by default — the vocabulary is right, the grammar is right, the terms
are the ones a professional would use — and none of that establishes that the
words were *earned* by the image in front of the model. With no ground truth,
the usual fallback is agreement with a stronger model, which measures
imitation rather than understanding.

Replication breaks the circle. Feed the annotation, and only the annotation, to
a generator. Annotate what comes back. Compare the two annotations field by
field. The claim under test is not "is this label correct" but the stronger and
more useful **"is this label sufficient"** — does the description contain
enough to rebuild the thing described?

A vocabulary that survives the round trip is doing work. One that does not is
either missing the field the look actually depends on, or using a word that
does not mean the same thing to a generator as it does to the annotator. Both
are actionable; neither is visible from reading annotations all day.

## The procedure

**1. Round-trip only what you are testing.** Carry the craft properties across
and leave content behind. A replica showing entirely different subjects is a
**pass** when the subject was never under test — insisting on content fidelity
turns a comprehension test into a copying exercise, and copying is both the
wrong measurement and, with third-party source material, the wrong thing to
build.

**2. Translate terms of art into effect language for the generator.** Pass
"shadows left unfilled and falling to true black", not "low-key". Generators
respond to described effects far more reliably than to the vocabulary's labels,
and a round trip that fails on the label alone has measured your phrasing
rather than the schema.

**3. Score per field, not per image.** The aggregate number is nearly useless;
the per-field transfer rate is the finding. Fields cluster, and the clusters
tell you where the schema is load-bearing and where it is decoration.

**4. Give ordinals partial credit.** Adjacent on a graduated scale is a
near-miss, not a failure — the same rule that applies to grading annotations
applies to grading their round trips.

## Decision rules

- **Sufficiency outranks correctness for a corpus schema.** A field that is
  often "right" but never survives a round trip is not carrying the look, and
  a corpus built on it will not reproduce anything.
- **A field that fails the round trip in a consistent DIRECTION is a generator
  prior, not a schema defect.** Repeated `high-key -> low-key` and
  `hard -> soft` misses say the generator has a house tonal style overriding
  the brief. Fix that with stronger phrasing or a different generator; do not
  delete the field.
- **The round trip cannot attribute a failure on its own.** A miss is either
  the generator ignoring the instruction or the annotator misreading the
  result, and the two are indistinguishable from the score. Attribution needs a
  third party looking at the replica — plan for that before concluding.
- **Converging evidence promotes a finding.** When a round trip and an
  independent reliability probe condemn the *same* fields, that is two
  instruments agreeing and the field should be reworked. One instrument alone
  is a lead.

## Failure modes

- **Grading content fidelity**, which measures copying and fails every honest
  replication.
- **Reporting the mean and stopping.** A 77% aggregate hides that half the
  fields scored 100% and the rest scored 50% — the only actionable shape in
  the data.
- **Concluding from a handful of frames.** Per-field rates over a few images
  are a signal to pursue, not a measurement to publish; say which it is.
- **Quoting the schema's labels straight into the generation prompt**, then
  blaming the schema for what was a phrasing failure.
- **Treating a passing round trip as proof the annotation is TRUE.** It proves
  the annotation is sufficient and self-consistent. An annotation can be
  consistently, reproducibly wrong about the source and still round-trip
  perfectly.
