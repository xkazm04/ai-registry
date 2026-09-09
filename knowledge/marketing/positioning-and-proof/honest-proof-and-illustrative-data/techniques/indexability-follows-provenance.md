---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: indexability-follows-provenance
status: forged
laws: [provenance-is-binary-and-labelled, a-gate-before-money-and-copy]
shared_with: []
use_when: [setting robots directives on a page that can show demo data, deciding whether a generated page kind should index, reviewing why a demo page appears in search results]
---

# Indexability follows provenance

Whether a page may be indexed is computed from what the page shows and why it
exists - never set once as a property of the route. A page carrying illustrative
figures is noindex, because an indexed demo is search-findable proof of results
attributed to a real brand that no reader saw the banner for. A page carrying a
client's real synced series may index. And the flag is read from the same
provenance bit as the banner, per request, so the two cannot disagree and a
cleared sync reverts the page on the next crawl.

## Three policies by page kind

The purpose of a page decides its policy before its data does; the data decides
only for the one kind whose purpose is to show results.

- **A local service landing page indexes unconditionally.** It carries the
  business's own service, price and locality - nothing illustrative - and it
  exists to rank and to outlive the campaign that made it. Its indexability
  does not depend on a sync because it shows no series.
- **An experiment arm is noindex, unconditionally.** It exists to be measured
  and dies when the test ends. Indexing it would rank whichever arm the crawler
  happened to draw, at a URL that will be gone in weeks, and would land organic
  visitors on an arm they were never randomised into. Follow stays on, so an
  operator's own link check still resolves through it.
- **A performance page indexes only when its provenance is real.** It is the
  one kind whose honesty depends on its data, so its flag is the provenance bit
  and nothing else: real branch, index; sample branch, noindex with follow.

A team that sets all three the same way has decided by route rather than by
purpose, and the result is either an indexed demo or an unranked local page.

## Mechanics the flag depends on

- **Noindex is a directive the crawler must be able to read.** The search
  engine's own documentation is explicit: a robots file is a crawl control, not
  an indexing control, and a page blocked by robots can still be indexed from
  its links while its noindex is never seen. Preview and staging deployments are
  crawl-blocked as an environment; a demo page in production is noindex on the
  page, and must not also be robots-blocked there.
- **Follow is independent of index.** Noindex with follow lets the page pass
  through link checks and carry its outbound links; noindex-nofollow is for
  pages that should not exist to the crawler at all (a missing slug, a preview).
- **The canonical is the page's own stable URL.** A performance page re-renders
  from the latest snapshot on every request at one address; the canonical is
  that address, so a real-branch page accrues its search identity in one place.
- **A sitemap lists intent, not permission.** Priority and change frequency on a
  sitemap entry satisfy a schema; they are not crawl policy, and a noindex page
  is simply absent from it.
- **Structured data follows the flag.** A dataset node on a page that lists the
  variables measured is proof-shaped; on the sample branch the page is noindex
  and the node carries the same provenance as the chrome, and on the real branch
  it is what a search engine should find.

## Decision rules

- When a page can show illustrative figures, compute its robots directive from
  the provenance bit per request, because a route-level flag lies in the interval
  between a data change and a deploy.
- When a page kind exists to be measured rather than found, set noindex
  regardless of what it shows, because the URL is temporary and its content is
  one arm of several.
- When a page kind carries only the business's own facts, index it
  unconditionally, because a noindex local page is a doorway to nowhere.
- When a demo page must be crawlable for a link check or a preview tool, keep it
  crawlable and noindex, never robots-blocked, because a blocked page cannot
  deliver its noindex.
- When the share card for a demo page is generated, it carries the label in the
  image, because the card is indexed and shared without the page's directives.
- When a page's indexability changes, nothing is deleted; an experiment page
  that ends is unpublished by its owner under
  [a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy),
  and the noindex it always carried means there is no ranking to lose.

## When NOT to use

- **Surfaces that never carry a number.** A brand page or a pricing page has no
  provenance bit; its indexability is a positioning and information-architecture
  decision, not this technique's.
- **Environments rather than pages.** A preview deployment is crawl-blocked as a
  whole and is not a per-page decision; this technique governs production pages
  that can be either.
- **Private share links.** A tokenized report link is noindex because it is
  private, not because of its data; the reporting subject owns that rule.

## Footing

The robots-versus-noindex mechanics are documented search-engine behaviour. The
three-policy split by page kind is practitioner convention, with the experiment-
arm case argued from the mechanics of randomised assignment rather than from a
published measurement.
