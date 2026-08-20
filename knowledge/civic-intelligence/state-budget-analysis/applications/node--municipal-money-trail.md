---
layer: application
type: application
subject: state-budget-analysis
technique: municipal-money-trail
stack: node
status: forged
verified_on: 2026-08-19
---

# Node — municipal money trail in the politicas BudgetMirror

The politicas repo joins its municipal registry to the national contract
register's graph in `features/budget/supplierTrail.ts`, with the live tie layer
in `features/budget/getSupplierTies.ts`. The four attribution clauses are
printed in the module header (`supplierTrail.ts:9-24`) as "the published join
rule — the surface prints it verbatim".

## The four clauses in code

1. **Own identifier only** — a contract is credited to a town only when the
   town's own IČO is a party or the publishing subject
   (`supplierTrail.ts:231-234`); identifiers outside the municipal registry (a
   founded organization, technical services, the state) are never resolved to
   a founder ("drop-don't-guess"). `normalizeIco` (`:112-117`) restores
   leading zeros to the canonical 8 digits and returns `null` for anything
   else — no fuzzy matching.
2. **Partial record disclosed** — the graph carries only contracts of firms
   already in it; a missing contract is "outside the record", not 0 (header
   clause 2, `:14-16`). `townSupplierSummary` returns `null` for a town not in
   the record, and the doc comment mandates the surface *admits* it rather
   than drawing an empty chart (`:414-421`). `supplierCoverage` (`:506-515`)
   ships towns-in-record, pair count, `retrievedOn`, and ingest pass to the
   page.
3. **Direction only when proven** — `paid` requires the register marking the
   firm as recipient AND exactly two known sides, the town and the firm
   (`:252-256`); everything else accumulates as `otherCount/otherCzk`
   ("direction not stated"), roughly half the register.
4. **Contract value, per town, never cross-summed** — the amount is the
   `supplies` edge weight, the same source the money surface reads, so both
   pages report the same money per contract (header clause 4, `:22-24`); a
   multi-town contract counts whole for each town and `multiTownContracts` is
   tracked in `DeriveStats` (`:169-170`) precisely so nobody sums across.

## Time and defect discipline

The impossible-year incident is written into the code as doctrine
(`supplierTrail.ts:126-141`): a private `y > 1900 && y < 2100` bound let a
"2009–2043" contract range ship; the fix imports the app-wide plausibility
module and bounds the upper end by `SUPPLIERS_RETRIEVED_ON` — the day the
register was read, generated into the same batch so both constants travel
together. `parseSupplierRows` distinguishes structural corruption (fail-loud
`throw`, `:341,363`) from data defects: an implausible year withholds *both*
bounds, keeps the row and its money, and marks `yearsWithheld: true`
(`:365-392`), with the explicit rationale that throwing would take down the
whole supplier section — "the reader would bear the penalty for a data
defect". `townSupplierSummary` counts `yearsWithheldRows` (`:434`) so the page
can say "withheld ≠ missing", and rows without dates never extend or zero the
range (`:435-438`).

## Live review state over frozen batch

`getSupplierTies.ts:1-11` states the split: contract aggregates are a
generated batch, but the human-review state of politician↔firm ties changes
with decisions on the review surface and "must not freeze into the batch — a
rejected tie must leave the page with the next render, not the next
regeneration". The mapping is conservative: `rejected` ties are dropped,
absence of a state is `pending_review`, never `verified` (`:52-55`), and the
result carries the graph pass for provenance (`:31-32`). Degradation is
explicit: when the store is down the result is `{ available: false }` and the
surface admits ties "cannot be verified now" instead of silently showing "no
ties" (`:10-11,38`).
