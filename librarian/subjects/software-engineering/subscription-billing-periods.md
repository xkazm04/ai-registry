---
subject: subscription-billing-periods
domain: software-engineering
last_touched: 2026-09-07
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
