---
layer: application
type: application
subject: usage-event-ingestion
technique: late-event-subscription-resolution
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# The recurring-metric fallback, in Lago

Read against `lago-api` at commit `a24f3abe` (PostgreSQL 15) and the Go
events-processor at `getlago/lago/events-processor`, which implements the same
rule a second time.

## The window predicate

`app/services/events/post_process_service.rb:41-56` is the resolution query, and
it is the technique's window match written literally:

```ruby
subscriptions = organization.subscriptions
  .where(external_id: event.external_subscription_id)
  .where.not(status: :incomplete)

@subscriptions = subscriptions
  .where("date_trunc('millisecond', started_at::timestamp) <= ?::timestamp", event.timestamp)
  .where(
    "terminated_at IS NULL OR date_trunc('millisecond', terminated_at::timestamp) >= ?",
    event.timestamp
  )
  .order("terminated_at DESC NULLS FIRST, started_at DESC")
```

Note the ordering: **still-open subscriptions first** (`NULLS FIRST` on
`terminated_at DESC`), then most recently started. That is the overlap tie-break
the technique asks for, stated in the query rather than left to the planner. The
millisecond truncation on both sides is the seam between a timestamp column and
an event clock that arrives as a float of seconds
(`app/services/events/create_service.rb:23`).

## The fallback, and the comment that names it

`post_process_service.rb:66-77`:

```ruby
# Fallback for recurring events: when a backdated event matches no subscription, attach it to
# the currently active one.
def fallback_subscription
  return @fallback_subscription if defined?(@fallback_subscription)
  return @fallback_subscription = nil unless subscriptions.empty?
  return @fallback_subscription = nil unless billable_metric&.recurring

  @fallback_subscription = organization.subscriptions
    .where(external_id: event.external_subscription_id)
    .active
    .order(started_at: :desc)
    .first
end
```

Three guards, in the technique's order. It fires only when the window matched
nothing (`subscriptions.empty?`), only for a metric flagged `recurring` — the
level metrics: seats held, storage provisioned — and only when there is a live
subscription to attach forward to, returning `nil` otherwise rather than
inventing a target. A non-recurring metric with a window miss gets no
subscription, and `create_enriched_events` (`:94-99`) returns early, so the
event is stored and never billed.

The Go lane states the same rule in five lines
(`processors/events_processor/enrichment_service.go:54-58`):

```go
// For recurring billable metrics, if no subscription is active at the event
// timestamp, fall back on the currently active subscription rather than failing.
if subResult.Failure() && !subResult.IsCapturable() && bm != nil && bm.Recurring {
    subResult = s.fetchSubscription(event, time.Now())
}
```

Same rule, different mechanism: re-run the *window* query with `now` instead of
re-querying by lifecycle status.

## Resolution is written down, and there is a re-resolution operation

The resolved subscription is not recomputed at invoice time. `Events::EnrichService`
(`app/services/events/enrich_service.rb:53-57`) stamps it onto a derived row:

```ruby
enriched_event.external_subscription_id = subscription.external_id
enriched_event.subscription_id          = subscription.id
enriched_event.plan_id                  = subscription.plan_id
enriched_event.enriched_at              = Time.current
```

keyed uniquely by `(organization_id, external_subscription_id, transaction_id,
timestamp, charge_id)` (`db/structure.sql:7291`) — one admitted event fans out
to one enriched row per matching charge, and the ingest key is extended by the
fan-out dimension rather than replaced.

`app/services/events/re_enrich_all_service.rb` is the explicit re-resolution the
technique demands: scoped to one subscription and a billing-period boundary, it
drops that subscription's enriched rows and rebuilds them in batches inside a
transaction. It is invoked, not implicit; no read path re-derives the link.

## Resolution as of the event's clock, including for deleted entities

`app/models/event.rb:33-41` resolves the owning customer against the event's own
timestamp rather than the wall clock:

```ruby
organization.customers.with_discarded
  .where(external_id: external_customer_id)
  .where("deleted_at IS NULL OR deleted_at > ?", timestamp)
  .order("deleted_at DESC NULLS LAST")
  .first
```

A customer discarded *after* the usage occurred still owns that usage. This is
the generalization the technique states — every lifecycle filter is applied
against the event's clock — and it is what keeps a churned customer's final
period billable when their emitter's backlog drains a day late.

## Where the tree falls short of the standard

Three gaps, recorded as deviations; the standard stands.

- **The fallback is not recorded as a fallback.** `EnrichService` writes the
  same `subscription_id` whether the window matched or `fallback_subscription`
  guessed. Nothing downstream — invoice explanation, support tooling, a
  per-organization fallback-rate metric — can separate the two, so a rise in
  backdated level events is invisible until an invoice is questioned. The
  technique's typed resolution outcome would be one column.
- **Overlap is a raised exception, not a tie-break.**
  `post_process_service.rb:58-63`:

  ```ruby
  subs = subscriptions.select(&:active?)
  raise "Multiple active subscriptions found" if subs.length > 1
  ```

  The window query already carries a deterministic ordering three lines above;
  the active-subscription selector discards it and refuses. Two concurrently
  active subscriptions for one external id turn into a failed post-process job
  for that subject — an ingest outage produced by a data condition the schema
  permits.
- **No occurrence timestamp means arrival time, silently.**
  `create_service.rb:23` substitutes `Time.current.to_f` when the emitter omits
  `timestamp`, with nothing on the row recording that the billing clock was the
  server's. Defensible as a default; undetectable afterwards.
