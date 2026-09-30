---
layer: application
type: application
subject: metrics-rollups
technique: aggregate-honesty
stack: next
status: forged
verified_on: 2026-09-30
verified_against: next@16
---

# Excluding a placeholder class is a population rule, not a badge fix

Read at ascent `75462847` (`next ^16`, the witness for `verified_against`). The fleet
rollup folds each repo's latest scan into org averages, deltas, movers, team standings
and a benchmark percentile. Some scans are the deterministic **mock floor** - a
placeholder score no model produced (`Scan.engineProvider === "mock"`). The lesson is
what happened when the exclusion was decided in one place and enforced in another.

## What the tree shows

- **The producer defines the predicate and exports it.** `isMockScore`
  (`src/lib/db/org-rollup.ts:99`) carries a docstring naming the failure that made it
  exported: `getOrgMovers` and `getOrgTeamRollup` "both used to fold the mock floor
  while this file refused it", so one fleet reported a mock-to-live re-scan as a top
  gainer while the badge above it excluded exactly that pair.
- **Every sibling reader imports it.** `org-insights.ts:28` (movers pair at `:125`,
  baseline at `:242`), `org-teams.ts:25`, and four folds inside `org-rollup.ts` itself
  (`:1036`, `:1058`, `:1323`). A movers pair is a before/after measurement, so an
  endpoint nobody measured cannot be one of its ends.
- **The count travels with its predicate.** `realScoredCount` is the denominator of the
  three averages and `mockCount` the disclosed remainder (`org-rollup.ts:387-407`);
  `avgOverall` is `null`, not `0`, when the denominator is empty - the absence moved
  from a prose rule into the type. The briefing renders "across N live-scored repos"
  (`src/lib/org/briefing-format.ts:113`).
- **Both sides of a comparison get the rule.** The benchmark eligibility filter
  (`src/lib/corpus/eligibility.ts:36`) is applied to the corpus and to the org, because
  filtering only the corpus "would rank this org's mock-scored repos against a
  live-scored corpus", and `CORPUS_BASIS` ships with every percentile.

## Where the single predicate is not single

Two readers still restate the literal rather than import: `alerts-detection.ts:301`
(`p.engineProvider !== MOCK_ENGINE`) and `org-delivery-trend.ts:41` (a local
`MOCK_ENGINE = "mock"` commented "mirrors `chartEngine.MOCK_ENGINE`"). Both apply the
same string today, so nothing disagrees; the rule is enforced by convention there, and
the next reader added by copying either file inherits a fork. Under the technique this is
the honest state of the tree: one predicate for the fleet surfaces, two mirrors that a
parity test would have to pin.

## Reading for the technique

The audit obligation the technique needs is on the *exclusion*, not the display: when a
producer starts excluding a class from one aggregate, enumerate every reader that folds
the same rows in the same request (averages, deltas, trends, movers, team rollups,
benchmark corpora) and route them through the producer's exported predicate. Single
project, single source: this is a field application, not a convergence-earned technique.
It has not been applied to another fleet project; no `applied.md` row is owed until a
second tree grows a placeholder class.
