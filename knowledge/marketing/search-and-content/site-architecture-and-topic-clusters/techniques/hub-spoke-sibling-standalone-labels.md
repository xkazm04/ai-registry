---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: hub-spoke-sibling-standalone-labels
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [labelling a keyword map after clustering, deciding whether a related service is a spoke or a sibling, refilling a hub that has one or two spokes]
---

# Hub, spoke, sibling, standalone - and nothing else

Every page in a keyword map carries exactly one of four labels, and the label decides
two things the page commands will act on: build order and linking direction. A **hub**
has spokes beneath it and lists them. A **spoke** decomposes its hub and names it. A
**sibling** is a related page at the same level that names the pages worth
cross-linking, or says none. A **standalone** belongs to no cluster, which is a legal,
common and permanent-until-proven state. There is no fifth label, and the map is not
finished until every block carries one.

The labels matter because hub-and-spoke has properties siblings lack. A hub must exist
before its spokes have anything to link to, and the linking between them runs in a
fixed direction. Siblings have neither: neither must exist first, and the links between
them are optional and contextual. Mislabelling a sibling as a spoke creates a false
dependency that delays a page for no reason and forces the supposed hub to write a
passage about something that is not its subtopic.

## The decompose test

A pair is hub and spoke only when the spoke's entire topic could be one heading of the
hub's page. "Audit your business profile" decomposes "how to do a local search audit".
"Search marketing for contractors" does not decompose it - same industry is not same
topic - and is a sibling. The test is topical, not lexical: a narrower term is not
automatically a spoke of a broader one. On the money side the test is even stricter,
because money clusters have one axis and it is service to city. A service page is the
hub of its city pages and of nothing else; two related services never nest inside each
other however much one is topically a subset of the other, because the URLs, the build
order and the linking rules all disagree with the nesting. Related services are
siblings, labelled that way and cross-linked where a buyer would genuinely cross over.

## Standalone is the default

A real keyword pull returns fifty terms and perhaps fifteen decompose into clean hubs.
The rest are pages. The order of operations, every time:

1. **Cluster what genuinely clusters.** Run the decompose test on candidate pairs
   (and the overlap test, which decides one page or two, before it). Pass means label.
2. **Whatever is left is standalone.** No placeholder hub invented to house it.
3. **Then look at the hubs you did find and ask what is missing from them.** Spokes
   are pulled to fit a hub; they are never assigned from leftovers.

A standalone page is still wired when built - to its branch index, its nearest money
page, and contextual body links. Standalone means no hub relationship, never no links.

## Refill a thin hub by pulling, never by forcing

A hub with one or two natural spokes is not broken and not abandoned; its keyword
family has not been fully pulled. Mark it open and, before the map is saved, pull that
root's full family and see whether real decomposing subtopics exist that the wide first
pass missed - they usually do, because a first pull goes wide across an industry and
under-covers any single root by design. Everything found this way clears the same
gates; "it fills the hub" is never a reason to admit a term. If the full pull returns
nothing, the hub is narrow and that is a finding to record on the block, not a
shortfall. If nothing decomposes it at all, it was never a hub: relabel it standalone.
The depth-first order is evidence-backed: topical authority transfers to adjacent topics
around four times better than to distant ones in a large citation study, and pages
covering a topic's sub-questions are substantially more likely to be cited by answer
engines. Thirty pages in five complete clusters outrank fifty scattered ones. The
"fewer than three spokes is open" line is a practitioner convention.

## The re-sort, with two guards

Standalone is permanent-until-proven, so every run re-tests standalones - but under
two hard guards. **The sweep only promotes.** Standalone becomes spoke, never the
reverse, because the decompose test is judgment and an unguarded sweep flips a label
one run and back the next, leaving a hub carrying a passage about a page that is no
longer its spoke and nothing to clean it up. A page leaves a hub only by explicit human
decision. **The sweep tests against open hubs only.** A complete hub does not need more
spokes, and this is what keeps the sweep to a dozen comparisons instead of every
standalone against every hub, which is the version that quietly gets skipped. Report
moves in one line each, and when there are no open hubs, skip the step and say so.

## Decision rules

- **When two services are related and one is narrower, label them siblings,** because
  the money side has one axis and a topical subset is not a structural one.
- **When a hub has fewer than three spokes after the first pull, pull the root's full
  family before saving,** because a thin hub means the pull is unfinished, not that the
  map ships thin.
- **When a page has survived ten sweeps as standalone, stop expecting it to move,**
  because a page that is genuinely just a page is the normal case.
- **When a promotion happens, the hub owes a passage and a link the day the spoke
  ships,** because a relabel without the section is a spoke on paper only.

## When not to use this

Do not use the labels to describe navigation. A menu groups pages for a visitor; the
labels describe link obligations and build order, and a page in a menu dropdown is not
thereby a spoke. Do not label an editorial pillar as a hub of a service page or the
reverse - the two cluster models share the vocabulary and nothing else, and a post
that bridges to a money page is linking into a money cluster, not joining it. And do
not use the labels on a site with a handful of pages: five service pages and an about
page are five standalones and a sibling ring, and writing "hub" on any of them
invents work.
