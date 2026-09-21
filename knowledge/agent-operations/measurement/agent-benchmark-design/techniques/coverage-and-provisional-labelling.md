---
layer: technique
type: technique
subject: agent-benchmark-design
technique: coverage-and-provisional-labelling
status: draft
laws: [a-refusal-is-not-a-result, a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [reporting from a grid that is not finished, deciding whether a recommendation may be published, describing what a benchmark does not cover]
---

# Coverage and provisional labelling

The concern: grids finish late or never. A seat exhausts, a tier is dropped for cost, a
repository is added after the first wave. The results that exist are still worth acting on
— and the moment they are published without their coverage, they are quoted as if the grid
were complete. **Coverage travels with every conclusion, and an incomplete grid yields a
labelled provisional recommendation or none at all.**

## What coverage means

Coverage is the ratio of cells that produced a usable result to the cells the comparison
intends, stated per task and per dimension, with the missing cells named:

- **Missing** — never run, or run and refused. A refused cell is missing, never zero.
- **Truncated** — hit a ceiling; present but not a finished run.
- **Void** — spoiled by the environment; excluded, with the reason recorded.
- **Usable** — finished, measured under the current definition.

State the dimensions the grid does not span at all: the tiers not run, the repositories not
included, the task variants skipped. A reader cannot infer absence from a table that only
shows what happened.

## Labelling rules

- A recommendation over an incomplete grid is marked **provisional**, in the artefact and
  next to the recommendation — not in a footnote — and names what would complete it.
- A provisional recommendation may be **used** (a fleet still has to choose something
  today) but not **published** as a standard, and the publishing tool should refuse it
  rather than rely on discipline.
- When a phase of the grid was measured under a weaker method than the rest — one judge
  family instead of two, a metric unavailable — that phase is labelled separately. Mixing
  it silently into the aggregate is how a method caveat disappears.
- Cells that changed status after a measurement fix are re-derived, and the fix is named in
  the report, so a number that moved can be explained without archaeology.

## Decision rules

- **Never fill a missing cell by interpolation or by "the tier below probably behaves the
  same".** An absent cell is information; a guessed one is contamination.
- **Report per-case results beside any aggregate.** An aggregate over three repositories
  hides the one repository where a configuration failed, which is exactly the case an
  operator needs.
- **Coverage is re-computed, not remembered.** It comes from counting stored artefacts at
  report time; a hand-maintained count drifts the moment a cell is re-run.
