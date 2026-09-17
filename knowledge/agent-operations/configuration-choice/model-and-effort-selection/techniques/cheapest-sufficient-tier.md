---
layer: technique
type: technique
subject: model-and-effort-selection
technique: cheapest-sufficient-tier
status: draft
laws: [measure-the-tree-not-the-summary]
shared_with: []
use_when: [picking the default configuration for a recurring unattended task, deciding whether a higher tier earns its wall-clock, publishing a configuration recommendation]
---

# Cheapest sufficient tier

The concern: a fleet must name one default configuration per recurring task, and the
temptation is to name the one with the highest observed score. That choice is unstable —
scores move within judging noise between runs — and it silently buys the slowest operating
point for a difference nobody can feel. The rule instead: **the default is the cheapest
configuration that clears the bar on every case, where "cheapest" is measured in the
resource that actually binds and "the bar" is mechanical before it is judged.**

## The procedure

1. **Fix the task and vary only the configuration.** Same instruction, same starting
   revision of each repository, one run per cell. Anything else that differs between cells
   — a different revision, a different instruction wording, a mid-run change to the
   measurement — makes the comparison a story rather than a measurement.
2. **Apply the mechanical bar first.** A configuration is a candidate only where every one
   of its runs passed: the repository's own checks stayed green, the required outputs
   exist, nothing was left uncommitted that the task said to commit, and no declared
   repository rule was overridden. Judged quality never rescues a failed mechanical bar,
   because the bar encodes what "done" means and the judge only ranks the ones that are.
3. **Rank candidates by judged quality per case, not on average.** Keep the per-case
   results visible in the output; an aggregate is a summary of them, never a replacement.
4. **Choose the lowest tier within a stated margin of the best on every case.** The margin
   is written down before the comparison (a point on a ten-point scale is a defensible
   default) and it is the same margin for every task, or it is being tuned to produce a
   preferred answer.
5. **Break remaining ties by cost, in binding units** — reasoning tokens first, then
   wall-clock. On a flat-rate seat neither is money; both are queue capacity.
6. **Publish the margin and the coverage with the name.** A recommendation without the
   grid behind it cannot be re-derived, and one that spans an incomplete grid is labelled
   provisional until the missing cells land.

## Decision rules

- **When the cheapest tier clears the bar everywhere and sits inside the margin, it is the
  default** — even where a higher tier scored better on one case. One case's advantage
  inside the margin is not distinguishable from judging noise at one run per cell.
- **When no configuration clears the mechanical bar on every case, publish no default.**
  "No recommendation, and here is what every candidate broke" is a finding; a default that
  fails one of three repositories is a trap with a number on it.
- **When the best and the cheapest are the same configuration, say so explicitly.** It is
  the one case where the recommendation needs no margin argument, and readers who skim
  will otherwise assume a trade-off was made.
- **Re-derive after any change to the measurement.** A fix to how runs are checked can move
  which configurations were ever eligible; a recommendation carried across that change is
  a claim about a bar that no longer exists.

## What this technique does not decide

It does not decide the tier for a task whose failures are instruction defects rather than
capability differences — that diagnosis comes first, and a tier chosen over a broken
instruction optimises the wrong variable. It also does not decide the tier for a task
whose blast radius grows with thoroughness; there the cheapest sufficient tier may be the
right answer for the opposite reason, and the reasoning is in the sibling techniques.
