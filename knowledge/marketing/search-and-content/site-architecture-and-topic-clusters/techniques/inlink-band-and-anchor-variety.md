---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: inlink-band-and-anchor-variety
status: forged
laws: [label-convention-as-convention, platform-reported-is-not-causal]
shared_with: []
use_when: [deciding how many internal links a money page or pillar should receive, choosing anchor text for a link into a target page, auditing a site where most pages have one inbound link]
---

# The inlink band and anchor variety

Important pages - money pages and pillars - should receive somewhere between ten and
forty internal links, each target page should have at least one exact-match anchor,
and every other anchor pointing at it should differ. Those three rules come from the
one large-scale internal-linking dataset that exists: roughly 23 million internal
links across about 1,800 sites, matched against each site's own search-performance
console clicks. Pages receiving 40-44 inbound internal links averaged about four times
the clicks of pages receiving 0-4, the relationship flattened and then reversed past
roughly 45-50, pages with at least one exact-match internal anchor got around five
times the traffic of pages with none, and anchor-text variety was the strongest single
correlate in the dataset and kept climbing with no visible ceiling - consistent enough
that the analysis was re-run three times.

Read the provenance carefully. This is a correlational study of clicks against link
counts, which is a description of what well-linked pages look like on sites that
already earn traffic, not an experiment that added links and measured the lift. Pages
that matter get linked more *and* earn more; both are true at once. The band is a
sound target because it is cheap to hit and the direction is consistent, and it is
labelled here as a measured correlation rather than as a documented ranking mechanism,
per [platform-reported is not causal](../../../_laws.md#platform-reported-is-not-causal).

## Procedure

1. **List the pages that matter** - service hubs, city pages for the money services,
   pillars - and count their inbound internal links, excluding site-wide navigation and
   footer, which the same evidence says carry little on all but the largest sites.
2. **Find the pages with one inlink.** Two-thirds of web pages have exactly one, and
   a page with none receives no link flow and is crawled rarely or never. Every page
   with fewer than two gets links from two or three older relevant pages.
3. **Route links from strength.** A link from a page that has earned external links
   moves more than a diagram-pretty link from a page with none; when choosing where a
   money page's inlinks come from, prefer the pages with real backlinks. This is a
   practitioner heuristic with a name, not a measurement.
4. **Give each target one exact-match anchor** - the page's primary keyword - and then
   vary every other anchor: close variants, partial matches, descriptive phrases, the
   page title. Never the same anchor from every spoke.
5. **Put the links in the body, high on the page.** Body links early carry the most
   weight; a related-posts stub at the foot is the weakest place a link can live.
6. **Do not double-link.** Controlled tests found the engine registers at most the
   first text link and the first image link to a target from one page; a second text
   link with a different anchor is ignored. Vary anchors across pages, not within one.
7. **Stop before the band's ceiling.** Past roughly fifty inbound links the data turns
   uncertain; a hub linking to every page from every page is diluting, and it is
   usually the mesh that the labelling technique forbids.

## Decision rules

- **When a money page has under ten inbound body links, add links from the posts that
  bridge to it and from its sibling services before writing anything new,** because
  links are the mechanism that the whole architecture exists to arrange, and they are
  cheaper than a page.
- **When every spoke links to its hub with the same anchor, rewrite all but one,**
  because variety was the strongest correlate and a wall of identical anchors is also
  the pattern manipulative linking leaves.
- **When a page needs more inlinks and the only candidates are footer or navigation
  slots, count the gain as small and look for body placements,** because site-wide
  links only performed on large high-authority sites.
- **When a target already sits at forty-plus inbound links, spend the next link on a
  page with one,** because the marginal return past the band is uncertain and the
  orphaned page's return is not.
- **When a number in this technique is quoted downstream, it travels with its source
  class - "a 23-million-link correlational study",** per
  [label convention as convention](../../../_laws.md#label-convention-as-convention).

## When not to use this

Do not apply the band to every page. A city spoke or a minor post does not need forty
inlinks and cannot earn them honestly; the band is for the pages the site is built
around, and spreading links thin to hit ten everywhere starves the pages that matter.
Do not apply exact-match anchors as a rule for external links - that is a different
risk profile, owned elsewhere. Do not treat the band as a lever on a site whose problem
is coverage: linking a thin page forty times does not make it rank, and the dataset
describes sites that already had pages worth linking. And do not read the four-times
click figure as a forecast for any one site; it is an average across 1,800 sites,
correlational, and the only defensible claim from it on a single site is direction.
