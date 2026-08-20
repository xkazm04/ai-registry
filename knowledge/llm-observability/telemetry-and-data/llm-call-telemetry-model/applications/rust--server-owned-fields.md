---
layer: application
type: application
subject: llm-call-telemetry-model
technique: server-owned-fields
stack: rust
status: forged
verified_on: 2026-08-20
---

# Server-owned fields in LightTrack (Rust)

LightTrack's ingest realizes the technique at two layers — the serde
boundary of the record type and the one shared preparation function — so
ownership holds even for a code path that forgets to call the stamp.

## The type enforces it before any handler runs

`LlmEvent` (`crates/core/src/event.rs:108-174`) declares `received_at` as
`#[serde(skip_deserializing, default = "Utc::now")]` (`event.rs:136-137`):
a client that includes `received_at` in the body changes nothing, but the
field always serializes on reads. The doc-comment (`event.rs:125-135`)
states the whole doctrine — client-owned `ts` for debugging, server-stamped
`received_at` for "every windowed accounting read (limit admission,
`/v1/limits/status`, the forecast daily series)" — and the migration
sentinel: pre-column rows carry `received_at = ts`. The unit test
`received_at_is_server_owned_and_ignores_the_client` (`event.rs:275-292`)
is the from-the-outside specification: it deserializes a body with both
timestamps set to 2000-01-01, asserts `ts` round-trips while
`received_at.year() > 2020`, then asserts the field still serializes out.

## One door stamps everything

`prepare_event` (`crates/api/src/events.rs:31-67`) is the single function
both the single-event and batch paths share, and its doc-comment names
itself as "where server trust is established". In order it sets
`ev.project_id` from the authenticated project, `ev.received_at = now`,
canonicalizes trace/span ids (`normalize_ids`, `events.rs:74-80` — the fix
for one logical trace splitting in two when an OTLP emitter lower-cased hex
ids and an SDK did not), then calls `stamp_api_key`, validates, redacts,
prices, and stamps cost provenance.

## Stamp-and-strip, literally

`stamp_api_key` (`events.rs:94-113`) is a four-arm match that implements
both halves. With an authenticated key, `metadata.api_key_id` is inserted,
overwriting any client value; with **no** key behind the request
(admin/dev principals), the client-sent `api_key_id` is *removed* — the
doc-comment (`events.rs:82-93`) states the attack this closes: a caller
writing `{"api_key_id": "<the-other-key>"}` could "launder its spend onto
another key's budget or dodge its own per-key cap". Null metadata is
upgraded to an object when there is a key to stamp; non-object metadata
(a client-owned scalar/array) is left alone — it "can hold no `api_key_id`
to forge". What is persisted is the opaque `api_keys.id`, "not the
presented token, not its prefix, not a hash of it" (`events.rs:91-93`);
pre-existing rows carry no id and fall into the unattributed bucket. The
accessor `api_key_id()` (`event.rs:214-224`) restates the server-owned
contract at the read side.

## Cost provenance is the server's verdict

`prepare_event` records `client_supplied = ev.cost_usd.is_some()` *before*
`ensure_cost` fills from the price book (`events.rs:60-65`), then
`mark_cost_source` (`events.rs:118-132`) stamps `"client"` or `"book"` —
and stamps nothing when no cost resolved, keeping the unpriced-means-`None`
invariant self-consistent (`event.rs:194-207`). The docs anchor the same
contract for consumers: `docs/DATA_MODEL.md:17` documents `received_at` as
"server-stamped, never read from the request body", with the rationale that
budgets measured on client `ts` would let "a single wrong clock silently
corrupt enforcement".
