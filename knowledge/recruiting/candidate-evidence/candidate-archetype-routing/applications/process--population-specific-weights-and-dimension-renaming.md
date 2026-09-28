---
layer: application
type: application
subject: candidate-archetype-routing
technique: population-specific-weights-and-dimension-renaming
stack: process
status: forged
verified_on: 2026-09-26
applied: experiment
ab_verdict: better
---

# Three renamed rubrics, a sum check, a golden set, and one ranked list

Read on 2026-09-26 at the tree's main, `cf9a4b81c`. Scoring runs in the Python pipeline
(`pipeline/jobfit/matching.py`). The recruiter surfaces are TypeScript.

## What the tree gets right

- **Each population has its own axes and names.** `pipeline/jobfit/archetypes.json`
  declares:
  - `bau`: Skills, Career, Personal at 0.50 / 0.35 / 0.15 (12-13);
  - `student`: Foundation, Potential, Fit at 0.40 / 0.40 / 0.20 (28-29);
  - `career_switcher`: the same three labels at 0.35 / 0.40 / 0.25 (45-46).

  An unknown archetype falls back to the experienced weights
  (`matching.py:923-924`).
- **The sum is enforced where the process reads the file.** `registry.py:30-58` raises at
  import on any vector off 1.0 by more than 1e-6. `app/_lib/archetype-registry.ts:123`
  does the same on every TypeScript read.

## Where this falls short of the standard

- **One ranked list, by decision.** `app/features/library/jobs/jobsRecruiterCandidatesLogic.ts:165-170`
  reads "ONE ranked list, not two columns ... the fairness guarantee it carried ... is a
  property of the ENGINE, not of a column". It was committed on 2026-09-16. The Python
  side has the grouped form (`pipeline/jobfit/recruiter.py:133-143`,
  `rank_candidates_by_track`) with no production caller. The flat sort at 129 carries its
  own warning, "a flat sort mixes incomparable scales". The same list applies one fit
  floor (`FIT_PROMISING_FLOOR = 55`, `app/_lib/fit-thresholds.ts:13`, used at 158) across
  all three rubrics.
- **Scores carry no rubric version.** Nothing stamps a score with the weights it was
  computed under. The registry reaches the score only through a cache-key digest.

## Applied

**Experiment, 2026-09-26: the sum and the golden set.** This tested the flipped claim
that the sum is the only guard on the running process but not the only check, because
it cannot see a legal-but-wrong vector.

The harness ran kp's pipeline test suite in a scratch export of `pipeline/` and `data/`.
The baseline has 73 failing or erroring tests in that export: tests that read files
outside it. Only the *new* failures are counted.

| Mutation to `bau` | Loads? | New failures | Which |
| --- | --- | --- | --- |
| skills and personal transposed (0.15 / 0.35 / 0.50, still sums to 1) | **yes** | 5 | score breakdown weight-aware; committed matching-eval record; per-scenario units; two winnability counts |
| skills 0.5 → 0.4 (sums to 0.9), import check disabled | yes (check off) | 7 | the sum's own unit test, plus six behavioural: weight override bounds, breakdown, fairness-matrix degeneracy, fault-eval rematch, two winnability counts |

- **A** said "nothing downstream can catch it; only the sum does". It predicted 0 new
  failures in both rows, and it was wrong twice.
- **B** says the sum sees only an illegal vector and a scored golden set catches both.
  It predicted both rows. The transposition loaded cleanly, exactly as B says the sum
  allows. **Verdict: better.**

What still stands from A: every one of those tests protects the repository's values, and
only the import check protects a file edited after CI.

**Unmeasurable, 2026-09-26: the mixed list.** This concerns the flipped rule that a
single ordering over populations needs a stated allocation or a measured comparability.
kp's seven labelled eval profiles were matched against its 120-job corpus with the
product's floor of 55:
- early-career profiles cleared the floor on 15 of 100 matches;
- experienced profiles cleared it on 2 of 67.

Seven profiles cannot separate a rubric's scale from the profiles' quality, and that is
the finding in miniature: one floor cannot tell them apart either. The instrument needed
is per-archetype admission at the shared floor over a real pool for one job. kp's
records hold that, and this run did not read them. Return when a per-job pool can be
exported.
