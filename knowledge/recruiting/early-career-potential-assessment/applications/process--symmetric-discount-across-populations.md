---
layer: application
type: application
subject: early-career-potential-assessment
technique: symmetric-discount-across-populations
stack: process
---

# The asymmetric provenance default, and its repair

This is the incident the technique is written from, preserved in the code that fixed it:
`pipeline/jobfit/transform.py:171-189`, in `build_match_candidate`.

## What shipped first

Every skill on a candidate carries a provenance, and `skill_match_score` weights the
match by it (`taxonomy.PROVENANCE_WEIGHTS`: `observed` and `professional` 1.0, `thesis`
0.75, `coursework` 0.5, `self_declared` 0.4). Skills with no recorded provenance fall
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
supplying a record. `consider()` (`transform.py:112-119`) keeps the strongest recorded
provenance per skill, so an explicit claim or a piece of evidence always overrides the
default; the default only ever describes silence.

The result is stricter on the previously exempt population and unchanged for the
previously penalised one. A repair that only made scores go up would have relocated the
asymmetry rather than removed it — and levelling *up* here would have meant crediting
every unevidenced claim at professional weight, destroying the provenance signal the
whole match depends on.

`taxonomy.py:474-486` carries the same reasoning as doctrine at the ladder itself:
`DEFAULT_PROVENANCE = "self_declared"` is "the honest reading of an unsourced claim",
adopted so that a well-written résumé does not outrank one carrying real artifacts.

## The rest of the audit surface

Two other adjustments in this pipeline were checked against the same rule and pass:

- **Transferable meta-skill credit** (`transform.py:130-143`) is a bonus that only one
  population can earn — which the technique flags as a discount on everyone else — but
  it survives because it re-credits evidence the experienced path already counts
  directly: "BAU stays out: their job evidence already carries professional provenance
  for the actual skills." Same evidence, one credit each, no population advantaged.
- **Domain distance** (`transform.py:88-97`, threaded at `:145`) can only raise a floor for an adjacent
  prior field; the far band changes no number. A band that cannot subtract is not a
  scoped penalty.

The pool-level check sits further downstream: at group evaluation the fairness matrix
re-scores every candidate under every other candidate's weight scheme and flags order
divergence, so nobody wins because their own weights flatter them. Bounded weight
proposals (±0.15, clamped to [0.10, 0.60], `matching.py:665`) mean no signal can erase a
dimension — and the guardrail in the proposer is the access-versus-merit rule stated
verbatim: weight responds to evidence relevance and observed quality, **not presence**,
because "having had access to an internship is not itself a merit".
