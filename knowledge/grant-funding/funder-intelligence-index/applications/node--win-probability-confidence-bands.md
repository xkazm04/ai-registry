---
layer: application
type: application
subject: funder-intelligence-index
technique: win-probability-confidence-bands
stack: node
status: forged
---

# Node — win probability with confidence bands, and its calibration audit

How the Wellspring product (repo `grant-writing-nonprofits`) implements the
base-rate estimate, the sample-driven confidence band, the per-cell live
merge, and the fit-score honesty audit — all as pure, unit-testable
functions where the caller supplies the rows.

## The lookup and the band

`src/features/match-engine/win-probability.ts`:

- v0 is explicitly a base-rate lookup — the header comment (lines 6-11)
  names the calibrated logistic model as "the documented follow-up", not
  the launch.
- Confidence thresholds are named constants: `HIGH_AT = 800`,
  `MEDIUM_AT = 200` (lines 19-20); `confidenceForSample` (lines 22-26)
  maps the cell's application count to `high | medium | low`.
- `estimateWinProbability` (lines 64-79) resolves the user's
  `(funderId, revenueBracket)` cell and returns
  `{ probability, confidence }` from **the same cell row** — one lookup,
  both values — or `null` when no cell covers the pair: "we never invent a
  probability without a base rate" (line 63). The honest-null rule, in
  code.

## Last-mile validation — an incident preserved as a guard

`toWinPercent` (lines 33-37) clamps into 0-100 and zeroes non-finite input
before display. The comment records why: `awardRate` is a PERCENT (0-100)
per cell row, not a 0-1 fraction, and "the previous `*10/10` was a literal
no-op that documented nothing" — a malformed cell (a fraction like 0.065,
or a value > 100) must not "surface a nonsense probability with full UI
confidence on the product's most decision-relevant number" (lines 28-32).
This is the percent-vs-fraction unit confusion the technique warns about,
caught in this repo's own history.

## The per-cell merge that closed an open loop

`mergeQuartiles` (lines 46-60) overlays live outcome signals on the static
curated prior per `(funderId, revenueBracket)` cell: live wins only when
`l.applications >= k` (k imported from the index's `K_ANONYMITY`);
otherwise the curated prior stands, and a below-floor live-only cell is
dropped, "never surfaced raw" (line 56). The comment at lines 39-45 records
the wiring gap the technique names as a silent failure: outcome recording
(`recordOutcome`) and aggregation (`getFunderQuartileSignals`) were both
built but "unconnected in the middle" — no recorded outcome could move a
displayed probability until this merge existed.

## The calibration audit

`src/features/match-engine/calibration.ts` implements
fit-calibration-monotonicity against the same outcome rows:

- Four fixed coarse bands over the 0-100 fit score (`FIT_BANDS`, lines
  18-23) — "narrow bands need large n before an award rate means anything".
- Per band, `submitted` / `decided` / `awarded` are tracked separately
  (lines 38-55); a pending `"submitted"` outcome counts toward submitted
  only, so mid-cycle pendings never depress a rate; `awardRate` is `null`
  when `decided === 0` (line 63), never 0%.
- The score is the frozen `fitScoreAtSubmit` field captured by
  `buildOutcomeRecord` (`outcomes.ts` lines 73-75, clamped 0-100) — the
  as-submitted freeze the technique requires.
- `isCalibrationMonotonic` (lines 72-81) is three-valued: `null` below two
  bands with data, `false` on any inversion (weak monotonicity — `<` is
  the failure test, equal rates pass), `true` otherwise. The header states
  the stakes: "do 85-fit submissions actually win more often than 55-fit
  ones? If they don't, the scorer isn't earning trust" (lines 6-7).

## Composition with the eligibility gate and the private floor

The estimate renders only for matched, eligible opportunities (the
match-engine's hard gates run first), and the org's private dashboard KPI
applies its own smaller statistical floor
(`src/features/funder-desk/kpis.ts`, `MIN_DECIDED_FOR_WIN_RATE = 3`,
`winRatePct: null` below it) — confirming the technique's boundary that
confidence bands govern the public estimate while private self-views need
only a noise guard.
