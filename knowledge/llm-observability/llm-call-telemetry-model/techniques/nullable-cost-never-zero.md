---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: nullable-cost-never-zero
status: forged
laws: [nullable-never-zero, never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [deciding what to store when a model is missing from the price book, designing cost aggregates that will feed caps or margins, auditing why spend totals disagree with provider invoices]
---

# Nullable cost, never zero

The cost field on a call record is optional by design, and its null state is
one of the most load-bearing values in the whole model. A call is priced by
exactly one of two paths: the client reported a cost verbatim, or the server
computed one from its price book (honoring the call's pricing lane and any
prompt-length tiers). When neither path resolves — most commonly a model
absent from the book, which is *guaranteed* to happen on the day a provider
ships a new model — the cost is **null**. Not zero. Not a guess.

## Why zero is the worst possible substitute

A phantom zero lands precisely on the newest, least-vetted traffic — the
model launched this morning, the provider added yesterday — and makes it
read as the *cheapest*. Every consumer inherits the lie in its most
dangerous direction: a spend cap sees headroom that does not exist and keeps
admitting; a margin report shows the new model as pure profit; a trend line
shows costs falling exactly when they rose. And the error is self-hiding:
zero-cost rows look like measurements, aggregate cleanly, and alarm nothing.
A null, by contrast, forces every consumer to decide — explicitly, in code —
what "unpriced" means for its question. That forcing function is the point.

## Aggregates disclose their unpriced count

The corollary is non-negotiable: **every aggregate over a nullable measure
carries how many rows it could not measure.** A daily spend total is
"$412.07 across 9,310 calls, 214 unpriced", never bare "$412.07". Without
the count, a null-aware sum performs the same substitution as a phantom zero
— it just moves the lie from the row to the rollup. With it, the reader can
judge whether the gap is noise or the number is meaningless, and an
operator's surface can alarm on the unpriced *rate* — which is the actual
signal that the price book needs a new entry. When a cap's evaluation window
contains material unpriced spend, the honest behaviors are to refuse to
price the decision or to decide-and-disclose; silently enforcing on the
priced subset presents absence as an answer.

## Cost carries its provenance

Beside the amount rides how it was determined — conventionally a
`cost_source` stamp with two values: the caller supplied it (`client`) or
the server computed it (`book`). Unpriced rows carry no stamp at all, which
keeps the invariant self-consistent: no cost, no provenance to claim. The
stamp exists because the two sources have different trust: book-priced spend
is the operator's own arithmetic over audited prices; client-reported spend
is an assertion. Downstream consumers use it accordingly — a limit
evaluation reports the client-reported *share* of the spend it is enforcing
on, so an operator can see when a cap is resting on self-reported numbers
rather than discovering it during an invoice dispute.

## Decision rules

- **Price at ingest, once.** The cost is resolved at admission and stamped;
  a later price-book correction applies to new traffic, not to history —
  restating stored spend inside an already-reported window converts
  accounting into fiction. Backfilling nulls after adding a missing book
  entry is legitimate *only* as an explicit, logged migration (nulls hold no
  prior value to restate), never as a silent re-read-time computation.
- **Never default the field.** No deserialization default, no `COALESCE(cost,
  0)` in any query that feeds a decision. `COALESCE` belongs only in
  presentation layers that also render the unpriced count.
- **A zero cost is storable** — genuinely free calls (a $0 promotional rate,
  a free-tier model with a real $0 book entry) are measurements and stamp
  `book` like any other. The ban is on zero-as-substitute, not zero-as-fact.

## When not to apply it

Do not extend nullability to the token counters' mandatory pair or to
latency-style operational fields where a defaulted value cannot corrupt
money. The discipline is expensive for consumers — every reader must handle
null — so reserve it for fields where substitution changes an accounting or
enforcement outcome.
