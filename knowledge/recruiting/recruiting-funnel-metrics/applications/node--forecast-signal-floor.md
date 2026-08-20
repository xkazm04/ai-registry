---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: forecast-signal-floor
stack: node
status: forged
---

# Two estimators, one observed leg, and a refusal

`app/_lib/analytics-forecast.ts` is the only forward-looking figure on a
surface where "every other figure is backward-looking" (`:1-6`), and it is
built exactly as the technique prescribes: pure, import-free, and fed from
inputs the analytics payload already produced.

## The two independent sources

Both estimators the standard names are present and separately typed
(`:8-14`):

- **Inflow** — `weeklyVelocity` is the mean of the momentum `added` series
  (`:61`), projected over `DEFAULT_HORIZONS = [4, 8, 12]` weeks (`:51`) and
  multiplied by the funnel's empirical end-to-end conversion
  `hiredReached / firstReached` (`:66`).
- **In-flight** — every active candidate is credited the forward conversion
  from **their own** stage, `hiredReached / row.reached` (`:87-92`), "so
  someone at Interview counts for more than someone just Accepted" (`:12-14`).
  The hire stage itself is skipped as already-hired, not in-flight (`:82-83`,
  loop bound `funnel.length - 1`).

They surface as two separate payload fields — `inFlightExpectedHires` and
`projected[]` (`:38-39`) — never averaged into one number, so the reader sees
the near-horizon and far-horizon estimates side by side.

## The observed leg replaces the implied one, and only when it can

`offerAcceptRate` (`:28-32`) is the measured acceptance fraction from
`analytics-offer.ts`, honesty-gated upstream to `null` below `MIN_OFFERS = 5`.
When present it rebuilds the offer→hire leg from the measurement:
`projectionConversion = (offerReached / firstReached) × observedAccept`
(`:79-80`), replacing a funnel-derived rate with a fact already held.

The guard `applyAccept` (`:77`) requires a real offer leg and a non-empty
cohort before substituting, and the fallback is the standard's safety
condition stated in the repo's own words: a null rate "leaves the
offer-derived conversion untouched, so the projection is byte-identical to its
pre-offer behaviour" (`:72-74`). The substitution is also applied consistently
in both estimators — candidates sitting at the offer stage are credited the
measured rate directly (`:90-91`) rather than the funnel-derived one — so one
leg is never priced two ways inside one forecast. `offerAcceptRate` is echoed
back in the result (`:41-44`) so the UI can state its basis ("assuming the
observed NN%") rather than presenting the projection as basis-free.

## The floor

`hasSignal = overallConversion != null && hiredReached > 0` (`:95`): a
non-empty cohort that has produced at least one hire. Below it the UI shows a
"not enough signal yet" state "rather than a misleading flat-zero forecast"
(`:45-47`), and `docs/features/analytics/README.md:524-531` lists that refusal
among the honesty rules the surface keeps as "load-bearing, not stylistic".

The refusal is typed at the boundary, and this is the one place the
implementation falls short of the standard: `projected[].hires` is set to
literal `0` when `hasSignal` is false (`:98`), so the *value* carries no
not-measurable state — only the sibling `hasSignal` flag does. Every current
consumer branches on the flag, so nothing renders the zero today; but a second
consumer reading `projected` alone would read "no hires coming" from a field
that means "unknown". The standard's requirement that the refusal be a type
rather than a value stands.

## Neighbouring floors on the same surface

The pattern is consistent across the sibling modules, which is what makes it a
policy rather than a habit:

- `app/_lib/analytics-bottleneck.ts:13` — `BOTTLENECK_MIN_SAMPLE = 3`, with
  the reasoning the technique gives: "the amber bottleneck banner directs
  recruiter attention, so a confident 'candidates in X have waited N days on
  average' backed by a single stale entry (n=1) erodes trust and misdirects
  effort" (`:5-9`). `pickBottleneck()` returns `null` when no stage clears the
  bar (`:20-35`) and returns `entryCount` alongside the average so the claim is
  legible rather than a black box.
- `app/_lib/metric-pack.ts:161-166` — the three-state contract
  (`measured` / `thin` / `not_measurable`) where "no value means
  not_measurable regardless of sample, and a value with a thin sample is never
  silently promoted to measured".
- `app/_lib/metric-pack.ts:168-173` — the pack "deliberately does NOT compute a
  '% improvement vs before'… inventing one is exactly the move that makes
  vendor metrics untrustworthy", and `recruiter_hours_saved` is sampled in
  **actions**, not hires (`:196-204`), "because a team can accumulate hundreds
  of actions before its first hire closes" — a sample basis chosen to match
  what the estimate actually firms up with.

## One deviation worth naming

`metric-pack.ts:179-181` picks the **median** time to hire over the mean, for
the standard's reason ("one stalled req drags a mean for months, and the
median is what a recruiter recognises as 'how long this normally takes'"), and
`analytics.ts:298-299` computes both. The forecast, however, is handed
`avgTimeToHireDays` — the mean — as its `etaDays` realization lag
(`PerformanceBriefing.tsx:102`), while `medianTimeToHireDays` sits unused in
the same payload. The heavy tail the median exists to absorb is therefore back
in the forecast's stated lag. The standard is unchanged; the wiring is the gap.
