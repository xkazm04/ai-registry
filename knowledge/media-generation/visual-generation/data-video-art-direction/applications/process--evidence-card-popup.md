---
layer: application
type: application
subject: data-video-art-direction
technique: evidence-card-popup
stack: process
status: draft
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# A card dated to a year the clock does not show

A data-video studio already meets most of this technique in one reusable card: the
headline fits from 46 down to 28 px on one line, facts hold 28 px, every card carries a
required date line, a card is one object in a pile, and no card tilts because none is a
photo (the cards are typographic, which the technique prefers over a misleading photo).
The seam was chosen to falsify "the dated label is already tied to the beat": the date
line is a free string checked for length only.

## Where the date comes from

The card's frame comes from the timing plan, which places each event at a period of the
race clock. The date on the card comes from the generator's own text. Nothing compared
the two, so a card could carry one year while the clock beside it read another, which
turns the technique's "cheapest and strongest truth signal" into a visible
contradiction.

## A and B

- **A (as it was):** a card dated 2012 under a 2013 clock period passed every generation
  rule.
- **B (the rule applied):** the plan-checking rule refuses a card whose four-digit year
  differs from the year of the period the plan placed it at. A finer label in the same
  year ("MAR 2013") and a label with no year both pass, because the rule claims only a
  contradiction it can prove.

## Result

Target: cards whose year contradicts their period, accepted in A and refused in B (one
new test red on the old rules, green on the new). Floor: all 17 events across the three
committed fixtures already agreed and still pass; full workspace suite (1,640 tests),
type check and the lint ratchet green. Shipped stat-reel e53786d on origin main.

Held at its boundary: sizes, one card per frame and the required date line were already
right and tested. Not checked: labels without a year, and the match of month or day
(period labels vary in grain, so the rule stays at the year).

Not measured: how often a generated card carries a mismatched year. Return: a count of
`date-label-period` refusals from the generation job log.
