---
layer: application
type: application
subject: honest-measurement-presentation
technique: absent-delta-when-there-is-no-comparison
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The delta as a resolved object, not a subtraction

`app/_lib/analytics-deltas.ts` is the technique's rule 1 built as a module: the
comparison is computed server-side into a `Delta`, and the chip component
renders one only if it received one. The file is "pure + import-free so the
contract is unit-testable and the route can compose it over two
`pipelineAnalytics()` calls" — the same structural move the golden path argues
for, an honesty rule held as a value rather than as a branch in a component.
Citations are at kp `24006b85e`.

## The shape carries the refusal

```
export type Delta = {
  current: number | null;
  prior: number | null;
  // current - prior, in the figure's own unit (count, percentage POINTS, or days).
  // null when either side is null (can't form a baseline) OR the movement is withheld.
  delta: number | null;
  n?: { current: number; prior: number };
  withheld?: DeltaWithheld | null;
};
```

(`analytics-deltas.ts:14`, doc comments trimmed.) Three things land at once.
`diff()` (`:85`) yields `null` unless **both** sides are present, so a first
window, an empty prior window and an unmeasured prior all collapse to the same
honest nothing. The unit comment (`:17`) fixes the points-versus-percent
convention the technique demands — percentage **points** for rates, in the
figure's own unit. And `hireRate()` (`:104`) returns null "when the cohort is
empty", so a zero denominator never becomes a 0% that would then be differenced.

## Excluded by construction, not suppressed at render

The header comment (`:9`) draws the line the technique's closing section
argues for:

> Only COHORT-based scalars are compared (counts, hire rate, funnel conversion,
> time-to-hire) — figures that are meaningful for a past cohort. As-of-now
> metrics (active age, the live bottleneck, momentum buckets) have no
> prior-window analogue and are deliberately left out of the diff.

Those metrics have no `Delta` field at all, so no surface can accidentally
grow a chip on a live gauge.

## The thin-sample gate applies to both sides, and now to every rate

`MIN_RATE_DELTA_N = 5` (`:69`). Since 2026-09-23 (challenge-r06) the gate is
`gatedDiff()` (`:93`), and it covers the headline hire rate, each funnel
conversion and time-to-hire, not only source and channel rows (`gatedRate`,
`:123`): a rate delta carries both sides' `n`, and a side below the floor
nulls the movement and records why in `withheld` — `thinCurrent`, `thinPrior`
or `thinBoth` (`:27`). The suppression still travels through the null
channel, so a second component doing its own subtraction cannot defeat it.

Incomparability that is not about sample size is handled the same way:
`costPerApplicantCzk` is null in windowed views because spend is a lifetime
total (the DB layer's windowed-CPA honesty rule), "so its delta is null there
by construction" (`:35`). Two numbers exist; they are not comparable; no chip.

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
(`docs/product/uat-insights/2026-08-17-analytics-sections.md:107`) freezes "the
flat refusal to compute a '% improvement vs before' kp has no baseline for" —
the no-baseline-was-ever-taken case, which is the one product pressure most
often defeats. The reviewer's note on that refusal is recorded as *"That is
exactly the sentence I would have written myself."*

## Deviations

**A withheld movement renders as no comparison.** `withheld` is computed and
typed with its reason, and no file under `app/features` reads it. The chip
sees only `delta: null`, so a movement held back because one window had four
hires renders exactly like a first window with no predecessor. Those are two
different silences — *we have both figures and will not call the change* and
*there is nothing to compare* — and the dash technique's rule is that two
silences rendering identically are one silence. The payload already carries
what the surface needs; the chip needs a neutral "too few to compare" state
and its copy in four locales.

**The unit is optional in the type.** The chip takes `unit?: "pts" | "days"`
and falls through to a bare `${sign}${magnitude}` (`AnalyticsDeltaChip.tsx:25`).
In practice the rule holds: every rate call site passes `unit="pts"`
(`AnalyticsStatCluster.tsx:53`, `sections/PerformanceBriefing.tsx:233` and
`:329`), time-to-hire passes `unit="days"`, and the two sites without a unit
are the candidate total, a count. The compiler still permits an unlabelled rate
delta; a required `unit` with an explicit `count` member would close that.

**Computed and shown nowhere.** The `bySource` and `byChannel` deltas are still
computed, and `AnalyticsDeltaChip.tsx:11` names
`AnalyticsChannelEconomicsPanel.tsx` as a consumer, but that file has since
been split up and deleted. Nothing is wrong on screen; the comment describes a
surface that no longer exists.
