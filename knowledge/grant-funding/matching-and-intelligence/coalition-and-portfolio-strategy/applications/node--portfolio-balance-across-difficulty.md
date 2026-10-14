---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: portfolio-balance-across-difficulty
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# An unrated grant priced above every measured one, by an invented number

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `317a44e` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `4d32a03` on the project's `main`.

## The tree had the honest inputs and the honest award rule, and not the third

The weekly capacity planner is the project's portfolio constructor: it takes the writer's hour
budget and picks the slate that maximizes expected funded dollars per hour. Its inputs follow the
technique's honesty rules closely. Win probability is a per-funder, per-revenue-bracket rate,
shrunk toward a prior for thin samples, and it is the bracket's rate rather than the overall one.
Grants that fail a hard gate never reach it. An unknown award is priced at the median of the awards
the pipeline does know, with the count of imputed rows carried to the screen so the figure is
never presented as measured.

The win rate had no such rule. A row the calibration could not rate fell back to a flat 25%. The
calibrated rates a real pipeline carries are single digits to low teens (the project's own comments
quote a roughly 6% prior). So under partial coverage, which is the normal state, every unrated row
outranked every measured row of equal award and effort on the invented prior alone. This is the
technique's "a fake number in place of suppression" failure with a twist: the fake number was
not merely noisy, it was biased upward against exactly the evidence the system had.

## What changed

An unrated row is now priced at the median of the calibrated rates present in the same pipeline,
the same shape as the award rule beside it. The flat prior survives only when nothing at all is
calibrated, where it is uniform across rows and the ranking does not depend on its value. Two
tests pin both halves. The screen copy already described partial coverage as calibrated, so no
wording changed.

## The paired proof

Arm A is the planner as it was; arm B prices unrated rows at the pipeline median. The population
is constructed: 200 seeded pipelines of eight grants, five with a measured rate (3 to 12 percent)
and three unrated, random award and effort, a 40-hour budget.

- **Target: share of slate slots taken by unrated rows.** A 497 of 756 (66 percent, against 37.5
  percent of the rows being unrated), B 305 of 798 (38 percent, about their share).
- **Expected dollars of the slates**, scoring an unrated row at the measured median (an assumption,
  stated): A 7.55 million, B 8.41 million, about 11 percent more.
- **Floor: nothing moves where the prior cannot matter.** Pipelines with every row rated, and with
  every row unrated, produce identical slates in both arms (a checksum over 400 plans matches). The
  planner and pipeline suites are green (81 tests), tsc and eslint clean.

## What this realization cannot do

The 66 percent is a property of the constructed rates, not a measured rate of anything real. The
dollar comparison assumes an unrated grant's true odds equal the measured median, which is the
neutral stand-in, not knowledge. Odds are still keyed by funder, not by program, so the
technique's first discipline (the unit of difficulty is the program) is unmet, and the base,
core and reach tiers and the concentration axis are not implemented at all: the planner remains
a single expected-value knapsack. Those are the next seams.
