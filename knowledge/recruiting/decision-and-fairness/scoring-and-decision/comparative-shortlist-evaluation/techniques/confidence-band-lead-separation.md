---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: confidence-band-lead-separation
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence, inference-must-look-like-inference]
shared_with: []
use_when: [naming a leader on a shortlist, rendering a ranked slate, deciding whether a score gap is real, sealing a comparative record]
---

# Confidence-band lead separation

Compute an honest uncertainty band around each candidate's score, then decide
whether the leader's band actually clears the runner-up's before any language of
leading is used. The order does not change. The claim does.

## The band is already sitting in the engine

Most scoring engines compute exactly what is needed and throw it away. The
inputs to a band are the same signals that already exist as quality metadata:

- **How much of the rubric was reached.** Competencies never assessed widen the
  band; they are not zeros and not neutral midpoints.
- **What kind of evidence stood behind each dimension.** A demonstrated skill,
  a skill discussed in an interview and a skill asserted in a document carry
  different weight and different width.
- **How thin the source material was.** A one-page profile and a full portfolio
  do not deserve equal precision.
- **How much of the score came from inference** rather than from a recorded
  observation.

Each of these is a *source of thinness*, and the band widens with every one that
applies. The width is not a statistical confidence interval in the sampling
sense — there is no repeated sampling here — and it must not be dressed as one.
It is an explicit, auditable statement of how much of this number is supported.
Label it as what it is:
[inference must look like inference](../../../../_laws.md#inference-must-look-like-inference).

**Every widening records its own named, human-readable driver.** A bare range is
worse than no range, because a reader who cannot see why a band is wide will
read the width as a property of the candidate — a vague person, a risky hire —
rather than as a property of the record. Each thinness source contributes both an
increment and a sentence, and the sentence names the gap: fewer than three skills
listed, education level unknown, misses this many must-haves. Recruiters act on
the sentence; nobody acts on a width.

The corollary is that a strong signal may *offset* a thinness source rather than
being ignored by it. A sparse early-career record with a directly observed skill
demonstration deserves a tighter band than a sparse early-career record without
one, and the driver says so. Thinness is about verifiability, not about seniority,
and a band that only ever widens will over-penalize exactly the candidates whose
evidence came from a demonstration rather than from paperwork.

Two properties make a band usable rather than decorative. It must be
**monotone** — adding evidence never widens it — and it must be **bounded** by
the score scale, so a band on a candidate near the top of the range is not shown
extending past the maximum. Both are cheap to enforce and both are commonly
missing.

## Three separation states, and why the third is not optional

Compare the leader's lower bound against the runner-up's upper bound:

- **Separated** — the leader's floor clears the runner-up's ceiling. The gap is
  larger than the uncertainty on both sides. This is the only state in which the
  surface may say the leader is ahead without qualification.
- **Overlapping** — the bands intersect. There is still a highest-scoring
  candidate and the order still stands, but the gap is inside the noise. The copy
  says so: leading on points, not distinguishable on evidence.
- **Unknown** — the bands could not be computed, for either candidate, for any
  reason. This is *not* overlapping and it is *not* separated. Absence of a band
  is absence of evidence about the gap, and rendering it as either of the other
  two states is manufacturing a claim from nothing —
  [absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence).

A two-value schema is the defect this technique exists to prevent, because the
missing third value always collapses into whichever of the two is cheaper to
render, and that is invariably the reassuring one.

**The boundary is inclusive: bands that merely touch are overlapping.** A
zero-width gap is not a separation, and the comparison at the boundary must never
resolve in the crown's favour. This is a one-character decision in the
implementation and it is the whole difference between an instrument that hedges
when it should and one that flatters at exactly the margin where flattery is
least defensible.

## Do not re-rank

The temptation, once bands exist, is to demote the wide-band candidate — a
risk-adjusted order, a penalty for uncertainty, a "confidence-weighted" score.
Refuse it.

The band's width is a property of *the system's evidence gathering*, not of the
person. It is wide because a document was short, an interview was cut off, a
competency never came up, a translation failed. Demoting a candidate for that is
charging them for the process's incompleteness, and it runs directly against
[uncertainty resolving toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate).
It is also self-defeating: the adjustment is itself uncertain, so the adjusted
order carries a second, undocumented band nobody computes.

Keep the honest score order. Change the sentence. A surface that renders the same
row order under all three separation states, with different framing and different
sealed status, has solved this without inventing a new score nobody can defend.

## Procedure

1. **Compute a band per candidate** from the enumerated thinness sources, at the
   same moment the score is computed and from the same inputs, so the two can
   never drift apart.
2. **Rank on the point estimate.** Unchanged, deliberately.
3. **Evaluate separation** between the top two ranked candidates specifically.
   Separation is a property of the boundary that matters, not of the whole field.
4. **Gate the crown on the cohort floor first.** Below the floor there is no
   leader to separate; the separation status is not computed rather than computed
   as unknown.
5. **Bind the status to the copy.** Every sentence that asserts a lead consults
   the status. The status is not an annotation next to a confident sentence; it
   selects which sentence exists.
6. **Seal the status with the verdict,** together with both bands and the cohort
   size, so a later reader can reconstruct how much was claimed —
   [a claim carries its sample and its basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis).

## Decision rules

- When separation is `overlapping`, the surface may still present an order and
  may still recommend a shortlist for human review, but must not present a single
  candidate as the choice, and must not phrase the gap as a margin.
- When separation is `unknown`, say the separation could not be assessed. Never
  substitute silence: a lead rendered with no separation qualifier reads as
  separated.
- When more than two candidates' bands mutually overlap at the top, report the
  overlapping group rather than the pair. A three-way statistical tie presented as
  a two-way close call understates it.
- When a band would extend beyond the score scale, clamp the *display* and keep
  the uncut width for the comparison. Clamping before comparing manufactures
  separation at the ends of the scale.
- When any input to a band is missing, the band is unknown — not narrow. A
  missing thinness signal is the strongest argument for width, never for
  precision.

## When not to use it

Do not use bands to compare candidates evaluated under different rubrics or
different role definitions. Separation between incomparable scales is arithmetic
on unrelated numbers; the answer is refusal, not a wider band.

Do not surface the numeric band width itself to a candidate-facing view. It is an
internal honesty instrument; to a candidate it reads as a precision score about
them, which is exactly the misreading the technique exists to prevent.

Do not treat separation as a hiring recommendation. Separated means the evidence
distinguishes them under this rubric. It does not mean the leader should be
hired, and it never authorizes an automated adverse outcome for anyone below.
