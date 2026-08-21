---
layer: technique
type: technique
subject: quality-regression-gating
technique: family-wise-correction
status: forged
laws: [statistical-verdicts-or-no-verdict, estimation-announces-itself]
shared_with: []
use_when: [one run tests several targets against a baseline, a leaderboard makes claims across many pairs, red verdicts appear on runs nothing changed]
---

# Family-wise correction

One statistical test at a 95% confidence level is wrong about one clean run
in twenty. A comparison run is never one test: it verdicts every target
against the same baseline, and each verdict is a fresh chance at a false
red. At six targets, the probability of *at least one* spurious "regressed"
on a completely clean run is `1 − 0.95⁶ ≈ 26%` — a quarter of clean runs
look broken. A gate with that property trains its operators to ignore red,
which is the terminal disease of any gate. Family-wise correction restores
the promise the tool implicitly makes: "the chance this run shows you any
false regression is bounded at the stated level."

## Procedure

1. **Count the family honestly.** The family is every test whose result
   could trigger a decision in this run: one per target in a multi-target
   compare; all `m·(m−1)/2` pairs when a "best" claim implicitly chose
   among m targets after seeing the means (see tested-superiority-claims);
   1 for a single-target gate. Undercounting the family is the quiet way
   to uncorrect the correction.
2. **Divide the significance level across it.** The simple correction —
   per-comparison threshold `α/m` — controls the family-wise error rate
   with no independence assumptions and no ordering logic, which makes it
   auditable by inspection.
3. **Disclose by name.** The run artifact names the correction method, the
   family size, and the surviving per-comparison threshold. "Corrected"
   without the method and the arithmetic is a vibe, not a disclosure — the
   reader must be able to recompute the threshold from the report alone.
4. **State the cost.** The conservative correction spends statistical
   power: real small regressions need more evidence to reach significance.
   The artifact says so in its caveats and names the remedy — **more
   cases** buys the power back. The trade-off is surfaced, never chosen
   silently for the operator.

## Why conservative, on purpose

The simple division-based correction is the bluntest instrument in the
multiple-comparison toolbox, and for a deploy gate that is the correct
choice, not a naive one. A false "regressed" blocks a deploy — a loud,
expensive, trust-burning event — so the gate optimizes first for bounding
false alarms. Sequentially-adaptive procedures (step-down variants) and
false-discovery-rate control recover power, but they make each verdict
depend on the other verdicts' p-values, which means adding a target to a
run can flip an unrelated target's verdict. For an exploratory research
report that is acceptable; for a gate whose individual verdicts must be
independently defensible, verdict-coupling is a liability. Choose the
simple correction for gates; reserve FDR-style procedures for dashboards
that rank many candidates and explicitly tolerate a stated fraction of
false leads.

## Decision rules

- **When m = 1**, the correction is the identity; still report family size
  1 so the artifact shape is uniform and consumers never guess.
- **When the family is ambiguous** (were the three modes of one target one
  family or three?), correct over the larger family and say so. The error
  that survives review is the optimistic one.
- **When a red verdict survives correction**, it is worth acting on
  precisely *because* the correction is conservative — a corrected red is
  a strong claim. Do not re-litigate it with an uncorrected re-run; a
  re-run until green is alpha-shopping with extra steps.
- **When power loss bites** — real regressions consistently landing just
  above the corrected threshold — the fix is more cases per run, not a
  looser level. Case count is an honest lever; the threshold is not
  (fixed-alpha-discipline).

## When not to use it

- Within-run mechanical checks that are exactly reproducible (deterministic
  dimensions, schema validation) are not statistical tests and take no
  correction — correcting them dilutes the budget the real tests need.
- Do not correct across *time* — this run's tests and last week's are not
  one family; the family is the set of simultaneous claims one run makes.
- Do not use the family-wise machinery to adjudicate a single pre-declared
  comparison someone registered before the run: that is m = 1 by
  construction, and inflating m to look rigorous is just power thrown away.
