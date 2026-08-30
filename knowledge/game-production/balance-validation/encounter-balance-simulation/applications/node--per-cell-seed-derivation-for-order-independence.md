---
layer: application
type: application
subject: encounter-balance-simulation
technique: per-cell-seed-derivation-for-order-independence
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Per-cell seeds in a client-side sweep engine

`src/lib/combat/predictive-balance.ts` in the `pof` repo is a browser-side Monte Carlo
engine that sweeps player level × enemy composition to produce survival heat maps, DPS
breakdowns and sensitivity curves. It is the reference realization of the order-
independence rule, including the defect that produced it.

## The defect, in the code's own words

The comment above `seedFromKey` (`predictive-balance.ts:42`) records the incident:

> Each heatmap cell and sensitivity step seeds its OWN rng from its parameters, so a
> cell's result is reproducible regardless of the order cells are evaluated in.
> Previously one shared `createRNG(42)` was threaded through every cell, making each cell
> consume an order-dependent slice of the stream — so the numbers for a given
> level-vs-enemy cell changed if the sweep order changed.

That is the whole failure mode: every cell was seeded, the run as a whole was
reproducible, and individual cells still moved.

## The fix

```
const BASE_SEED = 42;                       // predictive-balance.ts:40

function seedFromKey(key: string, base: number): number {   // :50
  let h = base | 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);       // FNV-1a-style avalanche
  }
  return (h | 0) || 1;                       // guard the zero fixed point
}
```

Two call sites, both keyed on semantic identity rather than loop index:

- `predictive-balance.ts:551` — heat-map cell:
  `createXorShift32RNG(seedFromKey(\`cell|${ec.archetypeId}|${playerLevel}\`, BASE_SEED))`
- `predictive-balance.ts:651` — sensitivity step:
  `createXorShift32RNG(seedFromKey(\`sens|${attr}|${s}\`, BASE_SEED))`

The `|` separator, the archetype **id** (not its display name, which is editable), and
the `|| 1` fallback are all load-bearing. `createXorShift32RNG` comes from the shared
`src/lib/seeded-rng.ts` so every consumer draws from the same generator implementation.

## The kernel-side half: lazy draws

`src/lib/combat/canon-kernel.ts:1` states the determinism contract in its header:

> Pure and deterministic: the only source of nondeterminism is the optional `rng` used
> for the avoidance + crit rolls, and it is drawn lazily (no roll is consumed for a layer
> whose chance is 0/undefined) so adapters can preserve an existing rng draw order.

`computeHit` (`canon-kernel.ts:138`) implements it: the evasion draw at `:145` and the
block draw at `:147` are both guarded on the chance being present and greater than zero.
A combatant with no block chance consumes no block draw, so adding block to an archetype
does not shift every later roll in the fight.

## The adapter trap this engine hit and fixed

Order independence is necessary and not sufficient. The same file records a second,
independent authority defect (`predictive-balance.ts:74`):

> `playerDamageMul` is NOT pre-baked into `attackPower` here. The shared
> `calculateDamage` applies it per-hit (scaling the whole hit incl. `baseDamage`),
> matching the canonical `simulation-engine` behavior. Baking it in here used to
> double-count it relative to the main engine.

And at `:95`, the local formula that had drifted:

> The previous local `calcDamage` had clamped at `Math.max(0,…)` un-rounded and pre-baked
> the damage multiplier into `attackPower` — both reconciled here.

Both are now delegated to `src/lib/combat/damage.ts`'s shared `calculateDamage`, which
adapts into the typed kernel. The sweep engine is a *caller* of the canonical maths, not
a second implementation of it.

## What the harness still owes

`DEFAULT_SWEEP_CONFIG` in `src/lib/combat/gas-balance-presets.ts` runs
`iterationsPerLevel: 300`, while the scenario presets run 2000. That is a defensible
interactivity trade, but the rendered heat map does not carry the resulting ±3 pp
resolution anywhere a reader can see it, so a one-cell colour step is not distinguishable
from noise on the surface. The standard stands: a rate is reported with its sample size.
