---
layer: technique
type: technique
subject: money-page-conversion-craft
technique: diagnostic-quadrant-clicks-leads-impressions
status: forged
laws: [statistical-honesty-before-a-verdict, platform-reported-is-not-causal, not-measured-is-not-zero]
shared_with: []
use_when: [a page is underperforming and nobody has said what kind of underperforming, deciding whether to touch the page or the campaign, triaging a client's "the website does not work" complaint]
---

# The diagnostic quadrant: clicks, leads, impressions

Before any conversion work begins, four numbers say which problem the page
has - or whether the page has a problem at all. The quadrant reads
impressions, clicks, conversions and lead quality, and routes to one of four
owners. Its value is that it stops the most common wrong move: rebuilding a
page whose real defect is upstream of it.

## The four cells

**Many clicks, no conversions - the page.** Visitors are arriving and
leaving. Work the leak order top to bottom; nothing else is the first move.

**A good conversion rate, junk leads - the source.** The page is converting
the people it is shown to; they are the wrong people. The query, the
audience, the placement or the match type is the problem, and the deeper read
belongs to `lead-quality-and-source-diagnosis`. Improving the page here
produces more of the wrong leads faster.

**Few clicks at decent impressions - the title and description.** The page
is being shown and not chosen. The promise in the result is weak or
mismatched; the fix is the snippet, which `on-page-and-metadata-craft` owns.
The search-performance console's read of impressions rising with clicks flat
is the same cell seen over time.

**Few impressions - bids, budget or volume.** Nothing on the page can fix a
page nobody is shown. On paid traffic the bid or budget is capping delivery;
on organic traffic the page is not ranking or the query has little volume. The
audit that separates those is upstream of this subject.

## Procedure

1. Pull the four numbers for the page over a weekday-balanced window - at
   least two full weeks, longer for a small business - from the platform that
   sent the traffic and the tracker that counted the conversions.
2. Confirm the conversion count is real: the event fires on the thank-you
   page load, the page is not indexed, the redirect follows a successful
   hand-off. A quadrant read on a broken count places the page in the wrong
   cell every time.
3. Compute the click-through rate and the conversion rate; ask the business
   whether the leads that arrived were worth having.
4. Place the page in one cell. Where the numbers are too few to distinguish
   cells - a handful of clicks, one or two conversions - the read is "too few
   to place", and the action is to wait or to widen the window, not to guess.
5. Route to the owner of that cell and stop. Do not fix two cells at once;
   the second fix is unmeasurable against the first.

## What the read inherits

The quadrant reads platform-reported counts and carries their limits. A
"click" is what the platform billed, an "impression" is what it chose to
count, a "conversion" is whatever the tracker fired. The cells are a
descriptive triage, not a causal claim, and a practitioner who acts on one
says so. A missing number - conversions before tracking was wired, impressions
from a source that never reports them - is absent, not zero; a page with no
conversion data does not sit in "no conversions", it sits in "not measured".

## Decision rules

- When clicks are many and conversions are zero, check the tracking before
  the page, because a silent tracking break produces exactly this cell and no
  amount of page work cures it.
- When the conversion rate is fine and the owner says the leads are junk,
  believe the owner over the rate and route to the source, because the rate
  cannot see lead quality and the owner can.
- When impressions are decent and clicks are few, do not touch the page body;
  change the title and description and re-read after the next window, because
  the page is not the thing being judged.
- When the sample is too thin to place the page, say "too few to read" and
  name what would change it - the number of clicks, the number of weeks - so
  the refusal is a plan rather than a dead end.
- When a page sits in two cells at once - few impressions *and* no
  conversions - fix the upstream cell first, because the downstream read is
  made on visitors that the upstream fix will change.

## When NOT to use

- As a substitute for an experiment. The quadrant says where to look; it
  never says a change worked. That verdict belongs to
  `landing-page-experiment-statistics`, with its sample floor and correction.
- On a page whose conversion is off-site - a phone call, a marketplace order -
  unless call tracking or the marketplace's reporting supplies the conversion
  column. Without it the page can only be placed by impressions and clicks.
- For a hub or index page. It has no conversion to count; its numbers are
  read for the pages it links to.
- During the first days after a page launches or a campaign changes. The
  numbers are partial buckets, and a partial bucket is flagged, not compared.
