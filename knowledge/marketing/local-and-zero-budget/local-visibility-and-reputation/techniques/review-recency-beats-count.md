---
layer: technique
type: technique
subject: local-visibility-and-reputation
technique: review-recency-beats-count
status: forged
laws: [not-measured-is-not-zero, label-convention-as-convention, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [rolling reviews into a health figure, comparing a business's reviews with competitors', deciding whether a review profile is stale]
---

# Review recency beats count

A review profile is read as a *rate*, not a total. Sixty reviews arriving at four a
month beats two hundred with none in a year: to a customer the stale profile reads as
a business that may no longer be trading, and to an engine it is a signal that has
stopped. This technique defines review health as recency and velocity first, sentiment
trend second, count last - and says which of those footings is measured and which is
convention.

## What the evidence actually says

The broadest current practitioner survey - forty-seven local search specialists
scoring 187 factors, published for 2026 - ranks a high numerical rating sixth among
pack inputs, the quantity of native reviews with text ninth, review recency eleventh
and a sustained inflow over time (rather than bursts) fourteenth. It places the presence
of owner replies far down the list, past the hundredth factor. Two honest readings
follow. First, the survey does *not* literally put recency above count; count still
ranks higher as a factor. Second, the group of review signals as a whole grew in weight
between editions and is the second-largest group after the listing itself.

So "recency beats count" is stated here as **practitioner convention about staleness**:
a total cannot repair a stopped signal, and a steady inflow outranks a burst of the
same size. The convention is defended on the reader's behaviour - the next customer
reads the last five reviews and their dates - more than on the algorithm's, and it is
labelled as convention wherever it appears.

## Procedure

1. **Require a date per review.** A review without a parseable date is dropped from
   health, because every figure below is a function of when. An ambiguous date is
   refused, not guessed (see the decline technique's date policy).
2. **Count the trailing window.** Reviews in the last ninety days, for the business
   and for each named competitor side by side. Ninety is convention.
3. **Compute velocity.** Reviews per month over the window, compared with the previous
   window of the same length. A velocity that fell to zero from something is the
   *staleness alarm*, and it is a first-class finding, not a footnote.
4. **Compute the sentiment trend.** Order the window's reviews by age, split into an
   older half and a newer half (with an odd count the middle review sits in both, so a
   three-review window still yields two comparable bands), and compare each half's
   positive share - four and five stars - as up, down or flat. Deterministic; no
   smoothing. A window of fewer than two reviews is flat by definition, and says so.
5. **Compute reply health.** Reply rate is answered over total. Where the reply's
   timestamp was never stored, report the median *age* of the answered reviews as a
   lower bound on how long they waited, labelled as a proxy - never as a response
   time.
6. **Then the count and the rating.** Total reviews, review-weighted average rating.
   Present these last and beside the rate, never alone.

## Decision rules

- **When the trailing-window count is zero and the previous window was not, raise the
  staleness alarm above every other review finding, because a stopped signal is the
  one failure a count cannot hide from a reader** and the one a total most effectively
  hides from an owner.
- **When comparing with competitors, compare recency and velocity first, then rating,
  then count,** in that order on one table; a competitor with fewer reviews and a
  faster rate is the one to worry about.
- **When the reply rate is below half, mark reply health red;** the half is
  convention. Frame the finding for the reader, not the ranking: the survey ranks owner
  replies low as a factor, and the reason to reply is the customer reading the thread.
- **When the newer half's positive share is below the older half's, report a
  downward sentiment trend and name the newest negative reviews,** because the trend is
  only actionable through the reviews that made it.
- **When a rating average is computed across locations or areas, weight it by review
  count;** an unweighted mean of per-location averages lets a two-review location
  move the figure as much as a two-hundred-review one.

## Thin windows

A window of five reviews supports a count and a list, not a rate. Below a handful -
convention, roughly ten in the window - present the reviews themselves with their dates
and withhold the velocity percentage and the trend arrow. "Three reviews this quarter,
here they are" is honest; "velocity down 40%" over three is a coin flip with a badge.

## When NOT to use

- **On a profile with no dated reviews.** Nothing here computes; report the count,
  labelled as undated, and ask for a dated export.
- **To judge a single review.** Recency is a property of the profile; a single old
  review is neither stale nor fresh, it is a review.
- **As a review-acquisition plan.** Knowing the profile is stale is this technique's
  output; how the business earns reviews, and the platform rules on asking, belong to
  the listing subject.
- **Across platforms.** A review count on a marketplace and one on the map engine are
  different populations; compute health per platform and never sum them.
