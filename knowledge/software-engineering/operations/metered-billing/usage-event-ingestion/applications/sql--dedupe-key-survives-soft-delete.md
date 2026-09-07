---
layer: application
type: application
subject: usage-event-ingestion
technique: dedupe-key-survives-soft-delete
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# The unique index that ignores the soft-delete marker, in Lago

Read against `lago-api` at commit `a24f3abe` (PostgreSQL 15, per
`.github/workflows/spec.yml:15`, `getlago/postgres-partman:15.0-alpine`), with
the ClickHouse lane from the same tree and its Go events-processor at
`getlago/lago/events-processor`.

## The index, and the four indexes beside it that prove it is deliberate

`db/structure.sql:11544`:

```sql
CREATE UNIQUE INDEX index_unique_transaction_id ON public.events
  USING btree (organization_id, external_subscription_id, transaction_id);
```

Tenant, subject, transmission identifier — the tuple the technique names, in
that order. What makes it evidence rather than an accident is the company it
keeps. Every other index on `public.events` carries the soft-delete predicate:

```sql
-- :9241  index_events_on_created_at                          ... WHERE (deleted_at IS NULL)
-- :9255  index_events_on_organization_id_and_created_at      ... WHERE (deleted_at IS NULL)
-- :9262  index_events_on_organization_id_and_timestamp       ... WHERE (deleted_at IS NULL)
-- :9269  index_events_on_organization_id_and_transaction_id  ... WHERE (deleted_at IS NULL)
```

So the *lookup* index on `(organization_id, transaction_id)` skips discarded
rows — nobody wants to read them — and the *uniqueness* index on the fuller
tuple does not. That is exactly the split the technique asks for, and the
codebase applies the opposite rule one table over, where
`idx_pay_in_advance_duplication_guard_charge` on `fees`
(`db/structure.sql:7767`) *does* carry `WHERE deleted_at IS NULL` — a
duplication guard that a soft delete releases, because a voided fee genuinely
should be re-creatable. Two guards, two answers, and the difference tracks
whether the identifier belongs to an outside party.

## The pre-check disagrees with the constraint, and the constraint wins

`Event` is a discard model: `app/models/event.rb:6` sets
`self.discard_column = :deleted_at` and `:17` installs
`default_scope -> { kept }`. Every ordinary query therefore hides discarded
rows.

`app/services/events/validate_creation_service.rb:43-52` is a friendlier
duplicate check written through that scope:

```ruby
def valid_transaction_id?
  return false if event_params[:transaction_id].blank?

  !Event.where(
    organization_id: organization.id,
    transaction_id: event_params[:transaction_id],
    external_subscription_id: subscriptions.first.external_id
  ).exists?
end
```

`Event.where` inherits `default_scope { kept }`, so for a soft-deleted event
this returns "the key is free" while the index says otherwise. The exposure is
bounded here — this service is only reached from
`app/services/fees/estimate_pay_in_advance_service.rb:16`, an estimation path
that never inserts — but it is the precise shape the technique warns about, and
it is one call site away from being a lying error message on a write path.

The real enforcement is the constraint, translated at
`app/services/events/create_service.rb:39-40`:

```ruby
rescue ActiveRecord::RecordNotUnique
  result.single_validation_failure!(field: :transaction_id, error_code: "value_already_exist")
```

A validation failure, not a server error: terminal for the emitter, as the
technique requires.

## The batch path detects a batch that duplicates itself

`app/services/events/create_batch_service.rb:75-97` is the intra-batch check,
and it gets it right by construction rather than by a pre-scan:

```ruby
saved_attributes = Event.insert_all(records, unique_by: :index_unique_transaction_id,
                                    returning: [:transaction_id, :id, :created_at, :updated_at]).rows
attributes_per_transaction_id = saved_attributes.index_by { |attrs| attrs[0] }

result.events.each_with_index do |event, index|
  # We delete to ensure that any duplicate transaction_id in the input events_params
  # are caught and reported as errors.
  attrs = attributes_per_transaction_id.delete(event.transaction_id)
  ...
  else
    result.errors[index] = {transaction_id: ["value_already_exist"]}
  end
end
```

`insert_all` with `unique_by` silently skips conflicting rows, so the returned
set is smaller than the submitted set in exactly two cases — the key already
existed, and the batch contained the key twice. Deleting each admitted key from
the map as it is consumed catches both with one comparison, and reports them
**per item, at the request's own index**. The batch then rolls back entirely
(`:96`, `raise ActiveRecord::Rollback if result.errors.any?`), so this is the
all-or-nothing form of the technique's batch rule — acceptable because the
per-item report survives the rollback. `MAX_LENGTH` is 100 by default
(`:5`, overridable by `LAGO_EVENTS_BATCH_MAX_LENGTH`).

## The columnar lane inverts the winner rule

`create_service.rb:29` — `event.save! unless organization.clickhouse_events_store?`
— means an organization on the columnar store never touches the unique index at
all. The event is produced to the streaming lane (`:33`) and nothing refuses a
repeat on write.

De-duplication happens instead at **read** time. `ClickhouseEnrichedStore`
declares the key at `app/services/events/stores/clickhouse_enriched_store.rb:9`:

```ruby
DEDUP_KEY_COLUMNS = %w[charge_id charge_filter_id external_subscription_id
                       organization_id timestamp transaction_id].freeze
```

and the comment at `:91-96` states the reason and the mechanism plainly —
"ClickHouse cannot guarantee that `events_enriched_expanded` will be
deduplicated all the time, so we deduplicate at query time using a two-pass
strategy", grouping by the key for `max(enriched_at)` and re-joining with
`INNER ANY JOIN`. The raw-event replay path uses the terser form
(`app/services/events/stores/clickhouse/re_enrich_subscription_events_service.rb:58`):

```ruby
deduplicated_sql = base_scope.to_sql + " ORDER BY ingested_at DESC LIMIT 1 BY transaction_id, timestamp"
```

**Latest ingestion wins.** The transactional lane keeps the first submission and
tells the emitter about the second; the columnar lane keeps the last and tells
nobody. Same public endpoint, same documented contract, opposite semantics — and
the difference is customer-visible twice over, in whether a repeat is an error
and in whether re-sending a correction under the same identifier works. This is
the technique's first-versus-last-write-wins divergence, present in one product,
selected by an organization-level store setting.

## What the tree does not do

- **No bounded uniqueness window.** `index_unique_transaction_id` covers the
  whole of `public.events` for all time, and `events` is not partitioned — the
  only concession to its growth is an aggressive autovacuum setting on the table
  (`db/structure.sql:3242`, `autovacuum_vacuum_scale_factor='0.005'`);
  partitioning is applied to the derived `enriched_events` instead
  (`db/structure.sql:6113`). The technique's derived-retention rule is therefore
  unexercised here rather than contradicted — a defensible position for a system
  that keeps raw events anyway, and one that should be stated in the API
  reference rather than left to be inferred from an index definition.
- **The two lanes' duplicate semantics are not documented as a divergence.**
  They are a consequence of a store setting, discoverable only by reading both
  implementations.
