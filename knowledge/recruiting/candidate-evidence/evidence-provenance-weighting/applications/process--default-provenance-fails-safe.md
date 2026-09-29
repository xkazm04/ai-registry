---
layer: application
type: application
subject: evidence-provenance-weighting
technique: default-provenance-fails-safe
stack: process
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The default-provenance incident (Python matching pipeline)

The ladder lives in `pipeline/jobfit/taxonomy.py:632` as `PROVENANCE_WEIGHTS`, twelve
rungs: `observed` and `professional` at 1.0; `open_source` and `internship` at 0.85;
`thesis` at 0.75; `academic_project` and `personal_project` at 0.7; `extracurricular`
and `certification` at 0.6; `coursework` at 0.5; `self_declared` at 0.4; and `unknown`
at 0.6. `skill_match_score` (`:1294`) multiplies the taxonomy match by the rung, so the
discount applies to every requirement comparison.

## The default was the strongest rung

The incident comment sits at `taxonomy.py:654`, and it is the spine of the whole
subject:

> This used to be "professional" — the joint-highest trust tier — so absence of
> evidence was read as the STRONGEST possible evidence: a skill the candidate merely
> typed into a list scored identically to one demonstrated for five years in
> production, and a well-written CV therefore outranked a plainly written one carrying
> real artifacts.

The fix is `DEFAULT_PROVENANCE = "self_declared"` (`:671`). The comment names the
principle it restores: the discount fails *safe* (it understates an unevidenced
claim) rather than *flattering*. It explicitly matches how the rest of the pipeline
treats missing signal: unscored → excluded, unknown archetype → shielded, absent
robustness → `"not_varied"`.

## Placement: the definition, three call sites, and a fourth that minted

`skill_match_score(..., provenance: str | None = DEFAULT_PROVENANCE)` puts the value at
the parameter definition. `provenance_weight()` (`:1094`) now floors a `None` or
unrecognised key to the same default and logs it. The comment there records why: the
old fallback to the `unknown` rung "let a typo'd provenance string promote an
unevidenced claim into matched_skills".

`docs/features/matching/README.md:189` records that **three** call sites converged on
the fix: `taxonomy.py:DEFAULT_PROVENANCE`, `transform.py`'s per-archetype default
(`:268` now passes `self_declared` for everyone), and `app/_lib/candidate-pool.ts`. The
doc also records the segmented discount in the repo's own words: before the fix, the
discount "applied only to early-career candidates ... so the same unevidenced claim was
penalised for the person least able to evidence it and waived for everyone else."

**A fourth site minted the segmentation, and it survived the fix (fixed 2026-09-29).**
`pipeline._v2_profile_from_payload`, dated 2026-05-31, built the v2 profile from the CV
analysis with `default_prov = "self_declared" if early else "professional"`. Every claim
the extraction left without a usable provenance got that default: a claim with none,
a value outside the vocabulary, and every listed skill when the payload carried no
`skill_claims` at all. The default was baked into the stored `v2Profile`, which
`candidate-pool.ts` hands to scoring as the candidate's profile, so
`build_match_candidate`'s own default never saw an unknown claim.

A new test, `test_cv_path_default_provenance.py`, starts at extraction. It includes a
positive control that the two fixtures route to different archetypes. It was red on 3
of 5 cases: an experienced candidate's listed Python came back `professional` and
*matched*, and a student's identical file came back `self_declared` and *unproven*.
The fix (kp `1ad9aa2df`, committed locally, not pushed) imports `DEFAULT_PROVENANCE`
into the CV path, and the test is now 5 of 5 green.

One existing test had pinned the old behaviour. Its helper's docstring read
"professional provenance via the CV fallback". It now states the tier explicitly, the
way `test_matched_provenance_honesty.py` already did, and a merely listed sibling
correctly reads `both`. The jobfit suite ran 3,321 passed and 2 failed, before this
test was re-baselined. One failure was that test; the other is a stage-vocabulary AST
test that predates the change and fails for an unrelated reason.

Stored v2Profiles keep what they were minted with, and a defaulted `professional`
cannot be told apart from a stated one after the fact. Only new analyses change.

## The unknown rung is still mid-ladder

`Evidence.provenance` defaults to `"unknown"`, and `resolved_provenance`
(`profile.py:85`) maps the evidence kind `other` to it. The LLM schema offers `other`,
and the CV path coerces any unlisted kind to it. `unknown` weighs 0.6, which is above
`_MATCH_THRESHOLD = 0.5` (`matching.py:74`). A simulation on the real modules compared
three `other` items with the rung at 0.6 and floored at 0.4, clearing the
`skill_match_score` LRU cache between arms. The first run tied because the cache
served the second arm. The three items were a freelance contract, a technical role in
an army signals unit, and an unlabelled skills line.
- At 0.6, all three are *matched*, ahead of a placed coursework claim at 0.5. That is
  right for the two described roles and wrong for the bare skills line.
- At 0.4, all three are *unproven*. That is right for the line, and it scores the two
  described roles like a skills-bar entry.
- **Verdict: not-better.** The standard's floor gets 1 of 3 right and the status quo 2
  of 3. The technique gained its condition from this row: an unmapped category is not
  an unknown origin. Floor it for scoring, queue it for re-classification, and keep
  the two distinguishable.
- **Not changed in code.** Moving the rung is a ladder re-weight, and kp's own
  re-baseline procedure applies to it.

## The bucket consequence, and why the two numbers are one calibration

`_MATCH_THRESHOLD = 0.5` is documented as deliberately below 1.0, so that both taxonomy
parent/sibling hits *and* provenance-discounted skills register as partial matches.
The floor rung at 0.4 sits under it by design. A self-declared exact match scores 0.4,
lands in `unproven_skills` (contributing 0.4 × weight, never zeroed), and "never
becomes `missing` — that stays reserved for a claim the candidate never made — so
knockout filtering is unaffected."

## The regression tests

`pipeline/jobfit/tests/test_matched_provenance_honesty.py` pins the display half. It
carries the sentence the standard borrows: an unearned tier "is not an omission; it is
an affirmative claim of verification the system never performed." Its `_bau` helper is
the segment test at the scoring layer. `test_cv_path_default_provenance.py` is the
same test at the extraction layer, where the scoring-layer test could not see the
fourth site.

## What the repo teaches that the standard did not

- **The multiplier cap.** The top rung is capped at 1.0 rather than exceeding
  professional. Its extra value is realised in the confidence band
  (`matching._confidence` narrows for observed skills) and in consolidation, which uses
  a separate `PROVENANCE_RANK` because several rungs share a weight.
- **The dropdown vocabulary.** `UI_PROVENANCE` (`taxonomy.py:716`) is a curated subset
  of the ladder, weakest to strongest. It omits `observed` (producer-minted only) and
  `unknown` (a scoring fallback, not a choice). It is code-generated into the frontend
  and checked at import against the weights.
- **The fourth site's lesson** is the one the technique now carries: the default has
  to reach every site that mints claims, not only every site that scores them.
