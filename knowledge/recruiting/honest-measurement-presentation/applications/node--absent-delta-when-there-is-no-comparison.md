---
layer: application
type: application
subject: honest-measurement-presentation
technique: absent-delta-when-there-is-no-comparison
stack: node
status: forged
---

# The delta as a resolved object, not a subtraction

`app/_lib/analytics-deltas.ts` is the technique's rule 1 built as a module: the
comparison is computed server-side into a `Delta`, and the chip component
renders one only if it received one. The file is "pure + import-free so the
contract is unit-testable and the route can compose it over two
`pipelineAnalytics()` calls" — the same structural move the golden path argues
for, an honesty rule held as a value rather than as a branch in a component.

## The shape carries the refusal

```
export type Delta = {
  current: number | null;
  prior: number | null;
  // current - prior, in the figure's own unit (count, percentage POINTS, or days).
  // null when either side is null (can't form a baseline).
  delta: number | null;
};
```

(`analytics-deltas.ts:14`.) Three things land at once. `diff()` (`:71`) yields
`null` unless **both** sides are present, so a first window, an empty prior
window and an unmeasured prior all collapse to the same honest nothing. The
unit comment fixes the points-versus-percent convention the technique demands —
percentage **points** for rates, in the figure's own unit. And `hireRate()`
(`:78`) returns null "when the cohort is empty", so a zero denominator never
becomes a 0% that would then be differenced.

## Excluded by construction, not suppressed at render

The header comment (`:9`) draws the line the technique's closing section
argues for:

> Only COHORT-based scalars are compared (counts, hire rate, funnel conversion,
> time-to-hire) — figures that are meaningful for a past cohort. As-of-now
> metrics (active age, the live bottleneck, momentum buckets) have no
> prior-window analogue and are deliberately left out of the diff.

Those metrics have no `Delta` field at all, so no surface can accidentally
grow a chip on a live gauge.

## The thin-sample gate applies to both sides

`MIN_RATE_DELTA_N = 5` (`:56`) with `gatedRate` (`:91`): "A rate is only
comparable when BOTH windows cleared the min-n floor; below it the side's rate
reads null so `diff()` yields a null (suppressed) delta." The suppression
propagates through the same null channel as every other refusal, which is why
it cannot be defeated by a second component doing its own subtraction.

Incomparability that is not about sample size is handled the same way:
`costPerApplicantCzk` is null in windowed views because spend is a lifetime
total (the DB layer's windowed-CPA honesty rule), "so its delta is null there
by construction" (`:26`). Two numbers exist; they are not comparable; no chip.

## The chip: direction is not valence

`app/features/insights/analytics/AnalyticsDeltaChip.tsx:6` states the rule the
technique's step 3 asks for:

> Green/coral keys off whether the change is an IMPROVEMENT (direction-aware:
> for time-to-hire, down is good), so the color reads as good/bad, not up/down.
> A null delta (no prior baseline, e.g. an empty previous window) renders
> nothing.

`lowerIsBetter` (`:12`) is the declared polarity, and `improved` (`:17`) is
computed from it rather than from the sign. The guard at `:14` implements all
three chip states in two lines: a null delta returns `null` — nothing renders,
no placeholder glyph, no grey zero — while a **measured** zero renders
`deltaFlat` in neutral steel. That is the distinction the technique insists on:
*no comparison* and *compared, unchanged* are different findings and must not
share a rendering.

## Confirmed at the doctrine layer

UAT guardrail G7
(`docs/product/uat-insights/2026-08-17-analytics-sections.md:77`) freezes "the
flat refusal to compute a '% improvement vs before' kp has no baseline for" —
the no-baseline-was-ever-taken case, which is the one product pressure most
often defeats. The reviewer's note on that refusal is recorded as *"That is
exactly the sentence I would have written myself."*

## Deviation

The chip takes `unit?: "pts" | "days"` and falls through to a bare
`${sign}${magnitude}` when neither is passed (`AnalyticsDeltaChip.tsx:25`). An
unlabelled delta on a rate is exactly the points-versus-percent ambiguity the
technique's unit rule exists to close, and the type permits it. Making `unit`
required — with an explicit `count` member — would move the rule from
convention into the compiler, where the rest of this module's honesty already
lives.
