---
layer: technique
type: technique
subject: repository-landing-document
technique: landing-document-as-router
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a front page has grown past a screen and nobody can say what to cut, deciding whether a section moves out to its own page, writing the destination cells of a routing table]
---

# The landing document as a router

The landing document's job is to get each reader to the page that answers
them, not to answer them. Stated that baldly it sounds like an evasion — the
project has something to say and this technique is telling it to say it
elsewhere — so the argument has to be made in terms of what the alternative
actually costs. A section that answers a question only some readers have is
paid for by every reader who does not have it, in the one place none of them
can skip. On a page read for forty seconds, the cost of the third section is
not that it is long; it is that it displaces the second reading of the first.

## The budget is a population count, not a word count

The tempting rule is a length limit, and it is the weakest thing anybody
proposes about landing documents. A library's readers are almost entirely
adopters who want an interface and a version constraint. An application's
readers are split between evaluators who will never install it and operators
who need a runbook. A plugin's readers arrive from a marketplace card and
already know what it is. A workspace of many packages has readers who do not
yet know which package they want, which is a routing question before it is
anything else. One word count across those four is a number picked from a
sample of one project and then defended as a standard.

The rule that transplants is a **population test**, applied section by
section:

> A section stays on the landing document if **every** reader population needs
> it. It moves to its own page — and leaves a routing row behind — the moment
> it is needed by some populations and not others.

Run it against the usual sections and the answers stop being matters of taste.
*What is this* — every population. *How do I install it* — every population,
in its shortest form; the four installation paths for four different
environments are a some-readers question and move out. *What can it do* —
every population, at the level of a capability list; the specification of each
capability is a some-readers question. *How the internals work*, *how to
contribute*, *how to troubleshoot the failure that happens on one operating
system*, *the full option reference* — none of these is universal, and each
one on the front page is a tax on three populations to serve one.

A second test catches what the first misses, because a section can be
universally relevant and still not belong: **can this reader act on it here?**
An installation path they can copy, yes. A configuration reference they will
consult while editing a file in another window, no — that reader will be on a
different surface when they need it, and putting it here means they will
scroll past it now and search for it later.

## What the router owes its destinations

A routing table with useless cells is worse than no table, because it consumes
the space a table would have earned and returns nothing. The failure is
specific and near-universal: destination cells that name the destination
twice. *Installation — installation instructions.* *Development — information
for developers.* A reader learns nothing from those that the link text did not
already tell them, so the decision they came to make — is my answer behind
this link or the next one — is exactly as unmade as before.

The rule is that **a destination cell enumerates the destination's actual
contents**, in the reader's vocabulary, at a grain fine enough that a reader
with a specific question can see their question in the list. Not *everything
about freshness* but *the citation format, the status table, the cost model,
where to automate it, and what never reaches a slide*. This is
[count-carries-predicate](../../../../_laws.md#count-carries-predicate)
transposed from numbers to links: a pointer that travels without its predicate
will be followed for a claim it does not support, and the reader who follows
three such links stops following them.

Three further obligations follow from that one:

- **Every destination is reachable from the router.** A page that exists and
  is routed to by nothing is a page nobody reads, and its author will
  eventually and correctly conclude that documentation is not worth writing.
  When a section moves out, the row goes in during the same change, or the
  move was a deletion with extra steps.
- **The router is exhaustive over the deeper pages, not a selection.** A
  curated subset means the reader cannot tell, from the front page, whether
  their question has a page at all — which reintroduces the search the router
  existed to remove.
- **Rows are ordered by reader population, not by the project's structure.**
  The order the pages were written in is a fact about the authors; the reader
  wants adopters' pages before contributors' pages because that is the order
  the populations arrive in.

## The countable form of the budget

The population test above is a judgment, and a judgment is not reviewable at
three in the afternoon by someone who did not write the page. It has one
countable consequence, and this is the number to hold a team to instead of a
word cap:

> **The front page holds fewer words than the pages it routes to, added
> together.** Both counted by the same counter, on the same day.

That rule is independent of repository kind, which is exactly what a word cap
is not — it scales with however much documentation a project actually has,
rather than asserting a length that happens to suit a library and starves an
application. It also fails, by construction and correctly, the project that
routes nowhere: a front page competing against a sum of zero cannot win, and
the finding is accurate, because a front page with no destinations is not a
router.

Measured on 2026-09-01 across seven working repositories and one published
project on a single counter: **seven of seven working repositories route to
zero pages**, and so fail this rule at the extreme. The published project's
front page holds **1,033 words** and routes to four pages. That instance is
worth arguing about and not worth adopting; what a team should adopt is the
comparison, run on their own tree.

Two honest limits on the rule. It says nothing about whether the routed pages
are any good — a front page can win the comparison by routing to four bad
pages, and the destination-cell obligation below is what guards that. And it
is a smell rather than a proof: a genuinely tiny project can fail it while
being perfectly well composed, which is the first exemption at the end of this
document.

The corollary is that this technique cannot be applied to a project with no
deeper pages. Moving a section out requires somewhere to move it to, and a
project whose entire prose corpus is one file has to *write* the second page
before it can shorten the first. That is real work and it is the reason
overgrown landing documents persist: shortening looks like deletion until the
destination exists, and no reviewer approves deletion.

## When not to route

Three cases where the section stays put despite failing the population test.

**A project small enough that the whole corpus fits in one screen.** Routing
has a fixed cost — a click, a page load, a lost place — and below some size
the cost exceeds the saving. If the entire document is under a screen and a
half, there is nothing to route; adding a table of destinations to a document
with two sections is ceremony.

**The proof of life.** A landing document has one job that is not routing and
not answering: demonstrating that the project is real and current. A figure, a
worked example, a recent version, a passing check — these serve no single
population's question and cannot be moved out, because their entire function
is being seen by a reader who was not going to click anything.

**The one thing the project is for.** If a project exists to do a single
thing, the shortest demonstration of that thing stays on the front page even
when it is long by the budget's standards, because a router that routes away
from the reason the reader came has optimized the wrong quantity.
