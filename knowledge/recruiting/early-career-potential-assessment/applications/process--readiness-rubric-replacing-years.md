---
layer: application
type: application
subject: early-career-potential-assessment
technique: readiness-rubric-replacing-years
stack: process
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

`transform.py:128` reads membership through `registry.early_career_archetypes()` rather
than an inline archetype list, and `transform.py:150` runs
`compute_potential(profile) if is_early else (None, [])` — `None`, not `0.0`. The
unmeasured state is a type, all the way through: `matching.py:833` falls back to the
tenure-based `score_career` only when `potential_score is None`.

## The four dimensions

`compute_potential` (`transform.py:31-100`) returns `(score, signals)` — a number and
human-readable reasons, never a bare float:

- **depth** (`:38-44`) — `len(project_like)/3` over `project` and `thesis` evidence, with
  `+0.15` per item carrying an actual link. Verifiability is a bonus on top of
  existence, which is the artifact primacy rule expressed as a coefficient.
- **velocity** (`:46-52`) — distinct skills across claims and evidence, over 8. This is
  the pipeline's deviation from the standard: it measures *breadth*, not accumulation
  per unit of available time, so a candidate with a broad shallow surface reads as fast
  and a late starter with two deep areas does not. The standard's time-available
  denominator stays; nothing here has to change for it to be adopted.
- **foundation** (`:54-61`) — education level (`phd` 1.0 → `university` 0.5) plus 0.1
  when the study detail matches the target role family's degree terms, sourced from
  `taxonomy.FAMILY_DEGREE_TERMS` across all 16 families rather than the original three
  tech ones. Grades are absent by decision, not by omission — the concept doctrine in
  `docs/_archive/STUDENT_SCORING_CONCEPT.md` records the trade-off explicitly: transcript
  averages are "weak predictors, noisy across schools, and a bias vector".
- **initiative** (`:63-78`) — additive over internship (0.4), extracurricular (0.3),
  open-source (0.3), certification (0.2), clamped to 1.0.

The weighted sum is `0.35·depth + 0.25·velocity + 0.25·foundation + 0.15·initiative`
(`:99`) — depth leading, initiative trailing, exactly the ordering the standard argues
for, and declared on one readable line rather than distributed through the function.

## Switcher branch inside the same rubric

`transform.py:80-97` treats a career changer as an early-career profile with extra
inputs rather than as a separate model: prior professional roles add 0.4 to initiative
and floor depth at 0.6 past three years, and an **adjacent** prior field floors
foundation at 0.5. The comment states the asymmetry the standard recommends — a far
field "changes no number — the meta-skill credit already prices it — but the signal
keeps the narrative honest."

## Structured argument, not measurement

The pipeline treats the score as the standard requires. It is clamped at the Pydantic
boundary and again at scoring (`matching.py:125-131`, `:848`) so a malformed readiness
value cannot corrupt the 0-100 dial. It never gates alone — the early-career KO is
entry-eligibility (`matching.py:307-320`), a clean exclusion with a reason
(`KoReason(key="early_career", detail="role not open to early-career")`), not a low
score. And thinness is expressed as band width, not as a lower number:
`matching.py:783-788` widens the confidence band with named drivers, "Early-career:
thinner, less-verifiable track record" versus the narrower "Early-career, but some
skills were directly observed".

The archive doctrine is honest about what the rubric is: the weights are "judgment, not
data", so telemetry is persisted per candidate "so weight validation against outcomes
can start once outcomes accumulate. Until then we treat the score as a structured
argument, not a measurement — which is also why it never gates anything alone."

## Corroboration, capped below identity

`pipeline/jobfit/live_case.py:36-58` closes the loop without letting results rewrite the
population. A passed work sample (`OBSERVED_THRESHOLD = 65`) lifts archetype confidence
by `ROUTING_CONFIDENCE_LIFT = 0.15`, hard-capped at `ROUTING_CONFIDENCE_CEIL = 0.75` —
deliberately below a self-declaration's 0.9 — and `_corroborate_routing` returns early
for non-early-career profiles and is only called when minting actually happened, so "a
failed case must never touch the routing either way". Performing well is corroboration,
not identity; performing badly is not a demotion.

## What is absent

Independent scoring before a debrief, and interviewer-level identity on a scorecard, are
not implemented anywhere in this pipeline. The standard still requires them; this
realization simply does not evidence them.
