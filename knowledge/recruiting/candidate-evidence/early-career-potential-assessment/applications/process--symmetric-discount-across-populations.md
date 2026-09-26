---
layer: application
type: application
subject: early-career-potential-assessment
technique: symmetric-discount-across-populations
stack: process
verified_on: 2026-09-26
---

# The asymmetric provenance default, and its repair

This is the incident the technique is written from, preserved in the code that fixed it:
`pipeline/jobfit/transform.py:261-268`, inside the `MatchCandidate(...)` call of
`build_match_candidate` (`:177`).

## What shipped first

Every skill on a candidate carries a provenance, and `skill_match_score` weights the
match by it (`taxonomy.PROVENANCE_WEIGHTS`, `taxonomy.py:617-638`: `observed` and
`professional` 1.0, `open_source` and `internship` 0.85, `thesis` 0.75, `coursework` 0.5,
`self_declared` 0.4). Skills with no recorded provenance fall
back to a default, and the original default was:

```python
provenance_default = "self_declared" if is_early else "professional"
```

Read it as a policy sentence and it is indefensible. An experienced candidate's bare,
unevidenced skill list was credited at **full professional weight, 1.0**; a student's
identical bare list was credited at **0.4**. The same unevidenced claim — the same
absence of any record — was penalised by 60% for the population with the least ability
to evidence anything, and waived entirely for the population the market already
advantages.

Every half of it looked reasonable in isolation. Discounting unevidenced claims is
provenance weighting working correctly. Assuming an experienced candidate's listed
skills come from their job is a plausible reading of a CV. Only the composition is the
failure, and nothing in a normal review looks at the composition — which is why the
symmetry audit exists as a separate pass over every conditional adjustment.

## How it was caught

Not by code review. By running the pipeline against representative candidate scenarios
and reading the outputs side by side — the fix comment cites the acceptance cases
(`UAT 2026-07-20 cs-jana-02 / LUC-GEF-L1-05`). An asymmetric discount is invisible in a
single candidate's score and obvious in two candidates' scores placed next to each
other, which makes paired scenario runs the cheapest detector available.

## The repair, and its direction

```python
# Was `"self_declared" if is_early else "professional"` — the discount for an
# uncorroborated claim fell ONLY on juniors ... One honest default for
# everyone; recorded provenance still overrides it per skill.
provenance_default="self_declared",
```

The repair levels **down**, not up: everyone now gets the conservative default. That is
the right direction here because the rule is a *default* rather than a *penalty* — it
governs what to assume when the record is silent, and any candidate escapes it by
supplying a record. `consider()` (`transform.py:186-198`) keeps the strongest recorded
provenance per skill (by ordinal rank now, `provenance_rank`, not by weight), so an explicit claim or a piece of evidence always overrides the
default; the default only ever describes silence.

The result is stricter on the previously exempt population and unchanged for the
previously penalised one. A repair that only made scores go up would have relocated the
asymmetry rather than removed it — and levelling *up* here would have meant crediting
every unevidenced claim at professional weight, destroying the provenance signal the
whole match depends on.

`taxonomy.py:639-656` carries the same reasoning as doctrine at the ladder itself:
`DEFAULT_PROVENANCE = "self_declared"` is "the honest reading of an uncorroborated claim",
adopted so that a well-written résumé does not outrank one carrying real artifacts.

## The rest of the audit surface

Two other adjustments in this pipeline were checked against the same rule and pass:

- **Transferable meta-skill credit** (`transform.py:209-221`) is a bonus that only one
  population can earn — which the technique flags as a discount on everyone else — but
  it survives because it re-credits evidence the experienced path already counts
  directly: "BAU stays out: their job evidence already carries professional provenance
  for the actual skills." Same evidence, one credit each, no population advantaged.
- **Domain distance** (`transform.py:91-100`, threaded at `:224`) can only raise a floor for an adjacent
  prior field; the far band changes no number. A band that cannot subtract is not a
  scoped penalty.

The pool-level check sits further downstream: at group evaluation the fairness matrix
re-scores every candidate under every other candidate's weight scheme and flags order
divergence (`matching.py:1238-1276`), so nobody wins because their own weights flatter them. Bounded weight
proposals (±0.15, clamped to [0.10, 0.60], `matching.py:980-982`) mean no signal can
erase a dimension. The access-versus-merit rule — weight responds to evidence relevance
and observed quality, **not presence**, because "having had access to an internship is
not itself a merit" — is doctrine, not code: the sentence lives only in
`STUDENT_SCORING_CONCEPT.md:264-266`, and no commit ever put it in the proposer. (This
application said otherwise until 2026-09-26.) The model prompt ranks internship among
the high-trust provenances (`weight_proposal.py:83-92`). The deterministic fallback
enforces relevance in behaviour, counting high-trust skills only where they meet a
must-have (`matching.py:1040-1046`). Presence alone moves nothing there. What the
model proposes is bounded, but not guarded by the rule.

## Read again on 2026-09-26

- **A second symmetry repair shipped, on sex rather than career stage.** The meta-skill
  map matched Czech job titles in the masculine form, so *učitelka* earned less than
  *učitel* for the same career (`a5b961444`, "a woman's identical career transferred
  fewer skills"). The map is now derived: `transferable.py:93`
  `_TRANSFERABLE_MAP = with_feminine_forms(_AUTHORED_TRANSFERABLE_MAP)` adds full
  feminine nominatives beside the authored signals. They are whole words rather than
  shorter stems, so a substring cannot hit an unrelated word (`:22-40`, `:69-90`). A
  taxonomy check fails the build on a masculine-only signal
  (`taxonomy_check.py:500`, summed into its gate at `:809`). It is the
  same composition failure, found the same way. Each signal list was reasonable. Only
  two otherwise identical candidates, side by side, showed the gap.
- **The narration is still scoped.** The score default is symmetric, but the recruiter
  note "Some skills are self-declared — discounted; validate them in interview." fires
  only inside `if candidate.archetype in _EARLY_CAREER:` (`matching.py:1299-1302`). A
  senior candidate's self-declared skills are discounted just as much and never flagged
  for the interview.
- **One comment was left behind.** `taxonomy.py:615` still says the weights default "to
  ``professional`` for BAU", forty lines above the constant that ended it (`:656`).
