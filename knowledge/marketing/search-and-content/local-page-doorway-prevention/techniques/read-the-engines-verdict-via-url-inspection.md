---
layer: technique
type: technique
subject: local-page-doorway-prevention
technique: read-the-engines-verdict-via-url-inspection
status: forged
laws: [the-results-page-is-the-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [a set of area pages is not ranking and the cause is disputed, deciding whether a similarity finding is real, choosing between rewrite and consolidate for a specific set]
---

# Read the engine's verdict via URL inspection

Whether a page set is "too similar" is a question the engine has already answered,
per URL, and its search-performance console exposes the answer. Two fields settle
the argument that similarity scores only inform: the canonical the engine *chose*
against the one the page *declared*, and the page's coverage state. Read them before
arguing from a ratio ([the results page is the verdict](../../../_laws.md#the-results-page-is-the-verdict)).

## The two fields and what each means

**Chosen canonical versus declared canonical.** Every area page self-canonicalizes. If
the engine's chosen canonical for the page about one town is the page about another
town - or the service hub - the engine has clustered the set as one document. The
chosen page is in the index; every other member is out of it and contributing nothing,
however well-written its tags. A set where most members report a sibling as their
chosen canonical is a set the engine has already consolidated for you, and no canonical
re-declaration changes that; only the content does.

**Coverage state.** The two not-indexed states mean different things and want
different responses:

- *Crawled - currently not indexed*: the engine fetched the page, read it, and declined.
  A quality judgment on this page's content.
- *Discovered - currently not indexed*: the engine knows the URL and has not spent the
  crawl on it. A trust or pattern judgment about the URL's neighbourhood - usually the
  templated set it belongs to, or the site's overall quality budget.

The first says "this page needs to say something"; the second says "this set looks
like a set not worth fetching". A set with both is the common profile of a templated
build: the pages that were crawled were declined, and the engine stopped bothering.

## Procedure

1. **Pull the inspection read for every page in the set** through the console's
   inspection interface. Its documented quota is on the order of two thousand URLs per
   property per day and a few hundred per minute, so a set of forty is one call and a
   set of thirty thousand is a fortnight - plan the sample accordingly.
2. **Record per page:** declared canonical, chosen canonical, coverage state, last
   crawl date.
3. **Join to the similarity matrix** from the boilerplate-strip measurement: for each
   page, its containment against its chosen canonical and its unique-phrase count.
4. **Produce the one table** that ends the debate - page, chosen canonical, coverage
   state, containment against that canonical, unique phrases - sorted by coverage
   state then containment.
5. **Read the pattern, not the row.** A set where the chosen canonical converges on
   one or two members is a consolidation verdict. A set where each page is its own
   canonical but most are "crawled - not indexed" with low unique-phrase counts is a
   thin-content verdict on legitimate pages. A set mostly "discovered - not indexed"
   is a crawl-budget or pattern verdict that content on the unfetched pages cannot
   yet address.
6. **Re-inspect after the fix**, on the same URLs, at an interval the engine's
   recrawl can honour - weeks, not days - and compare state to state.

## Decision rules

- When a page's chosen canonical is a sibling, route to differentiate-then-realign;
  because a tag re-declaration is arguing with a verdict the content caused.
- When a page is its own canonical and "crawled - not indexed" with a low
  unique-phrase count, route to the rewrite; because the engine read a legitimate URL
  and found nothing in it, which is exactly what the rewrite supplies.
- When a page is its own canonical, "crawled - not indexed", and its unique-phrase
  count is healthy, look outside this subject - internal links, hub inclusion, site
  authority - because the content verdict does not explain the state.
- When most of a set is "discovered - not indexed", fix the set's pattern before its
  pages: hub inclusion, sitemap, the cap on set size; because content the engine has
  not fetched cannot change its mind.
- When a page has not been inspected, its state is unknown, not indexed; a coverage
  table with blank cells reports them blank ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)),
  because filling them from a site-search count or a similarity score fabricates a
  verdict the engine has not given.
- When the inspection read and the similarity score disagree - a high-containment
  pair both indexed as their own canonicals - the read wins and the score is noted as
  a risk, not a finding; the engine has looked and chosen.

## What the read cannot tell you

It is per-URL and per-property; it does not say *why* beyond the two states, does not
name the sibling it judged the page against, and does not distinguish "declined for
thinness" from "declined for duplication" - the join to the similarity matrix is what
supplies that. It also reports the engine's last visit, not the present: a page
rewritten yesterday still carries yesterday's verdict until the recrawl, and a report
that reads the state as the effect of the rewrite before the recrawl date has moved is
reading the wrong visit.

## When not to use this

Do not use it before the set exists. It reads verdicts on published URLs; the material
gate and the sibling sentence are the pre-build tools.

Do not use a site-search operator count as a substitute. The count is an estimate of
the index, not a per-page verdict, and it cannot show a chosen canonical.

Do not read one page's state as the set's. A single "crawled - not indexed" on a new
page is the normal lag between publish and index; the verdict is the pattern across the
set after the engine has had the weeks it needs.
