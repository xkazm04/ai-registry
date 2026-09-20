---
layer: application
type: application
subject: data-viz
technique: scale-and-axis-design
stack: react
status: forged
verified_on: 2026-09-20
verified_against: react@19
---

# The projection was made a required door, and two charts walked around it

*Verified against the `ascent` tree at `62c252dd` (React 19.2.4, TSX, Next.js
16, Vitest). Every line number below was read at that commit; the counts are
mine, taken the same day.*

This repository draws every chart itself — no chart engine, only SVG — which
makes the technique's structural fix unusually legible: there is exactly one
module that turns a value into a coordinate, its signatures demand the domain,
and you can enumerate who calls it. Both halves of the outcome are here. The
call sites that go through the door are correct by construction, including the
ones whose domain is data-derived. The two that do not go through it
reimplement the sample-anchored floor from first principles.

## The door

`src/components/report/chartScale.ts` is the whole scale layer, and it is pure
functions, no framework:

| export | signature | what the domain is |
| --- | --- | --- |
| `vScale` (`:22-32`) | `(height, top, bottom) => (v) => y` | fixed `0..100`, not a parameter |
| `linScale` (`:49-54`) | `(domainMax, rangeStart, rangeLen) => (v) => px` | `0..domainMax`, required |
| `clamp01to100` (`:38-40`) | `(v) => v` | fixed `0..100` |
| `xScale` (`:60-62`) | `(count, left, width) => (i) => x` | index, not a value |

The technique asks for "a helper whose signature demands `[min, max]`". This
is the stronger variant of the same idea: the floor is not a parameter at all.
`vScale` cannot express a non-zero floor, and `linScale` takes only the
ceiling, so `[0, max]` is the only domain the module can produce. A
sample-anchored floor is not merely inconvenient to write through this door —
it is unrepresentable.

Ticks come from the same module. `BAND_EDGES` (`:16`) is `0, 25, 45, 65, 85,
100` — the maturity-level boundaries, not a tick generator's round numbers —
and `levelBandRects` (`:72-80`) derives the shaded band geometry from whatever
`y` it is handed, so the bands and the gridlines cannot drift apart between
the full trend chart and the per-dimension one. `CHART_INK` (`:88-94`) holds
the chrome strokes for the same reason, with its own comment naming the
alternative it exists to prevent: "a palette retune happens in one place
instead of drifting across ~10 chart files".

Thirteen non-test modules import it, across four feature roots
(`components/report`, `features/bought`, `features/shared`,
`features/standing`).

## The data-derived domains are the zero-anchored auto policy, not the defect

Three call sites compute their ceiling from the data, which the technique
permits — "even an auto-scale is a declared policy (zero-anchored, ceiling
following the data)" — and each of the three is visibly that policy rather
than a shrug:

- `features/bought/delivery/DeliveryTrendPanel.tsx:63` —
  `unit === "%" ? 100 : niceMax(max(values, 1))`. A share-of-whole axis gets
  the whole; everything else gets a rounded ceiling over a floor of zero. This
  is the technique's "percentages of a whole get the whole" and its "nice"
  domain rule in one expression.
- `features/standing/overview/FixFirstImpactBar.tsx:35` —
  `linScale(isNum(max) && max > 0 ? max : 1, 0, W)`: the degenerate
  all-zero series cannot produce a divide-by-zero, and the fallback ceiling of
  1 renders every bar at zero length rather than at an arbitrary one.
- `features/shared/athena/AthenaChart.tsx:42-46` — the only chart in the tree
  whose floor is allowed below zero, and the code says why at `:42-43`: "Zero is
  kept in the domain so a bar's length stays proportional to its value; a
  chart whose floor is the smallest bar exaggerates every difference above
  it." `lo = Math.min(0, ...all)` makes the floor zero for every non-negative
  series and only drops when the data genuinely crosses it, and values are
  shifted by `lo` before reaching `linScale` so the clamp does not eat the
  negatives (`:9-13`).

`features/bought/contributors/ChampionScatter.tsx` is the counterexample worth
naming, because it is the same author group making the honest choice about
bad data: it filters non-finite points out of the series before scaling
(`:40`) and renders a typed empty state when nothing survives (`:41-48`).

## Deviation 1 — the guard plants a non-measurement on the floor

`vScale`'s comment (`:24-27`) states the threat model exactly: "an unvalidated
history point (a NaN or out-of-range score from a drifted/bad `/api/history`
body) would otherwise produce a NaN y — silently breaking the whole `<path>`".
Funneling every chart through one projection so that one guard protects them
all is right, and it is a benefit of the single door the technique does not
currently claim. The chosen guard is not:

```ts
// chartScale.ts:29 — non-finite collapses to score 0
const c = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
```

A non-finite score is rendered at the bottom edge of the box, joined to its
neighbours by the same solid stroke as every measured point. That is the
fabricated crash the sibling technique names — "plotting unmeasured as zero
fabricates a crash" — drawn by the module whose job is to prevent lies of
geometry. `TrendChart.tsx:192` maps every point through `yFor` with no finite
filter, so nothing upstream intercepts it.

It is not an oversight, which is what makes it worth recording: the behaviour
is pinned as an invariant by `chartScale.test.ts:38-46`, which asserts
`y === BOTTOM_Y` for `NaN`, `Infinity` and `-Infinity` and calls it "the
keystone invariant the guard exists to hold". Two obligations were conflated —
*never emit a non-finite coordinate* and *never plot an unmeasured value* —
and the second was paid with the first's currency. The finite guard is
correct; its output should be a break in the series, not a point at the floor,
and `ChampionScatter`'s filter is the shape of that fix already present in the
tree.

## Deviation 2 — two glyphs that never reach the door

`features/inflight/live/LiveWarRoomStatParts.tsx:40-45` draws a trend glyph
for the live headline strip without importing `chartScale` at all:

```tsx
const min = Math.min(...points);
const max = Math.max(...points);
const span = max - min;
const y = (v) => (span === 0 ? H / 2 : H - P - ((v - min) / span) * (H - 2 * P));
```

That is the sample-anchored floor, verbatim, in the surface that refreshes
most often. The flat-series branch is careful about the divide-by-zero and
silent about the scale: a fleet average wobbling by one point fills the glyph
top to bottom, and it does so on every refresh, because the domain is
recomputed from whatever the window currently holds.

`features/standing/repositories/Sparkline.tsx` is the second, and it is in a
column: `RepoLeaderboard.tsx:61` maps a row per repository and
`RepoLeaderboardRow.tsx:94` puts this glyph in the activity cell. Its ceiling
is the row's own maximum (`:27`), so every row's bars are normalized to that
row — a repository at two commits a week and one at two hundred render
identical columns. The technique's sibling rule for dense surfaces says an
auto-scaled sparkline column is worse than none. The mitigation that is
present: the period total is printed beside the glyph (`:95-100`) and the
aria-label carries the window, so the number is never only in the picture.

Neither module is a deviation from the domain contract — they never entered
it. The repository built the structural fix and then grew two charts outside
its reach, which is the boundary the amended technique now names: the audit is
a census of what draws without calling the projection, not an inspection of
the domains passed to it.

## Provenance in the line itself

Worth recording as compliance with the golden path's fifth honesty rule
rather than with this technique: `TrendChart.CompactedBand.tsx:26-32` splits
the polyline into a dashed run over compacted (summarised) history and a solid
run over retained scans, and deliberately gives the joining segment to the
dashed run — "it starts at a summarised point, so drawing it solid would claim
a measured slope the data does not have" (`:29-30`). The dash is legended once
and only when a compacted point is on screen (`:36-44`). A separate
`data-mock` attribute marks simulated points on the same chart
(`TrendChart.tsx:199`).

## What this cannot do or prove

- **No runtime measurement.** Everything here is read from source at one
  commit. No bundle audit, no render timing, no screenshot of either
  sample-anchored glyph misleading a reader.
- **The two bypasses are the two I found by following the technique's own
  question.** I did not enumerate every SVG-drawing module in the tree, so
  "two" is a floor, not a census — which is itself the reason the amended
  technique asks for the census rather than for a reviewer's impression.
- **The NaN-to-floor behaviour has no observed incident behind it.** The
  module's comment asserts the upstream can deliver a bad point; I did not
  verify that any deployed response ever has.
