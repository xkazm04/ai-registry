---
layer: application
type: application
subject: data-viz
technique: empty-and-degraded-chart-states
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The decision was three components upstream of the pixel

*Verified against the project tree at `bf2a1e249`.*

The technique says the collapse it cares about usually happens before any
surface votes: *"a derivation that returns 0 for an empty denominator, or a
value type that cannot be null, or a defensive 'coalesce missing to zero' at
the fetch edge each collapse unmeasured into zero."* This run went looking for
the rendering bug and found the derivation instead, then used the compiler to
enumerate everything the derivation had been lying to.

## The seam

`src/features/overview/libs/metricIdentity.ts` is the module the codebase
built to stop success rate from meaning three things. It declares three
`MetricIdentity` records (`:12-41`) — each naming a source, a time window and
whether the value is a ratio or precomputed — and one resolver every surface
is supposed to route through:

```ts
// metricIdentity.ts:43-58 (before)
export function resolveMetricPercent(identity, values): number {
  if (identity.kind === 'precomputed_ratio') {
    const ratio = values.ratio ?? 0;
    return Number.isFinite(ratio) ? ratio * 100 : 0;
  }
  const numerator = values.numerator ?? 0;
  const denominator = values.denominator ?? 0;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return (numerator / denominator) * 100;
}
```

The return type is the defect. `number` cannot hold "no observation", so the
three `return 0` paths are not defensive coding — they are the only thing the
signature permits. Every caller downstream receives a number and has no way
to ask whether it was measured.

Follow it to a pixel. `sub_missionControl/MissionControlHome.tsx:100` rounds
the resolver's output into `stats.successRate`; `:213` hands it to
`VitalsConsole`, which at `:80` hands it to `SuccessRing`
(`VitalsConsole.tsx:123-160`) — a 164px ring gauge whose arc length is
`c - (rate / 100) * c` and whose colour is
`rate >= 90 ? green : rate >= 75 ? amber : rose`. At `rate === 0` that draws
an empty ring in the alarm hue with `0%` in the middle at four times the body
size.

So a fleet that executed nothing in the selected window renders identically
to a fleet whose every run failed. The technique's line about a chart frame
asserting a measurement applies with more force to a gauge than to an axis:
the ring's chrome is its claim, and an empty ring is not a blank state, it is
the worst reading on the dial.

## A and B

**A** — `resolveMetricPercent(): number`, with 0 for an empty denominator and
0 for a non-finite ratio.

**B** — `resolveMetricPercent(): number | null`, null for both, plus the
render decision at each consumer: `SuccessRing` draws the track and no arc
and shows a dash; the activity KPI tile (`ExecutionMetricsDashboard.tsx:94`)
shows a dash instead of `0.0%`.

## What was read

Two instruments, because the change has two halves.

**A unit test on the derivation.** Under A: `expected +0 to be null`, twice —
once for an empty denominator, once for a `NaN` ratio. Under B: 4/4, with the
measured-zero case (`0 of 20`) still asserting `0`, which is the half of the
contract that must not move.

**`tsc --noEmit`, used as a census rather than a pass/fail.** Widening the
return type to `number | null` and changing nothing else produced exactly
three errors:

```
sub_activity/components/ExecutionMetricsDashboard.tsx(94,94)
sub_missionControl/MissionControlHome.tsx(100,36)
sub_missionControl/MissionControlHome.tsx(116,36)
```

That list is the finding. It is the complete set of surfaces that had been
handed a fabricated zero and had no way to know, and it took a type change to
produce it — no amount of reading the rendering code would have enumerated
it, because at every one of those sites the value looked like a number that
had been measured. After fixing all three: clean, and 234 tests across
`src/features/overview` pass. Verdict `better`.

## The structural fact

The tree contains the correct shape already, one directory away, for the same
metric. `sub_health/libs/compositeHealthScore.ts:37` declares

```ts
successRate: number | null;      // 0-1, null when no SLA data exists at all
```

and its test suite asserts the null case explicitly
(`compositeHealthScore.test.ts:168`). Same feature, same quantity, same
window semantics — and there the value type carries absence all the way
through, because that module was written to score health and a health score
that cannot say "unknown" is obviously broken to its author.

Two modules under one feature root, one of which solved this and one of which
did not, is worth more than either alone: it shows the fix is not exotic or
expensive in this codebase, and that the thing which decided the outcome was
not skill or review but *which module the metric happened to be derived in*.
A metric routed through the health lane could say it was unmeasured; the same
metric routed through the identity lane could not, and the identity lane is
the one that exists specifically to stop success rate from drifting.

A second, unfixed instance sits beside it. `libs/fleetOptimizer.ts:128-130`
computes a fourth per-persona success rate and returns literal `100` when a
persona has no executions in the window. That value is currently unreachable
by the recommendation lane — both consumers filter on
`totalExecutions >= MIN_EXECUTIONS` first (`:206`, `:230`) — so it is a
fabrication with no present blast radius, held back by a floor that was put
there for a different reason and could be relaxed by anyone. It was left
alone deliberately: applying the technique there would have been a change no
gate in this tree can see.

## What this cannot do or prove

- **The dash is unlocalized and untested.** Both new render paths show a
  literal `—`. No test asserts it, and no visual check was run; `tsc` and the
  unit test confirm the *absence* travels, not that it reads well. A reviewer
  copying this should expect to design that state, not inherit it.
- **The technique's four facts are still two.** B distinguishes "measured" from
  "not measured". It does not distinguish "nothing exists yet" from "nothing in
  this window" from "not being measured" from "could not answer" — the fetch
  layer does not transport that, and a single `null` cannot carry it. This is
  the first of the technique's distinctions, not all of them, and the remaining
  three need a richer value type at the data contract, not at the resolver.
- **Gaps inside a series are untouched.** `MissionControlHome.tsx:130-136`
  still maps zero-execution days to `success_rate: 0` for the trend chart,
  which is the same collapse plotting a fabricated crash. It is a separate
  seam with a separate consumer and no gate that can see it.
- **`fleetOptimizer.ts:130` is reported, not tested.** The claim that its
  fabricated `100` is currently unreachable rests on reading two filters, not
  on running anything. Treat it as a lead.
- **Nobody was watching a real empty window.** No screenshot, no incident, no
  user report — the alarm-coloured `0%` is derived from reading the ring's
  arithmetic, and it is a prediction about what the surface does, checked
  against the code rather than against a running app.
