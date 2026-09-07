---
layer: application
type: application
subject: usage-aggregation-semantics
technique: replayed-state-machine-count
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# A per-identifier state machine as one lookback expression

Lago, an open-source usage-based billing engine, ships a metric named
`unique_count` that is **not** `COUNT(DISTINCT ...)`. Citations are pinned to
commit `a24f3abe` (2026-09-04), in
`app/services/events/stores/postgres/unique_count_query.rb` and
`app/services/billable_metrics/aggregations/unique_count_service.rb`.

## The operation, and its default

The events CTE (lines 244-256) projects three columns per event: the
timestamp, the identifier (`sanitized_property_name AS property`), and the
operation. The operation comes from `operation_type_sql` in
`postgres_store.rb`:

```sql
COALESCE(events.properties->>'operation_type', 'add')
```

One expression, one place, defaulting to `add`. The service-side twin is
`unique_count_service.rb:149` — `event.properties.fetch("operation_type", "add")`
— and the two agreeing is what keeps the in-advance path and the in-arrears
path from reporting different numbers for the same stream.

## The machine, as a lookback default

`operation_value_sql` (lines 276-287) is the whole state machine:

```sql
CASE
WHEN LAG(operation_type, 1, 'remove')
       OVER (PARTITION BY property ORDER BY timestamp) = operation_type
THEN 0
ELSE CASE WHEN operation_type = 'add' THEN 1 ELSE -1 END
END
```

Read it as the table in the technique. A row whose operation equals the
previous operation *for the same identifier* contributes 0 — that is the
duplicate add and the duplicate remove, both absorbed. Otherwise an `add`
contributes +1 and a `remove` contributes −1. The per-identifier sums are
then summed (`query`, lines 11-35), so an identifier added and removed
inside the period nets to zero and disappears from the count.

**The third argument of the lookback is the boundary convention.** `LAG(...,
1, 'remove')` says: before this window, this identifier was in the state a
`remove` would have left it in — *not held*. That default is what makes a
leading `remove` absorbable: the first ever row for an identifier compares
against `'remove'`, matches, and contributes 0. The engine's own comment on
line 283 says exactly this.

That default is also the trap named in the seeded-recurring-aggregate
technique. It asserts *absence before the window*, which is the correct
convention for a window-closed metric and the **opposite** of what a
recurring metric's seed asserts. The two halves must be reconciled by
whatever supplies the recurring seed, or every carried identifier reads as a
fresh addition, every period.

## Grouping partitions the machine, not just the output

`grouped_operation_value_sql` (lines 289-300) partitions by
`#{group_names}, property` rather than by `property` alone. This is the
per-group seeding rule appearing one layer down: the state machine itself is
per (group, identifier), so the same identifier in two groups runs two
independent machines. A grouped count that partitioned only by `property`
would let a `remove` in one group cancel an `add` in another, and the totals
would still add up.

## The in-advance path replays the same machine incrementally

`unique_count_service.rb:72-120` computes the same aggregate one event at a
time, and it is worth reading beside the batch query because the two must
agree. It asks the store `active_unique_property?(event)` (line 76) — is this
identifier currently held? — and derives `newly_applied_units` as 1 only for
an `add` of something not already held (lines 78-83), which is the batch
query's "duplicate add contributes 0" restated for a single event. A
`remove` decrements only if the identifier was in fact active (line 108).

## Where the whole-day proration diverges

The prorated variant needs one more absorber than the plain count.
`ignore_remove_events_sql` (lines 361-371) discards a `remove` when an
opposite operation for the same identifier follows it later **on the same
calendar day in the customer's timezone** (`existing_event_opposite_operation_type_sql`,
lines 406-419). The reasoning is written out as a worked example in the
comment block at lines 385-405.

The reason the plain count does not need it: the plain count only cares
about the terminal state, and add-remove-add already nets to +1 through the
lookback. The prorated count cares about *intervals*, and a same-day
remove-then-add would otherwise open a second billable day. Same machine,
different consumer, one extra rule — an instance of the technique's own
"compose rather than substitute" decision rule.

## Deviation: ordering is by timestamp alone

As in the weighted-sum path, `events(ordered: true)`
(`postgres_store.rb:11`) orders by `timestamp: :asc` with no secondary key,
and every `OVER (PARTITION BY property ORDER BY timestamp)` inherits that.
An `add` and a `remove` for one identifier emitted in the same transaction
with an identical timestamp resolve in scan order, and the two orderings
produce +1 and 0 respectively. The technique's rule — order by a total
order, always — stands; the engine does not yet satisfy it here.
