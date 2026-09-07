# Firecrawl as the `web_scraping` source reader

What was learned mapping this recipe onto Firecrawl as the thing that reads the followed
sources. Nothing here is part of the recipe: swap the connector and this file stops applying
while the recipe does not change.

## What the mapping has to decide

**A page that changed is not an item that was published.** This connector will happily
report a difference caused by a rotated advertisement, a view counter, a related-links
block or a redesign. Curation needs new items, not changed bytes, so the comparison has to
be against extracted content with the volatile parts excluded, and the exclusions are per
source. Getting this wrong is what fills an issue with things the reader saw last week.

**A feed summary is not the item.** Where a source publishes a feed, what comes back is
often a title and two sentences, which is enough to deduplicate on and not enough to write
commentary from. This recipe insists that every line could only have been written by
reading the item, so the fetch has to reach the article body, and a source that will not
give it up is a source whose items cannot honestly be commented on.

**A source that fails looks exactly like a source with nothing new.** Both return zero
items. That is precisely the failure the dead-sources outcome exists for, and the
distinction has to be made here, at the fetch: a non-response, an error status and a page
that parsed to nothing are all different from a feed that was read and had nothing in it.
Record which of those happened per source per run, or the recipe cannot tell them apart
later no matter how carefully it counts.

**Politeness is a standing obligation, not a per run one.** Thirty sources pulled on every
cycle is a recurring load on other people's servers. Respect the crawl directives, cache
what has not changed by its own declared markers, and prefer a feed to a crawl wherever a
source offers one.

## What transfers to any source reading connector

- Distinguish a failed read from an empty read at the point of reading. Downstream they are
  the same number.
- Compare on extracted content with the volatile regions excluded, not on the page.
- If the connector cannot reach the body, the recipe cannot write commentary about it, and
  that is a reason to drop the source rather than to lower the standard.
