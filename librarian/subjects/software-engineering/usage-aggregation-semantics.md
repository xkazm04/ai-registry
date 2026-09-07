---
subject: usage-aggregation-semantics
domain: software-engineering
last_touched: 2026-09-07
dry_streak: 0
---

# usage-aggregation-semantics

First touch: 2026-09-07, forged in-session by `/intake` over an open-source
usage-based billing engine (see [[2026-09-07-lago]]). One of six subjects in the
new `operations/metered-billing/` subcategory - the corpus modelled the *payer* of
a metered service and the *consumer* of a payment provider, and had nothing for the
party that charges its own customers for usage.

## State

Forged: 4 techniques - level-valued-time-integral, replayed-state-machine-count, high-water-mark-advance-billing, seeded-recurring-aggregate.

The fold: how a stream of events becomes the ONE number on an invoice. Load-bearing claim - beyond two metric kinds the aggregate is NOT a function of the events alone; it is events plus a persisted seed plus, when money is issued early, a persisted high-water mark, and those are inputs rather than caches. Resolved two cross-bundle tensions in prose without linking: against `dual-clock-event-time` (receipt vs event time - discriminator is who owns the fact and whether a correction path exists) and against `incremental-window-accounting` (a ratchet is not a provable cache because a rescan does not repair it, it UNBILLS; it is ledgered, not derived). Worker judged the slug `level-valued-time-integral` better than the source engine's own name for the mechanism.

## Leads

- Unapplied at forge time: the fleet has no seller-side metering seam except the
  allowance-window defect this run shipped an instrument for against one project.
  Return when a fleet project meters its own customers rather than its own spend.
