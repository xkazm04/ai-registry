---
layer: technique
type: technique
subject: answer-engine-visibility
technique: weight-the-map-toward-transactional-and-local
status: forged
laws: [the-results-page-is-the-verdict, label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [building or refreshing a keyword map after AI answers appeared on the results page, ordering the build queue for a local service business, explaining to a client why the map has fewer articles than last year]
---

# Weight the map toward transactional and local

The keyword map is reweighted per query type, not discounted across the board,
because the AI answer box takes clicks from informational queries and largely
leaves alone the queries where a searcher intends to hire, buy, book or visit.
Vendor tracking over the last two years puts the answer-box trigger rate at
roughly a third of informational queries against single digits for commercial
and transactional ones; the click-through loss on boxed queries has been
measured at over half by one 3,119-term study and has since moved with every
layout change. The technique fixes the ordering, never the percentage.

## Procedure

1. **Classify each candidate by observed answer-box presence, not by intent
   label.** Search the query, note whether an AI answer is shown and, if it is,
   which domains it cites. Do this on the live results page - the intent label a
   tool assigns predicts the box poorly, and the box itself is the fact that
   matters. Record three values per keyword: `box: yes/no/sometimes`,
   `cited: us/competitor/none`, `checked-on: date`.
2. **Sort into four tiers.** Money query with no box; money query with a box
   the business is cited in or can plausibly be; informational query where
   citation is realistic (the business has original data on it, or an existing
   page already ranks); informational query with a box and no citation path.
   The tier, not the volume, sets the build order.
3. **Apply the tier to the forecast column, not just the order.** A tier-one
   term keeps whatever ordinal traffic estimate the map was using. A tier-four
   term's traffic column is blanked - not zeroed, because zero is a verdict -
   and its "reason retained" column says what job it still does, or it is
   quarantined by when it becomes useful.
4. **Name the skew in the report.** If more than half the map's volume sits in
   tiers three and four, the report says so in its first paragraph, in these
   words or plainer: the clicks on these queries are largely taken by the
   answer box and these pages are being built for coverage and citation, not
   traffic. A map that skews informational and does not say so is the most
   common way this subject's knowledge fails to reach the client.
5. **Re-check the box column on the map's refresh cadence.** Box presence per
   query changes with engine layout and by market; the reweighting is dated
   like every other verdict read off the results page.

## Decision rules

- When the business is local service, weight the map toward hire, book, quote,
  emergency, near-me and city-plus-service terms first, because those are the
  queries the box does not answer and their click behaviour is closest to what
  it was before; this is a directive for a local business, not a nuance.
- When a money query does show a box, keep it in tier two rather than dropping
  it, because a cited brand under a box measurably outclicks an uncited one on
  the same query, and the page that would rank is the page that gets cited.
- When an informational query has a box and the business holds no original
  data on the topic and no page already ranks for it, place it last and blank
  its forecast, because neither the click nor the citation is realistic and a
  forecast built on it is a fabricated number.
- When the map is for an information site rather than a service business,
  run the same procedure and expect the opposite proportion; the technique
  does not change, the report does.
- When a percentage is needed in the report, quote it with its source class
  and its date - "a 2025 vendor study of 3,119 terms measured X; the same
  tracker's 2026 update measured Y" - never as a property of the engine.

## What the numbers are and are not

The trigger-rate gap between informational and transactional queries is the
robust finding; it has been replicated by several trackers on different
samples and matches the mechanics (a summary cannot do the job of a hire). The
click-through magnitudes are vendor measurements over samples the reader did
not choose and they moved by a factor of two within months. The "cited brand
outclicks uncited" lift is a vendor correlation over an unstated sample. None
of these becomes a constant in a prompt, a template or a spreadsheet; they are
quoted, dated and sourced where they appear.

The four-tier split itself is practitioner convention. A team may collapse it
to three or expand it; what is not convention is that the split is per query
and observed on the live page.

## When NOT to use

- When the market's dominant engine does not show AI answers for the business's
  language or country yet. Check ten money queries and ten informational ones
  first; a reweighting applied to a results page that has not changed removes
  good informational pages for no reason.
- When the map is for paid search. Paid click behaviour under the box is a
  separate measurement with its own numbers, and the ad platform's own reporting
  is the readout there.
- As a reason to delete informational pages already ranking. A ranking page is
  a citation candidate and a link source; the technique orders what is built
  next, and deletion is a recommendation awaiting a yes under the gate that
  governs every deletion.
