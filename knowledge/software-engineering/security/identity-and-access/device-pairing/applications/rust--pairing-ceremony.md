---
layer: application
type: application
subject: device-pairing
technique: pairing-ceremony
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.80.0
---

# The cloud-origin pairing ceremony on the backend

The repo's fullest ceremony is the cloud-app pairing in
`src-tauri/engine/src/pairing.rs` plus the mint gate in
`src-tauri/src/commands/credentials/external_api_keys.rs:148-215`. Two
entry doors — a `personas://pair` deep link
(`register_from_deep_link`, `pairing.rs:388-414`) and
`POST /pair/request` on the loopback server (`:445-494`) — converge on one
pending store through one registrar (`register`, `:149-211`), exactly the
one-door discipline.

## The pending store, by the book

- **Entropy floor**: `MIN_NONCE_LEN = 16` (`pairing.rs:43`); a shorter
  nonce is refused at registration (`:155-157`, pinned by the test at
  `:554-557`).
- **Bounded**: `MAX_PENDING = 32` (`:45`); the cap refuses *new* nonces
  only (`map.len() >= MAX_PENDING && !map.contains_key(nonce)`, `:191`).
- **Expiring**: `PAIRING_TTL = 300` seconds (`:41`), pruned on every store
  access (`prune`, `:139-142`, called in `register`, `list_views`, `claim`).
- **Resolution-stable**: a re-registration under an already-resolved nonce
  returns the existing view instead of resetting to pending
  (`:177-190`) — the comment names the exact failure this prevents: a
  benign double-submit "would otherwise discard an already-minted,
  unclaimed token and hang the app's claim poll indefinitely."

## Channel-stamped identity, not payload identity

`handle_pair_request` takes the origin from the request's `Origin` header
— "NOT a body field, so a page can only ever pair itself"
(`pairing.rs:435-457`). An empty origin is a 400 before registration runs.
The deep-link door necessarily trusts its query parameters for *metadata*
(origin, scopes, name — `:390-412`), which is acceptable because the
record it creates still mints nothing and the claim is origin-checked
later; the credential never rides the deep link (see the
token-binding application).

## The mint gate is one privileged command

Nothing in the engine module can mint. `approve_pairing`
(`external_api_keys.rs:148-157`, `#[requires(privileged)]`, body in
`approve_pairing_core`, `:162-215`) is the only
transition from pending to credential:

1. resolves the pending origin (`pairing::pending_origin`) — a nonce that
   is unknown or already resolved is a `NotFound`, so approve cannot
   re-fire (`:169-171`);
2. stamps a **server-authoritative expiry** — the UI picks a window, the
   backend computes the absolute timestamp, "rather than trust the client
   clock" (`:186`; the quoted comment now sits only at key creation, `:27-30`);
3. mints via the same repo door every external key passes through
   (`repo::create` with `Some(origin)` — the origin binding, `:188-195`);
4. warms the live CORS allowlist (`management_api::add_paired_origin`,
   `:199`) and stashes the plaintext for the single-use claim
   (`pairing::set_approved`, `:200`);
5. writes the audit row (`settings_audit_log::insert` with action
   `"pair"`, now through the `audit_pairing` helper, `:213`, `:219-232`).

`reject_pairing` (`:247-252`, body in `reject_pairing_core`, `:236-244`) resolves the record so the requester's poll
gets a definite 403; `list_pending_pairings` (`:135-141`) is the
missed-signal safety net the approval surface queries on mount.

## Deviation worth carrying

The ceremony's scopes are narrowed by the human but validated against no
scope registry at mint — `approve_pairing` passes the modal's strings
straight to `repo::create`. The authorization subject's scope vocabulary
(`docs/concepts/paths/authorization/techniques/scope-design.md`) is the
missing consumer; an unrecognized scope should refuse at the mint gate,
not surprise at enforcement time.

Re-checked 2026-10-31 at personas@22260d77c9: **this deviation is resolved.**
The pairing lane now carries a scope ceiling (`PAIRABLE_EXACT` /
`PAIRABLE_PREFIXES`, `is_pairable_scope`, `src-tauri/engine/src/pairing.rs:47-78`).
`register` intersects the requested list with it before anything reaches the
approval modal, logging (never answering) what it dropped (`:161-174`), and
`approve_pairing_core` refuses loudly with `AppError::Validation` when a scope
outside the ceiling is presented at the mint (`external_api_keys.rs:173-184`). It
is a lane ceiling rather than the full scope registry, but an unrecognized scope
now refuses at the mint gate. Two further changes bear on "the mint gate is one
privileged command": the same `approve_pairing_core` is also reached from the
operator API (`POST /api/pairings/{nonce}/approve`,
`src-tauri/src/engine/management_api/operator.rs:442`), and with the headless
bridge test mode on, `handle_pair_request` approves on the spot and mints inside
the engine module itself (`auto_approve_headless`, `pairing.rs:304-348`, applying
the same `pairable_scopes` mould). "Nothing in the engine module can mint" no
longer holds when that mode is enabled; in the attended path it does.
