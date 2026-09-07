---
name: sanitized-corpus-derivation
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/knowledge-curation
---

# Sanitized corpus derivation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A corpus built for one person or one team accumulates material that cannot be
shared, and the value of sharing the rest is high enough that somebody will do it by
hand and get it wrong. What leaks is rarely the obvious surface: it is the claims
derived from the documents that sit outside their prose, the references that still point
at what was removed, and the earlier versions that survive wherever the corpus keeps its
history.

**Input.** The corpus as it stands, the audience it is being derived for, every surface
that audience could read it through, and whatever an earlier derivation left behind.

**Core action.** State the exclusion as a rule of categories before any item is read, so
what leaves is decided by the rule rather than argued item by item, derive a copy
instead of editing the original, and then prove the strip held by attacking the derived
copy through every path that can read it rather than by reading back over what was
removed.

**Output.** A derived corpus that carries its exclusion rule beside it, a record of what
the rule took out and what it deliberately kept, and evidence from every reading path
tried against the copy that ships rather than against the one it came from.

## Activities

1. State the categories that leave and the categories that stay, before reading any item
*(decide)*
2. Enumerate every surface the audience could read the corpus through *(observe)*
3. Build the shareable copy from the original rather than stripping the original *(act)*
4. Remove by the stated rule, judging each item against it rather than around it *(act)*
5. Interrogate the derived copy through every reading path until it stops answering
*(act)*
6. Hand over the copy with its rule, its exclusions and the paths that were tried
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The exclusion is a rule a second person could apply to the same corpus and reach the
same result.**

- What leaves and what stays are both written down as categories before the first item
  is read.
- Any removed item can be traced to the category that removed it.
- A second pass over the same corpus under the same rule removes the same things.

**The derived copy was attacked rather than inspected.**

- Every surface the audience can read through was tried, including the ones that are not
  the documents.
- The checks ran against the copy that ships, never against the original it was derived
  from.
- A search that came back empty is distinguished from a search that was narrowed until
  it came back empty, and from one that was never run.

**The original still holds what it was right to hold, and the copy holds nothing nobody
read.**

- The original keeps the material that was the reason it existed.
- Nothing reached the derived copy that the pass did not read.
- The record of what was removed sits where the deriving party can read it and the
  receiving audience cannot.

## Guidance

Write the rule first. An exclusion argued item by item is a taste, and taste does not
survive a second reader or a second pass. Derive a copy: the original was right to hold
what it holds. Then attack what ships through the paths a reader has, not the list of
what you removed, and treat a soft deletion as retention until something proves
otherwise. A pattern narrowed until it stops matching has certified nothing.

## Where this is worth adopting

- A founder or a lead standing up a shared corpus out of their own, where the knowledge
  the team needs and the assessments they must never see live in the same documents and
  often the same paragraph.
- Onboarding somebody into a body of material that has never been read with an outsider
  in mind, where the alternative is to hand it over and hope, or to withhold all of it
  and lose the value.
- A shared corpus that was derived cleanly once and has accumulated ever since, because
  whatever feeds it does not know the rule and nobody has looked since the day it was
  handed over.
- A corpus about to go outside the organization, where every exclusion has to survive
  somebody asking which rule removed a given item and the honest answer cannot be that
  it looked sensitive.
- A derivation somebody already did by hand and offered as finished, where the only
  evidence that it holds is that the person who did it read it over afterwards.

## Connector types

`knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The work is owed by a change in who can read the corpus: a new audience, a new
member, a new source writing into it. A clock sees none of those, and a derivation run
against a corpus nobody has shared since the last one spends attention on nothing. Where
the corpus is fed continuously the adopter should add a clock as well, because a corpus
still being written into starts accumulating again, and that is the one part of this
work with no event to announce it.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What this adopter must never share, stated in their own terms, because the categories
  are the rule and a rule borrowed from somebody else's corpus removes the wrong things
  while missing theirs.
- Which surfaces their corpus can be read through besides its documents, since a check
  that misses one certifies a copy that still answers the question it was supposed to
  stop answering.
- Whether the copy is being stood up fresh or already exists and is being checked again,
  because the two protect different things: an original that must survive intact, or a
  live copy that people are already reading.

## Dependencies

None.
