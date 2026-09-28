---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: behaviour-matched-peer-test-for-over-reliance
stack: process
status: forged
verified_on: 2026-09-26
---

# The matched-peer fairness gate in the dev-case submission eval (Python)

`pipeline/jobfit/devcase/submission_eval.py` runs the whole submission pipeline
(`reflect_commits → assess_tooling → evaluate_submission → score_transfer`) over
a landscape of synthetic candidate behaviours and gates the result. Its FAIRNESS
gate is the technique implemented literally, and its module docstring states the
premise the standard argues for: "Code is assumed LLM-generated, so the score
must track VERIFICATION/JUDGMENT, never AI use" (`:12-13`).

## The matched-peer definition, in code

`_overreliance_from_tool_use` (`:258-285`) is the definition:

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

## The same rule, applied to the score gap

The non-inferiority check uses the same peer. `fairness` (`:288-320`) compares
model-using verifiers with verifiers who did not use a model
(`non_ai_verifiers`, `:301`), and the comment records why the comparator changed
on 2026-08-21: measured against non-verifiers, the check "folds in the
verification lead the gate above deliberately rewards, so an evaluator that
really does dock AI users passes: with non-AI-verifiers 90, ai-verifiers 70,
non-verifiers 70, the AI gap reads 0 while the true penalty is 20"
(`:293-298`). That is the technique's two-by-two table, with the bug it exists
to prevent written out in numbers.

## The vacuous-invariant lesson

The docstring (`:262-264`) records the failure the standard names as the way this
test is faked:

> Over-reliance flags are only ever assigned on the LLM path: the deterministic
> assess_tooling fallback hardcodes overRelianceFlags=[], so an invariant
> guarded by source=="deterministic" can never fire (it was vacuously True).

Hence `flag_rows = [r for r in done if r.source != SOURCE_DETERMINISTIC]`
(`:272`): the check runs only on the path that actually assigns flags. This was
an upward lesson for the standard — a fairness invariant that structurally
cannot fail reports a permanent green that reads as evidence.

The flag's own basis is set in `assess_tooling`'s prompt in `reflect.py`
(`:280-282`): "Only flag over-reliance with concrete evidence (e.g. large
unverified dumps), never from tool use itself; absence of evidence is not
failure." That is the standard's artifact-anchored flag wording enforced at the
point of generation rather than audited afterwards.

## Thresholds with rationale, declared in advance

`:62-79` is the threshold block, and every constant carries why it exists:

| constant | value | role |
| --- | --- | --- |
| `MIN_GROUP_N` | 3 | below this, no verdict — inconclusive |
| `MIN_VERIFY_MARGIN` | 5.0 | verifiers must *lead* non-verifiers on judgment |
| `AI_PENALTY_TOLERANCE` | 2.0 | AI-verifiers may sit at most this far below their non-AI peers |
| `MIN_DISCRIMINATION_MARGIN` | 5.0 | strong must beat weak and the gamer |

The comment justifies the numbers against a dated measurement rather than taste:
"commit path, --count 48, 2026-09-23: verify lead 37.5, strong-vs-weak 13.5,
strong-vs-gamer 12.0 on the weighted case score", "leaving headroom for the
noisier --judge/LLM path while still rejecting a tie" (`:72-75`). The inline
comment on `AI_PENALTY_TOLERANCE` (`:78`) still says "below non-verifiers";
the code compares with non-AI verifiers.

The lead/non-inferiority asymmetry the standard insists on is two separate
helpers. `_lead_verdict` (`:82`) rejects a tie; `_not_below_verdict` (`:92`)
accepts one, and says why in its docstring: "A tie passes (that is the whole
point of 'AI use is not penalised') … Unlike a lead check this does NOT require
AI-verifiers to BEAT their non-AI peers — only to not be punished for AI use."

**Deviation.** `MIN_GROUP_N = 3` is a harness floor for a synthetic landscape,
not a defensible cohort size for a live fairness claim. The standard's rule
stands: a floor derived from the difference you need to detect, realistically in
the low double digits per cell. Nothing here should be read as licence to
certify a real cohort of three. The discrimination gate's named
`careful_verifier` control (`:362`, `:376`) is satisfied by one row, with no
floor at all.

## The four-way collapse

`_gate_status` (`:110-127`) is the four-outcome vocabulary with its precedence
rule spelled out — "a real signal always wins over the absence of one" —
resolving `fail` → `inconclusive` → `not_evaluable` → `pass`, and closing with
the line that is the spine of the whole subject (`:120`):

> not_evaluable is deliberately distinct from fail: 'no data' must never read
> as 'unfair'.

`_evaluable` (`:102`) separates the two withheld verdicts by cohort emptiness:
1..`MIN_GROUP_N`-1 rows is a thin-but-present cohort (inconclusive), 0 rows is
no data (not evaluable). `_cohort_warnings` (`:134`) surfaces every thin cohort
in the report even when the gate resolved on its other checks, so a too-small
run is always visibly flagged rather than quietly passing.

`--strict` implements the gating rule exactly as the standard states it: fail
and inconclusive exit non-zero, `not_evaluable` does not, because "absence of
data is not a fairness violation, so an empty run can't be misread as an
unfair/non-discriminating evaluator" (`:28-30`).

## What the gate does not cover

Two gaps worth naming. The FAIRNESS gate runs over synthetic scenarios, so it
certifies the *evaluator*, not any real cohort — the standard's cohort-level
invariant over live candidates is not implemented anywhere in this repo
(`app/_lib/adverse-impact.ts:7-11` says it does not run on stored candidates,
and `app/_lib/devcase-cohort.ts` aggregates probe misses only). And the QUALITY
check (`--judge`) asks an LLM whether the evaluation unfairly penalises AI use,
which is a useful smell test but is a model grading a pipeline it shares a
family with; it is not a substitute for the measured margins beside it.
