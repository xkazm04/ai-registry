---
layer: application
type: application
subject: subscription-billing-periods
technique: anchor-re-derived-not-chained
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# Anchor re-derivation in a usage-based billing engine's period queries

Reconciled against an open-source usage-based billing engine at commit
`a24f3abe`. The engine is a server-rendered service whose subscription
recurrence lives in two places: a service object that derives the boundary
dates for one subscription, and a large generated query that selects every
subscription due today across an organization. Both sides derive from the
anchor. Neither chains.

## The anchor is a column, and it is not `started_at`

`subscriptions` carries **two** temporal columns that a naive schema would fuse:

- `subscription_at` — the recurrence anchor.
- `started_at` — when this particular subscription record began.

Every recurrence computation reads `subscription_at`. `Subscriptions::DatesService`
exposes it as `subscription_at` (`app/services/subscriptions/dates_service.rb:240-242`),
converting it into the customer's applicable zone before touching its day
component. `started_at` is used only as a floor: `to_datetime`,
`charges_from_datetime` and `charges_to_datetime` each end with
`datetime = subscription.started_at if datetime < subscription.started_at`
(`dates_service.rb:88, 113, 121`) — a period may never begin before the record
did, whatever the arithmetic says.

The split earns itself on upgrade. `MonthlyService#compute_duration` carries
the comment (`app/services/subscriptions/dates/monthly_service.rb:126-128`):

> `from_date` is not necessarily the beginning of the period: on a subscription
> resulting from an upgrade, it is clamped to `started_at` while the anniversary
> is inherited from the previous subscription. The duration is the one of the
> whole period, so it is measured from the beginning of the period holding
> `from_date`.

and implements exactly that — the denominator is recomputed from the
*anchor-derived* period start, not from the clamped actual start:

```ruby
def compute_duration(from_date:)
  period_start = compute_previous_beginning_of_period(from_date.to_date)
  (compute_to_date(period_start).to_date + 1.day - period_start).to_i
end
```

This is the nominal-versus-actual rule of the technique, landed as code: the
usage window uses the clamped span, anything proportional uses the whole
anchor period.

## Derivation clamps at the render and re-anchors on the next step

`previous_anniversary_day` (`monthly_service.rb:109-131`) computes the current
period's start from `subscription_at.day` every time. Its only concession to
short months is a local clamp:

```ruby
# NOTE: if subscription anniversary day is higher than the current last day of
#       the month, anniversary day is on the current day
day = if subscription.anniversary? && last_day_of_month?(date) && (date.day < subscription_at.day)
  date.day
else
  subscription_at.day
end
```

`subscription_at.day` is re-read on the next call. Nothing writes the clamped
value back. A subscription anchored on the 31st renders as the 28th in February
and returns to the 31st in March, which is precisely the property that chaining
destroys.

## The selection predicate absorbs the same clamp — in SQL

The half most implementations miss. `Subscriptions::OrganizationBillingService#billable_subscriptions`
(`app/services/subscriptions/organization_billing_service.rb`) is a union of
eighteen scoped queries, one per cadence and billing mode. The monthly
anniversary arm widens on the last day of the month:

```sql
DATE_PART('day', (subscriptions.subscription_at AT TIME ZONE ...)) = ANY (
  -- Check if today is the last day of the month
  CASE WHEN DATE_PART('day', ((DATE_TRUNC('month', :today ...) + INTERVAL '1 month - 1 day')::date))
            = DATE_PART('day', :today ...)
  THEN
    -- If so and if it counts less than 31 days, we need to take all days up to 31 into account
    (SELECT ARRAY(SELECT generate_series(DATE_PART('day', :today ...)::integer, 31)))
  ELSE
    (SELECT ARRAY[DATE_PART('day', :today ...)])
  END
)
```

On 28 February the array is `[28,29,30,31]`, so anchors of 29, 30 and 31 are all
selected. The yearly arm carries the leap-day variant of the same idea: when
today is 28 February and 28 is the month's last day, the accepted anchor days
are `ARRAY[28, 29]`. Without these two widenings the preserved anchor would be
correct and never billed — the derivation and the selection are one technique,
and the engine treats them that way.

## What confirmed, and where the standard sits above the tree

**Confirmed.** Anchor as a distinct persisted column; derivation from
`(anchor, today)` with no read of a previous boundary; clamp at the render;
selection widened symmetrically; nominal period as the proportional
denominator.

**Above the tree.** The technique asks that a stored boundary name its own
recomputation. Here the recomputation exists and is invokable — the same
service recomputes any period on demand — but the persisted
`invoice_subscriptions` row records only the resulting datetimes, not the
`(anchor, index, cadence)` triple that produced them. Reproducing a disputed
period means re-running the service with the subscription's *current* plan and
cadence, which is not the same thing as replaying what it was billed under. The
standard keeps the stronger requirement.
