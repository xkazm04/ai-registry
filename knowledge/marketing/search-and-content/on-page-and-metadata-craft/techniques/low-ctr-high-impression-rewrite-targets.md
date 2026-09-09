---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: low-ctr-high-impression-rewrite-targets
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero, platform-reported-is-not-causal]
shared_with: []
use_when: [deciding which pages get a title and description rewrite, reading a search-performance export for on-page work, judging whether a rewrite worked]
---

# Low-click, high-impression rewrite targets

The pages worth a metadata rewrite are found in the platform's search-performance
console, not in the audit. A page the engine already ranks in the middle of the first
page, shown thousands of times, and clicked at a rate well below what that position
earns, is a page whose title and description are the bottleneck. Everything else the
audit flagged is a floor to sweep; this is where a rewrite pays.

## The signal and its reading

Export the performance report by page, over the last three months, with impressions,
clicks, click-through rate and average position. Filter to pages with average position
in a band the reader chooses (practitioners use roughly four to eight: ranked, visible,
not yet chosen), sort by impressions descending, then look at click-through against the
position's expectation. Published position curves are aggregates - one 2025 aggregate
put the first result near 28 percent and the tenth near 2 - and the page's own query mix
sets its real expectation: a query with an AI answer box, a shopping carousel, a local
pack or a video block above the organic results sits on a curve a fraction of the
aggregate. "Low" is judged against comparable queries on the same site, or against the
page's own earlier window, never against the global table alone.

Two other console shapes belong to this technique. Impressions rising while clicks stay
flat means the engine is testing the page and humans are not choosing it: titles, not
rankings, are the bottleneck. And a page with impressions and *no* recorded clicks is
a page with zero clicks, which is a verdict; a page the console never reported is not a
zero and is not a target.

## Procedure

1. Ask for the export before grading anything, with the click path spelled out; the
   console readout is a requirement of the report, and the audit without it is
   inference and says so on every affected line.
2. Filter and sort as above. Cap the batch at what the owner can review - a handful of
   pages per pass - and rank by impressions times the click gap, so the largest wasted
   exposure comes first.
3. For each target, record the baseline: the last 28 days of clicks, impressions,
   average position and the top five queries with their positions, verbatim from the
   console. No baseline, no rewrite - the after cannot be read without it.
4. Rewrite the title to answer the top query directly and add specificity, and the
   description to front-load the keyword and one concrete deliverable, under
   `ctr-lifts-as-tie-breakers-not-a-stack`. Change nothing else on the page, so the read
   is about the metadata.
5. Request a recrawl and book the after-read for a window practitioners put at two to
   four weeks, on a weekday-balanced window of equal length to the baseline. Fill in the
   delta from the console, not from memory.
6. Report the read as descriptive. A before/after around a title change is a
   description, not an experiment; the engine ran its own tests in the same window. A
   causal claim needs a split - half the pages of a template rewritten, half held - and
   a sample the sample-size rule accepts.

## Decision rules

- When a page is ranked below the band, do not rewrite its metadata for clicks, because
  impressions there are too few to read and the page's problem is ranking, which is
  content and links, not the head tags.
- When a page has high impressions and high click-through but low conversion, it is not
  this technique's target, because the metadata did its job and the page failed; route
  it to conversion craft.
- When the after-window contains a known engine update or a site change, mark the read
  as confounded and extend the window, because a delta that includes the update
  measures the update.
- When the console export is not supplied, run the audit without this layer and print
  the words "not measured" on its line, because a blank line reads as covered.

## Conventions, labelled

The positions-four-to-eight band and the two-to-four-week read window are practitioner
convention. The position click-through curve is a published aggregate and the page's own
history outranks it. The "impressions rising, clicks flat" reading is a practitioner
heuristic; the console documents what it measures, not what a flat line means.

## When NOT to use

- A site with no verified console property: that absence is the finding, near the top of
  the report, and it routes to setup rather than to rewrites.
- Pages whose queries are dominated by brand searches, where click-through is high by
  nature and a low reading means the brand's own listing is splitting clicks with a
  business profile or a sitelink.
- Reading a rewrite after three days, or over a window that is not weekday-balanced
  against its baseline.
