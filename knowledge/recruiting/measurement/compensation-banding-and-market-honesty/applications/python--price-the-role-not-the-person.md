---
layer: application
type: application
subject: compensation-banding-and-market-honesty
technique: price-the-role-not-the-person
stack: python
status: forged
verified_on: 2026-09-27
verified_against: python@3.12
applied: code
ab_verdict: better
---

# A grounded salary prompt read from six role fields, and the test that keeps it so

`pipeline/jobfit/market_salary_cli.py` asks a web-grounded model for a monthly
gross range for a role. Its `main` builds the prompt from exactly six fields of
the input record (`:131-136`): `title`, `seniority`, `roleFamily`, `company`,
`region` and `stack`. Nothing else in the record is read. The prompt speaks in
one fixed voice at both branches (`:159`, `:171`): "You are a compensation
analyst... estimate the typical MONTHLY GROSS salary range for this role in
{region}". No candidate, applicant or profile record reaches it, so the
technique's allow-list already holds here by construction.

What nothing pinned was that it stays so. The module's own suite (16 tests)
covers the fallback band, provenance, locales and the error envelope, and none
of them looks at the assembled prompt.

## The A/B

A guard test (`pipeline/jobfit/tests/test_market_salary_cli.py`,
`GroundedPromptPricesTheRoleTest`) patches `grounded_answer`, feeds `main` a
record carrying the role fields plus five sentinel identity values (candidate
name, name, gender, nationality, age), captures the prompt, and asserts that no
sentinel appears and that the role fields do.

The mutation is the refactor the technique warns about: one line added to both
prompt branches, `- Candidate: {raw.get('candidateName', '')}`, applied and
confirmed (two replacements, grepped) before either arm ran.

| Arm | Code as shipped | Code mutated |
| --- | --- | --- |
| A: shipped suite | 16 passed | **16 passed** - the leak is invisible |
| B: suite plus the guard | 18 passed | **1 failed**, 17 passed - `test_no_candidate_identity_reaches_the_prompt` |

The mutation was reverted and B re-run green (18 passed) before commit. The
guard landed in kp as a test only; product code is unchanged.

## What the tree does not yet do

- **The model version is not on the result.** The printed payload is `result`,
  `sources` and `source: "llm" | "deterministic"` (`:193-198`); a band from one
  model version is indistinguishable from the next.
- **No anchor is passed.** The benchmark cell for the same family and seniority
  is computed only as the fallback (`_coerce`, `:83-103`), never offered to the
  model as the reference to adjust from.
- **The returned currency is trusted.** `_coerce` keeps whatever currency the
  model states (`:108`) and checks only `lo > 0` and `hi >= lo` (`:103`); the
  market's plausibility ceiling is not applied to the grounded figure, and the
  period is hard-coded as monthly in the prompt text rather than read from the
  market record. Those are the currency-lock technique's rules, recorded here
  because this is the file that breaks them.

The comment at `:147-153` holds the counterpart evidence for the currency
technique: an internal benchmark found every model tried obeyed a hard-coded
CZK instruction even when pricing a Munich role, so the currency now follows the
requested region. The failure observed in this tree was obedience to the
prompt's currency, not drift toward a dominant one.
