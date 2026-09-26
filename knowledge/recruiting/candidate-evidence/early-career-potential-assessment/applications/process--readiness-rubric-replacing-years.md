---
layer: application
type: application
subject: early-career-potential-assessment
technique: readiness-rubric-replacing-years
stack: process
verified_on: 2026-09-26
---

# The readiness rubric in a Python matching pipeline

A spawned Python analysis pipeline scores candidates for a TypeScript/React hiring app.
`pipeline/jobfit/transform.py` holds the readiness model; `pipeline/jobfit/matching.py`
consumes it; `pipeline/jobfit/archetypes.json` decides who it applies to.

## The swap, declared in one file

`archetypes.json` is the single source of truth read by both Python
(`pipeline/jobfit/registry.py`) and TypeScript (`app/_lib/archetypes.ts`), so the
question "which archetypes get the readiness path instead of years" has exactly one
answer. Each archetype carries a `scoringModel` — `"experienced"` (years-based) or
`"early_career"` (potential replaces years) — plus its own weights and dimension
labels. The student entry (`archetypes.json:20-36`) weights skills 0.40 / career 0.40 /
personal 0.20 and renames the dimensions to **Foundation / Potential / Fit**, against
the experienced entry's Skills / Career / Personal at 0.50 / 0.35 / 0.15.

Note the direction of the weight change: the replaced dimension is weighted *up* (0.35
→ 0.40), not down. This is the standard's "must reach the top of its range" rule showing
up as arithmetic — the readiness slot is not a consolation dimension.

`transform.py:27` reads membership through `registry.early_career_archetypes()` rather
than an inline archetype list (used at `:207`), and `transform.py:229` runs
`compute_potential(profile) if is_early else (None, [])` — `None`, not `0.0`. The
unmeasured state is a type, all the way through: `matching.py:1152` falls back to the
tenure-based `score_career` only when `potential_score is None`.

## The four dimensions

`compute_potential` (`transform.py:36-103`) returns `(score, signals)` — a number and
human-readable reasons, never a bare float:

- **depth** (`:40-49`) — `len(project_like)/3` over `project` and `thesis` evidence, with
  `+0.15` per item carrying an actual link. Verifiability is a bonus on top of
  existence, which is the artifact primacy rule expressed as a coefficient.
- **velocity** (`:51-57`) — distinct skills across claims and evidence, over 8. This is
  the pipeline's deviation from the standard: it measures *breadth*, not accumulation
  per unit of available time, so a candidate with a broad shallow surface reads as fast
  and a late starter with two deep areas does not. The standard's time-available
  denominator stays; nothing here has to change for it to be adopted.
- **foundation** (`:59-64`) — education level (`phd` 1.0, `master` 0.85, `bachelor` 0.7,
  `university` 0.5, now owned by `education.py:41` `FOUNDATION_WEIGHTS`) plus 0.1
  when the study detail matches the target role family's degree terms, sourced from
  `taxonomy.FAMILY_DEGREE_TERMS` across all 16 families rather than the original three
  tech ones. Grades are absent by decision, not by omission — the concept doctrine in
  `docs/_archive/STUDENT_SCORING_CONCEPT.md:76-79` records the trade-off explicitly:
  transcript averages are "weak predictors, noisy across schools, and a bias vector".
  The decision stands; the reason overstates. For new graduates grades are moderate
  predictors, and "bias vector" is adverse impact rather than predictive bias; the
  standard now states the omission as a trade of validity for comparability.
- **initiative** (`:66-80`) — additive over internship (0.4), extracurricular (0.3),
  open-source (0.3), certification (0.2), clamped to 1.0.

The weighted sum is `0.35·depth + 0.25·velocity + 0.25·foundation + 0.15·initiative`
(`:102`) — depth leading, initiative trailing, exactly the ordering the standard argues
for, and declared on one readable line rather than distributed through the function.

## Switcher branch inside the same rubric

`transform.py:82-100` treats a career changer as an early-career profile with extra
inputs rather than as a separate model: prior professional roles add 0.4 to initiative
and floor depth at 0.6 from three years (`>= 3`, `:88`), and an **adjacent** prior field
with job evidence behind it floors foundation at 0.5 (`:96`). The comment states the asymmetry the standard recommends — a far
field "changes no number — the meta-skill credit already prices it — but the signal
keeps the narrative honest."

## Structured argument, not measurement

The pipeline treats the score as the standard requires. It is clamped at the Pydantic
boundary and again at scoring (`matching.py:161-177`, `:1157`, which now also maps a NaN to 0) so a malformed readiness
value cannot corrupt the 0-100 dial. It never gates alone — the early-career KO is
entry-eligibility (`matching.py:419-423`), a clean exclusion with a reason
(`KoReason(key="early_career", detail="role not open to early-career")`), not a low
score. And thinness is expressed as band width, not as a lower number:
`matching.py:1091-1100` widens the confidence band with named, coded drivers,
"Early-career: thinner, less-verifiable track record" (`earlyCareerThin`, +6) versus the
narrower "Early-career, but some skills were directly observed (live case/interview)"
(`earlyCareerObserved`, +2); the codes let the UI localize the reason.

The archive doctrine is honest about what the rubric is: the weights are "judgment, not
data", so telemetry is persisted per candidate "so weight validation against outcomes
can start once outcomes accumulate. Until then we treat the score as a structured
argument, not a measurement — which is also why it never gates anything alone."
(`STUDENT_SCORING_CONCEPT.md:367-375`)

## Corroboration, capped below identity

`pipeline/jobfit/live_case.py:30-58` closes the loop without letting results rewrite the
population. A passed work sample (`OBSERVED_THRESHOLD = 65`) lifts archetype confidence
by `ROUTING_CONFIDENCE_LIFT = 0.15`, hard-capped at `ROUTING_CONFIDENCE_CEIL = 0.75` —
deliberately below a self-declaration's 0.9 — and `_corroborate_routing` returns early
for non-early-career profiles and is only called when minting actually happened, so "a
failed case must never touch the routing either way". Performing well is corroboration,
not identity; performing badly is not a demotion. Minting is now stricter too: an
assessment whose own confidence is low mints nothing (`:134`), and a scored interview
case corroborates through the same capped path (`apply_interview_case`, `:294-315`).

## What is absent

Independent scoring before a debrief, and interviewer-level identity on a scorecard, are
not implemented anywhere in this pipeline. The standard still requires them; this
realization simply does not evidence them.

## Deviations read on 2026-09-26

Two, both against the techniques as they now stand; neither is fixed here.

- **An unstated degree is an imputed zero.** `transform.py:60` reads
  `foundation = EDU_FOUNDATION.get(profile.education_level, 0.0)`, and `unknown` is the
  profile's default level (`profile.py:112`) with no entry in the table. A graduate whose
  CV omits the degree line loses the whole 0.25 foundation slot, while the recruiter note
  at `matching.py:1290` says "Education level unknown — not penalized (absence of
  evidence, not a fail)". Run against three of the repo's own eval CVs
  (`pipeline/jobfit/eval/fixtures/`), the two bachelor graduates fall from 0.510 to 0.310
  when the line is missing. Reweighting the survivors would not be the repair: the
  career changer's score *rises* from 0.840 (a modest degree stated) to 0.920 (omitted).
  The lowest measured rung as a default (0.435 and 0.815) does neither. The narration
  and the arithmetic disagree today, whichever rule is chosen.
- **The switcher branch is gated on the archetype id.** `transform.py:83`
  (`if profile.archetype == "career_switcher":`) gates the +0.4 initiative, the depth
  floor and the adjacency floor, and `:224` threads `domain_distance` under the same test.
  The meta-skill credit beside it is gated on the scoring model precisely so that a
  switcher misread as a student keeps it. Here a misread switcher loses the floors.
