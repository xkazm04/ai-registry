---
layer: application
type: application
subject: arpg-systems-canon
technique: mitigation-order-and-soft-caps
stack: node
status: forged
---

# One typed kernel, and the two-simulators incident that produced it

The PoF repository (`C:\Users\kazda\kiro\pof`) realizes the mitigation pipeline as a single
pure module, `src/lib/combat/canon-kernel.ts`, whose header states its own authority in the
first line: *"the ONE typed authority for combat math."* Everything else in the repo adapts
into it.

## What the kernel encodes

`canon-kernel.ts:28-42` exports the canon as named constants rather than inline literals —
`CRIT_MULTIPLIER = 2.5`, `CRIT_CHANCE_CAP = 0.95`, `RESIST_CAP = 0.75`,
`ARMOUR_HIT_COEFF = 5` — plus the type split that the technique calls load-bearing:

```ts
export type DamageType = 'Physical' | 'Fire' | 'Cold' | 'Lightning' | 'Chaos';
/** Elemental + Chaos types are mitigated by resist; Physical is mitigated by armour. */
export const RESIST_TYPES: readonly DamageType[] = ['Fire', 'Cold', 'Lightning', 'Chaos'];
```

`computeHit()` (`canon-kernel.ts:137-190`) runs the order literally: avoidance roll, then
block, then per-type mitigation inside the loop over `DAMAGE_TYPES`, where `Physical` takes
`armourReduction()` and everything else takes `min(resist, resistCap)`. Two implementation
details are worth stealing:

- **Lazy RNG draws.** The header notes that no roll is consumed for a layer whose chance is
  `0`/undefined, "so adapters can preserve an existing rng draw order." That is what let a
  second, older call site be re-pointed at the kernel without changing any seeded simulation
  result — a migration property, deliberately designed in.
- **The soft cap takes the hit.** `armourReduction(armour, rawPhysHit, weight)` and
  `armourEffectiveHpMultiplier(armour, refHit, weight)` both *require* a hit argument. The
  API makes the technique's central claim unstatable in the wrong form: there is no function
  in the module that will return a mitigation percentage for an armour rating alone.
- **`resistCap` is a parameter defaulting to `0.75`.** Raising it to `0.90` for a
  max-resistance build is a call-site argument, not an edit to the kernel.

## The incident

`src/lib/ability/damage-formula.ts:1-22` is the interesting file, because its header is a
post-mortem:

> Until 2026-08-18 this module carried its own second damage model
> (`armor/(armor+100)` mitigation, no crit-chance cap) while the arena/combat sim had
> already been reconciled onto `@/lib/combat/canon-kernel`. Two simulators answering the
> same balance question with two different models is worse than one, so the GAS path now
> routes through the SAME kernel.

Both models were individually plausible. `armor/(armor + 100)` is a perfectly respectable
curve — it is just a *different* one, and critically it is **not a function of the hit
size**, so it produced a stable "mitigation %" that the canon says does not exist. The two
agreed closely at small armour values and diverged exactly in the range where balance
decisions get made.

Two disciplines in the fix are worth naming:

1. **The retired curve was kept, and barred.** `legacyArmorMitigation()`
   (`damage-formula.ts:76-79`) still exists for before/after comparison, carrying the
   comment *"NOT canon — never render it or let it reach a verdict."* That is the law about
   one authority per quantity applied honestly: the old model may inform, it may not decide.
2. **The adapter is where vocabulary gets reconciled.** `canonDamageType()`
   (`damage-formula.ts:49-59`) maps the ability module's `'Ice'` onto the kernel's `'Cold'`
   and falls back to `Physical` for the untyped default. The mapping lives in the adapter,
   not in the kernel — the authority does not learn every caller's dialect.

## What transplants

The shape, not the numbers: a pure module owning the ordered pipeline; canon constants as
named exports; soft-capped functions that *demand* a reference hit in their signature; a
lazily-drawn RNG so existing seeded runs survive the migration; and a loudly-labelled
retired formula that is allowed to exist but not to answer.
