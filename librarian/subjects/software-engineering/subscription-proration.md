---
subject: subscription-proration
domain: software-engineering
last_touched: 2026-09-07
dry_streak: 0
---

# subscription-proration

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - whole-period-denominator, proration-follows-recurrence-not-price, upgrade-immediate-downgrade-deferred, prorated-path-inherits-every-convention.

What a customer owes for the days either side of a change. Proposed INDEPENDENTLY by two of the six design-read workers who never saw each other - the strongest within-source triage signal this method produces - over ground where the corpus returned literally nothing. Central invariant: the denominator is the WHOLE period, never the span being billed, or a customer who joined on the 20th pays a full month for eleven days. `prorated-path-inherits-every-convention` is the general form of a real defect in the source: a prorated variant is a SECOND implementation of a pricing path, and every convention the primary path acquires must be re-acquired by the variant.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
