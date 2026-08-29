---
layer: application
type: application
subject: ipc-contract
technique: error-shape-mapping
stack: rust
verified_on: 2026-08-29
verified_against: rust@1.97
---

# The error envelope on the Rust side of a Tauri boundary

The repo (a Tauri 2.11 desktop app, React 19 front end) is a full instance of
the technique's envelope — and, in one guard that sits in front of the
handlers, a live instance of the second-emitter defect the technique names.

## The envelope, emitted on purpose

Every fallible command returns `Result<T, AppError>`
(`src-tauri/core/src/error.rs:5-9`). Tauri only requires `Serialize` on the
error, and the default derive would have serialized the enum's *variants*;
instead the repo hand-writes the `Serialize` impl (`error.rs:153-224`) so
that every variant crosses in one fixed shape:

- `error` — the message, run through `sanitize_error_message`
  (`error.rs:139-150`) for the variants that can carry OS paths (`Database`,
  `Io`, `Internal`), so file paths become `<path>` before the wire. The
  technique's "internals refuse to cross", applied by variant.
- `kind` — a closed snake_case vocabulary written out per variant
  (`error.rs:174-198`), mirrored by hand on the near side as the
  `TauriErrorKind` union (`src/lib/types/tauriError.ts:20-42`).
- `category`, `auto_fixable`, `failover_eligible` — added 2026-07 "one
  taxonomy across the FFI" (`error.rs:199-207`). `category` comes from
  `AppError::category()` (`error.rs:100-136`), which maps typed variants
  directly and runs only the three string-passthrough variants
  (`Internal`, `External`, `RetryExhausted`) through the shared
  `classify_error` ladder. The two booleans are computed once, backend-side,
  so no consumer re-runs a classifier to decide retryability.
- `details` — the optional structured payload, emitted for exactly one
  variant today: `AuthorizationRequired { credential_id, tool_name,
  authorize_url }` (`error.rs:57-77`, serialized at `error.rs:208-219`). The
  doc-comment records why it is typed rather than prose: the front end
  drives a consent modal from `authorize_url` "without parsing the error
  message". `DeviceGroupConflict` (`error.rs:79-91`) is the same argument
  made for a refusal: typed "so the pairing UI can recognise the refusal
  (kind `device_group_conflict`) and render the remedy".

`ErrorCategory` itself is a `#[ts(export)]` enum with
`#[serde(rename_all = "snake_case")]` (`src-tauri/core/src/error_taxonomy.rs:22-26`),
so the *category* vocabulary crosses through the same generator as the data
shapes — the technique's "same generation machinery" clause. The `kind`
vocabulary does not: it is a string table in the `Serialize` impl and a
hand-written union on the other side, two authorities kept aligned by
reading.

## The mirrored classifier, and how the mirror is held honest

The string ladder `classify_error` (`error_taxonomy.rs:141`) exists twice —
in Rust and as `classifyError` in `src/lib/errorTaxonomy.ts` — because the
near side must classify errors that never came through the envelope (CLI
stderr, third-party rejections). Two ladders are two authorities, and the
repo's answer is a **parity fixture list duplicated byte-for-byte on both
sides** (`src/lib/errors/__tests__/errorTaxonomy.parity.test.ts:4-12`;
`error_taxonomy.rs:764`): every fixture string must classify to the same
category in both languages, and the test comment states the guarantee this
buys — "whatever the backend classified a raw string as, the TS fallback
ladder would classify it the same way." It is not one authority; it is two
authorities with a witness, which is the honest fallback when the ladder
genuinely has to run on both sides.

## The near-side door

`classifyErrorFull()` in `src/lib/errors/errorPipeline.ts:1-11` is the
single mapping door: taxonomy (category, severity, retryability) plus
registry (user-facing message and suggestion) plus explanation (UI guidance)
in one pass, replacing "three independent classifiers on the same string".
The registry it composes (`src/lib/errors/errorRegistry.ts`) is the
technique's quarantined legacy fallback — pattern rules over raw strings,
one of which (`errorRegistry.ts:135`, `match: 'Forbidden'`) exists because
of the defect below.

## The second emitter (live defect, 2026-08-29)

> **Resolved 2026-08-29 (personas commit `75cee6315`).** The guard now
> constructs its rejection through `AppError` and serializes it, so the
> refusal crosses in the envelope — kind `forbidden`, with `category` —
> and the consumer branches on `kind`. The text below is kept as the
> dated specimen of the defect.

`ipc_auth::wrap_invoke_handler` (`src-tauri/src/ipc_auth.rs:602`) wraps the
whole dispatch table and rejects privileged commands whose session token is
missing or wrong — *before* any handler runs. Its rejection is a hand-built
JSON object, not an `AppError`:

```rust
invoke.resolver.reject(serde_json::json!({
    "error": "IPC authentication failed: invalid session token",
    "kind": "Forbidden"
}));                                              // ipc_auth.rs:634-637
```

`"Forbidden"` is not in the `kind` vocabulary — the envelope spells it
`"forbidden"` (`error.rs:189`) — and the object carries no `category`, so
the near side's `isTauriError` guard sees a shape that half-matches. The
consequence is exactly the technique's prediction: the wrapper's one-shot
auth retry decides by **substring**, `isIpcAuthFailure` probing for
`"IPC authentication failed"` in the message
(`src/lib/tauriInvoke.ts:536-551`, with the comment "so we match on either
the explicit message string or the JSON-stringified payload"). A guard in
front of the handlers is an emitter of errors; this one emits from a private
vocabulary, and the consumer branched on prose to cope. The fix is one line
of direction, not code: construct the rejection through `AppError::Auth` (or
`Forbidden`) and serialize it, so the guard and the handlers share the
envelope and the retry can branch on `kind`.
