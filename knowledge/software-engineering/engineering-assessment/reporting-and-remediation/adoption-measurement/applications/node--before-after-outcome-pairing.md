---
layer: application
type: application
subject: adoption-measurement
technique: before-after-outcome-pairing
stack: node
status: forged
verified_on: 2026-08-20
---

# Pairing assessments around an adoption instant

`src/lib/org/skill-outcomes.ts` in the source app
(`C:\Users\kazda\kiro\ascent`) answers "did adopting this practice artifact
move the repository's readiness score?" For every recorded adoption
(`OrgSkillAdoption`: skill, repo, `adoptedAt`) it pairs the latest scan
strictly before the adoption with the latest scan at-or-after it and reports
the overall-score delta plus per-dimension deltas.

## The honesty rule is stated in the file header

`:6-10` is the clearest statement of the technique found in the repo, and the
draft standard's phrasing was sharpened from it:

> when either side of the pair is missing, the result is an explicit
> `no-before-scan` / `no-after-scan` with NULL deltas. A skill adopted into a
> never-scanned repo, or adopted five minutes ago, has no measurable effect
> yet — inventing one (comparing to the org mean, to the first scan, to zero)
> would turn the library into a lie generator. Even a real delta is
> CORRELATION, not proof: other work lands in the same window. Label it as
> movement since adoption.

The status vocabulary is closed at `:20`:

```ts
export type OutcomeStatus = "measured" | "no-before-scan" | "no-after-scan";
```

and `skillOutcomeFor` at `:100-115` assigns it before computing anything:

```ts
const status: OutcomeStatus = !before ? "no-before-scan" : !after ? "no-after-scan" : "measured";
...
overallDelta: before && after ? after.overallScore - before.overallScore : null,
dimensionDeltas: before && after ? dimensionDeltas(before, after) : [],
```

A missing half yields `null`, never `0`. `:53-56` maps each status to
reader-facing copy ("No scan before adoption, nothing to compare against" /
"No scan since adoption yet") so the gap is a rendered statement, not an
empty cell.

## The boundary resolves toward "after"

`pairScansAroundAdoption` at `:61-83` carries the rule the standard now
states explicitly:

> A scan taken at the exact adoption instant counts as AFTER — the adoption is
> the boundary, and the "before" side must be a state the skill provably
> could not have influenced.

The implementation matches: `if (t < at)` selects into `before`, everything
else into `after`. It is also order-independent (history arrives newest-first,
tests feed either order) and skips unparseable timestamps rather than
coercing them, so a malformed `adoptedAt` yields `{ before: null, after: null }`
and therefore a named gap status rather than a silent pairing.

## Sub-dimension identity

`dimensionDeltas` at `:86-97` implements the "compare only what both sides
scored" rule in one line of intent:

```ts
if (prev === undefined) continue; // a dimension only one side scored isn't a movement
```

Without it, a rubric that gained a dimension between the two scans would
publish a delta manufactured entirely by coverage change. Results are sorted
by absolute movement so the largest real change leads.

## Separation of concerns

The pairing core (`pairScansAroundAdoption`, `skillOutcomeFor`,
`skillOutcomesFor` at `:117`) is pure and unit-tested; the database half only
feeds it `getRepositoryHistory` from `src/lib/db/scans-read.ts`, once per
distinct repository. That is what makes the honesty rules testable — every
missing-half case can be exercised without staging data.

## Deviations from the standard

- **No instrument-identity check.** The pairing does not verify that the two
  scans were produced by the same rubric version. `dimensionDeltas` protects
  the per-dimension view by intersection, but `overallDelta` will happily
  subtract scores computed under different weightings. The standard's
  `instrument-mismatch` status has no counterpart here; this is the largest
  gap and the standard stands.
- **No maximum distance from the instant.** A "before" scan from eighteen
  months earlier is selected as readily as one from last week. The distances
  are recoverable from the returned `scannedAt` values but are not enforced
  or surfaced beside the delta.
- **The unpaired population is not reported alongside aggregates.** Per-skill
  statuses exist, but nothing forces "eleven measured, forty-three
  no-after" to appear next to a mean delta, which is where selection bias
  enters a summary.
