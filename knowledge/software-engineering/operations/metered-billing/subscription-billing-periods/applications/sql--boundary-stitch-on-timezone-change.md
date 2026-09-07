---
layer: application
type: application
subject: subscription-billing-periods
technique: boundary-stitch-on-timezone-change
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# Stitching a billing boundary across a customer timezone change

Reconciled against an open-source usage-based billing engine at commit
`a24f3abe`. The stitch is nine lines of service code, but it is only possible
because of three schema decisions made elsewhere; this document is mostly about
those.

## The schema that makes detection possible

Three columns carry the whole mechanism:

- `customers.timezone` — nullable, per-customer, editable through the public
  API. This is the mutable frame.
- `billing_entities.timezone` — the fallback rung.
- `invoices.timezone` — `string, default("UTC"), not null`
  (`app/models/invoice.rb:745`). **The zone the invoice was computed under,
  frozen onto the invoice.**

Without the third column there is no stitch, because there is no way to tell a
frame change from any other boundary disagreement. The detection is a single
comparison between a stored value and a live one
(`app/services/subscriptions/dates_service.rb:257-261`):

```ruby
def timezone_has_changed?
  return false if last_invoice_subscription.blank?
  last_invoice_subscription.invoice.timezone != customer.applicable_timezone
end
```

The previous period's recorded end comes from the join row, not from a
recomputation (`dates_service.rb:263-267`):

```ruby
def previous_charge_to_datetime
  return if last_invoice_subscription.blank?
  last_invoice_subscription.charges_to_datetime
end
```

`last_invoice_subscription` is ordered by `order_by_charges_to_datetime`, served
by `idx_invoice_subscriptions_on_subscription_with_timestamps
(subscription_id, COALESCE(to_datetime, created_at) DESC)`.

## The stitch, and its bound

`Subscriptions::DatesService#charges_from_datetime`
(`app/services/subscriptions/dates_service.rb:99-115`) carries the incident
comment in full:

> If customer applicable timezone changes during a billing period, there is a
> risk to double count events or to miss some. To prevent it, we have to ensure
> that invoice bounds does not overlap or that there is no hole between a
> `charges_from_datetime` and the `charges_to_datetime` of the previous period.

```ruby
datetime = customer_timezone_shift(compute_charges_from_date)

if timezone_has_changed? && previous_charge_to_datetime
  new_datetime = previous_charge_to_datetime + 1.second

  # NOTE: Ensure that the invoice is really the previous one
  #       26 hours is the maximum time difference between two places in the world
  datetime = new_datetime if ((datetime.in_time_zone - new_datetime.in_time_zone) / 1.hour).abs < 26
end

datetime = subscription.started_at if datetime < subscription.started_at
```

Every element of the technique is here: the gate on a *detected* frame change
rather than on any disagreement; the recorded end as the authority; the
`+ 1.second` unit adjustment confined to this one function; the floor at
`started_at`; and a bound whose comment states its derivation as a fact about
the planet rather than as a tuning choice. The comment is the reason the
constant has stayed 26 — it cannot be argued upward without disputing geography.

## The deviation: the out-of-bound branch does not refuse

The technique requires that a disagreement beyond the bound stops the period
from opening, because at that point the system does not know what the window
is. Here the comparison is written as a positive: `datetime = new_datetime if
|diff| < 26h`. Beyond 26 hours the assignment simply does not happen and the
**recomputed candidate is used**, silently, with no signal.

That is the branch that only executes when something else is already broken —
a corrupted anchor, a mis-joined predecessor, a restored backup — and its output
is an invoice with a window nobody transacted in. The standard keeps the
refusal.

## Closed-closed intervals, and why they survive here

Worth recording because it contradicts the corpus's usual window rule. `to_date`
is materialized as the last instant of the closing day —
`customer_timezone_shift(compute_to_date, end_of_day: true)`
(`dates_service.rb:84`), where `customer_timezone_shift` is documented as
converting *a day expressed in the customer timezone* into an instant
(`dates_service.rb:241-247`) — and event selection is inclusive at both ends:
the relational event store filters `where(timestamp: lower_bound..to_datetime)`
(`app/services/events/stores/postgres_store.rb:33`), which is `>= from AND
<= to`.

It does not double-count, because the boundary's identity is a **date**: the
last instant of one day and the first instant of the next are different dates by
construction, so consecutive periods cannot share an edge. The price is exactly
the `+ 1.second` above — one hand-written unit adjustment, in one function that
owns period construction. That confinement is what makes the closed-closed
materialization sound rather than merely lucky.
