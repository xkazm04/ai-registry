---
layer: golden-path
type: golden-path
subject: billing-revenue-normalization
status: forged
use_when: [ingesting a billing provider's webhooks into revenue records, building the revenue side of per-customer margin, handling multi-currency payments in an analytics store, deciding how refunds and redeliveries affect recognized revenue]
techniques:
  - signature-is-the-auth
  - deterministic-external-ids
  - idempotent-revenue-upsert
  - minor-unit-currency-handling
  - static-auditable-fx-book
  - revenue-kind-taxonomy
---

# Billing revenue normalization

Unit economics has two halves: the cost of serving each customer, and the money
each customer pays. This subject is the ingest half of the second — turning a
billing provider's signed webhook deliveries into **canonical, idempotent,
base-currency revenue records** that can be netted against cost without a
human reconciling anything. It is entirely operator-side. The builder bundle
has no revenue concept at all: an agent system emits traces and costs; it is
the operator running that traffic as a product who must know what the traffic
*earns*. Recognition — amortizing a subscription across its period, flipping a
refund's sign into a window's total — belongs to the margin surface downstream;
this subject ends at a correct, durable record.

The naive reading is "parse the webhook JSON and insert a row". Every clause
of that sentence hides a defect. "Parse" before verifying makes the endpoint
an unauthenticated write path into your revenue ledger. "The webhook" assumes
one delivery per event, when the provider's contract is *at-least-once* — it
will redeliver anything you did not acknowledge, and sometimes things you did.
"Insert" duplicates on every redelivery. "A row" with the amount as sent
mis-states any currency whose minor unit is not a hundredth, and any currency
that is not your reporting base. The principal practitioner treats the path as
four deliberate stages — authenticate, identify, normalize, persist — each
with a rule that survives audit months later.

## The delivery is not the event

A webhook **delivery** is a transport artifact: it has a delivery id, a
timestamp, a retry count. The **business event** it carries — this invoice was
paid, this charge was refunded — has its own identity: the provider's id for
the invoice or the charge. Everything in this subject keys on the business
object, never the delivery. A canonical id derived deterministically from the
provider and the business object's id (deterministic-external-ids) means the
same fact always lands in the same row, and an upsert on that id
(idempotent-revenue-upsert) means redelivery is a no-op by construction rather
than a dedup job by mitigation. Systems that key on delivery ids run a
reconciliation script forever; systems that key on business identity never
need one.

The delivery stream is also **unordered by contract** — providers disclaim
event ordering outright, and retry backoff makes inversions routine: a
refund's event can arrive before the charge's, an invoice's correction
before its creation. Normalization therefore never assumes sequence. Each
event must be processable self-contained from its own payload; a derived
record (a refund keyed under its charge) must not require the parent row to
already exist; and where the correct record genuinely depends on current
object state rather than one event's snapshot, fetch that state from the
provider's API instead of trusting arrival order to have delivered it.
Deterministic identity is again what makes this safe: whichever order the
facts land in, each converges on its own row.

## The signature is the auth — and authenticity is not relevance

The webhook endpoint is reachable from the open internet and writes to your
ledger. Its authentication is the provider's signature over the payload,
verified against a secret the provider issued (signature-is-the-auth) — not an
IP allowlist, not a secret path segment, and never any field *inside* the
payload, all of which an attacker composes freely. Verify over the raw bytes,
in constant time, with a bounded replay window, before parsing anything.

Distinct from authenticity is relevance. Providers emit dozens of event types;
a revenue ledger tracks a handful. An **authentic event you do not track
yields zero records and is still acknowledged as success** — otherwise the
provider retries it forever, and your logs drown in synthetic failures for
events that were never wrong. The decision table is: signature invalid →
reject, log as a security signal; signature valid, type untracked → empty
result, acknowledge; signature valid, type tracked → normalize. Only the first
row is an error.

## Money is a magnitude, a currency, and a kind

Three separate normalization mistakes each silently mis-state revenue, and
they compound:

**Minor units are per-currency.** Providers transmit amounts in the currency's
minor unit, and the divisor to major units is a property of the *currency* —
ten to its decimal-places exponent — not a universal hundred. Zero-decimal
currencies have no minor unit at all; dividing them by a blanket hundred
understates that revenue a hundredfold, in one incident exactly that: yen
revenue reported at one percent of reality until reconciliation caught it
(minor-unit-currency-handling).

**Conversion is deterministic or it is not accounting.** Cross-currency
revenue converts to one reporting base so it can be summed and netted against
cost — but at rates from a **static, versioned, provenance-stamped snapshot**,
never a live feed that re-prices history between two runs of the same report
(static-auditable-fx-book). A currency with no rate in the book is stored at
face value and *flagged*, and every aggregate that includes it says so —
absence of a rate is a state to disclose, never a license to pretend the
amount was already in the base currency. The original currency label is
preserved on the record either way; conversion must never destroy the source
of truth it converted from.

**Sign lives in the kind, not the amount.** The amount on a record is always a
non-negative magnitude. Whether it adds to or subtracts from recognized
revenue is derived from a closed kind taxonomy — recurring, one-time,
usage-based, refund — at recognition time (revenue-kind-taxonomy). Scattering
negative amounts through the ledger instead means every downstream sum must
know which rows are secretly subtractions; concentrating sign derivation in
one place means none of them do. The kind also carries recognition semantics:
a recurring record has a service period to amortize over; a point-in-time
record recognizes at its timestamp.

## Persist atomically, acknowledge after

The records from one delivery are written as **one transaction** — a mid-batch
failure rolls back the whole delivery rather than committing a partial prefix,
because the provider's retry will replay the *entire* delivery and a partial
prefix plus a replay is exactly the double-count the upsert exists to prevent
being asked about. Acknowledge the delivery only after the transaction
commits. Acknowledging first and persisting second converts every crash in the
gap into silently lost revenue that no retry will ever repair, because you
told the provider it was handled.

## What the record must let downstream do

A revenue record earns its place by what the margin surface can do with it
unaided: net against cost by customer and product (so it carries the
provider's customer and product identifiers), amortize by period (so recurring
records carry their service window), restate nothing (so amounts and rates are
fixed at ingest), and disclose its own approximations (so an unconverted
currency is flaggable per-record, not rediscovered by forensics). The test for
the whole subject is an auditor's question — "why does this month's revenue
say what it says?" — answered entirely from the records themselves: each row
names its provider, its business object, its original currency and magnitude,
its kind, and converts through a rate book you can check out at the version
that priced it.

## Where this subject stops

Fetching historical events by polling the provider's API (backfill) reuses
the same normalization and the same upsert — deterministic identity is what
makes webhook and backfill paths converge on identical rows instead of
duplicating each other. Margin computation, amortization across report
windows, and the surfaces that display unconverted-currency caveats are the
neighboring economics subjects; judge and benchmark spend segregation is the
quality apparatus's concern. This subject's deliverable is only — and exactly
— a ledger the rest can trust.
