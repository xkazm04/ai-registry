---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: weight-signals-by-validity-not-by-precision
status: forged
laws: [inference-must-look-like-inference, absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [assigning weights to a composite hiring score, deciding how much a live conversation counts against a work sample, reviewing a composite formula somebody wrote by feel]
---

# Weight signals by validity, not by precision

A composite's weights encode a claim: *this much of the decision should be
driven by that observation*. The claim is almost never checked. Weights get set
by three things unrelated to predictive power — how numeric the signal is, how
recent it is, how vivid it felt — and are then never revisited, because a formula
looks like a decision somebody already made carefully.

This technique sets each weight from the **validity** of the signal and the
**evidentiary class** of the observation, and refuses to weight at all what
cannot be defended.

## The evidentiary classes, and what they do not settle

Before any coefficient, classify the observation. Three classes, and the class
sets the *prior* on the weight — it is not a measured cap:

1. **Demonstration** — the candidate produced work under conditions you
   controlled, graded against a rubric fixed before the grading. A work sample,
   a live exercise, a job-knowledge assessment.
2. **Structured observation** — a trained assessor rated fixed dimensions on
   anchored scales, from a conversation. A structured interview, a structured
   reference call with fixed questions. Falls to the third class the moment the
   structure is nominal.
3. **Report and proxy** — the candidate, or someone acting for them, told you
   something. A résumé, a self-rating, an open-ended reference, a title, years
   of experience. Lightest class, regardless of how neatly it quantifies.

What the selection literature supports is a **coarse split**, not a three-rung
ladder: job-specific, structured signals from the first two classes form one
top group, well above unstructured judgment and far above proxies such as years
of experience. Inside the top group the order moves between re-analyses — the
2022 re-analysis put structured interviews ahead of job-knowledge tests and work
samples — and the coefficients have moved both up and down with the
corrections applied to them. And class 3 has a real exception: biographical
questions *keyed empirically against outcomes* predict about as well as the top
group, although the candidate reports them. The class describes how a signal was
built and checked, not the form it arrives in. Rely on the coarse split; do not
rank the top group from its labels, and do not paste in coefficients as if they
were measured on your instrument.

The law that a document yields hypotheses, a conversation yields evidence and
only a demonstration yields proof
([law](../../../../_laws.md#inference-must-look-like-inference)) governs how an
inference is *labelled and presented*. It is not a validity table, and a weight
scheme that reproduces it literally will under-weight a well-structured
interview.

## The precision trap, stated mechanically

Precision is the granularity of the scale; validity is the correlation with what
you care about. In hiring they are typically *anti*-correlated, because the
cheapest signals to quantify are the furthest from the work:

| Signal | Typical precision | Typical validity |
| --- | --- | --- |
| Résumé/profile score | continuous, computed to decimals | low |
| Years of experience | exact, unarguable | very low |
| Structured work sample | coarse rubric levels | high |
| Structured interview | anchored levels per dimension | high |
| Reference conversation | prose | low to moderate, high variance |

The last row is the least settled: the most recent large re-analysis excluded
reference checks for lack of data, and the older figure comes with a warning
from its own authors. Treat a reference's validity as unknown until a structured
form of it has been checked on your roles.

A composite that is not explicitly designed against this table will drift toward
the top rows, because those are the rows that never produce a missing value, an
awkward paragraph, or a scale argument.

**Rule.** When a weight is proposed, ask which of the two properties justified
it. If the answer is "it's the one we have a number for", the weight is invalid
and the signal belongs in the narrative, not the sum.

## Lighter evidence takes a higher bar, not a lower weight alone

Weight is only half the control; the other half is the **credit threshold** — how
much a signal must show before it counts at all. A live, unstructured
conversation is lighter evidence than a produced artifact, so the bar for
crediting a skill from it is *higher* and the confidence it can confer is
*capped*, however impressive the exchange was. Most systems get this backwards:
the vivid, recent, enjoyable signal feels strongest in the room, so it is
credited on the flimsiest showing. For a light-class signal:

- require an explicit, specific demonstration rather than a general impression
  before crediting a dimension;
- cap the confidence it can produce below the cap available to a demonstration,
  so a great conversation cannot alone lift a file into high confidence;
- never let it *overwrite* a demonstration on the same dimension — it may raise
  a discrepancy, which is a different and better outcome.

## Missing is not zero, and not the mean

A dimension nobody assessed has no weight to carry. It must be represented by a
distinct not-measured state that propagates into confidence and into the
narrative ([law](../../../../_laws.md#absence-of-evidence-is-not-evidence)). Two wrong
handlings, both common:

- **Zero.** Ranks the unmeasured candidate below one who was measured and did
  badly. Manufactures an adverse fact.
- **Imputed mean or a neutral constant.** Makes an unmeasured dimension
  indistinguishable from a measured mediocre one, and quietly lets a composite
  reach full weight on partial evidence.

The third handling — renormalize over what *was* measured — looks like the
neutral alternative and is not. It **is** imputation: every missing dimension
silently takes the candidate's mean on the others, and that is biased even when
the gaps are random. When they are not random it is worse. A dimension an
assessor skipped, or a model omitted, because the evidence for it was weak is
most likely a low one, and renormalizing hands the candidate the mean of their
better dimensions instead. The score *rises* because of the gap. Scaling
confidence by coverage does not catch it: a quarter of the rubric missing
lowers confidence by a quarter, which a well-evidenced file absorbs without
reaching a hold. So:

- **Always record coverage**, as a field of its own, never inferred from a
  score.
- **A missing heavy dimension holds.** A dimension at or near the rubric's
  largest weight, or the one the instrument exists to measure, cannot be
  averaged around. The file is not ready for a verdict.
- **A missing light dimension may be renormalized**, labelled as imputed, with
  coverage lowering confidence. A composite computed over two of six dimensions
  is not a low score; it is a score that must announce its coverage.
- **A value filled from another instrument is an imputation with a
  provenance**, never a measurement. For example, a fallback scorer standing in
  for a model that omitted one dimension must be recorded as the fallback's,
  and the dimension still counts as missing for coverage.

Two implementation lessons that cost real incidents:

- **One absent-value policy, applied in every consumer.** The worst outcome is
  not choosing the wrong policy; it is choosing four. One team's absent
  dimension read as a midpoint in the average, as a low value when building the
  strengths list, as a high value when building the gaps list, and as a low value
  again in the ordered breakdown — so the same unmeasured capability was
  simultaneously not-a-strength and not-a-gap, and no reader could tell it was
  unmeasured at all. Whatever the policy is, it is defined once and every
  derived view reads it from there.
- **Beware the falsy-coalesce.** The mirror failure of "missing scored as zero"
  is "a measured zero read as missing": a coalescing default applied to a ratio
  turns a genuine worst-case measurement of zero into the neutral default,
  silently upgrading the single strongest negative signal in the file to
  middling. Distinguish *absent* from *present-and-zero* by type, never by
  truthiness.
- **A placeholder is absence in disguise.** When an assessor's evidence field
  holds boilerplate — a backfilled "not assessed", an empty template line — the
  dimension was not observed, even though the field is populated. A crediting
  rule that only checks for a non-empty field will credit a form nobody filled
  in.

## Re-weighting when a heavier signal arrives

Weights are not static across a journey. A file with only a résumé score is not
the same object as one with a résumé score *and* a graded work sample, and should
not use the same formula with a hole in it. Define a **base scheme** over the
signals available at the current stage, and a **re-weight** that fires when a heavier-class signal exists,
shifting mass toward it and away from the proxies it supersedes. State both
schemes in advance, and record which one produced a given decision — a score
whose weighting scheme is not recorded cannot be re-derived, compared, or
defended later
([law](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Decision rules

- **When a signal's direction or validity for this role family is unknown, do
  not give it a weight.** Route it to the narrative and, if it is concerning, to
  a hold. An invalid member dilutes the composite toward the accuracy of a
  holistic judgment: an equal-weight sum of a .40 signal and a zero one predicts
  at about .28.
- **When only the optimal weight is unknown, use equal weights** over
  standardized signals of known direction. They predict nearly as well as fitted
  weights, and better at hiring sample sizes. Fitted weights begin to pay off
  only at roughly fifteen to twenty resolved outcomes per signal.
- **When two signals observe the same underlying evidence** (an interview
  conducted after reading the screening score; a sample brief generated from the
  parsed résumé), collapse them to one weight. Double-counted evidence reads as
  corroboration and inflates confidence.
- **When a light-class signal disagrees with a heavy-class one**, the heavy one
  holds and the disagreement is raised — never averaged.
- **When coverage is partial**, record it; hold on a missing heavy dimension;
  renormalize over a missing light one only with the result labelled as
  imputed.
- **When the weights change**, version them. Old decisions keep the scheme they
  were made under and are marked as such, rather than being silently re-meant.

## When not to use this

Do not apply weighted combination *at all* in three situations:

- **Screening-out gates.** A hard, legally required credential is a predicate,
  not a weight. It does not trade off against a good interview.
- **Single-signal stages.** Early in a funnel there may be exactly one signal.
  Wrapping it in a composite with imputed companions turns one honest weak
  number into one dishonest confident one.
- **Cross-candidate ranking.** Weighting for a within-candidate verdict and
  weighting for a shortlist ordering are different problems; a scheme tuned to
  produce a stable individual verdict may produce an ordering that flips under a
  small weight perturbation. That robustness question belongs to the comparative
  subject.
