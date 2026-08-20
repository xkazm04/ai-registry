---
layer: application
type: application
subject: analytics-time-windows
technique: cohort-matched-comparison
stack: sql
verified_on: 2026-08-20
---

# The cohort-matched period delta in an org rollup

`computeWindowDeltas` (`src/lib/db/org-rollup.ts:275-296`) is the reference
realization of this technique, and its comment is the incident that produced
it.

## The incident, as recorded

> Cohort-matched period deltas: movement is measured ONLY over repos present
> on BOTH sides of the window. Averaging the whole current fleet against the
> baseline cohort folds composition change into what is presented as score
> movement — onboarding 5 low-scoring repos mid-quarter used to read as the
> fleet "slipping" 25 points no repo experienced (and onboarding strong repos
> manufactured a fake climb), while the movers panel below correctly showed
> zero regressions.
> — `src/lib/db/org-rollup.ts:275-282`

Every element the technique claims is present in that paragraph: the two
effects conflated, the magnitude no individual entity experienced, the
symmetric flattering failure, and the on-screen contradiction with the
per-entity movers panel that made the defect visible at all.

## The implementation

The intersection is computed in both directions before any arithmetic
(`src/lib/db/org-rollup.ts:287-291`): the baseline set is filtered to entity
ids present in the current set, then the current set is filtered back to ids
present in that filtered baseline. The double filter matters — a one-sided
filter still leaves current-only entities in the numerator. Non-overlapping
cohorts return `null` rather than a zero, so the surface suppresses the figure
instead of asserting "no change".

## The baseline read is a point query, pushed into the store

The baseline that feeds this function comes from
`src/lib/db/org-rollup.ts:493-506`, and that query carries two of the
subject's rules:

- **`scannedAt: { lt: effStart }`** — strictly before the window start, not
  `lte`. The comment names the defect: a scan stamped exactly at `start` (seed
  or snapshot data at a clean local midnight) previously counted as *both* the
  baseline and the first in-window point, comparing it against itself for a
  spurious zero delta. This is [half-open interval
  policy](../techniques/half-open-interval-policy.md) applied to the baseline
  predicate, and it is the reason the baseline read is a point query with an
  exclusive bound rather than a range.
- **`distinct: ["repoId"]` with `orderBy: { scannedAt: "desc" }`** — one row
  per entity, the latest before `start`, reduced *at the store*. The comment
  records what it replaced: pulling the org's entire pre-window history into
  application memory to deduplicate in a loop, which scaled with fleet **age**
  rather than with the period — tens of thousands of rows for an org scanned
  daily for a year. The same fix had already been applied to the movers
  baseline in `src/lib/db/org-insights.ts`, which is the convergence that
  made it a rule rather than a fix.

## Confirmed: the window start is the baseline, declared in the type

`OrgWindow` (`src/lib/db/org-rollup.ts:216-232`) documents `start` as doubling
as the baseline date and restates the half-open policy at the boundary where
queries are built, including why `endExclusive` wins over the legacy inclusive
`end` under the store's microsecond timestamps.

## The abutting-window variant, and why half-open is load-bearing

The executive briefing needs a matched prior window rather than a point
baseline, and constructs it as an equal-length window whose upper bound is the
current window's start (`src/lib/org/briefing.ts:254-270`). The comment is the
clearest statement of the interval rule in the codebase: the two windows abut,
so `endExclusive: window.start` is the exact instant the current period's
`gte: start` claims, and the previous inclusive `end: window.start` counted a
boundary scan on both sides — reporting movement across the boundary as
measured against itself, a zero delta where real movement existed.

## Not a deviation, but worth naming

`computeWindowDeltas` reports movement correctly and returns `null` on
non-overlap, but does not return the **cohort size** alongside the deltas, nor
a separately named composition figure. The technique asks for both: a delta
over four matched entities out of sixty is a different claim from a delta over
fifty-eight, and the composition change that was correctly *excluded* from
movement is itself information the reader wants. The standard stays where it
is.
