---
layer: technique
type: technique
subject: search-intent-classification
technique: local-and-comparison-as-own-intents
status: forged
laws: [the-results-page-is-the-verdict]
shared_with: []
use_when: [designing or reviewing an intent taxonomy, a near-me or in-city query is about to be routed to a service page, a best-of or versus query is about to be filed as informational]
---

# Local and comparison are intents of their own

The academic taxonomy has three categories and a practitioner needs five. The
two additions are not refinements of the three; each names a query that is won
by a page type none of the three describes, and a taxonomy without them routes
those queries to pages that cannot win them.

## Local is not transactional with a place attached

A near-me query, an in-city query, a "book", "opening hours", "branch",
"contact" query is a person looking for a provider close to them, now. The
engine's own rater taxonomy calls this visit-in-person and lists it beside know,
do and website as a category, not as a modifier. On the results page it shows
as a map pack with business-profile cards, and those cards are the results the
searcher uses.

What wins a local query is local presence: a verified, complete business
profile; a page for that locality; consistent name, address and phone across
citations. A national service page, however well it converts, is not in the map
pack and is usually not in the organic top three below it either. So a local
verdict routes to a local page and a profile task, and a transactional verdict
routes to a service page, and the two are never the same address. The order of
checks matters: a query carrying both a booking verb and a place is local, not
transactional, because the place decides which page can win.

Where local pages live without becoming doorways is a separate subject; this
technique only guarantees the query reaches it.

## Comparison is not informational with a superlative attached

Best-of, versus, alternative-to, review-of, price-of. The category has no
academic origin - it is an industry addition to the 2002 three - and it is kept
because the page that wins it is different. A comparison query is answered by a
comparison page or by an article built to convert: criteria side by side, a
verdict, a recommendation, the money page linked from every section. It is not a
service page, because the searcher has not chosen yet and a service page asks
them to. It is not an ordinary guide, because the searcher is one step from
choosing and an article that teaches without recommending wastes the step.

A classifier that lists "best", "versus", "review", "comparison" and "test"
among its informational markers has made the fold explicit: every comparison
query becomes a guide, the highest-value article a business can write is filed
as an ordinary one, and the money page loses the links it would have earned
from every section. The fold is common because comparison pages look like
articles in a content system. They are the articles that convert.

Inside comparison the shape varies by sub-intent, and a brief carries it: a
versus query wants head-to-head criteria and a when-to-choose-which; an
alternative query wants a roundup plus a migration angle; a price query wants
the components of the price, hidden costs and for-whom-it-pays; a review query
wants strengths, weaknesses and a verdict. What the brief says beyond that is
the composition subject's.

## Procedure

1. **Check the taxonomy has five buckets**: informational, transactional,
   comparison, local, navigational. Fewer means two of them are folded and one
   page type is unreachable.
2. **Check the local markers are matched before the transactional ones**, so a
   query with both a buying verb and a place lands in local.
3. **Check the comparison markers are their own list**, not entries in the
   informational one.
4. **On the results page, read the map pack as local and the best-of roundups
   as comparison**, whatever the phrase said.
5. **Route by bucket**: local to a locality page and a profile task,
   comparison to a comparison page with the money page linked, transactional
   to the money page, informational to a routed article, navigational to
   nothing.

## Decision rules

- When a query carries a place or a near-me signal, classify it local before
  any other check, because the page that wins it is decided by the place.
- When a query carries a best-of, versus, alternative, review or price-of
  signal, classify it comparison and never informational, because the fold
  loses the converting article.
- When a taxonomy has only three or four buckets, treat its labels on local
  and comparison queries as unverified, because the bucket that should hold
  them does not exist.
- When a business has no locality and no comparable competitors, the two
  buckets still exist in the taxonomy and simply stay empty, because a bucket
  removed is a fold waiting to happen on the next client.

## When NOT to use

- To classify a brand query with a place in it. "Brand near me" is
  navigational-local and the answer is the business's own profile, not a new
  page.
- To force a comparison page where the business cannot name a comparable. A
  comparison page with invented competitors breaks the proof law; the verdict
  stays comparison and the page waits for real names from the owner.
- As the whole verdict. The bucket is read off the results page like every
  other; the technique adds buckets, it does not replace the count.
