---
layer: application
type: application
subject: peer-benchmarking
technique: comparability-filters
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# Comparability filters in a cross-org benchmark query

`src/lib/db/org-benchmark.ts` computes `getOrgBenchmark(orgSlug)` (line 55):
one org's mean maturity scores, ranked against other orgs in the corpus.
The eligibility predicate lives in `src/lib/corpus/eligibility.ts` and is
the whole of this technique in ten lines.

The file layout is itself a lesson. In the first reading (2026-08-20) both
sat in `org-insights.ts`; a second consumer arrived (the exemplar diff, which
compares one repo's evidence against a peer or the public cohort) and the
predicate was extracted *verbatim* into a pure module, with `org-insights.ts`
re-exporting it so no import path changed. The extraction header gives the
reason: a comparison built on a *copy* of the filter "silently diverges the
first time the rubric bumps or the mock rule changes — and the divergence
is invisible, because both copies keep returning plausible numbers." The
module is deliberately pure (object literals, numbers and the rubric
constant; no Prisma client, no clock) so a client-reachable caller can
import it.

## The predicate object

```ts
export const BENCHMARK_ELIGIBLE = {
  engineProvider: { not: "mock" },
  rubricVersion: SCORING_RUBRIC_VERSION,
} as const;
```

(`src/lib/corpus/eligibility.ts:34`). Its doc-comment at line 18 — "Which
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
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
requirement is structural — there is one definition of "comparable" and both
queries import it.

## Both sides, in the same function

The corpus query at `org-benchmark.ts:79` filters with it:

```ts
where: { orgId: { not: org.id }, isPrivate: false, scans: { some: BENCHMARK_ELIGIBLE } },
```

and the subject's own query at line 115 carries the same predicate with the
rule written beside it: `where: BENCHMARK_ELIGIBLE, // same instrument on
both sides, or the comparison means nothing`. The module comment states the
mirrored-error argument in full: "filtering only the corpus would rank this
org's mock-scored repos against a live-scored corpus, which is the same error
mirrored."

Note what is *not* symmetric: `isPrivate: false` appears only on the corpus
side, deliberately — "an org is always entitled to its own repos" (the TENANCY
comment from line 71). Two filters, opposite symmetry rules, each annotated. That is the
[corpus-tenancy-boundary](../techniques/corpus-tenancy-boundary.md)
distinction realized in one `where` clause.

## Filter-then-pick, inside the cap

The corpus read is bounded by `BENCHMARK_CORPUS_CAP = 5000` (`org-benchmark.ts:36`) and
ordered by recency. The eligibility predicate is applied in two places
*within* that bounded read — on the `some` existence check that decides
which repos are candidates, and on the nested `take: 1` that picks each
repo's representative scan (line 88). The comment at lines 66-70 gives the
reason and it is the upward lesson this application contributes to the
technique: "each repo contributes its latest ELIGIBLE scan rather than its
latest scan (a repo whose most recent run degraded to mock still counts, via
its last real one)." Picking first and filtering afterwards would have
dropped precisely the repos whose latest run degraded — a non-random hole in
the corpus — and would have spent the 5000-row cap budget on rows the loop
discards.

## Excluded, not deleted - and one place it is qualified instead

The public register in `src/lib/register/data.ts` shows the rendering half.
Its invariant 2 (module comment, lines 12-17) carries non-model scans through
as `verified: false` (set at line 213) and never interleaves them into the
ranked board; `getPublicRegister` splits them at lines 306-307 into `entries`
and a separate `unverified` list, shown on page 1 only (line 315), that
callers render in an explicitly labelled "not independently scored" section,
and the same qualifier appears on the badge output. The rows are excluded
from the ranking and still visible with their reason - the technique's
"excluded is not deleted" rule, held across three surfaces.

The same module now holds a second, different treatment for the *rubric*
half of comparability, added after a UAT finding (`TOMAS-L1-11`: the register
carried every provenance qualifier except the rubric version, and a rubric
bump invalidates the cache without re-scanning, so an un-rescanned repo kept
its old row and was ranked against fresh ones). A stale-rubric row is
**qualified, not de-ranked**: `currentRubric: false` (line 215, strict
equality, "a null column is unknown, and unknown is not current"), a
`rubric rNN` chip, a note under the board, and a `staleRubricCount` on the
owner card that says the average "mixes instruments". The module's reason is
that the two cases are not the same claim - a mock score "had no model in it
at all and is not a rating", while a stale score "is a real rating taken
with an earlier instrument" - and that dropping every pre-bump row "would
empty the board on the day of every bump (r13->r14->r15 inside 48 hours) and
publish a register that is less true, not more." Counting the stale rows
rather than excluding them is defended the same way: dropping them would
publish an average over "a smaller, arbitrary slice".

Read against the technique, this is a boundary and not a contradiction. The
benchmark in `org-benchmark.ts` makes a *position* claim over a population,
so a mixed-version corpus corrupts every tenant's rank and the filter is
strict (the technique's "rank within versions only"). The register shows
*individual ratings in an ordered list* and an owner average, where each
row's own claim is still true if labelled with its instrument. Unknown
provenance is non-current in both; what differs is whether the row may move
another row's position. One repository, two policies, each argued in the
code.
