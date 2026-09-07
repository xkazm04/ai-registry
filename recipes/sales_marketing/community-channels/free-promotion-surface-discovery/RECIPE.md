---
name: free-promotion-surface-discovery
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/community-channels
---

# Free promotion surface discovery

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Lists of places to promote a product are generic by default, which means they
fit any product and are therefore worth nothing to this one. The expensive version of
the mistake is not the wasted afternoon: a promotion posted into a community whose rules
forbid it costs standing that cannot be bought back, and plenty of them ban on the first
offence, so the suggestion nobody checked is the one that removes a channel permanently.

**Input.** What the product genuinely does, read from its own current materials rather
than assumed, and the record of which surfaces were tried, which were accepted, and
which categories turned out to be noise and why.

**Core action.** Find the specific forums, communities, newsletters and directories
where this product's actual users already gather, judge each on fit rather than audience
size, and confirm it is still alive and that its own rules permit what is about to be
posted there.

**Output.** A small set of candidate surfaces, each justified by something the product
actually does, each labelled as a place with people or a listing without them, none
already tried and none in a category already rejected, or an honest report that this
pass found nothing new.

## Activities

1. Read what the product actually is now, from its own materials *(observe)*
2. Set aside surfaces already tried and categories already rejected *(decide)*
3. Look for where this product's users already gather *(act)*
4. Check each candidate is still active and what its rules say about promotion
*(observe)*
5. Judge each on fit rather than audience size, and say which kind of surface it is
*(decide)*
6. Present a small set for a verdict on each, or report that nothing new was found
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The product ends up present where its actual audience already gathers, found by
looking rather than by listing the obvious.**

- Each suggested surface is justified by something specific the product does, so the
  justification would not survive being applied to a different product.
- Fit is argued from how closely the audience shares the problem, not from how large it
  is.
- Each candidate says whether it is a community with people in it or a listing without
  them, because the two need different work and take different amounts of time.

**No suggestion puts the adopter's standing at risk, and none sends them somewhere that
no longer exists.**

- Every candidate carries what that place's own rules say about self promotion, and a
  candidate whose rules were not read is not proposed.
- A surface with a large historical membership and no recent activity is reported as
  dormant rather than as a find.
- Surfaces the adopter has declared off limits never appear, whatever the fit looks
  like.

**Each pass covers ground the previous ones did not, and eventually says so instead of
circling.**

- Surfaces already tried are not suggested again, and a rejection is recorded with the
  reason rather than as a bare no.
- A category rejected more than once stops being searched, rather than returning under a
  different name.
- A candidate refused as generic is recorded against its justification rather than
  against the surface, because the place may still be the right one and it was the
  reasoning that was hollow, and the next pass drops that shape of argument instead of
  striking the surface off.
- A pass that finds nothing new reports that plainly, and does not fill the gap with
  candidates it would not otherwise have proposed.
- Suggestions are re-derived from the product's current description, so a surface
  justified against a stale one is not carried forward unexamined.

## Guidance

The test for every candidate is whether it could have been suggested without reading
anything about this product. If it could, it is a list of the obvious and worth nothing.
Fit beats size: two hundred people with exactly this problem is a better surface than
two hundred thousand who might. Check what each community's own rules say about
self-promotion before proposing it, because the cost of getting that wrong is standing
you cannot buy back. A pass that finds nothing new has finished the niche, not failed.

## Where this is worth adopting

- A newly launched product whose founder has already posted it to the same four places
  everybody posts to, got nothing back, and has no idea where to look next.
- A niche business tool whose real users gather in two or three trade forums nobody
  outside that trade has heard of, where every generic promotion list is useless by
  construction.
- A team that has been doing this by hand for months and can no longer remember which
  communities they already tried, so the same three keep coming back and one of them has
  already banned them.
- A product that has changed substantially since launch, where the surfaces chosen
  against the original description are now the wrong ones and nobody has revisited the
  reasoning.
- A solo maker with more time than budget, for whom the cost of a bad suggestion is not
  the wasted hour but a permanent ban from a community they would have wanted later.

## Connector types

`development`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `development`.

## Recommended trigger

`self_paced`. Act when the product's own description has changed enough to open surfaces
that were not a fit before, or when the accepted set has been worked through. Slow down
as memory maps the obvious ground, because the tenth pass over the same niche finds
nothing and a fixed cadence would make it pad to look productive.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the product is in the adopter's own words, since a description read from a
  repository is often stale, internal, or written for people who already know what it
  is.
- Which communities are off limits, because posting in the wrong place costs more than
  the visibility was worth and this work cannot know the adopter's history in a place it
  has never been.
- Whether the adopter wants candidates only or wants drafted approaches too, since the
  second asks this work to write in their voice to strangers and is a larger grant than
  the first.
- Who gives the verdict on each candidate and how it comes back, because the memory of
  what was tried and why it failed is the only thing that makes the second pass better
  than the first.

## Dependencies

None.
