---
layer: golden-path
type: golden-path
subject: on-page-and-metadata-craft
status: forged
use_when: [writing or grading a page's title, description, headings and markup, running an audit or fix pass on a page somebody else wrote, choosing which pages to rewrite from console data, deciding which structured-data type a page kind should carry]
techniques:
  - primary-keyword-triple-placement
  - title-and-meta-pixel-budget
  - ctr-lifts-as-tie-breakers-not-a-stack
  - low-ctr-high-impression-rewrite-targets
  - structured-data-by-page-kind
  - mechanical-layer-only-never-the-copy
---

# On-page and metadata craft

This subject owns the mechanical layer of a page: the layer a search engine reads
before, beside and instead of the prose. Title tag, meta description, the slug, the
heading tags, the canonical, the share-preview tags, the alt attributes, the
structured-data graph, and the placement of one primary keyword across those slots.
It also owns the discipline of touching that layer without touching the copy, and the
console-driven choice of which pages deserve a metadata rewrite at all.

It does not own what the page says. Which keyword a page is built for belongs to
`search-intent-classification` and `keyword-metric-reliability`; where the page sits
in the site and which hub links to it belongs to `site-architecture-and-topic-clusters`;
the answer blocks, tables and citation-earning body structure belong to
`answer-engine-visibility`; the brief, outline and article body belong to
`content-brief-and-article-composition`; and whether a templated local page is a doorway
belongs to `local-page-doorway-prevention`. When a reader needs to change a sentence,
they have left this subject.

## The layer and its two readers

A page has three audiences and the mechanical layer serves two of them. The human reads
the body. The crawler reads the head, the tag structure and the markup, and forms its
own view of what the page is about before the body is weighed. The results page then
shows a third artefact, the snippet, that is assembled from the head tags *when the
engine agrees with them* and rewritten when it does not. A principal practitioner holds
three things true about this arrangement:

**The head tags are a proposal, not a command.** The engine rewrites the title it shows
in a majority of cases - a 2023 study of roughly eighty thousand titles put it at 61
percent, a first-quarter-2025 analysis of thousands of queries at 76 percent - and
rewrites the description on the order of two thirds of the time. The same studies say
what survives: titles between 30 and 60 characters were shown unchanged in about 85
percent of cases, and a title that says the same thing as the page's H1 was rewritten
roughly a fifth as often as one that does not. So the craft is not "write the title the
engine must show" but "write the title the engine has no reason to replace": front-loaded
on the query, agreeing with the H1, inside the width the results page can render.

**The engine cuts by pixels and the checklist counts characters.** A title is truncated
when its rendered width exceeds a column, not when its character count exceeds a number;
a title of wide capitals and the letter m overflows where a title of narrow letters fits
with room to spare. Character limits are the portable approximation and every checklist
carries one because a prose writer cannot see pixels. The honest tool renders the text
in the results page's approximate typeface and reports width; the honest checklist says
its number is a proxy and gives the pixel budget beside it. See
`title-and-meta-pixel-budget`.

**Click-through is bought with specificity, and the lifts do not add.** At a fixed
position a better title moves clicks by tens of percent, and there are measured patterns
that help: a bracketed modifier, a numeral, the current year, a direct question. Every
one of those studies compared titles with one device against titles without it. Stacking
all of them produces a title the reader recognises as bait, which the engine both
rewrites and, on the evidence of the bounce, deprioritises. The lifts are tie-breakers
between two honest variants, never a formula. See `ctr-lifts-as-tie-breakers-not-a-stack`.

## Keyword placement is a covenant with the crawler, not a density

The single load-bearing rule of placement is that one primary keyword, in the phrasing
the searcher uses, appears once in each of a small fixed set of slots: the title, the
description, the H1, and the opening of the body (the first heading or the first hundred
words). Once, because the slots are a signal of topic, not a vote counted by repetition.
Beyond those slots the keyword's variants appear where the sentence would have used them
anyway; a page that repeats its head term in every heading reads as written for the
crawler and is graded that way by the rater guidelines the engine publishes.

The corollary a checklist misses is that the slots must agree with each other. A title
built for one phrasing, an H1 built for another and a description for a third give the
engine three proposals and it picks its own. The triple placement technique exists to
make the three slots say one thing, and the H1 agreement is the same rule from the
rewrite-rate side. See `primary-keyword-triple-placement`.

## Which page to rewrite: the console decides, not the checklist

An on-page audit grades every page against the same list, and a site of sixty pages
returns sixty scorecards with hundreds of failed items. The audit does not know which
of those failures cost anything. The platform's search-performance console does: a page
sitting at positions four to eight, with impressions in the thousands and a click-through
rate well under what that position earns on average, is a page the engine already ranks
and humans are already declining. That is the rewrite target - the title and description
are the bottleneck, not the rankings - and it is found by sorting the console export,
not by reading the audit.

The reading has two honesty conditions. Position-average click-through curves are
published aggregates (one 2025 aggregate put the first result at roughly 28 percent and
the tenth at roughly 2), and a query that triggers an AI answer box or a shopping
carousel sits on a different curve; "low" is judged against the page's own query mix,
not the global table. And a rewrite is read after two to four weeks on the same
weekday-balanced window, because impressions swing with the engine's own tests; a
before/after read on a three-day window is a description of noise. See
`low-ctr-high-impression-rewrite-targets`.

## Structured data is typed by what the page is

The markup layer is where the domain's folklore accumulates fastest. Two rules survive.
First, the type follows the page kind: an article carries an article node with a real
author entity, a business page carries the organisation or local-business node with the
name, address and phone exactly as they appear everywhere else, a product carries a
product node with the offer the page actually shows, a proof page that publishes a
measured series carries a dataset node whose variables are the numbers on the page. A
type the page does not embody is decoration at best and, where it claims a review, a
rating or an answer the page does not contain, a policy violation.

Second, rich-result eligibility changes and the markup does not. The engine withdrew
how-to rich results from desktop in 2023, retired seven low-use types in mid-2025, and
withdrew the FAQ rich result in May 2026 while stating it still parses the FAQ markup to
understand the page. A team that wrote FAQ markup for the dropdown lost the dropdown; a
team that wrote it because the page has questions with answers lost nothing. The
technique therefore ties each node to a reason that is not "earns a rich result" and
treats the rich result as a bonus with a shelf life. Every number, name and address in
the graph is the business's own; the anti-fabrication law applies to markup exactly as
it applies to copy, and a generated graph is built from validated page data rather than
from a model's recollection of it. See `structured-data-by-page-kind`.

## The audit changes this layer and never the copy

The most consequential rule in the subject is a boundary. An audit or fix pass may
change the title, the description, the alt text, the heading *tag* (an H3 that should
be an H2 - the tag, not the words inside it), the canonical, the anchors of internal
links, image formats and file names, the slug, the markup, and genuinely broken things.
It may insert a missing keyword into a heading or the opening sentence only where the
sentence already had room for it. It may not change a body sentence for any reason:
not flow, not clarity, not density, not because it reads better the fixer's way.

The reason is not politeness. The body copy is the owner's voice - the stories, the
asides, the specific numbers, the phrasing a competitor cannot copy - and it is the one
thing on the page that the rater guidelines reward and a model cannot regenerate. A fix
pass that "improves" it returns a higher score on a page that has lost its only
uncopyable asset. The test before every edit is one question: mechanical problem, or
me writing? A page that genuinely needs new content routes to the writing workflow,
where the voice is loaded and the owner approves the draft. The same boundary forbids
deletion: a thin page, an orphan, a four-megabyte hero image each have a fix that is
not removal, and where removal is genuinely right it goes into the report as a
recommendation awaiting a yes, because a deleted address loses its links and rankings
permanently. The fix pass reports the count of body sentences it altered; the expected
number is zero. See `mechanical-layer-only-never-the-copy`.

## Failure modes of the naive reading

- **Treating the checklist as the goal.** Eighty checks at 100 percent on a page nobody
  clicks. The checklist is the floor; the console tells you which page matters.
- **Character count as truth.** A 58-character title of capitals that truncates in the
  live results while the audit shows green.
- **Stacked lifts.** A bracket, a numeral, a year and a power word in one title - the
  engine rewrites it and the reader who does click bounces.
- **Date-only refreshes.** Changing the modified date without changing the substance is
  explicitly debunked by the engine's own documentation and does nothing; a real refresh
  (new sections, updated numbers, better answers) re-ranks in a window practitioners put
  at two to four weeks, and that window is a convention.
- **Schema for the feature.** Markup written for a rich result that has since been
  withdrawn, or for a rating the page does not show.
- **Scoring the wrong build.** A speed or on-page score from a development server, a
  browser with extensions loaded, or a single run; the standard is the production build,
  headless, on mobile, the median of three, with the mode named beside every number.
- **The silent copy edit.** A fix pass that reworded a paragraph "for readability" and
  reported the score, not the sentence count.

## Footings

Rewrite rates, the 30-60 character survival band and the H1-agreement effect are
published measurements from named title studies. Pixel budgets are the engine's rendered
behaviour approximated by practitioners; the exact column widths drift with the results
page's layout and are labelled approximate wherever they appear. Click-through lifts are
vendor and practitioner studies of mixed rigour, cited with their sample where one is
known. The positions-four-to-eight band, the two-to-four-week read window, the once-per-
slot placement and the "first hundred words" are practitioner convention. The mechanical-
only boundary and the deletion-by-approval rule are doctrine of this bundle, anchored in
the law that gates money and copy.
