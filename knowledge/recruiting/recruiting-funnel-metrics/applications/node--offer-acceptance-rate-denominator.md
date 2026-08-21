---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: offer-acceptance-rate-denominator
stack: node
status: forged
---

# The offer leg as a pure fold over four event kinds

`app/_lib/analytics-offer.ts` is the technique in one 74-line dependency-free
module. The four offer-lifecycle events (`offer_sent`, `offer_accepted`,
`offer_declined`, `offer_expired`) were already written to `pipeline_events`
and never aggregated, so the funnel "stopped meaning anything after Interview"
(`:1-8`) — there was no acceptance rate at all, and the hire forecast
projected with no acceptance-probability input.

## The max-denominator rule, literally

`offerConversion()` (`:50-74`) computes:

```
resolved = accepted + declined + expired
extended = max(counts.extended, resolved)
n        = extended
pending  = max(0, extended - resolved)
```

The comment at `:35-36` states the reason exactly as the standard does: `n` is
`max(extended, resolved)` "so a missing `offer_sent` trail (legacy rows) can
never push a rate past 100%". Older offers in this workspace logged only their
resolution, so `extended` under-counts; the fallback lands on the count that
cannot be under-recorded, because every term of `resolved` is a terminal event
somebody had to write. No clamp appears anywhere in the module — the bound is
earned by the denominator choice, which is the property the standard asks for.

`pending` (`:26`, `:56`) is the censoring the standard requires be visible:
extended offers with no terminal event yet, documented in the type as "a live
offer, not a loss".

`clampCount()` (`:42-44`) floors every input at a non-negative integer, so a
malformed row cannot make a negative denominator — the numeric analogue of the
skip-don't-throw rule.

## The floor, and its relation to the neighbouring floor

`MIN_OFFERS = 5` (`:15`). The comment carries the calibration explicitly:
offers are the rarest pipeline event, so this floor sits well below the
calibration-outcomes gate (`MIN_CALIBRATION_OUTCOMES = 20`), but "a handful of
offers must never mint a headline rate the recruiter over-reads". Below the
gate, `acceptRatePct` / `declineRatePct` / `expireRatePct` are `null` rather
than 0 (`:59`, `:66-68`) — the not-measurable state as a type, not a value —
and `minOffers` is echoed in the payload (`:38`) so the UI can render the
honest "K of 5 offers" gate line rather than an empty panel. The threshold
policy itself belongs to the small-sample discipline; what this module owns is
that the denominator is right before any threshold is applied to it.

## Wiring, and what the query already guaranteed

`app/_lib/db/analytics.ts:439-442` feeds the fold from the `kindCounts`
GROUP BY it already ran — windowed, workspace-scoped, and simulation-excluded
by `notSim()` (`:20`), the NULL-safe predicate that keeps guided-demo rows
carrying the `(SIM)` title marker out of every leadership metric while
preserving entries with no job title as real data (`:13-19`). The exclusion is
in the query, not a caveat under the chart.

The separation the standard asks for is in the payload shape too:
`PipelineAnalytics` keeps `rejected` (the company passed) and `declined` (the
candidate turned down an offer) as two distinct terminal closes, explicitly
"so offer-acceptance / re-engagement metrics aren't muddied by lumping
candidate declines into recruiter rejects" (`analytics.ts:38-42`).

## The observed rate replaces the implied leg

`acceptRate` is exported as a 0..1 fraction (`:34`) purely so
`analytics-forecast.ts` can substitute the *measured* acceptance for the
funnel-implied offer→hire leg (`analytics-forecast.ts:28-32`, `:69-80`). Both
halves of the substitution the standard demands are present: candidates
already at the offer stage are credited the measured rate directly rather than
the funnel-derived one (`:90-91`), and when `acceptRate` is `null` — below the
gate, or no offer leg exists — the projection is documented and implemented as
"byte-identical to its pre-offer behaviour" (`:30-31`, `:74`, `:77`).

## Where the surface goes further, and where it does not

Further: the opposite-sign rule is enforced elsewhere on the same page —
`pctOfManualBaseline` is deliberately *not* capped at 100%, because there the
denominator is an assumed constant (`MANUAL_HOURS_PER_HIRE = 42`,
`app/_lib/automation-roi.ts:46`) and "a ratio over 100% is the signal that a
denominator is wrong; the cap rendered exactly that reading as believable"
(`docs/features/analytics/README.md`, Economics). Bounded where the
denominator is observed, uncapped where it is assumed — both arms, on one
screen.

Not as far: the module has no segmentation. Acceptance is workspace-wide, so
the figure moves with role and level mix and cannot answer why a decline
happened. Rescinded offers have no distinct event kind, so an employer
withdrawal cannot be separated from a candidate decline. The standard's
segmentation and decline-reason requirements stand unmet here; they are not
lowered.
