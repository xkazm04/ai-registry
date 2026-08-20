---
layer: application
type: application
subject: multi-provider-event-normalization
technique: attribute-precedence-lists
stack: rust
status: forged
verified_on: 2026-08-20
---

# Rust: precedence-list span mapping in LightTrack

LightTrack's OTLP door maps OpenTelemetry GenAI spans onto its internal
`LlmEvent` in `crates/api/src/otlp/semconv.rs`. The module doc
(`semconv.rs:1-26`) opens with the technique's rationale verbatim: "The
conventions have churned (and three widely-deployed instrumentations predate
or extend them), so every field reads a *list* of accepted attribute names,
newest first" — and publishes the full field → attribute-precedence table as
a doc-comment table an operator can audit against the semconv changelog.

## The lists as code

Each internal field's list is a `const` slice, ordered newest-standard
first, then legacy semconv names, then the OpenLLMetry-style `llm.*` and
Vercel-style `ai.*` conventions (`semconv.rs:50-109`):

- `PROVIDER_KEYS`: `gen_ai.provider.name` (current), `gen_ai.system`
  (deprecated in semconv v1.37), `llm.provider`, `llm.system`,
  `ai.model.provider`.
- `INPUT_TOKEN_KEYS`: `gen_ai.usage.input_tokens`, then legacy
  `gen_ai.usage.prompt_tokens`, then `llm.token_count.prompt`,
  `llm.usage.prompt_tokens`, `ai.usage.promptTokens` — the same fact under
  five names spanning the standard's rename and two pre-standard
  ecosystems, including a camelCase dual.
- `CACHED_TOKEN_KEYS` / `REASONING_TOKEN_KEYS` cover the newer usage
  dimensions, including nested-details names like
  `llm.token_count.prompt_details.cache_read`.
- `COST_KEYS` (`gen_ai.usage.cost`, `gen_ai.usage.total_cost`,
  `llm.usage.total_cost`) is explicitly flagged "non-standard; when absent
  the price book prices the call" — a sender-supplied cost is honored,
  otherwise pricing stays server-side.

Reads go through `fs.first(KEYS)` in `map_span` (`semconv.rs:180-196`):
first present value wins, so a dual-emitting SDK (the
`OTEL_SEMCONV_STABILITY_OPT_IN` transition mode) deterministically resolves
to the current name. Optional dimensions use `.and_then(|v| v.as_u64())`
into `Option` fields — `cached_input` and `reasoning` stay `None` when no
listed name matched, never zero, and the explicit cost is filtered with
`.filter(|c| c.is_finite() && *c >= 0.0)` so an implausible value is
treated as absent rather than clamped.

## The deliberate hole in the table

`semconv.rs:21-22`: "`gen_ai.usage.total_tokens` alone is **not** mapped: a
total cannot be split into input/output without corrupting cost math, so
such a span is priced from whatever split it does carry." The precedence
lists include five names for input tokens and none for total tokens —
list membership is a semantic claim ("same fact"), not a convenience
("related number"), which is where this technique hands off to
refuse-to-derive.

## Provenance kept beside the normalization

`metadata_of` (`semconv.rs:334-372`) preserves the raw material under
`metadata.otel`: the raw system string (whichever provider key matched),
*both* model attributes (`gen_ai.request.model` and
`gen_ai.response.model`, since only one won the `MODEL_KEYS` race), the
instrumentation scope, response id and finish reasons. A wrong precedence
decision remains re-mappable from the stored event.
