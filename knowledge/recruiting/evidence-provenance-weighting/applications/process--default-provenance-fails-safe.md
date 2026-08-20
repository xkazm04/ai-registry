---
layer: application
type: application
subject: evidence-provenance-weighting
technique: default-provenance-fails-safe
stack: process
---

# The default-provenance incident (Python matching pipeline)

The ladder lives in `pipeline/jobfit/taxonomy.py:447` as `PROVENANCE_WEIGHTS` — twelve
rungs from `observed`/`professional` at 1.0 down through `open_source`/`internship`
0.85, `thesis` 0.75, `academic_project`/`personal_project` 0.7,
`extracurricular`/`certification` 0.6, `coursework` 0.5, to `self_declared` 0.4.
`skill_match_score` (`:967`) multiplies the taxonomy match by the rung, so the
discount rides on every requirement comparison.

## The default was the strongest rung

`taxonomy.py:469` carries the incident comment, and it is the spine of the whole
subject:

> This used to be `"professional"` — the joint-highest trust tier — so absence of
> evidence was read as the STRONGEST possible evidence: a skill the candidate merely
> typed into a list scored identically to one demonstrated for five years in
> production, and a well-written CV therefore outranked a plainly written one carrying
> real artifacts.

`DEFAULT_PROVENANCE = "self_declared"` (`:486`) is the fix, and the comment names the
principle it restores — the discount fails *safe* (understate an unevidenced claim)
rather than *flattering* — explicitly aligning it with how the rest of the pipeline
treats missing signal: unscored → excluded, unknown archetype → shielded, absent
robustness → `"not_varied"`.

## Placement: the default is at the definition, and it converged three call sites

`skill_match_score(..., provenance: str | None = DEFAULT_PROVENANCE)` (`:970`) puts the
value at the parameter definition, so a caller that omits provenance inherits the floor
rather than a call-site convention. `docs/features/matching/README.md:46` records that
**three** call sites converged on this one fix because they all inherit the shared
default — `taxonomy.py:DEFAULT_PROVENANCE`, `transform.py`'s per-archetype default, and
`app/_lib/candidate-pool.ts`, which emits no provenance at all and inherits the Python
one.

That doc also records the segmented-discount failure the standard warns about, in the
repo's own words: before the fix the discount "applied only to early-career candidates
(`pipeline/jobfit/transform.py`), so the same unevidenced claim was penalised for the
person least able to evidence it and waived for everyone else." `transform.py:189` now
passes `provenance_default="self_declared"` for every candidate, not only early-career
ones.

**Deviation.** `provenance_weight()` (`taxonomy.py:815`) still falls back to
`PROVENANCE_WEIGHTS["unknown"]` = **0.6** — mid-ladder, above `coursework` — for a
`None` or unrecognised key, and `matching.py:443` passes `None` explicitly when no
candidate skill resolved. The standard puts unknown on the floor with self-assertion;
the repo keeps a mid-ladder `unknown` rung that the flagship default now bypasses but
does not remove. The standard stands: an unrecognised origin should score 0.4, not 0.6.

## The bucket consequence, and why the two numbers are one calibration

`_MATCH_THRESHOLD = 0.5` (`pipeline/jobfit/matching.py:63`) is documented as
deliberately below 1.0 so that both taxonomy parent/sibling hits *and*
provenance-discounted skills register as partial matches. The floor rung at 0.4 sits
under it by design — `taxonomy.py:478` spells the chain out: a self-declared exact
match scores 0.4, below the threshold, so it lands in `unproven_skills` (contributing
0.4 × weight, never zeroed) instead of `matched_skills`, and — the load-bearing half —
"It never becomes `missing` — that stays reserved for a claim the candidate never made
— so knockout filtering is unaffected." KO filtering runs on seniority and languages
only.

The same comment is where the repo notes `matched_skill_strength` exists so the UI can
tell a partial hit from an exact one, and that a "matched" skill at 0.5 is *not* proven
hands-on possession — `matching.py:63` states the recruiter-facing consequence
directly: recruiters must not read "matched: Kubernetes" as verified Kubernetes
experience.

## The regression tests

`pipeline/jobfit/tests/test_matched_provenance_honesty.py:1` pins the display half and
carries the sentence the standard borrows verbatim: an unearned tier "is not an
omission; it is an affirmative claim of verification the system never performed." Its
`_bau` helper is the segment test in practice — an experienced candidate, the
population whose default used to be `professional`, now riding the same
`DEFAULT_PROVENANCE` as everyone else, with callers who want the old behaviour forced
to pass `provenance_default="professional"` explicitly.

## What the repo teaches that the standard did not

Two upward lessons. First, the top rung's multiplier is **capped at 1.0** rather than
exceeding professional (`taxonomy.py:447`), with its extra value realized in the
confidence band (`matching._confidence` narrows for observed skills) and in
consolidation — the score stays a fit measure. Second, `UI_PROVENANCE` (`:495`) is a
curated *subset* of the ladder, weakest-to-strongest, that omits `observed` (producer-
minted only) and `unknown` (a scoring fallback, not a choice) and is code-generated
into the frontend, so a rung offered in a dropdown always has a weight and a
machine-only rung can never leak into a picker.
