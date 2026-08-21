---
layer: application
type: application
subject: llm-call-telemetry-model
technique: token-usage-quadruple
stack: process
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# Token accounting across the 2025–2026 provider generation (field survey)

A dated application of the technique to the layer that moves under it: what
the major provider APIs actually report per call, how the cross-vendor
telemetry standard normalizes it, and how the observability platforms model
it. Checked 2026-08-20; the class list and rates below are the fastest-moving
facts in this subject — re-verify by the frontmatter date.

## What the provider usage blocks report

- **OpenAI (Responses API).** `usage.input_tokens` / `usage.output_tokens`
  as **inclusive totals**, with `input_tokens_details.cached_tokens` (a
  subset of input, billed at the cached-input discount) and
  `output_tokens_details.reasoning_tokens` (a subset of output — reasoning
  is billed at the output rate, and the detail counter is the only place the
  hidden deliberation volume is visible). The response also echoes
  `service_tier` at the top level — the *served* lane, not the requested one.
- **Anthropic (Messages API).** `usage.input_tokens` **excludes** cache
  traffic; `cache_read_input_tokens` rides beside it at ~0.1× the input
  rate, and `cache_creation_input_tokens` is the field's clearest fifth
  class: a **premium-billed write** (~1.25× base for the 5-minute TTL, ~2×
  for the 1-hour TTL), with a `cache_creation` breakdown per TTL because the
  tier is what prices the write. Thinking tokens are simply included in
  `output_tokens`. `service_tier` is reported *inside* `usage`, with
  `standard` where others say `default`.
- **Gemini.** `usageMetadata` reports `promptTokenCount` (inclusive),
  `candidatesTokenCount`, `cachedContentTokenCount` (subset of prompt,
  ~0.25× input plus a per-hour storage charge that is not a token class at
  all), `thoughtsTokenCount` (reported **beside** the output counter but
  billed at the output rate), and `toolUsePromptTokenCount` — a reported
  class with *no distinct price* (input rate), i.e. one that does not clear
  the technique's counter bar.

Three vendors, three answers to subset-or-additive, two homes for the served
tier, and one premium-priced class the quadruple predates — the technique's
"resolve to ONE convention at ingest" clause is not hygiene, it is the whole
job.

## The normalization target

The OpenTelemetry GenAI semantic conventions settled the convention the
technique leaves to the schema: `gen_ai.usage.input_tokens` SHOULD include
**all** input token types (cached included), with
`gen_ai.usage.cache_read.input_tokens` and cache-creation counters as
sub-attributes — and the Anthropic-specific convention states outright that
Anthropic's exclusive counters MUST be *added* to compute the inclusive
total. Inclusive-totals-with-sub-counts is therefore the field's normalized
shape, and a normalizer emitting it must add, not copy, for
exclusive-reporting providers.

## The platform event models

Langfuse — representative of the platform generation — retired fixed token
columns for **arbitrary-keyed `usage_details` / `cost_details` maps**, with
model definitions carrying a price per usage type: the open-map end state
the technique names for platform scale. The failure modes the technique
predicts are on the platforms' own trackers as live bugs: cost computations
that ignore cached input, reasoning, and the cache-write premium; and
double-priced cache reads when an inclusive input total is stored as-is and
the cached sub-count is priced again beside it.

## Verdict against the technique

The quadruple's floor holds; its ceiling moved. Cache-write (with its TTL
tier) has cleared the distinct-price bar and belongs on any schema drawn
today; tool-use tokens have not; reasoning inherits the same
subset-or-additive resolution as cached input; and the served-tier echo
gives the pricing lane a provider witness. Totals-derived-never-stored and
absent-vs-zero survive contact unchanged — the platforms' own bug ledgers
are the evidence for what folding costs.
