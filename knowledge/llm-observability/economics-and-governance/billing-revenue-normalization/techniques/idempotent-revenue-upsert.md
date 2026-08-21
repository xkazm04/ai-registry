---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: idempotent-revenue-upsert
status: forged
laws: []
shared_with: []
use_when: [persisting webhook-delivered records under at-least-once semantics, deciding when to acknowledge a delivery, batching multi-record deliveries]
---

# Idempotent revenue upsert

At-least-once delivery is the provider's contract: any delivery you did not
acknowledge with success will be retried, on a schedule you do not control,
possibly days later, possibly after you already processed a duplicate. The
persistence layer must therefore make **replay a no-op by construction**: an
insert-or-update keyed on the record's deterministic id, where the update arm
overwrites the row's fields from the incoming record. Not insert-and-ignore-
conflict, not insert-and-error — *upsert*, because the provider may also
redeliver an object that legitimately changed (an invoice finalized with a
corrected amount), and the newest delivery of a fact is the fact.

The alternative postures both fail in production. Plain insert turns every
retry into either a duplicate row (revenue double-counted) or a constraint
error (which makes you return failure, which triggers another retry — a
permanent error loop over an event you already have). Insert-if-absent
silently pins the *first* version of an object forever, discarding the
provider's corrections; it converts redelivery from a threat into a lost
update.

## One delivery, one transaction

A delivery that normalizes into several records is persisted as **one
transaction wrapping the per-record upserts** — commit all or roll back all.
The reason is the interaction with retry: a partial prefix committed before a
mid-batch failure, plus the provider's replay of the whole delivery, is a
state the upsert must then repair — which it does, but the intermediate state
was visible to any report that ran in the gap, and a report that summed a
half-written delivery is a number nobody can explain later. Atomicity means
the ledger only ever shows deliveries that fully happened.

The transaction also defines the **acknowledgement point**: return success to
the provider only after commit. The two failure orderings are not symmetric —
persist-then-crash-before-ack costs one redundant retry that the upsert
absorbs; ack-then-crash-before-persist loses revenue permanently, because the
provider marked the delivery done and will never send it again. When in
doubt, fail the delivery; retry is the safe direction.

High-volume receivers vary the mechanics without breaking the invariant:
where the provider's delivery timeout is tighter than normalization can
run, verify the signature, **durably persist the raw delivery** (a queue
with acknowledged writes, an inbox table in the same database), and
acknowledge on that commit — the queue consumer then owns the
normalize-and-upsert transaction with the same all-or-roll-back
discipline. The invariant was never "normalize before acknowledging"; it
is **acknowledge only what is durably persisted**, and a durable raw copy
satisfies it because your own replay from the inbox replaces the
provider's retry. Acknowledging on an in-memory enqueue satisfies nothing.

## Decision rules

- **Update every business field in the conflict arm**, not a subset. A
  partial update arm means some fields track the latest delivery and others
  fossilize at the first — a skew that surfaces months later as rows that
  agree with no single version of the provider's object.
- **Let the incoming record win.** The provider is the source of truth for
  its own objects; last-write-wins on redelivery is correct *because* the id
  is per-object and the provider serializes its own object's history. Do not
  build timestamp-comparison cleverness into the upsert unless you have
  measured out-of-order deliveries of *different versions* — most providers
  re-send the current state, making the newest arrival the newest fact
  anyway.
- **Protect operator-owned fields.** Anything your side stamps onto the row
  that the provider does not know — an internal project assignment, a manual
  reconciliation note — must either live outside the upserted record or be
  explicitly preserved in the update arm, or redelivery quietly erases your
  own annotations.
- **A failing record fails its delivery.** Do not skip the bad record and
  commit the rest; the provider's retry replays everything, and the skipped
  record's bug now needs the retry to still be happening when you fix it.
  Roll back, return failure, let the retry schedule carry the delivery until
  the fix ships.

## When not to use it

Append-only event stores that *want* every delivery attempt as a separate
observation (delivery-latency analytics, webhook debugging) should append
with the envelope id and deduplicate at read time — idempotent convergence
would erase exactly the duplicates they study. And genuinely immutable facts
ingested exactly once from a source you control (an internal batch export)
can use plain insert with a uniqueness guard; the upsert's update arm earns
its complexity only where redelivery and correction are real. For revenue
from a third-party billing provider, they are always real.
