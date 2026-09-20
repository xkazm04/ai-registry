---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: per-provider-usage-extractors
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when: [writing a client wrapper that records usage from provider responses, reconciling divergent SDK response shapes, reviewing a generic usage parser for silent misses, checking whether a normalized usage record honors the inclusive convention]
---

# Per-provider usage extractors

Extract token usage from provider responses with **one small, explicit
extractor per provider family**, each reading that provider's documented
response shape and returning the identical normalized tuple — model,
input tokens, output tokens, cached tokens. Do not write one generic
extractor that walks unknown objects hoping to recognize usage.

## Why the shapes cannot be unified upstream

The major providers do not disagree about usage cosmetically; they disagree
structurally, and each dimension of divergence defeats a different "clever"
generic approach:

- **Different field names for the same fact.** One provider's "prompt
  tokens" is another's "input tokens"; one's "completion" is another's
  "output". A name-based guesser must already contain a per-provider table
  — at which point it is per-provider extraction wearing a disguise.
- **Different nesting.** Usage may hang off the response root, or live
  under a usage-metadata object; cached-token counts may sit inside a
  nested details object rather than beside their siblings.
- **Casing duals within one provider.** A single provider's own SDK
  generations expose the same field in both snake-case and camel-case; an
  extractor must try both names for one fact, in a stated order.
- **Dict-or-object duality.** Depending on SDK version and transport, the
  "same" response is sometimes a typed object and sometimes a plain map;
  the field accessor must handle both without caring which.
- **Model identity lives in different places.** Some providers echo the
  model on the response root; others expose a versioned model field with
  its own naming duals.

A generic walker that guesses across all of this has a failure mode worse
than crashing: it *finds something*. A recognized-looking field with the
wrong semantics produces a plausible number, and a plausible wrong number
survives every downstream aggregate unchallenged.

## Construction rules

- **One extractor per provider family, a few lines each.** Each names the
  exact fields it reads, in fallback order for known duals. The extractor
  *is* the documentation of that provider's shape.
- **All extractors return the same tuple.** Normalization happens here,
  once, at the edge — everything downstream sees one shape.
- **The tuple carries one convention: inclusive totals with sub-counts.**
  Providers split on whether the input figure includes cache traffic — some
  report an inclusive total with the cached count as a subset detail, others
  report an exclusive count with cache reads (and premium-billed writes)
  beside it; the same split exists on the output side for reasoning tokens.
  The tuple's target, matching the prevailing cross-vendor telemetry
  convention, is inclusive: an extractor for an exclusive-reporting provider
  must **add** the sibling counters into its direction's total while still
  carrying them as sub-counts — never copy the exclusive figure into the
  inclusive slot. Pricing then consumes the sub-counts *by subtraction from
  the total*; storing an inclusive total and pricing a re-priced sub-count
  beside it without subtracting double-prices exactly the traffic engineered
  for reuse. Whether a given provider's figure is inclusive or exclusive is
  per-direction, per-provider knowledge — which is one more reason the
  extractor is per-provider by construction.
- **Missing optional facts stay null.** Cached-token counts are absent from
  older SDK responses and from providers without cache accounting; an
  absent count must survive as null into the event, never coerced to zero
  — zero claims "no cache hit," which is a measurement the wire never made.
- **Required facts default defensively, but visibly.** If a response
  carries no usage at all (a streaming path that skipped the final usage
  frame, an error response), record what is true — zeros for counts the
  provider genuinely reported as absent are still a claim; prefer recording
  the event with null usage or an error status over inventing counts.
- **Shared field-access helper, per-provider knowledge.** The mechanical
  part — "read the first present of these names from dict or object" —
  is one shared helper; only the *name lists and structure* are
  per-provider. This keeps extractors short without re-centralizing the
  guessing.

## The convention is checkable — so check it

A wrong-direction extractor is the failure this technique warns about in its
purest form: it produces a plausible number, and a plausible wrong number
survives every downstream aggregate unchallenged. Nothing about the record
looks broken. But the convention is not merely a naming agreement — it is an
**arithmetic invariant**, and an invariant can be asserted at the boundary
where the record is accepted:

> a sub-count never exceeds the total it is a sub-count of.

Under the inclusive convention that state is impossible; observing it is
proof that some extractor copied an exclusive figure into an inclusive slot.
It costs one comparison, it needs no knowledge of which provider produced the
record, and it is the only cheap detector of a convention violation there is.
Cache-heavy traffic makes it fire readily, because a warm prompt cache is
exactly where the cached figure overtakes the residual uncached one. Treat a
violation as a rejected or flagged record, not as something to repair: which
of the two counts is wrong is not knowable from the record.

Design the check knowing it is one-sided. A violation proves a broken
extractor; conformance proves nothing, because a merely *understated* total
stays inside the invariant. The assertion is a smoke alarm, not a ledger.

**Where the convention is violated, a subtracting pricer compounds it.**
Pricing consumes the sub-count by subtraction, so an exclusive figure landing
in the inclusive slot is not just missing its cache traffic: the subtraction
then removes the cached amount from a total that never contained it, and
bills the genuinely uncached portion as if it too had been cached. With a
saturating subtraction the residual reaches zero and the *entire* prompt
prices at the cached rate — the deepest possible under-bill, on the
workloads with the highest cache ratios, which are the ones most worth
billing correctly. The same understated total silently selects the wrong
row from any prompt-length price tier, in the same direction. This is the
mirror of the double-pricing hazard, and it is the quieter one: double
pricing produces an invoice somebody disputes, while this produces revenue
nobody misses.

## Selection and evolution

Dispatch to an extractor by the provider the caller already knows — the
wrapper knows which SDK it just called; never sniff the response shape to
decide which provider produced it. When a provider ships a new SDK
generation, extend that provider's name lists in fallback order; when a new
provider is onboarded, write its extractor from its documentation, not by
analogy to an existing one.

## When not to use it

This is a client-wrapper (sender-side) technique. On the server side of the
ingestion boundary, responses are already gone — the server sees events and
spans, where attribute-precedence-lists is the corresponding discipline. And
where a provider offers a genuinely stable, versioned usage schema you can
pin, the extractor reduces to a direct read — the technique's weight is
proportional to the shape diversity you actually face.
