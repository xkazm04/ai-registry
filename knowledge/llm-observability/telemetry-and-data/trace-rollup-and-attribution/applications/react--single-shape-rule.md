---
layer: application
type: application
subject: trace-rollup-and-attribution
technique: single-shape-rule
stack: react
status: forged
verified_on: 2026-09-01
verified_against: react@19
applied: code
---

# React: the summary strip counts the list's population, not its own

*Verified against the project tree at `b6dcf28aa`.*

This is the amendment's case in a live tree: two numbers that shared a
definition, sat one above the other on screen, and disagreed anyway — because
each folded a different span set.

## The two collections

The inspector holds two of them. `trace.spans` is the **backend** set, fetched
from the tracer. `unifiedTrace.spans` is the **merged** set: the same backend
spans converted and re-parented under the frontend pipeline stages by
`mergeBackendSpans` in `src/lib/execution/pipeline.ts:509`, joined at
`src/features/agents/sub_executions/detail/inspector/useTraceData.ts:221`. The
merged set is a strict superset in the normal case — it adds the client's own
pipeline stages, which can carry errors of their own.

Everything on the detail screen except one tile read the merged set. The error
cards derive from it at
`src/features/agents/sub_executions/detail/inspector/TraceInspector.tsx:76`,
and the waterfall directly beneath the strip renders it. The Spans tile folded
`trace.spans.length` locally.

## What the reader saw

Both tiles applied the same predicate — count the spans, count the failures —
so nothing about the *rule* was in dispute, and no reviewer of either file had
anything to flag. The strip could nonetheless print `Spans 12 / Errors 19` with
nineteen rows listed under it: the Spans tile under-reported by exactly the
pipeline stages, and the Errors tile counted a population the tile beside it
denied existed. A run that failed only in a frontend stage had previously
produced the same shape one tile over — `Errors 0` with an error card rendered
immediately below — which is what got `errorCount` lifted to the caller in the
first place. Lifting one number and leaving the other moved the disagreement
rather than ending it; that is the pattern the technique's new section names.

## The fix, in the amendment's terms

Neither number is computed on the strip any more. Both are passed down from the
caller that owns the list:

`src/features/agents/sub_executions/detail/inspector/TraceInspector.tsx:143-148`

```tsx
<TraceSummary
  trace={trace}
  model={execution.model_used}
  errorCount={errorSpans.length}
  spanCount={unifiedTrace?.spans.length ?? 0}
/>
```

and the tile bodies at
`src/features/agents/sub_executions/detail/inspector/TraceSummary.tsx:99-100`
and `:109-110` print the props verbatim. The component's own header comment now
states the invariant in one line — nothing on the strip counts its own
population — which is the display-site half of the rule.

Note which way the pin went: toward the **merged** set, because that is what
the list beneath renders. The collection is chosen by what the reader is
looking at, not by which set is more canonical upstream.

## The test that can actually fail

`src/features/agents/sub_executions/detail/inspector/__tests__/TraceInspector.test.tsx:96`
feeds a backend set of two and a merged set of four through the real component
and asserts the Spans tile reads `4`, matching Errors. That asymmetry is the
point: a fixture where the two sets coincide passes under the defect. The
recorded probe on the change was the same shape — backend 2, merged 4, tile
read 2 before and 4 after.

## What this does not establish

- **Only the two counts were pinned.** The strip's other tiles are not the
  same shape of number and were not touched: duration reads
  `trace.total_duration_ms` and cost/tokens read the fields off the single root
  span found in the `stats` memo at
  `src/features/agents/sub_executions/detail/inspector/TraceSummary.tsx:38-58`
  — a lookup, not a fold over a collection, so the amendment does not directly
  reach them. They do still resolve that root span out of the backend set while
  the rows below cover the merged one; that is a weaker exposure than a count,
  and nothing in the tree proves it either way.
- **The memo still folds one collection locally.** `toolCallCount` filters
  `trace.spans` in the same memo and is returned but never rendered — a dead
  computation today, and a live instance of the defect the moment a tile is
  wired to it.
- **The merged set is itself capped.** The strip carries a separate truncation
  warning; a pinned collection and a clipped collection are different
  guarantees, and this change bought only the first.
- **No A/B was run for this landing.** The evidence is the tree's own probe and
  the regression case, not a measured comparison.
