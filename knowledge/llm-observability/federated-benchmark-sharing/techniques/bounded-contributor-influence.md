---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: bounded-contributor-influence
status: forged
laws: [aggregates-leave-identity-behind, estimation-announces-itself]
shared_with: []
use_when: [merging self-reported evidence weights from multiple parties, defending a shared ranking against weight inflation, choosing between capping and rejecting an outsized contribution]
---

# Bounded contributor influence

Case-weighting a merged row is statistically right: 10,000 real cases
should count for more than 10. But in a federation the case count is
**self-reported**, which makes it the cheapest attack in the system — a
contributor who wants to own a row just types a bigger number. Flat
weighting hands the leaderboard to the largest claim; equal-weighting every
contributor throws away the very evidence-proportionality that makes the
merge meaningful. The resolution is a ceiling: no single source may hold
more than a fixed share of a row's weight once the row has two or more
sources. A contributor can *lead* a row; it can never *own* it.

## The mechanism

Winsorize the per-source weights, don't trim them. For each merged row,
take the sources' case counts as raw weights; if the largest exceeds the
share ceiling `s` of the total, clamp it to `s/(1-s)` times the sum of the
others — the value at which its share is exactly `s`. Only the largest
element can breach the ceiling (two sources cannot each hold more than
half-plus), so clamping the maximum is sufficient and exact. Everything
about the source still counts — its quality, its runs, its variance — at a
bounded weight; this is the winsorized-aggregation instinct from the robust
federated-learning literature applied to weights instead of model updates.

Choose the ceiling generously. A share cap of 0.8 still lets a genuinely
large contributor outweigh everyone else combined 4:1 — sample size keeps
mattering, which is the non-goal to protect — while guaranteeing the rest
of the federation always holds at least a fifth of the row. A tight cap
(0.5) feels safer but punishes honest scale and pushes big contributors to
split their identity, which is worse: influence bounds are per-identity,
and identity-splitting (a Sybil attack) must be handled by the credential
issuance policy, not by tightening a cap that assumes identities are real.

Three placement rules:

- **Bound at merge, between sources — never inside one contributor.** An
  organization pooling its own runs into its own digest weights them by
  raw cases with no ceiling; there is no collective to skew in your own
  aggregate, and capping there just biases your own numbers.
- **A single-source row is left untouched.** With one source there is
  nothing to bound — its share is 1.0 by definition, and whether such a row
  is publishable at all is the source floor's decision, not this
  technique's.
- **Use the same bounded weights everywhere in the row.** The
  between-source disagreement estimate must run over the winsorized
  weights too, or a whale capped out of the mean still dominates the
  spread and the confidence interval — bounding the point estimate while
  leaving uncertainty unbounded is half a defense.

## Disclose the realized share

Every merged row publishes its actual top-source share alongside the raw
(uncapped) case total and the contributor count. The raw evidence volume is
reported truthfully — capping is a weighting decision, not a restatement of
how much evidence exists — and the share number tells the reader what kind
of row they are looking at: a `0.8` share row is "one big voice, bounded",
a `0.3` row is a genuine chorus. A bound applied silently is an estimation
choice hidden from the people ranking models by its output.

## The residual, and who closes it

A ceiling bounds influence; it does not authenticate evidence. A fabricated
million-case claim capped to 80% of a row is still 80% of a row. The
ceiling's other half is ingest-side plausibility: counts beyond what a
benchmark could produce are rejected outright before they ever reach the
merge (see [hub-ingest-plausibility-gates](hub-ingest-plausibility-gates.md)).
The two are designed together — the gate bounds the magnitude of any lie
that gets in, the ceiling bounds the share of any magnitude. Neither alone
survives a motivated contributor.

## When not to use it

When contributions are verifiable rather than self-reported — the hub can
recompute or audit the case count — reject wrong claims instead of capping
them; bounding is the tool for numbers you must partially trust. And in a
two-party exchange (not a federation), a share ceiling is meaningless: with
one counterparty the real decision is whether to merge at all.
