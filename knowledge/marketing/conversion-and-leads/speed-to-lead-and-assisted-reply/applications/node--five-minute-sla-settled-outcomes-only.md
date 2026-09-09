---
layer: application
type: application
subject: speed-to-lead-and-assisted-reply
technique: five-minute-sla-settled-outcomes-only
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The SLA rate that only moves when something settles - two queues, two targets

The Czech-first marketing workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) carries the technique's two structural facts in two pure modules: an
open-but-not-breached lead is never a hit (`src/lib/speed-lead/analytics.ts`), and a
second, 15-minute queue target exists beside the 5-minute drill target and says why
(`src/lib/leads/sla.ts`).

## Three outcomes, not two: `computeResponseAnalytics` (`analytics.ts:59-78`)

```ts
for (const o of outcomes) {
  if (o.responseSec != null) {
    judged += 1;
    if (o.responseSec <= SLA_TARGET_SEC) hits += 1;
  } else if (o.breached) {
    // An open, already-breached lead is a definite miss - a settled verdict.
    judged += 1;
  } else {
    // Open and still within target -> no verdict yet; visible as at-risk, not a win.
    atRisk += 1;
  }
}
```

The rate is `judged === 0 ? null : hits / judged` (`:95`), so an all-fresh inbox
reports no rate. The incident that produced this shape is recorded in the doc comment
at `:28-33` and `:53-58`: counting open leads as hits *"made the band non-monotonic (a
flattering 100% exactly when fresh leads pile up unanswered)"* and *"made the rate drop
as time passed"*. That is the technique's inversion argument, observed rather than
reasoned. `test-unit/speed-lead-analytics.test.mjs:28-49` pins it: an open on-track
lead is `atRisk`, not judged (`:36-38`); an all-fresh inbox returns `withinSlaRate:
null` with the comment *"was 1.0 under the old optimistic rule"* (`:46`).

Per-channel averages are built only for channels with at least one answered lead
(`:80-90`), and the median is over measured response times only (`:41-46`) - the
answered set, which is why the technique says a fast median and a poor rate can both be
true.

## Two targets, each labelled: `SLA_TARGET_MIN` and `LEAD_SLA_TARGET_MIN`

`src/lib/speed-lead/draft.ts:7` exports `SLA_TARGET_MIN = 5` (*"Respond within this
many minutes or the lead goes cold"*) and `analytics.ts:9` derives `SLA_TARGET_SEC`
from it - one constant, one derivation. `src/lib/leads/sla.ts:16` exports
`LEAD_SLA_TARGET_MIN = 15` with the reason at `:14-15`: *"Deliberately NOT
speed-lead's 5 min: that module simulates a live phone-desk drill, this one is the
day's work queue"*. The tree therefore proves the technique's claim that two targets
can coexist when each surface names its own; it also shows the failure the law guards
against would be one import away.

`sla.ts` derives the pre-breach warning state from the target rather than typing a
second number: `WARNING_RATIO = 0.35` (`:22`) and the phase ladder at `:44-48` reads
`breached` when past due, `warning` when remaining is at or under 35% of the target,
`ontrack` otherwise. A settled row - one with `firstRespondedAt` - short-circuits to
`settled` before any clock comparison (`:43`), which is the *"a settled row can never be
overdue"* rule from the header (`:8`). The deadline itself comes from what the store
wrote or arrival plus target (`:30-35`); no phase is stored. `isQueued` (`:53-55`)
defines the handle-now list as unanswered and not in a terminal stage - an answered
lead has left the queue even if still open, and a lost lead is not work.

## Reconciliation

Confirmed: the three-state rate, the null rate over an empty denominator, the
per-surface constant, the derived warning ratio, the settled-cannot-breach rule. The
non-monotonic-rate incident is an upward lesson the draft took as its central argument.
Two things the technique states that the tree does not carry: the 5-minute target has
no comment naming its footing as convention (the technique labels it; the constant does
not), and the work-queue `sla.ts` has no rate of its own yet - it computes phases and
the queue order, so the technique's rate discipline is proven only on the drill
module. The three-state discipline the technique demands is visible only in
`analytics.ts`; a future queue rate should import it rather than reinvent it.
