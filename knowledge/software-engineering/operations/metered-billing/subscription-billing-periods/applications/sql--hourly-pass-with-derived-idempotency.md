---
layer: application
type: application
subject: subscription-billing-periods
technique: hourly-pass-with-derived-idempotency
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# An hourly billing pass with five layers of derived idempotency

Reconciled against an open-source usage-based billing engine at commit
`a24f3abe`. The scheduler entry, the selection query, the job lock key, the
partial unique indexes and the violation handler are five separate files that
only make sense read together.

## Hourly, because there is no global midnight

`clock.rb:19` states the reason on the line above the schedule table:

> All clocks run every hour to take customer timezones into account

and the billing sweep is registered at `clock.rb:79-83` as
`every(1.hour, "schedule:bill_customers", at: "*:10")`. The `*:10` matters: the
neighbouring hourly sweeps are staggered at `*:15`, `*:35`, `*:45`, so the
billing pass does not contend with them for the worker pool on the hour.

## The selection is a state query with no cursor

`Subscriptions::OrganizationBillingService#billable_subscriptions`
(`app/services/subscriptions/organization_billing_service.rb`) asks *which
subscriptions are due today in their own customer's zone, and not yet billed
today*. Nothing anywhere persists a last-run marker.

The zone chain is a single SQL fragment, `Utils::Timezone.at_time_zone_sql`
(`app/services/utils/timezone.rb`), interpolated into every date comparison in
the query:

```sql
::timestamptz AT TIME ZONE COALESCE(customers.timezone, billing_entities.timezone, 'UTC')
```

Three rungs, total, one implementation — the resolution chain of the sibling
technique, realized as a `COALESCE` so that no arm of the eighteen-way union can
resolve the zone differently.

The anti-join is the first idempotency layer:

```sql
already_billed_today AS (
  SELECT invoice_subscriptions.subscription_id, COUNT(...) AS invoiced_count
  FROM invoice_subscriptions ...
  WHERE invoice_subscriptions.recurring = 't'
    AND invoice_subscriptions.timestamp IS NOT NULL
    AND DATE((invoice_subscriptions.timestamp) AT TIME ZONE COALESCE(cus.timezone, billing_entities.timezone, 'UTC'))
      = DATE(:today AT TIME ZONE COALESCE(cus.timezone, billing_entities.timezone, 'UTC'))
  GROUP BY invoice_subscriptions.subscription_id
)
...
AND already_billed_today.invoiced_count IS NULL
```

Note that "today" is evaluated in the customer's zone on **both sides** of the
comparison. A pass at 02:00 universal time and one at 14:00 are asking about the
same local day for a given customer, which is what makes the layer meaningful
rather than decorative.

## The lock key is re-derived from the boundary date

The clearest confirmation in the tree, with the failure written out in the
comment above it (`app/jobs/bill_subscription_job.rb:59-81`):

> Each hour, we check for each customer whether they need to be billed today. If
> it is the case and there's not invoice for today in the DB, we will schedule
> the `BillSubscriptionJob` with timestamp of the current time. So it could
> occur that we schedule a second job while the first one (from one hour ago)
> hasn't been processed yet due to a high number of jobs. **As the timestamp
> won't be the same, the lock key would be different and both jobs could be
> processed concurrently**, causing unnecessary jobs. Note that even if the job
> is schduled twice, we'll still prevent duplicate invoices.
>
> To avoid this, we normalize the timestamp in the customer's timezone and use
> the date as the lock key argument.

```ruby
unique :until_executed, on_conflict: :log, lock_ttl: 12.hours

def lock_key_arguments
  arguments = self.arguments.dup
  return arguments if arguments[0].empty?
  timestamp = arguments[1]
  subscriptions = arguments[0]
  customer = subscriptions.first.customer
  date = Time.zone.at(timestamp).in_time_zone(customer.applicable_timezone).to_date
  arguments[1] = date
  arguments
end
```

This is the technique's central claim as a diff: the key handed in was the tick
time and deduplicated nothing; the key that works is `(subscriptions, boundary
date in the customer's zone)` — re-derived, identical across passes, computed
from domain state. `on_conflict: :log` keeps a lock collision an event, not an
exception.

## The store's uniqueness boundary is the authority

`invoice_subscriptions` (`app/models/invoice_subscription.rb:159-162`) carries
partial unique indexes on the period itself:

```
index_uniq_invoice_subscriptions_on_charges_from_to_datetime
  (subscription_id, charges_from_datetime, charges_to_datetime) UNIQUE
  WHERE created_at >= '2023-06-09' AND recurring IS TRUE AND regenerated_invoice_id IS NULL

index_uniq_invoice_subscriptions_on_fixed_charges_boundaries
  (subscription_id, fixed_charges_from_datetime, fixed_charges_to_datetime) UNIQUE
  WHERE fixed_charges_from_datetime IS NOT NULL AND recurring IS TRUE AND regenerated_invoice_id IS NULL
```

Two details are worth stealing. The `created_at >= <date>` predicate scopes the
constraint from a cutover so that pre-existing rows are not retroactively
invalid — the standard way to add a uniqueness boundary to a live table. The
`regenerated_invoice_id IS NULL` predicate excludes deliberate regenerations,
so the constraint stays a *duplicate* guard rather than a re-issue ban.

One coupling to name: the key is the boundary **datetimes**, not the boundary
dates. That is only safe because the stitch of the sibling technique pins
`charges_from_datetime` to the previous period's recorded end — without it, a
timezone change would shift the instants and rename an existing period, and the
uniqueness boundary would not recognize it.

## Losing the race is a success — scoped to the clock

`Invoices::SubscriptionService` (`app/services/invoices/subscription_service.rb:118-127`):

```ruby
rescue ActiveRecord::RecordNotUnique
  return result if invoicing_reason.to_sym == :subscription_periodic
  raise
rescue BaseService::ServiceFailure => e
  raise unless e.code.to_s == "duplicated_invoices"
  raise unless invoicing_reason.to_sym == :subscription_periodic
  result
```

Both the storage-level violation and the application-level duplicate check
collapse into a plain successful result — **only** when the run was invoked by
the recurring pass. A user-initiated or API-initiated invoice request that hits
the same collision still raises, because there the duplicate means the request
was wrong. That branch on `invoicing_reason` is the refinement the standard
adopted: the already-done spelling belongs to the caller class that has no
intent, not to the code path.

## What confirmed, and where the standard sits above the tree

**Confirmed.** Hourly cadence justified by zone spread; cursor-free state query
with the zone chain inlined; the lock key normalized to a boundary date; a
partial unique index as the real dedup point; the collision scoped to a success
for clock-originated runs.

**Above the tree.** The technique asks that the collision be *counted* as a
named outcome. Here it is returned as an ordinary success — indistinguishable
in metrics from a period that was genuinely opened — so the race rate is not
observable, and a scheduler accidentally deployed twice would show up only as
lock-conflict log lines. The standard keeps the typed outcome and the counter.
