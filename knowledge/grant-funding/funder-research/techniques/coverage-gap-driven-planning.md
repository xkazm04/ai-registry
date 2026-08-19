---
layer: technique
type: technique
subject: funder-research
technique: coverage-gap-driven-planning
status: forged
laws: [clean-is-not-ready]
shared_with: []
use_when: [deciding which jurisdiction and sector to research next, budgeting scarce research runs, detecting silent decay in a research-fed corpus]
---

# Coverage-gap-driven planning

Research capacity is the scarce resource in funder research: every run costs
agent time, web sessions and reviewer attention. Spending it by fixed rotation
— sweep the sectors in list order, every time — is the default and it is
wrong, because the corpus is not uniformly empty. The technique: **make the
corpus itself the planner's input.** Compute coverage per cell (jurisdiction ×
sector), and send the next run to the cells that are emptiest first and
stalest second.

## The coverage model

For each cell, two numbers:

- **Count** — how many live, actionable rows serve this cell right now. The
  count must include *everything* serving the cell, not only what research
  produced: rows loaded by feed adapters and rows promoted from earlier
  research are the same coverage from the applicant's perspective. A planner
  that counts only its own output re-researches the sectors a feed already
  fills — a pure waste of the scarcest budget.
- **Staleness** — when this cell was last researched. Never-researched sorts
  ahead of any timestamp: an untouched cell outranks an old one, because zero
  information beats old information as a priority signal.

Priority order is then: fewest rows first; among equals, oldest research
first. The head of that list is the next sweep. This is deliberately simple —
the value is not in the ranking function's sophistication but in the loop it
closes: the corpus's gaps drive the research that fills the corpus.

Two classification rules keep the model honest:

- **Bucket both populations with the same classifier.** Staged candidates and
  live corpus rows must be assigned to sectors by one shared mechanism, or
  coverage compares apples to oranges and the "gaps" are artifacts of
  classifier drift.
- **An unclassifiable row counts toward no cell.** That leaves its cells
  looking emptier, which biases the planner toward researching them — the
  correct bias, since a cell full of rows nobody can classify is not serving
  anyone findably.

## Watching for silent decay

Planning by coverage has a failure mode of its own: it trusts the counts. A
research source or feed that *breaks quietly* — an upstream page redesign, a
bot-wall, a schema change — often returns zero or a fraction of its usual
volume *without erroring*. The run records success, the cell keeps its old
count, and the corpus decays while the planner sees no gap. Error status
catches loud failures only.

The guard is a volume anomaly check across *successful* runs: compare each
source's latest successful run against its prior successful run, and flag a
collapse — zero fetched, or a drop beyond a threshold on the order of half.
The comparison deliberately excludes errored runs (those are caught by status)
and sources with no prior baseline. A flagged collapse is a human
investigation, not an automatic action: the drop may be seasonal (a
deadline-cycle trough) or real rot, and only someone looking at the source can
tell. What matters is that the question gets asked at all — a coverage map
over silently rotten sources is a clean-looking report over checks that never
ran.

## Decision rules

- When a cell's count is high but its rows come from a single source, treat
  it as fragile coverage — one anomaly away from empty — and let that
  moderate how long it can starve of research attention.
- When a full sweep is too expensive, cut from the bottom of the priority
  list, never proportionally: the emptiest cells are where a skipped run
  costs applicants the most.
- When a source's volume collapses between successful runs, freeze the
  affected cells' staleness clocks for planning purposes and investigate the
  source; do not let the planner "fix" a broken feed by re-researching what
  the feed should provide.
- When coverage counts feed any user-facing claim ("we cover N sectors in
  your region"), derive the claim from cells with verified live rows, not
  from cells the planner merely intends to fill.

## When not to use

Do not use coverage-gap planning when the corpus is cold-starting — with
near-zero rows everywhere, the model degenerates to list order anyway, and a
deliberate curated seed per jurisdiction is the better first move. And do not
let the gap model override an explicit operator request: "research this
sector now" is a valid instruction that outranks the ranking, because the
operator may know about demand the corpus cannot see.
