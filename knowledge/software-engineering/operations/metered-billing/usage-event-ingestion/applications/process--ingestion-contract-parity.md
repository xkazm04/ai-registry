---
layer: application
type: application
subject: usage-event-ingestion
technique: ingestion-contract-parity
stack: process
status: forged
verified_on: 2026-09-07
---

# A rolled-back differential migration, in Lago

Read against `lago-api` at commit `a24f3abe` and the Go events-processor at
`getlago/lago/events-processor`. Two runtimes implement one admission contract
here: the Ruby path under `app/services/events/`, and the Go/Kafka path under
`processors/events_processor/`.

## The harness: flip the flag inside a transaction, roll it back, diff the money

`app/services/events/stores/clickhouse/enriched_store_migration/comparison_service.rb`
is the differential run, and it does the thing the technique asks for — one
input, both implementations, a field-level diff — with the A/B variable applied
to live organization state and undone (`:55-77`):

```ruby
def compute_usage(enriched:)
  ActiveRecord::Base.transaction do
    if enriched
      organization.enable_feature_flag!(:enriched_events_aggregation)
      organization.update!(clickhouse_deduplication_enabled: deduplicate, pre_filter_events: true)
    else
      organization.disable_feature_flag!(:enriched_events_aggregation)
      organization.update!(clickhouse_deduplication_enabled: deduplicate)
    end
    organization.reload

    usage_result = Invoices::CustomerUsageService.call(
      customer: subscription.customer, subscription: subscription,
      with_cache: false, apply_taxes: false
    )

    raise ActiveRecord::Rollback
  end
  usage_result
end
```

Four properties are worth naming because each is a decision, not an accident.
The flag flip is the **only** variable — the same subscription, the same events,
the same service entry point. `with_cache: false` removes the cache as a
confounder. `raise ActiveRecord::Rollback` leaves no state, and the `ensure`
block at `:46-48` reloads the organization so an aborted run cannot leave a
customer flagged into the wrong lane. And the diff is taken on **fees** — units,
`amount_cents`, `events_count`, `total_aggregated_units` (`:118-123`), keyed by
`[charge_id, charge_filter_id, grouped_by]` — that is, on the money, not on an
intermediate representation that both lanes might get equally wrong.

Each compared fee lands in one of four named states: `match`, `diff`,
`only_in_legacy`, `only_in_enriched` (`:81-109`). The two `only_in_*` states are
the ones a naive value comparison would have missed entirely, and they are the
states a lane divergence usually produces.

## The rollout gate: no customer moves until their own comparison is clean

`subscription_orchestrator_service.rb:7-20` documents a per-subscription state
machine whose transitions are *governed by the diff*:

```
pending       → run initial comparison
comparing     → no diffs: completed (fast path)
                diffs + codes: reprocess events via Kafka, then wait for enrichment
                diffs + no codes: failed (unexpected mismatch)
deduplicating → clean duplicate enriched_expanded rows
                ClickHouse timeout: pause (queries saved for manual run)
validating    → final comparison after reprocessing + dedup
                clean: completed; diffs remain: failed
```

This is the technique's "flip only after a differential run over that customer's
actual configuration", implemented as a gate rather than as a habit: a
subscription reaches `completed` only by passing a comparison, and unexplained
diffs terminate in `failed` rather than in a shrug. `WaitForEnrichmentService`
supplies the missing piece between the two comparisons — it polls until the
asynchronous enrichment has produced rows for every reprocessed event, counting
**distinct transaction ids rather than rows** because one event fans out to one
row per charge (`wait_for_enrichment_service.rb:9-13`), and gives up after ten
attempts with an error message carrying both counts rather than a bare failure.

`lib/tasks/enriched_events_comparison.rake` is the operator-facing entry point:
`rake enriched_events:compare[sub_id_1,sub_id_2,...]`, with `FORMAT=json`
emitting `total_diffs`, `total_subscriptions`, per-subscription detail and a
`speedup` figure — so the run answers "is it correct" and "is it faster" from
one execution.

## The divergences this harness would not catch

The harness compares two **aggregation stores**. It does not compare the two
**admission** implementations, and reading them side by side finds three
divergences of exactly the classes the technique enumerates:

1. **A predicate in two vocabularies.** Ruby filters candidate subscriptions
   with `.where.not(status: :incomplete)` and selects the fallback with the
   `.active` status scope
   (`app/services/events/post_process_service.rb:46, 75`). The Go
   `Subscription` struct carries no status column at all
   (`models/subscriptions.go:13-22`), so `FetchSubscription` filters purely by
   the time window and re-runs it with `time.Now()` for the recurring fallback
   (`enrichment_service.go:57`). For a subscription in an unusual lifecycle
   state the two lanes resolve differently. The Go query additionally calls
   `.Unscoped()` (`models/subscriptions.go:38`).
2. **A retention horizon on a cache.** The Go lane's subscription cache is
   loaded by `GetAllSubscriptions`, which holds live subscriptions plus those
   terminated within one month — and says why
   (`models/subscriptions.go:55-73`): *"We want to get terminated subscriptions
   to permit grace period events backfill."* The Ruby lane queries the database
   with no horizon at all. An event arriving forty days late therefore resolves
   in one lane and not the other. This is a derived limit with its derivation
   written beside it, which is right; it is also an undocumented divergence,
   which is not.
3. **Coercion of a malformed value, documented in a comment and left there.**
   `app/services/events/enrich_service.rb:62-64`:

   ```ruby
   # NOTE: We might not be able to parse the value as a decimal, it will then fall back to 0
   #       The behavior is aligned with the Clickhouse implementation but differs
   #       a bit from the current PG one where we explicitly filter events with invalid values
   ```

   Three implementations, two behaviours, and the author knew. This is the
   technique's fourth divergence class in its natural habitat: a known
   difference recorded where nothing will ever read it again.

## The instrument's own blind spot

`total_diffs` is reported beside `total_subscriptions`, which is the right
instinct — but `total_subscriptions` counts identifiers *passed in*, including
those skipped for a missing subscription or a non-ClickHouse organization
(`enriched_events_comparison.rake:33-43`). A run over five identifiers that all
skip reports `total_diffs: 0` against `total_subscriptions: 5`. The denominator
the technique asks for is the number of comparisons **executed**, and adding it
is a one-line change. There is also no seeded known-positive fixture: nothing in
the pipeline proves the diff can fire before its silence is believed.
