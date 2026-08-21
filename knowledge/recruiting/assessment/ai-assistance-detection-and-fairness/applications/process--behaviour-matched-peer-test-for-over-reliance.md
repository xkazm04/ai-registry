---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: behaviour-matched-peer-test-for-over-reliance
stack: process
status: forged
verified_on: 2026-08-20
---

# The matched-peer fairness gate in the dev-case submission eval (Python)

`pipeline/jobfit/devcase/submission_eval.py` runs the whole submission pipeline
(`reflect_commits → assess_tooling → evaluate_submission → score_transfer`) over
a landscape of synthetic candidate behaviours and gates the result. Its FAIRNESS
gate is the technique implemented literally, and its module docstring states the
premise the standard argues for: "Code is assumed LLM-generated, so the score
must track VERIFICATION/JUDGMENT, never AI use" (`:9-11`).

## The matched-peer definition, in code

`_overreliance_from_tool_use` (`:238-266`) is the definition:

```python
def _peer_flagged(r: Row) -> bool:
    verifies = bool(r.planted.get("verifies"))
    return any(
        _flagged(p)
        for p in flag_rows
        if not p.planted.get("usesAI") and bool(p.planted.get("verifies")) == verifies
    )

return [r for r in flag_rows if r.planted.get("usesAI") and _flagged(r) and not _peer_flagged(r)]
```

The matching key is `verifies` — the planted behaviour, not the flag and not any
output — which is exactly the standard's requirement that the key be an
independently observed behaviour. Its docstring carries the reasoning: a flag is
"from tool use alone" when it lands on an AI user "while a behaviour-matched
non-AI peer (same `verifies` habit, who would show the same dump/verification
evidence) is NOT flagged … If both the AI user and its non-AI peer are flagged,
the justification is the shared behaviour … and that is fair."

Because synthetic scenarios carry ground-truth `planted` attributes, this
implementation gets the matching key for free. A production cohort does not:
there the key has to come from an artifact-anchored behaviour (the canary
verdicts), which is why the standard insists the flag's basis be stateable as an
observable behaviour before the test is possible at all.

## The vacuous-invariant lesson

`:242-247` records the failure the standard names as the way this test is faked:

> Over-reliance flags are only ever assigned on the LLM path: the deterministic
> `assess_tooling` fallback hardcodes `overRelianceFlags=[]`, so an invariant
> guarded by `source=="deterministic"` can never fire (it was vacuously True).

Hence `flag_rows = [r for r in done if r.source != SOURCE_DETERMINISTIC]`
(`:257`): the check runs only on the path that actually assigns flags. This was
an upward lesson for the standard — a fairness invariant that structurally
cannot fail reports a permanent green that reads as evidence.

The flag's own basis is set upstream in `reflect.py`'s prompt, which is
"explicit — flag over-reliance ONLY from concrete evidence (a large unverified
dump), NEVER from tool use itself" (`:248-250`). That is the standard's
artifact-anchored flag wording enforced at the point of generation rather than
audited afterwards.

## Thresholds with rationale, declared in advance

`:58-74` is the threshold block, and every constant carries why it exists:

| constant | value | role |
| --- | --- | --- |
| `MIN_GROUP_N` | 3 | below this, no verdict — inconclusive |
| `MIN_VERIFY_MARGIN` | 5.0 | verifiers must *lead* non-verifiers on judgment |
| `AI_PENALTY_TOLERANCE` | 2.0 | AI-verifiers may sit at most this far below |
| `MIN_DISCRIMINATION_MARGIN` | 5.0 | strong must beat weak and the gamer |

The comment justifies the numbers against measured behaviour rather than taste:
"The deterministic landscape clears them comfortably (verify lead ~18.8,
strong-vs-weak ~8.9, strong-vs-gamer ~7.5), leaving headroom for the noisier
`--judge`/LLM path while still rejecting a tie" (`:68-70`).

The lead/non-inferiority asymmetry the standard insists on is two separate
helpers. `_lead_verdict` (`:77`) rejects a tie; `_not_below_verdict` (`:87`)
accepts one, and says why in its docstring: "a tie passes (that is the whole
point of 'AI use is not penalised') … Unlike a lead check this does NOT require
AI-verifiers to BEAT non-verifiers — only to not be punished for AI use."

**Deviation.** `MIN_GROUP_N = 3` is a harness floor for a synthetic landscape of
six behaviours, not a defensible cohort size for a live fairness claim. The
standard's rule stands: a floor derived from the difference you need to detect,
realistically in the low double digits per cell. Nothing here should be read as
licence to certify a real cohort of three.

## The four-way collapse

`_gate_status` (`:105-127`) is the four-outcome vocabulary with its precedence
rule spelled out — "a real signal always wins over the absence of one" —
resolving `fail` → `inconclusive` → `not_evaluable` → `pass`, and closing with
the line that is the spine of the whole subject:

> `not_evaluable` is deliberately distinct from `fail`: 'no data' must never
> read as 'unfair'.

`_evaluable` (`:98`) separates the two withheld verdicts by cohort emptiness:
1..`MIN_GROUP_N`-1 rows is a thin-but-present cohort (inconclusive), 0 rows is
no data (not evaluable). `_cohort_warnings` (`:130`) surfaces every thin cohort
in the report even when the gate resolved on its other checks, so a too-small
run is always visibly flagged rather than quietly passing.

`--strict` implements the gating rule exactly as the standard states it: fail
and inconclusive exit non-zero, `not_evaluable` does not, because "absence of
data is not a fairness violation, so an empty run can't be misread as an
unfair/non-discriminating evaluator" (`:23-26`).

## What the gate does not cover

Two gaps worth naming. The FAIRNESS gate runs over synthetic scenarios, so it
certifies the *evaluator*, not any real cohort — the standard's cohort-level
invariant over live candidates is not implemented anywhere in this repo. And the
QUALITY check (`--judge`) asks an LLM whether the evaluation unfairly penalises
AI use, which is a useful smell test but is a model grading a pipeline it shares
a family with; it is not a substitute for the measured margins beside it.
