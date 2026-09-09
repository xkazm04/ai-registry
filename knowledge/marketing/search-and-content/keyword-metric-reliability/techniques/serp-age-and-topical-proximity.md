---
layer: technique
type: technique
subject: keyword-metric-reliability
technique: serp-age-and-topical-proximity
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention]
shared_with: []
use_when: [judging whether a new site can win a root keyword, choosing between an adjacent term and a bigger isolated one, a difficulty score looks winnable but nothing new has ranked in years]
---

# Results-page age and topical proximity

Two signals predict whether a new page can enter a top ten better than any difficulty
score, and both are measured rather than modelled. One is read off the live results
page; the other is read off the site's own search-performance console. Neither is a
vendor metric, which is why they are cheap and why tools do not surface them.

## The age of the current top ten

A vendor study across 1.3 million queries in one national market found that 72.9% of
top-ten pages were more than three years old and that the average page at position one
was about five years old; the same vendor's 2017 study had put the over-three-years
share at 59%. In the same work, only 1.74% of pages published within a year reached the
top ten inside that year, down from 5.7% in 2017. Incumbency has been getting stronger,
and a difficulty score - a link count - does not express it.

The reading is simple. A results page whose youngest entrant is several years old is
telling you the incumbents are not being displaced, whatever their link counts. A
results page with a page published this year in the top five is telling you the engine
is still willing to admit newcomers on this query - an opening that a difficulty score
of 55 would have hidden.

## Topical proximity

A study across a dozen sites of how quickly newly published pages earned their first
impression and first click found that pages on topics the domain already ranked for
reached a first click materially faster - on the order of 35-40% within three weeks
against about 20% for topics unrelated to existing coverage - and reached impression
milestones faster across the board. The mechanism the engine has confirmed is
narrower than the folklore: strong existing coverage makes new adjacent pages *visible
sooner*. No engine has published a "topical authority" score and no vendor metric
measures one; the thing that is measured is time to visibility.

The reading: a keyword adjacent to what the site already ranks for beats an isolated
keyword with higher volume, and the check is a query against the site's own console for
neighbouring terms - does anything on this domain already earn impressions in this
neighbourhood - not a vendor's authority figure.

## Procedure

1. **For every root that survives the cuts, open the results page** and record the
   publication or last-updated date of each top-ten result. Note the youngest entrant
   and its position. Where dates are absent, the archive of the web usually has the
   first capture.
2. **Classify the page's age profile**: churning (a newcomer in the top five inside a
   year), open (a newcomer in the top ten inside two years), locked (nothing under three
   years). Write the class beside the difficulty score.
3. **Query the site's console for the root's neighbourhood** - the root, its modifiers,
   its sibling services - and record whether the domain has any impressions there.
   Adjacent means the domain already appears for something in the family; isolated means
   nothing.
4. **Order the map's build sequence by the pair**: churning-and-adjacent first,
   locked-and-isolated last, with difficulty and volume as tie-breakers only.
5. **Re-read at each refill.** A locked page opens when a core update churns it; an
   isolated term becomes adjacent once the first neighbour ranks.

## Decision rules

- When the results page is locked, treat the root as above the ceiling whatever its
  difficulty score, because the score counts links and cannot see that nobody has
  displaced an incumbent in three years
  ([the results page is the verdict](../../../_laws.md#the-results-page-is-the-verdict)).
- When the results page is churning and the site has adjacent coverage, build the page
  even if difficulty sits somewhat above the ceiling, and say on the map which two
  signals overrode the convention.
- When choosing between an adjacent term and a larger isolated one, take the adjacent
  term first, because measured time to first click favours it and volume is a bucket.
- When a "topical authority" number from a vendor is offered as the proximity signal,
  refuse it and use the console query; the measured thing is visibility speed, and the
  vendor figure is not that ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- When a results page is dominated by a result feature - an answer box, a map pack -
  read age within the organic results beneath it, and hand the feature question to the
  answer-engine and local subjects.

## Convention, labelled

The class boundaries above - one year, two years, three years; top five versus top ten -
are practitioner conventions chosen to sit around the measured distribution. The
measured facts are the age shares and the first-click rates; the cut points are ours.

## When not to use this

Do not read age on queries with freshness intent - news, events, this year's prices,
software versions - where the engine rotates results deliberately and an old top ten
is a signal of a stale query, not a locked one. Do not read age on the map pack or on
business-profile results, which rank by proximity, reviews and category rather than by
page. Do not use proximity as a reason to write near-duplicates of pages that already
rank; adjacency is a reason to extend coverage into a neighbouring question, not to
target the same one twice, and the cannibalisation gate in the architecture subject
governs that.
