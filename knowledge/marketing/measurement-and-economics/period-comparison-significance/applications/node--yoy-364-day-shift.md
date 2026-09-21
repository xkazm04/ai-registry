---
layer: application
type: application
subject: period-comparison-significance
technique: yoy-364-day-shift
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The 364-day shift and the truncated flag - one function, two window rules

`evaluatePeriod` in `src/lib/metrics/series.ts:192-225` of the workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` is where both window rules of this
subject live, and it also proves the structural fact behind the
`equal-windows-and-truncated-flag` technique: **the baseline actually used and the
truncation are fields of the result** (`PeriodResult.baseline`,
`PeriodResult.truncated`, `series.ts:76-86`), so no consumer has to infer either
from the window lengths.

## 364, with the reasoning in the constant's comment

`const YOY_SHIFT_DAYS = 364` (`series.ts:50`) carries the whole argument in its doc
comment (`:43-49`): "364 = exactly 52 weeks, deliberately NOT 365. A 52-week shift
lands the year-ago twin on the SAME weekday ... a 365-day shift slides the twin by
one weekday every year - two across a leap year - reading a Mon-vs-Sun gap as a
year-over-year move. The 1-day calendar drift this trades away is immaterial next to
weekday parity." The `PeriodBaseline` type comment (`:36-40`) names the seasonality
incident the baseline exists for: "comparing December against September-November
reads pure Christmas seasonality as agency performance."

The year-over-year branch (`:198-213`) caps the span to `min(days, n - 364)` so the
twin fits inside the series, slices current and twin windows of equal span, and
returns `baseline: "yoy"`. When the span is below one day it **falls through** to
the adjacent-window branch and returns `baseline: "previous"` - the fallback the
technique requires, recorded in the result rather than silently substituted.

The dashboard reads that field to decide whether to offer the choice at all:
`src/components/dashboard/DashboardClient.tsx:144` probes `evaluatePeriod` with
`"yoy"` and sets `yoySupported = yoyProbe.baseline === "yoy" && !yoyProbe.truncated`;
`:148` honours a year-over-year request only while supported; and the period header
disables the option with `yoyDisabledTitle` ("not enough history for a year-ago
comparison") at `src/components/dashboard/vykon/PeriodHeader.tsx:118-120`. The badges
under it switch their hover wording on the same `baseline` field
(`src/components/dashboard/DeltaBadge.tsx:93-95`).

## Half the series, and a flag the narrative layer obeys

The adjacent-window branch (`series.ts:214-224`) caps the span to
`Math.floor(n / 2)`, with the comment: "Without this, a period longer than half the
data would be compared against a shorter baseline and inflate every delta."
`compareWindows` sets `truncated: span < requestedDays` and reports `actualDays`
(`:273-275`).

Two consumers prove the flag is load-bearing rather than cosmetic:

- The period header renders "shortened to N days" in the warning tone with the
  explanatory hover (`PeriodHeader.tsx:92-100`), rather than letting "12 months"
  silently mean a shorter span.
- The recap grounding refuses a trend word when the flag is set:
  `src/lib/report/recap-context.ts:66-70` computes the net-profit trend only when
  `!snap.truncated`, with the comment "a truncated snapshot halved a short series,
  so its 'previous' is fabricated." The same file's `HISTORY_MIN_DAYS = 700`
  (`:117-124`) records the incident that motivated it: a 300-day floor "let a
  ~200d-vs-200d comparison be narrated as '12 měsíců / meziročně'", and names
  `snap.truncated` as "the real guard".

## What the tree does not carry

At the pinned commit no test file exercises the 364-versus-365 weekday drift or a
gappy month's phantom days - the workspace has no `*.test.ts` under `src/lib/metrics`
or `src/lib/profit` - so both rules are proven by the source comments and the
consumers above, not by a regression test. The standard is unchanged by that gap;
it is the deviation to close first if the module is touched. And the 53-week
restatement the technique labels as convention has no counterpart here: the shift is
a fixed 364 with no accumulated-drift correction, which is correct for a series that
caps at 400 synced days and would need revisiting on a multi-year archive.
