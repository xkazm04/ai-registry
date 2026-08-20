---
layer: application
type: application
subject: metric-forecasting
technique: pace-against-a-deadline
stack: node
status: forged
verified_on: 2026-08-20
---

# Goal pacing, and the baseline that was never stored

`projectGoal` (`src/lib/maturity/forecast.ts:259-309`) reuses the same fit as
the level-band ETA and points it at a target line instead of a band boundary.
The section comment at `forecast.ts:249-252` names the distinction precisely:
*"Where the level-band ETA asks 'when do we cross the next maturity band', a
goal asks 'when do we reach this specific target, and is that before the
deadline'. Same OLS slope, a target line instead of a band boundary, and a
verdict against an (optional) target date."*

## What it computes

- **The crossing.** `forecast.ts:288-296`: only when `current < target &&
  perDay > 0`, days = `(target - current) / perDay`, date measured from
  `nowMs` — the same anchor-on-now rule as the band ETA.
- **The remedy.** `requiredPerWeek` (`forecast.ts:298-303`) is
  `((target - current) / daysLeft) * 7`, computed only while `daysLeft > 0`.
  This is the technique's "required gain per remaining period", and its guard
  is the past-due edge: no deadline left, no required rate.
- **The verdict.** `forecast.ts:305-309` resolves to
  `reached | on-pace | behind | tracking`. The fourth member is the one the
  technique calls for and most implementations omit: `tracking` is returned
  when there is **no deadline or no fittable trend** (`!hasDeadline || !fit`),
  keeping "not yet judgeable" distinct from "on pace". The ETA still renders
  beside it when one exists.

## Two horizons, deliberately different

`MAX_ETA_DAYS = 365` (`forecast.ts:75`) caps the band-crossing ETA — *"past
~a year it's fantasy, not planning"*. `GOAL_ETA_CAP_DAYS = 1095`
(`forecast.ts:260`) caps the goal ETA at three years, and its comment gives
the reason the two differ: *"A goal's ETA is fantasy beyond this — flatter
than 'reaches target in ~3 years' reads as 'behind'."* The generous horizon
exists so the verdict at `forecast.ts:308` can still conclude `behind` rather
than degrading to the neutral `tracking`. That is the derivation-horizon /
display-horizon split in
[horizon-caps-and-flat-bands](../techniques/horizon-caps-and-flat-bands.md),
found in the wild.

## The baseline trap, documented at the field

`GoalProgress.pct` (`src/lib/db/plan.ts:205-213`) is the technique's central
warning, stated by the repo against itself:

> 0..100 RATIO of current standing to target (`current / target`), NOT
> distance travelled from a creation-time baseline — goals don't record the
> metric's value at creation, so "progress since we set this goal" is not
> computable (a fleet at 45 targeting 50 shows a 90%-full meter on day one).
> The trade-off is documented here on purpose: the pace/ETA fields ARE
> trend-derived, so trust them (not the meter) for "how much work remains".

Computed at `plan.ts:343`. This is a **deviation** from the technique's
standard — the standard is a stored creation-time baseline, and it stays —
but the mitigation is exemplary and is where the golden path's
"document the degradation at the field, and name the field to trust instead"
rule comes from.

The second half of the mitigation is the creation-time guard.
`createGoal` (`plan.ts:254-266`) rejects an already-met target:

```
if (snap.repos.length > 0 && Math.round(input.target) <= current) {
  throw Object.assign(new Error(`The fleet is already at ${current} on this metric; pick a target above it.`),
    { code: "GOAL_ALREADY_MET" });
}
```

The comment explains the downstream damage prevented: without it a goal
*"would be stamped 'achieved' on the very next listGoals pass, polluting the
Met history with a milestone that represents zero movement."* The error
carries the current value so the user can pick a better target — a refusal
that teaches, the same shape as the presentability gate's prose. Note the
`snap.repos.length > 0` escape: with no scans every metric reads 0 and the
guard would be meaningless, so it is skipped rather than firing spuriously.

## The goal card gets the series, not just the number

`plan.ts:238-245` exposes the **same series the projection was fitted on** so
the card can draw the trajectory toward the target *"instead of a
point-in-time meter"* — which is the honest answer to a progress meter that
cannot measure distance travelled. `plan.ts:317` shows the single call site
that produces every pace field, so no surface re-derives a verdict.
