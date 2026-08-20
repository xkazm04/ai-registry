---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: deterministic-external-ids
status: forged
laws: [no-retroactive-restatement]
shared_with: []
use_when: [assigning primary keys to records synced from an external system, making webhook and backfill ingestion converge on the same rows, designing for at-least-once delivery]
---

# Deterministic external ids

A record synced from an external system gets its primary key **derived, not
generated**: a pure function of the provider's name and the business object's
own id, giving the same key on any machine, at any time, on any delivery
attempt. `provider:object-id` — and for records that shadow another object,
a namespaced variant like `provider:refund:charge-id`. This one decision is
what makes everything downstream idempotent: the upsert has a stable key to
converge on, redelivery lands on the row it already wrote, and a backfill
that re-fetches history produces byte-identical identities to the webhooks
that raced it.

The anti-pattern is minting a random unique id at ingest. It feels harmless —
"every row needs a key" — but it encodes the assumption that each *arrival*
is a new *fact*. Under at-least-once delivery that assumption is false by
contract, and the cost lands as duplicate revenue rows that no constraint can
catch, because every row's key is innocently unique. Deduplication then
becomes an offline job matching rows on fuzzy content — the job this
technique exists to make unnecessary.

## Construction rules

- **Key on the business object, not the delivery.** Providers give the
  delivery envelope its own event id and the carried object (invoice, charge)
  its id. Use the object's. The same paid invoice can arrive under multiple
  envelope ids — a redelivery, a backfill, a manually re-sent event — and all
  of them are the same fact.
- **Prefix with the provider.** Two providers' id spaces are not guaranteed
  disjoint, and the day you add a second billing source must not be the day
  your keys collide. The prefix also makes any id legible in a debugging
  session: you can read where a row came from off its key.
- **Namespace derived records.** A refund normalized from a charge is not the
  charge; giving it `provider:refund:charge-id` keeps both records, distinct
  and stable, even when the provider reuses the charge's id as the only handle
  on the refund. Any record your normalizer *derives* from another object
  needs its own namespace segment, or the derivation and the original will
  fight over one row.
- **Store the raw external id as its own column too.** The canonical key is
  for convergence; the untouched provider id is for support conversations and
  cross-referencing the provider's dashboard. Reconstructing one from the
  other by string-splitting the key is fragile the moment a provider's ids
  contain your delimiter.
- **The function is frozen.** Changing the derivation scheme later orphans
  every existing row from its future redeliveries — the old fact and its
  re-arrival stop converging, which is a silent restatement of history. If a
  scheme change is truly forced, it ships with a key migration of the
  existing rows in the same change.

## Decision rules

- When one delivery yields several records (an invoice with separately
  tracked lines), each record's id derives from *its* object's id — never
  from the envelope plus an index, which reshuffles when the provider
  reorders the array on redelivery.
- When the provider offers both a mutable "latest" object and immutable
  versions, key on the immutable identity you want one row per — one row per
  invoice that updates in place is the usual right answer for revenue.
- When an object genuinely has no provider id (rare; some manual-entry
  paths), derive from the most stable natural key available and mark the
  source, rather than falling back to randomness for just those rows.

## When not to use it

Records that are *not* shadows of an external fact — operator-entered manual
revenue adjustments, internally generated accruals — have no external
identity to derive from; generated ids are correct there, and pretending
otherwise produces strained fake determinism. The technique's scope is
exactly the records whose source of truth lives in someone else's system and
can therefore be delivered to you more than once.
