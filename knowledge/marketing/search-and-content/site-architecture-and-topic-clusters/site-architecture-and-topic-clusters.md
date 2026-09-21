---
layer: golden-path
type: golden-path
subject: site-architecture-and-topic-clusters
status: forged
use_when: [planning the page tree of a site that must earn search, deciding whether two keywords are one page or two, labelling a keyword map into hubs and spokes, choosing which page to build or refresh next]
techniques:
  - three-layer-pyramid-cities-at-layer-three
  - hub-spoke-sibling-standalone-labels
  - serp-overlap-same-page-test
  - one-primary-keyword-per-page
  - pillar-passage-per-spoke-linking-contract
  - inlink-band-and-anchor-variety
  - pillar-weighted-completeness-and-decay
---

# Site architecture and topic clusters

This subject owns the **shape** of a site that earns search: how deep the tree goes,
which pages are hubs and which are spokes, how the decision "one page or two" is made,
the contract that binds a spoke to its hub with links, and the bookkeeping that says
which page to build or refresh next. It does not own the reading of intent off a
results page - that is `search-intent-classification` - nor the trustworthiness of the
volume and difficulty numbers a keyword tool hands over, which is
`keyword-metric-reliability`. Whether a city page has enough local material to exist at
all, and how near-duplicates are measured, belongs to `local-page-doorway-prevention`.
The title, heading and metadata of a single page is `on-page-and-metadata-craft`; the
writing of the page itself is `content-brief-and-article-composition`; what makes a
passage citable by an answer engine is `answer-engine-visibility`. This subject decides
where a page lives, what it is for, and what it must link to.

## What a principal practitioner holds true

**Clusters are not a ranking factor. Links and coverage are.** No search engine has
ever endorsed "topic clusters"; the framework was built by practitioners on top of one
correlational experiment, and the widely quoted average traffic lift attributed to it
traces to no primary study. What is measurable underneath is plain: a page with
internal links pointing at it, with varied anchors, on a topic the site already covers
adjacently, is crawled more, ranked more and cited more. Architecture is the discipline
of arranging pages so those measurable things happen by construction instead of by
remembering. When an architecture rule cannot be traced back to links, coverage, or
click depth, treat it as a habit.

**The tree is shallow and the money layer is click three.** Home, then the branch
indexes and the standalone pages, then one page per service or one post per topic, then
- and only then - one page per service and city. Authority is highest at the home page
and thins with every click; a page four clicks from home is discovered late and
weighted lightly, whatever its folder path says. Folder depth is a convenience for
humans and crawl grouping; click depth from home is what the engine counts, which is
also why navigation and footer links legitimately shorten a page's distance without
moving it.

**Two cluster models coexist and are never confused.** Editorial clusters are flat
URLs with a linked hierarchy: a pillar post and its spoke posts all live directly under
the blog index, related only by the links between them. Money clusters follow the URL
nesting because the nesting is the pyramid: a service page is the hub of its city pages
and nothing else is its spoke. Confusing the two is how a service gets labelled a spoke
of a broader service it does not nest under, and how a blog grows category folders that
bury posts a click deeper for nothing.

**Standalone is the default outcome, not a failure.** A pull of fifty keywords does
not contain fifty pages of structure. Perhaps fifteen decompose into clean hubs; the
rest are simply pages, and forcing them into a cluster produces a strained passage on a
live hub about something that is not its subtopic. The labels are four - hub, spoke,
sibling, standalone - and the honest map is mostly standalones and siblings with a few
genuine hubs. A thin hub is refilled by pulling more of its keyword family, never by
stretching a leftover into a spoke.

**One page, one primary keyword, and the results page decides where the line is.**
Two strings that the engine answers with the same results are one page; two strings
it answers differently are two. Neither word similarity nor a tool's semantic grouping
gets the final say, because embeddings are intent-blind and group "how to roast" with
"buy roasted". The overlap threshold that converts a shared-result count into a verdict
is a convention borrowed from vendor defaults, and every document that uses it says so.

**A link is not a section.** The contract between a hub and its spokes is structural:
the hub carries a heading and a short passage per spoke with the link inside the
passage, and the spoke names its hub early and links up. A bare "related posts" list at
the foot of a page satisfies a crawler's definition of a link and nobody else's - not a
reader, not a passage retriever, and not the engine's weighting of body links over
boilerplate. When a spoke ships, its hub grows a section the same day, or the spoke is
an orphan in spirit even though some link to it exists somewhere.

**Coverage is measured, and refresh competes with build.** A cluster with three
supporting pages and no pillar is less complete than one with a pillar and one spoke,
because the pillar is what carries the topic's authority and what the spokes link up
to; completeness is weighted, and the missing pillar is always the next gap. On the
other side of the ledger, a published page losing organic traffic year over year is a
refresh candidate that competes for the same writing hours as a new page, and the
strongest measured wins in the whole genre come from pruning and consolidating, not
from adding. A content queue that only knows how to add is half a queue.

## The load-bearing distinctions

*Hub versus sibling.* A hub must exist before its spokes have anything to link to, and
the linking direction between them is fixed. Siblings have neither property: neither
must exist first, and links between them are optional and contextual. The distinction
earns its keep in build order - mislabelling siblings as spokes creates a false
dependency that delays pages for nothing.

*Secondary keyword versus spoke.* A secondary is a phrase the same page answers, and it
becomes a heading on that page. A spoke needs its own page because its topic could be
one section of the hub but deserves the depth the hub refuses to give it. The test for
a spoke is decomposition: could this entire topic be one heading of the hub? "Audit
your business profile" decomposes "how to do a local search audit"; "search for
plumbers" does not, because same industry is not same topic.

*Synonym versus secondary.* Word-order flips, spelling variants and brand renames are
one query; the engine resolves them to one intent and one page ranks for all of them.
They never count toward a cluster's size and never get a heading. Record them on one
line so their volume is not lost and nobody re-adds them.

*Cross-linking spokes versus meshing them.* Editorial spokes link to one to three
genuinely related siblings where a reader benefits. City spokes under a service hub do
not all link to one another; a dozen city pages meshed together is a link web nobody
navigates, on top of pages that already carry duplication risk. Discovery of city pages
flows through the hub.

*Editorial clusters link into money clusters, never the reverse as the main flow.* The
bridge from a post to its service page is why the post exists commercially. A money
page linking out to five guides sends a buyer away from the form; one link to a
genuinely useful guide is the ceiling.

## Failure modes of the naive reading

The most common is **cannibalization by spinning**: near-identical keywords built into
separate posts, each with its own primary, splitting one intent's rankings across two
URLs for months before the search-performance console shows two pages swapping
positions on one query. The overlap test exists to stop it before the pages exist; the
console's page report finds it afterwards. Narrowing the second page's angle to justify
it is how doorway-adjacent duplicates enter a map with a straight face.

The second is **the pillar that out-covers its spoke**. A pillar that goes deep on every
subtopic leaves each spoke thinner than the section pointing at it; the spoke dilutes
instead of ranking. Pillars are routers that teach - short, breadth not depth, each
section deliberately stopping short - and the long-pillar prescription traces to a
backlink correlation that measures links, not rankings.

The third is **index bloat**: publishing because the calendar says so, until the site
has thousands of pages of which a handful earn traffic. Sites that removed large
fractions of their pages have reported traffic and sign-up gains of tens of percent
within months, and those reports come from the people who won, so read them as an
upper bound rather than a promise - but the direction is consistent enough that "more
pages" is never the lever on its own.

The fourth is **a hub page that is a list, or a sales page wearing a hub URL**. A branch
index with no intro copy and no line per child has nothing to rank for and nothing for
a retriever to cite; one documented recovery came from replacing link-only hubs with
real content. A hub that is a hero selling one offer with the children as a card row
underneath is a service page at the wrong address. A hub names the category, introduces
it, carries one real section per child, and leaves pricing and forms to the children.

The fifth is **the calcified map**: pages labelled standalone in one quarter because
nothing they decomposed into existed yet, never re-checked, while hubs sit two spokes
short of complete. The re-sort is cheap when it only promotes and only tests against
open hubs; unguarded, it flips labels back and forth between runs and leaves hubs
carrying passages about pages that are no longer their spokes.

## The order of operations

Cluster what genuinely clusters, using the overlap test on plausible pairs only.
Label everything left standalone without apology. Then ask what is missing from the
hubs you did find and pull toward them; depth in one topic transfers to adjacent topics
several times better than to distant ones, so thirty pages in five complete clusters is
a stronger map than fifty scattered ones. Build hubs before spokes, wire each spoke into
its hub's section the day it ships, keep every page inside a band of inbound links with
one exact anchor and the rest varied, and read completeness and decay together when
deciding what the next writing hour goes to. Re-cluster after any major ranking update,
and remember that a large share of the intent shifts such updates cause revert within
months - the map is pulled toward the structure of demand, never bent into a structure
someone drew first.
