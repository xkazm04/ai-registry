---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: weight-signals-by-validity-not-by-precision
stack: process
verified_on: 2026-08-20
---

# The evidence scale and the weakest-link rule (Python assessment pipeline)

The dev-case pipeline (`pipeline/jobfit/devcase/`) turns a role brief, a
candidate's reflection on their own work, a tooling signal and a graded
submission into a transfer assessment. Its combination rules are the clearest
realization in this repo of "weight by what the evidence *is*, not by how
precisely it renders".

## The confidence scale rates the evidence, not the person

`pipeline/jobfit/devcase/models.py:67-89` defines one 0..1 scale carried by every
self-rating artifact and states plainly what it measures: it "answers HOW MUCH TO
TRUST this inference — it rates the strength of the EVIDENCE behind the artifact,
not the quality of the candidate or the need." The bands are `>= 0.7` high
("safe to lean on for a decision"), `0.4..0.7` moderate ("usable, but corroborate
before weighting it heavily"), `< 0.4` low ("thin / ungrounded; treat as a weak
hint only"), with `LOW_CONFIDENCE = 0.4` (`:89`) as the warn line.

The detail that makes it honest: **the deterministic fallbacks rate themselves
deliberately low** — "analyze 0.5 grounded / 0.3 ungrounded, reflect 0.3, tooling
0.2 — so a degraded run never looks more certain than an LLM one" (`:78-80`). A
pattern-matching fallback that scored itself like a reasoned one would be the
purest form of the precision trap: same field, same scale, no relationship to
what was actually observed.

## MIN, not mean, at every join

`_propagated_confidence` (`pipeline/jobfit/devcase/evaluate.py:80-94`) is the
rule in five lines. The final artifacts do not self-rate; they inherit:

> "An evaluation is built ENTIRELY from the reflection + tooling signals, so it
> can be no more trustworthy than its weakest input — evaluate.py sets it to the
> MIN of the upstream confidences (transfer then inherits the evaluation's).
> MIN, not mean, keeps the invariant above intact end-to-end: a high-confidence
> reflection can't average away a confidence-0.2 deterministic tooling signal"
> (`models.py:81-86`)

Two edges are handled explicitly (`evaluate.py:87-94`): inputs without a numeric
confidence are skipped, and **with none present the result is 0.0** — "unknown
evidence strength is treated as untrustworthy, never silently high."

That number is what the promote gate later tests against
`LOW_EVAL_CONFIDENCE = 0.4` (`app/_lib/devcase-run.ts:757`), so the weakest-link
value is not decorative — it is the thing that blocks an advance.

## A live conversation is lighter evidence, so its bar is higher

`pipeline/jobfit/live_case.py:229-232` states the standard's counterintuitive
rule as a constant:

> "A live conversation is lighter evidence than a take-home submission, so the
> bar is HIGHER than the take-home's 'promising' threshold: every case construct
> must average 'Above bar' (4/5) before the interview mints observed credit."
> `INTERVIEW_OBSERVED_MIN_RATING = 4.0`

`observed_from_interview` (`:235-268`) then applies three "honest gates, all
required":

1. a wide-confidence scorecard never mints — "a thin transcript never mints";
2. every case-fed construct must be rated on **real quoted evidence** — "a
   backfilled 'Not assessed' kills it". This is the placeholder-as-absence rule:
   the field is populated, the observation is not;
3. the mean of those ratings must clear `min_rating`.

The constructs themselves are derived from the shared interview script's
case-grounded phases (`:222-227`) "so this can never drift from what the agent
really probed" — the crediting rule cannot outrun the instrument.

## Missing is not zero — and the one-policy lesson

`MISSING_DIMENSION_SCORE` (`pipeline/jobfit/devcase/evaluate.py:41`) exists
because of a four-way inconsistency, described at `:35-40`: previously the same
absent dimension "silently read as 50 in the average, 0 for the strong-list, 100
for the gap-list and 0 in the ordered breakdown — so 'not scored' was conflated
with 'scored zero' and a gap was both not-a-strength and not-a-gap."

The mirror bug is fixed in `_num` (`:70-78`): `float(x or default)` conflated
missing with a measured zero, so "a candidate whose measured fluency /
readBeforeWrite is exactly 0.0 (the worst case — 'never read before generating')
hit the falsy-`or` and was silently scored as the neutral default, upgrading the
single strongest negative signal to a middling score."

The same distinction is enforced upstream in the policy pass:
`pipeline/jobfit/automation.py:336` computes `scored = score > 0` and `:379`
holds rather than rejects — "screened without a match score; awaiting match (not
auto-rejected)" — with the docstring at `:319-327` naming the failure it
prevents: without it "an unscored entry would collapse to `int(None or 0) == 0`
and be rejected for `0 < bau_reject_score`, silently turning a data gap into a
rejection."

## Deviations from the standard

- **The chosen absent-value policy is a neutral midpoint.** Applying *one*
  policy everywhere fixed the incident, and that consistency is the upward
  lesson. But 50 still makes an unmeasured dimension indistinguishable from a
  measured mediocre one in the average. The standard's rule — renormalize over
  what was measured and record the coverage — stands; the code does not
  implement it.
- **No coverage figure reaches the decision.** Nothing counts how many rubric
  dimensions were actually scored, so a composite over two of the rubric's
  dimensions and one over all of them are indistinguishable downstream except
  through the propagated confidence.
- **Weights are per-rubric, not per-validity.** `RUBRIC_DIMENSIONS`
  (`pipeline/jobfit/devcase/models.py:174`) fixes dimension weights for the
  work-sample instrument, which is correct at that layer — but there is no
  cross-instrument weighting scheme at all. The résumé match score, the
  scorecard and the transfer score meet only as separate gates, never as a
  declared composite with a recorded scheme version.
