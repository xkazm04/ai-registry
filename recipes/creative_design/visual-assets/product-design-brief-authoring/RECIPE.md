---
name: product-design-brief-authoring
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/visual-assets
---

# Product design brief authoring

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Without one written description of how a product should look, every piece of
visual work is judged against a different unstated standard and none of it composes. The
brief that does exist is usually a paragraph of adjectives, and a brief that cannot rule
anything out settles no argument it was written to settle.

**Input.** Whatever the adopter already has: a brief they wrote, the product's own code
and surfaces where the answers are already encoded, or nothing but the product itself.

**Core action.** Name concrete colour roles, type treatment, spacing and layout
direction rather than adjectives, mark which statements describe the product as it is
and which are an intention, and take the adopter's own brief verbatim where one exists
rather than rewriting their brand direction.

**Output.** One written brief, specific enough that two people working apart would
produce compatible work from it and that a piece of work can be ruled out by pointing at
a line, reviewed by a human before anything is made from it.

## Activities

1. Establish where the brand direction can actually be read from *(observe)*
2. Decide whether the adopter's own brief stands as written *(decide)*
3. Write or complete the brief in roles and values, marking what is descriptive and what
is aspirational *(act)*
4. Test it against a decision it does not mention and against work it should have ruled
out *(decide)*
5. Put the brief in front of a person before anything is made from it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**There is one written description of how this product should look, specific enough that
two people working apart would produce compatible work from it.**

- The brief names colour roles, type treatment, spacing and layout direction rather than
  adjectives like premium or modern.
- It settles a decision it does not literally mention, because it gives roles rather
  than a list of values.
- A piece of existing work that does not belong can be ruled out by pointing at a line
  in it.
- The contrast and minimum size floors the product has to meet are in the brief, so on
  brand and legible cannot be argued as opposites later.

**The brief says which of its statements describe the product today and which describe
an intention nobody has built yet.**

- Each statement is marked descriptive or aspirational, because only the first can be
  checked against a running product.
- Where the brief was extracted rather than written, it says so, and it says what it
  could not find rather than filling the gap.
- A brief authored with no source to read from is presented as a proposal to the
  adopter, not as a description.

**When the product moves away from the brief, that shows up as a decision somebody made
rather than as a quiet edit.**

- A revision names what drifted, in which direction, and whether the product or the
  brief is being corrected.
- Work rejected repeatedly on the same brief dimension is read as the brief being wrong,
  not as three separate failures of the work.

## Guidance

A brief that cannot rule anything out is a mood board. Adjectives like premium and
modern survive anything you put beside them, so write roles and values instead: which
colour is a surface and which an accent, what body text must clear against what sits
behind it, what the type scale is. Test it on a decision it does not mention. Say which
statements describe the product today and which are an intention, because those are
different claims and only one is checkable against a screenshot.

## Where this is worth adopting

- A team that commissioned three pieces of visual work from three people and got three
  products back, with no line anywhere they could have pointed at to prevent it.
- A founder with real taste and no vocabulary for it, who turns work down without being
  able to say why, leaving whoever is making it to guess from the pattern of rejections.
- A product whose theme files already answer most of these questions, where the brief
  that exists is a paragraph written before the product was built and has never been
  reconciled with it.
- A team about to brief an outside agency, where vagueness is not free but paid for
  later in a round of revisions nobody budgeted.
- A product with an accessibility requirement, where on brand and meets contrast have
  already collided once and the brand won because only one of them was written down.

## Connector types

`development`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `development`.

## Recommended trigger

`self_paced`. Act when the product's own design has moved away from what the brief says,
or when work keeps being rejected on the same brief dimension, which means the brief is
wrong rather than the work. Neither is a clock and neither is an event the system emits:
it is a judgment made by looking, which is what self paced is for.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Whether the adopter already has a brief to be used as is, because rewriting someone's
  existing brand direction is a loss and the default here should be to extract rather
  than to replace.
- Which product or surface the brief governs, since one adopter may run several that are
  deliberately meant to look different from each other.
- What the product should feel like to its users, which cannot be read out of code and
  is the half that extraction always misses.
- Which accessibility floor the product is held to, because that turns two of the
  brief's lines from taste into requirements and decides what happens when they conflict
  with a colour the adopter likes.

## Dependencies

None.
