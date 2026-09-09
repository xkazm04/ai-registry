---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: absent-evidence-inventory
status: forged
laws: [never-invent-proof]
shared_with: []
use_when: [writing the positioning document for a product with no customers yet, briefing a person or a model to write a landing page, reviewing a page for a proof element nobody supplied]
---

# Absent-evidence inventory

The positioning document carries two lists, side by side: the evidence the
business has and can render, and the evidence it does not have and must never
fabricate. The second list is the technique. It names, concretely, the proof
elements a marketing page conventionally carries - customer testimonials, named
customers, logos of real advertisers, press mentions, pricing case results,
uptime and scale claims - and marks each as absent. Every author, human or
model, reads it before writing a surface; every reviewer reads it before
approving one.

The reason it must be written down is that "we have no customers" is a fact
everyone knows and no draft respects. Landing-page patterns are learned from
pages that had the evidence, so the default draft has a logo wall, a
testimonial band and a "trusted by" line, and the path of least resistance is to
fill them with something plausible. The inventory turns the absence from
knowledge into a constraint a draft can be checked against.

## Procedure

1. **Enumerate what exists and is renderable.** A computable case-study dataset
   on a fictional client; a working product behind sign-in; a design system; a
   key visual; a live demo that needs no account. Each with where it comes from,
   so a page can be built from it.
2. **Enumerate the conventional proof elements.** Walk the bands of a typical
   landing page for this category and list each proof element by name.
3. **Mark each absent element as absent and never to be fabricated.** In those
   words. Not "coming soon", not "to be added", because those read as a to-do
   and a to-do gets done with a placeholder.
4. **Name the replacement band for each absence.** No logo wall - channel-support
   pills stating the support level per channel. No testimonial band - a proof
   band of computed figures with a demo badge. No "trusted by" - a walkthrough
   that demonstrates rather than asserts. No press - nothing; a band with no
   honest content is removed, not filled.
5. **State the revisit trigger.** The inventory changes when evidence arrives:
   the first consenting customer, the first measured uptime window. The
   trigger is written so the inventory is not quietly outlived by the facts.
6. **Put the inventory where the prompt and the brief read it.** A generation
   contract that grounds a model hands it the inventory; a human brief quotes
   it. The generation subject owns the structural enforcement; this technique
   owns the artefact it enforces from.

## The two inverse failures

**Announcing the absence.** A page that opens by listing what the business
lacks - "we have not published a result for your sector yet, and we will not
borrow someone else's" - is not honesty; it is an apology placed before the
first sentence of value, and it plants a doubt no reader arrived with. The
inventory is for authors. The page shows what is true and strong, labels what
is illustrative beside the figure, and says nothing about the rest. Sourcing and
estimate labels sit inline next to the number they qualify, never gathered into
a confession at the top.

**Disclosing status as if it were data.** A pricing page that tells every
visitor it is a case study and that the payment gateway is not wired, with
paid tiers that route to an email link, has confused a product-readiness note
with an evidence disclosure. Buyer testing on exactly this page found it
"kills purchase intent" - a blocker-severity trust finding, because it confirms
the buyer's suspicion that the product is a portfolio piece. The honest form is
the tier's own status chip ("coming after validation") and a CTA state keyed off
what is real, not a banner over the page. Which tiers are real belongs to the
pricing-transparency subject; this technique only insists that a status is not
an evidence disclosure and does not borrow its placement.

## Decision rules

- When a draft contains a proof element, check it against the inventory before
  anything else, because a plausible testimonial passes every other review.
- When an element is absent, replace the band with one the inventory names,
  because an empty band gets filled by the next editor.
- When a page is written with no real proof at all, do not write that on the
  page; write it in the brief and the report, because the reader gains nothing
  from the announcement and the author loses the page.
- When evidence arrives, update the inventory before updating any page,
  because a page updated first becomes the only record that the evidence
  exists.
- When a reviewer cannot find the source of a proof element on the inventory's
  first list, treat it as fabricated, because
  [never invent proof](../../../_laws.md#never-invent-proof) admits no third
  category.

## When NOT to use

- **A business with earned evidence and the consents to show it.** The
  inventory still exists, but its second list is short and the technique's
  weight moves to the typical-results statement, which belongs with the earned
  figure and not here.
- **Internal dashboards.** An operator's own surface does not need an inventory
  of what it may not claim to strangers; it needs the reporting subject's
  provenance badge.
- **As a substitute for the generation contract.** An inventory a model reads
  is an instruction, and an instruction alone does not satisfy the law; the
  schema and validator that structurally refuse a number belong to
  `grounded-marketing-generation`.

## Footing

That announcing an absence harms a page is practitioner convention, stated
strongly by content practitioners and consistent with the buyer-persona finding
above; it has no published measurement. The purchase-intent finding is a
single-run buyer-persona test, not a study.
