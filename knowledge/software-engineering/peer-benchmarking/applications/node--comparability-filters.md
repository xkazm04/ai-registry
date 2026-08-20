---
layer: application
type: application
subject: peer-benchmarking
technique: comparability-filters
stack: node
status: forged
verified_on: 2026-08-20
---

# Comparability filters in a cross-org benchmark query

`src/lib/db/org-insights.ts` computes `getOrgBenchmark(orgSlug)` (line 822):
one org's mean maturity scores, ranked against other orgs in the corpus.
The eligibility predicate is the first thing in the module and the whole of
this technique in ten lines.

## The predicate object

```ts
const BENCHMARK_ELIGIBLE = {
  engineProvider: { not: "mock" },
  rubricVersion: SCORING_RUBRIC_VERSION,
} as const;
```

(`src/lib/db/org-insights.ts:793`). Its doc-comment at line 777 — "Which
scans may enter a percentile comparison" — states both failure modes the
technique names, and records that both were silently in the corpus before
the filter existed:

1. **Engine.** A `mock` scan is the deterministic rubric with no model
   contribution — the keyless/demo floor. Seeded demo orgs and keyless
   deployments produce them in bulk, so "the corpus was partly a different
   scoring function, ranked as if it were a peer." Exactly the fallback-path
   contamination the technique warns is invisible in aggregate.
2. **Rubric version.** `SCORING_RUBRIC_VERSION` is stamped on every scan
   "precisely so a pre-bump score is identifiable. Nothing re-bases persisted
   scans, so an old-rubric row is a number from a retired instrument."
   Legacy rows with a `null` version are excluded on the technique's own
   grounds, spelled out in the comment: "unknown provenance is not evidence
   of comparability."

Because it is one frozen object rather than two inline `where` clauses, the
[one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)
requirement is structural — there is one definition of "comparable" and both
queries import it.

## Both sides, in the same function

The corpus query at line 846 filters with it:

```ts
where: { orgId: { not: org.id }, isPrivate: false, scans: { some: BENCHMARK_ELIGIBLE } },
```

and the subject's own query at line 875 carries the same predicate with the
rule written beside it: `where: BENCHMARK_ELIGIBLE, // same instrument on
both sides, or the comparison means nothing`. The module comment states the
mirrored-error argument in full: "filtering only the corpus would rank this
org's mock-scored repos against a live-scored corpus, which is the same error
mirrored."

Note what is *not* symmetric: `isPrivate: false` appears only on the corpus
side, deliberately — "an org is always entitled to its own repos" (line 838
onward). Two filters, opposite symmetry rules, each annotated. That is the
[corpus-tenancy-boundary](../techniques/corpus-tenancy-boundary.md)
distinction realized in one `where` clause.

## Filter-then-pick, inside the cap

The corpus read is bounded by `BENCHMARK_CORPUS_CAP = 5000` (line 807) and
ordered by recency. The eligibility predicate is applied in two places
*within* that bounded read — on the `some` existence check that decides
which repos are candidates, and on the nested `take: 1` that picks each
repo's representative scan (line 853). The comment at line 835 gives the
reason and it is the upward lesson this application contributes to the
technique: "each repo contributes its latest ELIGIBLE scan rather than its
latest scan (a repo whose most recent run degraded to mock still counts, via
its last real one)." Picking first and filtering afterwards would have
dropped precisely the repos whose latest run degraded — a non-random hole in
the corpus — and would have spent the 5000-row cap budget on rows the loop
discards.

## Excluded, not deleted

The public register in `src/lib/register/data.ts` shows the rendering half.
Its invariant 2 (module comment, lines 12-17) carries non-model scans through
as `verified: false` (set at line 163) and never interleaves them into the
ranked board; `getPublicRegister` splits them at lines 238-246 into `entries`
and a separate `unverified` list that callers render in an explicitly
labelled "not independently scored" section, and the same qualifier appears
on the badge output. The rows are excluded from the ranking and still visible
with their reason — the technique's "excluded is not deleted" rule, held
across three surfaces.
