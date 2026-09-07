---
layer: application
type: application
subject: deferred-finalization
technique: correction-window-is-the-grace-period
stack: process
status: forged
verified_on: 2026-09-07
---

# One clock, two cadences, and a window that belongs to the customer

Read against Lago (open-source usage-based billing), pinned at commit
`a24f3abe`. The interesting thing here is not any single job — it is that the
whole correction window is expressed as **two scheduled passes over
eligibility queries plus one integer setting**, with no per-invoice timers and
no state machine driving dates.

## The clock

`clock.rb` is a Clockwork process (`docs/architecture.md:38`) that enqueues
everything into background queues. The two entries that own this subject:

```ruby
# clock.rb:28
every(5.minutes, "schedule:refresh_draft_invoices") do
  Clock::RefreshDraftInvoicesJob...
end

# clock.rb:103
every(1.hour, "schedule:finalize_invoices", at: "*:20") do
  Clock::FinalizeInvoicesJob...
end
```

The cadence split is the technique's freshness-versus-cost trade made
explicit: **refresh often, finalize hourly**. The hourly finalize is not a
daily one because of a comment at the top of the file — "All clocks run every
hour to take customer timezones into account" (`clock.rb:21`): the window
closes on the customer's calendar day, and the only way a single scheduler
can honour many time zones is to check every hour and let the eligibility
query decide. The `at: "*:20"` offset staggers it away from the eleven other
hourly jobs in the same file (`:75` `*:05`, `:85` `*:10`, `:91` `*:15`,
`:110` `*:25`, and so on), which is scheduling hygiene worth copying: one
file, one visible minute-by-minute allocation.

Both clock jobs are declared `unique :until_executed, on_conflict: :log`
(`app/jobs/clock/finalize_invoices_job.rb:5`), so a slow pass does not stack
up behind itself, and the collision is logged rather than swallowed.

## Eligibility, not a delta — the catch-up property comes free

```ruby
# app/models/invoice.rb:144
scope :ready_to_be_finalized, -> {
  draft.where("COALESCE(expected_finalization_date, issuing_date) <= ?", Time.current.to_date)
}
```

This is the technique's "catch-up, not calendar-driven" rule realized as a
predicate. The job (`app/jobs/clock/finalize_invoices_job.rb:8`) selects
everything currently eligible, not everything that *became* eligible since the
last run, so a day of downtime drains on the next pass with no backfill
procedure. `COALESCE` matters too: invoices created before the
`expected_finalization_date` column existed fall back to `issuing_date`, so
the query has no silently unmatched cohort.

## The window is a per-customer integer with a fallback chain

```ruby
# app/models/customer.rb:225
def applicable_invoice_grace_period
  return invoice_grace_period if invoice_grace_period.present?
  billing_entity.invoice_grace_period || 0
end
```

Customer → billing entity → zero, exactly the technique's per-payer setting
over a global default (`app/models/organization.rb:363` and
`app/models/billing_entity.rb:207` carry the defaults, both
`default(0), not null`). The default of **zero** is worth naming: out of the
box there is no correction window at all — invoices are computed and finalized
in one motion — and deferred finalization is something an operator opts into
per customer. That is a defensible default for a self-hosted engine and a
poor one for a hosted service whose customers' pipelines it cannot see.

The window becomes a date at creation time, once:

```ruby
# app/services/invoices/create_generating_service.rb:70
def expected_finalization_date
  date = datetime.in_time_zone(customer.applicable_timezone).to_date
  return date if !grace_period? || charge_in_advance
  date + customer.applicable_invoice_grace_period.days
end
```

Note `charge_in_advance` and `subscription_gated` (`:77-80`) short-circuit the
window entirely — a charge billed before consumption has no late input to wait
for, which is the technique's "when inputs cannot arrive late by construction"
exclusion appearing as a real branch rather than a caveat.

## The applied window is stored, and a settings change moves dates by the delta

`invoices.applied_grace_period` (`app/models/invoice.rb:709`) records the
window that was in force. Its payoff is
`app/services/invoices/update_issuing_date_from_billing_entity_service.rb`,
which runs when an operator changes the setting while drafts are open:

```ruby
# :18-19
invoice.expected_finalization_date = invoice.expected_finalization_date + grace_period_adjustment
invoice.applied_grace_period = invoice.customer.applicable_invoice_grace_period

# :37-42
def grace_period_adjustment
  new_issuing_date_service.grace_period - old_issuing_date_service.grace_period
end
```

The open artifacts are shifted by `new - old` rather than recomputed from
current settings, and the guard at `:15` (`return result unless
invoice.draft?`) keeps the change off anything already issued. This is the
technique's stored-window rule producing precisely the behaviour it predicts.

## Invalidation is pushed by the inputs

The refresh pass reads a flag, not a scan:

```ruby
# app/models/invoice.rb:143
scope :ready_to_be_refreshed, -> { draft.where(ready_to_be_refreshed: true) }
```

backed by a partial index — `index_invoices_on_ready_to_be_refreshed
(ready_to_be_refreshed) WHERE (ready_to_be_refreshed = true)`
(`app/models/invoice.rb:776`). Every writer of an input sets it, and the set
of writers is enumerable by grep:

| input that changed | site |
|---|---|
| a tax was updated | `app/services/taxes/update_service.rb:30` |
| a tax was destroyed | `app/services/taxes/destroy_service.rb:44` |
| a customer's taxes were applied | `app/services/customers/apply_taxes_service.rb:28` |
| a plan was updated | `app/services/plans/update_service.rb:89` |
| a billable metric was destroyed | `app/services/billable_metrics/destroy_service.rb:31` |
| a billing entity's taxes changed | `app/jobs/billing_entities/taxes/refresh_draft_invoices_job.rb:14` |

Every one of them scopes to `.draft`. The flag is cleared inside the rebuild's
transaction (`app/services/invoices/refresh_draft_service.rb:37`) and the
worker re-checks it before doing any work
(`app/jobs/invoices/refresh_draft_job.rb:39`).

## The verified absence: late usage has no path into a closed period

Enumerating every refresh trigger in the tree gives a complete answer to the
question the technique calls the honest limit, and the answer is that the
door is shut:

- the scheduled refresh selects `draft` only (`app/models/invoice.rb:143`);
- the finalize pass selects `draft` only (`:144`);
- `RefreshDraftService` returns immediately unless `invoice.draft?`
  (`app/services/invoices/refresh_draft_service.rb:34`), and so does
  `RefreshDraftAndFinalizeService` (`:18`), both inside `with_lock`;
- **no usage-event path sets `ready_to_be_refreshed` at all** — the six sites
  above are the complete list, and none of them is event ingestion;
- `RetryService` (`app/services/invoices/retry_service.rb:19`) reopens only
  `failed` invoices — a generation failure, not a finalized document.

So a usage event that arrives late lands in the invoice **only** if it arrives
before finalization, and it does so through the unconditional rebuild that
`RefreshDraftAndFinalizeService` performs immediately before freezing
(`:23`) — the technique's backstop for a missed invalidation, present here and
doing exactly that job. After finalization there is no mechanism, anywhere in
the tree, that would fold it in.

## Where this tree falls short of the standard

- **No lateness measurement, and no late-arrival counter.** The grace period
  is an operator-entered integer with no instrument behind it: nothing
  measures the distribution of event lateness, and nothing counts events that
  arrived after their period was finalized. The window is therefore chosen by
  feel, and the feedback loop the technique requires does not exist. The
  standard stays.
- **No defined destination for a late input.** Because nothing counts them,
  nothing routes them either; the honest limit is enforced but not accounted
  for.
- **The exclusive-window guard is a row lock, not a status transition inside
  the finalize transaction.** `with_lock` is sufficient here and the tree is
  careful about re-reading status under it — the comment at
  `app/services/invoices/retry_service.rb:16-17` records the incident that
  taught them ("the status is read again here rather than trusted from before
  the lock was taken") — but the guarantee rests on every writer remembering
  to take the same lock.
