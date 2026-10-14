---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: hold-as-the-canonical-fallback-verdict
stack: python
status: forged
verified_on: 2026-10-14
verified_against: python@3.12
---

# One coercer, one vocabulary, and a context-aware default that leaked advance

The pipeline holds the verdict vocabulary once per language: `RECOMMENDATIONS`,
`RECOMMENDATION_FALLBACK = "hold"` and `SCREEN_ROUTES = ("advance", "hold")` in
`pipeline/jobfit/automation.py`, mirrored by `interview-recommendation.ts`. Every parse
is a total function (`coerce_recommendation`, `coerceInterviewRecommendation`,
`coerceScreenRoute`), the TS reader warns on an off-taxonomy value
(`readRecommendation` in `automation-run.ts`), and a `--no-llm` template verdict never
routes advance (`verdictSource === "llm" ? coerceScreenRoute(...) : "hold"`).

## The seam: the context-aware default

The screening coercer passed the deterministic builder's own verdict as the default
(the technique's "prefer it over a blind hold" rule). The template's advance is a fixed
82 for any score >= 70 with no missing must-have. Measured on a strong BAU candidate
(total 92) with a canned reply of `{"recommendation": V, "confidence": 95, "rationale":
"fine"}`:

| verdict V | before | after |
|---|---|---|
| "definitely-hire", "yes", null | advance, route advance, source llm | hold, route hold |
| "advance" | advance | advance |
| "hold" | hold | hold |

The fallback advance carried the model's 95 and the `llm` label, so the unattended
`screeningGate="auto"` ratify read it as the model's advance. The project's own TS
comment already holds that a template verdict never clears a candidate; the coercer
broke it through the back door. The fix keeps the deterministic hold or reject and turns
only the template's advance into hold. The technique gained that exception.

## Not changed

Early-career and volume gates still re-apply after the coercer. The interview scorecard
coercer already uses the blanket hold default.
