---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: role-family-axis-extension
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [hiring into a role family with domain-specific requirements, a general competency set misses what the job actually demands, deciding between adding an axis and forking a rubric]
---

# Role family axis extension

A general competency set is deliberately general, and generality has a cost: it
omits the dimensions that a particular family of roles is actually hired on. A
clinical role is hired on clinical judgment and patient safety. A site role is
hired on safety behaviour. A research role is hired on scientific rigour. A design
role is hired on portfolio craft. An operations role is hired on execution
discipline; an infrastructure role on service reliability. None of these appear on
a communication/ownership/problem-solving scale, and none of them should be left
to whether an individual interviewer thought to ask.

The technique is to **extend** the instrument for a family with extra scored axes,
rather than to fork the rubric or to smuggle the requirement into a general axis's
anchors.

## Extension, not fork

Extension keeps one calibrated core across the organisation and adds a small
family-specific tail. That matters for three reasons:

- **The core stays comparable.** Communication means the same thing everywhere, so
  cross-family calibration and organisation-wide rubric maintenance still work.
- **The tail is small enough to calibrate.** Two or three extra axes with real
  anchors are maintainable by the family that owns them; a whole forked rubric per
  family is not.
- **The seam is visible.** Anyone reading a scorecard can see which axes are
  universal and which are family-specific, and weight accordingly.

Fork only when the *core* itself does not apply — which is the population question
(see separate-rubric-per-population), not the family question.

## What earns an axis

Not every domain flavour deserves a scored dimension. An axis earns its place when
all of these hold:

1. **It is a real basis for the decision.** Someone strong on every core axis and
   weak on this one does not get hired. If they do, it is context, not an axis.
2. **It is observable in the interview.** If the honest evidence is a licence, a
   reference or a work sample, it belongs to a gate or an assessment stage, not to
   an interview scorecard where it would be scored on inference.
3. **It is not already the core in disguise.** "Attention to detail for lab work"
   is rigour restated; a family axis must add a dimension, not a domain-flavoured
   synonym.
4. **It can be anchored behaviourally.** If nobody can write the level-1 and
   level-5 paragraphs, the family knows it wants something it cannot yet describe,
   and an unanchored axis is a vibe with a box
   ([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).

Safety-shaped axes deserve one extra note: for clinical judgment, patient safety
and site safety, the *low* anchors are the operative ones. These axes exist to
detect the disqualifying behaviour, not to celebrate the excellent one, and a
ladder that only describes excellence cannot do that job.

## Governance of the tail

- **The family owns its axes; the organisation owns the core.** Practitioners in
  the family write and calibrate the tail, because nobody else can write those
  anchors. The core is not editable per family.
- **The tail is versioned with the rest of the instrument.** Adding a family axis
  changes what a scorecard means and must stamp accordingly (see
  rubric-versioning-at-write-time).
- **Keep it short.** Two or three axes. A tail longer than the core has become a
  fork by accretion, without any of a fork's deliberateness.

## A family with no extra axes is not a defect

Most families need no tail, and that must be the silent case. A system that
notices "this role family has no additional axes configured" and warns about it
will warn on the majority of scorecards, and a warning that fires on the majority
is furniture within a month — nobody will read it on the minority where it means
something (see unassessed-competency-handling). No-tail is a valid,
non-noteworthy configuration. The states to distinguish are three, not two, and
only two of them are problems:

- **No family recorded at all** — which axes apply is *unknowable*. A genuine
  gap; disclose it.
- **A canonical family with no axes defined** — the base rubric *is* the intended
  rubric here, not a degraded fallback. Nothing is missing, so nothing is said.
  Silent by design.
- **A family string outside the canonical vocabulary** — a typo, a stale import,
  a since-renamed slug. A real data anomaly, worth surfacing quietly.

Collapsing the middle case into the others is the mistake that produces the
notice-fatigue failure, because in most organisations the majority of families
legitimately have no tail. Record all three states in the data; render only the
two that mean something.

And never make the notice go away by *guessing* a family. Defaulting or inferring
a classification to satisfy a completeness check trades a disclosed unknown for
an undisclosed invention.

Equally, an unscored family axis is a coverage gap and not a zero
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
This bites hardest on safety axes, where an unasked question is the one most
likely to be read afterwards as "no concern found".

## Weighting

Family axes are scored on the same ladder as the core and are not silently
weighted heavier by being scored last or displayed separately. Where a family axis
is genuinely disqualifying below a level — safety behaviour usually is — that is a
**stated gate**, expressed as a rule about the decision, not as an invisible
multiplier inside an average. Gates are legible; weights are not, and an
unexplainable weight is the part of a scoring system that cannot be defended when
someone asks how the number was reached.

## When not to use this

- **Do not add an axis to encode a preference.** A tool, a methodology or a
  pedigree the family happens to like is a requirement question, and inflating it
  into a scored dimension is requirement inflation with a rubric's authority.
- **Do not extend for a single requisition.** Axes are for families; a one-off
  need belongs in the round design or in a work sample, and an axis invented for
  one candidate is not an instrument.
- **Do not use family axes to reintroduce credential screening.** Regulated
  credentials are gates with their own governance; an interview axis that scores
  whether someone holds a licence is scoring a fact that should have been checked,
  not a behaviour that was observed.
