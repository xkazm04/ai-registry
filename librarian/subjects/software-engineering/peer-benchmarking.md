---
subject: peer-benchmarking
domain: software-engineering
last_touched: 2026-10-01
---
# peer-benchmarking

## 2026-10-01 - deepen dp-pb-1001 (never swept by the librarian)

Re-read the one source tree (ascent 8998d2c0) against all three applications. Every
`org-insights.ts` line citation was dead: `getOrgBenchmark`, `percentileOf` and the cap
moved to `src/lib/db/org-benchmark.ts`, and `BENCHMARK_ELIGIBLE`, `CORPUS_BASIS`,
`COHORT_MIN`, `CORPUS_MIN` to the pure `src/lib/corpus/eligibility.ts`, extracted
verbatim because a second consumer (the exemplar diff) arrived and a copy of the filter
"silently diverges the first time the rubric bumps". All claims survived the re-read:
both-sides filter, filter-before-pick inside the cap, `isPrivate` on the corpus side
only, org-mean vs org-means, floor counting orgs. Applications re-resolved,
`verified_on: 2026-10-01`, `verified_against: node@24` on the two node ones.

One real addition: the public register now qualifies stale-rubric rows (chip,
`currentRubric: false`, `staleRubricCount`) instead of de-ranking them, on the argument
that a labelled rating is still a true claim while a mock score is not a rating, and that
exclusion would empty the board on every bump (r13-r15 in 48 h). That scopes the
technique's "rank within versions only" to position claims; the rule now says so and
points at the application. Single source, one tree: carried as a condition, not a new
technique. No counter-evidence lane beyond the source re-read; literature lanes not run
(training-data only subject, round 1 of a directed pass).

### Impact
Regenerated registry maps: no project carries a judged verdict on this subject (goat 1,
politicas 2 pairs, all `unknown`; ascent maps none), so no `/conform --stale` queue.
Rules unchanged (they do not carry technique bodies).

### Banked
Return when a second tree gains a rank or board surface, or when ascent bumps the rubric
again and the register qualifier can be observed in the wild.
