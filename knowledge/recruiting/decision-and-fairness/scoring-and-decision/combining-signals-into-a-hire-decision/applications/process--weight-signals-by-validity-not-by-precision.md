---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: weight-signals-by-validity-not-by-precision
stack: process
verified_on: 2026-09-27
applied: experiment
ab_verdict: better
---

# The evidence scale, the weakest-link rule and the missing heavy dimension (Python assessment pipeline)

The dev-case pipeline (`pipeline/jobfit/devcase/`) turns a role brief, a
candidate's reflection on their own work, a tooling signal and a graded
submission into a transfer assessment. Its combination rules are the clearest
realization in this repo of "weight by what the evidence *is*, not by how
precisely it renders" — and, since 2026-09-23, of the renormalizing rule the
standard has now conditioned.

## The confidence scale rates the evidence, not the person

`pipeline/jobfit/devcase/models.py:69-91` defines one 0..1 scale carried by every
self-rating artifact and states plainly that it rates "the strength of the
EVIDENCE behind the artifact, not the quality of the candidate or the need". The
bands are `>= 0.7` high, `0.4..0.7` moderate, `< 0.4` low, with `LOW_CONFIDENCE
= 0.4` (`:91`) as the warn line.

The detail that makes it honest: **the deterministic fallbacks rate themselves
deliberately low** — "analyze 0.5 grounded / 0.3 ungrounded, reflect 0.3, tooling
0.2 — so a degraded run never looks more certain than an LLM one" (`:78-80`).

## MIN, where the dependency is real

`_propagated_confidence` (`pipeline/jobfit/devcase/evaluate.py:301-315`) takes the
MIN of the upstream confidences. The comment at `models.py:83-87` gives the
reason: "An evaluation is built ENTIRELY from the reflection + tooling signals,
so it can be no more trustworthy than its weakest input". Inputs without a
numeric confidence are skipped, and **with none present the result is 0.0** —
"unknown evidence strength is treated as untrustworthy, never silently high."
Since 2026-09-23 the MIN is multiplied by the share of the rubric actually
scored (`evaluate.py:530`).

This is the case the standard's conditioned rule keeps: the two inputs are not
independent observations of one dimension but the materials the evaluation is
assembled from, and nothing records which dimension draws on which input. Where
the dependency is unknown, MIN over all of them is the rule.

## A live conversation is lighter evidence, so its bar is higher

`pipeline/jobfit/live_case.py:229-232`: "A live conversation is lighter evidence
than a take-home submission, so the bar is HIGHER than the take-home's
"promising" threshold: every case construct must average "Above bar" (4/5)
before the interview mints observed credit." `observed_from_interview`
(`:235-282`) requires a narrow-confidence scorecard, real quoted evidence on
every case construct ("a backfilled 'Not assessed' kills it" — the
placeholder-as-absence rule), and a mean at or above the bar. Its own evidence
confidence is capped at `min(0.9, mean/5)` (`:279`).

## Missing is excluded now — which is renormalizing

The four-way inconsistency this application used to quote is gone. Since
2026-09-23 (`evaluate.py:35-41`) "A dimension ABSENT from a dimensionScores dict
… is EXCLUDED from every number: models.rubric_composite leaves it out of the
case score (renormalising over the weight actually scored, naming it in
missingDimensions and scaling the propagated confidence by that share)".
`rubric_composite` (`models.py:193-244`) returns `overall`, `scoredWeight` and
`missing`, and `MISSING_DIMENSION_SCORE = 50` (`evaluate.py:42`) survives only as
a display seed. That fixed both deviations this application recorded on
2026-08-20: the neutral midpoint and the absent coverage figure.

It is also exactly the rule the standard now conditions. The falsy-coalesce fix
stands unchanged (`_num`, `evaluate.py:291-298`).

## Experiment (2026-09-27): a missing heavy dimension

kp's own `rubric_composite` and `_propagated_confidence` were imported
read-only and driven with one five-dimension file (framing 70, tooling 80,
judgment 30, architecture 70, transfer 60; reflection confidence 0.8, tooling
0.7). The promote gate's rule was then applied: score at least the floor of
55, and confidence above 0.4. Nothing was written.

| Case | Composite | Scored weight | Confidence | A (as shipped) | B (hold on a missing heavy dimension) |
| --- | --- | --- | --- | --- | --- |
| all five scored | 61 | 1.00 | 0.70 | advance | advance |
| judgment absent (0.25, the heaviest) | **71** | 0.75 | 0.525 | advance | **hold** |
| architecture absent (0.15, light) | 59 | 0.85 | 0.595 | advance | advance |

Leaving out the weakest dimension raised the score by ten points, and the
coverage-scaled confidence stayed above the gate. At this evidence strength,
confidence reaches the 0.4 line only when about 43% of the rubric is missing. B changes one verdict of three, the one where the absence flattered
the file.

Falsifier: dimensions that go missing at random with respect to their scores.
Then renormalizing is roughly unbiased, and B's hold costs time for nothing.
kp cannot yet tell the difference, because nothing records *why* a dimension is
missing.

Reach: on a fresh evaluation the path rarely fires. `coerce` fills any dimension
the model omitted from the deterministic scorer's value (`evaluate.py:505`), so
`scoredWeight` is 1.0, and exclusion only applies to stored or external
bundles.

## Deviations from the standard

- **A missing heavy dimension renormalizes instead of holding** (the
  experiment above).
- **An omitted dimension is imputed from another instrument without a label.**
  `coerce` substitutes the deterministic scorer's value for a dimension the
  model left out (`evaluate.py:505`). It does not add the dimension to
  `missingDimensions`, and it does not lower confidence. The standard calls
  this an imputation with a provenance.
- **Case weights, no cross-instrument composite.** `RUBRIC_DIMENSIONS`
  (`models.py:176`) and a case's own weights (`:216-221`) weight dimensions
  inside the work-sample instrument, and that is correct at that layer. The
  résumé match score, the scorecard and the transfer score meet only as
  separate gates, never as a declared composite with a recorded scheme
  version. So the equal-weights default the standard now recommends has
  nothing to apply to.
