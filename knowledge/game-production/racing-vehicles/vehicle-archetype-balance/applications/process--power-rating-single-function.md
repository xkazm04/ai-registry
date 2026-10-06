---
layer: application
type: application
subject: vehicle-archetype-balance
technique: power-rating-single-function
stack: process
status: forged
verified_on: 2026-10-01
---

# One rating function, one table of weights, an identity check that reads the same data

Source: a ten-class arcade racer on a fixed-step simulation core, read in the content
worktree (`C:\Users\kazda\kiro\firetv-deathride-content`, commit `e1640f0`; the rating file
itself is unmodified in the working tree). Everything below was verified only by a seeded
harness; no person has driven these classes. The rating, budgets, tolerance and band are
authored; the weights are a simulated fit.

## The mapping beneath the rating

The authoring surface is eight unitless stats mapped linearly to ten physical parameters in one
table. Handling drives two parameters, and the response row's per-point increment is negative
because a quicker response is a smaller time constant:

- `deathride/core/src/main/resources/data/stat-mapping.csv:7` "massKg,mass,450,190"
- `deathride/core/src/main/resources/data/stat-mapping.csv:8` "steeringRateRadPerSecond,handling,1,0.12"
- `deathride/core/src/main/resources/data/stat-mapping.csv:9` "yawResponseSeconds,handling,0.2,-0.012"

The progression design states the same two halves as a requirement:
`docs/concepts/DEATH-RIDE-PROGRESSION.md:25` "Handling is two separable things in the derived physics".
The dispatch pointed at lines 66-76 of the mapping table; that file has eleven lines, and the
table is lines 1-11 (the same eleven lines exist in the main tree). The anchors above are the
re-opened ones.

## The single function

The rating object declares its own scope and its callers in its first comment:
`deathride/core/src/main/kotlin/dev/deathride/core/PowerRating.kt:5` "Shared by catalogs, garage offers and rival purchasing; never calculated in the step."
The function sums, over the weights table, the normalised distance of each derived value from
its origin: `PowerRating.kt:16` "fun of(car: CarClass, bonuses: IntArray? = null): Double = weights.sumOf {".
Parts enter as `bonuses` through the same derive call, so an upgraded car is rated by the same
function. The weights table is loaded from data (`PowerRating.kt:8` "Content.table(\"pr-weights\")"),
and load fails loudly on a duplicate parameter, a zero unit, or a non-positive or non-finite
weight: `PowerRating.kt:13` "require(weights.isNotEmpty() && weights.map { it.parameter }.distinct().size == weights.size)"
and `PowerRating.kt:14` "require(weights.all { it.unit != 0.0 && it.weight > 0 && it.weight.isFinite() })".
The empty-table check is the non-emptiness assertion the technique asks for.

Budgets rise with tier and live beside the weights in data:
`deathride/core/src/main/resources/data/roster-tiers.csv:2` "rookie,0,0,324.555" through
`roster-tiers.csv:6` "champion,4,3400,587.940". The tolerance is data too:
`deathride/core/src/main/resources/data/roster-rules.csv:10` "prTolerance,0.03".
The check that enforces both is `PowerRating.kt:28` "PR outside tier budget", reading
the same two tables the rating reads, so the rule and the check share one source.

## The identity gate, and what it includes

`PowerRating.kt:20` "val band = catalog.filter { it.tier == car.tier }" builds the tier
reference *including the car under test*, and `PowerRating.kt:21` "val threshold = RosterRules[\"identityBandPoints\"] * RosterRules[\"identityBands\"]"
sets the threshold from data (`roster-rules.csv:11` "identityBandPoints,0.5" and
`roster-rules.csv:12` "identityBands,2", so one stat point). With two cars per tier and the car
in its own mean, a car's delta is half its gap to its partner, so passing needs a two-point gap
between the pair. That is a consequence the design doc does not state (see the report); the
design intent is `docs/concepts/DEATH-RIDE-PROGRESSION.md:22` "every car has the same PR within +-3%"
and the next line "+2 sigma-bands high on one primary stat and low on another". The failure
messages name which half is missing: `PowerRating.kt:30` "missing strength/weakness identity pair".

## What the data shows about the weights

`deathride/core/src/main/resources/data/pr-weights.csv:2` "maxSpeedMps,20,2,29.097449327"
against `pr-weights.csv:5` "armorReduction,0,0.04,0.100264145" and
`pr-weights.csv:10` "brakeMps2,16,1,0.100197840": one point of speed buys about 290 times the
rating of one point of armour or braking. The fit was taken over a stock movement sweep with no
combat (`docs/concepts/deathride/C1-roster-v2.md:19` "This is a stock movement comparison, not a combat-balance or human-fun verdict"),
so armour does nothing in it and is priced at almost nothing. The rating is therefore
uncalibrated for combat; the combat scenarios are scheduled in the same document
(`C1-roster-v2.md:19` "C3 adds the 2,000-race combat scenarios"). Until then a heavy class
holds armour almost free of rating.

## Reconciliation

Confirmed: one function, one table, tolerance and band from data, loud failure, parts through
the same derive. Deviation: the identity reference includes the subject and the peer-population
warning lives elsewhere, so the two conventions can disagree. Upward lesson: the rating's own
report must list near-zero weights next to the mechanics the fitting run did not exercise.
