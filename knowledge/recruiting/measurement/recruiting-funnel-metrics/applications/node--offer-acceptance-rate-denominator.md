---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: offer-acceptance-rate-denominator
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# The offer leg as a pure fold over four event kinds, counted by transition date

`app/_lib/analytics-offer.ts` is the technique in one dependency-free module. The
four offer-lifecycle events (`offer_sent`, `offer_accepted`, `offer_declined`,
`offer_expired`) were already written to `pipeline_events` and had never been
aggregated. Before the module existed the funnel stopped meaning anything after
the interview stage (`:1-8`). Re-read on 2026-09-26 at one pinned commit (Node 24).

## The max-denominator rule, literally

`offerConversion()` (`:50-74`):

```
resolved = accepted + declined + expired
extended = max(counts.extended, resolved)
pending  = max(0, extended - resolved)
n        = extended
```

The type's comment (`:35-36`) gives the reason the technique first gave: `n` is
`max(extended, resolved)` "so a missing `offer_sent` trail (legacy rows) can
never push a rate past 100%". No clamp appears anywhere. `clampCount()`
(`:42-44`) floors each input at a non-negative integer. `MIN_OFFERS = 5` (`:15`);
below it the three rates are `null`, not 0 (`:59`, `:69`), and `minOffers` is
echoed so the panel prints "N of 5 needed".

## What the query feeds it: every kind by its own date

`app/_lib/db/analytics.ts:571-576`:

```
SELECT kind, COUNT(*) AS c FROM pipeline_events
WHERE created_at >= ? AND <not-simulated> AND workspace_id = ? [AND role] GROUP BY kind
```

The fold reads `offer_sent` and the three terminal kinds from that one GROUP BY
(`:603-608`). Each kind is counted by its **own** event timestamp inside the
window. That makes the offer leg a transition-dated period, not an offer
cohort. On that basis the module's two by-products do not mean what their
comments say:

- `resolved > extended` happens with perfect recording whenever more earlier
  offers close in the window than new offers are sent. `offer_sent` is also written
  only when the offer letter is delivered (`app/_lib/comms-dispatch.ts:718`): "a
  dead-lettered or refused letter is neither". The `max` hides boundary straddle and
  a true missing send behind the same number.
- `pending = extended − resolved` is a net flow. Closes of offers sent before the
  window cancel still-open new ones. The panel shows it as "Awaiting response"
  and links it to the board's offer column, which lists the people holding an offer
  *now* (`AnalyticsOfferLegPanel.tsx:67-73`). The link opens a different number of
  people from the one it shows.

The query also has no upper bound (`upperIso` is not applied), unlike the cohort
and hire reads. The prior-window comparison does not read offers, so nothing
consumes that gap today.

**Simulation, 2026-09-26.** Three offer ledgers were run through the tree's own
fold under its own windowing (a 30-day view, every kind by its own date). Rule A is
the technique as first written: resolved above extended means a defect, and pending
is extended minus resolved. Rule B is the flipped technique: the defect is read by
record linkage, and pending is the stock of sent offers with no terminal event.

| Ledger | Window counts | Fold shows | A: defect / pending | B: defect / pending | Truth |
| --- | --- | --- | --- | --- | --- |
| 1. legacy trail: 3 resolutions with no send, 2 linked, 1 open | sent 3, resolved 5 | 80%, pending 0 | yes / 0 | yes (3 unlinked) / 1 | defect; 1 open |
| 2. a burst sent before the window, closed inside it; 2 new offers open; perfect recording | sent 2, resolved 6 | 83%, pending 0 (row hidden) | **yes** / **0** | no / 2 | no defect; 2 open |
| 3. steady flow: 8 sent, 3 earlier offers close in the window, 4 open; perfect recording | sent 8, resolved 7 | 75%, pending 1 | no / **1** | no / 4 | no defect; 4 open |

A calls the defect wrong once (ledger 2) and the outstanding offers wrong three
times out of three. In ledger 2 the pending row is suppressed entirely, because it
renders only when `pending > 0`, while two candidates hold unanswered offers. B is
right in all three. Verdict: **better**. What would falsify it: an offer-cohort
query, where every resolution is linked to a send inside the same window. Rule A is
right there, and the tree does not have that query.

## Wiring the standard already got right

- **Simulation rows are excluded in the query.** `notSim()`
  (`app/_lib/db/analytics.ts:37`) is applied to this query and to every leadership
  read on the surface. The NULL-safe predicate keeps guided-demo rows out and
  keeps entries without a job title in.
- **The company passing and the candidate declining stay separate.**
  `PipelineAnalytics` keeps `rejected` and `declined` as two terminal closes
  (`:65-70`, `:434-435`).
- **The measured rate is the forecast's offer leg.** The accept rate is exported
  as a 0..1 fraction purely so `analytics-forecast.ts` can substitute it for the
  implied offer→hire leg, with the byte-identical fallback when it is null.
- **Both sides of the opposite-sign rule sit on one screen.**
  `pctOfManualBaseline` is deliberately uncapped, because its denominator is an
  assumed constant (`MANUAL_HOURS_PER_HIRE = 42`, `app/_lib/automation-roi.ts:46`,
  uncapped at `:112-118`). So the page bounds the rate whose denominator is
  observed and leaves the one over an assumed constant uncapped.

## Where it still falls short

The whole view can now be scoped to one role (`eventJobPred`, `:339`, applied to
this query at `:573`). Otherwise the rate is not segmented: role family, level and
market mix still move it with no way to see why. There is no event kind for a
rescinded offer, so an employer withdrawal is indistinguishable from the
candidate declining. A legacy offer with no deadline never lapses
(`app/_lib/offers-store.ts:110`), so it stays open indefinitely. The panel's label ("{accepted} of {extended} offers extended") names
no basis. The window appears only in the page header.
