---
layer: technique
type: technique
subject: plan-entitlements
technique: tier-model-single-source
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [adding or renaming a paid tier, building a pricing page, discovering two places that list the plans]
---

# The tier model as a single source

One declarative structure defines the tiers. Every consumer — the gate, the
pricing surface, the lifecycle handler, the analytics rollup that segments by
plan — derives from it and adds nothing of its own. The alternative is not
"slightly more duplication"; it is
[two authorities for one vocabulary](../../_laws.md#one-authority-per-vocabulary),
and the tier vocabulary is unusually expensive to have two of, because the
divergence is monetary.

## What the model holds

The model is keyed by tier identifier, and each entry carries everything a
downstream consumer would otherwise invent:

- **The identifier** — the value persisted on tenant rows and set by
  lifecycle events. Stable, opaque, never shown.
- **The display label and short description** — what a human reads. Free to
  change (see [id-vs-label-split](id-vs-label-split.md)).
- **Quantitative limits**, one field per limit, expressed so that a gate can
  compare without interpretation: seats, projects, retention days, periodic
  allowance. Every limit needs a declared sentinel for "unbounded" and the
  sentinel must mean the same thing to every reader — an unlimited encoded as
  zero in one gate and as absent in another is the classic silent-denial bug.
- **Boolean capabilities** — the named features the tier includes, as flags
  with the same names the gates use. Not a free-form list of marketing
  bullets; a closed set that a predicate can index.
- **The ordering rank** — because "is this an upgrade or a downgrade?" is a
  question the lifecycle handler and the interface both ask, and a comparison
  over labels is not an answer.
- **A display price**, if the product renders one, explicitly marked as a
  duplicate of the price book — see
  [price-book-authority](price-book-authority.md).

## What the model must not hold

- **Per-tenant state.** The model describes tiers, not tenants. A tenant's
  current usage, balance, or subscription status is looked up; putting it in
  the tier model turns a static table into a cache with no invalidation
  story.
- **Prices as authority.** The figure in the model is for rendering. The
  system that charges the card is the authority.
- **Marketing copy blocks.** Long-form pitch text belongs to the content
  layer. Mixing it in means every copy edit touches the file the gate imports,
  and reviewers stop reading diffs to it carefully — which is exactly the file
  where careless diffs cost money.

## Derived values name their recomputation

Anything computed *from* the model — an annualized price, a "most popular"
badge, a comparison matrix, a per-seat unit figure — is derived at read time
from the model, or, if it must be precomputed, states how it is recomputed
and from what, per
[derivation naming recomputation](../../_laws.md#derivation-names-recomputation).
A hand-maintained comparison table that was *once* generated from the model is
the most common form of tier drift, because it looks derived and is not.

This has an editorial consequence that is easy to get wrong. When a headline
figure is derived from the model and rendered in its own right — the included
volume, the seat count — the tier's hand-written bullet list must hold only
what the derived line does **not** already say. Otherwise the same fact
appears twice on one card, from two sources, and the day the model changes
they disagree in public. State each fact once, and let the position on the
card carry its emphasis.

## Decision rules

- **When a new consumer needs to know something about a tier, add a field to
  the model — never a local constant.** The second local constant is where
  the drift starts, and it is always added under deadline.
- **When a limit needs to differ per tenant** (an enterprise deal, a
  grandfathered account), express it as an override *layered over* the tier
  model, resolved in one place, with the tier value as the fallback. Do not
  fork the tier set into per-customer tiers; a tier set that grows one entry
  per negotiation stops being a vocabulary.
- **When a tier is retired, keep its entry.** Existing rows still carry its
  identifier, and a lookup miss must not be the way the product discovers
  that. Mark it unavailable-for-purchase and keep it readable, forever.
- **When two surfaces must show different subsets of tiers**, filter the
  model, do not copy it. Filtering is a predicate that survives a new tier;
  copying is not.

## The measurement

The health check for this technique is mechanical: **add a hypothetical tier
and enumerate the edits.** The model entry, plus any surface that genuinely
needs new bespoke copy — nothing else. If a gate, a switch statement, a
validation enum or a pricing array also needs touching, that is the list of
places that hold a second copy of the vocabulary, and each one is a future
divergence with a date on it.

A second, cheaper check: search for the tier identifiers as literals. Every
occurrence outside the model is either a legitimate reference through the
model's exported constants or an inlined copy. The ratio is a good proxy for
how much this product will hurt the next time pricing changes.

## When not to use this

- **A product with exactly one paid tier and no roadmap for another** may
  legitimately hold a boolean. The moment the second tier is discussed, build
  the model — retrofitting after the second tier ships means migrating the
  gates while the pricing page is live.
- **Where the tier structure is genuinely per-customer** — a contract-driven
  enterprise product where no two agreements match — the single source is the
  *shape* of an agreement, not a table of tiers. The discipline transfers; the
  data structure does not.
