---
layer: technique
type: technique
subject: docs-content-model
technique: draft-visibility-gating
status: forged
laws: [one-validation-door, one-authority-per-vocabulary]
shared_with: []
use_when: [unfinished topics must live in the corpus without shipping, a hidden page still reachable by direct link, a neighbour arrow landing on a 404]
---

# Draft visibility gating

A catalog that can hold work in progress is worth a great deal: the topic is
written where it will live, reviewed in the same diff as the feature, and
published by flipping a field rather than by a migration. It is also a loaded
weapon, because "hidden" is not a property of a record — it is a property of
**every consumer that enumerates or resolves records**, and there are more of
those than anyone counts on the first pass.

## One predicate, and it is the only door

The visibility rule is a single function of the record and one flag, and every
consumer calls it. Not a filter written at each site; not a convention that
records with a certain field are skipped. One function, because validation
sprinkled across N call sites is validation minus the site added next quarter
([one-validation-door](../../../../_laws.md#one-validation-door)), and the
site added next quarter in a documentation surface is usually the sitemap or
the newly-introduced "related topics" strip.

Make the structure enforce it rather than the discipline. The accessor that
returns *all* records is the awkward one — internal, named for what it is, and
reserved for the integrity check that must see everything. The accessor that
returns visible records is the default, the short name, the one autocompletion
offers. A consumer has to work to get the unfiltered set, and that is the
entire mechanism.

The flag driving the predicate is **build-time** wherever the surface is
statically generated. A request-time flag over a page rendered at build time
does not gate anything: whatever the flag said during generation is what
shipped, and the runtime check is theatre. Decide the flag's authority once
and name it, because a visibility vocabulary with two sources is the same race
as any other duplicated vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Enumerate the consumers, in writing, next to the predicate

The reason drafts leak is not that anyone disagrees with hiding them. It is
that the author fixed the consumer they were looking at. The full set, and
what each one leaks if it is skipped:

- **Navigation** — the obvious one, and the one that gets fixed first, which
  is why the others are so easy to believe are done.
- **Search** — the index is built by walking the catalog; an unfiltered walk
  publishes the draft's title and summary to anyone typing a related word.
- **The machine-readable site inventory** — the highest-consequence leak,
  because it hands the address to a crawler and the draft acquires an audience
  that never saw the sidebar.
- **Previous/next neighbours** — see below; this one is a defect even when the
  draft itself is correctly hidden.
- **Direct address resolution** — the route that turns an address into a
  record. It does not enumerate, so it does not feel like a consumer, and it
  is the one everyone forgets. A resolver that finds the record and renders it
  makes every other gate cosmetic: the page is one guessed or leaked link
  away.
- **Category pages and counts** — a section listing its topics is an
  enumeration; a section whose every topic is a draft must not advertise
  itself as a populated section.
- **Inbound deep links from elsewhere in the product.** The consumer nobody
  writes down, because it does not live in the documentation surface at all: a
  feature page, a marketing card or an empty state that links into a topic by
  hand. The link is a string; nothing type-checks it; and if it points at a
  draft, the gated resolver turns it into a shipped button that 404s in
  production. Gate these with a test that walks every hand-authored reference
  and asserts three things — the topic exists, it is in the category the link
  claims, and it is visible in a production build — and assert the reference
  collection is non-empty, or the test passes perfectly over nothing.

Write the list where the predicate is defined. The next consumer's author will
read it there and nowhere else.

## Readiness and audience are two axes, and fusing them breaks one of them

A mature catalog usually grows a second filter — a topic shown only to one
audience, one product tier, one experience mode. It is tempting to run it
through the same predicate. Do not: the two gate different things.

**Readiness** (is this finished?) is decided at build time and gates the
**address**. An unfinished topic must not resolve, because it is not published
prose and no URL should reach it.

**Audience** (is this for you?) is decided at request time by something the
reader chose, and gates only the **listing**. The topic is published; it is
simply not offered in this view. Making an audience filter refuse the address
converts a published page into a 404 for anyone who followed a link — from a
colleague, from search results, from their own history — which is a defect,
not a policy.

Two predicates, two return types, two sets of consumers, and the route handler
calls exactly one of them.

## Sequences walk the visible set, or the arrow lands in a hole

Previous/next is the subtlest member of the list because it fails on a page
that is entirely correct. Compute the neighbour pair over the full ordered
catalog and the published topic *before* a draft gets an arrow pointing at it.
If the resolver is gated, that arrow is a 404 on a published page — a visible,
reader-facing defect produced by the safety mechanism. If the resolver is not
gated, it is a guided tour into the unpublished work.

The rule: build the sequence from the same filtered collection navigation
uses, then find the current topic's position within it. Filtering after
computing neighbours is the bug — it removes the draft from the list and
leaves the gap where it was.

The same applies to any "next in this section" affordance, any keyboard
shortcut that advances through topics, and any generated table of contents.
All of them are sequences over the catalog; all of them take the filtered one.

## The one thing that must see everything

The referential integrity check
([catalog-referential-invariants](./catalog-referential-invariants.md)) runs
over the **unfiltered** set, always. A draft topic with no body is still a
defect — it is the defect, sitting one flag-flip away from production — and an
integrity check that inherits the visibility filter goes green on exactly the
corpus that is about to break when someone publishes. This is the legitimate
use of the awkward accessor, and it should be the only one.

## Decision rules

- **When a topic is unfinished and the corpus is the right place to draft it,
  gate it.** When it is unfinished and speculative, it is a branch, not a
  record; a catalog full of drafts nobody intends to publish makes every
  consumer's filtered walk pay for prose that will never ship.
- **When the flag is on in a preview environment, say so on the page.** A
  reviewer looking at a draft in a preview build should not have to remember
  which environment they are in; an unmistakable marker on the rendered draft
  costs one component and prevents a screenshot of unpublished work being
  circulated as shipped.
- **When you add a consumer, the first line is the predicate.** Not the last —
  the first, before the enumeration exists to forget to filter.
