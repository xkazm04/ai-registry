---
layer: technique
type: technique
subject: generated-output-grading
technique: vision-model-grading-schema
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when: [automating judgement of generated images, a sharp field keeps producing arguable answers because the cases are borderline, deciding whether a grader may return a distribution instead of a label, a second grader is proposed for a whole batch, designing the fields a vision grader must fill, deciding what a machine grader can and cannot be trusted with, a failure everyone can see never shows up in the grades, comparing two models as graders and one looks out of its depth, a readback has to capture a style rather than score it]
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

### Spread is not information, and the check for that is a different check

The saturation rule above asks whether the distribution has any resolution. It
is necessary and it is **not sufficient**, and the gap between the two is where
a measured attempt at this failed.

Eighteen labelled concept images through a locally served grader, one call each,
the distribution read from the same response: the answers were **not** saturated
— a median peak probability of 0.71, one cell of eighteen above 0.99 — so the
band had plenty of room to sit. It still bought nothing. Borderline-ness ranked
the gate's own errors at an **AUROC of 0.54**, which is a coin flip, and the
probability-weighted mean *reduced* the separation between good and bad inputs
against the stated integer (0.68 against 0.70). Both of the gate's false passes
were held confidently: a user-interface wireframe, which cannot be turned into a
mesh at all, scored 9 with two thirds of the mass on 9.

The reading is the subject's characteristic failure arriving in the grading lane
rather than a new one. A distribution reports how firmly the model committed. It
has no channel to the image, so a grader that is confidently wrong about a
wireframe produces a confident distribution about a wireframe. Spread and
correctness are different quantities, and one does not stand in for the other
merely because it is cheap.

So the admission test is a **correlation, measured on labelled cells**, not a
spread:

> **Before a band routes anything, show that borderline-ness ranks this
> grader's errors on this field above chance.** Report the AUROC beside the
> band. Where it sits at chance, the distribution is a diagnostic to log and not
> a router, and the second grader goes back on every cell.

Two practical traps the same measurement surfaced, both cheap to avoid:

- **A two-token score silently reads as its first digit.** On a 0–10 scale the
  top answer is two tokens, so a distribution read at the score position scores
  `10` as a `1` — which does not error, does not look wrong, and in the run that
  found it produced an apparent eight-point correction that was pure artifact.
  Keep the scale single-token (0–9), or reassemble the number before reading any
  mass over it.
- **A grader swap re-opens the threshold.** The same prompt and the same
  `passAt` line, served by a different resident model, failed **every** correct
  input in the set. A threshold is fitted to a grader, and a local substitution
  is a grader change, not a deployment detail.

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

## Two instruments per eye: one to score, one to see

Everything above is written for one job — producing rows that aggregate — and
read carelessly it says that free prose has no job at all: it does not
aggregate, it does not diff, and a property whose only home is a free-text
field is uncovered. All of that stands, **for grading**. None of it makes prose
the weaker instrument, and a pipeline that owns only the enum pays for the
confusion.

A closed enumeration flattens *by design*. That is what makes the answers
comparable and the arithmetic safe, and the price is that every value the
enumeration does not distinguish becomes the nearest value it does. What gets
flattened is predictable: **relations**. Which colour owns the ground and which
owns the single accent; whether black is a flat fill or an opaque silhouette
and how much of the frame it swallows; how many layers of light there are and
what is left dark. Each of those is a relation across the frame, and a
vocabulary of per-property fields has no cell that can hold one. The result is
the schema defect this document opened with, in its hardest form to see: every
field answered, one modal value down the whole batch, and no trace of a
difference a reviewer spots at a glance. Observed in a live loop on two
consecutive comparison cycles (2026-08-30): the enum readback returned flat
across both while a second, unconstrained eye picked the challenger four times
in six on each — the enum could not see a lifted black or a change of colour
role, so the human gate was the only instrument those cycles had.

The answer is not a wider enumeration. It is a second readback with a different
job:

> **Keep two instruments per eye and never conflate them: a closed-enum schema
> for GRADING, and a taught free-prose read for SEEING. The enum's output is a
> row; the deep read's output is a description a person or a generator can act
> on. Neither is scored on the other's terms.**

"Taught" carries the weight. An untaught free-prose read is the fluent generic
paragraph that [replication-as-comprehension-test](./replication-as-comprehension-test.md)
exists to catch, and it fails for the same reason a free-text schema field
does. A taught read *names the relations it must cover* — ownership of ground,
figure and accent, and what is deliberately absent; black as a shape and its
share of the frame; the dominant source and the second environmental layer, and
what stays dark; where edges are lost against where they are found — and then
asks for them in prose, because prose is the form a relation fits. It is a
structured instrument whose structure lives in the **question** rather than in
the answer type, which is exactly why it must not be graded: the moment its
output is scored, it is being asked to aggregate, and it will be cut back to an
enumeration by whoever has to aggregate it.

### Before buying parameters, buy a better question

The second instrument also changes what a comparison between graders means. A
reader of one size returning a thin readback where a much larger one returns a
rich one looks like a capability gap, and capability is the expensive
explanation. The cheap one has to be excluded first:

> **When comparing models as eyes, hold the question constant — and before
> concluding that a small reader cannot see something, re-ask it with the
> question the large one demonstrated.**

The demonstration on record: a hosted reader of roughly 300-billion-parameter
class read craft — palette roles, black-as-silhouette, layered light — that a
locally served reader of roughly 27-billion-parameter class had flattened under
a schema-constrained prompt, at about twenty-three minutes per frame. Re-asking
the small reader with the vocabulary the large one had demonstrated produced
readbacks covering the same relations, at about twenty-five seconds per frame
and no marginal cost (three frames, two arms each, 2026-09-03). Two honesties
about that figure: n is three, so it is a demonstration and not a rate; and the
comparison of *depth* was a human reading of two prose passages, not a scored
one — the timing and the cost are the measured parts. It is still enough to
make the cheap check mandatory before the expensive conclusion, because an
elicitation gap and a capability gap present identically and have opposite
fixes.

### The deep read is not a grader in disguise

The pull, once the prose reads well, is to promote it — to let the rich
readback carry a verdict because it is so obviously seeing more. Refuse it. The
prose read carries no comparable scale and no confidence a pipeline can route
on, and this subject has already measured what happens when a grader's own
confidence is trusted as a proxy for its correctness: at chance, on cells where
the distribution had ample room to discriminate. A deep read that reads well is
evidence that the **question** was good. It is not evidence that the answer is
right, and the characteristic failure of this whole lane — confidently wrong,
scoring high — reaches fluent prose at least as easily as it reaches a number.
The deep read earns its place by what it recovers for the next step: a style
contract, a critique, a brief to regenerate from. Never by scoring higher.

## When not to use it

Do not use a vision grader for anything a deterministic check can measure:
dimensions, aspect ratio, file integrity, palette extraction by pixel. If a
viewer could check it against a fact, code must check it — the vision model is
for the semantic remainder. And do not use schema grading as the *final*
authority on a creative judgement call (is the invented emblem apt?); the
schema can flag that an emblem exists, but taste stays human.
