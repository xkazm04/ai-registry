---
layer: application
type: application
subject: production-work-prioritization
technique: five-factor-weighted-scoring
stack: node
status: forged
verified_on: 2026-08-20
---

# Five-factor scoring in a next-best-action engine

The Proof of Fun repo realizes this technique in `src/lib/nba-engine.ts` — a synchronous
engine that reads checklist progress, a feature dependency graph, a pattern library,
evaluator findings and recorded run outcomes, and emits a ranked list of checklist items
for one module.

## The factor set and its weight table

`ScoreBreakdown` (`src/lib/nba-engine.ts:109`) names the five factors with their ceilings
inline:

```ts
export interface ScoreBreakdown {
  urgency: number;       // 0–30: dependency blockers, critical priority
  successProb: number;   // 0–25: pattern success rate, module track record
  impact: number;        // 0–20: how many features does this unblock
  recency: number;       // 0–15: evaluator recommendation priority
  readiness: number;     // 0–10: all deps met, not blocked
}
```

The weights live once, in `W` at `:119`, and are re-exported as `NBA_FACTOR_WEIGHTS` with
an explicit note that the why-recommended bar reads them "so segment maxes stay
single-sourced". That export is the technique's rule 2 realized: the visualisation cannot
acquire its own copy of the maxima and drift from the engine.

Bounding is per-factor and explicit: `Math.min(dependentCount * 6, W.urgency)` for urgency
(`:239`) and `Math.min(dependentCount * 4, W.impact)` for impact (`:264`). Both saturate —
urgency at five dependents, impact at five — and neither saturation point is documented
outside the code. That is the deviation: the standard says publish the saturation point,
because a candidate with fifty dependents and one with five are indistinguishable to this
ranking and a reader has no way to know that.

## Reductions are implemented as reductions

Checklist-level prerequisites (`:270`) are the one-directional case. `item.dependsOn`
names sibling items; unmet siblings set `breakdown.readiness = 0` and `unshift` their
reason to the front of the list. The comment states the rule the technique generalizes:
"this can only ever LOWER readiness". It is never an additive term, so the 100-point
ceiling stays true.

The evaluator boost at `:285` is the interesting hybrid — a critical finding raises urgency
via `Math.max(breakdown.urgency, W.urgency * 0.8)`, a floor rather than an addition, so a
critical flag cannot stack on top of high fan-out to exceed the ceiling.

## The breakdown travels with the score

`NBARecommendation` (`:37`) carries `score`, `breakdown`, `reason`, `pitfalls`,
`successProbability`, `successEvidence` and `featureMatch` in one payload. The comment on
`featureMatch` states why: every confident claim on the card "is only as true as this — so
it travels WITH the score instead of being re-derived by whoever renders it."

## The upward lesson: the binding caps everything

The draft standard said the score is only as good as its binding; the repo shows what that
costs when it is not enforced. `resolveItemFeatures` (`:224`) consults an exact
`CHECKLIST_FEATURE_MAP` first and treats it as **terminal** — an item mapped to `[]` scores
no urgency and no impact, with the reason string "No feature row can evidence this item —
nothing to unblock" (`:383`). Without that terminality, an empty exact mapping would fall
through to `firstWordMatch` and borrow a same-prefix neighbour's fan-out, printing
"Unblocks 3 dependent features" about an item that unblocks none. Where the heuristic tier
does fire, `HEURISTIC_MATCH_NOTE` is appended to the reason (`:388`) so the label travels
with the claim.

The second upward lesson is the freshness gate at `:236`: urgency is credited only while
`!allImplemented` — "an item whose features are all done unblocks nothing." Absent that
check, completed hub work sits permanently at the top of the ranking.

## Deviations the standard does not lower

The weights `30/25/20/15/10` carry no recorded rationale, no review date, and no override
log to calibrate against. Urgency and impact both read the same `dependentCount`, which is
a deliberate double-weighting of fan-out but is nowhere stated as one. And
`firstWordMatch`-bound recommendations are labelled but not capped — a heuristic binding
can still reach the top of the list.
