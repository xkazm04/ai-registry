---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: refuse-a-cross-currency-comparison
stack: node
verified_on: 2026-09-27
verified_against: node@24
---

# Withholding the figure instead of warning about it (Node/TypeScript)

The enforcement point is the prompt-assembly step, not a guardrail after
generation. `runGroupCompare` (`app/_lib/group-eval-run.ts:283`) builds the
`compare.json` context handed to the comparison narrator. It decides there, per
candidate, whether a compensation expectation may enter the comparison at all.

Re-verified 2026-09-27 against the tree's main at `29430f170`. The quoted rule
is verbatim from the first write; its lines moved.

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

(`group-eval-run.ts:313-322`, with `isSameCurrency` imported from `./salary-band`
at `:14`.)

Four things this gets right, in the order they matter:

1. **The comparison is against a stated reference, and the test is per-candidate
   against that reference's unit.** The role's band travels in the same context
   (`roleSalaryBand`, `:299-300`). One candidate quoting a different currency
   loses only their own figure; the rest still compare honestly against the band.
2. **Withholding, not warning.** The value becomes `null` before the payload is
   serialized (`:326`) and spawned to the narrator (`:337-345`).
3. **No conversion.** The comment states the reason plainly: "the app does no FX."
4. **The refusal is scoped to the comparative context only.** A candidate's own
   expectation still lives on their record in its own currency.

The tree stores no pay history anywhere in the matching or group-eval path. No
field of that name or shape exists in `app/` or `pipeline/`. That meets the
technique's newer rule without a gate: pay history cannot leak into a comparison
the record never holds.

## What the surrounding function does with a failure

A narrator failure degrades rather than blocks (`:367-369`). A non-zero exit or
an unparseable result returns `null`, and the caller keeps the deterministic
summary (`:280-282`). Since 2026-09 the degradation is also *disclosed*: the
payload names `comparison` among its `degradedStages` (`:742-744`), and the spawn
carries a deadline (`timeoutMs`) and the evaluating team's language (`--lang`).
A slow narrator no longer holds the run, and a missing narrative is stated rather
than silently absent.

## The deviations to note

- **A missing currency is assumed to be the app's.** The expectation is
  normalized with `currency: s.currency ?? APP_CURRENCY` (`:175-177`), so an
  unstated unit passes the gate as the local one. The standard is explicit: a
  missing unit is unknown, not the cohort default.
- **Withheld reads as absent.** The narrator receives `null` for a withheld figure
  and for "stated no expectation" alike. There is no explicit incommensurable
  state for it to name.
- **Pay basis is unchecked.** Gross against net and hourly against annual are not
  compared before the band check.
- **The wider family has no gate.** Grades across national systems, credentials
  across jurisdictions, seniority titles and rubric versions flow into the
  context unqualified. One case sits close to home. The pipeline labels early-
  career and experienced candidates as "two incomparable 0-100 scales" and carries
  a track on every row (`:107`, `:644`), yet the run's candidate sort
  (`:666-678`) ranks them on one total.
- **No test pins the withholding in the prompt path.** `salary-band.test.ts`
  covers `isSameCurrency`; nothing asserts that a cross-currency expectation
  arrives at the narrator as `null`.

`isSameCurrency` is the shape to copy, not the extent of the requirement.
