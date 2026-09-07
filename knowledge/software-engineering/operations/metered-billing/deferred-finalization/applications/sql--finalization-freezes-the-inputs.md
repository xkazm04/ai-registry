---
layer: application
type: application
subject: deferred-finalization
technique: finalization-freezes-the-inputs
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# What the row keeps, what the number costs, and where the join survives

Read against Lago (open-source usage-based billing), pinned at commit
`a24f3abe`, on PostgreSQL 15. The schema is a good worked example of the
technique because it freezes most of the derivation context properly, and the
places it does not are precisely the ones the technique predicts a team will
miss.

## The frozen derivation context, column by column

**Line items** (`app/models/fee.rb:375-425`) carry the rate rather than a
pointer to it: `units`, `unit_amount_cents`, `precise_unit_amount`,
`amount_cents`, `amount_currency` (`:380`), `taxes_rate` (`:402`),
`taxes_base_rate`, `taxes_amount_cents`, plus `properties` (jsonb, holding the
aggregation boundaries the quantity was computed over) and `amount_details`.
`invoice_display_name` (`:388`) copies the *displayed* label, which is the
right instinct — a line's name is as mutable as its rate.

**Taxes** are frozen in their own table rather than joined
(`app/models/invoice/applied_tax.rb:41-57`): `tax_code`, `tax_name`,
`tax_description`, `tax_rate`, `taxable_base_amount_cents`,
`fees_amount_cents`, `amount_cents`, `amount_currency` — with `tax_id`
(`:57`) as a **nullable** pointer under
`fk_rails_... (tax_id => taxes.id) ON DELETE => nullify` (`:70`). Delete the
tax definition and the invoice still states the rate it charged; only the
link degrades. That is the technique's rule in its exact form — the pointer
may go, the facts may not.

**Document furniture** is frozen the same way:
`applied_invoice_custom_sections` (`app/models/applied_invoice_custom_section.rb`)
copies `code`, `name`, `display_name` and `details` onto the invoice, so
editing a custom section later does not rewrite documents already issued.

**The invoice row** (`app/models/invoice.rb:706-761`) holds `currency`,
`taxes_rate`, every `*_amount_cents` total, `timezone`, `net_payment_term`,
`issuing_date`, `payment_due_date`, `finalized_at`, `applied_grace_period`,
and `version_number` (`:748`, `default(4)`) — a stored calculation-version
that lets old invoices keep old arithmetic when the rules change, and which
`creditable_amount_cents` reads directly (`:365`, `:408`).

## The identifier is minted at finalization, and drafts share a placeholder

```ruby
# app/models/invoice.rb:583
def should_assign_sequential_id?
  status_changed_to_finalized?
end

# app/models/invoice.rb:595
def ensure_number
  self.number = "#{billing_entity.document_number_prefix}-DRAFT" if number.blank? && !status_changed_to_finalized?
  return unless status_changed_to_finalized?
  ...
end
```

Every draft in the system literally carries the number `PREFIX-DRAFT`. It is
not a reserved number, not a provisional one from the same series, and it is
not unique — three properties that together make it impossible to mistake a
draft's handle for an issued one, and impossible for an unissued draft to
consume a number. This is the technique's sequence-gap argument implemented
about as bluntly as it can be.

The allocation itself is serialized under an advisory lock held for the
transaction (`:625-646` per billing entity, `:656-686` per organization):

```ruby
# app/models/invoice.rb:629
result = Invoice.with_advisory_lock(lock_key, transaction: true, timeout_seconds: 10.seconds) do
  ... .with_generated_number.maximum(:billing_entity_sequential_id) || 0
  loop do
    billing_entity_sequential_id += 1
    break billing_entity_sequential_id unless ... .exists?(billing_entity_sequential_id:)
  end
end
raise(SequenceError, "Unable to acquire lock on the database") unless result
```

Two details are worth copying. The high-water mark is taken over
`with_generated_number`, which is `where(status: %w[finalized voided])`
(`:142`) — voided invoices keep their numbers and their place, so no number is
ever re-issued. And a failed lock is a **typed error**, not a silent skip: the
finalize job retries it with polynomial backoff for up to fifteen attempts
(`app/jobs/invoices/finalize_job.rb:16`), which is the technique's
"contention at period end is normal, size the retry budget for it".

## Content freezes; the row does not

The invoice's mutable-after-issue columns are exactly the technique's second
category — facts about what happened *to* the document:
`payment_status`, `payment_attempts`, `payment_overdue`, `payment_due_date`,
`total_paid_amount_cents`, `payment_dispute_lost_at`, `ready_for_payment_processing`,
`voided_at`, `file`, `xml_file` (`app/models/invoice.rb:706-750`). Nine
statuses are declared in one place (`:100-104`), split into `VISIBLE_STATUS`
and `INVISIBLE_STATUS` so the two audiences of the state machine are
enumerable rather than folklore.

The third finalization outcome the technique describes is here too:
`Invoices::TransitionToFinalStatusService:22-39` finalizes, or sets
`status = :closed` when the invoice has no billable amount and the customer's
`finalize_zero_amount_invoice` setting (falling back to the billing entity's)
says not to issue one. A closed invoice consumes no number and leaves the
audited sequence clean.

## The effect ordering

`Invoices::RefreshDraftAndFinalizeService` commits the freeze inside
`invoice.with_lock` (`:16-41`) and fires every external consequence from
`after_commit` (`:44-62`): the `invoice.created` webhook, the activity-log
entry, document generation and delivery, accounting-system sync, and the
payment attempt. Nothing leaves the building before the record exists — the
technique's record-before-effect rule, with the retry surface that follows
from it (each consequence is its own job against a committed invoice).

## Where this tree falls short of the standard

Three gaps, all on the same axis — the counterparty's own details are the one
part of the derivation context that is **not** copied.

- **No customer snapshot.** `invoices` carries `customer_id` and nothing else
  about the customer; legal name, address and tax registration are read live.
  Correct the payer's registered address next year and every finalized
  invoice in the interface, the API and the exports silently restates it.
- **The rendered file is the only freeze of those fields.**
  `Invoices::GeneratePdfService:36-56` renders once at finalization and
  attaches the result to `invoices.file`. The counterparty's copy is
  therefore correct and the system's own record is not — the two
  representations of one document that the technique warns diverge silently,
  present here in the textbook form.
- **A blank copied label falls back to a live one.** `fee.rb:153-157`:
  `invoice_display_name` is nullable, and when it is blank the fee renders
  `charge.invoice_display_name` or `billable_metric.name` as they are *today*.
  A frozen field that is optional is frozen for the rows that happened to fill
  it.

The re-render test the technique prescribes — change every mutable input, then
diff the rendered document — would fail on this tree today, and would fail on
the customer fields only. That is a narrow, well-located gap and a good
illustration of why the test changes everything at once: the rate and tax
freezes here are exemplary, and testing those alone would have returned a
clean pass.
