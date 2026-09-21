---
layer: application
type: application
subject: period-comparison-significance
technique: significance-tier-per-metric-class
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Significance tier per metric class - a dependency-free period engine

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` realises the
technique as one pure module, `src/lib/metrics/series.ts`, with no statistics
dependency and a single variance estimator shared with the anomaly engine. The
structural fact it proves is the one the technique rests on: **value ratios are
typed as a tier of their own, `"orientational"`, and the switch that assigns tiers
never computes anything for them** - the honest "no confidence claim" is a return
value, not a caption.

## The tier is a closed type, and the fourth member is not a confidence level

`series.ts:61` declares `type Significance = "strong" | "weak" | "noise" |
"orientational"`. The doc comment above it (`series.ts:52-60`) states the class
rule in the code's own words: additive metrics and the rate ratios "carry a real
confidence"; value ratios "have no sound two-window test - a ratio of sums isn't a
proportion and daily ratios aren't additive samples - so they report
'orientational': an honest directional read with NO confidence claim, rather than a
manufactured badge."

`significanceFor` (`series.ts:155-185`) is the class switch:

- `ctr` and `cr` go to `proportionSignificance` on **summed counts** - clicks over
  impressions, conversions over visits (`series.ts:158-171`) - not on averaged daily
  rates.
- `pno`, `roas`, `aov`, `cpc` fall through four `case` labels to a bare
  `return "orientational"` (`series.ts:176-180`), with the comment recording the
  incident: "the old daily-ratio z oversold every one of them".
- The `default` branch is the additive two-sample z (`series.ts:181-183`).

## The two tests, and their guards

`additiveSignificance` (`series.ts:125-133`) takes the mean and sample variance of
each window's daily values through `meanVar`, which delegates to the engine's one
estimator, `sampleVariance` in `src/lib/metrics/config.ts:90-95` (Bessel-corrected,
zero for fewer than two points). Its guards match the technique's decision rules
line for line: fewer than two days on either side returns `"noise"` (`:128`); a zero
standard error returns `"noise"` when the means agree and `"strong"` when they do
not (`:130`); otherwise `z = |Δmean| / se` with cuts at 2 and 1 (`:131-132`).

`proportionSignificance` (`series.ts:140-149`) pools the proportion, uses the pooled
standard error, and returns `"noise"` for a window with no trials (`:141`). The
convention status of the cuts is written into the source: the comment at
`series.ts:120-124` calls the additive test "a deliberate, dependency-free heuristic
for a 'is this real or noise?' badge, not a rigorous p-value (it oversells on very
short windows)" - the same label the technique requires.

## Every consumer reads the same field

`compareWindows` (`series.ts:253-265`) fills a `Record<MetricKey, Significance>`
beside the `delta` record, and the snapshot (`src/lib/metrics/snapshot.ts:123`)
carries it unchanged. Three downstream consumers read it rather than recomputing:

- `src/lib/metrics/insight-rank.ts:23` orders `{ strong: 0, weak: 1,
  orientational: 2, noise: 3 }`, with the comment explaining that orientational
  "sits below the confidently-real weak tier but above confirmed noise".
- `snapshot.ts:128-133` gates the funnel decomposition on
  `result.significance.revenue === "strong"`.
- The card grid passes `result.significance[m]` to each badge
  (`src/components/dashboard/vykon/KpiGrid.tsx:92`).

## Where the tree stops short of the standard

Two deviations, neither of which lowers the standard. The additive test runs on raw
daily values, not on weekday-de-seasonalised ones, even though the snapshot computes
`weekdayWeightsBundle` (`snapshot.ts:104`) for the anomaly, trend and pacing passes
in the same build; the autocorrelation caveat the technique states is therefore
carried by the comment, not by a correction. And no multiple-comparison adjustment
is applied across the eleven metrics of one `PeriodResult`, so a card grid will show
roughly one spurious weak badge per grid on noise alone. Both are documented
heuristic limits of a badge, and the standard remains: de-seasonalise where the
weights already exist, and never promote a grid's weak badge into a report sentence.
