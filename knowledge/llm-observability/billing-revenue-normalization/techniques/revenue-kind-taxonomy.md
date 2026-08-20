---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: revenue-kind-taxonomy
status: forged
laws: []
shared_with: []
use_when: [modeling refunds and credits in a revenue ledger, classifying billing events into recognition categories, designing the schema the margin surface will amortize from]
---

# Revenue kind taxonomy

Every revenue record carries a **kind** from a closed taxonomy, and the kind —
not the amount — determines how the record enters recognized revenue. The
minimal viable set is four: **recurring** (a subscription charge, recognized
by amortizing over its service period), **one-time** (a point charge,
recognized at its timestamp), **usage** (a metered charge, recognized at its
timestamp), and **refund** (a credit that *subtracts* from recognized
revenue). The taxonomy is the contract between ingest and the margin surface:
ingest classifies once, with the provider's full event in hand; everything
downstream branches on the kind and never re-inspects provider payloads.

## Amount is a magnitude; sign derives from kind

The load-bearing rule: **the stored amount is always a non-negative
magnitude, and sign is derived from the kind at recognition time.** A refund
of twenty is stored as twenty, kind refund; the margin computation flips it.

The alternative — storing refunds as negative amounts — looks equivalent and
is not. Scattered negatives make every downstream consumer responsible for
remembering which rows subtract: the query that sums "gross revenue"
accidentally nets refunds out, the one that counts "average transaction size"
averages in negatives, and each consumer decides independently, so they
disagree. With magnitude-plus-kind, sign interpretation exists in exactly one
place; a consumer that ignores refunds does so by an explicit, visible filter
rather than by an arithmetic accident. It also gives the schema a free
integrity check — a negative amount anywhere is corrupt data, not a maybe-
refund — and keeps refund analytics honest: "how much did we refund" is a sum
of magnitudes, not an absolute value of a sum.

## Classification happens at ingest, by rule

The provider does not send your taxonomy; it sends its own event vocabulary,
and ingest maps it. The mapping rules worth writing down:

- **Infer recurring vs one-time from structural linkage, not event names.** A
  paid invoice that references a subscription is recurring; the same event
  type without that linkage is a one-time charge. Providers reuse one invoice
  event for both, so the discriminator is the presence of the subscription
  reference in the object.
- **Recurring records must carry their service period** — start and end —
  captured from the invoice's line data at ingest. The kind promises the
  margin surface it can amortize; a recurring record without a period is a
  broken promise that surfaces as an unanswerable question months later. If
  the period is genuinely absent, ingest it as point-in-time rather than
  recurring-with-nulls.
- **A refund derived from a charge is its own record**, with its own
  (namespaced) identity, kind refund, and the refunded magnitude — never a
  mutation of the original record's amount. The original sale and its refund
  are two facts, possibly in different reporting periods, and netting them
  into one row destroys exactly the period boundary an accountant cares
  about. A zero-magnitude refund event (providers emit these on some
  non-monetary updates) normalizes to no record at all.
- **Partial refunds:** providers typically report the *cumulative* refunded
  amount on the same object across successive events. Under deterministic
  identity plus upsert, successive deliveries converge on one refund record
  holding the latest cumulative magnitude — correct without any special
  handling, which is the taxonomy composing with its sibling techniques
  rather than duplicating them.
- **Unknown kind strings parse to the most conservative member** (one-time:
  recognized immediately, adds, never amortizes) rather than failing the
  read path — a ledger that cannot be read because one row holds a kind from
  a newer version of the software is worse than one row recognized slightly
  wrong. The mismatch should still be visible in telemetry.

## Keep the taxonomy closed and small

Each kind must earn its place by having *different recognition semantics*.
"Enterprise deal" vs "self-serve subscription" is a reporting dimension
(carry it as product or metadata), not a kind — both amortize identically.
The test for adding a member: would the margin surface compute a different
number for it? If not, it is a tag. Taxonomies that absorb every business
distinction grow until no two consumers agree on the branches, which is the
scattered-negatives failure wearing a different coat.

## When not to use it

A single-product, no-refund, no-subscription business can defer the taxonomy
— but the cost of carrying kind from day one is one column and a default
value, and the cost of retrofitting it is reclassifying history by forensics.
The genuine non-fit is full accrual accounting with deferred revenue
schedules, multi-element arrangements, and revenue-recognition standards in
scope: that is an accounting system's job, and this taxonomy is deliberately
the *operational* approximation that keeps unit economics honest, not a
replacement for it.
