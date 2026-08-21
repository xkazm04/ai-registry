---
layer: technique
type: technique
subject: selection-score-calibration
technique: base-rate-skill-score
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [reporting whether a screening score is worth using, comparing a model against doing nothing, translating a score metric for a hiring team]
---

# Base-rate skill score

A raw scoring-rule value is uninterpretable on its own. A mean squared error of
0.13 is excellent in one cohort and embarrassing in another, and nobody outside
the analytics team can tell which. The fix is a **skill score**: express the
error as a fractional improvement over a named reference forecast, so the number
answers the only question a hiring team actually has — *is this better than not
having it?*

## The reference must be the cohort's own base rate

The reference forecast is a constant probability assigned to every candidate. The
right constant is **the observed positive rate in the same cohort**, not 0.5.
This matters more in hiring than almost anywhere, because selection outcomes are
routinely lopsided: if 85% of screened candidates advance, a coin-flip reference
is trivially beaten and the resulting figure is flattery. Against the real base
rate, the score has to demonstrate that it distinguishes *within* an already-
skewed population, which is the actual job.

Under the squared-error rule the reference has a closed form: a constant forecast
of the base rate scores exactly the base rate times its complement. No simulation,
no bootstrap, no reference model to train — which is worth knowing, because the
usual excuse for shipping a raw error figure is that computing a baseline is
work. It is one multiplication.

Read the result on a fixed scale:

- **Above zero** — the score beats knowing nothing but the base rate, by that
  fraction of the reference's error.
- **Zero** — the score adds exactly nothing. Everything it "predicts" is the
  prior.
- **Below zero** — the score is *worse* than the constant. This is not a rounding
  artifact and it must not be clamped to zero for presentation. A negative skill
  score means the number currently shown to recruiters is actively misleading
  them relative to the belief they already held, and it is the single most
  important thing the surface can say. Clamping it is the same class of error as
  imputing an unscored candidate to the mean.

Report the base rate itself alongside the skill score, always. A skill of 0.15
against a base rate of 0.5 and against a base rate of 0.93 are different claims,
and the reader cannot recover the second number from the first.

## Procedure

1. **Fix the cohort.** Same arm, same outcome axis, same window. The base rate is
   computed over exactly the population being scored — a base rate borrowed from
   a wider population turns the skill score into a comparison of two cohorts.
2. **Compute the reference error** by assigning the base rate to every candidate
   and scoring it with the same proper rule used for the model.
3. **Compute the skill** as one minus the ratio of model error to reference
   error.
4. **Attach the sample and the arm.** A skill score is a claim; it carries its
   basis like every other.
5. **Render a verdict, not just a figure,** and derive the verdict from the arm
   ceiling as well as the number. A high skill score computed on score-caused
   labels is bounded by that arm's ceiling no matter how high it goes — the
   structural bar overrides the statistic, because the statistic is measuring the
   gate.

## Verdict bands and how to phrase them

Bands are a presentation choice and must be defended as one, but a surface
without them pushes interpretation onto whoever reads it last. A workable set:
clearly positive skill with an adequate sample and a low-leakage arm reads as
*trustworthy*; positive skill on a medium-leakage arm, or thin sample, reads as
*suggestive*; skill near zero reads as *no better than the base rate*; negative
skill reads as *worse than the base rate* in plain language and triggers a
review of whether the score should be gating anything at all.

Phrase every band in outcome terms rather than statistical ones. "Candidates
scored above the cutoff advance about twice as often as those below" travels; a
decimal does not. The decimal stays available for the reader who wants it.

## Decision rules

- **When the cohort is degenerate — every outcome the same way — no skill
  exists.** The reference error is zero and the ratio is undefined. The verdict
  is *cannot tell you*, not *weak* and not *worse than the base rate*. Routing a
  degenerate cohort to a negative-sounding band is a defamation of the model in
  the same way imputing a zero is a defamation of a candidate: both invent a
  measurement where there is none.
- **When the base rate is extreme** — above roughly 0.9 or below 0.1 — flag it.
  Skill scores are numerically unstable there and a small sample of the rare
  class dominates the result. State the count of the rare class explicitly. A
  cohort that advances the overwhelming majority of the people it screens is
  nothing like a coin, and measuring it against one is how a *negative* skill
  score comes to be rendered as a comfortable margin over guessing.
- **When the cohort is below the global outcome floor, do not compute it.**
  Insufficient sample is the verdict.
- **When comparing two models, compare skill against the same base rate,** not
  raw errors, and only over the same cohort. Two skill scores from different
  cohorts are not comparable and putting them on the same axis implies they are.
- **When skill is positive but the curve is flat,** distrust the skill score and
  chase the discrepancy — it usually means the positives are concentrated in one
  under-populated band.
- **Never fabricate a prediction to fill the cohort.** A candidate with no stored
  score is excluded from both the model error and the reference error; imputing
  the mean makes the model look like the base rate, and imputing zero makes it
  look worse than it is while defaming the candidate.

## When not to use it

Do not use a skill score as the only headline. It compresses ordering and scaling
into one number and cannot distinguish "well-ordered but mis-scaled" from
"carries no information" — the reliability curve exists for that, and the two
findings have completely different remediations.

Do not use it as an acceptance test for deployment on its own. A positive skill
score says the number carries information; it says nothing about whether the
information is a proxy for something the organisation may not select on, nothing
about whether the gate's outcomes differ across groups, and nothing about whether
a human is in the loop where one is required.
