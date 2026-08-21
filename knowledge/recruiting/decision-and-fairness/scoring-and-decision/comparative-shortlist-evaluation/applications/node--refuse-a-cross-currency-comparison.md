---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: refuse-a-cross-currency-comparison
stack: node
verified_on: 2026-08-20
---

# Withholding the figure instead of warning about it (Node/TypeScript)

The enforcement point is the prompt-assembly step, not a guardrail after
generation. `runGroupCompare` (`app/_lib/group-eval-run.ts:201`) builds the
`compare.json` context handed to the comparison narrator and decides there,
per candidate, whether a compensation expectation may enter the comparison at
all.

## The rule, as written

```
// Candidate's own salary expectation (midpoint) so the narrative can flag
// an over/under-budget candidate alongside fit — but ONLY when it shares the
// band's currency. roleSalaryBand is in APP_CURRENCY and the app does no FX,
// so handing the LLM a cross-currency number ... would let it assert a false
// "over/under budget" claim; on a mismatch we withhold the number so it can't
// compare incomparable figures.
salaryExpectation:
  c.salaryExpectation && isSameCurrency(c.salaryExpectation.currency, APP_CURRENCY)
    ? c.salaryExpectation.midpoint
    : null,
```

(`group-eval-run.ts:227-236`, with `isSameCurrency` imported from `./salary-band`
at `:13`.)

Four things this gets right, in the order they matter:

1. **The comparison is against a stated reference, and the test is per-candidate
   against that reference's unit.** The role's recommended band travels in the
   same context (`roleSalaryBand`, `:213-214`) precisely so the narrator can weigh
   budget fit — so the commensurability question is each candidate's currency
   against the band's, not the cohort's currencies against each other. One
   candidate quoting a different currency loses only their own figure; the rest
   still compare honestly against the band.
2. **Withholding, not warning.** The value becomes `null` before the payload is
   serialized (`:239`) and spawned to the narrator (`:246-251`). No instruction
   is issued asking the model to be careful, because an instruction is soft and
   the data is hard: a model handed two comparable-looking numbers produces an
   over/under-budget sentence, fluently, every time.
3. **No conversion.** The comment states the reason plainly — "the app does no
   FX." Converting would need a rate, its date, its source and a gross/net basis
   the record does not hold, and the output would carry invented precision into a
   decision about a person.
4. **The refusal is scoped to the comparative context only.** This is the
   narrator's payload; a candidate's own expectation still lives on their own
   record in its own currency, where it is a fact about one person and asserts
   nothing comparative.

## What the surrounding function does with a failure

The whole narrator call is wrapped so that a failure degrades rather than blocks
(`:260-263`): a non-zero exit or an unparseable result logs and returns `null`,
and the caller "keeps the deterministic one-line `summary`" (`:200`). The
comparison still renders; only the generated prose is missing. That is the right
asymmetry for a candidate-facing pipeline — the process does not stall on the
narrator's availability, and a degraded run never freezes a partial verdict as
though it were authoritative.

## The deviation to note

The withholding is implemented for the compensation field, which is the case the
incident produced. The wider incommensurable family the standard names — grades
across national systems, credentials across jurisdictions, seniority titles across
organizations, scores under different rubric versions — has no equivalent gate
here; those values flow into the comparison context unqualified. The standard
stands: the same three-step handling (detect at assembly, withhold from the
comparative payload, render per-candidate in its own frame) applies to each, and
`isSameCurrency` is the shape to copy rather than the extent of the requirement.
