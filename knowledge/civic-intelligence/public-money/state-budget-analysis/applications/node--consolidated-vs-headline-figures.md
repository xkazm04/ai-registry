---
layer: application
type: application
subject: state-budget-analysis
technique: consolidated-vs-headline-figures
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node budget mirror: the expenditure was consolidated, the debt was not, and the caption said both were

The node version comes from the repository's CI workflow, which pins node 24.

The politicas budget surface (`/rozpocty`) follows the ingest half of the technique
closely. Its source adapter, `lib/ingest/sources/monitor.ts`, reads the consolidated
variants of expenditure, capital expenditure and balance (`vydaje_kons`,
`kapitalove_vydaje_kons`, `saldo_kons`). Its header records the measured gap that
justifies the choice: one town's gross expenditure was 1.85 bn against 794 mil
consolidated. The capital-expenditure share takes both operands from the consolidated
variant (rule 4). The decision lives in the adapter and is imported by the surface
(rule 2).

## The seam chosen to falsify

Rules 2 and 4 held, so testing them again would only have confirmed them. The rules
that could still fail were rule 1 (debt stocks also have variants) and rule 3 (the
published figure names its variant). The adapter header said "`dluh` and `obyvatele`
have no consolidation variant", and both page captions called every value on the page
"consolidated FIN 2-12 M figures". The run fetched the source's indicator endpoint for
all 132 towns in the batch, 2021-2025, which is the same 660 calls that built the
checked-in snapshot.

What the source says about its own indicators:

- The API returns `source` and `consolidated` on every indicator. The three
  expenditure-side fields carry `source: "rozpocet_konsolidovany"` and
  `consolidated: true`. The debt field `dluh` carries `source: "rozvaha"` (the balance
  sheet, a different statement) and `consolidated: null`.
- `dluh` is the municipality's own debt only. The debt of its subordinate
  organizations is a separate indicator, `dluh_po`, and `dluh_celkem` equals
  `dluh + dluh_po` exactly in all 330 of the 660 town-years where the two differ.
  90 of the 132 towns carry organization debt in at least one year. In 2025, five
  towns read 0 Kč of debt while their organizations owe up to 11.7 mil.
- Gross over consolidated expenditure runs from 1.14x to 7.98x (median 2.54x) across
  the 660 rows. The town the adapter quoted is a typical case, not the worst one.

So the technique's prediction held where it was most at risk. The debt metric, which
the peer table sorts by, was a different statement and a different perimeter. The
caption on the page labelled it consolidated anyway. This is the failure the decision
rule "flag the indicator as non-comparable with consolidated ones" exists for. The
data was right, but the provenance described a variant that was never read.

## A and B

- **A** (as shipped, politicas f4c09cd): the source line and the stewardship note say
  every value is consolidated FIN 2-12 M. 2 of the 3 published metrics have a correct
  provenance label. The extractor names its indicator keys inline.
- **B** (politicas ab72023): `BUDGET_INDICATORS` in the adapter is the single
  definition of each field's indicator key, statement and variant. `extractBudgetYear`
  reads it, and a live 2026-10-22 capture pins it in a test. The Czech and English
  captions name each field's variant. Debt is labelled as balance-sheet debt of the
  town alone, unconsolidated and excluding its organizations. 3 of 3 labels are correct.
- **Target**: the two new provenance tests fail on A's code and copy (2 of 114 in the
  budget and adapter suites) and pass on B (114 of 114).
- **Floor**: no figure moves. The snapshot is untouched, and the figure test (debt
  reads `dluh` = 3,508,510 for a town whose organizations owe 35.8 mil, capex share
  33.6%) passes on both arms. The pre-push gate passed 4,215 of 4,215 tests, plus tsc,
  eslint and the project's doc-sync hook.

## What the realization cannot do

The change makes the label match the data. It does not decide which debt a reader
should see. Whether organization debt belongs in "the town's debt" is a perimeter
question. The technique's "when not to use it" section places that question outside
consolidation, and here it belongs to the owner. Switching to `dluh_celkem` would move
every peer median and the stewardship input that feeds executive politicians' scores.
A consolidated debt cannot be built from this source either. The API exposes no
debtor-creditor positions between the town and its organizations, and the technique
forbids inventing the missing counterparties.

## Structural fact

The source publishes the variant on every indicator, but the adapter inferred it from
the key's `_kons` suffix. The suffix is accurate for the keys that have it. It says
nothing about keys without it, and that is where the mislabel came from. The structural
reading: when a source declares variant metadata per indicator, that metadata is what
the provenance should be built from, and an absent suffix is not a variant.
