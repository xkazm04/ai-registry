---
layer: technique
type: technique
subject: ui-controls
technique: call-site-ownership
status: forged
laws:
  - one-authority-per-vocabulary
  - gate-sees-target
  - count-carries-predicate
shared_with: []
use_when: [a shared control accepts a class or style passthrough, a token gate is green but controls still look different at every call site, deciding which styling a caller may pass to a primitive, an agent restyles the components it was handed while building a page, override counts climbing on one control with no raw values in them]
---

# Call-site ownership: the caller places, the control appears

[variant-discipline](./variant-discipline.md) closes a control's variant set
and keeps one named door open for the genuine one-off. This technique is
about what may walk through that door, and it starts from an observation the
token gate cannot make: **a restyle made entirely of legal tokens is still a
restyle.** A call site that hands a button `bg-primary/15 text-primary/90`
has used nothing but semantic roles. The raw-value gate from
[token-enforcement](../../../feedback-and-style/design-tokens/techniques/token-enforcement.md)
passes it, correctly, because its question is *which value* and every value
is on the system. The question it never asks is *who is entitled to set this
property on this element*, and that is the question the drift is in.

## Two families, two owners

Every styling property on a control's root belongs to one of two families,
and the families have different owners:

- **Placement** — where the control sits and how much room it gets: outer
  margin, width and height constraints, flex and grid child behaviour,
  positioning, stacking order, visibility. These depend on the *surrounding*
  layout, which the control cannot know. They belong to the caller.
- **Appearance** — what the control looks like: inner padding, color,
  typography, border and radius, shadow and effects, motion. These are the
  control's identity, bound to its variants. They belong to the control.

The partition is the contract, stated once: **a caller may place a control;
it may not restyle it.** It follows from the same reasoning that keeps outer
margin *out* of a component: the control does not own its surroundings, so
it should not set its outer spacing, and for the same reason the caller does
not own the control's inside, so it should not set its padding. Each side
owns what only it can know.

The door is therefore not one channel but two: placement passes freely, and
appearance does not pass at all unless the control's contract names the
family (below). A passthrough that admits both is the open styling channel
the variant set was built to close. It is only hidden better, because it no
longer carries raw values.

## The gate reads the family, not the value

An ownership gate is orthogonal to a token gate, and neither implies the
other:

| | token gate | ownership gate |
| --- | --- | --- |
| question | is this value on the system? | may this site set this property? |
| reads | the value's spelling against the vocabulary | the property family against the site's role |
| passes on-token restyle | yes, by design | no |
| catches raw value on a placement prop | yes | no, and it shouldn't |

Measured on one production tree with a mature token system (the
application below): of 34 call sites passing appearance classes to its
shared button, **17 used only semantic roles and scale steps**, invisible to
any raw-value gate at any severity. The project's own gates saw 0 of the 34.
A second, independent measurement (a design-system linter's paired eval
across three models) reached the same shape from the other side: on neutral
page-building tasks with no styling language in the prompt at all, **every
finding was an appearance class passed to a component from outside.** When
the vocabulary is complete, an author does not invent values. It restyles
the components it was given.

So the ownership gate is not a stricter token gate. It sees a different
population, and on a tree whose token discipline already holds, it is the
larger one.

## The remedy is read from the control's own contract

An ownership refusal must name where the change belongs, and there are only
three places. Each is read from an authority that already exists, not typed
into the rule:

1. **An existing variant.** The control's variant definition is the
   authority for its visual forms, so the gate reads it and lists the legal
   values in the message: *this control owns its spacing; use one of its
   sizes*. When a size is added, the message learns it without an edit
   ([refusal-names-a-reachable-remedy](../../../../engineering-process/standards-and-gates/quality-gates/techniques/refusal-names-a-reachable-remedy.md)
   holds the general rule: resolve the remedy where the message is built).
2. **Placement on the caller's side.** Space *around* a control is margin on
   the control or gap on its parent, never the control's padding.
3. **A new variant**, when the design calls for one. This is a change to the
   design language and gets reviewed as one
   ([variant-discipline](./variant-discipline.md)). The gate does not decide
   whether the variant belongs. It only makes sure the decision is made in
   the control, where it can be seen.

A refusal that offers only the first two and never the third teaches
suppression. Real designs do need new forms, and a gate that has no legal
route to one gets overridden.

## Contracts grant families, per control

Some controls legitimately delegate a family: a card whose title may take a
type size from the caller but not a weight, a content region whose padding
is the page's decision. The grant lives in configuration keyed by control
identity, **names the family, not the class**, and can deny inside the grant
(title: type size yes, font family and weight no). Two properties keep it
honest:

- **Grants are narrow and named.** A grant of "appearance" is the open
  channel with paperwork. A grant of "type size on the title" is a contract.
- **Grants are countable.** Like any escape hatch, the set of grants is one
  file a reviewer can read, and its growth is a signal: a control that needs
  five grants is missing variants.

## What the gate needs from the tree

The ownership gate only works when three things hold, and each is a design
constraint on the control library rather than on the gate:

- **The control declares its variants in a form the gate can read.** A
  control that takes a free class string and nothing else has no variant
  vocabulary, so the gate has nothing to suggest and every refusal is a dead
  end. The prerequisite is the closed set, not the linter.
- **Class values are statically readable at the site.** A class computed in
  a template or passed through an unreadable spread cannot be classified.
  The gate makes that form a finding of its own ("make this static") rather
  than skipping it, because a skipped position subtracts from recall
  silently. That is the unvisited-branch failure
  [token-enforcement](../../../feedback-and-style/design-tokens/techniques/token-enforcement.md)
  describes.
- **The control is recognized as a control.** Ownership is a property of a
  *design-system* element. A locally rebuilt copy is outside the gate, which
  is one more reason the shadow-copy ratchet in
  [adoption-enforcement](./adoption-enforcement.md) matters: every fork is a
  control the ownership gate cannot see.

## What it cannot see

State these limits in the rule's documentation, because a clean run reads
as coverage:

- **Descendant selectors** that restyle a child from its parent's class
  list, and **stylesheet rules** outside the markup. A style-layer linter
  owns those.
- **Values followed across module boundaries.** A class assembled in another
  file and imported is outside a per-file analysis.
- **Vocabulary growth.** A new token or a new variant is on the system by
  definition. When the gate refuses a restyle, the cheapest route to green
  for a machine author is to mint the form it wanted, and the gate will pass
  it. That is the intended outcome when the form belongs, and the
  admission review is where "belongs" is decided. The ownership gate
  therefore moves the review from the call sites to the control's
  definition, and it does not remove the review
  ([the vocabulary is the escape hatch nobody counts](../../../feedback-and-style/design-tokens/techniques/token-enforcement.md#the-vocabulary-is-the-escape-hatch-nobody-counts)).

## Adopting it on a tree that already drifted

A tree with a closed variant set and years of call-site restyling will fail
the gate at dozens of sites, and each failure is one of two things: a
missing variant (the same override repeated across sites names it) or a
one-off that should have been a placement change. Baseline the count per
control and fail on increase ([ratchet-design](../../../../engineering-process/standards-and-gates/metric-gates/techniques/ratchet-design.md)),
then read the override census as the variant backlog, most-repeated class
string first. On the measured tree above, the largest cluster is thirteen
sites overriding the text color to the plain foreground role, which reads as
one missing variant asking for its name. Of the seventeen sites passing
palette colors by class, sixteen used a hue the control's own destructive or
accent variants already carried, though not always at the same emphasis.
That is partly a routing failure (the variant existed and was not reached
for) and partly a missing emphasis axis, and the census cannot tell the two
apart. A reader of the sites can.
