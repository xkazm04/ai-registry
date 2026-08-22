---
layer: technique
type: technique
subject: game-economy-tuning
technique: rarity-inflation-and-affix-saturation-alerts
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
use_when: [a loot system has stopped feeling rewarding, auditing drop tables and modifier pools at endgame, deciding which loot metric to instrument]
shared_with: []
---

# Rarity inflation and modifier-pool saturation

The named concern: **the characteristic decay of a reward economy.** A loot system does
not usually break; it flattens. The rewards keep arriving, the numbers keep rising, and
the experience of being rewarded quietly ends. Currency-flow checks do not see this at
all — a loot economy can sit dead centre in its net-flow band while every drop in it has
become noise.

The decay has five measurable components. Each has a threshold, and each has a distinct
consequence a player can describe. Instrument them separately, because they have
separate causes and separate fixes.

## The five measurables

**Power plateau — item power gain below 2% per level.** The rate at which the best
obtainable item improves per progression level. When it falls under two percent, new
items are statistically indistinguishable from equipped ones and the player stops
inspecting drops. The consequence is not frustration but disengagement, which is why it
is rarely reported as a bug. Its usual cause is a power curve that grows more slowly
than the level range it has to cover, which means the fix is at the curve, not the drop
table.

**Rarity obsolescence — top-rarity share above 15% at endgame.** The fraction of drops
at the highest rarity tier. Above roughly fifteen percent at endgame, the top tier has
become the ordinary case, and the tiers beneath it have become garbage the player walks
past. The consequence is the collapse of the whole rarity ladder into a binary: top
tier, or ignore. Rarity is supposed to be an information channel; past this point it
carries no information.

**Modifier saturation — any single modifier exceeding 20% of the pool.** Across
generated items, the share of the modifier pool occupied by the most common entry. Above
one fifth, the pool has effectively collapsed: items become variations on one modifier,
build diversity dies with them, and the player learns the pool in an afternoon. The
usual cause is not an authoring mistake but weighting that survived a pool expansion —
a modifier weighted for a pool of twelve, still weighted the same in a pool of sixty.

**Rarity inflation — drop rates at 3x and 5x baseline.** The ratio of current top-tier
drop rate to the design baseline. Three times baseline is a warning; five times is
critical. This is the drift that arrives one generous patch at a time, each individually
justified, and it is worth tracking as a ratio to baseline rather than an absolute
because the absolute rate is genre-dependent and the drift is not.

**Upgrade drought — under 0.5 meaningful upgrades per level.** How often a drop actually
replaces something equipped. Below one upgrade every two levels, the reported player
experience is "I feel stuck", regardless of how many items dropped. This is the metric
closest to felt experience and the one most worth instrumenting first if you can only
afford one.

## Procedure

1. **Fix the basis before computing anything.** Every one of these five is a ratio, and
   each is meaningless without its denominator stated: drops over what window, at what
   progression point, for what content tier, under which stance. Two teams computing
   "top-rarity share" over different windows will disagree forever and neither will be
   wrong.
2. **Sample by simulating the drop system, not by scraping a play session.** A session
   gives you tens of drops; these thresholds need thousands to be stable, and the
   simulation is also the only way to ask about a tier nobody has played yet.
3. **Compute each of the five at the endgame progression point, and at least one
   mid-progression point.** Several of them are healthy early and decayed late by
   construction; a single sample cannot distinguish "healthy" from "not yet decayed".
4. **Emit each as a separate alert with its own severity**, carrying the measured value,
   the threshold, the basis, and the player-facing consequence in plain language. An
   alert that says only "modifier saturation: warning" will be triaged into oblivion; one
   that says "one modifier is 31% of the pool at endgame; items become variations on a
   single roll" gets fixed.
5. **Where an input is absent, emit the alert as unmeasured.** A modifier pool that has
   not been sampled is not a passing modifier pool. Silence must not propagate upward as
   green — that is the failure mode that lets a decayed loot economy ship with a clean
   dashboard.

## Decision rules

- **When upgrade drought trips, reach for bad-luck protection before reaching for drop
  rates.** A guarantee after a stated number of drops without a meaningful result fixes
  the tail of the distribution — which is where "I feel stuck" actually lives — without
  moving the mean, and moving the mean is how a drought fix becomes next quarter's
  rarity inflation. Raise the rate only when the mean itself is wrong.
- **When rarity inflation trips at endgame but the drop tables have not changed, look at
  the player's own reward multipliers.** Stacks that increase reward quantity and rarity
  reach several hundred percent at endgame in this genre, and they multiply the rarity
  roll for every source at once. A table tuned against a player carrying none of them is
  tuned for nobody, and the inflation was authored by the progression, not the table.
- **When power plateau and upgrade drought both trip, fix the power curve first.** The
  drought is usually the plateau's symptom, and raising drop rates to fix it produces
  more items that are still not upgrades — which is rarity inflation, arriving as a
  treatment for the wrong disease.
- **When rarity obsolescence trips, tighten the top tier before adding a new one above
  it.** Adding a tier resets the perception for one release and leaves you with two dead
  tiers instead of one.
- **When modifier saturation trips, check the pool's size history before touching
  weights.** If the pool grew and the weights did not, the fix is a re-weighting pass
  over the whole pool, not a nerf to the one modifier that showed up in the alert.
- **When top-rarity share is fine but rarity inflation is at 3x, believe the ratio.**
  Share is diluted by everything else in the table; the ratio to baseline is the honest
  drift signal.
- **Never tune two of these at once.** They interact — every one of them moves when a
  drop table changes — so a simultaneous change to two leaves you unable to attribute
  the result to either.

## What belongs to the genre's systems canon, not here

How rarity is *constructed* — a rarity tier as a budget of modifier slots, item-level
gating of which modifier tiers may appear, the tier tables themselves — is the
territory of the genre's systems canon. This technique consumes those structures and
measures what the economy does to them over a long horizon. If an alert here says the
modifier pool has collapsed, the repair happens in the canon; the detection happens
here.

## When not to use this

- **Before the drop system generates items procedurally.** With a hand-authored reward
  list, saturation and inflation are authoring decisions you can read directly, and
  these detectors add nothing over reading the list.
- **On a fixed-length experience with no endgame.** Several thresholds are defined at
  endgame because that is where the decay lives; applied to a ten-hour linear game they
  will fire on tuning that is entirely correct for it.
- **As a proxy for whether the loot is good.** These five detect decay in the reward
  *system*. Whether an individual item is exciting is a craft judgment and is graded
  against what shipped, not against a threshold.
