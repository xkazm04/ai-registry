---
layer: application
type: application
subject: budget-reallocation-prescription
technique: pause-zero-return-before-shifting
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Pausing burners in a Czech adtech workspace - the kind existed, the definition and the ordering did not hold

At the head of the default branch on 2026-10-14 the pause is a first-class move in
`src/lib/campaigns/budget-moves.ts`: opt-in through an admit flag, full period spend as
the amount, both ratios zero, no recipient consumed, value gain zero, profit gain equal to
the amount under a margin, and the donor's network carried through. The live
change-set path deliberately does not opt in, and a pause goes through the same simulate,
guardrail, approve and revert envelope as a shift. The shape of the technique was already
there. Two of its decision rules were not.

## The seam chosen to falsify

The technique says a burner is a campaign with spend above the floor and a conversion
count of zero, and that pauses are all in the list before any shift. The recommender used
a different test and a different order:

- **The definition.** A burner was any row whose return ratio was zero. A row reporting
  conversions with no conversion value (value tracking off, a late value column) has a
  zero ratio and a non-zero count, so it was paused as "no return" when the honest finding
  is "not measured". The triage rule that raises the same finding for the same campaign
  tests the count, so the two surfaces disagreed about which campaigns are burners.
- **The ordering.** Donors were sorted by waste alone. The technique's claim that a burner
  out-ranks every partial donor holds only at equal spend: a burner's waste is its own
  cost, and a large partial donor can waste more than that. Under a move cap the larger
  donor took the last slot and a small burner was left running.

What a CAUGHT outcome would have taught: that the technique's "ranks first without a
special case" was a fact about the arithmetic. It was not, and the technique now says so.

## The paired proof

Two constructed cases over the recommender with pauses admitted.

- A, as it was: a 2 000 burner beside a 10 000 donor at half target, cap of one move,
  returned the shift; a row with 12 conversions and no value was returned as a pause.
- B, with the count required and pauses considered first: the cap went to the pause, and
  the valueless row produced no move.

Target: pause-worthy rows handled correctly, 0 of 2 in A, 2 of 2 in B. Floor: all 337
campaign unit tests stayed green, including the live-apply identity test that pins the
order of the emitted moves, and the type check and lint stayed clean. The emitted list
keeps its waste order, because the apply path and its audit rows read it in that order;
only the order in which donors are considered for the capped slots changed. Status:
ab-paired at n=2 on constructed rows.

## What it does not show

How often a synced account carries conversions without a value column was not measured;
there is no production portfolio snapshot in the tree. A row with a count and no value is
now skipped by the recommender entirely rather than surfaced as "value not tracked" - the
display of that finding belongs to the triage surface and was not changed.
