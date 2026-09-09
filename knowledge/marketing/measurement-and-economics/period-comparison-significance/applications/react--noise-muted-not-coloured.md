---
layer: application
type: application
subject: period-comparison-significance
technique: noise-muted-not-coloured
stack: react
status: forged
verified_on: 2026-09-09
verified_against: react@19
---

# Noise muted, not coloured - a delta badge with two independent channels

`src/components/dashboard/DeltaBadge.tsx` in the workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` is a 108-line client component that
takes `delta`, `goodDirection`, `significance` and `baseline` as four separate props
(`:36-51`) and never derives one from another. That prop shape is the structural
fact the technique asks for: **direction and confidence arrive as two inputs and
leave as two rendering channels** - tone from direction, suffix and muting from
tier.

## The render order matches the procedure

1. **Below rounding.** `DELTA_NOISE_FLOOR = 0.0005` (`:59`) with the comment "|delta|
   below this rounds to 0,0 % at one decimal, so render 'no change' instead"; a
   non-finite or sub-floor delta returns the muted pill with the `noChange` string
   (`:60-62`). Half the displayed precision, stated once - the convention the
   technique names.
2. **Noise.** `significance === "noise"` returns the muted pill (`bg-navy-50
   text-muted`) that keeps the arrow icon and the signed percentage, with `title`
   and `aria-label` carrying `noiseTitle` - "Change within normal variance, not
   statistically significant" (`:66-79`). The number stays; the colour goes.
3. **Everything else.** `improving = goodDirection === "up" ? delta > 0 : delta < 0`
   (`:81`) picks the positive or negative tone - a falling cost ratio is green
   because the metric's `goodDirection` says so, never because of the sign. The
   suffix map (`:85-92`) appends "weak signal", "significant", or "directional read
   (ratio metric, no significance test)" for orientational, and `changeTitle`
   (`:93-95`) swaps "vs previous period" for "vs the same period last year" on the
   `baseline` prop. Both land in `aria-label` as well as `title` (`:101-102`), so the
   confidence is read aloud, not only hovered.

The orientational case is coloured, not muted, exactly as the technique's "when NOT
to use" requires: the comment at `:83-84` says "a coloured directional pill (like a
real change) but the tooltip is explicit that there's no significance test behind
it."

## The same tier, read by the neighbours

The badge is one of three consumers of the same `significance` field on a card:

- `src/components/dashboard/KpiCard.tsx:52-57` passes the tier straight through to
  `DeltaBadge`.
- `KpiCard.tsx:70-74` suppresses the sparkline's green/red auto-colouring with
  `autoColor={significance !== "noise"}`, with the comment "A noise-grade delta isn't
  a real trend ... the card stops overselling daily wobble as direction."
- `src/components/dashboard/vykon/KpiGrid.tsx:92` sources the tier from the engine's
  `result.significance[m]` for all five headline metrics, so no component recomputes
  it.

Insight lines rank by the same field through `compareInsightRank`
(`src/lib/metrics/insight-rank.ts:33-41`), tier first, magnitude second, stable for
ties so a revenue line and its funnel explanation stay adjacent.

## The identical-delta rule, in the channel table

`src/lib/metrics/channels.ts:141-153` documents why the channel table shows the
revenue delta once: on the static-share path "every channel's *revenue* `delta`
algebraically equals the aggregate revenue delta (the share cancels) ... showing it
per channel would print the same number on every row and read as fake data." Per-
channel deltas render only on the time-resolved path, where each channel is summed
from its own daily shares. This is the technique's fifth decision rule, learned in
the tree as an incident and adopted upward into the standard.

## Where the tree stops short

The badge cannot express absence. A metric with no prior window reaches it as a
`delta` of `0` from `rel`'s zero guard and renders "no change", which is the wrong
state - "not measured" and "no change" are different claims. The engine's `rel`
returns `0` for a zero baseline (`src/lib/metrics/totals.ts:45`), so the distinction is
lost before the badge sees it. The standard stands: an absent delta is a blank or a
label, never a muted number, and the fix belongs in the engine's return type.
