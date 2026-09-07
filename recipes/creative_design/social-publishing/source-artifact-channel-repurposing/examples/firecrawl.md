# Firecrawl as the article source connector

What was learned mapping this recipe onto Firecrawl specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**A paywall or a consent wall returns a page, not an error.** What comes back is real text:
a headline, two paragraphs and a subscription pitch. Nothing about the response says the
article was not retrieved, so the recipe drafts confidently from an excerpt and the variants
are wrong in a way no reviewer can see without opening the source themselves. Detect the
short body and the subscription language, and degrade to asking the adopter to paste the
text rather than proceeding.

**Extraction leaves boilerplate that reads as argument.** Navigation, related links, author
bios, newsletter interruptions and cookie notices all survive extraction often enough to
matter, and a variant that quotes a related-article headline as if it were the claim is the
kind of error that reaches publication. Strip on structure where the tooling allows it, and
sanity check that the extracted body is long enough to be the article.

**The canonical version is the one to repurpose.** Syndicated copies, amp variants and
aggregator reprints all resolve, sometimes with different edits and different titles. Decide
at adoption whether the source of record is the adopter's own publication or wherever the
link happened to point, because the variants will carry the link they were drafted from.

**This connector type and the video one both resolve from `research`.** One connector type
in the adopting catalog can offer both this and a video connector, which means an adoption
that binds only one may look complete and silently handle half the source shapes. Verify
both paths at adoption rather than on the first source of the unbound kind.

## What transfers to any article source connector

- A partial retrieval that looks like a successful one is the failure to design against.
  Check the length and the shape of what came back, not just the status.
- Extracted text contains things the page said that the author did not.
- Where a connector type resolves to several different connectors, bind and verify each
  path you intend to use.
