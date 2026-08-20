---
layer: application
type: application
subject: multi-provider-event-normalization
technique: per-provider-usage-extractors
stack: process
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# The inclusive-vs-exclusive matrix across the 2025–2026 provider SDKs

A dated application of the extractor discipline to the fact that makes it
non-optional: the major providers do not agree on whether a direction's
headline counter *includes* its sub-classes. Checked 2026-08-20 from the
providers' documented response shapes; this is the fastest-drifting fact in
the subject — re-verify by the frontmatter date.

## The matrix (per direction, per provider)

| Provider | Input side | Output side |
| --- | --- | --- |
| OpenAI (Responses / Chat Completions) | **Inclusive.** `input_tokens` / `prompt_tokens` contain cached tokens; `*_tokens_details.cached_tokens` is a subset breakdown | **Inclusive.** `output_tokens` contains reasoning; `output_tokens_details.reasoning_tokens` is a subset |
| Anthropic (Messages) | **Exclusive.** `usage.input_tokens` excludes cache traffic; `cache_read_input_tokens` and premium-billed `cache_creation_input_tokens` ride beside it and must be **added** | **Inclusive.** Thinking tokens are simply inside `output_tokens` |
| Gemini | **Inclusive.** `promptTokenCount` contains `cachedContentTokenCount` (subset) | **Exclusive.** `thoughtsTokenCount` is reported *beside* `candidatesTokenCount`; the total is prompt + candidates + thoughts |

The matrix is per-direction, not per-provider: Gemini is inclusive on input
and exclusive on output; Anthropic the reverse. No shape-sniffing generic
walker can know this — it is documented-response-shape knowledge, which is
the extractor-per-family argument in one table.

## The normalization target

The OpenTelemetry GenAI semantic conventions settled the target:
`gen_ai.usage.input_tokens` SHOULD include **all** input token classes, with
cache-read/cache-creation counters as sub-attributes — and the
Anthropic-specific convention states outright that Anthropic's exclusive
counters MUST be added to produce the inclusive total. So the extractor
consequences are:

- **OpenAI:** copy both directions; carry the detail counters as sub-counts.
- **Anthropic:** input = `input_tokens + cache_read_input_tokens +
  cache_creation_input_tokens`; carry all three raw counters (the write
  counter with its TTL tier — the tier is what prices it).
- **Gemini:** output = `candidatesTokenCount + thoughtsTokenCount`; carry
  the thoughts counter as a sub-count.

## The double-pricing hazard

The failure mode is live on observability platforms' own bug trackers:
store an inclusive input total, then price the cached sub-count at the
cache-read rate *beside* the full total priced at the input rate — the
cached tokens are billed twice. Correct pricing subtracts:
`(input_total − cached_read) × base_rate + cached_read × cache_rate`, with
cache-write counters priced at their premium on top. The dual hazard for
exclusive reporters is the silent under-count: copying Anthropic's
`input_tokens` into the inclusive slot deletes the cache traffic — usually
the majority of a cache-engineered workload's input volume — from every
downstream total.
