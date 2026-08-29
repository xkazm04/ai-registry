---
layer: technique
type: technique
subject: game-economy-tuning
technique: intransitive-equilibrium-solving
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [balancing options that counter each other rather than outrank each other, predicting the usage mix a tuning change will produce, a buffed option's pick rate did not move but its counter's did]
---

# Intransitive equilibrium solving

The concern: a set of options designed to counter one another — no option
is meant to be best, each is meant to beat some and lose to others. Such a
set cannot be balanced on a power curve, because the design goal is not
equal power but a healthy *usage mix*. The technique treats the set as a
payoff matrix and solves for the mix rational play converges on, which
turns "does the mix feel right" into a number a telemetry dashboard can
disagree with.

## Procedure

1. **Write the payoff matrix**: for every ordered pair of options, the
   expected value of choosing the row option against the column option, in
   a declared unit (win value, tempo, resource swing) with its basis
   stated.
2. **Delete dominated rows to a fixpoint.** An option whose payoffs are
   less than or equal to another option's in every column will see zero
   rational use *at any price*; repeat the pairwise scan until nothing
   more falls out. A dominated option is an authoring defect no cost
   change can rescue — surface it before solving anything.
3. **Solve the survivors for equilibrium**: set every surviving option's
   expected payoff against the mix equal, probabilities summing to one,
   and solve for the usage frequencies. That vector is the design's
   *predicted* mix.
4. **Compare predicted mix to observed mix.** Telemetry that diverges from
   the equilibrium is the finding: either the matrix mis-states a matchup,
   or players have not found the counter yet, or an off-matrix factor
   (cost, availability, ergonomics) is repricing an option.

## The counter-intuitive lever

The equilibrium moves in directions taste will not predict, which is
precisely why the solve is worth doing before a tuning change ships:
strengthening an option's winning payoff grows the usage share of its
**counter**, not of the option itself — rational play answers a stronger
threat by playing the answer to it. A tuner who buffs a weak option and
watches its pick rate stay flat while another option's rises has not
failed; the matrix has done exactly what it does, and the technique's
value is knowing that before the patch note promises otherwise.

## When not to use this

Options that do outrank each other — a progression ladder, tiers priced by
the cost curve — are transitive by design; forcing a matrix onto them
reports the ladder as a defect. Mixed populations of unequal skill dilute
the equilibrium (it models rational play, not actual play); read the
divergence as information, not as a target to force. And a matrix whose
payoffs are guesses inherits every guess: state each entry's provenance -
measured, simulated, or estimated - and treat equilibria built on
estimates as hypotheses for the simulation harness, not verdicts.
