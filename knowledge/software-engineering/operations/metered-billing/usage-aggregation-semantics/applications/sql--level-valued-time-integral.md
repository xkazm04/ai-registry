---
layer: application
type: application
subject: usage-aggregation-semantics
technique: level-valued-time-integral
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# The integral as two synthetic rows and one window pass

Lago, an open-source usage-based billing engine, computes its `weighted_sum`
metric exactly this way. Citations are pinned to commit `a24f3abe`
(2026-09-04) and to the relational store's query builder,
`app/services/events/stores/postgres/weighted_sum_query.rb`; a ClickHouse
sibling at `app/services/events/stores/clickhouse/weighted_sum_query.rb`
implements the same shape with `leadInFrame`.

## Closing both boundaries with data, not branches

`events_cte_sql` (lines 68-82) is the whole technique in one expression: a
three-way `UNION ALL` into the CTE `events_data`.

```sql
WITH events_data AS (
  (SELECT * FROM (VALUES (timestamp without time zone :from_datetime,
                          :initial_value,
                          timestamp without time zone :from_datetime))
     AS t(timestamp, difference, created_at))
  UNION ALL
  (<the period's real events, ordered, property cast to numeric AS difference>)
  UNION ALL
  (SELECT * FROM (VALUES (timestamp without time zone :to_datetime, 0,
                          timestamp without time zone :to_datetime))
     AS t(timestamp, difference, created_at))
)
```

The opening sentinel (`initial_value_sql`, lines 84-91) carries the seed as
its `difference`; the closing sentinel (`end_of_period_value_sql`, lines
93-100) carries zero. Every real row now has a predecessor and a successor,
so the window pass that follows has no first-row or last-row case at all.
The empty period reduces to two rows whose integral is the seed held for the
full period — the case a branchy implementation returns zero for.

**The closing sentinel is neutral by construction, twice over**, and this is
the detail worth transplanting. It contributes nothing to the cumulative sum
(its delta is 0), and it contributes no time either, because `period_ratio_sql`
(lines 102-119) defaults its `LEAD` to `:to_datetime` — so the closing row's
own holding duration is `to_datetime - to_datetime = 0`. It exists solely to
terminate the last real event's interval.

## The weighted pass

```sql
CASE WHEN EXTRACT(EPOCH FROM LEAD(timestamp, 1, :to_datetime)
                             OVER (ORDER BY timestamp) - timestamp) = 0
THEN 0
ELSE (SUM(difference) OVER (ORDER BY timestamp ASC
                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW))
     * EXTRACT(EPOCH FROM LEAD(timestamp, 1, :to_datetime)
                          OVER (ORDER BY timestamp) - timestamp)
     / <charges_duration in days, as seconds>
END
```

Running level × holding seconds ÷ period seconds, summed. The explicit
zero-duration guard covers coincident timestamps, where the multiplication
would otherwise be a division against a degenerate interval.

`grouped_query` (lines 26-44) is the same expression with `PARTITION BY` on
the group columns, and `grouped_initial_value_sql` (lines 141-157) emits
**one opening sentinel per group** from the `initial_values` array — the
per-group seed rule, materialized as one `VALUES` row per group.

## Two outputs, and only one of them is the bill

`WeightedSumService#compute_aggregation`
(`app/services/billable_metrics/aggregations/weighted_sum_service.rb`, lines
13-39) reads two numbers off one query:

- `result.aggregation` = `SUM(period_ratio)` — the integral. This is billed.
- `result.variation` = `SUM(difference)` — the plain sum of deltas. This is
  **not** billed; combined with the seed it is the level at period end
  (`total_aggregated_units = latest_value + result.variation`, line 33), and
  that is what seeds the next period.

Two different numbers from one fold, and swapping them is silent. The
integral answers "what did they hold on average"; the variation plus the
seed answers "what do they hold now". An implementation that carries the
integral forward as the next period's seed decays the customer's level
toward zero one period at a time.

## Where the granularity is a different policy

The prorated `unique_count` path in the same engine integrates the same
shape at a **different granularity** — whole calendar days in the customer's
own timezone rather than seconds. See
`app/services/events/stores/postgres/unique_count_query.rb` `period_ratio_sql`
(lines 302-329): the interval is `DATE(...AT TIME ZONE :timezone)` differenced,
divided by `charges_duration` in days.

Day granularity forces a compensation that second granularity does not need:
`ignore_remove_events_sql` (lines 361-371) discards a `remove` when an
opposite operation follows it **on the same calendar day**, because
otherwise an add-remove-add within one day would bill two separate days. The
worked case is written out in the comment at lines 385-405. The transferable
rule: the integration granularity and the calendar that defines it are
billing policy, and a granularity coarser than the event spacing obliges you
to collapse intra-granule churn explicitly.

## Deviation: the tie-break column is carried but not used

`created_at_ordering_column` (`postgres_store.rb:609`, returning
`events.created_at`) is selected into the CTE at
`weighted_sum_query.rb:75` and `:132`, and both sentinels supply a value for
it — but no window in the file orders by it. Every `OVER` clause is
`ORDER BY timestamp` alone, and `events(ordered: true)` in
`postgres_store.rb:11` orders by `timestamp: :asc` only.

Two events at an identical timestamp therefore resolve in scan order, and
the cumulative sum can differ between runs. The standard in the technique
stands: order by a total order. The column needed to satisfy it is already
in the projection, which makes this a one-clause gap rather than a redesign
— and it is a useful shape to recognize, because a materialized-but-unused
ordering column reads as a tie-break at a glance and is not one.
