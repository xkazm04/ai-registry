---
layer: application
type: application
subject: game-economy-tuning
technique: wealth-concentration-and-price-imbalance-alerts
stack: node
status: forged
---

# The alert rules in PoF's economy simulation engine

`src/lib/economy/simulation-engine.ts` runs a seeded, agent-based economy simulation and
emits typed alerts. `src/lib/economy/item-economy-engine.ts` does the same for the loot
economy. Together they are a working instance of the alert families this subject splits
apart, with real thresholds, and with a few faults worth naming.

## The population that produces the concentration figure

`runSimulation` (`simulation-engine.ts:33`) builds `config.agentCount` agents — 100 in
`DEFAULT_CONFIG` — over `maxPlayHours: 80` to `maxLevel: 25`, seeded (`seed: 42`) so
every run is reproducible. Each agent gets two variance parameters at `:56`:

```
efficiencyMul: 0.8 + rng() * 0.4,   // ±20% play efficiency
spendBias: rng(),                    // 0 = frugal, 1 = spender
```

Those two lines *are* the inequality model. `efficiencyMul` multiplies both faucet
occurrences (`:165`) and sink occurrences (`:191`); `spendBias` scales spend frequency
to `0.5 + spendBias * 0.5`. The Gini coefficient reported at `:381` is therefore a
statement about a ±20% efficiency spread and a uniform spending disposition, not about
players. This is exactly why the technique requires the population parameters to be
reported next to the coefficient: changing `0.8 + rng() * 0.4` to `0.6 + rng() * 0.8`
would move the Gini without anything about the economy changing.

## The three monetary and distribution alerts

`detectAlerts` (`:419`) walks consecutive metrics samples and emits:

- **inflation** — `netFlowPerHour > 0 && netFlowPerHour > prev.netFlowPerHour * 1.2`,
  with severity `critical` when net flow exceeds twice outflow, `warning` when it
  exceeds outflow.
- **deflation** — net flow negative and its magnitude above half of inflow.
- **wealth-inequality** — `giniCoefficient > 0.6` as `warning`, `> 0.8` as `critical`,
  the exact bands the technique states.

Two of these carry a fault worth transplanting the lesson from rather than the code.
The inflation and deflation alerts are written with `threshold: 0` in their payload and
detect drift by a growth heuristic — `1.2×` the previous sample — while
`canon-conformance.ts` judges the same question against the parsed ±15% law. That is two
authorities on "is this economy inflating", disagreeing invisibly: a run can be clean of
inflation alerts and in violation of the canon band, or the reverse. One quantity, one
owning check; the heuristic belongs in the same place as the law, reading the same
number.

## The triviality floor, implemented once

The price-imbalance loop (`:474`) contains the sharpest rule in the file:

```
if (item.id === 'health-potion') {
  const hourlyIncome = midMetrics.inflowPerHour / config.agentCount;
  if (levelPrice < hourlyIncome * 0.01) { … 'trivializes resource management' }
}
```

The rule is right and the guard is wrong. Cost under one percent of hourly income
ending resource management is a general law about consumables; hardcoding it to one item
id means the same defect on mana potions, portal scrolls or elixirs
(`definitions.ts:218-221`) passes silently. The transplantable form is a sweep over every
consumable-category item, with the alert naming which ones tripped. Note also that the
severity here is `info` — a rule this consequential reporting below `warning` is how it
gets filtered out of a review.

The companion check at `:499` is the other end of the same axis: a legendary priced
above `3×` the average endgame gold is flagged as possibly unobtainable. Together they
bound the price band from both sides, which is the right shape — trivial at one end,
unreachable at the other.

## The loot-economy alerts

`item-economy-engine.ts:449` onward emits the reward-curve family with the thresholds
the technique states, each with its player-facing consequence already written into the
message:

- **power-plateau** — per-level average power growth `< 0.02`, `warning`.
- **rarity-obsolescence** — endgame legendary share `> 0.15` (guarded to
  `level >= maxLevel - 2`), `critical`, messaged as "Legendary items flood endgame —
  Rare items become obsolete".
- **affix-saturation** — any single stat above `0.20` of the global affix pool,
  `warning`, "trivially available".
- **rarity-inflation** — endgame rare-plus rate over early rate, `> 3` warning, `> 5`
  critical.
- **low-upgrade-cadence** — `avgUpgrades < 0.5` per bracket, "players may feel stuck".

Two properties are worth copying. Every alert carries `metric`, `value` and `threshold`
alongside its message, so a reader can see how far past the line it landed rather than
only that it tripped. And `rarityInflation` is computed as a *ratio* of endgame rate to
early rate (`:445`) rather than as an absolute rate — the genre-independent form, and
the one that survives a change to the baseline drop tables.

The gap is the unmeasured state. Every one of these detectors returns nothing when its
bracket data is empty, and nothing reads as clean. A loot economy that was never sampled
and a loot economy that was sampled and found healthy produce identical output here.
