---
layer: application
type: application
subject: selection-score-calibration
technique: base-rate-skill-score
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: simulation
ab_verdict: not-better
---

# Skill against the cohort's own base rate, and how far to trust it at the floor (Node/TypeScript)

The technique had no application before this pass. It is realised in one pure function and one
constant in `app/features/insights/analytics/calibrationVerdict.ts` (kp at `006bf7a0a`), and the
interesting part is not the arithmetic, which is right, but what the verdict ladder built on it
does at the sample size the surface is allowed to render at.

## What is there

`calibrationSkill` (`:43`) takes `{ n, positives, brier }` and returns the base rate, the
reference error `baseRate * (1 - baseRate)` and `skill = 1 - brier / baseBrier`. Every clause of
the technique is present: the reference is the cohort's own base rate; a degenerate cohort
(reference error 0) returns `skill: null` and is routed to `"unknown"`, not "weak"; a negative
skill is not clamped. The comment above it (`:34-42`) records the incident: 0.25 is a coin's
Brier, "a cohort that advances 86% of the time is nothing like a coin", and the seeded pipeline
arm scored −0.332, worse than a constant guess, under a headline that had claimed a comfortable
margin over guessing.

`verdictFor` (`:71`) turns skill into a label with one fixed cut, `GOOD_SKILL = 0.2` (`:58`):
`skill >= 0.2` is `trustworthy`, above zero is `weak`, else `untrustworthy`. It is gated on
`calibrated` (`n >= minOutcomes`, 20), so a cohort of 20 outcomes can be labelled.

## Measured: the ladder at the floor (simulation, 2026-09-29)

Known ground truth: uniform scores, the outcome drawn with probability equal to the score, so the
score is perfectly calibrated and its true skill against the base rate is 0.334 (400,000-sample
estimate). 4,000 cohorts per size; `calibrationSkill`'s formula reproduced exactly, the ladder
cut at 0.2, no leakage penalty (the case the holdout arm is in).

| resolved outcomes | mean skill | sd | reads negative | reads under 0.2 |
|---|---|---|---|---|
| 20 | 0.296 | 0.199 | 7.7% | 30.1% |
| 30 | 0.309 | 0.157 | 3.7% | 22.7% |
| 50 | 0.320 | 0.114 | 0.6% | 14.8% |
| 100 | 0.327 | 0.081 | 0.0% | 6.0% |
| 200 | 0.331 | 0.056 | 0.0% | 1.1% |
| 400 | 0.332 | 0.039 | 0.0% | 0.0% |

So at the floor a truly good score is labelled anything below `trustworthy` three times in ten,
and one time in thirteen is labelled worse than the base rate. The estimate is also biased low
at small n, as the technique now says (the reference is fitted on the sample it is scored on);
the sign holds for a calibrated score and was not measured for an overfitted one. A second
generator, whose outcome probability is shrunk toward 0.5 so that true skill is 0.200, sits on
the cut and splits about half and half at every size, as it should, which is a check on the
harness and not a finding. n = 4,000 cohorts per row; one score distribution, one base rate
near one half.

The surface does print the sample beside the verdict (`QualityInstrument.tsx:218-253`: arm,
outcomes, advanced, Brier, base-rate Brier, skill) and the body copy states the base rate
("{basePct} % advanced"), so a reader can see that n is 20. What it does not print is the width
of the estimate, and the label is chosen by a single cut. It is protected against the opposite
error (a thin arm cannot render at all under 20); it is not protected against a coin-flip label
just above it.

## Deviations from the standard

- **A point verdict at a sample where the estimate has sd 0.2.** The technique's new condition
  (print an interval, or n and the word *indicative*, and do not cut a band at a fixed skill
  while the interval straddles the cut) is half met: n is printed, no interval is, and
  `verdictFor` takes none. `GOOD_SKILL` is one number.
- **The headline says "calibrated" on the strength of a skill score.** `verdictGood`
  (`messages/en.json:7983`) reads "The screening score is well calibrated." for `skill >= 0.2`.
  A Brier skill score mixes ordering and scaling, which is the reason the technique warns
  against using it as the only headline. Worked case, population values from 400,000 draws:
  scores uniform on 0 to 1 and an outcome probability of the score *squared* (a score of 0.8
  advances 64% of the time, 0.5 advances 25%) has skill 0.251, so it clears the cut and is
  labelled well calibrated while overstating the advance rate at every score above zero. The
  reliability curve is where that would show, and the verdict does not read it.
- **The body copy is half in outcome terms.** It names the share that advanced and how much
  better than always predicting it; it does not say what a candidate above the cutoff can expect
  relative to one below, the sentence the technique says travels.
