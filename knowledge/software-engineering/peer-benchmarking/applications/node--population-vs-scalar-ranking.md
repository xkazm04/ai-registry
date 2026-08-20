---
layer: application
type: application
subject: peer-benchmarking
technique: population-vs-scalar-ranking
stack: node
status: forged
---

# Fixing a scalar-vs-population unit mismatch

`src/lib/db/org-insights.ts` shipped the canonical defect and then repaired
it, leaving the argument in the code. The repair is worth reading as a
worked example of the technique.

## The defect

`getOrgBenchmark` (line 822) computes an org's mean overall score
(`myAvgOverall`) and ranks it with `percentileOf`. The original corpus side
was the flat list of every other repo's latest scan — a **per-repo
distribution**. The comment at line 897 names the consequence exactly:

> a mean of N repos is far less variable than individual repos, so
> percentile-ing one aggregated number inside an un-aggregated repo
> distribution biased every org toward the middle (a unit mismatch:
> scalar-vs-population).

That is the shrinkage argument, observed in production: no outlier, no error
bar, every tenant pulled toward the centre in the same direction, which is
why it survived until someone reasoned about the units rather than the
numbers.

## The repair: aggregate the corpus to the ranked unit first

The corpus rows carry `orgId` specifically so they can be re-folded (the
`select` at line 850 keeps it, with the comment "`orgId` is carried so the
percentile comparison can be done org-vs-org (like-for-like)"). The fold is
a local helper at line 902:

```ts
const orgMeans = (rows, pick) => {
  const byOrg = new Map<string, { sum: number; n: number }>();
  for (const c of rows) { /* sum + count per org */ }
  return [...byOrg.values()].map((e) => e.sum / e.n);
};
```

Sum-and-count then divide — the composable form, not a mean of means. The
headline then ranks like against like (line 936):

```ts
overallPercentile: percentileOf(orgMeans(corpus, (c) => c.overall), myAvgOverall, CORPUS_MIN),
```

Both sides are now org-level means over comparable scans. The language
cohort at lines 920-926 does the same fold over the filtered peer slice —
`orgMeans(peers, …)` — with the comment "Rank this org's mean against peer
ORG means within the language (not peer repos)", so the narrower claim did
not quietly revert to the old unit.

## The floor moved with the unit

Changing the ranked unit changed what the corpus floor counts. `CORPUS_MIN`
at line 811 documents the coupling: "Percentiles now rank org-mean vs
other-org-means, so the floor counts ORGS, not repos." A floor left counting
repos would have admitted a five-hundred-repo, two-org corpus — the
technique's "count peers, not measurements" rule, and evidence that unit
mismatch and cohort size are the same design decision seen from two sides.
The 0..100 result is computed by the pure, unit-tested `percentileOf`
(line 815) using a fraction-at-or-below convention with an explicit `min`
sample parameter, so the suppression rule cannot be forgotten by a caller.

## One vote per company, upward

`src/lib/org/portfolio.ts` (lines 55-68) assembles many orgs into a
fleet-of-fleets table and computes its own summary mean with the same
discipline stated in the comment: "Simple mean maturity across companies
(each company one vote, not repo-weighted)." Each row also carries
`percentile: benchmark?.overallPercentile ?? null` (line 102) — the org-level
position, passed through unchanged rather than recomputed at a different
unit, so the portfolio and the tenant's own dashboard cannot disagree.
