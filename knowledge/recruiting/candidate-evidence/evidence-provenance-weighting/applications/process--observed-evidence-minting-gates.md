---
layer: application
type: application
subject: evidence-provenance-weighting
technique: observed-evidence-minting-gates
stack: process
verified_on: 2026-09-29
applied: simulation
ab_verdict: better
---

# Minting `observed` from a live work sample (Python pipeline)

`pipeline/jobfit/live_case.py` holds the repo's two paths to `observed` provenance, the
ladder's top rung (`taxonomy.py:632`, weight 1.0). One mints from a take-home
evaluation (`_mint`) and one from a case-grounded interview's scorecard. The module
docstring states the contract: a completed work-sample evaluation becomes "the
highest-trust signal the scoring engine knows", and it is "honest by construction".
`docs/features/matching/README.md` explains why that matters for a population:
`observed` outranking `professional` is "the one path by which a candidate with no
history can out-rank tenure on a specific skill."

## The gates, in trust order

`_mint` (`:118`) turns the technique's gate list into executable code, and its
docstring says the ordering is deliberate:

1. **The assessment is trustworthy.** If `transfer.confidence <= LOW_CONFIDENCE`, the
   result is `SKIP_LOW_CONFIDENCE`. The comment is the standard's precondition almost
   word for word. The transfer carries the *propagated* decision confidence, the
   minimum of upstream signals, so a degraded or fallback evaluation "is a
   thin/degraded hint and its score proves nothing, however high."
2. **The candidate cleared a competence bar.** If `transfer_score < threshold`, the
   result is `SKIP_BELOW_BAR`. `OBSERVED_THRESHOLD = 65` (`:33`) is anchored, not
   invented: it "sits at the matcher's *promising* tier".
3. **Something actually mapped.** If `_credited_skills` comes back empty, the result
   is `SKIP_NO_TRANSFERRED_MUST_HAVES`.

## The substring bug, and the class it did not close

`_whole_token_overlap` (`:65`) exists because of the incident the standard's Gate 1
generalises. The old bidirectional `in` test "credited a short/generic must-have like
'R' or 'Go' as *observed* off any transfer containing those letters". The fix is
whole-token matching through `taxonomy.contains_whole_token` (`taxonomy.py:478`).

**Whole tokens are not enough, as a simulation on 2026-09-29 showed.** It called
`_credited_skills` directly with four realistic LLM `transfers` strings, which the
evaluator writes as free text (`devcase/evaluate.py:570`, `"transfers": [str]`). Every
one minted the must-have at the top rung:
- "Willing to go deeper on concurrency trade-offs" minted Go;
- "Swift, well-structured decomposition of the problem" minted Swift;
- "Her questions could spark a useful design review" minted Spark;
- "see section R of the brief" minted R.

A control, "Idiomatic Go error handling in the service layer", also minted Go,
correctly.

Arm B used the standard's rule as written: a name that is also an ordinary word
matches only through an alias ("golang", "apache spark", "swiftui", "r language"). It
blocked all four false credits and also withheld the control. **Verdict: better.**
The four false top-rung credits are the expensive error. The lost control costs one
observed credit in an additive-only mint, and a more generous alias table would win
some of those back. Not changed in code: the alias table is a vocabulary decision,
and the cleaner fix is Gate 5 below.

## Empty match credits nothing; gaps beat transfers

`_credited_skills` (`:82-111`) carries both of Gate 2's rules with the incident
attached. A must-have the assessment lists under `gaps` is never credited, because
"gaps win over a contradictory `transfers` entry". When nothing maps, nothing is
credited. The removed `matched or musts` fallback "inflated 'we couldn't map the
transfers onto the role's skills' into 'every skill was observed'".

**Deviation: the interview path (`:239-292`) credits every must-have.** A
case-grounded interview's scorecard mints `observed` for
`skills = [m for m in role.must_haves ...]` once the reasoning constructs average above
`min_rating`. The docstring defends this: the must-haves are "the material the case ...
was designed around". But nothing in the scorecard answers skill by skill. A strong
average on framing and trade-offs therefore mints every technology the role names,
which is the fallback the take-home path removed, reached by another route. The
standard's Gate 5 stays: a closed list, each skill answered present-with-instance or
not-observed.

## Withholding is reported, not silent

`MINTED`, `SKIP_LOW_CONFIDENCE`, `SKIP_BELOW_BAR` and `SKIP_NO_TRANSFERRED_MUST_HAVES`
(`:113-115`) are machine-readable outcome reasons. They were introduced "so a caller can
report a withheld credit instead of showing an indistinguishable silent no-op", and
they reach callers through `MintOutcome` (`:174`). That class is a 2-tuple subclass, so
existing unpacking keeps working while `.reason` is exposed.

## What the mint records

The minted `Evidence` names its instance: kind `live_case`, the case title, and a text
quoting the demonstrated level and the credited skills. Its confidence is capped at
0.95 for the take-home and at 0.9 for the interview.

**Deviation: nothing stamps a rubric or scenario version,** so a revised case design
cannot mark earlier mints superseded, and Gate 4 is not realised. Nothing records who
performed the exercise, or with what tools, either. The standard's new precondition
has no field to live in yet.

## The seam this application makes visible

`_corroborate_routing` (`:48`) feeds a passed case back into the early-career routing
confidence, bounded by `ROUTING_CONFIDENCE_CEIL = 0.75` (`:43`). That ceiling sits
deliberately below a real self-declaration's 0.9, because "performing well is
corroboration, not identity."
