---
layer: technique
type: technique
subject: state-budget-analysis
technique: consolidated-vs-headline-figures
status: forged
laws: [one-definition-one-import, incident-anchored-doctrine, provenance-or-nothing]
shared_with: []
use_when:
  - choosing which official figure represents "the budget"
  - a source publishes multiple variants of the same fiscal indicator
---

# Consolidated vs. headline figures

Official fiscal sources publish several numbers that all answer to the name
"total expenditure", and they are not approximations of each other — they
differ by integer factors. The gross (unconsolidated) figure counts every flow
every fund records, including the body's transfers to its own funds and its own
subordinate organizations; money that moves from the town's left pocket to its
right pocket is counted in both pockets. The consolidated figure eliminates
those internal flows and is the town's actual budget size — what it raises from
and spends on the world outside itself. The gap is not academic: in one
measured case, a single town's single year, the gross expenditure read 2.3× the
consolidated one. A comparison surface that picks variants inconsistently is
not noisy; it is comparing different quantities under one label
([incident-anchored-doctrine](../../_laws.md#incident-anchored-doctrine) —
record the measured gap next to the choice, so the choice survives its author).

The same elimination problem recurs at every level of aggregation: summing a
region's municipalities double-counts inter-municipal transfers; summing state
and local budgets double-counts grants between them. "Whose money is counted
once" is the first question of any fiscal aggregate, and the source's
consolidation variant is its answer for the single-body case.

## The procedure

1. **Inventory the variants before ingesting anything.** For each indicator the
   source offers, note whether a consolidated variant exists. Typically the
   flow figures (expenditures, revenues, balance) come in both forms, while
   stock and structural figures (debt, population) have no consolidation
   variant — there is no internal-transfer double-count in a debt stock. Do
   not "consolidate" what the source does not; inventing an adjustment is
   repair, and analysts do not repair.
2. **Choose once, globally, in writing.** The consolidated variant is the
   default for every flow figure, for every body, for every year. The decision
   lives where the source adapter lives, with the measured gap that justifies
   it, and every downstream metric inherits it by import — a per-surface choice
   *will* drift, and the drifted surface will publish the 2.3× figure as the
   town's budget ([one-definition-one-import](../../_laws.md#one-definition-one-import)).
3. **Name the variant in provenance.** The published figure's citation includes
   which variant was read, because a reader checking against the source's own
   portal will find the headline number first and conclude the analyst is
   wrong by half. Pre-empt the discrepancy: the figure carries its variant the
   way it carries its period and source
   ([provenance-or-nothing](../../_laws.md#provenance-or-nothing)).
4. **Never mix variants inside one computation.** A capital-expenditure share
   computed as consolidated-capital over gross-total is a quantity with no
   name. Ratios take both operands from the same variant; peer medians take
   every peer's value from the same variant; trends take every year from the
   same variant.

## Decision rules

- When only the gross variant exists for some indicator, use it — but flag the
  indicator as non-comparable with consolidated ones and keep it out of mixed
  ratios.
- When the source revises its consolidation methodology between periods, treat
  the boundary as a series break and disclose it; do not splice.
- When a reader-facing surface has room for one number, it shows the
  consolidated one; the gross figure is available behind provenance, labeled
  as containing internal transfers, never as an alternative "total".
- When aggregating *across* bodies, consolidation within each body is not
  enough — inter-body transfers need their own elimination, and if the source
  does not support it, publish the sum as "contains inter-body transfers"
  rather than as a regional budget.

## When not to use it

The technique governs figures meant to *represent a body's budget size* in
comparison and publication. It does not apply to questions that are genuinely
about gross flows — auditing a specific internal transfer, tracing money into a
subordinate organization — where the unconsolidated detail is the evidence
itself. And it is no substitute for entity-scope decisions: whether a town's
municipal companies belong inside "the town's budget" at all is a
classification question (whose money is whose), not a consolidation variant,
and conflating the two lets a body shrink its apparent budget by moving
spending into satellites.
