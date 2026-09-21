---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: pillar-passage-per-spoke-linking-contract
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [shipping a new spoke page or post, writing or auditing a hub or pillar page, building a machine check for hub-and-spoke wiring]
---

# The linking contract: a passage per spoke, not a link

A hub and a spoke are not linked until a specific shape exists on both pages. The hub
carries a heading and, under it, a short passage per spoke - two to four sentences that
genuinely introduce the subtopic, with the link inside the passage. The spoke names its
hub early in the body and links up to it. That is the contract, it is owner-defined
rather than engine-documented, and a single anchor wrapped in a paragraph or a "related
posts" list at the foot of the page does not satisfy it. The passage is the point; the
link is its consequence.

Three things make the passage the unit rather than the link. Editorial in-body links
high on a page carry more weight than navigation links, which carry more than footer
links, in the engine's own reasonable-surfer framing and in the measurement that
site-wide navigation links only performed on large high-authority sites. A pillar that
is only a link list has nothing to rank for and nothing for a passage retriever to cite;
one documented recovery came from replacing link-only hubs with real content. And a
passage per spoke is what a cluster is for: answer engines fan one query into roughly
eight to fifteen sub-queries and retrieve passages evaluated independently, so a
self-contained 130-170 word section on each subtopic is retrievable in a way a
3,000-word article with no clean boundaries is not. That word band is a practitioner
figure from one query fan-out analysis, not a platform number.

## The contract, by cluster model

**Editorial clusters - flat URLs, linked hierarchy.**
- The pillar carries one heading per spoke, each with a short passage that teaches
  the subtopic and links to the spoke from inside it. Every spoke section appears in
  the pillar's table of contents; a section the contents does not announce is
  half-invisible - a lesson learned on a live page.
- Each section deliberately stops short. If a pillar section out-covers its spoke, the
  spoke is thin and cannibalizes; breadth on the pillar, depth on the spoke.
- Each spoke references its pillar by name in the intro or first section and links up.
- Spokes link horizontally to one to three genuinely related siblings, never a mesh.
- Every post links out to its money page - the bridge is why the post exists.

**Money clusters - nested URLs, one axis.**
- The service hub carries an "areas we serve" heading with a short passage per city
  and the link inside it. A wall of city names in one paragraph is a recognized spam
  pattern; every live city spoke appears in the section, and a spoke missing from it
  is an orphan in spirit whatever other link exists.
- Placement: one qualifier line in the hero answering "do you serve me?" that anchors
  to the section, and the full section mid-page after the proof and before the FAQ.
  Never a lone footnote link, never below the final call to action, never a link list
  where the proof belongs.
- Each city spoke references its service hub early and links up. City spokes do not
  all cross-link; a city links across only to a genuinely relevant neighbour.
- Orphaned city pages are the first doorway tell, and navigation inclusion was the
  first recovery step in documented de-indexing cases.

## Same-day wiring

A new spoke means the hub's section grows a passage the same day. The hub is a living
index, and the one long-run case of a pillar compounding over two years was a pillar
that was maintained. The rule that makes this cheap is hubs-before-spokes: because the
hub exists first, the spoke's build step ends by editing the hub, and there is never a
spoke waiting for a hub to be written. When a new page publishes, it also gets links
from two or three older relevant pages the same day; zero orphans, ever, is the
universal convention behind the measurement that two-thirds of pages have exactly one
inbound internal link.

## Checking it by machine

A wiring check can prove more than a link exists. For every city spoke: the hub's
markup contains a link to it; the hub has a heading whose text names areas, cities or
locations; the spoke's markup contains a link to the hub. For every post: the blog
index links it. For every service: the services index links it, and the indexes are
indexes - no form, no offer pricing, a heading that names the branch, and never the
same main heading as a child. What a markup check cannot prove is the passage: that the
sentences around the link teach the subtopic and that a section exists per spoke rather
than one heading over a list. That half of the contract is checked by a reader, and a
check that reports "linked" should be read as "the link half is linked".

## Decision rules

- **When a spoke ships, the hub is edited in the same change,** because a hub section
  owed later is a hub section never written.
- **When a hub's section for a spoke would read as strained, the page is not a
  spoke,** because the contract is what exposes a forced pairing - relabel it.
- **When the only link from hub to spoke is in navigation or a footer, count the spoke
  as unlinked,** because the weight of the link is in the body and the retriever reads
  the body.
- **When two links from one page point at the same spoke, only the first text link
  counts,** because controlled tests found the engine registers at most the first text
  link and the first image link; vary the anchor on a different page instead.

## When not to use this

Do not apply the passage contract to sibling links; siblings are contextual, optional,
and belong wherever a buyer or reader would genuinely cross over, not in a mandated
section. Do not force a money page to carry a passage per related post - the main
flow is from editorial into money, and a money page linking out to five guides sends a
buyer away from the form; one link to a genuinely useful guide is the ceiling. And do
not build an "areas we serve" section for a service that has no city pages: the
section exists because spokes exist, and a section listing towns with no page behind
them is a list of promises the site cannot keep.
