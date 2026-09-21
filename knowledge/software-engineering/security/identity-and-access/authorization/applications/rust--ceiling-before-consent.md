---
layer: application
type: application
subject: authorization
technique: ceiling-before-consent
stack: rust
verified_on: 2026-09-17
verified_against: rust@1.80.0
applied: code
ab_verdict: better
---

# The pairing lane had no ceiling, and its own docs said it did

A desktop application pairs with browser surfaces through a pre-authentication
door: the page opens `pair?origin=…&scopes=…&nonce=…&name=…` (or `POST`s the
same body), the app raises an approval modal, and an approving click mints an
origin-bound, expiring key. The version witness is
`src-tauri/engine/Cargo.toml:8` "rust-version = \"1.80.0\"" — a source pin, and
the tree's own statement of the toolchain it requires.

The scope list in that request was stored verbatim
(`src-tauri/engine/src/pairing.rs:90-137`, `register`), rendered verbatim as the
modal's pre-checked checkbox list
(`src/features/settings/sub_api_keys/components/PairApprovalModal.tsx:57`,
`setScopes(new Set(current.requested_scopes))`), and minted verbatim by
`approve_pairing`
(`src-tauri/src/commands/credentials/external_api_keys.rs:149-169`). The
unattended path minted it with nobody looking at all
(`pairing.rs:231-250`, `auto_approve_headless`'s `scopes = requested_scopes.to_vec()`).

Nothing in that chain was a ceiling. The modal can uncheck a box and cannot add
one, so the set on offer was the requesting page's set, and one approving click
was the only thing between it and a grant.

## What the enforcement table says the request could ask for

The route gate (`src-tauri/src/engine/management_api.rs:456-548`, `authorize`)
reads three scope families that a paired browser origin must never hold:
`proxy`, which `authorize_credential_use`
(`src-tauri/src/engine/credential_broker.rs:93-116`) answers *every stored
credential* for; `proxy:credential:<id>` and `cred:<connector>:use`, which reach
one; and `personas:test`, which `management_api.rs:498-510` gates a
money-spending endpoint on with the comment that "the only keys that carry
`personas:test` are the ones the headless bridge minted itself". The
architecture document asserts the same invariant twice —
`docs/architecture/cloud-integration-bridge.md` "paired cloud keys never get"
the proxy scope, and "paired keys are persona-scoped and never get broad
`proxy`". Both sentences were true of intent and false of the code.

## A and B

The arms ran in a worktree, one filtered run of the repo's own Rust lane
(`node scripts/build/run-rust-tests.mjs --crates -- pairing::`), with the
assertions written before either arm.

- **A (as-is).** A request naming
  `proxy`, `proxy:credential:cred-1`, `cred:github:use`, `personas:test` and
  `bogus:not:a:scope` produced a pending view carrying all five, and the
  unattended path minted a real key whose `parsed_scopes()` returned all five
  plus the bridge's own marker. 3 of the 4 new assertions red, 9 of 12 green.
- **B (rule applied).** One ceiling — `is_pairable_scope` / `pairable_scopes` /
  `unpairable_scopes` — applied inside `register`, inside the unattended mint,
  and again as a loud refusal in `approve_pairing`. The same five-scope request
  yields an empty pending view, the unattended key carries only the marker the
  issuer adds on its own authority, and 13 of 13 tests pass.

Target: privileged or unrecognised scopes a requesting client can cause to be
minted onto its own key, 5 → 0. Floor: the scopes the fleet's real clients pair
with (`personas:read`, `personas:build`, `personas:execute:persona:<id>`) still
survive, the pre-authentication door still answers success when it drops a scope,
and the crate's existing tests are unchanged.

## What the falsifying seam refuted

The seam was chosen because it could kill the finding: if a legitimate paired
client needed a scope a server-owned ceiling had to refuse, the rule would be
wrong at the issuance stage. One does — a hiring bridge pairs with
`personas:build`, a privileged mutating scope — which refutes the strong form of
the rule ("a ceiling excludes privilege") and leaves the weaker, correct one:
the ceiling is a *declared set per lane*, and `personas:build` is inside the
pairing lane's while the credential-bearing family is not. The second refutation
is about provenance: the same tree's derived-handle mint
(`credential_broker.rs:130-160`) takes the resource id from its caller and
composes the handle's scopes itself, which is a caller-supplied request that
widens nothing — because the minter's own broad grant is the ceiling. Provenance
was never the defect; the missing ceiling was.
