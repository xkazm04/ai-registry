---
name: deal-negotiation-and-close
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Sales deal negotiation and close

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The expensive failure here is not a lost deal, it is a won one. A deal closes,
it is recorded as a win, and the commitment that bought the signature, a rate, a date, a
scope, was never checked against what the delivery or supply side can actually hold. The
cost lands weeks later, on somebody who was not in the conversation, and it does not get
attributed back to the negotiation that caused it. The second failure has no memory:
each concession is judged alone and each one is small, so nobody sees that an entire
segment now expects the discounted price until the margin has already moved and the old
price can no longer be asked for.

**Input.** What the supply or delivery side has confirmed it can actually hold on price,
scope and date, the value and the alternatives on both sides, what comparable deals
actually closed at rather than what they were quoted at, the counterparty's stated
position and the deadline or leverage they are claiming, and the authority this seat
holds before somebody else has to decide.

**Core action.** Decide where price and terms land between what the counterparty will
accept and what the supply side can genuinely meet, treating the walk away as a number
fixed before the conversation rather than discovered inside it. Concede only against
something received, because an unreciprocated concession does not just cost its own
value, it re prices every future negotiation with that counterparty and teaches them
that waiting is the cheapest move available.

**Output.** A closed agreement whose price, scope and dates each trace to a commitment
the delivering side confirmed it can meet, written in words both parties would describe
the same way a month later. For a deal that did not close, the same record exists: the
reason, and the number or term it actually turned on, since a walk away is an outcome of
this work rather than a gap in it, and lost on price with no figure attached is a story
rather than data.

## Activities

1. Establish what the supply and delivery side can genuinely hold on price, scope and
date *(observe)*
2. Read what the counterparty actually needs behind the price and terms they named
*(observe)*
3. Fix the target, the floor and the walk away point before the conversation opens
*(decide)*
4. Trade concessions against something received rather than granting them *(act)*
5. Judge when the terms have left the floor and the deal should be let go or escalated
*(decide)*
6. Confirm scope, price and commitments in terms both sides would recognise later
*(act)*
7. Record the outcome with its terms, and for a deal that did not close, what it turned
on *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every commitment in a signed agreement is one the delivering side already confirmed it
can meet.**

- A price, a date or a scope item is not offered until the side that has to honour it
  has confirmed it, and where speed forced an offer ahead of that confirmation, the
  offer is marked as conditional in the words sent to the counterparty and not only in
  an internal note.
- A deal won at terms outside the floor is recorded as an approved exception with the
  person who approved it, not as an ordinary win, because a win recorded without its
  exception disappears into the average and sets the expectation for the next quarter.
- The final terms are restated in plain language and confirmed back, so a scope both
  sides read differently is discovered before delivery rather than during it.

**Movement on price or terms happened in exchange for something, and the pattern of
movement is visible rather than accumulating unseen.**

- Every concession is recorded with what was received for it, so a run of one sided
  moves is legible as a pattern instead of as a series of individually reasonable
  decisions.
- The floor set before the conversation is not revised by the person inside it; it can
  be moved only by the party who owns the constraint, since the person under pressure to
  close is the worst placed to decide what the business can afford.
- A deadline or a competing quote asserted by the counterparty is treated as a claim
  until it is corroborated, because a fabricated deadline is the cheapest and most
  common lever in this work.
- Concession patterns across deals are read at the segment level, so a discount that has
  become the effective list price for a segment is noticed as a pricing decision rather
  than as many separate negotiations.

**Walking away is a result the work produces and leaves evidence for, not a silence.**

- A refused deal records the term it turned on and the number the counterparty last
  named, which is the only input that makes a later review of the floor better than an
  opinion.
- A deal lost to a competitor records what was actually compared, since lost on price
  frequently turns out on inspection to be lost on scope or on a date.
- A counterparty who walked is left able to return: the refusal names the condition
  under which the answer changes, because the same buyer at a different volume or a
  different date is often a deal that was refused once for good reason.

## Guidance

Set the floor and the walk away before the conversation, because the person inside it is
the worst placed to judge what the business can afford. Ask what the counterparty needs
behind the number they named; price is often standing in for a date, a payment term or a
risk they cannot carry, and those are usually cheaper to give. Never move without
receiving. A commitment made to win a deal the business cannot meet costs the most, and
it costs somebody who was not in the room.

## Where this is worth adopting

- A seat that negotiates on both sides at once, agreeing a price with a buyer and a rate
  with a supplier, where the margin only exists in the gap and either side moving
  quietly closes it.
- A quarter end where several deals are being closed under time pressure at the same
  moment, which is precisely when floors get revised by the person under the most
  pressure to hit a number.
- A team whose average selling price has drifted down over a year with no decision
  behind it anywhere, because every individual discount was defensible and nobody looked
  at them together.
- A business that won a large account on a delivery date nobody had checked with
  operations, and is now paying for it in expedited cost that will never be attributed
  back to the negotiation.
- A seller facing a professional procurement function that opens with a deadline and a
  competing quote as standard practice, and who currently has no habit of testing either
  claim.
- A deal where walking away is genuinely the right answer and nobody in the conversation
  has the authority or the recorded floor to say so out loud.

## Connector types

`crm`, `email`, `documentation`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. A negotiation is answerable to the counterparty's move, not to a clock: it
opens when a quote is answered, a term is challenged or a competing offer appears, and
every step of it is a reply to something that just happened. A scheduled pass produces a
follow up whose only content is that time has passed, which reads as eagerness and moves
the price against the sender, so the cadence has to be driven by the other side's
actions rather than by the seat's calendar.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The real cost floor and what the delivery side can commit to on scope and dates,
  because without it the negotiation is being run against a guess and the guess is
  always more generous than the truth.
- The authority this seat holds and where it stops, since the escalation boundary is
  what makes the floor mean anything and an unbounded seat has a floor only as firm as
  the current quarter's pressure.
- What comparable deals actually closed at rather than what they were quoted at, as it
  is the only defence against a counterparty's claim about the market and against the
  seat's own memory of its best result.
- Which concessions this business would rather give than price, whether that is a
  payment term, a longer commitment or a narrower scope, because knowing the cheap
  currency in advance is what turns a demand for a discount into a trade.
- Where won and lost outcomes are recorded and who reads them, given that the value of
  the walk away half of this work is entirely in whether the next floor is set from it.

## Dependencies

None.
