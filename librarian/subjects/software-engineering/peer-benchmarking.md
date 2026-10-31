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

## Architecture review - 2026-10-31

First architecture review, against `10247cc6c`. All nine documents read in full. The
subject's argument holds: comparability before counting, a floor counted in peers after
the filter, like-for-like units, per-row membership, and a basis that travels. Three
precision defects were found. The scipy citation in population-vs-scalar-ranking names
the wrong `kind`: the mid-rank it describes (strictly below plus half the ties) is
scipy's `kind='mean'`, while the default `kind='rank'` averages the percentage ranks of
the matching scores and, with no tie, equals the at-or-below form. The "two rungs"
instability claim at n=4 overstates the arithmetic. The n=3 subtraction leak needs the
released aggregate it subtracts from. The three applications cite a private tree that is
not available here; nothing in them was re-checked and no verification date moves.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/peer-benchmarking",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:a3239df32fc1070b",
  "disposition": "clarify",
  "coverage": "All 9 current documents read in full (golden path, five techniques, three applications). One primary source opened (scipy percentileofscore documentation). Arithmetic of the n=4 ladder recomputed. Not evaluated: the private source tree the three applications cite, any runtime, the literature behind the 'sample counts in the tens' and disclosure-threshold claims.",
  "counterexamples": [
    "With four peers, a subject at 3 of 4 (75%) moves to 80% or 60% when one peer joins, and a subject at 1 of 4 (25%) drops to 0% when the one peer below it leaves: the largest single-change move is one rung (25 points), not two.",
    "scipy.stats.percentileofscore([1,2,3,3,4], 3) returns 70.0 under the default kind='rank'; strictly-below plus half the ties is 60.0, which is kind='mean'.",
    "At n=3 with only a position released and no aggregate, a participant who knows two peers' scores learns an interval for the third, not its value; subtraction needs a released mean or total.",
    "A public register of individually labelled ratings can keep pre-bump rows qualified rather than excluded without corrupting any position claim (retained from the 2026-10-01 deepen)."
  ],
  "sources": [
    {
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.percentileofscore.html",
      "result": "Opened 2026-10-31. Default is kind='rank': 'Average percentage ranking of score. In case of multiple matches, average the percentage rankings of all matching scores.' 'mean': 'The average of the \"weak\" and \"strict\" scores'. Examples: percentileofscore([1, 2, 3, 3, 4], 3) -> 70.0 (rank), strict 40.0, weak 80.0, mean 60.0; percentileofscore([1, 2, 3, 4], 3) -> 75.0. Refutes the technique's statement that the default returns strictly-below plus half the ties."
    },
    {
      "source": "Arithmetic of the n=4 ladder (golden path and cohort-minimum-size)",
      "result": "Joining moves k/4 to k/5 or (k+1)/5, at most 20 points; leaving moves k/4 to k/3 or (k-1)/3, at most 25 points. One rung, not two."
    },
    {
      "source": "Existing applications",
      "result": "Cite a private tree at its 2026-10-01 reading; not reopened, nothing re-executed, verification dates unchanged."
    }
  ],
  "documents": {
    "peer-benchmarking.md": {
      "disposition": "clarify",
      "reason": "'one new joiner could move it two rungs' overstates the n=4 arithmetic; the largest single join or leave moves the figure by up to 25 points, one rung. Seams, refusals and technique map are otherwise sound."
    },
    "techniques/comparability-filters.md": {
      "disposition": "keep",
      "reason": "Engine and version provenance, unknown-excluded, both-sides predicate, filter-then-pick inside the cap, excluded-not-deleted, and the position-claim scope of 'rank within versions' added 2026-10-01 are coherent and match the golden path."
    },
    "techniques/cohort-minimum-size.md": {
      "disposition": "clarify",
      "reason": "(1) 'moves the reader two rungs' has the same arithmetic overstatement as the golden path. (2) The n=3 subtraction leak needs a released average or total to subtract from. (3) 'Published guidance ... converges on sample counts in the tens' names no source; needs a citation or a softer statement (not applied: no source confirmed this run)."
    },
    "techniques/corpus-tenancy-boundary.md": {
      "disposition": "keep",
      "reason": "Per-row membership at assembly, re-assertion on every hop, the declared asymmetry against comparability filters, withdrawal, distribution-not-rows, the bounded read as a sampling decision, and operator rollups as a separate door are all stated with decision rules and smells."
    },
    "techniques/population-vs-scalar-ranking.md": {
      "disposition": "clarify",
      "reason": "(1) The scipy citation is wrong: strictly-below plus half the ties is kind='mean', not the default kind='rank', which averages the percentage ranks of matching scores (70 vs 60 on the documented tie example). (2) 'that is what the central limit theorem says' attributes the shrinkage to the wrong result: the variance of a mean of n independent items is the item variance over n, which holds without the CLT."
    },
    "techniques/basis-disclosure.md": {
      "disposition": "keep",
      "reason": "Five-field basis, basis in the result type, travelling forms, policy-not-count suppression and the table-scope exemption are consistent with the golden path and the cohort technique."
    },
    "applications/node--comparability-filters.md": {
      "disposition": "reverify",
      "reason": "Line-cited claims about a private tree read on 2026-10-01; the tree was not reopened. The stale-rubric qualifier treatment is consistent with the technique's scoped rule."
    },
    "applications/node--population-vs-scalar-ranking.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened. Also owed on reverify: the application reports percentileOf uses a 'fraction-at-or-below' convention, which is the non-conservative tie form the technique advises against for quoted 'beats X%' claims, and the application does not say so."
    },
    "applications/sql--corpus-tenancy-boundary.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened. The three doors (benchmark corpus, public register, operator rollup) match the technique's invariants as described."
    }
  }
}
```


## Architecture review - 2026-10-31 (clarify applied)

Applied four of the five clarify items the first 2026-10-31 record named. The scipy
documentation was opened this run and the n=4 arithmetic recomputed. The unsourced
'sample counts in the tens' sentence in cohort-minimum-size stays owed. Applications were
not touched and keep `reverify`; overall disposition stays `clarify` for the owed item.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/peer-benchmarking",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:47acc121a5b14390",
  "disposition": "clarify",
  "coverage": "All 9 current documents decided. The clarify items of the first 2026-10-31 record that could be confirmed this run were applied and the edited passages re-read: the scipy tie citation (documentation opened this run), the n=4 rung arithmetic (recomputed), the n=3 subtraction premise and the variance-of-a-mean attribution. Still owed: a source for cohort-minimum-size's 'sample counts in the tens'. Other documents are byte-unchanged. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "With four peers, a subject at 3 of 4 (75%) moves to 80% or 60% when one peer joins, and a subject at 1 of 4 (25%) drops to 0% when the one peer below it leaves: the largest single-change move is one rung (25 points), not two.",
    "scipy.stats.percentileofscore([1,2,3,3,4], 3) returns 70.0 under the default kind='rank'; strictly-below plus half the ties is 60.0, which is kind='mean'.",
    "At n=3 with only a position released and no aggregate, a participant who knows two peers' scores learns an interval for the third, not its value; subtraction needs a released mean or total.",
    "A public register of individually labelled ratings can keep pre-bump rows qualified rather than excluded without corrupting any position claim (retained from the 2026-10-01 deepen)."
  ],
  "sources": [
    {
      "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.percentileofscore.html",
      "result": "Opened 2026-10-31. Default is kind='rank': 'Average percentage ranking of score. In case of multiple matches, average the percentage rankings of all matching scores.' 'mean': 'The average of the \"weak\" and \"strict\" scores'. Examples: percentileofscore([1, 2, 3, 3, 4], 3) -> 70.0 (rank), strict 40.0, weak 80.0, mean 60.0; percentileofscore([1, 2, 3, 4], 3) -> 75.0. Refutes the technique's statement that the default returns strictly-below plus half the ties."
    },
    {
      "source": "Arithmetic of the n=4 ladder (golden path and cohort-minimum-size)",
      "result": "Joining moves k/4 to k/5 or (k+1)/5, at most 20 points; leaving moves k/4 to k/3 or (k-1)/3, at most 25 points. One rung, not two."
    },
    {
      "source": "Existing applications",
      "result": "Cite a private tree at its 2026-10-01 reading; not reopened, nothing re-executed, verification dates unchanged."
    }
  ],
  "documents": {
    "peer-benchmarking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'one new joiner could move it two rungs' now reads 'one new joiner or leaver could move it by as much as a whole rung', matching the recomputed n=4 arithmetic."
    },
    "techniques/comparability-filters.md": {
      "disposition": "keep",
      "reason": "Engine and version provenance, unknown-excluded, both-sides predicate, filter-then-pick inside the cap, excluded-not-deleted, and the position-claim scope of 'rank within versions' added 2026-10-01 are coherent and match the golden path."
    },
    "techniques/cohort-minimum-size.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: 'moves the reader two rungs' now 'can move the reader by as much as a whole rung - 25 points'; the n=3 leak now says subtraction is 'from any released average or total'. Still owed: 'Published guidance ... converges on sample counts in the tens' names no source; cite one or soften it (no source confirmed this run)."
    },
    "techniques/corpus-tenancy-boundary.md": {
      "disposition": "keep",
      "reason": "Per-row membership at assembly, re-assertion on every hop, the declared asymmetry against comparability filters, withdrawal, distribution-not-rows, the bounded read as a sampling decision, and operator rollups as a separate door are all stated with decision rules and smells."
    },
    "techniques/population-vs-scalar-ranking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the mid-rank is now attributed to scipy's kind='mean', with the default kind='rank' described as averaging the matching scores' percentage ranks (70 vs 60 on the documented tie example; equal to at-or-below with no tie), check date moved to 2026-10-31; 'that is what the central limit theorem says' replaced by the variance of a mean of n independent items being the item variance over n."
    },
    "techniques/basis-disclosure.md": {
      "disposition": "keep",
      "reason": "Five-field basis, basis in the result type, travelling forms, policy-not-count suppression and the table-scope exemption are consistent with the golden path and the cohort technique."
    },
    "applications/node--comparability-filters.md": {
      "disposition": "reverify",
      "reason": "Line-cited claims about a private tree read on 2026-10-01; the tree was not reopened. The stale-rubric qualifier treatment is consistent with the technique's scoped rule."
    },
    "applications/node--population-vs-scalar-ranking.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened. Also owed on reverify: the application reports percentileOf uses a 'fraction-at-or-below' convention, which is the non-conservative tie form the technique advises against for quoted 'beats X%' claims, and the application does not say so."
    },
    "applications/sql--corpus-tenancy-boundary.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened. The three doors (benchmark corpus, public register, operator rollup) match the technique's invariants as described."
    }
  }
}
```
