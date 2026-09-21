---
layer: technique
type: technique
subject: state-budget-analysis
technique: median-over-mean-for-peers
status: forged
laws: [missing-is-not-zero, every-cap-ships-its-population]
shared_with: []
use_when:
  - summarizing a peer group into one benchmark figure
  - computing a "typical town" value for any fiscal metric
---

# Median over mean, for peers

The benchmark a town is judged against is a single number summarizing its peer
group, and the choice of summary statistic is a fairness decision, not a style
one. Municipal fiscal metrics are heavy-tailed by construction: one peer that
financed a stadium, absorbed a flood, or sold a utility carries a per-capita
figure an order of magnitude off its neighbors, and a mean hands that one town
the whole benchmark. The median does not care how extreme the extremes are —
only that they are few — which is exactly the robustness a benchmark needs when
the peer group is a dozen towns, not a thousand. Use the median when the question is the typical reporting municipality. An
unweighted mean answers average municipal value; a population-weighted rate
answers a resident-weighted question. Choose the estimand explicitly; a mean
is not invalid simply because observations are skewed.

## The three null rules

The statistic is the easy half. The hard half is what feeds it, and three rules
govern that:

1. **The median of an empty sample is null, not zero.** A summary function that
   returns 0 for an empty input has fabricated a benchmark out of nothing, and
   the fabrication is maximally misleading — every real town looks infinitely
   worse than "the typical peer" at zero debt. Encode this in the function's
   type: the summary returns a value *or* an explicit absence, and every caller
   is forced to handle the absence
   ([missing-is-not-zero](../../../_laws.md#missing-is-not-zero)).
2. **A peer without a value contributes nothing.** Group membership and metric
   contribution are separate tests. A peer that did not report capital
   expenditure for the year is simply absent from the capital-expenditure
   median — not present as zero, which would drag the benchmark down and make
   every reporting town look profligate. This must hold per metric and per
   period: the same peer may be in one median and out of another.
3. **Every median ships its sample size.** After rules 1 and 2, the effective
   sample of each median differs from the nominal peer count, and the reader
   must see the number the statistic was actually computed from: "median of 9
   reporting peers", not "peer median"
   ([every-cap-ships-its-population](../../../_laws.md#every-cap-ships-its-population)).
   A trend line of medians over years applies the rule per point — each year's
   median draws from that year's reporters, and a year where nobody reported is
   a gap in the line, not a zero.

## Decision rules

- Apply the published minimum to each metric's valid reporting peers after
  permissible widening. Below it, suppress ranking and normative benchmark
  language. A descriptive median may be shown for a verified complete small
  population with its roster/count and narrow scope; otherwise show insufficient
  coverage. This is the same policy as the widening technique.
- When comparing a town against the median, never rank it *within* the peer
  list on the same surface without the same null discipline: a rank of "3rd of
  12" where 5 peers were silently dropped is "3rd of 7" wearing a bigger
  denominator.
- When even-sized samples split the middle, take the midpoint of the two
  central values — and sort a *copy*; a summary that mutates its input has
  side effects on every subsequent computation over the same peer list.
- When a caller needs both the benchmark and the town's own value, compute
  them in one pass from one dataset snapshot, so the two numbers cannot come
  from different vintages.

## When not to use it

The median answers "what is typical?"; it is the wrong tool for "what is the
group's total?" (that is a sum over reporters, with the reporter count
disclosed) and for "how spread out is the group?" (show the distribution, or
quartiles, with any other dispersion measure justified and labeled). Do not use
peer medians to detect anomalies automatically and publish the detections; a
town far from its median is a lead for human examination, and the distance is
a fact, but "anomalous" is a verdict. A small sample can have an exact descriptive median without supporting a
benchmark for a larger population. Do not confuse those claims; the complete
small-population exception above does not establish representativeness.
