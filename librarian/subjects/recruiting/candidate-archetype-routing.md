---
subject: candidate-archetype-routing
domain: recruiting
last_touched: 2026-09-26
dry_streak: 0
---

# candidate-archetype-routing

First touch by `/deepen`. This was a single-subject run dispatched by the Curator lane on
the scan finding "never swept by the librarian", with nothing expired or at risk. Registry
HEAD at dispatch was 55c6bce2. The primary checkout's main was 136 behind origin, so the
run worked from origin/main in a detached worktree. The consumer was read at kp's local
main, 4287bd354 and then cf9a4b81c; no cited file changed between the two.

## 2026-09-26 - no inference outranks a declaration, the fallback score is a placeholder, the sum is not the only check

**Depth rung:** L2 primary for the corrections:
- statute and regulation text: the Title VII score-adjustment clause; the age regulation
  naming "college student" and "recent college graduate"; the EU age directive; AI Act
  Art. 14;
- court opinions on age as distinct from years of service, and on applicant
  disparate-impact reach;
- the selection-procedure Principles on underprediction;
- applicant-faking and verifiable-biodata studies;
- unit-weighting and mechanical-vs-holistic meta-analyses;
- selective classification and calibration papers;
- automation-bias reviews;
- configuration-error studies;
- ML monitoring papers.

L3 empirical for three applications: kp's own detector, `profile_cli` and pipeline test
suite, driven keylessly.

**Lanes:** counter-evidence on legal and measurement claims (web); counter-evidence on
confidence, review and configuration claims (web); training-data-only (blind);
consumer-tree re-verification (read-only).

**Landed** in 40995a7a:
- **Flipped, confidence (both lanes):** the third invariant. No inference reaches the
  declaration tier, because a winner's share reads 1.0 on one weak signal. The threshold
  is derived from a labelled sample and published with its error.
- **Flipped, confidence (both lanes):** "do not raise the threshold because the queue is
  too big" was inverted, since lowering is what shrinks it. "Never" is also withdrawn.
  Capacity is an input, and reviewers see the signals before the verdict.
- **Flipped, conservative default (both lanes):** "understates, the honest direction" is
  withdrawn. Underprediction is bias against the group, so the fallback score is a
  placeholder, kept out of every ranking, floor and cut until routed.
- **Flipped, weights (both lanes):** "only the sum catches it; nothing downstream can" is
  refuted. The sum is the one guard on the running process. A scored golden set catches
  the transposition the sum cannot see.
- **Flipped, weights (both lanes):** the comparison across populations is undefined as
  arithmetic, but a single sort makes it anyway. It needs an allocation, or a measured
  comparability.
- **Conditioned, self-declaration (both lanes):**
  - A declaration buys a fit, not a favour. It is checked by comparing the rubrics, never
    by a graduation year.
  - Only the candidate's own act is a declaration. A pinned class stays derived.
- **Conditioned, golden path (both lanes):** the archetype is an age correlate by
  construction. Route on current evidence, justify each rubric, and measure the split by
  age band. The shield seam now points to the neighbour's rule: membership by instrument
  failure, not by label.
- **Corrected claims:**
  - A fitted model rarely beats round weights at hiring sample sizes. "Usually
    outperforms" is withdrawn (web + blind).
  - The below-threshold rate is an output-side warning, not the earliest one (web; blind
    on drift).
- **Applications:**
  - Three re-verified to 2026-09-26.
  - One 08-20 shortfall has since been fixed: the degraded intake now persists `unknown`.
  - Another is mostly fixed: the TypeScript side validates on read.
  - Two 08-20 claims were narrower than written: the display test shields three values,
    not six, and the "two flags kept separate" are now joined on the TypeScript gate.
  - Three new: confidence (process), self-declaration (node), weights (process).

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Signal accumulation beats a rule chain | confirmed | web + blind |
| Round ordinal weights, not fitted | confirmed; "fitted usually wins" refuted at small n | web + blind |
| Share or margin is a defensible confidence | conditioned: needs an evidence-mass floor and a measured threshold | web + blind |
| A threshold plus review is a control | conditioned: capacity, anchoring, rubber-stamping | web + blind |
| Never raise the threshold for queue size | wording inverted; absolute withdrawn | web + blind |
| Self-declaration trusted, never overridden | conditioned: fit not favour; only the candidate's act | web + blind |
| Contradiction caps as min, never compounding | conditioned by web (independent contradictions should compound); confirmed by blind | split, banked |
| Unknown scored on the experienced rubric is honest | refuted as safe; kept as least-assertive | web + blind |
| Separate renamed rubrics; comparison undefined | conditioned: a sort compares anyway | web + blind |
| Sum-to-one at load; only the sum catches it | refuted as "only"; kept as the process guard | web + blind, and kp experiment |
| One shared file, source-scan test, archive not delete | confirmed; version stamp owed | blind |
| Unrouted rate as earliest warning | conditioned: output-side | web + blind |
| Title VII score-adjustment clause applies to career stage | refuted: it lists five classes, and age is not one | web + blind |

## Impact

- **kp: 7 contexts:**
  - `candidate-matching`, `candidate-profile`, `cv-analysis-archetypes`;
  - `profile-editor`, `profile-roster-matrix`;
  - `results-core`, `tests-matching-taxonomy`.

  0 judged, 0 stale verdicts against this subject. The map was rebuilt and committed in
  kp at 3f675ccd7. Unrelated stale verdicts in kp's map: 19, under other subjects.

## Owed to kp (recorded as deviations, not fixed)

- The recruiter "Save as profile", the applicant gap-answer merge and the profile editor
  re-submit the routed class as `selfDeclared`. An unguided 0.4 routing becomes a 0.9
  "self-declared" one with its review flag erased.
- The signal branch's share reads 1.0 on one weak signal, above the 0.9 declaration tier,
  against the invariant `live_case.py` states.
- The contradiction cap is an assignment in both runtimes (`registry.py:311`,
  `profileReadiness.ts:116`).
- Declared and derived archetypes share one field.
- The Python policy pass reads `entry.get("archetype") or "bau"` and keys its shield on
  `scoringModel`. The TypeScript re-check refuses the reject. `fairnessProtected` has no
  Python production reader, and the TypeScript shield ORs it with `scoringModel`, so the
  flag the artifact calls compliance-critical cannot switch a shield off.
- One ranked list and one fit floor across three rubrics, with no allocation and no
  measured comparability. The unknown's placeholder score sorts with routed scores.
- No rubric version on scores, no unrouted-rate alarm, no routing sample or calibration,
  and no test routing into an archived class.
- The README's published signal table has drifted from the data (`substantial`'s +0.5 to
  career_switcher is missing).

## Applied

Seven rows in `librarian/applied.md`; six of them also in kp's `.ai/applied.jsonl`
(4ca00a8d2):
- confidence tier: experiment, better;
- self-declaration: simulation, better;
- conservative default: simulation, better;
- weights sum: experiment, better;
- mixed ordering: unmeasurable;
- age correlate: simulation, unmeasurable;
- queue sizing: unapplied (registry only), because kp has no review queue.

kp's two commits sit on its local main, **not pushed**. kp main has diverged, 65 ahead
(63 of them other sessions' unpushed commits) and 3 behind origin, and integrating that
is not this run's history to rewrite or publish.

## Declined

- **Title VII's score-adjustment clause as the legal hook for career-stage rubrics.**
  Both lanes found that it lists race, color, religion, sex and national origin only.
  Age exposure runs through age law, which the golden path now states.
- **The EU Annex III deadline moving to 2027 under an omnibus regulation.** Web lane,
  from commentary only, not verified in the Official Journal. Not cited.
- **"Grant the shield only to unclassifiable profiles."** A web-lane suggestion that
  over-reaches this subject. Shield membership is the neighbouring gate subject's call,
  and that subject already moved it to instrument failure.

## Banked leads

- **Independent contradictions should compound.** Web lane: correlated tests do not
  compound, and conditional independence over-counts evidence. The blind lane confirmed
  `min`. Return: when a second lane or a tree with two independent contradiction sources
  for one archetype shows up.
- **Reviewer override rate as the review's own health metric.** Blind lane, and adjacent
  to the web lane's anchoring evidence. Return: when a fleet project records a
  reviewer's reading before revealing the machine's class.
- **Rubric differential prediction across populations.** Both lanes named it as the
  check that decides "fit, not favour", but neither found a hiring-routing study.
  Return: when a project has labelled outcomes per population.

## Clocks

No application clock is set; the stacks' derived windows apply. The regulatory claims
(the EU AI Act high-risk timetable, and US disparate-impact enforcement posture) move
within a year. Re-check them by 2027-03-26.
