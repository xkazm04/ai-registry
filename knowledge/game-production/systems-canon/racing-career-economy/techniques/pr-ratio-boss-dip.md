---
layer: technique
type: technique
subject: racing-career-economy
technique: pr-ratio-boss-dip
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [authoring where the player's car should stand against the field over a career, setting prices and prizes from a races-to-afford target, deciding whether a boss should be beatable on arrival]
---

# The performance-rating ratio and the boss dip

The named concern: **the authored target for how the player's car compares with the field, stage
by stage, and the prices and prizes derived from it.** It answers "where should the player stand"
once the field is fixed by schedule.

## The quantity

The **rating** of a car is one scalar computed from its stats by a stated formula. The
**ratio** at a stage is the player's rating, on the intended path, divided by the field's
rating at that stage. A ratio below one means the player is behind. The unit and the basis go
with every figure: ratio of what, for which car, on which path.

## The target curve

- **Start behind.** A modest deficit — a ratio of roughly 0.85 to 0.9 — so the first races
  are winnable by driving but not by default, and the first upgrades are felt.
- **Recover through the middle.** Each purchase on the intended path closes some of the gap,
  toward a ratio near one. The slope is set by the races-to-afford target below.
- **Dip at each boss.** The boss stage pushes the ratio back under where the previous stage
  left it, by a stated amount. The dip makes a boss an ascent the player prepares for, and it
  gives the preceding stages a purpose: the player is buying toward something.
- **End modestly ahead.** The ratio finishes a little above one, around 1.05, so a player
  who made reasonable purchases is rewarded. Keep the last stretch contestable. In a lab study
  of a competitive game, not a racer, wins by a wide margin felt most competent and were
  enjoyed less than close ones. A ratio far above one at the end buys competence with suspense.

## Prices from races-to-afford

The curve is made real by a table of **races to afford**: for each step on the path, the number
of typical races of income that buys it. A step whose price is a quarter of a race's net is
trivial; a step that takes thirty is a wall. Choose the targets first, then set prices from
income. The income figure is the net after the repair share, from the cap and floor in the
neighbouring techniques; a table built on gross prize overstates what the player has.

## Design intent, not a controller

This curve is **never** a runtime input. If the game reads the player's rating and moves the
field toward the curve, the technique has become rubber-banding, and the rival schedule, which
is the reason the curve is meaningful, has been abandoned. The curve is used offline: to author
the window table, the prices and the prizes, and to judge a simulated career against.

## Procedure

1. Define the rating formula once, from the stats, in data.
2. Author the curve: start, slope, boss dips, end.
3. Choose races-to-afford per step and back out prices from the income table.
4. Simulate a reference driver along the intended path and plot the realised ratio against the
   target. Report the divergence at each boss.
5. Re-run with a worse and a better reference driver. A curve that only holds for one driver is
   the driver's curve.
6. Label the result, in every document that quotes it, as a simulation of a proxy driver and
   as design intent until a person has played the path.

## Decision rules

- **When the realised ratio never dips at a boss, the boss is not a boss yet.** Raise its
  window or lower the player's income before it, not the boss's stats at runtime.
- **When the dip is deeper than the player's income can climb out of before the boss, the boss
  is a wall.** Flatten the dip or add a stage.
- **When the final ratio is far above the target, the economy is too generous.** Check the
  floor and the share before the prices.
- **A rating ratio says nothing about how fast cars die.** Equal ratings with a lethal damage
  rate still end races in the first seconds. Gate early elimination separately — the share of
  races in which a reasonable driver is wrecked before finishing the first lap — and tune
  damage as shared encounter data applied to every entrant, not as a per-opponent boost.
  In the simulated case behind this document the first coefficient wrecked nearly every
  lead driver before lap one; the curve had been fine all along.
- **Add a bankruptcy gate beside the curve.** The share of simulated careers that reach a state
  they cannot recover from is a stated number, and the floor and cap exist to keep it near zero.
- **Never tune the ratio with a runtime multiplier.** It is a number authors move by editing
  data.

## Evidence grade

The ratio, the races-to-afford figures and the dips are **simulation outputs** of a proxy
driver. They are design intent. Nobody has measured whether a person finds the boss dip
exciting or merely hard.

## When not to use this

- **In a game with no persistent car.** There is no rating to ratio.
- **When the player may choose among several equal paths.** The ratio is then a family of
  curves; author the slowest and fastest, not one.
