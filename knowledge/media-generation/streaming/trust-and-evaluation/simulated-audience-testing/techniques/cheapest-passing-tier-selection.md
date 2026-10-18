---
layer: technique
type: technique
subject: simulated-audience-testing
technique: cheapest-passing-tier-selection
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [choosing which model tier and configuration go live from tournament results, weighing safety failures against quality and cost, reading small-n safety rates]
---

# Cheapest passing tier selection

A tournament ends with a table of configurations — model tier, tone, segment —
and somebody has to pick one. The naive pick is the highest quality score, or
the cheapest configuration whose average looks acceptable. Both let a
configuration with a safety failure win on something else. The rule here is
lexicographic and is declared before the tournament runs: **hard rules gate,
quality ranks, cost decides**.

## The rule

1. **Gate on hard rules.** Hard rules are the red lines plus each situation's
   required response. A configuration with any hard-rule failure in the
   tournament is not eligible to win. They are not weighed against quality; a
   host that is wittier and occasionally breaks a red line is not a better
   host. Operational ceilings the show depends on — a first-word latency
   budget, a maximum silence — are gates too, declared with the rest, not
   tiebreakers discovered afterwards.
2. **Gate on coverage.** A configuration whose hard-rule checks were mostly
   not provoked, not evaluable, pending or engine-failed has not passed; it
   is unmeasured (law:
   [unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).
   Eligibility requires the rules to have actually been tested a declared
   number of times, and a winner chosen on fewer judged runs than that is
   printed as provisional wherever it appears.
3. **Rank the eligible by quality** — the share of quality facts true, with
   over-refusal reported beside it so a cautious host does not win by being
   dull. Quality ranks; it never gates, and it never rescues a configuration
   that failed a gate.
4. **Among those within the quality noise of the best, pick the cheapest** —
   cost computed per usable stream, not per call
   (law: [cost-per-usable-output](../../../../_laws.md#cost-per-usable-output)).
   A cheap tier that fails the gate more often is not cheap.

## Reading zero failures

Zero hard-rule failures is a statement about a sample, not a rate. With zero
events in n independent checks, the 95% upper bound on the true rate is
roughly 3/n — so zero in 50 checks still allows a rate near 6%. Use a score
interval rather than the normal approximation for any rate near zero or one,
and state the bound — and the method that produced it — beside the zero. When the bound is above what the owner
would accept on a live stream, the honest verdict is "not yet measured
enough", and the remedy is more runs for the leading candidates, not a
looser gate.

Observations are also **clustered**. The checks inside one run share a host,
a seed and a room; failures tend to come in runs, not uniformly. A bound
computed over pooled checks treats them as independent and is too narrow. The
safer reading counts runs: how many runs contained any hard-rule failure, out
of how many runs judged. The same holds for quality: a pooled interval over
thousands of facts from a few dozen runs looks precise and is not; compare
per-run quality distributions, or bound over runs, before calling a
difference real.

## When the expensive tier wins

Often the gate itself picks the tier: a small, fast tier that fails red lines
or over-refuses safe edge is ineligible however cheap it is, and the mid tier
wins at many times the cost. That is the rule working, not failing — the
cheaper tier's price per usable stream is undefined if no stream it produces
is usable. Report the cost multiple plainly so the owner sees what safety
costs, and look for the components that could close the gap (a deterministic
output gate, a better situation response template) before accepting it
permanently.

## Decision rules

- **When two configurations differ by less than their per-run spread, call it
  a tie and pick on cost.** A ranking must be earned by a difference larger
  than the noise.
- **When a metric is flat across tiers, it does not decide between them.**
  Responsiveness to chat that stays the same at every model size is owned by
  the picking machinery; spend on the model will not move it.
- **When a slice was measured by a different instrument, it is not in the
  ranking.** Report it beside, with its own n.
- **When no configuration passes the gate, nothing goes live.** The output of
  the tournament is then the list of failures to fix, not a least-bad winner.

## When not to use it

When the configurations differ in what the show is — a different format, a
different audience — cost is not the tiebreaker; the owner's judgement is.
This rule picks among substitutes, not among alternatives.
