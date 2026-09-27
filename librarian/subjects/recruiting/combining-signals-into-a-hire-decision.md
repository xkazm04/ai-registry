---
subject: combining-signals-into-a-hire-decision
domain: recruiting
last_touched: 2026-09-27
dry_streak: 0
---

# combining-signals-into-a-hire-decision

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "never swept by the librarian", at 3 attention points with nothing expired or at
risk (oldest verification 2026-08-20, 16 consults, no deviations). Registry HEAD at
dispatch was 55c6bce2. The primary checkout's main was 146 behind origin, so the run worked
from origin/main in a detached worktree. kp was read at 4ca00a8d2 and again at a32fd1362;
no cited file changed between the two.

## 2026-09-27 - verification is a chain and evidence is not, renormalizing is imputing, an override is a disagreement

**Depth rung:** L2 primary for the corrections:
- selection meta-analyses: the 2022 re-analysis (full-text table), the 2016 upward
  revision, the mechanical-versus-holistic meta-analysis, the 2000 clinical-versus-
  statistical meta-analysis, improper linear models;
- combination and missing data: composite reliability, combining forecasts under
  dependence, proration bias;
- field and decision evidence: the fifteen-firm study of discretion in hiring,
  unstructured interviews that dilute a valid cue, credit-scoring reject inference, the
  selective-labels paper;
- law text: the Uniform Guidelines on cutoffs, grouping and borrowed validity; the
  Title VII bar on per-group adjustment; GDPR Art. 22 and the EU guidelines on automated
  decisions; the CJEU score and explanation judgments; the UK's replacement of Art. 22
  and its regulator guidance; Colorado's replacement statute; the AI Act omnibus.

L3 empirical for one application: kp's own `rubric_composite` and
`_propagated_confidence`, driven keylessly.

**Lanes:**
- counter-evidence on measurement claims (web);
- counter-evidence on governance and law claims (web);
- training-data-only (blind);
- consumer-tree re-verification (read-only).

**Landed** in 012524c8:
- **Flipped, validity (both lanes):** the three classes are a coarse split, not a
  ranking. The 2022 re-analysis put structured interviews above job knowledge, keyed
  biodata and work samples, and a keyed report signal above work samples. The
  coefficients moved both ways. The inference law governs labelling, not weights.
- **Flipped, weights (both lanes):** unknown optimal weights take equal weights. What
  excludes a signal is an unknown sign or unknown validity, because an invalid member
  dilutes the composite (.40 + 0 gives about .28).
- **Flipped, confidence (both lanes):** min over the inputs a conclusion depends on, and
  over verification status. Independent agreement compounds. An unknown dependency is
  treated as a dependency; the kp simulation supplied this condition.
- **Flipped, discrepancy (both lanes):** "the average is the one output guaranteed to be
  wrong" is withdrawn. Pool within a tolerance derived from the instruments' reliability.
  The debrief's job is unshared observations, not unconverged numbers.
- **Flipped, missing (both lanes):** renormalizing is imputation. A missing heavy
  dimension holds. A value filled from another instrument is an imputation with a
  provenance.
- **Conditioned, floor (both lanes + law):**
  - The success threshold is the cost ratio of the two errors; 50% is right only when
    they cost the same.
  - A minimum count per band.
  - A floor with adverse impact is defended as minimum proficiency.
- **Flipped, per team (all three):** the answer is per team, and the evidence may be
  pooled openly as a named prior. Weights travel better than floors. The action's scope
  may not exceed the evidence's. No calibration by protected group.
- **Flipped, overrides (all three):** an override is a labelled disagreement, scored
  against its outcome and never used as ground truth.
- **Conditioned, terminal (law + blind):** a human act counts only if it is one. The
  rule is stricter than most law, on purpose. Agreement rate needs seeded known-wrong
  cases and review time.
- **Conditioned:**
  - Clean-arm membership independent of the candidate, counted in adverse impact, with
    raters blind.
  - Hold rates in the adverse-impact measurement.
  - Loop weight changes gated by sample size, shrinkage and an impact re-check.
- **Applications:**
  - Three re-verified to 2026-09-27.
  - The hold rule moved to its own module, with a third hold (`not_scored`).
  - The midpoint and coverage deviations of 2026-08-20 are fixed. The fix is
    renormalization, which the standard now conditions.
  - Two 08-20 deviations were wrong when written: clearing a hold did record its actor,
    and the floor did appear in the trail text.
  - One new: the per-team loop (per-team evidence, a deployment-wide floor).

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Three classes in a stable order across every re-analysis | refuted as a ranking; coarse split holds | web + blind |
| Unstructured interviews correlate strongly with interviewer preference | reworded: low inter-rater reliability (~.4) | web + blind |
| Mechanical beats holistic on the same inputs | confirmed; "equals or beats", exceptions held more information | web + blind |
| Underived weights are a guess with a decimal point | refuted; the member, not the weight | web + blind |
| Confidence is the min of inputs | conditioned: dependencies and verification only | web + blind |
| Averaging is the one output guaranteed wrong | refuted; within tolerance, average | web + blind |
| Score before you confer; blind to screening scores | confirmed (blind to scores, not content) | web + blind |
| Floor at the first band with a majority success rate | conditioned: cost ratio, per-band n, proficiency | web + blind + law |
| The clean arm | confirmed with conditions | web + blind + law |
| Another team's data is contamination, not a prior | refuted; named prior with partial pooling | web + blind + law |
| The loop may adjust floor and weights | conditioned: sample-size gate, shrink, impact re-check | web + blind |
| Overrides are a labelled error | refuted; labelled disagreement | web + blind + law |
| A light signal takes a higher bar | confirmed (web); conditioned (blind: shrink, not a bar) | split, banked |
| Renormalize over the measured, never impute | refuted; renormalizing is imputing | web + blind |
| Only a human may reject; a growing number of regimes regulate it | conditioned: stricter than law; a human act must be meaningful | law + blind |
| 99.5% agreement is a good model or a formality | conditioned: seeded cases, review time, outcome scoring | law + blind |
| Blockers are predicates above the score | confirmed; hold rates enter adverse impact | law + blind |

## Impact

- **kp: 6 contexts:**
  - `analytics-calibration`, `autonomy-control-room`;
  - `decisions-review-ui`;
  - `decisions-screen-wave-logic`, `hiring-decisions-api`, `pipeline-api`.

  One judged verdict against this subject is now stale: `decisions-review-ui`
  (deviation). The map was rebuilt and committed in kp at 4597c6376. kp's map carries 20
  stale verdicts in total, 19 of them under other subjects.

## Owed to kp (recorded as deviations, not fixed)

- **The calibration corpus mixes two scores.** The floor is applied to the transfer
  score, and the manual outcome form posts it. The automatic feed records
  `entry.matchScore`, which promotion has written as null since 2026-08-28 and a later
  pass may fill with a profile match score. The update keeps whichever score arrives,
  so a match score can overwrite a transfer score on one row. The comment at
  `dev-outcomes.ts:417-421` still says the entry carries the transfer score. Found by
  reading; not executed.
- **One team's advice moves every team's floor.** The `promote_floor` is one
  deployment-level key, while the corpus behind the advice is per workspace. It is
  declared in the route, and it breaks the scope rule.
- **A model-omitted dimension is filled from the deterministic scorer**, unlabelled.
  It is not counted in `missingDimensions` and does not lower confidence. A stored
  bundle missing its heaviest dimension renormalizes and advances.
- **The two runtimes read an absent confidence differently.** TypeScript treats it as
  "no signal, no penalty"; Python as 0.0.
- **No per-band minimum and no cost ratio.** At four outcomes, "calibrated" renders
  without a caveat.
- **No clean arm on the promote-floor corpus.** The screening holdout labels its
  members to the recruiter.
- **Overrides are sealed and never read.** There is no discrepancy rule and no
  coverage blocker. Holds have no owner and no clock.

## Applied

Ten rows in `librarian/applied.md`; the seven with kp as their project also in kp's
`.ai/applied.jsonl`:
- missing heavy dimension: experiment, better;
- confidence by dependency: simulation, not-better (it supplied the unknown-dependency
  condition);
- per-team loop: simulation, unmeasurable;
- cost-ratio floor, overrides, clean-arm conditions, hold rates: unmeasurable;
- averaging within tolerance, the meaningful human act, and equal weights: unapplied.
  No fleet project has the seam.

kp's commits sit on its local main, **not pushed**. kp main has diverged, 79 ahead
(other sessions' unpushed commits) and 3 behind origin, and integrating that is not
this run's history to rewrite or publish.

## Declined

- **The EU high-risk hiring obligations now start on 2 December 2027** (Regulation (EU)
  2026/1744, read by the law lane in the Official Journal). It is not cited, because the
  subject states no AI Act date. It is recorded here as a clock for the neighbouring
  compliance subjects.
- **"Rejected candidates generate no outcome data" rewritten as "the individual false
  negative goes undiscovered".** Law lane only: adverse impact is detectable from
  selection rates, and human rejections share the problem. It is a fair gloss, but a
  single lane, and the sentence's point stands.
- **The offer-row and guard-window rules.** The law lane found nothing either way; they
  are design choices, left as written.

## Banked leads

- **A light-class signal: shrink it, do not raise its bar.** Blind lane: the right
  response to a noisier signal is shrinkage toward the mean. Web: the higher bar was
  confirmed by an unstructured-interview dilution study. Return: when a second lane
  finds a crediting-threshold study.
- **Unproctored work samples need an authenticity cap on confidence.** Blind lane. It
  is adjacent to the AI-assistance subject, which owns it. Return: if that subject's
  next pass does not already carry it.
- **Consensus versus averaging in panels.** A single primary source (1996, 62
  interviewers) found consensus slightly more valid. The landing says "about as
  valid". Return: when a second study is found.

## Clocks

No application clock is set; the stacks' derived windows apply. The legal claims (the
2023 CJEU score ruling's reach, the materially-influences statutes, and US employment
law on per-group adjustment) move within a year. Colorado's replacement statute applies
from 2027-01-01, and the AI Act's hiring obligations from 2027-12-02. Re-check by
2027-03-27.
