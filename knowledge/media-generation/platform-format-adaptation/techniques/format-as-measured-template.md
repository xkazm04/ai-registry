---
layer: technique
type: technique
subject: platform-format-adaptation
technique: format-as-measured-template
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [codifying a video format for a pipeline or team, reviewing a format spec someone else wrote, deciding whether a craft observation is ready to become a parameter]
---

# Format as measured template

A format that lives in someone's head is a style; a format that a team or a
pipeline can execute is a **template of parameters**. The technique is to write
the template so that every parameter is either backed by a measurement of real
successful work in that format, or explicitly marked as not yet measured — and
to treat the second category as a first-class state, not an embarrassment to
paper over.

## What a format template contains

- **Container physics** — aspect ratio, canvas, the UI-occluded margins where
  no load-bearing element may sit. These are platform facts; record them with a
  date, because they drift.
- **Duration band** — the measured range where successful work in the format
  actually sits, distinct from the platform's permitted maximum. Record both;
  target the band.
- **Word budget** — as a range, with the driver of the range named (in short
  formats, the delivery mode spreads it by 2×).
- **Hook contract** — the deadline in seconds, the permitted opening shapes,
  the banned ones.
- **Structural rules** — idea count, anchor rule, the canonical closing move.
- **Named anti-patterns** — each with the reason it persists, because an
  anti-pattern nobody is tempted by doesn't need naming.

## Every parameter carries provenance

Grade each claim and write the grade next to it:

- **Measured** — a number taken from real work, with the sample size stated.
- **Observed** — a pattern seen in the sample but not quantified.
- **Inferred** — a conclusion the sample supports but does not contain.
- **Assumed** — a placeholder chosen for a reason, awaiting calibration.

Sample size is part of the parameter. "Hook in one sentence at second zero,
n=3, two from the same creator" is honest and usable; the same rule stated
bare is a future incident. When two of three witnesses share an author, say
so — the pattern may be a house habit, not the format.

## The refusal rule

**When no measurement exists, do not write the parameter.** A machine-readable
template is authority: downstream tools consume it as defaults, ranges, and
validators, and a human reviewer will defer to it precisely because it looks
measured. An estimate laundered into the template is worse than a gap, because
the gap is fixable and the estimate is invisible. The correct artifact for the
unmeasured region is a **declared evidence gap**: a field that names the target
the brief asks for, the nearest measured points, and the fact that the space
between them is untested. A rule with no number behind it may steer a
composition; it must never become a validator.

This is the law "unmeasured is not pass" applied to craft itself: a template
that ships a word budget nobody measured is a gate reporting pass on something
it did not check.

## Decision rules

- **When a brief targets a duration below your measured band**, ship the
  template with the gap declared, not with an extrapolated number. The first
  production run into the gap is the calibration, and it should know it is one.
- **When a parameter is decided by the subject or upstream data**, the template
  computes and displays it rather than offering it as a dial — every dial the
  template exposes is a place a user can be wrong.
- **When a tool surface is built from the template**, the anti-patterns become
  refusals, not warnings. If the tool offers a banned opening as an option, it
  will be used.
- **When new measured work arrives**, update the template and its date. A
  format template with no update history is a template nobody is measuring
  against.

## When not to use

Do not template a format you have studied from fewer than a handful of
full-length witnesses — write the observations as graded notes and wait. And
do not template a format you only consume casually: view counts are not
evidence of craft, and a template built from "what seems to do well" encodes
the algorithm's current mood, not the format's physics.
