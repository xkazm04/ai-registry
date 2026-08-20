---
layer: application
type: application
subject: game-economy-tuning
technique: tornado-sensitivity-sweeps
stack: node
status: forged
---

# A deterministic tornado sweep over an economy model

`src/lib/economy/sensitivity-sweep.ts` is 88 lines and implements the whole technique.
It is worth reading as a minimum viable sensitivity instrument: everything the method
needs, nothing it does not, and two limitations that must be reported rather than fixed
silently.

## The shape

```ts
export type SweepOutput = 'gini' | 'netFlow' | 'criticalAlerts';
```

Three outcomes, and the third is the one worth defending. `extractOutput` (`:28`) reads
the last metrics sample for `gini` and `netFlow`, and for `criticalAlerts` returns
`result.alerts.filter(a => a.severity === 'critical').length`. A discontinuous integer
count is an unusual sensitivity outcome and it is the one that answers the producer's
actual question — *does moving this reduce the number of things wrong with the economy?*
An input with a flat effect on both continuous outcomes and a large effect on the
critical count is precisely the lever worth pulling, and a purely continuous outcome set
hides it.

`runSensitivitySweep` (`:60`) takes the baseline from an unmodified run, then for each
parameter evaluates `baseAmount × (1 − range)` and `baseAmount × (1 + range)`, records
`delta = |high − low|`, and sorts descending — the tornado ordering. `SweepResult`
carries `output`, `range` and `baseline` alongside the entries, so a swing figure is
never quoted without the basis that produced it. Each `TornadoEntry` keeps `baseValue`,
`lowValue`, `highValue`, `low` and `high`, not just the delta, which is what makes a
surprising bar auditable instead of merely surprising.

Determinism comes from the seeded engine: `createRNG(config.seed)` with
`DEFAULT_CONFIG.seed = 42` means every re-run at a given override is identical, so the
measured swing is signal and not sampling noise. For a stochastic economy model this is
not a convenience — without it, small deltas are indistinguishable from run-to-run
variance and the bottom two-thirds of the chart is noise presented as a ranking.

The re-run primitive is factored out deliberately:

```ts
export function runWithFlowOverride(config, id, baseAmount, output): number
```

The header notes it is "reused by the tornado sweep and the goal-seek solver (economy
lever)" — `src/lib/economy/goal-seek.ts` solves backwards for the value that hits a
target using the same primitive. Sweep and solve are the same operation read in two
directions, and sharing the primitive keeps them from disagreeing about what a "run" is.

## Limitation one: a uniform range

`const range = opts.range ?? 0.5` — every parameter is swept at ±50% unless the caller
overrides. That is a ranking of the model's partial derivatives, not of the decision:
an input whose real plausible interval is ±5% and one whose interval is ±200% are given
identical treatment, and the second's true influence is understated by a factor of four.

The mitigation the file already provides is that `range` is returned in `SweepResult`,
so the basis travels with the result. The upgrade is per-parameter ranges tagged with
provenance — measured, estimated, or design choice — because that tag is what turns the
ranking into a work order: a high-swing *estimate* is a measurement to go and take, a
high-swing *design choice* is a lever to pull.

## Limitation two: magnitudes only

`withOverride` (`:34`) writes `{ id, baseAmount }` into `config.flowOverrides`. The only
sweepable field is `baseAmount`. But an `EconomyFlow` in `definitions.ts:41` carries
three numeric inputs — `baseAmount`, `levelScaling` and `frequencyPerHour` — and the
third is systematically the least trustworthy: `frequencyPerHour: 60` for enemy kills or
`8` for elite kills are throughput estimates somebody made once, and they multiply their
magnitudes linearly into every outcome the sweep measures.

So the sweep ranks the confident numbers and cannot see the guesses. That is a
reportable property of the instrument, not a small gap: a tornado chart covering one of
three input families reads exactly like one covering all of them. Either extend the
override to the other two fields, or state the covered field set in the result next to
`range` and `baseline`.
