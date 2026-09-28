---
subject: early-career-potential-assessment
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# early-career-potential-assessment

First touch by `/deepen` (single subject, dispatched by the Curator lane on the scan
finding "single stack (process)"). Registry HEAD at dispatch 55c6bce2; worked from
origin/main e70dc47f, because the primary checkout was 74 behind. Consumer read at kp
origin/main 5c3d1f0cd, in a detached worktree; kp's primary checkout was diverged and
held by a live sibling session.

## 2026-09-26 - widened to react, eight claims conditioned, one rule flipped, three applications re-verified

**Depth rung:**
- L2 primary for the corrections: meta-analyses, statute and case law, one large survey.
- L3 empirical for the flipped rule: a three-case simulation on the consumer's own
  eval CVs, run against the pinned tree.

**Lanes:**
- counter-evidence (web, unconstrained);
- training-data-only (blind);
- consumer tree: re-verify every citation, then find a second stack.

**Landed** (one commit):
- NEW application `react--explainable-potential-breakdown` (react@19). It clears the
  single-stack finding. Two surfaces: the weighted score bar, with labels keyed off a
  code, and the potential badge's popover. It records the gap upstream of both: the
  scorer returns `(score, signals)` and discards the four sub-scores.
- Golden path, each item conditioned on two converging lanes:
  - Grades are not "weak predictors" for new graduates: about .45 in year one, decaying
    to about .1 after six years (Roth 1996; 2024 meta-analysis about .21 overall). The
    "bias vector" is adverse impact (d .6-.8), not predictive bias.
  - Observation earns the top rung on provenance, not validity. Work samples sit near
    .33 after Sackett 2022, the evidence is mostly from incumbents, and the applicant d
    is about .7 (Roth 2008). It equalizes career stage, not subgroups.
  - "Roughly double" is labelled a prompt heuristic, not an estimate.
  - Internship access is softened to "strongly shaped by class, region and family money"
    (Sutton Trust figures).
  - Velocity is marked unvalidated. It counts stated field-time only; unavailable time
    is never inferred or asked about.
  - Domain distance is computable from task data (Gathmann & Schönberg 2010; skill
    similarity from job ads) but unvalidated against performance. It may place bands;
    it never earns decimals.
  - For verifiable dates, the documentary record outranks both self-report and a test.
  - New paragraph: symmetry across career stages is necessary, not sufficient. Career
    stage proxies age in UK and EU law (Acas; Rainbow v Milton Keynes). Define the
    population by career stage, open it at any age, write down the aim, and monitor
    by protected group.
- **Flipped rule** (blind lane plus the field simulation), `readiness-rubric`: "mark
  unmeasured and reweight the survivors" rewards withholding.
  - An input the candidate could supply takes the lowest measured rung as its default,
    with a wider band.
  - Only an input the process failed to measure is reweighted.
  - The narration must describe the arithmetic.
- Technique conditions:
  - `readiness-rubric`: the velocity denominator;
  - `shipped-artifact`: the heuristic label, and provenance versus validity;
  - `domain-distance-grading`: computable but unvalidated; task distance may place
    families;
  - `symmetric-discount`: the protected-group decision rule.
- All three process applications re-verified to 2026-09-26. Every line citation had
  drifted, and every constant held. One statement was false even on 2026-08-20: the
  access-is-not-merit guardrail "in the proposer" exists only in an archived doc, and
  the model prompt ranks internship high-trust.

**Verified and left untouched:**
- Years of experience is a weak proxy (Van Iddekinge 2019, ρ≈.06; Sackett 2022, .07).
- Exact weights matter less than declaring them (Dawes).
- No solely automated adverse outcome.
- Selection-rate comparison at the gate, not among survivors.
- An unvalidated score never gates.
- Result-driven reclassification is circular.

**Declined (single lane, banked with return conditions):**
- Far transfer is weak (Sala & Gobet 2017; occupation-specific human capital), which
  argues that a far band should cost something. Web lane only. Return with a second
  lane, or a consumer with switcher outcome data.
- Shrinkage: an empirical-Bayes midpoint on a thin file does move, and ranking by
  point estimate gives a winner's curse. Blind lane only.
- Joint versus separate evaluation (Bohnet, van Geen & Bazerman 2016) against "visible
  separation beats interleaving". Blind lane only, and the strongest lead here. Return
  with a web lane on the evaluation-mode literature.
- "Mint asymmetrically" caps an instrument's validity and rewards retakes. Blind lane
  only.
- Validated novice instruments (structured interview, SJT, cognitive ability) and
  Pareto-optimal composites. Blind lane only, and it belongs to the assessment
  subjects, not here.

**Consumer deviations found (recorded in the applications, not fixed; kp was held by a
live sibling):**
- an unstated degree is an imputed zero, beside a "not penalized" note;
- the switcher floors are gated on the archetype id, not the scoring model;
- the self-declared scrutiny note fires only for early-career candidates;
- a stale BAU-default comment;
- the sub-scores are discarded;
- the learning signals are English-only and uncoded;
- the dimension label map exists in four copies;
- "Potential" can label a tenure score on a `None` path (read from the code, not
  executed).

**Source classes:**
- Meta-analyses decided grades, work samples, experience and velocity.
- Statute, case law and regulator guidance decided the age and protected-group
  condition.
- Peer-reviewed labour economics decided domain distance.
- An advocacy survey with a large sample decided internship access.
- The blind lane matched the web lane on all eight landed corrections, and diverged
  only on leads it alone raised. The class priors are not drifting.

## Impact

`build-registry-map --project kp` joins this subject to three kp contexts:
`tests-scoring-fairness` (strong), `score-metric-display` and `match-score-shared-types`
(probable). All pairs are `unknown`, so no judged verdict went stale. The digests move
with this landing.

## Clocks and return conditions

- No dated regulatory claim was forged. The age-law paragraph is doctrine with cited
  cases, not a dated statute application.
- Re-read the consumer when either lands:
  - a fix to the unmeasured-education default (the simulation's arm C is the
    measured target);
  - a return type from the readiness model that carries sub-scores (the react
    application's main gap).
