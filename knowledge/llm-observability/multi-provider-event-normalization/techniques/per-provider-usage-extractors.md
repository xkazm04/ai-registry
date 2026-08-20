---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: per-provider-usage-extractors
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when: [writing a client wrapper that records usage from provider responses, reconciling divergent SDK response shapes, reviewing a generic usage parser for silent misses]
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
