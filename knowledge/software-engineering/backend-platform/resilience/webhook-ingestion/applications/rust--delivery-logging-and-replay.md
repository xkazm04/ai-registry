---
layer: application
type: application
subject: webhook-ingestion
technique: delivery-logging-and-replay
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80
---

# Delivery logging and replay in the Rust webhook receiver

The record: `webhook_request_log`, written by `handle_webhook`
(`src-tauri/src/engine/webhook.rs:292-331`) into
`src-tauri/db/src/repos/resources/webhook_log.rs`. The replay door:
`replay_webhook_request` (`src-tauri/src/commands/tools/triggers.rs:1824`).
The export: `webhook_request_to_curl` (`:1890`).

## Every delivery, verdict attached (`webhook.rs:314-328`)

`handle_webhook` splits processing from logging so the log write happens
**regardless of outcome**: `process_webhook` returns `(status, headers,
response)`, and the log row records method, serialized headers, status code,
the response body, the minted `event_id` when admitted, and `error_message`
when refused. Rejected deliveries — 404 unknown trigger, 401 bad signature,
403 secretless, 429 rate-limited, 422 outside the active window — all land
in the same table as accepted ones. That is the standard's "record accepted
and rejected alike" clause implemented at the one chokepoint both share.

## Retention: the writer enforces the reaper (`webhook_log.rs:40-85`)

`create` inserts the row, then every 10th insert prunes the trigger's log to
its 100 newest rows (`:73-82`, an atomic counter amortizes the DELETE off
the hot path). The component that writes is the component that reaps — the
bound is code, not a hoped-for cron. Probabilistic enforcement means the cap
can transiently sit at ~110; for a debugging record that slack is a
reasonable trade, and the constant and cadence are both visible in the one
function a reader would check.

## Replay re-earns admission (`triggers.rs:1839-1867`)

`replay_webhook_request` is the standard's strongest replay shape: it does
not call the handler, it **re-enters through the live endpoint** —

```rust
// triggers.rs:1791 (now :1840-1844; see the re-check below)
let url = format!("http://localhost:9420/webhook/{}", log_entry.trigger_id);
// :1798-1808 (now :1849-1861) — re-sign the recorded body with the CURRENT secret
mac.update(body_bytes.as_bytes());
req = req.header("x-hub-signature-256", format!("sha256={sig}"));
```

— so a replayed delivery passes bounds, mandatory HMAC verification, rate
limiting, and the active-window gate exactly as live traffic does, and its
own log row is written by the same `handle_webhook`. No bypass switch exists
in the door; the replay authority is expressed as possession of the trigger's
secret (read server-side, behind `require_auth`), not as a
"skip-verification" flag. This is the one-door discipline working.

(The hardcoded `localhost:9420` rather than `webhook_port()` is one of the
eight address literals `docs/concepts/golden-paths/inbound-endpoint-surface.md`
§0.4 catalogues — an address-authority defect, tracked there, not a replay
defect.)

## The deviation: redaction and replay collided (`webhook.rs:299-310` vs `triggers.rs:1839`)

A hardening pass redacts the **body** at write time:

```rust
// webhook.rs:306-310
let body_for_log = if body_str.is_empty() { None } else {
    Some("[redacted: see encrypted persona_event payload]".to_string())
};
```

The reasoning is sound (inbound payloads carry third-party secrets; the
durable copy lives encrypted on the `persona_event` row). But
`replay_webhook_request` still reads `log_entry.body` (`:1839`) — so for any
delivery logged after the redaction change, replay re-signs and re-delivers
**the redaction marker string**, mints an event whose payload is
`{"raw":"[redacted: …]"}`, and reports success. `webhook_request_to_curl`
(`:1927-1934`) exports the same placeholder as `-d`. The feature did not
break loudly; it silently began replaying the mask — the exact failure the
technique's "redaction and replay are one decision" rule names. The
standard-compliant repair is mechanical: replay resolves the payload from
the encrypted `persona_event` row the redaction marker itself points at, or
refuses with "payload redacted".

Second, smaller gap on the same axis: **headers are logged verbatim**
(`serialize_headers`, `webhook.rs:280-289`) — including the signature header
and anything token-shaped a sender includes. Body redaction shipped; header
redaction did not. The write-time-redaction rule is half-applied, and the
half that remains is the half `webhook_request_to_curl` re-emits into
copy-pasteable shell commands.

## Corroborating record state

The legacy corpus sweep (`inbound-endpoint-surface.md` §6, measured
2026-08-17 against the live database) found `webhook_request_log` at **0
rows** and zero webhook-type triggers configured — the machinery above is
complete and unexercised. The redaction/replay collision has therefore never
fired in production; it is latent, which is precisely when a deviation is
cheapest to fix.

Re-checked 2026-10-31 at personas@22260d77c9. Two of the findings above have
changed. **Headers are now redacted at write time, which reverses the
"half-applied" gap**: `serialize_headers` delegates to
`personas_engine::webhook_ingest::headers_for_log`
(`src-tauri/engine/src/webhook_ingest.rs:41-64`), which keeps every header name
and replaces credential-bearing values (`authorization`, tokens, signatures,
cookies) with a marker, so the curl export no longer re-emits them. The
`localhost:9420` literal is gone: replay and the curl export build their URL
from `local_webhook_base_url()` (`triggers.rs:1262-1267`, over
`webhook_port()`). The main deviation still holds: replay re-signs and sends
`log_entry.body` (`:1839`), which for any non-empty delivery is still the
redaction marker, and the curl export still emits it as `-d`.
