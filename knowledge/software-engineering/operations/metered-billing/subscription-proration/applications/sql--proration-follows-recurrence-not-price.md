---
layer: application
type: application
subject: subscription-proration
technique: proration-follows-recurrence-not-price
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@16
---

# A boolean on the charge, a constraint that belongs to the metric

Read against an open-source usage-based billing engine at commit `a24f3abe`
(2026-09-04), whose schema is `db/structure.sql` and whose charge model is
`app/models/charge.rb`. The engine is the clearest available demonstration of
the technique's central claim: **the flag can live on the charge — the
authority for whether it may be set lives on the metric**, and the two are
different tables.

## The columns, and their apparent orthogonality

`public.charges` (`db/structure.sql:2572-2583`) carries the pricing model and
the proration flag as unrelated columns:

```sql
billable_metric_id  uuid,
charge_model        integer DEFAULT 0 NOT NULL,   -- :2577
pay_in_advance      boolean DEFAULT false NOT NULL,  -- :2580
prorated            boolean DEFAULT false NOT NULL   -- :2583
```

`public.billable_metrics` (`:2336-2342`) carries what is being measured:

```sql
aggregation_type    integer NOT NULL,              -- :2336
recurring           boolean DEFAULT false NOT NULL,   -- :2341
weighted_interval   public.billable_metric_weighted_interval  -- :2342
```

Read as a schema, `prorated` is orthogonal to `charge_model` — any pricing
model may carry any value of the flag. That is the design the technique
argues for and it is correct as far as the tables go: proration is not a
property of the price. The schema is deliberately not where the rule lives,
and the index confirms the flag is treated as a first-class dimension rather
than a footnote (`db/structure.sql:8506`):

```sql
CREATE INDEX index_charges_on_plan_id_and_billable_metric_id_and_prorated
  ON public.charges USING btree (plan_id, billable_metric_id, prorated)
  WHERE (deleted_at IS NULL);
```

## The rule, enforced at definition time

`Charge#validate_prorated` (`app/models/charge.rb:158-172`) is registered with
the other definition-time validations at `:57`, and it is a whitelist:

```ruby
# NOTE: A prorated charge cannot be created in the following cases:
# - for metered charges,
# - for pay_in_arrears, price model cannot be package, graduated and percentage
# - for pay_in_advance, price model cannot be package, graduated, percentage and volume
# - for weighted_sum aggregation as it already apply pro-ration logic
def validate_prorated
  return unless prorated?
  unless billable_metric.weighted_sum_agg?
    return if billable_metric.recurring? && pay_in_advance? && standard?
    return if billable_metric.recurring? && !pay_in_advance? && (standard? || volume? || graduated?)
  end
  errors.add(:prorated, :invalid_billable_metric_or_charge_model)
end
```

Three of the technique's claims are visible in eight lines:

1. **`billable_metric.recurring?` is required.** A metered metric — events
   counted in a window — cannot be prorated at all. The classification is read
   from the metric, across the association, not re-derived from the charge.
2. **A weighted-sum aggregation is excluded**, and the comment says why: *"it
   already apply pro-ration logic"*. This is the already-weighted case the
   technique names — the time dimension is inside the aggregate, and a second
   coefficient would bill a third of a third. The engine reaches this rule
   from the aggregation type, which is the right place for it.
3. **It is a rejection at authoring time**, not a branch at billing time. The
   rate card cannot be saved into the gap.

`FixedCharge#validate_prorated` (`app/models/fixed_charge.rb:89-99`) applies
the same posture to a table with no metric behind it — a fixed charge is a
level by construction, so recurrence is not in question and only the
model/timing combinations are constrained.

## What the constraint does not survive

The whitelist is a model validation. It is not in the schema, so it holds only
for writes that pass through the application: a data import, a support
console, a backfill migration or a second writer can all produce a row the
billing path will then honour. The technique's rule — reject at the point of
definition — is satisfied by the validation; the technique's reason for the
rule (there must be one door) is only partly satisfied.

Both halves are expressible in the schema, and neither needs a trigger. The
recurrence rule is a cross-table check, so it wants the denormalized column
plus a composite foreign key rather than a subquery:

```sql
ALTER TABLE billable_metrics
  ADD CONSTRAINT billable_metrics_id_recurring_key UNIQUE (id, recurring);

ALTER TABLE charges
  ADD COLUMN metric_recurring boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT charges_metric_recurring_fk
    FOREIGN KEY (billable_metric_id, metric_recurring)
    REFERENCES billable_metrics (id, recurring),
  ADD CONSTRAINT charges_prorated_requires_recurring_metric
    CHECK (NOT prorated OR metric_recurring);
```

The composite foreign key is what keeps the copy honest: flipping
`billable_metrics.recurring` on a metric that has prorated charges is refused
by the key rather than silently invalidating them. The model/timing whitelist
is then a plain check on one table:

```sql
ALTER TABLE charges
  ADD CONSTRAINT charges_prorated_supported_model CHECK (
    NOT prorated
    OR (pay_in_advance     AND charge_model = 0)                    -- standard only
    OR (NOT pay_in_advance AND charge_model IN (0, 1, 4))           -- standard, graduated, volume
  );
```

Written this way the enumeration is visible in the schema, which is where
somebody adding a pricing model will be looking — and adding one without
extending the check produces a rejected rate card rather than a full-period
charge on a partial period.

## The coefficient reaches the ladder as two quantities, not one

The technique's third order of operations — place by the full quantity, price
by the prorated quantity — is what the engine's prorated banded path actually
does, and it needs both numbers per event.
`ChargeModels::ProratedGraduatedService#compute_amount`
(`app/services/charge_models/prorated_graduated_service.rb:11-19`) pulls
`event_aggregation` and `event_prorated_aggregation` from the same aggregation
result, and its comment at `:30-33` states the rule:

> *Full units sum determines tier while prorated units sum determines amount
> that is going to be used for price calculation inside the tier.*

The consequence for storage is that a per-event aggregation cannot collapse to
one total. Both series have to survive to the pricing step:

```sql
SELECT e.id,
       e.units                                    AS full_units,
       e.units * (e.held_days::numeric / p.period_days) AS prorated_units
FROM   metric_events e
JOIN   periods p ON p.id = e.period_id
ORDER  BY e.timestamp;   -- order is load-bearing: band placement is cumulative
```

The `ORDER BY` is not cosmetic. Band placement walks the full series
cumulatively, so a set returned in a different order places units in different
bands. Any query feeding this path carries a total order, and a
`LIMIT`-without-`ORDER BY` anywhere upstream is a repricing bug that only
appears under a plan changer.

The flat component follows the other half of the technique:
`result_with_flat_amount` (`prorated_graduated_service.rb:112-123`) accumulates
each band's `flat_amount` **unscaled**, and selects the band by
`max_full_units` — the peak level reached in the period, computed at `:76` —
not by the closing level. That is the arbitrage-proof choice, and it is worth
copying deliberately rather than inheriting by accident.

## What transplants

- Keep the flag orthogonal in the schema and the rule on the metric. The
  columns are right; the authority is one table over.
- Exclude already-weighted aggregations explicitly, by aggregation type, with
  the reason written next to the exclusion.
- Enumerate the supported model and timing combinations as a check constraint,
  so an unsupported rate card is refused rather than charged at full period.
- Denormalize a cross-table predicate behind a composite foreign key when it
  has to be checkable; a subquery in a check constraint is not available and a
  trigger is not auditable in the same glance.
- Carry both the full and the prorated quantity, in a total order, all the way
  to the ladder — and leave flat components unscaled, placed by the period's
  peak.
