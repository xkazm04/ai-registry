---
layer: application
type: application
subject: skill-adjacency-and-normalization
technique: sibling-adjacency-below-the-match-threshold
stack: process
status: forged
verified_on: 2026-08-20
---

# The sub-threshold sibling constant in a Python jobfit scorer

## The two numbers, and the invariant between them

`pipeline/jobfit/taxonomy.py:517-528` holds the hierarchy credit constants:

```python
_SPECIALIZATION_MATCH = 0.9   # candidate knows a specialization of the requirement
_GENERALIZATION_MATCH = 0.55  # candidate knows only the broader / foundational skill
_SIBLING_MATCH = 0.4
```

The comment above `_SIBLING_MATCH` states the invariant rather than the value:
a sibling scores below a generalization because neither the requirement nor its
foundation is shown, and it is "set below `matching._MATCH_THRESHOLD` (0.5) BY
DESIGN: a bare sibling never counts as a 'matched' skill — it only nudges the
skills sub-score as partial, adjacent evidence a recruiter must still verify."
Only a **direct** shared parent qualifies (`term_match_score`,
`taxonomy.py:785`, tests `_PARENTS` disjointness); deeper cousins sharing only a
grandparent stay at `0.0`, exactly the decay-to-zero the technique demands.

`_MATCH_THRESHOLD = 0.5` lives at `pipeline/jobfit/matching.py:63-71`, and its
comment carries the other half of the standard in the repo's own words: "a
'matched' skill at 0.5 is NOT proven hands-on possession; `matched_skill_strength`
carries the per-skill score so the UI can distinguish a partial hit from an exact
(1.0) one and recruiters don't read 'matched: Kubernetes' as verified Kubernetes
experience."

## The three disjoint buckets

`score_skills` (`matching.py:405-450`) is where the technique's "addressed /
claimed-but-unproven / never-claimed" partition is realized, and the ordering of
its branches is load-bearing:

- `best >= _MATCH_THRESHOLD` → `matched`, with `strength[req.skill]` recorded.
- `best > 0.0` → `unproven[req.skill] = {"score", "reason"}`.
- `best == 0.0` and the requirement is a must-have → `missing`.

The inline comment names the consequence the technique warns about: a sibling
hit is "NOT absence, so it never belonged in `missing` (which would overstate the
gap and, via `_confidence`'s 'Misses N must-haves', widen the band for the
fairness-protected early-career cohort)." The sub-score is untouched by the
bucketing — `acc += best * weight` happens before the branch — so surfacing the
middle bucket changed no total.

## The ladder pinned as a contract

`pipeline/jobfit/tests/test_sibling_credit.py:1` is the contract file the
technique asks for. It asserts the *relations*, not only the literals:

- `test_sibling_value_is_below_generalization` — `_SIBLING_MATCH <
  _GENERALIZATION_MATCH`.
- `test_sibling_value_is_below_match_threshold_by_design` — `_SIBLING_MATCH <
  _MATCH_THRESHOLD`, the invariant that stops threshold creep.
- `test_deeper_cousins_stay_zero` — `credit_scoring` and `mortgages` share only
  the grandparent `loan_origination`; credit is `0.0`.
- `test_top_level_terms_without_parents_are_not_siblings` — two parentless roots
  are not siblings, guarding the empty-parent-set false positive.
- `SiblingScoreSkillsBoundaryTest` walks the whole boundary end to end: a
  candidate with SEO against a PPC must-have scores `0.4`, is **not** in
  `matched`, **not** in `strength`, and **not** in `missing`.

## The seam with provenance

`UnprovenReason` (`matching.py:357-365`) is the shared vocabulary at the seam:
`adjacency` (a related skill, capped below 1.0 even at full provenance),
`provenance` (the exact skill, discounted by its evidence source), `both`.
`_classify_unproven` (`matching.py:368`) re-derives the base score through the
same resolve-then-hierarchy path `skill_match_score` used, so the reason can
never disagree with the number that produced it. The full matrix — {exact,
specialization, generalization, sibling} × {strong, weak} — is pinned in
`pipeline/jobfit/tests/test_unproven_boundary.py:1`, including the pure-adjacency
cell (`seo` vs `ppc` at professional provenance → `reason == "adjacency"`, score
`0.4`) and the true-miss cell (`react` vs `python` → `missing`, `unproven == {}`).

## Verdicts

- **Confirmed.** Sibling credit below the threshold as a designed invariant;
  direct-parent-only siblings with grandparent cousins at zero; the three
  disjoint buckets; the ladder pinned as its own contract file; per-skill
  strength carried to the interface; the adjacency/provenance/both reason split.
- **Deviation.** `_GENERALIZATION_MATCH = 0.55` sits *above* the 0.5 threshold,
  so a candidate holding only the broad discipline is reported as "matched" for a
  specific requirement (`test_generalization_strong_is_matched_partial`). The
  standard does not lower on this: where a tier above the threshold is still
  partial, carrying `matched_skill_strength` to every surface is mandatory, and
  the display must name the relation rather than echoing the requirement's label
  beside a tick. The repo carries the strength; whether every surface renders it
  is not established by these anchors.
- **Upward lesson taken into the technique.** "Never counts toward missing" as
  an explicit rule alongside "never counts toward matched" — with the concrete
  downstream harm (a must-have miss count that widens a confidence band for the
  early-career cohort) that makes the two-bucket model actively unsafe rather
  than merely imprecise.
