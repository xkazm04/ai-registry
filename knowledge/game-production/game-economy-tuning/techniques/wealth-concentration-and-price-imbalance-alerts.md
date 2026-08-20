---
layer: technique
type: technique
subject: game-economy-tuning
technique: wealth-concentration-and-price-imbalance-alerts
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
use_when: [aggregate net flow passes but players report the economy feels broken, setting alert thresholds for a currency, checking whether prices still constitute decisions]
shared_with: []
---

# Concentration, price drift, and the triviality floor

The named concern: **the ways an economy fails while its aggregate net flow is inside
the band.** Balance is a statement about a sum, and a sum conceals three things: how the
resource is distributed across the population, how individual prices have drifted
relative to income, and whether a price is still large enough to constitute a decision.

Each is a separate detector with its own threshold and its own consequence.

## Wealth concentration

Measure the inequality of currency holdings across the simulated or observed population
with a Gini coefficient — zero is perfectly equal, one is all held by one participant.
Two thresholds:

- **above 0.6 — warning.** The median experience has decoupled from the mean. Any
  balance decision made against average holdings is now a decision about a minority.
- **above 0.8 — critical.** Prices set for the wealthy are unreachable for the median
  player, and prices set for the median are meaningless to the wealthy. There is no
  single price that works for both, which means the pricing problem has become
  unsolvable by pricing.

Concentration is not intrinsically a defect — some inequality is the reward for skill
and time, and a game where everyone holds the same amount has removed a motivation.
What the thresholds detect is inequality large enough that *the economy's other numbers
have stopped describing anybody*. That is why this is measured even in a game with no
trading: a spread produced by divergent play patterns has the same consequence as one
produced by a market.

## Price imbalance

Compare each priced good's cost against the income rate that is supposed to pay for it,
and against its own history. An economy passes its aggregate check while individual
goods drift, because aggregates absorb offsetting errors — one good five times too
expensive and another five times too cheap sum to neutral and both are wrong.

Flag a good whose cost has drifted materially against the income that funds it, and
flag pairs of goods whose relative prices no longer reflect their relative utility.
Report the drift as a ratio with its basis stated: cost relative to hourly income at a
named progression point, not an absolute currency figure, which is uninterpretable
across tiers.

## The triviality floor

The sharpest and most transplantable of the three: **a consumable that costs under one
percent of hourly income has stopped being a resource-management decision.** At that
price the player buys the maximum stack without thinking, and every system built around
managing that consumable — inventory pressure, preparation before an encounter, the
choice to conserve — is dead weight that still costs the team maintenance.

The rule generalizes past consumables. Any priced choice whose cost falls below about a
percent of the income rate at that progression point is no longer a choice; it is a
formality with a confirmation dialog. This is the rule that catches the single-player
inflation pathology, which produces no market signal and no complaint — only a slow
loss of engagement with a third of the systems that were built.

## Procedure

1. **Define the population and the horizon.** Concentration measured across an
   unspecified population is not a number. State whether it is over simulated agents at
   a progression point, over an observed cohort, or over a play-pattern spread — and
   state the count.
2. **Simulate or sample holdings** and compute the coefficient. A concentration figure
   from a handful of agents is dominated by sampling noise; if you cannot get a stable
   sample, the result is unmeasured, not "low".
   Where the population is simulated rather than observed, the spread is *manufactured
   by the agent model* — the assumed variance in play efficiency and the assumed spread
   in spending disposition are what produce inequality, and a coefficient computed from
   them is a statement about those assumptions as much as about the economy. Report the
   assumed variances alongside the coefficient. A simulated concentration figure whose
   population parameters are not stated is not comparable to anything, including the
   same simulation run next quarter.
3. **Compute each priced good's cost as a fraction of hourly income** at the same
   progression point, using the income figure the faucet enumeration produced. Two
   detectors disagreeing about hourly income is worse than either being wrong.
4. **Emit alerts with severity, measured value, threshold, basis and consequence.** The
   consequence sentence is what gets the alert acted on rather than filed.
5. **Emit unmeasured where an input is missing.** No holdings sample means no
   concentration verdict; a missing income rate means no triviality verdict. Neither
   defaults to a pass, and an economy report containing an unmeasured detector is not a
   green report.

## Decision rules

- **When concentration is critical, stop pricing and go find the divergence.** At 0.8,
  repricing cannot succeed; the useful question is which faucet or activity produces the
  spread, and whether it is intended.
- **When aggregate flow passes and price imbalance fires, believe the price imbalance.**
  It is the finer instrument; the aggregate is the one that hides things.
- **When the triviality floor fires on a consumable, decide whether the system is
  wanted, not what the price should be.** Raising the price of a trivial consumable
  usually restores a chore rather than a decision. Either the system earns its place and
  the cost is re-based on income, or the system is removed and its maintenance with it.
- **When income scales faster than prices by design, state the crossover level.** Every
  price-versus-income design has a point where it trivialises; a design that has named
  that point is deliberate, and one that has not will reach it by accident.
- **Never compare a currency figure across progression points without its income
  basis.** The same absolute cost is a hard choice at one tier and a rounding error four
  tiers later; the ratio is the only comparable quantity.

## When not to use this

- **On a single-agent simulation.** Concentration requires a population; computing it
  over one simulated player produces zero, which reads as perfect equality and is
  actually no measurement at all. This is the exact shape of failure the unmeasured rule
  exists to prevent.
- **On a currency with no prices.** A resource that is only ever accumulated has no
  price imbalance and no triviality floor; check it as a progression curve instead.
- **Very early in progression.** All three detectors are noisy in the first hours, where
  holdings are small, the population is undifferentiated and prices are tutorial-scaled.
  Run them at the progression points the game will actually be lived in.
