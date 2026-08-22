---
layer: technique
type: technique
subject: docs-content-model
technique: product-location-mapping
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [documentation describes a feature that lives in another artifact, prose navigation instructions going stale after a rename, linking a product surface to the topic that explains it]
---

# Product-location mapping

Documentation about a product is a standing claim about that product's
*shape*: this feature is in that area, reached from that panel, configured in
that dialog. Written as prose, the claim has no relationship to the product —
the area gets renamed, the panel moves, and the sentence stays exactly as
correct-looking as it was the day it was written. This technique makes the
coarse half of that claim **data on the topic record**, so a rename becomes a
type error instead of a reader's dead end.

## Type the coarse handle, leave the fine handle in prose

The instinct is to encode the whole path — area, screen, panel, control — and
it is wrong, because the segments have completely different half-lives.

- **The coarse handle** — the module, area or top-level surface the feature
  belongs to — changes rarely, is a closed vocabulary the product already
  has, and is what a reader actually needs to orient. Type it: a declared
  enumeration, referenced by the record, so an unknown value fails to compile
  and a removed value fails everywhere it was claimed.
- **The fine handle** — the exact panel, the button's label, the field's
  position — changes constantly and is not a vocabulary anybody maintains.
  Typing it produces a maintenance tax with no enforcement behind it, because
  nothing on the product side is going to be renamed in the same commit.
  Leave it as prose in the body, where it belongs and where a reader forgives
  it being approximate.

The line between them is not aesthetic. It is: *is there something on the
product's side that a type can bind to?* If yes, bind. If no, prose.

## Name the other side's authority where the type cannot reach

The common case is that the documented product is a different artifact than
its documentation — a separate application, a separate repository, a separate
release cycle. The type system stops at the boundary, so the enumeration on
the documentation side is a **mirror**, and a mirror maintained by nothing is
a copy that drifts.

Two things make it survivable, and both are cheap:

- **The map declares, in its own header, which artifacts on the other side are
  its source of truth** — the specific files or registries that define the
  real vocabulary. Not "the product"; the actual addresses. A cross-artifact
  coupling's only enforcement is a human's habit, and a habit needs an
  address: the person doing the rename greps for the name, finds the map,
  reads the header, and knows what they are looking at within seconds. Without
  the header they find an unfamiliar list and move on.
- **The mirror is one authority on this side**
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
  one enumeration, one map, every consumer deriving from it. A second copy —
  one for navigation labels, one for the documentation links — is the same
  race as always, and it is worse here because both copies look correct in
  isolation.

Where the two sides *are* buildable together, do better than a mirror: import
the vocabulary and delete the copy. The mirror is a concession to a boundary,
not a design.

## The mapping runs both ways

Once a topic declares which product area it describes, the product can use the
same relation in reverse — a help affordance on a panel that links to the
topic explaining it, an empty state that points at the concept page, a
settings row with a "what is this" that resolves. This is where the
documentation surface stops being a place users are sent and starts being part
of the product.

The inbound direction has a hazard the outbound one does not: the link is
authored on the product's side, by hand, in a codebase whose tests know
nothing about the catalog. Nothing type-checks the address, so it can point at
a renamed topic, at the right topic under the wrong category, or at a topic
gated out of production — and the last one ships a button that 404s. Gate the
inbound refs where they are authored, against the same catalog and the same
visibility predicate
([draft-visibility-gating](./draft-visibility-gating.md)), and name the
authoring surface in the failure so the fix has an owner.

It works only if the inbound link is addressed by the topic's **minted id**,
not by its title, its slug-of-the-title, or its position in a section
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
title-derived address breaks on the most ordinary editorial act there is —
renaming a page — and it breaks *from the product's side*, where the failure
is a dead help link in a shipped build and nobody who edits documentation is
watching. Mint the id at creation, keep the title free to change, and if the
address must be human-readable, treat the readable slug as a redirect layer
over the id rather than as the identity.

## Decision rules

- **When the described feature is not in a product surface at all** —
  conceptual pages, glossaries, background — the field is absent, and its
  absence means *nothing to point at*, declared the same way the freshness
  fields declare theirs
  ([per-topic-freshness-metadata](./per-topic-freshness-metadata.md)).
- **When a topic describes several areas, declare several** — but a topic
  claiming more than a handful is usually an overview that should declare
  none, because a mapping that points everywhere points nowhere.
- **When the vocabulary is not stable enough to enumerate**, do not fake it.
  A mirrored list of values invented on the documentation side, with no
  counterpart on the product side, is a vocabulary with one authority and no
  subject — it will pass every check and describe nothing.
