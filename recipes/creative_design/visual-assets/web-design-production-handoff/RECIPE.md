---
name: web-design-production-handoff
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/visual-assets
---

# Website design production and developer handoff

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A handoff fails loudly when screens are missing and quietly when they are
beautiful. A directed design drawn at one width with the copy that flattered it reads as
finished to everyone who looks at it, so nobody asks what the page does when the list is
empty, when the name is forty characters long, or at the width between the two that were
drawn. Those questions do not disappear; they are answered during the build, silently,
by whoever is implementing, and they land in production as design decisions nobody made
and nobody reviewed. By the time they are visible they are code, and changing them costs
more than deciding them would have.

**Input.** The approved art direction and whatever it has actually settled, the screens
and components already drawn, the real content the surface will carry including its
extremes, the widths and devices the surface is committed to supporting, and the
constraints of the system the builder will assemble it in.

**Core action.** Work out what the direction has not decided, separate the gaps the
design must settle from the ones that are honestly the builder's call, and write the
specification so that the difference is explicit rather than implied. Over specifying is
its own failure: a spec that dictates every pixel of behaviour the builder is better
placed to judge gets ignored in the parts that mattered along with the parts that did
not.

**Output.** A screen set covering the states and widths the surface can actually reach,
annotated so behaviour between the drawn widths is stated rather than inferred, handed
over with two named lists: what is deliberately left to the builder, and what is still
unanswered because the direction owner has not answered it. A pass that finds nothing
unresolved still leaves that verdict on the record, because a handoff that says it was
checked is different from one nobody checked.

## Activities

1. Read the approved direction and establish what it has actually settled *(observe)*
2. Inventory the states, widths and content extremes the screens do not yet answer
*(observe)*
3. Separate the gaps the design must settle from the ones that are the builder's call
*(decide)*
4. Produce the missing screens and settle the spacing, type and layout decisions behind
them *(act)*
5. Write the specification so behaviour between the drawn widths is stated, not implied
*(act)*
6. Hand over with the open items named rather than quietly absorbed *(deliver)*
7. Review what was built against the specification and route each difference to its real
owner *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every decision the shipped surface embodies was made by somebody who knew they were
making it.**

- Each screen that can reach an empty, loading, error or partial state has that state
  drawn or has it explicitly delegated with the rule the builder should follow.
- Text containers are shown at content lengths the product can really produce, not only
  at the length that fit the layout.
- The specification states behaviour between the drawn widths, since three fixed
  screenshots leave every width in between to be invented at build time.
- A question the direction owner has not answered is carried as an open item with the
  answer it is waiting for, and is never closed by the designer inventing an answer the
  owner has not seen. A handoff with named open items is honest; one where the same
  items were quietly resolved looks better and is worse.
- A decision deliberately left to the builder is written down as delegated, so the
  absence of a spec cannot later be read as an oversight.

**What shipped either matches the specification or the difference is on the record with
a decision behind it.**

- The built surface is checked against the specification at the widths and states it
  names, and the check is recorded whether or not it found anything.
- A difference found in the build is routed by cause: a spec that was wrong is corrected
  at the source, an implementation that missed is raised as a defect, and a constraint
  the design did not know about reopens the design decision rather than being absorbed
  silently on either side.
- A change agreed verbally during the build lands back in the design source, because a
  source file that no longer describes the live surface will mislead the next person
  more effectively than having no file at all.

## Guidance

The failure here is not an obviously incomplete handoff, it is a complete looking one.
Ask what the page does with no data, with too much data, at the width nobody drew, and
on the slowest connection the audience really has. Those four questions find most of
what would otherwise be settled by whoever is implementing at the time. An open item
named in the handoff is cheap; the same item answered quietly is a decision the
direction owner never made.

## Where this is worth adopting

- A site whose art direction was signed off on three hero screens, where the actual
  build is forty pages of ordinary content nobody has drawn and the direction settles
  almost none of it.
- A team whose last launch shipped an empty state that was invented at build time in a
  Friday afternoon, and which is now visible on the marketing screenshots.
- A designer handing to a development partner in another time zone, where every
  ambiguity costs a full day of round trip and the ones that are not asked about cost a
  rebuild.
- A responsive rebuild where the desktop and phone layouts are both agreed and
  everything between them is contested, because the two designs imply different answers
  and neither says which wins.
- A project where the same designer has always sat beside the builder and answered
  questions as they came up, and is now going on leave for six weeks during the build.
- A brand refresh being rolled out by several implementation teams at once, where each
  will independently invent the same missing states and will invent them differently.

## Connector types

`design`, `documentation`, `project_management`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The work is answerable to two things that actually happen: a direction being
approved, which is what makes it worth resolving anything, and an implementation
appearing, which is what makes the review possible. Running it on a clock produces a
specification against a direction that is still being argued, and the specification then
has to be redone. Neither half of this is a standing watch; both are responses to a
state change somebody else caused.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which widths and devices the surface is genuinely committed to, because the whole
  inventory of unresolved responsive behaviour is defined against that list and a spec
  written for widths nobody supports is cost with no return.
- What the builder assembles from, whether that is a design system with settled
  components, a utility framework or bare markup, since a decision already made by the
  system does not need specifying and one the system cannot express needs specifying
  much more carefully.
- Who owns the art direction and how quickly they answer, because that decides whether
  an open item can be resolved before handoff or has to travel with it.
- The real content the surface will carry, including its longest and emptiest cases,
  which the adopter is usually the only party that has and which is what turns a stress
  test from an invention into a check.

## Dependencies

None.
