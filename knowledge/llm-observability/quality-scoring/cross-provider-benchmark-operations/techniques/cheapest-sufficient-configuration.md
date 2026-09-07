---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: cheapest-sufficient-configuration
status: forged
laws: [statistical-verdicts-or-no-verdict, nullable-never-zero, estimation-announces-itself]
shared_with: []
use_when: [turning a three-axis scorecard into one routing recommendation, choosing between a premium and a cheap configuration, a leaderboard must not just rank, reporting a cost-quality trade-off]
---

# Cheapest sufficient configuration

A scorecard reporting quality, cost and latency per target has measured the
right things and answered nothing. The operator has to read three columns and
perform the trade-off in their head, which they will do badly and inconsistently
— and which they will stop doing at all once the matrix has more than a handful
of rows. The last stage of a benchmark should name the configuration to use.

The recommendation primitive is not "the best" and not "the cheapest". It is
**the cheapest configuration that is not significantly worse than the best**.
Both halves are load-bearing: "cheapest" is what the operator is buying, and
"not significantly worse" is what makes it defensible rather than a hunch about
a small difference between two noisy means.

## Procedure

1. **Compute the non-dominated set first.** A target is dominated when another
   is at least as good on every axis and better on one. What survives is the
   frontier — usually a handful of rows out of a large matrix — and it is worth
   showing on its own, because it is the part of the scorecard where a real
   trade-off exists. Everything dominated is a row nobody should ever pick.
2. **Test sufficiency, do not assert it.** Order the frontier by cost and walk
   up from the cheapest; the recommendation is the first target whose paired,
   family-wise-corrected test against the best target fails to find a
   difference. This is the same instrument the "best" claim already uses, run
   in the other direction — not a second, softer statistic invented for the
   recommendation.
3. **Report the power you had.** "Not significantly worse" is an absence of
   evidence, and with few cases *everything* is not significantly worse than
   everything. A recommendation that does not disclose its case count and its
   corrected alpha will confidently recommend the cheapest target in the matrix
   off a run too small to distinguish anything — which is the exact failure the
   technique exists to prevent, arrived at by machine instead of by hunch.
4. **Exclude what you could not price, by name.** A target whose cost could not
   be resolved has a null cost, never a zero. Zero is not merely wrong here; it
   is wrong in the direction that wins — an unpriced target dominates the
   frontier on the cost axis and becomes the recommendation precisely because
   nothing is known about it. Exclude it and say which target was excluded and
   why.
5. **A partial run recommends nothing.** A run halted by a budget ceiling or a
   cancel scored a non-random subset — systematically the later cases — and a
   recommendation is a stronger claim than a mean. Partial is contagious: it
   survives into the recommendation as a refusal, not as a caveat on an answer.
6. **Say what the recommendation is conditional on.** The corpus version, the
   judge, the pinning, and the date. A recommendation is the most portable
   artifact a benchmark produces — it gets pasted into a routing table and
   outlives every caveat that was not attached to it.

## Decision rules

- **When the frontier has one point, say so rather than recommending it.** A
  single non-dominated target means the matrix had no trade-off to find; that is
  a finding about the matrix (usually: the candidates were not comparable enough
  to be worth running together), not a strong recommendation.
- **When the cheapest sufficient target is also the best**, report that plainly.
  It is the least interesting outcome and the one operators most need stated,
  because the alternative reading — that the tool found nothing — is wrong.
- **When difficulty is graded, recommend per tier.** The whole value of a graded
  corpus is that the answer differs by tier, and a single blended recommendation
  throws that away right at the moment it would have paid.
- **When the axes conflict for a specific caller** — an interactive path that
  values tail latency far above cost — the frontier is the deliverable and the
  single recommendation is not. Publish both; let the caller weight.

## When not to use it

- Regression monitoring of one target against its own baseline. There is nothing
  to select between; the verdict is pass or regressed and a recommendation would
  be a category error.
- When the quality bar is absolute rather than relative — a compliance threshold
  a target either clears or does not. Then "sufficient" means "clears the bar",
  not "statistically indistinguishable from the best", and the cheapest clearing
  target is the answer whether or not the best is better.
- As a runtime router. This produces the evidence a routing decision rests on;
  the dispatch, the fallback chain and the per-request override belong to the
  builder-side routing concern and change on a different clock.
