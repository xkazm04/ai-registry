---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: serp-overlap-same-page-test
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention]
shared_with: []
use_when: [deciding whether two keywords are one page or two, folding a new term into an existing map, choosing a clustering method for a keyword pull]
---

# The results-page overlap test for "one page or two"

Two keywords go on one page when the engine answers them with substantially the same
results, and on two pages when it does not. That is the whole test, and it is the only
clustering method that uses the engine's own judgment as the answer key. Search both
terms, compare the top ten, count the shared URLs. A high count means one intent and
one page; a low count means two. Word similarity, a tool's semantic grouping, a shared
head noun - all of these are hints, and every one of them is wrong in the case that
matters, because embeddings are intent-blind: they group "how to roast coffee" with
"buy roasted coffee" while the engine returns entirely different result sets.

The evidence for the method over its rivals is a head-to-head of seventeen clustering
tools on one 216-keyword set, where results-page-based tools scored roughly 70-89 out
of 100 on cluster quality against 33-47 for semantic tools and 11-35 for string
matching. The practitioner consensus that has settled since is a two-speed rule:
semantic grouping to move fast through a large pull, and a results-page check before
any page is published or any URLs are consolidated on the strength of the grouping.

## The threshold is a convention, and the test says so

Four or more shared URLs in the top ten means one page. Zero to two means separate
pages. Exactly three is a grey zone decided by hand, never automatically. **The four
is a vendor default, not a finding.** No study establishes any overlap threshold; tools
ship anything from three to a one-to-nine slider to a hidden number, and one
recommends four to six while calling two or three too inclusive. Four is used because
it matches the most common shipped default. A document that uses this test writes the
threshold down as a convention, per
[label convention as convention](../../../_laws.md#label-convention-as-convention).

The threshold has a second weakness: results pages are not deterministic. The same
query checked repeatedly from the same location returns different results with no
underlying change, and one-to-three-position moves are constant background noise. A
pair sitting exactly at the threshold on one snapshot is a coin flip. So a borderline
pair is flagged for a person, and if the decision matters - a money page, a
consolidation - the query is checked twice on different days before the count decides.

## Procedure

1. **Only test plausible collisions.** Same head noun, same intent, same city. Testing
   sixty new terms against forty existing rows is two thousand four hundred searches
   nobody runs; testing the handful that share a subject is a dozen and catches
   essentially all of it.
2. **Cheap pass first.** Is the new term already a secondary on an existing row? Then
   that page covers it; say which row owns it and stop.
3. **Search both terms** from the target country and language, and compare the top ten
   organic results. Count shared URLs, not shared domains.
4. **Apply the verdict.** Four or more: fold the new term in as a secondary of the
   existing page and record the count. Zero to two: a separate page. Three: hand
   decision, written down with its reason.
5. **Split on shape even when the count is high**, when the results demand a different
   format (recipes versus buying guides) or the ranking pages have a very different
   authority profile - one documented case splits on the same words because one
   variant's results averaged far higher authority and hundreds more referring domains.
   Same words, different competitive game.
6. **Use hard clustering for page decisions.** Every keyword in a cluster must share
   results with every other; soft clustering, where members need only share with one
   neighbour, is for exploratory topic maps. Hard produces fewer, tighter clusters and
   more ungrouped leftovers, which is exactly right when the output is a page.

## Decision rules

- **When a term folds into an existing page, say so as a win,** because the page that
  did not get built is the most valuable line in the run.
- **When the count sits at the threshold, a person decides and the reason is written,**
  because a single snapshot at the boundary is noise.
- **When volume and the count disagree - a high-volume term whose results have a
  different shape - intent wins and the term gets its own page,** because naming a
  cluster after its biggest member is a labelling convenience, not an intent judgment.
- **When a clustering tool's output is the only evidence, treat it as a draft,** because
  a semantic grouping has never seen a results page.
- **Re-run the test annually and after any major ranking update,** because a
  fifteen-month tracking study of 37,000 keywords found roughly one in six changed
  intent cumulatively - and 39-51% of those changes later reverted, so a knee-jerk
  rewrite is as risky as ignoring the shift.

## When not to use this

Do not run the test on synonyms. Word-order flips, spelling variants and brand renames
are one query already; the engine resolves them to one page and the test only wastes
searches confirming it. Do not use it to decide intent - that is a different reading of
the same page, owned by `search-intent-classification`, and a pair can share seven
results and still both be misfiled as money pages when the results are guides. Do not
use it across countries or languages: a shared result set in one market says nothing
about another. And never resolve a low-overlap-but-suspicious pair by narrowing the
second page's angle to justify it - if the engine shows the same results, it is one
page, and "more specific" is how doorway-adjacent duplicates enter a map.
