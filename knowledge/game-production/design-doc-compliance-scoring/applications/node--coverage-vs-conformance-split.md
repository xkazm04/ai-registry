---
layer: application
type: application
subject: design-doc-compliance-scoring
technique: coverage-vs-conformance-split
stack: node
status: forged
---

# Splitting the GDD compliance score in a Node/TypeScript audit engine

The audit engine lives in `src/lib/gdd-compliance.ts` in the PoF repo (a Next.js production
console over a SQLite feature matrix, driving an Unreal Engine 5 ARPG project). It compares a
per-module design checklist against `feature_matrix` rows produced by CLI scans and reviews.

## What the single number was doing

Before the split, `src/lib/gdd-compliance.ts` computed one `score` per module from a weighted
blend that supplied constants for anything it did not know. The rewrite comment at
`src/lib/gdd-compliance.ts:340` records the defaults verbatim: a module with no scan took a
flat **60/100 "neutral"**, a module with no checklist took a flat **+30**, and zero gaps
added **+10** — so a module nobody had ever evaluated rendered **70/100**, indistinguishable
from a measured 70.

The measurement in that comment (real database, 2026-08-18) is the load-bearing evidence:

> twelve modules scored exactly 70 with zero evidence, while fifteen modules whose rows were
> all `unknown` scored 10 — the same epistemic state, a 60-point spread, in opposite directions.

## The split as implemented

Two numerators, two denominators, one pass over the already-fetched rows:

- `MEASURED_STATUSES` (`src/lib/gdd-compliance.ts:355`) is the set `implemented | improved |
  partial | missing` — deliberately excluding `unknown`, with the comment "`unknown` is the
  absence of a verdict, never one". The five-status tuple itself is single-sourced at
  `src/types/feature-matrix.ts:3` so the type, the SQLite validator and the route validator
  cannot drift.
- `buildEvidence` (`:410`) returns `ComplianceEvidence` carrying `featuresTotal`,
  `featuresMeasured`, `featuresUnmeasured`, `coverage`, `confidence` and **`measured:
  boolean`** — the type-level flag that makes the neutral constant unrepresentable.
- `calculateConformance` (`:519`) divides credit (`implemented + improved + partial * 0.5`)
  by `featuresMeasured`, not by `featuresTotal`. Unknown rows are simply not in the
  denominator, "because a row nobody looked at is a coverage fact, not a quality one".
- `score` on the report is conformance only, and is documented as meaningless without the
  `evidence` object beside it.

## Coverage as a named band

`CONFIDENCE_BANDS` (`src/lib/gdd-compliance.ts:369`) maps coverage to `high` ≥ 0.75,
`moderate` ≥ 0.34, `low` below — and `confidenceFor` short-circuits to `none` when
`featuresMeasured === 0`. The doc comment on `ComplianceConfidence` in
`src/types/gdd-compliance.ts:19` states the consumer contract: `none` "must never be rendered
as a number — the UI reads UNMEASURED". The band is named so the UI can say *why* a score is
soft rather than tinting it.

## Roll-up

`mergeEvidence` (`:460`) sums raw counts across modules and re-derives coverage from the
totals rather than averaging module percentages, and carries the age envelope through with
`earlier`/`later` rather than regenerating timestamps at roll-up time. The report header
(`:679`) publishes `modulesTotal` and `modulesMeasured` as separate figures, and the module
list is sorted measured-first, worst-conformance-first (`:684`) so "a wall of 'no evidence'
cards can never bury a real failure".

## Where this deviates from the standard

The engine keeps a fixed 34%/75% band split for every module regardless of module size; at
very small measured surfaces the bands are noisier than they read. The standard's guidance —
report the raw counts alongside any band on a small surface — is satisfied in the report
object (`featuresMeasured` always travels with `confidence`) but not enforced at the UI
boundary.
