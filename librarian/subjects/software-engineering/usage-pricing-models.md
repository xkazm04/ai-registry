---
subject: usage-pricing-models
domain: software-engineering
last_touched: 2026-09-07
dry_streak: 0
---

# usage-pricing-models

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - inferred-tier-boundary-convention, advance-billing-refuses-retroactive-models, grouping-key-reruns-the-ladder, exact-money-with-one-rounding-boundary.

Quantity into money. The corpus had nothing here: `research-map` returns zero for `monetization`, `proration` and `rounding`. Best transferable rule - round once at the single integral boundary and persist the unrounded value beside it, because three later stages each DIVIDE that number. Worker found the inference fork is two sites not one, and that its direction is predictable: detection was added to protect the legacy format, so the defect lands on the NEWEST format in the least-travelled paths. Also: a grouping key is not a reporting dimension - adding one re-prices every customer on that charge, upward, with no line in the diff that looks like a price change.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
