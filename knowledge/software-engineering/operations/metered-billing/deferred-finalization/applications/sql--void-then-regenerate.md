---
layer: application
type: application
subject: deferred-finalization
technique: void-then-regenerate
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@15
---

# The supersession link as the key that opens the uniqueness constraint

Read against Lago (open-source usage-based billing), pinned at commit
`a24f3abe`, on PostgreSQL 15 (`.github/workflows/spec.yml:15` pins
`getlago/postgres-partman:15.0-alpine`). This is the clearest realization of
the technique's central claim available in a public tree: the audit link
between a voided invoice and its replacement is not documentation of the
correction, it is the mechanism that *permits* it.

## The constraint, and its predicate

An invoice is joined to a subscription and a billed period through
`invoice_subscriptions`. Four partial unique indexes on that table forbid a
second document for a period, and every one of them carries the same clause
(`db/structure.sql`):

```sql
-- db/structure.sql:11439
CREATE UNIQUE INDEX index_uniq_invoice_subscriptions_on_charges_from_to_datetime
  ON public.invoice_subscriptions
  USING btree (subscription_id, charges_from_datetime, charges_to_datetime)
  WHERE ((created_at >= '2023-06-09 00:00:00'::timestamp without time zone)
     AND (recurring IS TRUE)
     AND (regenerated_invoice_id IS NULL));
```

- `:11446` — the same shape over `fixed_charges_from_datetime` /
  `fixed_charges_to_datetime`.
- `:11530` — `index_unique_starting_invoice_subscription`, one
  `subscription_starting` row per subscription, `WHERE ... AND
  regenerated_invoice_id IS NULL`.
- `:11537` — `index_unique_terminating_invoice_subscription`, the same for
  `subscription_terminating`.

`regenerated_invoice_id IS NULL` **is** the counting predicate. A row that
names the invoice which superseded it leaves the unique index's scope, and
only then can a second row for the same subscription and the same period be
inserted. There is no application-level bypass and no "unless" branch: the
insert either finds a supersession record or fails.

The strongest evidence that this was the design intent rather than a
convenient side effect is the migration history — the column and the first
index that depends on it were added in the same change:

```ruby
# db/migrate/20250716132649_add_regenerated_invoice_id_and_index_to_invoice_subscriptions.rb:7
add_reference :invoice_subscriptions, :regenerated_invoice,
  index: {algorithm: :concurrently}, type: :uuid

add_index :invoice_subscriptions, [:subscription_id, :invoicing_reason],
  unique: true,
  name: :index_unique_terminating_invoice_subscription,
  where: "invoicing_reason = 'subscription_terminating' AND regenerated_invoice_id IS NULL",
  algorithm: :concurrently
```

The period-boundary index followed two weeks later
(`db/migrate/20250806173900_add_scoped_index_to_charges_from_and_to_datetime.rb:11`),
with the same predicate.

## The grandfather clause is visible in the predicate

`created_at >= '2023-06-09 00:00:00'` in the charges-boundary index is the
technique's "introducing the constraint onto a live table" rule made
concrete: rows written before that instant are outside the index and are not
protected. The date sits in the index definition itself, so anyone reading
the constraint reads its limit at the same time — which is the condition that
makes the compromise honest rather than a silent hole.

Note also `algorithm: :concurrently` with `disable_ddl_transaction!` in every
one of these migrations: on a live billing table the index must be built
without holding a write lock, which is what makes retrofitting the constraint
possible at all.

## Both edges of the link are written, in one transaction

`app/services/invoices/regenerate_from_voided_service.rb`:

- `:278-293` `create_regenerated_invoice` mints a fresh invoice through
  `Invoices::CreateGeneratingService` and immediately sets
  `voided_invoice_id: voided_invoice.id` — the replacement names its
  predecessor.
- `:266-276` `create_invoice_subscriptions` walks the voided invoice's
  `invoice_subscriptions`, sets `regenerated_invoice_id` on each **old** row —
  releasing the constraint — then duplicates the row for the new invoice with
  `regenerated_invoice_id = nil`, placing the duplicate inside the index's
  scope as the single counting row for that period.
- `:23-56` wraps the whole sequence in one `ActiveRecord::Base.transaction`,
  so no window exists in which two counting rows are visible.

The order is load-bearing and matches the technique's rule: the supersession
is recorded before the replacement's row is inserted. Reverse it and the
insert simply fails on the unique index — which is the correct outcome, and a
demonstration that the constraint is doing the enforcing rather than the code.

## The voided document keeps its number

`app/models/invoice.rb:142`:

```ruby
scope :with_generated_number, -> { where(status: %w[finalized voided]) }
```

Sequential-id allocation (`:625-680`) computes its high-water mark over that
scope, so voided invoices still occupy their place in the audited sequence and
their numbers are never re-issued. A void here is a permanent, numbered,
fully legible hole in the counting set — the technique's "still exists, still
renders, still explains itself".

Supporting columns on `invoices` (`:709-761`): `voided_at`,
`voided_invoice_id`, and `index_invoices_on_voided_invoice_id` for walking the
chain forward from a superseded document.

## A human correction enters as a stored adjustment

`app/services/invoices/regenerate_from_voided_service.rb:210-233` shows the
second regeneration mode. Operator-supplied `fees_params` are not written onto
the new invoice's lines; each becomes an `AdjustedFee` record through
`AdjustedFees::CreateService.call!(..., regenerating_voided: true)`, and the
replacement's line is derived from it at `:115-193`. Carried-over lines record
their ancestry — `dup_fee.original_fee = voided_fee.original_fee || voided_fee`
(`:244`) — and every downstream value is reset before recomputation:

```ruby
# :238-243
dup_fee.payment_status = :pending
dup_fee.taxes_amount_cents = 0
dup_fee.taxes_precise_amount_cents = 0
dup_fee.precise_coupons_amount_cents = 0
dup_fee.taxes_base_rate = 0
dup_fee.taxes_rate = 0
```

Taxes, coupon credits, progressive-billing credits and prepaid credits are
then re-derived (`:33-50`), which is exactly the technique's rule that a
copied line must never carry a copied tax.

## Void and compensate are one service, and settlement decides

`app/services/invoices/void_service.rb` is where the void-versus-compensate
decision lands in code. `:21-64` voids under `invoice.with_lock`, refuses a
second void (`:32`), and — when the caller asks for a credit note — validates
the requested credit and refund against `creditable_amount_cents` and
`refundable_amount_cents` (`:79-87`) before creating it. Money already
attached to the invoice is unwound explicitly rather than implicitly: applied
coupons are recredited (`:37-39`) and outbound wallet transactions are
recredited when no credit note is generated (`:46-49`).

The external effects follow the same rule as finalization — they fire after
the locked block, from committed state (`:57-59`): the void webhook, the
provider-tax void, the CRM update. Voiding does not attempt to un-send
anything; each compensating act is its own job.

## Where this tree falls short of the standard

- **The void reason is free text.** `VoidService` takes `params` carrying
  refund and credit amounts, and the credit note is described with an
  interpolated string (`:104`, `:118`). There is no reason vocabulary, so
  "corrections by cause" is not a query anyone can run. The standard's
  enumerated reason code stays.
- **The settlement guard is partial.** Voiding a paid invoice is not refused
  outright; it is mediated by the credit-note amounts a caller passes. The
  technique's harder rule — a settled document is compensated, not voided —
  is enforced here only by the caller's discipline.
