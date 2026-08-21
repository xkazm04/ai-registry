---
layer: application
type: application
subject: peer-benchmarking-under-k-anonymity
technique: all-time-basis-and-why-a-window-biases
stack: node
status: forged
verified_on: 2026-08-20
---

# The refused window switcher (Next.js route + a source-level basis guard)

`app/api/benchmarks/route.ts` takes no `days` parameter, and lines 14–27 record
that this is a refusal rather than an omission. The Analytics tab has a 30/90-day
cohort switcher; threading it into the benchmark "was considered and REFUSED on
two grounds, both of which would make the control's promise worse than its
absence".

## Ground one: a narrowing control that withholds

`BENCHMARK_MIN_ENTRIES = 20` and `BENCHMARK_MIN_TEAMS = 2`
(`app/_lib/db/org-benchmarks.ts:23-24`) are what license the cross-workspace read
at all. The route's reasoning: "A 30-day slice drops most orgs below it, so
picking a window would not narrow the benchmark — it would WITHHOLD it. A
switcher that deletes the panel is not a scoped view." This is the technique's
control-evaluation rule stated from the other direction, and it is the sharper
formulation — the defect is in offering the control, not in the empty result.

The companion guard `app/features/insights/analytics/analyticsWindowScope.test.ts`
records the shipped version of that bug: the switcher lives in the always-rendered
header, so it "sat with `aria-pressed="true"` above an entire section that reads
no window … and above `/api/benchmarks`, which takes no parameters at all. A
reader picked 'Last 30 days' and part of the page silently stayed all-time."

## Ground two: truncation bias

The route states it plainly (lines 22–25): `medianTimeToHireDays` is measured
created→Hired over entries *created* in the window, "so a 30-day cohort can only
contain hires that already finished: the slow ones are structurally absent and
the median reads low." The module header repeats it at
`org-benchmarks.ts:15-22`, calling the all-time basis "a decision, not an
omission".

The median itself is computed at `statsFrom()` lines 74–79 over `tthDays`,
accumulated only for rows in a terminal stage with both `created_at` and
`stage_changed_at` present (lines 66–72) — completed processes only, which is the
technique's step 2. Rows with a missing timestamp or a negative interval are
dropped rather than defaulted, and `medianTimeToHireDays` is `null` when nothing
qualifies (line 31), not zero.

The route also names the correct fix rather than just the refusal: "If a windowed
benchmark is ever wanted it needs its own basis (completed-in-window, with the
floor recomputed per window) — not a `days` param bolted onto this one."

## The basis is a pinned contract, not a caption

This is the strongest realization of the technique's step 6. The panel prints the
scope on screen — `AnalyticsOrgBenchmarkPanel.tsx:104` renders
`t("scopeAllTime")` — and `analyticsWindowScope.test.ts` asserts the invariant
over the writers' own source, comment-stripped, so that "a claim printed on
screen is checked against the endpoint that would have to back it, rather than
against a hand-copied duplicate of the rule". The module comment states the
failure condition: the test "fails if the route grows a window param while the
panel still claims all-time" (`org-benchmarks.ts:21-22`).

## Deviations

- The all-time basis is stated as a scope line in the panel, but the released
  figures do not carry the contributor count *inside* the basis string — the
  count is a separate footnote (`AnalyticsOrgBenchmarkPanel.tsx:142`). The
  standard wants sample and contributor count travelling with the number as one
  basis, not as adjacent decoration.
- No recency-weighted alternative exists, so a genuine market shift is invisible
  for as long as history dominates. The technique's escape hatch (weight
  explicitly rather than truncate) is unimplemented; the repo simply accepts the
  slow-signal weakness, which is the correct trade but not the full standard.
