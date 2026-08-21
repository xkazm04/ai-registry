---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: discrepancy-between-signals-is-itself-a-signal
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [a work sample and an interview disagree sharply, designing a composite that must not read healthy while a component failed, deciding what to do with a split panel]
---

# Discrepancy between signals is itself a signal

Two signals of comparable weight disagree. The composite averages them, produces
a middling number, and the middling number advances or declines quietly. This is
the moment a combination system does its most damage, because the disagreement
was the most informative event in the file and averaging is the one operation
guaranteed to destroy it.

A discrepancy is not noise around a true value. It is a finding with exactly
three possible explanations, each requiring a different action:

1. **An instrument is broken.** The rubric is ambiguous, the grader drifted, the
   sample no longer measures what it did, the scorecard's anchors mean different
   things to different assessors.
2. **An observation was contaminated.** The interviewer saw the screening score.
   The reference was coached. The sample was not the candidate's own work.
3. **The candidate is genuinely uneven** on dimensions the role weighs
   differently — strong on the craft and weak under live pressure, or the
   reverse.

Only the third is about the candidate, and it is the only one where combining
makes sense. The other two require repair, not arithmetic.

## Make the composite structurally incapable of hiding it

The rule to encode: **a composite may not report a healthy result while a
component judgment it depends on has failed.** Without this rule, a subject with
excellent coverage on the numeric axes and a failed content judgment reads as
healthy, because the numeric axes carry the weight and the failed judgment is
one term among several.

The mechanics, in order:

1. **Compute the base composite** over the available signals under the declared
   weights.
2. **Re-weight when a judged signal exists** — when a heavier-class judgment is
   present, shift mass toward it, because the base scheme was designed for a
   file that lacked it.
3. **Apply a discrepancy rule as a separate pass, after the arithmetic.** If a
   judged component failed while the composite is above a healthy band, the
   composite is *capped* into a non-healthy band and the failure is surfaced by
   name. The cap is not a subtraction; a subtraction can be out-earned by the
   other axes, which is exactly the failure being prevented.

The order matters: the cap must sit outside the sum, or it becomes another term
in the sum.

## Detecting a discrepancy worth raising

Not every difference is a discrepancy. Two thresholds, both stated in advance:

- **Magnitude.** The gap must exceed what the instruments' own uncertainty can
  explain. Two signals with wide confidence intervals that differ by less than
  the overlap of those intervals do not disagree; they are just imprecise.
- **Weight comparability.** A light-class signal differing from a heavy-class one
  is not a peer disagreement — the heavy one holds. Raise it as a note, not as a
  blocking discrepancy. A discrepancy between two demonstrations, or between a
  demonstration and a structured observation, is the case that blocks.

Also worth raising, though not a numeric gap: **a categorical conflict** — the
work sample shows an ability the interview concluded was absent, a reference
contradicts a stated tenure, an authenticity check disputes an artifact the
score was computed over. These block regardless of magnitude, because they
question what was judged rather than how much
([law](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## What a raised discrepancy must produce

A discrepancy that only produces a warning banner will be dismissed. It must
produce a **targeted next step**, named specifically:

- the **dimension** in dispute, not the overall file;
- the **cheapest resolving observation** — a focused probe on that dimension, a
  second grader on the sample, a structured reference question, a re-run of the
  authenticity check;
- the **owner** of that step;
- and, until it resolves, a **hold** rather than an advance.

Where the resolving step cannot be taken — the candidate is unavailable, the
grader has left, the artifact cannot be re-verified — the discrepancy stays
unresolved and *visible in the decision object*. It does not decay into an
average because time passed. Say what the record holds: "the sample and the
interview disagreed on this dimension and the disagreement was not resolved"
([law](../../_laws.md#say-only-what-the-record-holds)).

## Panel splits are the same object

A split panel is a discrepancy between two structured observations, and the
usual handling — averaging the scorecards, or letting the most senior voice
settle it in the room — commits both errors at once. Handle it identically:
require independent written scores *before* the debrief, treat a split beyond
tolerance as a raised discrepancy on the specific dimension, and resolve it with
evidence rather than with seniority. The debrief's job is to surface the
observations behind the scores, not to converge the numbers.

## Decision rules

- **When two comparable-weight signals disagree beyond tolerance, do not
  average.** Raise, name the dimension, hold.
- **When a judged component failed, cap the composite** out of the healthy band
  rather than subtracting from it.
- **When a light signal disagrees with a heavy one**, the heavy holds; record
  the note, do not block.
- **When a discrepancy resolves, record which explanation it was** — broken
  instrument, contaminated observation, or genuine unevenness. This record is
  the only cheap source of instrument-quality data you will ever get; a system
  that resolves discrepancies without classifying them learns nothing about its
  own rubrics.
- **When a discrepancy cannot be resolved, carry it into the decision object**
  rather than letting it lapse.

## When not to use this

- **Where the signals were never meant to measure the same thing.** A coding
  sample and a stakeholder-communication interview are not in disagreement when
  they differ; they are measuring different dimensions and both are true. A
  discrepancy rule applied across non-overlapping dimensions manufactures
  conflict and floods reviewers with noise until they mute it.
- **Where one instrument has known low reliability.** If a signal disagrees with
  everything, it is not raising discrepancies, it is broken; fix or retire the
  instrument rather than routing hundreds of files to a hold.
- **In high-volume early screening**, where only one signal exists. Discrepancy
  logic needs at least two comparable observations; before that stage it has
  nothing to compare.
