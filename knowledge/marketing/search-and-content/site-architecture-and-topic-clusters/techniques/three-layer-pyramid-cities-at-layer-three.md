---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: three-layer-pyramid-cities-at-layer-three
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [laying out the URL tree of a new site, deciding where a service-and-city page lives, reviewing a site whose money pages sit four or more clicks deep]
---

# Three-layer pyramid, cities at layer three

A site that earns search is built to one tree, three layers deep, and the only thing
that ever goes to layer three is a page for one service in one city. Home is layer
zero. Layer one holds the branch indexes - services, blog - and the single pages:
about, contact, quote. Layer two holds one page per service and, flat under the blog
index, one post per topic. Layer three holds one page per service and city, nested
under its service hub. Nothing else exists, and a URL that needs a fourth folder is a
sign the structure is wrong, not a case for an exception.

The reason is authority and discovery, not folders. The home page holds the most
authority and every click away from it holds less; money pages must sit at click two
or three because that is where a buyer arrives with the site's weight still behind the
page. The engine has said plainly that it does not count slashes in a URL - click depth
from home is the importance signal, folder depth is a convenience for humans and crawl
grouping. So the three-layer rule is an engineering target for money pages, held
because it guarantees the click-depth target if internal linking does its job, and
navigation or footer links legitimately shorten a deep page's distance without moving
it. This is convention with crawl-data support: shallower pages are crawled more in
crawl logs; the "three" itself is a practitioner number.

## The tree

- **Layer 0 - home.** Links to every layer-one page, every service hub, the areas
  index and a handful of best or newest posts.
- **Layer 1 - branch indexes and singles.** The services index and the blog index are
  real hub pages of their branch: a short intro, then one descriptive line and link
  per child. About carries the author and trust load. Quote or contact is the
  conversion target every post bridges to.
- **Layer 2 - one page per service; one post per topic, flat.** Posts never gain
  category folders. Editorial hierarchy is expressed by links - the spoke links up to
  its pillar, the pillar links down to its spokes - never by depth.
- **Layer 3 - one page per service and city.** Nested under its service hub, so the
  URL reads as the map: service, then city, with no other context needed.
- **Off-tree - the thank-you page.** Reached by submitting a form, not by browsing:
  not indexed, not in the sitemap, not in navigation, exempt from the click-depth and
  orphan rules. The conversion event fires here and nowhere else, which is why it must
  never rank.

## Rules that keep the tree intact

1. **Three layers maximum.** A fourth folder means flatten, not nest.
2. **Every page within three clicks of home.** Orphans are a linking failure, not a
   folder problem, and are fixed by links.
3. **URL equals hierarchy.** The path is the topical signal; never build a page whose
   URL contradicts its place in the tree.
4. **Hubs before spokes.** A spoke published before its hub has nothing to link to. The
   services index exists before any service page; the service page before any city
   page; the pillar post before any spoke post.
5. **One page per keyword, one place per page.** Where a term could live in the blog
   or in services, services wins and the post links to it.
6. **The sitemap mirrors the tree.** Every live page, nothing else.
7. **Indexes are real pages.** Never a bare list; never a sales page for one offer.

## Locations are conditional, and one stack only

A location page needs a real address; a town merely served gets a service-and-city
page and never a location page. Then pick one road: service-first (service, then city
- the default) or location-first (city, then service - branch chains only), and never
both, because two stacks produce two URLs per topic and a self-inflicted duplicate.
Nested versus flat city URLs is the one genuine disagreement among local specialists;
the engine treats them alike, so the only hard rule is consistency - never mix patterns
on one site, and never move a URL that already ranks.

## Decision rules

- **When a city page would be the twentieth under one service and has no distinct
  local material, do not build it,** because the tree permits it and the material gate
  in `local-page-doorway-prevention` does not - the pyramid is a ceiling on depth, not
  a licence to fill a matrix.
- **When a term needs a fourth folder to "fit", it is either a spoke of an existing
  layer-two page (make it a section or a flat post) or a standalone that was
  misfiled,** because nothing a business sells needs four levels of context.
- **When a restructure moves URLs, every old URL gets a permanent redirect before the
  new tree goes live,** because a ranking URL that returns not-found loses its links
  permanently, and a move without redirects is a deletion that nobody approved.
- **When a deep page is important and cannot move, add navigation or in-body links
  from layer-one pages,** because click depth, not path, is what the engine counts.

## When not to use this

Do not apply the pyramid to a catalogue whose categories genuinely nest three or four
levels - a large retailer's taxonomy is its own architecture problem, and forcing it to
three layers would strip real topical signal from the paths. The three-layer rule is
written for service businesses, local businesses and editorial sites where the money
layer is a service or a service-and-city page. Do not restructure a ranking site into
the pyramid for its own sake: linking is the mechanism and folders are not, so a flat
site with sound internal links and shallow click depth is already compliant with what
the rule is for. And do not read the layer-three rule as a target: most services have
no city pages at all, and a service page with no cities beneath it is a complete page,
not a hub waiting to be filled.
