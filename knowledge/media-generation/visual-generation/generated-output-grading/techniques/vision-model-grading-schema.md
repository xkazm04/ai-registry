---
layer: technique
type: technique
subject: generated-output-grading
technique: vision-model-grading-schema
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when: [automating judgement of generated images, designing the fields a vision grader must fill, deciding what a machine grader can and cannot be trusted with]
---

# Vision-model grading schema

A vision model reading a generated image against the brief that produced it is
the only judging mechanism that scales to "every output, every run". The
technique is not "ask a vision model what it thinks" — free-text opinions do
not aggregate, do not diff, and drift with the judge's mood. It is designing a
**fixed, typed schema** the grader must fill, so that a thousand judgements
land as rows in a table instead of a thousand paragraphs.

## Schema design rules

- **The veto comes first.** The unconditional-fail boolean is the schema's
  first required field, so no judgement exists without it and the gate can
  short-circuit on it.
- **Booleans and counts over scales.** "Does the image show what the brief
  described: yes/no" is answerable and auditable; "rate adherence 1–10" hands
  the grader a calibration problem it will solve differently every run.
  Measured practice is unambiguous here: precise boolean checks yield far
  higher inter-rater agreement than scalar rubrics. Where degree genuinely
  matters, use a *small anchored integer* with the endpoints defined in the
  field's own description ("1 = clean and readable at thumbnail size, 5 = busy
  and illegible") — the anchors travel with the schema, so every grader and
  every future reader shares one calibration.
- **One perception field, one description field.** Ask for two to four
  dominant colours as plain lowercase names (a cheap cross-check against the
  style contract) and one short sentence of what is actually depicted. The
  sentence is the audit handle: when a boolean looks wrong, the description
  usually reveals whether the grader misread the image or the brief.
- **Every field required.** Optional fields become silently absent fields, and
  an absent judgement that defaults to anything is a lie. If the grader cannot
  answer, the whole grade fails and is recorded as ungraded.
- **Keep it under about seven fields.** Each additional field dilutes the
  grader's attention across the image; a long schema gets shallow answers to
  every question. If you need more, run two passes with two small schemas.

## The instruction: bind the grader to the brief and the visible

The prompt that accompanies the schema does two load-bearing things. First, it
quotes the *exact brief the image was generated from* — the grader judges
adherence to that text, not to its own idea of a good image. Second, it pins
the grader to perception: **"answer only about what you can actually see."**
Vision judges hallucinate compliance, exhibit measurable sympathy toward
machine-generated content, and reach only moderate agreement with humans;
the perception pin does not eliminate this, but it removes the easiest failure
mode, where the grader completes the brief from imagination. Run the judge
deterministically (temperature at or near zero) so a re-grade of the same
image is a re-measurement, not a re-roll.

## Provenance and failure handling

- **Record which model graded each output**, alongside the grade. Judge choice
  is a systematic error source; a table of grades that does not say who graded
  them cannot be re-calibrated later, and cannot be trusted across a judge
  upgrade.
- **A grading call must never destroy the work it grades.** Wrap it so that a
  failed judgement returns "ungraded: <reason>" rather than throwing away the
  render or crashing the batch. Vision calls time out under concurrency far
  more often than generation fails; losing a plate to a lost judgement pays
  the expensive cost to fix the cheap problem.
- **Ungraded is a visible state**, distinct from pass and from fail, reported
  in every aggregate. The fraction of cells actually graded is part of the
  finding — 90% pass on 40% coverage is not 90% pass.

## Decision rules

- When a schema field keeps producing arguable answers across graders, it is
  mis-typed: either sharpen it into a count, split it into two booleans, or
  demote it to human judgement. Do not leave a known-unreliable field
  aggregating into verdicts.
- When the judge's boolean disagrees with your eyes on spot-check, distrust
  the *field definition* before the judge — vague field descriptions are the
  most common cause. The second suspect is image scale: a grader fed a
  downsampled render cannot count hairlines.
- When stakes rise (a model verdict, a style standardization), do not raise
  the schema's resolution — add a second grader and a human tie-break
  instead. Reliability comes from agreement, not from finer scales.

## When not to use it

Do not use a vision grader for anything a deterministic check can measure:
dimensions, aspect ratio, file integrity, palette extraction by pixel. If a
viewer could check it against a fact, code must check it — the vision model is
for the semantic remainder. And do not use schema grading as the *final*
authority on a creative judgement call (is the invented emblem apt?); the
schema can flag that an emblem exists, but taste stays human.
