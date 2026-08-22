---
layer: application
type: application
subject: encounter-balance-simulation
technique: goal-seek-on-a-seeded-monotonic-lever
stack: node
status: forged
verified_on: 2026-08-20
---

# A shared bisection engine with the precondition written into its header

`src/lib/balance/goal-seek.ts` in the `pof` repo is a generalized goal-seek solver — the
"Excel Goal Seek" for any simulator lever — and it is worth reading mainly for where it
puts its contract: at the top of the file, addressed to the caller.

## The contract (`goal-seek.ts:1`)

> - `metric` MUST be (approximately) MONOTONIC in the lever over `[min, max]`.
> - Bisect on a SEEDED/AVERAGED metric — Monte-Carlo noise makes an unseeded metric
>   non-monotonic and bisection chases the noise. Callers pass a fixed seed so
>   `metric(v)` is a deterministic function of `v`.
> - Out-of-range targets return gracefully (`converged:false`, nearest endpoint + the
>   reason) rather than throwing.

The same header records why the generic engine exists at all: two solvers already existed
(`loot/auto-balancer.solveWeightsForTargetEV`, closed-form; `combat/combo-tuner.
tuneComboToTargetDps`, analytic) but were **wired to nothing**. The closed forms stay;
the numeric engine covers levers that have none.

## The shape of the result

`SolveResult` (`goal-seek.ts:26`) carries `target`, `solvedValue`, `achievedMetric`,
`iterations`, `converged` and a human `reason`. Every non-bracketed exit routes through
one `nearest()` helper (`:57`) that returns the closest reachable endpoint with a reason
naming the achievable range:

```
`Target ${target} is outside the achievable range [${…}, ${…}] over lever [${min}, ${max}]
 — clamped to the nearest reachable value.`
```

The degenerate flat-metric case is handled separately at `:76`, and direction is inferred
from the endpoints (`const increasing = fMax > fMin`, `:80`) rather than assumed.
Defaults: tolerance `max(1e-6, |target| · 0.005)`, `maxIterations` 48 (`:44`).

## The seeded caller

`src/lib/combat/goal-seek.ts:36` (`solveCombatTuningForTarget`) is the combat lever
binding, and it satisfies the precondition explicitly. Its header:

> The sim averages over `config.iterations` from a FIXED seed, so `metric(v)` is
> deterministic — bisection via the shared `solveFor` converges on the real curve, not
> the noise.

The metric closure at `:45` clones the tuning overrides with the lever value substituted,
runs `runCombatSimulation`, and returns either `summary.survivalRate` or
`summary.avgFightDurationSec`. The lever range defaults to the slider band `[0.5, 2.0]`
(`:43`) with a stated monotonicity claim over that band — the sweep-before-you-solve step,
asserted in a comment rather than checked at runtime, which is the honest limit of what
this file does. `src/lib/economy/goal-seek.ts:48` binds the same engine to a faucet/sink
lever against net flow.

## Where the standard is higher than the code

The monotonicity precondition is documented per binding but never verified: nothing
samples the curve before bisecting, so a caller that adds a non-monotonic lever gets a
confident wrong answer. The technique's rule — sweep the range once, confirm no reversal,
then solve inside the well-behaved region — is not lowered here; the code is a partial
realization of it. The `converged` flag is the mitigation that keeps a failure visible,
and it is the field a UI must never drop.
