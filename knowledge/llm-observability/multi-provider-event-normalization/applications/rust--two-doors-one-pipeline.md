---
layer: application
type: application
subject: multi-provider-event-normalization
technique: two-doors-one-pipeline
stack: rust
status: forged
---

# Rust: LightTrack's two front doors on one batch handler

LightTrack (axum API crate) ingests through exactly two doors
(`docs/ARCHITECTURE.md:45-54`): `POST /v1/events` — simple JSON from a
~30-line client wrapper per language — and `POST /v1/traces` — OTLP/HTTP
JSON using the OTel GenAI semantic conventions, for apps already
instrumented with OpenTelemetry (the anti-lock-in lever: no LightTrack SDK
needed, just an exporter endpoint). The architecture doc states the
invariant in one sentence: "Mapping is *all* this door does — the mapped
events go through the same batch handler as (1), so validation, redaction,
pricing and limit admission are identical." Scope is stated as narrowly as
it is implemented: gRPC/protobuf OTLP and the metrics/logs signals are not
accepted.

## The door adjudicates nothing — with one mapping-scoped exception

The OTLP mapper (`crates/api/src/otlp/semconv.rs`) exercises exactly one
kind of policy: accept/refuse/translate. `map_span`
(`semconv.rs:112-133,192-216`) refuses a span carrying no
`gen_ai.*`/`llm.*`/`ai.model.*` namespace with the stable code
`"not_genai"`, and a GenAI span with no model attribute with
`"bad_request"` — door-specific policy kept inside the mapping decision,
never a divergent copy of a shared pipeline stage. Pricing, limits, and
storage appear nowhere in the module.

## Shared stages, called not copied

Two details show the "shared function, both doors" discipline:

- **Clock re-stamping is central.** The mapper fills `received_at` with a
  placeholder and says so (`semconv.rs:167-170`): "`prepare_event`
  re-stamps `received_at` from the server clock for every event, this door
  included. An OTLP export's spans carry their own (client) start times,
  which is exactly the clock windowed accounting must not trust." Client
  start times survive only as `ts` and latency input.
- **Id canonicalization is one function.** `nonempty`
  (`semconv.rs:232-238`) routes every trace/span reference through
  `lighttrack_core::normalize_trace_ref` — "the same one the native door
  applies in `events::prepare_event`. One function, both doors: an OTel
  service and an SDK service in a single end-to-end trace now land on the
  identical `trace_id` instead of two case variants." The comment records
  an actual incident class: a re-implemented canonicalizer had split
  mixed-instrumentation traces by case.

Downstream of the shared handler, event identity is span-derived
(`semconv.rs:218-229`): `"<traceId>-<spanId>"`, deterministic "so a
retried OTLP export replays into the existing duplicate-acknowledgement
path instead of double-counting" — idempotence living once, in the shared
path, rather than per door.

## The pipeline as the enforcement point

Because both doors converge before admission, the usage-limit check
(ingest-time 429 for a breaching event, `ARCHITECTURE.md:59-62`) cannot be
routed around by choosing the other door — the property the technique
exists to guarantee. The client wrappers on the native door are the
subject's per-provider-usage-extractors
(`clients/python/lighttrack/client.py:59-80`): three extractors, one per
provider family, each returning the same `(model, input, output, cached)`
tuple into the same event shape the OTLP door produces.
