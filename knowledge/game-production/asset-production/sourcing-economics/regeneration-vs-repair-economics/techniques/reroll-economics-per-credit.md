---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: reroll-economics-per-credit
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [deciding whether another paid generation is worth buying, setting a per-asset generation budget, justifying a repair stage against a re-roll]
---

# Re-roll economics per credit

## The concern

Another generation attempt costs a known amount. The decision to buy it is usually made on
vibes. This technique replaces the vibe with four numbers in one unit, and names the state
in which the purchase is indefensible.

## The four numbers

All four must be expressed per **accepted artifact**, not per attempt — otherwise the
cheapest option is always the one that fails fastest.

1. **Cost of a roll.** The provider's charge for one generation of this class, in whatever
   the account is billed in, converted once to money. Commercial image-to-3D services bill
   per generation on a credit ledger — a textured generation commonly runs a few tens of
   credits, and per-generation costs across the market cluster in the sub-dollar range —
   so the number is small, knowable, and therefore no excuse for not knowing it. Include
   the wall-clock cost if latency gates a person: minutes of a blocked pipeline are real.
2. **Expected improvement per roll.** The measured probability that a fresh roll of *this
   defect class* returns an accepted artifact. This is the term that decides the question
   and the term everybody omits.
3. **Cost of the local repair.** Compute minutes, memory footprint, operator attention,
   and the probability that the repair itself introduces a new defect class. A repair is
   not free; it is merely not billed by a third party.
4. **Cost of a person fixing it by hand.** The ceiling. When the machine options both
   exceed it, the correct route is the person — and saying so is a legitimate output of
   this arithmetic, not a failure of the pipeline.

## Procedure

1. Take the failing class from the verdict. Look it up in the remedy map.
2. If the class is not in the paid set, stop: the expected improvement is *known to be
   near zero* and no cost comparison is required. This is the common case.
3. If it is, retrieve the measured pass rate for that class over recent rolls. Expected
   cost per accepted artifact is the roll cost divided by that pass rate, plus the cost of
   grading each attempt.
4. Compare against the repair path's expected cost per accepted artifact, computed the
   same way — including its own failure probability.
5. Choose the cheaper, unless the cheaper one exceeds the human cost, in which case choose
   the human.
6. Record which branch was taken and what it actually cost. That record is next quarter's
   pass rate.

## Decision rules

- **A re-roll whose expected improvement is unknown is a purchase made blind.** Do not
  buy it. Measure the pass rate on a small deliberate sample first — the sample is cheaper
  than the open-ended loop it replaces, and it is a permanent asset.
- **Never estimate the pass rate from the successes alone.** The rate is accepted over
  attempted, and every graded attempt counts, including the ones you discarded. Discarding
  losers is how a pipeline convinces itself of a rate it does not have.
- **Segment the pass rate by defect class and asset class, never pool it.** A pooled rate
  hides that one class never recovers and another usually does, and the pooled number
  recommends the same action for both.
- **A budget is an instruction, not just a ceiling.** Handing a generation stage a generous
  attempt allowance measurably changes what it does with it; state the intended number of
  attempts for the class, and grade the outcome against what was requested, not only
  against the ceiling.
- **Stop counting money when a defect is stage-determined.** No arithmetic saves a purchase
  that resamples the same distribution. That is a classification result, and it outranks
  the cost comparison.

## The unit trap

Every number here carries a unit and a basis, and the basis is where this goes wrong.
"Twenty per generation" is not a cost until you say twenty *of what*, on which plan, at
which texture setting, for which asset class — the same provider commonly charges more for
a textured result than an untextured one and more again at higher texture resolution, so a
cost quoted without the settings is a cost for a different artifact. Likewise, a pass rate
is per grader configuration: change a threshold and every historical rate becomes a
statement about a bar that no longer exists. Version the rate with the grader.

## When not to use this

- **When the artifact is a one-off hero piece.** At n = 1 the expected-value framing has no
  purchase; buy the rolls, or buy the person, and decide on craft.
- **When the provider bills a flat subscription and you are far under the allowance.** The
  marginal roll is genuinely near-free; the binding constraint becomes latency and grading
  cost, so run the comparison on those instead of pretending the money term is zero.
- **When you have no grader.** Without a verdict there is no pass rate, and the whole
  arithmetic collapses into counting attempts. Get the gate first.
