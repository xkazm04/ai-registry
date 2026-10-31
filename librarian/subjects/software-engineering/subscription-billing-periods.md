---
subject: subscription-billing-periods
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# subscription-billing-periods

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - timezone-anchored-period-dates, anchor-re-derived-not-chained, boundary-stitch-on-timezone-change, hourly-pass-with-derived-idempotency.

A billing period boundary is a DATE in somebody's timezone, not an instant, and whose timezone is a per-customer mutable attribute. Everything follows: no global midnight, so the biller runs hourly and every pass re-derives its own idempotency key; the anchor is re-derived from the original start rather than chained, or a subscription anchored on the 31st migrates permanently to the 28th after its first February. Carries a stated boundary case for `half-open-interval-policy` (a TECHNIQUE of analytics-time-windows, not a law - the director's brief said law and the worker corrected it): half-open is right when the boundary's identity is an instant; a date identity converted once at the storage edge also tiles, and pays for it with one `+ 1.second` that must live in exactly one function.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.

## 2026-10-31 - fleet apply that changed code: timezone-anchored-period-dates (node)

Run apply-tzperiod-1031, dispatched for "single stack (sql)". This is the subject's first non-sql application. The 09-07 kp task row has since landed: the allowance is keyed on the anchor (`allowancePeriod`), so the old seam is closed. The new seam is the label. kp computes every boundary in UTC and keeps the anchor's time of day, and its meter row and spend panel label the reset in UTC. The plan card labelled the same boundary with no zone, so it used the viewer's zone. The seam was chosen to falsify the ambient-zone rule: a caught result would have been a midnight-only, west-of-UTC edge, which would cut the rule down to a calendar-fallback note. It was not caught. The anchored reset keeps its time of day, so viewers east of UTC split days too. Code A/B over 6 boundary shapes x 5 viewer zones: card day != meter-row day 9/30 -> 0/30. Floor held: meter-row day 30/30, unit suite 13,922 green, tsc clean, pre-push build green. kp 97c25de52 + f3e3f243b pushed. Application `node--timezone-anchored-period-dates--kp.md`. What the tree shows: a formatter whose options may omit the zone is a second zone resolver, so the technique's "one implementation" property covers the label path as well as event selection.

Banked, not written (GAIN 1 boundary, below +2): "Label from the boundary" should name the formatter's zone as part of the boundary. Return: when a second fleet tree shows a label drawn in an ambient zone over a boundary computed in a declared one.
