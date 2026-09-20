---
layer: technique
type: technique
subject: generated-output-grading
technique: vision-model-grading-schema
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when: [automating judgement of generated images, a sharp field keeps producing arguable answers because the cases are borderline, deciding whether a grader may return a distribution instead of a label, a second grader is proposed for a whole batch, designing the fields a vision grader must fill, deciding what a machine grader can and cannot be trusted with, a failure everyone can see never shows up in the grades]
---

# Vision-model grading schema

A vision model reading a generated image against the brief that produced it is
the only judging mechanism that scales to "every output, every run". The
technique is not "ask a vision model what it thinks" — free-text opinions do
not aggregate, do not diff, and drift with the judge's mood. It is designing a
**fixed, typed schema** the grader must fill, so that a thousand judgements
land as rows in a table instead of a thousand paragraphs.

## The field list before the field types

Every rule below is about the *form* of a field, and none of them can reach a
field that is not there. A schema's field list is a claim about what can fail,
and a failure class with no field is not scored badly — it is scored as a
pass, inside a table that looks complete, under a clean aggregate. This is the
one schema defect invisible from inside the schema: every field answered,
nothing was skipped, and the grade is silent about the thing that went wrong.

So take a census before typing anything: **walk the brief, and for every
dimension the brief decided, name the field that reads it back.** One field
per briefed variable is the floor, and the dimensions that go missing are
predictable. A schema assembled out of an existing vocabulary inherits only
that vocabulary's *enumerated* half — whatever its source discipline had
already reduced to closed sets — and silently drops the half that discipline
expressed as prose. Borrow a vocabulary of camera, light and composition and
you have borrowed a description of the frame with nothing in it about whoever
is standing in the frame; the brief decided both, and the grade now checks
one. Coverage is a property of the whole grading pass and not of one schema —
where the census outruns the field budget below, that is the argument for a
second pass, never for leaving a class unwatched.

Briefed variables are also the schema's **free ground truth**, which is the
second reason to build the field list from the brief rather than from the
picture. A briefed value was written down before the output existed, so a
field that reads it back is scoreable against something — no second judge, no
round trip, no human. Every other field can only be checked against another
opinion. Ground truth is the scarce commodity in judging generated output; the
fields that carry it for free are the last ones to cut.

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

- When a defect reviewers keep raising never appears in the table, do not
  sharpen a field — check first whether the class has a field at all. An
  enumeration gap and a calibration problem present identically and have
  opposite fixes, and sharpening definitions on a schema that cannot see the
  defect is work that cannot succeed.
- When the only place a property could land is a free-text field, treat the
  property as uncovered. Free text does not aggregate and does not diff, and
  it is the first thing dropped from scoring as "content" — so the property
  sits in the record and appears in no verdict computed from it.
- When a failure lives across a set rather than inside any one output, the
  field is only half the fix: read its **variance across the batch**, not its
  value per cell. A field returning one answer for every cell of a batch that
  briefed different answers is a finding — the same reading that condemns an
  inert field in an annotator, pointed at the outputs instead — and it is a
  finding no per-output gate can raise.
- When a schema field keeps producing arguable answers across graders, it is
  mis-typed: either sharpen it into a count, split it into two booleans, or
  demote it to human judgement — or, where the field is sharp and the *cases*
  are what is borderline, keep it and read its distribution instead of its
  label. Do not leave a known-unreliable field aggregating into verdicts.
- When the judge's boolean disagrees with your eyes on spot-check, distrust
  the *field definition* before the judge — vague field descriptions are the
  most common cause. The second suspect is image scale: a grader fed a
  downsampled render cannot count hairlines.
- When stakes rise (a model verdict, a style standardization), do not raise
  the schema's resolution — add a second grader and a human tie-break
  instead. Reliability comes from agreement, not from finer scales.

## The fourth remedy for an arguable field

The mis-typing rule above offers three remedies — sharpen, split, demote — and
all three change the *field*. A fourth changes the **answer shape** instead, and
it is the only one that keeps a genuinely borderline judgement rather than
legislating it away: ask the grader for a probability across the field's closed
answer set, take the argmax as the grade, and read how borderline the cell was
from the shape of what came back.

The distinction matters because the three remedies assume the arguable field is
badly designed. Sometimes it is. But a field can be sharp, well-anchored and
still arguable, because **the image is genuinely near the boundary** — and
sharpening a definition against an ambiguous picture moves the disagreement, it
does not remove it. A field that disagrees because the case is hard needs a
number saying so, not a finer definition.

What the shape buys is a **routing signal that the grade itself cannot carry**.
A discrete grade says pass; it does not say *barely*. Where the answers are a
distribution, the cells that sat near the boundary are identifiable before
anyone looks at them, and the schema's own escalation rule becomes affordable:

> **Do not add a second grader to every cell. Add it to the borderline ones.**

This is the standing rule about rising stakes — reliability comes from
agreement, not from finer scales — bought at a fraction of its stated price. A
second grader over a whole batch doubles the grading bill; a second grader over
the band that actually contains the disagreements is a rounding error, and the
cells outside the band were ones the two graders were going to agree on anyway.

Two constraints govern it, and both are borrowed knowingly from the judging
discipline rather than invented here:

- **The band is fitted on one set of cells and applied to another.** A
  borderline band is a claim about levels, and a level read off an unfitted
  distribution is fiction. Fit it on a batch whose grades a human has checked,
  then apply it forward. A vendor's published calibration is not a substitute:
  calibration is a property of a distribution over a task, not a property of a
  model, so a grader trained to be calibrated still owes the fit on **these**
  images. Where no fitted band exists, the honest form is a percentile against
  the current batch.
- **Count the saturated answers.** A grader that returns near-certainty on most
  cells has no resolution where the band would sit, and its confidence is a
  two-valued flag that should be described as one. Report the saturated share
  beside any band, and when it is the majority, drop the band and keep the
  discrete grade.

## The cost class decides whether this is free or a second bill

Whether the shape costs anything is not a property of the technique. It is a
property of **where the grader runs**, and the two cases are far apart:

- a grader **you host yourself** already computes the probabilities it is
  sampling from, so reading them adds no call, no token and no latency. The
  shape is free, and on a local grader there is no reason not to record it;
- a grader behind **someone else's endpoint** usually will not return them, and
  asking the model to *state* a distribution in its answer instead is a second
  act of generation — more output tokens per cell, scaling with the number of
  answer options rather than with the difficulty of the image.

So the rule inverts on deployment. Self-hosted: record the distribution on every
field, always, because it is already paid for. Hosted: record it only on the
fields that have earned it, which are the known-arguable ones this section began
with, and measure the added cost before turning it on across a schema.

One consequence worth planning for: a batch graded locally can be **re-banded
without re-grading**, because the distributions were stored. That is the
regrade-without-regenerate move applied one layer up, and it is the reason to
store the full distribution rather than the grade the band produced.

## When not to use it

Do not use a vision grader for anything a deterministic check can measure:
dimensions, aspect ratio, file integrity, palette extraction by pixel. If a
viewer could check it against a fact, code must check it — the vision model is
for the semantic remainder. And do not use schema grading as the *final*
authority on a creative judgement call (is the invented emblem apt?); the
schema can flag that an emblem exists, but taste stays human.
