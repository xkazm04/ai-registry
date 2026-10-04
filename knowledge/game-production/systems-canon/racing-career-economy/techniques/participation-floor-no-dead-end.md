---
layer: technique
type: technique
subject: racing-career-economy
technique: participation-floor-no-dead-end
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a race career can strand a broke player, setting the lowest prize in a payout table, deciding what a player with zero cash and a wrecked car may do]
---

# The participation floor and the no-dead-end guarantee

The named concern: **no sequence of results may leave the player unable to start the next
race.** The guarantee has two halves that are easy to mistake for one.

## Half one: the payout floor

Every finishing position, including last and including a wreck-out, pays a positive amount.
The floor is the smallest prize in the table and it is chosen against the repair cap, not on
its own: with a repair share of *s*, the worst-case net is the floor times one minus *s*, and
that product must be at least one whole unit of the currency or the guarantee is arithmetic
noise. A floor of four with a share of 0.6 nets two; a floor of one nets zero after rounding.

There are two ways to build the floor. The table can simply have a positive last row, or a
**flat participation amount can be added to every result** on top of a position prize that
may itself be small. The additive form is the sturdier one: the floor is one named number
that can be read, raised or tested on its own, it survives a rewrite of the position table,
and it sits inside gross, so the repair cap bites on it like on everything else. Whichever
form is used, the gross for the worst result is the floor plus the smallest position prize,
and worst-case net is that sum times one minus the share.

The floor is also the bottom of a spread. The player must prefer winning, so the table is
ordered and the gap between floor and top is wide enough that the best finish is clearly
better. The floor removes the trap and keeps the consequence.

## Half two: the state guarantee

Money is not the only dead end. A player may reach the start line with a wrecked car and no
cash, and a payout floor does not help if the next race cannot be entered. So the rule is
stated on the state, not the price: **the car the player starts the next race with is
serviceable whatever the balance reads, and an entry is never refused for lack of cash.**
In practice the car leaves settlement repaired, because the repair is charged against the
race that caused it and the remainder is insured. The player starts the following race with
a working car even at zero.

This is a different guarantee from "the player can always earn money". It holds even for a
player who cannot earn, which is the only player it is for.

## Procedure

1. List every state the career can reach, and for each ask whether an entry to the next race
   exists. Include zero cash, a maximally damaged car, an empty upgrade slot set, and the
   first race.
2. Write the floor and the cap as data and compute worst-case net from them.
3. Assert, as a property test over generated careers, that the worst-case net is positive and
   that entry from the zero-cash wrecked state succeeds.
4. Verify the guarantee in the real settlement path, not on the formula alone. A formula that
   guarantees a positive net is not evidence that the code that writes the balance applies it.

## Decision rules

- **When a mode adds a cost outside the settlement — an entry fee, a rental, a fine — put it
  inside the guarantee or exempt it from the entry check.** A fee charged before the race can
  re-open the dead end the floor closed.
- **When the floor is raised, re-derive the spread.** Raising the bottom without raising the
  rest compresses the incentive to win.
- **When the player is at zero and repaired, tell them.** A player at zero cash who is not
  told the next race carries no risk reads the screen as a dead end even when it is not.
- **Do not solve the dead end with a loan.** Debt is a second ledger with its own rules, and a
  player in debt is stranded by a different mechanism. Where an optional loan exists
  anyway, its repayment is taken from net after the floor and the cap, never from gross, so
  that repayment cannot push the take-home below the guaranteed share; interest must not
  compound, and no progress may require the loan.
- **When the profile has a wallet cap, the guarantee is about net, not about the balance.**
  A player at the cap who wins is not stranded, but the balance will not move; say so.

## Evidence grade

The floor and the entry guarantee are properties of the rules and can be tested exactly.
That a floored career is pleasant to lose in is not measured by any of it.

## When not to use this

- **In a mode that is meant to end.** A permadeath or elimination mode has dead ends by
  design; label it so and keep the guarantee for the main career.
- **When the floor would make losing indistinguishable from drawing.** If the spread cannot be
  made wide, the problem is the payout table, not the floor.
