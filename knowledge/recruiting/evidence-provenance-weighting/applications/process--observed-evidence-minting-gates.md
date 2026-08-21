---
layer: application
type: application
subject: evidence-provenance-weighting
technique: observed-evidence-minting-gates
stack: process
---

# Minting `observed` from a live work sample (Python pipeline)

`pipeline/jobfit/live_case.py` is the **only** path in the repo to `observed`
provenance — the ladder's top rung (`taxonomy.py:447`, weight 1.0). Its module
docstring (`:1`) states the whole contract: a completed work-sample evaluation becomes
"the highest-trust signal the scoring engine knows", and it is "honest by
construction". `docs/features/matching/README.md:46` names why that matters for a
population: `observed` outranking `professional` is "the one path by which a candidate
with no history can out-rank tenure on a specific skill."

## The gates, in trust order

`_mint` (`:117-154`) is the technique's gate list as executable code, and its docstring
says the ordering is deliberate:

1. **Trustworthiness of the assessment.** `transfer.confidence <= LOW_CONFIDENCE` →
   `SKIP_LOW_CONFIDENCE`. The comment is the standard's precondition verbatim: the
   transfer carries the *propagated* decision confidence (the MIN of upstream signals),
   so a degraded or fallback evaluation "is a thin/degraded hint and its score proves
   nothing, however high." It explicitly mirrors the interview path's wide-confidence
   kill so "the deeper-trust take-home path must not be the less-guarded one."
2. **The competence bar.** `transfer_score < threshold` → `SKIP_BELOW_BAR`.
   `OBSERVED_THRESHOLD = 65` (`:33`) is anchored, not invented: it "sits at the
   matcher's *promising* tier — a coin-flip performance does not earn the highest-trust
   provenance."
3. **Something actually mapped.** `_credited_skills` empty →
   `SKIP_NO_TRANSFERRED_MUST_HAVES`.

## The substring bug — how a mint fabricated top-tier evidence

`_whole_token_overlap` (`:65`) exists because of the incident the standard's Gate 1
generalizes. The old implementation was a bidirectional `in` substring test, and the
comment records what it produced:

> that credited a short/generic must-have like "R" or "Go" as *observed* off any
> transfer containing those letters — "r" is a substring of "Strong framing", so a
> language was minted at the engine's highest-trust provenance off a dimension label
> the candidate never demonstrated.

The fix is whole-token matching on `normalize_text`-folded surfaces via
`taxonomy.contains_whole_token` (`taxonomy.py:334`) — described in the comment as "the
discipline the taxonomy module enforces everywhere", i.e. the mint had been the one
place that opted out of the repo's own matching rule.

## Empty match credits nothing; gaps beat transfers

`_credited_skills` (`:82-102`) carries both of the standard's Gate 2 rules with the
incident attached. A must-have the assessment lists under `gaps` is never credited —
"gaps win over a contradictory `transfers` entry: credit must be earned, not inferred"
(`:96-98`). And when nothing maps, nothing is credited: the removed `matched or musts`
fallback "inflated 'we couldn't map the transfers onto the role's skills' into 'every
skill was observed' — always the case on the deterministic transfer path, whose
`transfers` are dimension labels ('Strong framing'), never skills." That is the
flattering default relocated into the minting path, and it fired hardest on the
degraded path.

The module docstring adds the additive-only rule: "A weak performance adds NO observed
skills (we observed them not clear the bar) — it never penalises, it simply doesn't
fabricate evidence the candidate didn't earn."

## Withholding is reported, not silent

`MINTED` / `SKIP_LOW_CONFIDENCE` / `SKIP_BELOW_BAR` / `SKIP_NO_TRANSFERRED_MUST_HAVES`
(`:110-115`) are machine-readable outcome reasons introduced precisely "so a caller can
report a withheld credit instead of showing an indistinguishable silent no-op". They
reach callers through `MintOutcome` (`:173-188`), a 2-tuple subclass that keeps the
existing `profile, credited = apply_live_case(...)` unpacking working while exposing
`.reason` — so an honest "no observed skills added, and why" is available without a
breaking change.

## What the mint records

The minted `Evidence` (`:143-153`) names its instance — kind `live_case`, the case
title, and a text body quoting the demonstrated level and the credited skills — and
carries a confidence scaled from the transfer score and capped at 0.95, which is the
standard's rule that a bounded demonstration never claims certainty.

**Deviation.** The mint stamps no rubric or scenario *version*, so a later revision of
the case design cannot mark prior mints superseded — the standard's Gate 4 is not
realized here. The standard stays: an observed tier should be bound to the rubric
version it was judged under.

## The seam this application makes visible

`_corroborate_routing` (`:49-60`) feeds a passed case back into the early-career
routing confidence, bounded by `ROUTING_CONFIDENCE_CEIL = 0.75` — deliberately below a
real self-declaration's 0.9, because "performing well is corroboration, not identity."
The routing decision itself belongs to candidate-archetype routing; what this subject
owns is that the corroboration is bounded and never lifts a heuristic classification to
the standing of a stated fact.
