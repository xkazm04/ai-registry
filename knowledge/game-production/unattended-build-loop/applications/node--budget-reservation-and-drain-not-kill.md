---
layer: application
type: application
subject: unattended-build-loop
technique: budget-reservation-and-drain-not-kill
stack: node
status: forged
---

# PoF's budget governor and the judge fleet's drain pool

Two independent implementations of the same rule in one repo: the harness
orchestrator's spend governor, and the judge fleet's drained worker pool.

## Reservation closes the concurrency overshoot

`src/lib/harness/orchestrator.ts:255` documents the admission check:

```ts
export function budgetWouldOverflowReserved(
  totals: HarnessCostTotals,
  reservedUsd: number,
  nextEstimateUsd: number,
  budgetUsd: number | null,
): boolean {
  if (budgetUsd == null) return false;
  const committedPlusInFlight = totals.spentUsd + reservedUsd;
  if (committedPlusInFlight >= budgetUsd) return true;
  return committedPlusInFlight + nextEstimateUsd > budgetUsd;
}
```

The comment names what the middle term buys: "This is what closes the
(maxConcurrent − 1) overshoot: without `reservedUsd`, the governor reads only
settled spend and green-lights every concurrent launch before a single dollar is
booked."

`sessionCostEstimate` (line 247) prefers the running average once any session has
settled and falls back to `SESSION_COST_ESTIMATE_USD` "so the first launches
still reserve a non-zero amount". `runLoop` keeps `reserved: Map<areaId, number>`
so each session releases exactly what it booked (line 676); `wouldOverflowNow()`
sums it on every launch. An un-budgeted run is not uncapped: `resolveBudgetUsd`
falls back to `DEFAULT_BUDGET_USD = 25` (line 191) unless the caller passes
`unlimited: true`.

## Every spawn, including the unplanned ones

The doctrine records the 2026-08-18 fix: a self-heal spawns a full second
`claude -p` session, and `SelfHealResult` used to discard its `costUsd`, so a
`budgetUsd: 25` run could materially exceed 25 — and every gate failure widened
the gap. Three details of the fix are worth transplanting:

- `SelfHealResult` now carries `costUsd` **and** `sessionSpawned`. The second
  field "is what keeps 'unmeasured' from collapsing into 'free' — only the
  no-verify-command early bail is genuinely free." A heal reporting no cost is
  booked at the per-session estimate and flagged unmeasured.
- Counting alone would not have held the ceiling: heals fire inside
  `processArea`, never through `fillPool`'s governor, so the heal is itself gated
  by `wouldOverflowNow()` (line 831) and reserves its estimate while in flight
  (line 850, `healReservationKey`).
- Heal sessions stay **out** of the `sessions` denominator on purpose — that
  figure estimates the next *executor* session, and short heals would drag it
  down and make the in-flight reservation less conservative.

## Drain, never kill

`runDrainPool` in `src/lib/judge/fleetPlan.ts:155` is the same rule for judge
draws, and its doc comment is the clearest statement of why cancelling is worse
than overshooting:

> Items already claimed are AWAITED to completion. They are not cancelled,
> because a judge draw's cost only arrives in the CLI's closing JSON envelope —
> killing it mid-flight would still burn the tokens while making the spend
> unmeasurable, and a half-read stdout could be parsed into a partial verdict. A
> counted overshoot beats an invisible one.

The pool returns `DrainPoolOutcome` with `started`, `unstarted`, `stopped` and
`drainedAtStop` — "how many claimed items were STILL RUNNING when a worker first
observed the stop… the overshoot width", captured on first observation (line
171) and capped by the pool width, "so the caller can report it instead of
implying the ceiling held."

## The skip asymmetry beside it

`judgeSkipDecision` (`src/lib/judge/fleetPlan.ts:36`) states the companion rule
for what may be skipped: "The worst case of a false 'unchanged' is one skipped
re-judge; the worst case of a false 'changed' is one wasted Opus draw. Both are
cheap — a WRONG skip that let an unjudged step read as judged is not, hence the
asymmetry." Every uncertainty judges: a non-comparable content hash re-judges, a
rubric bump re-judges, and `SkipDecision.reason` is populated for both outcomes
because "a skipped step that printed nothing would be indistinguishable from a
judged one in a run's output."

## A cap-hit is a pause, not a completion

On cap-hit the orchestrator emits `harness:paused` (with the cap named as the
reason, not "User requested pause") and drains in-flight work. The doctrine
records why the distinction is load-bearing: the paused branch marks
`stoppedForPause` and the loop tail returns on it instead of falling through to
`harness:completed` + `persistTerminal('completed')`. That fall-through used to
flip the run row terminal, which cascaded — `resolveRunIdentity` forked instead
of resuming, and `action:'resume'` answered 409 "Harness is not paused".
