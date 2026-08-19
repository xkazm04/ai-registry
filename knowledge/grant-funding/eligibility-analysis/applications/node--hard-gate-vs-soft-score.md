---
layer: application
type: application
subject: eligibility-analysis
technique: hard-gate-vs-soft-score
stack: node
status: forged
---

# Node: hard gate vs soft score in a grant-matching engine

The grant-writing-nonprofits repo (a Next.js/Node grant-matching product)
realizes the gate/score split across two modules: the deterministic gates in
`src/features/match-engine/eligibility.ts` and the verdict derivation in
`src/features/match-engine/analysis.ts`.

## The gates are declared authoritative in the code itself

`eligibility.ts:17-22` opens with the contract as a comment: *"Deterministic,
AI-free eligibility pre-checks. These are authoritative — the Gemini layer
never overrides a hard 'fail' here."* `deterministicEligibility()`
(`eligibility.ts:23-40`) runs all four checks unconditionally — applicant
type, geography, award fit, deadline — and returns the full
`EligibilityCheck[]`, never short-circuiting, so the UI can show every gate's
status and detail together. Each check returns
`{key, label, status: "pass"|"fail"|"unknown", detail}` with the user-facing
explanation written at gate time.

## One verdict function serves both scoring paths

`analysis.ts:54-69` is the single choke point:

```ts
const hardFail = eligibility.some(
  (c) => c.status === "fail" &&
    (c.key === "applicant_type" || c.key === "deadline" || c.key === "award_fit"),
);
if (hardFail) return "ineligible";
if (fitScore >= 75) return "strong";
if (fitScore >= 50) return "possible";
return "weak";
```

Both the AI-scored path and the heuristic fallback assemble through
`assembleAnalysis()` (`analysis.ts:74`), whose comment states the reason:
*"Verdict is always derived here so the two paths stay consistent."* The
model can emit any fit score it likes; a hard fail forces `ineligible`
before the score is even banded.

## The hard-block set is an explicit list — and geography is not in it

Note the coalition in `verdictFor`: `applicant_type`, `deadline`,
`award_fit` — geography's `fail` demotes trust but does not alone force
`ineligible`. The gate's own geography check reserves `fail` for the
structured country gate (`eligibility.ts:135-142`); the prose heuristics
below it can only return `pass` or `unknown`. This is the technique's
"declare which gates hard-block" rule made concrete as a reviewable list in
one function, rather than each check deciding its own authority.

## Upward lesson: the cache key must cover every gated input

`computeInputsHash()` (`analysis.ts:15-49`) keys cached verdicts on the
grant fields *and* the profile fields, and carries an incident comment worth
keeping: jurisdiction, entity type and HQ state were added later because
*"omitting them served stale cached verdicts when an org changed
jurisdiction / legal form / state"* — the exact stale-verdict failure mode
the technique warns about. Reference materials feeding the AI prompt are
hashed (sha256, truncated) into the same key so a profile-document change
also busts the verdict.
