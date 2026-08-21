---
layer: application
type: application
subject: grant-taxonomy-design
technique: llm-residual-classification
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: constrained LLM classification of the uncategorized residual

How the grant-writing-nonprofits app runs its model layer over only what the
deterministic stack could not decide — `src/features/grant-research/llm-classify.ts`.

## Residuals only, one code or null

The module header (:1-14) states the contract: the regex categorizer tags
the confident majority; a residual tail (~5% of the US portal corpus, ~9%
of the EU one) has no sector because its signal is non-English, in a hollow
title, or off the keyword paths. `classifyResidual` (:174-206) runs a
few-shot classification over ONLY those rows, "constrained to the taxonomy
vocabulary… It NEVER replaces the regex path and NEVER invents a code."

The prompt (`buildClassifyPrompt`, :111-140) enumerates the legal codes via
`sectorVocabulary()` (:62-67) as `code — Label — hint` lines. `SECTOR_HINTS`
(:49-59) carries the boundary knowledge the sweeps earned, phrased as
NOT-clauses: `research` is "generic research/innovation/technology R&D (NOT
the small-business set-aside)"; `economic-dev` is "jobs/workforce/
entrepreneurship — NOT 'economic research' about a topic"; `environment`
excludes "mere 'sustainability' language". The stakes sentence is verbatim
doctrine: "the sector routes a grant to the right organization, so a wrong
guess is worse than an honest null" (:123).

## Boundary exemplars, including the substring trap and the null

`CLASSIFY_EXAMPLES` (:72-108) is seven exemplars, one per documented mistag
class: the SBIRT/SBIR substring trap ("SBIRT is a clinical screening
protocol → health; the 'SBIR' substring is a trap" — ex1); "economic
research about a health topic → health" (ex2); a genuine small-business
set-aside → `sbir-sttr` (ex3); a French-language civil-society row →
`international` (ex4 — the non-English tail the regexer misses); a
programme-code-decides row (ex5); and, critically, ex7's correct answer is
**null**: embassy boilerplate "with no substantive sector signal → leave
null (do not guess)". Abstention is demonstrated, not just permitted.

## Validation, thresholding, failure posture

`parseClassifyResponse` (:147-158) never throws: unparseable output →
null/0-confidence; a sector is kept only if `isSector()` passes against the
live vocabulary (invented codes and labels become null); confidence is
clamped 0–1; the reason is capped at 280 chars. `classifyResidual` sets
`accepted` only when `sector !== null && confidence >= minConfidence`
(default 0.6, :44) — everything else stays "still uncategorized". Transport
errors resolve to an unaccepted null result (:195-203), so a mid-corpus
failure can never fabricate a tag. Responses are cached by prompt
(`cache: { enabled: true }`, :192) because same row → same sector, making
re-runs cheap and the layer more deterministic in practice. Accepted codes
persist as derived metadata via `markGrantAnalyzed` — "source fields are
untouched" (:13-14).

## Confirmations and upward lessons

The repo confirms every clause of the technique's contract. Upward lessons
folded back into the technique doc: the `code — label — hint` vocabulary
block with NOT-phrased boundary hints; the one-exemplar-per-mistag-class
few-shot economy (seven exemplars, each traceable to a sweep finding); the
explicit null exemplar; caching as a determinism aid; and the injectable
runner seam (:166, tests pass a stub) that lets the whole gate be unit-tested
without a model in the loop.
