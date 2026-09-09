---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: demo-badge-beside-the-number
status: forged
laws: [provenance-is-binary-and-labelled, never-invent-proof]
shared_with: []
use_when: [placing the illustrative-data label on a proof band or share card, reviewing a page whose disclaimer sits in a footer, deciding how to word a demo label]
---

# Demo badge beside the number

The label that says a figure is illustrative sits next to the figure, in the
same viewport, at a visual weight no lower than the section's own label, and
names the fiction in plain words. It is a badge, not fine print. The test a
reviewer applies: cover the number with a thumb - is the label still visible,
and does it still read as a statement rather than a caveat?

The empirical spine is the US consumer-protection regulator's revised
endorsement guides (2023), whose own consumer testing found that a "results not
typical" line beside a testimonial did not adequately change what readers took
the ad to promise, and which define an effective disclosure as one that is
difficult to miss, easily understood, and alters the net impression of the
whole. A marketing surface showing a fictional client's outcomes is not a
testimonial, but the finding transfers with more force, not less: if a caveat on
a real experience fails to register, a caveat on an invented one that reads as
a real one is worse than no figure at all.

## Placement rules

- **Same viewport as the first figure.** On a proof band, the badge is in the
  header row, beside the section eyebrow, before the headline; a reader who sees
  a tile has already passed the badge.
- **Weight at least equal to the section label.** Uppercase, tracked, bordered
  pill at the eyebrow's size is the convention; a smaller, lighter or greyer line
  than the eyebrow reads as fine print. This is a convention, not a measured
  threshold.
- **Names the fiction, does not hedge it.** "Demo data: fictional client", not
  "results may vary". The label states what the numbers are, and the supporting
  note states what they are not: "the same numbers the dashboard renders for
  {client}, a fictional demo client - not real customer results".
- **One label per surface where the number appears.** Homepage band, demo
  dashboard, share card, structured data, the plain-text twin served to answer
  engines. A label on the page does not travel to the card; the card bakes its
  own into the image.
- **Never a footer, tooltip, hover, collapsed section, or opening paragraph.**
  The first three are missed; the last is an apology, and reads as one.

## Wording rules

The badge is two to five words and says what the data is. The note is one or
two sentences and says whose numbers they are and that they are not a customer's.
Neither says "illustrative purposes only", "not typical", "your results may
differ" or any phrase whose purpose is to protect the author rather than inform
the reader. A reader who knows the client is fictional needs no further hedge; a
reader who does not know that is not helped by one.

Localize the badge as authored copy in every locale the surface ships, at the
same weight; a label in one language on a page in another is a label the reader
did not see.

## Decision rules

- When a figure is computed on illustrative data, put the badge in the figure's
  viewport before writing the figure, because a badge added after layout ends up
  wherever there is room, which is the footer.
- When the badge would be smaller or lighter than the eyebrow it sits beside,
  raise the badge, not the eyebrow, because the eyebrow is already the
  section's minimum legible weight.
- When a share card, preview image or structured-data node carries the figure,
  give it its own label, because a label that stays on the page is not on the
  card.
- When the provenance bit flips to real, remove the badge on that surface -
  see the binary-provenance technique; a demo badge on a client's own synced
  data is the opposite lie.
- When a reviewer proposes a "results not typical" line as the disclosure,
  refuse it and name the fiction instead, because that exact wording has been
  measured to fail.

## When NOT to use

- **Earned results.** A consented customer figure carries a typical-results
  statement and the customer's identification, not a demo badge; the badge would
  be false.
- **Derived product facts.** A feature count, a limit or a price read from the
  code is not illustrative and takes no badge; badging it would teach readers
  that the badge means "true but computed", which dilutes the badge everywhere.
- **Surfaces with no figure.** A walkthrough that demonstrates a flow on a demo
  account states once, at the top, that it is a demo account; it does not badge
  every screenshot. The badge is for numbers a reader could mistake for a
  result.

## Footing

The ineffectiveness of "results not typical" is a published regulator finding.
Badge placement and weight are practitioner convention, shaped by that finding,
not themselves measured.
