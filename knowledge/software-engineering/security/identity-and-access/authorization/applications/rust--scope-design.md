---
layer: application
type: application
subject: authorization
technique: scope-design
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80.0
---

# Scope design across the management API and credential broker

The scope vocabulary lives as named constants with documented meanings in
`src-tauri/src/engine/management_api.rs:373-399`: broad `personas:execute`,
`personas:build`, `proxy`, and the hierarchical per-resource forms
`personas:execute:persona:<id>` and `proxy:credential:<id>` — the
`domain:action[:instance]` shape the technique prescribes, with the doc
comments stating *which gate checks each* (the credential proxy is
deliberately gated on its own scope, not `personas:execute`, because it
injects stored secrets: `:378-381`, `:547-551`).

## The matrix and the coarse/fine two-step

`authorize` (`management_api.rs:536-684`) is the per-route matrix: build
routes demand `personas:build` including status reads (`:544-545`, `:597-603`, "a key
without build scope can neither inspect nor drive builds"), proxy routes
accept broad `proxy` OR the exact per-credential grant OR any
per-connector grant as a **coarse pre-filter** (`:614-633`) — with the
comment explaining that the exact connector match needs a DB read, so the
proxy handler re-checks with the default-deny kernel before any secret is
resolved. That kernel is `authorize_credential_use`
(`src-tauri/engine/src/credential_broker.rs:93-116`): exact match only
("no substring, no case folding — a mismatch must deny", `:89-92`; pinned
by tests that `cred-1` does not authorize `cred-10` and `GitHub` does not
match `github`, `:222-243`), and it returns **which grant authorized** —
the `BrokerGrant` enum (`:48-68`), recorded in the audit detail "so 'who
could do what, and why' is reconstructible from the ledger" — the
reason-not-boolean shape.

The second half of the intersection runs inside the door:
`scope_enforcement::evaluate` (`src-tauri/engine/src/scope_enforcement.rs:117-215`)
checks the request path's captured resource id against the credential's own
pins, completing caller-key grants ∩ credential resource pins.

## Fail-closed parsing, absent ≠ corrupt

- A key row's scope column parses through `parsed_scopes`, which fails
  closed to an empty vec on corruption — "a malformed row authorizes
  nothing scope-gated" (`management_api.rs:564-565`), and the kernel's doc
  states that empty scope lists authorize nothing
  (`credential_broker.rs:90-92`).
- A *non-empty but unparseable* resource-pins blob errors rather than
  silently widening to broad scope (`scope_enforcement.rs:133-143`, with
  the rationale comment); an empty/`{}`/`null` blob is the legitimate
  "broad" state (`:129-141`) — the empty list means what it was reviewed
  to mean, and corruption does not inherit it.
- Corrupt enforcement-mode metadata resolves to `Block`, distinct from the
  absent-metadata default `Warn` (`EnforcementMode::from_metadata`,
  `:47-67`) — absent and corrupt resolve differently, exactly the
  technique's demand.

## Minimization and issuance discipline

Issued keys carry an explicit scope list and server-authoritative expiry
(`src-tauri/src/commands/credentials/external_api_keys.rs:19-57` — the
backend stamps the absolute timestamp "rather than trust the client
clock"). Grants are effectively immutable: narrowing is mint-narrower +
revoke (`revoke_external_api_key`, `:66-82`), matching the technique's
note that immutable records are fine so long as narrowing stays cheap.
Grant issuance is itself scoped: minting derived broker handles demands
broad `proxy`, and "a derived handle must never be able to mint further
handles" (`management_api.rs:604-612`). The pairing ceremony mints
**origin-bound, scoped, expiring** keys whose plaintext is claimable
exactly once and only by the approved origin
(`src-tauri/engine/src/pairing.rs:6-19`, `:359-381`) — the ceremony itself
belongs to the device-pairing subject; the scope vocabulary the minted key
carries is this one.

## Denials name the missing side

Every arm of the matrix returns a self-naming reason string
(`"api key lacks the personas:build scope"`, `:601`; per-credential and
per-persona variants at `:631`, `:663`), and the middleware logs scope
denials distinctly from authentication failures
(`management_api.rs:731-746`) while holding only id, display name, and
parsed scopes — never token material (`:686-695`).

Re-checked 2026-10-31 at personas@22260d77c9: the constant block has grown two
members since this was written: `personas:test` (`SCOPE_TEST`, minted only by
the headless bridge and demanded only by `/api/kp/test/*`) and
`personas:approve` (`SCOPE_APPROVE`, held only by the file-delivered operator key
and declared never pairable), each with the same doc-comment naming its gate
(`management_api.rs:383-386`, `:395-399`). The pairing lane now also has its own
declared ceiling over this vocabulary (`src-tauri/engine/src/pairing.rs:47-102`).
Both extend the shape described here; nothing above is reversed.
