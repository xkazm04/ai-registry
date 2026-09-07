---
layer: application
type: application
subject: usage-aggregation-semantics
technique: high-water-mark-advance-billing
stack: process
status: forged
verified_on: 2026-09-07
---

# The per-event ratchet, and the one clause that makes a retry safe

Lago, an open-source usage-based billing engine, bills pay-in-advance
charges from a per-event ratchet stored in a `CachedAggregation` row.
Citations are pinned to commit `a24f3abe` (2026-09-04). This document is
`process` rather than a query language because the interesting content is
the **per-event workflow** and its retry behaviour; the queries it uses are
two lines long.

## The workflow, per event

For a pay-in-advance charge, each admitted event runs this sequence
(`app/services/billable_metrics/aggregations/sum_service.rb:140-174` for a
summed metric, `unique_count_service.rb:72-120` for a counted one — the same
shape twice):

1. **Load the previous ratchet row** via `find_cached_aggregation`
   (`base_service.rb:230-244`), scoped to organization, external
   subscription, charge, period boundaries, group, and charge filter.
2. **If none exists**, this is the period's first event: current and mark are
   both the event's own contribution, and the whole contribution is billed.
3. **Otherwise** compute `current_aggregation` incrementally from the loaded
   row — `old_aggregation + value` for a sum, `old_aggregation ± 1` for a
   count.
4. **Compare against `old_max`.** If `current > old_max`, bill
   `current − old_max` and advance the mark. Otherwise bill zero and carry
   the mark unchanged.
5. **Persist** current, max and `units_applied` onto the result, which the
   caller writes as the new cached-aggregation row before the fee is created.

The current-usage projection uses the same ratchet from the other end
(`base_service.rb:194-215`):

```ruby
aggregation = total_aggregation -
  BigDecimal(cached_aggregation.current_aggregation) +
  BigDecimal(cached_aggregation.max_aggregation)
...
target_result.aggregation = 0 if target_result.aggregation.negative?
```

Total now, minus what the ratchet has counted, plus the peak already billed
— clamped at zero, because a customer who scaled down must never see a
negative unit count.

## The clause

`base_service.rb:240`:

```ruby
query = query.where.not(event_transaction_id: event.transaction_id) if event.present?
```

This is the self-exclusion rule, and step 3 above is what makes it
load-bearing rather than defensive. The ratchet is **chained**: each event's
row is computed from the previous event's row. So a retried job — a
redelivered event, a re-run worker — that loaded its *own* previous attempt
would take that attempt's `current_aggregation` as `old_aggregation` and add
the same value again. The mark would advance again, the difference would be
billed again, and every layer above would see a monotonic mark and an
invoice that adds up.

The exclusion works only because the event's `transaction_id` is minted by
the emitter and survives the retry unchanged. An identifier assigned at
processing time would be new on the second attempt and would exclude
nothing.

Note also the ordering in the same query: `order(timestamp: :desc,
created_at: :desc)` then `.first`. The chain's "previous row" is resolved by
a two-key ordering, so two rows at one timestamp do not resolve arbitrarily
— the tie-break the batch aggregation paths are still missing is present
here, where the chain would break without it.

## Proration keeps two marks, and only one of them decides

The sharpest lesson in this path, at
`app/services/billable_metrics/prorated_aggregations/base_service.rb:33-56`.
When a pay-in-advance charge is also prorated, the row carries **two** marks:
`max_aggregation` in raw units and `max_aggregation_with_proration` in
time-weighted units. The advance decision is made on the raw pair:

```ruby
if BigDecimal(aggregation_without_proration.max_aggregation) >
   BigDecimal(cached_aggregation.max_aggregation)
  BigDecimal(cached_aggregation.max_aggregation_with_proration) + prorated_value
else
  BigDecimal(cached_aggregation.max_aggregation_with_proration)
end
```

Comparing the *prorated* values instead would be wrong in a way that is easy
to ship: a prorated value shrinks as the period runs down, so late in a
period an increase of the same size produces a smaller prorated number than
an earlier one did, the comparison fails, and the ratchet silently stops
advancing. **Keep the ratchet's comparison in the space where the quantity is
monotonic, and carry the time-weighted peak alongside as an accumulator.**

## Deviation: the absent-seed default is silent

`weighted_sum_service.rb:97-109` resolves the recurring seed from three
sources in order — the cached row's `current_aggregation`, then a re-sum of
the previous subscription's events, then `BigDecimal(0)`. The third is
reached whenever there is no cached row *and* no `previous_subscription_id`,
which is correct for a genuinely new subscription and silent when a cached
row was pruned or a period closed without persisting.

The seeded-recurring-aggregate technique requires an unasserted zero to be a
failure rather than a value. The engine does not distinguish the two cases,
and the resulting under-bill leaves no anomaly to detect — it looks like a
quiet month. The standard stays; recording which source answered, and
refusing to close a period that reached source three without an emptiness
assertion, is the gap.

## The test that finds the duplicate charge

Process the same event twice and assert the second attempt bills zero and
leaves both marks unchanged. A suite that only ever feeds distinct events
cannot observe the defect this clause prevents, and distinct events are what
every fixture generator produces by default.
