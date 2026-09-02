---
layer: application
type: application
subject: production-work-prioritization
technique: vertical-slice-as-the-first-milestone
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# A vertical-slice milestone reported as a project-wide percentage

The Proof of Fun repo (commit `9aa31407`) has a vertical-slice milestone, a deadline
store, and a next-best-action ranking engine — and they are three disconnected systems.
Reading them together is the clearest available demonstration of why the milestone's shape
has to be declared as data rather than inferred from a completion metric.

## The milestone exists, and it is a horizontal fraction

`predictMilestones` in `src/lib/health-engine.ts:162` emits four milestones, the first of
which is the slice:

```ts
const completionPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
// ...
  id: 'vertical-slice',
  name: 'Playable Vertical Slice',
  targetCompletion: 30,
  currentProgress: Math.min(100, Math.round((completionPct / 30) * 100)),
```

`totalItems` is `TOTAL_CHECKLIST_ITEMS` (`:30`), which is the all-module checklist total
(`ALL_CHECKLIST_TOTAL`), and the call site at `:437` passes the project-wide completed
count. So "Playable Vertical Slice: 100%" is reached the moment thirty percent of the
checklist items *anywhere in the project* are ticked — thirty percent of animation work,
thirty percent of audio work, thirty percent of loot work, with no path through any of it.

This is the technique's rule 5 inverted precisely: the slice is reported as a fraction
across systems, which is a statement about breadth wearing the name of depth. Nothing in
the computation knows what the terminal observation is, which layers the path crosses, or
whether any of them is stubbed. The header comment at `:23` is careful about one real
hazard — that numerator and denominator share a scope so they cannot drift — and the
scope they carefully share is the wrong one for this milestone.

The deviation is not that a percentage is used. It is that a percentage is *available*
where a step name is required, so the metric answers confidently and the answer is
structurally incapable of being about a path.

## The date is stored and nothing prioritizes against it

`src/lib/db.ts:298` declares `milestone_deadlines` (`milestone_id`, `target_date`,
`label`, `updated_at`), and `src/app/api/milestone-deadlines/route.ts` reads and upserts
it. The only consumer is a calendar view:
`src/components/modules/evaluator/CalendarRoadmapView/useCalendarRoadmapView.ts:44` fetches
the map, `:60` writes a target date back.

That is the whole of it. The date is rendered on a timeline and never reaches a decision.
Grepping `src/lib/nba-engine.ts` for `deadline` or `milestone` returns nothing — the
matches for `slice` are all array operations and a comment about a state-store slice. The
ranking engine has no deadline term, no cut list, and no notion of slice membership.

## Why the ranking drifts horizontal here specifically

`computeNBA` (`src/lib/nba-engine.ts:151`) scores *uncompleted checklist items for one
module* on the five weights in `W` (`:119`): urgency 30, success odds 25, impact 20,
recency 15, readiness 10. Every factor is per-item and module-local. `getTopRecommendation`
(`:423`) and the cross-module aggregate at `:459` sort by score and take the top N.

Nothing in that pipeline can prefer the fourth step of a started path over the first step
of a fresh system — the fresh system's substrate has higher fan-out by construction, which
is exactly what urgency and impact reward. The engine is behaving correctly and the plan
it produces is horizontal, which is the technique's central claim about automation
demonstrated rather than argued.

## What the correction looks like against this tree

Three changes, none of them to the weights.

Declare the path as an ordered list of steps with a named terminal observation, alongside
the existing feature dependency declarations in `src/lib/feature-definitions.ts`, and mark
each step real or stubbed. Apply membership as a filter above `computeNBA` — the technique
is explicit that it must not become a sixth factor, because the module-local pile of
high-fan-out breadth will outvote any weight during exactly the weeks the path most needs
closing. And change `predictMilestones` so the slice reports its furthest contiguous real
step rather than `completionPct / 30`; the other three milestones are genuinely
breadth-shaped and the fraction is the right instrument for them, which is why the slice's
different nature has to be stated rather than assumed.

The deadline store is already the right shape to carry a cut list: it is keyed by
milestone and it is durable. What is missing is an ordered list of what sheds, attached to
the same key, and read by the same engine that ranks.
