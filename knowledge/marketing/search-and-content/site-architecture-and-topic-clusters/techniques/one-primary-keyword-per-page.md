---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: one-primary-keyword-per-page
status: forged
laws: [the-results-page-is-the-verdict, a-gate-before-money-and-copy]
shared_with: []
use_when: [assigning the root keyword of a page, adding a page to a map that already has forty rows, diagnosing two URLs swapping positions on one query]
---

# One primary keyword per page

Every page targets exactly one primary keyword, and no primary is targeted by two
pages. The primary becomes the title and the main heading; its secondaries become the
section headings; and every other page on the site that could have claimed the term
instead links to the one that owns it. This is the cannibalization defence, and it is
enforced at the map, before a page exists, because afterwards it is invisible for
months. Two pages competing for one intent are worse than one page: the engine cannot
tell which is authoritative, splits the signals between them, and ranks both lower than
either would rank alone.

## Choosing the primary

The primary is the highest-volume term that **also** has the right intent. Both, never
either. If a lower-volume term is the root, the block says why in one clause, because
the root having less volume than one of its own secondaries is the easiest error to
spot on review and it happens constantly. The reason it is sometimes right is the
"who is typing this" question: a guide-shaped phrase with three times the volume earns
readers, and a "services" phrase with a third of the volume earns calls. Volume never
tells you who. When a money page's candidates split this way, the buying-signal noun
wins and the guide-shaped term is routed to a post that links to the money page - never
deleted, because high-volume informational terms are the top of the funnel.

A stronger heuristic where the data exists: pick the primary by the query that sends
the most traffic to the page currently ranking first for the candidate set, rather than
by raw volume of the term - volume weighted by outcome, not looked up. Secondaries
scale with the page type: four or five for a service or city page, four to eight for a
spoke post, eight to fifteen for a pillar or comprehensive guide. These counts are
practitioner convention, and a page that cannot picture a real section for a secondary
does not carry it. A cluster of fewer than three terms usually means the split was too
fine; more than fifteen usually means two intents got fused.

## The cannibalization gate

Before a term becomes a new row, it is tested against every primary **and secondary**
already in the map, not only against the other new terms. Exact-string dedupe is not
enough and it is the failure everyone ships: "emergency plumber" and "24-hour emergency
plumber" in the same city are different strings, pass any string check, and are the
same page. The gate is the overlap test on plausible collisions, and a term that folds
into an existing row becomes a secondary there, recorded with the shared count.

Where a term could live in the blog or in services, services wins and the post links
to it. Where a term could live on two service pages, the page whose results-page shape
matches wins and the other page links across as a sibling. Where a pillar and its spoke
compete, the spoke never targets the pillar's head term: the pillar takes the broad
term, the spokes take the long tails, and that keyword split is the defence.

## Finding it after the fact

The search-performance console shows the failure as a signature: filter to one query,
open the pages report, and find two URLs from the site with split impressions swapping
positions from week to week. Rank-tracker snapshots show the same thing as a URL that
flip-flops. Either is cannibalization confirmed with data, and the fix is architectural,
never cosmetic: consolidate the weaker page into the stronger with a permanent redirect,
or rewrite the weaker one to a genuinely different primary and re-run the overlap test
to prove it. Consolidation reports of large click gains exist and come from the sites
that won; treat the direction as reliable and the magnitude as anecdote.

## Decision rules

- **When a new term shares four or more top-ten results with an existing primary, it
  becomes a secondary of that page,** because the engine already treats them as one
  intent, and a second page would split it.
- **When the root has lower volume than a secondary, the block states the reason or the
  root is wrong,** because silent exceptions are indistinguishable from mistakes.
- **When two pages swap positions on one query in the console, consolidate or
  re-target - never "make one more specific",** because narrowing an angle to justify
  a second page is how near-duplicates enter a map with a straight face.
- **When a term fits a post and a money page, the money page owns it,** because the
  post's commercial job is to bridge to that page, not to compete with it.
- **When a consolidation deletes a URL, it is a recommendation awaiting approval and
  ships with a redirect,** per
  [a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy).

## When not to use this

Do not apply the rule to brand queries or to navigational terms the home page will
rank for regardless; forcing a service page to "own" the business name creates a
collision with the home page that no map can resolve. Do not treat two pages ranking for
the same query as cannibalization when the results page is genuinely mixed and the two
pages serve two intents - a post and a money page both appearing for a "cost" query can
be the correct outcome, and `search-intent-classification` owns that reading. And do
not use the rule to refuse secondaries: one primary per page does not mean one keyword
per page, and a page written to a single string with no secondaries is under-mapped,
not pure.
