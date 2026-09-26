---
layer: application
type: application
subject: dynamic-secret-lifecycle
technique: persist-before-provision
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
applied: simulation
ab_verdict: better
---

# Personas' API keys: an issuer that verifies its own credentials, where the handout is the effect

Personas' Rust backend mints the bearer tokens that authenticate its local
management HTTP API. Nothing is created in a remote system: the issuer and the
verifier are one SQLite table. That removes the Go tree's hard case (a remote
user with no lease) and exposes the one this technique had not named. When the
record *is* the credential, the effect that can fail after the write is the
**handout** of the plaintext. A row whose plaintext never reached a holder is a
live credential that nobody holds. Read at `900b8f0b4`, toolchain `1.96.1`.

## The store: record first, plaintext once

`src-tauri/db/src/repos/resources/external_api_keys.rs:59-106` generates the
token, hashes it, and `INSERT ... RETURNING *`s the row (line 85). Only then
does it return the plaintext (line 102). The table holds only the SHA-256 hash,
so the plaintext exists in exactly one place: whatever the caller does next
with the response. Lookup (`:148-182`) enforces revocation and expiry on every
request, and expiry is checked in Rust (`:169`, `ExternalApiKey::is_expired_at`
in `src-tauri/core/src/models/external_api_key.rs`). A malformed `expires_at`
counts as expired.

There is therefore no second life to fall out of step with. The expiry buffer
and the remote backstop from
[expiry-buffer-beyond-lease](../techniques/expiry-buffer-beyond-lease.md) have
nothing to act on. The row is lease and credential at once, and the lookup's
expiry check is the revocation at expiry. That is the case
[lease-vs-native-tracking](../techniques/lease-vs-native-tracking.md) excludes
(the relying party is the issuer), so the lease-or-native question does not
arise. Revoked and expired rows are kept for audit, and no sweep prunes them.

## Five mint paths, five handouts

| Path | Handout carrier | On handout failure |
|---|---|---|
| Operator key, `src-tauri/db/src/operator_key.rs:185-210` | a token file written atomically after the insert | **revokes the new row** (`:199-203`): "A key whose token nobody holds is litter at best; revoke it." |
| Attended pairing, `src-tauri/src/commands/credentials/external_api_keys.rs:163-202` | the in-memory pending map (`pairing::set_approved`, `:202`), claimed once by the browser | returns the error; the row stays active |
| Headless pairing, `src-tauri/engine/src/pairing.rs:304-348` | the same map (`:339`) | returns the error; the row stays active (1-day expiry, `:324`) |
| System key, `src-tauri/src/engine/management_api.rs:835-876` | a process-wide cache plus an env var set at boot | no failure branch; see the race below |
| Broker handle, `src-tauri/src/engine/credential_broker.rs:130-183` | the command's own response | none needed; the response *is* the handout, and the row expires in 5 to 1440 minutes |

The operator key applies the technique's third decision rule: the effect
succeeded and completing it failed, so revoke with the identity in hand and
error. The two pairing paths do not.

## Deviation: an approved pairing outlives its handout

The pending map is pruned by age from *registration*
(`pairing.rs:139-142`, `PAIRING_TTL` = 300 s at `:41`). The prune also drops
an entry that is `Approved { claimed: false }`, and the stashed token goes with
it. Three consequences:

- A browser that claims after the window, or never (a closed tab), leaves an
  active origin-bound key behind. An attended approval with no
  `expires_in_days` (`external_api_keys.rs:187-189`) never expires.
- `pending_origin` (`pairing.rs:234-242`) does not check age or prune, so an
  approval that arrives after the window still mints. The next `claim` then
  prunes the entry, and that key's claim is guaranteed to fail.
- `set_approved` failing after the insert (`:248`, "no such pending pairing")
  returns an error to the approver and leaves the key live.

In every case the key is visible in Settings under "Paired: <origin>", so it is
not invisible. But nothing revokes it, and the credential's lifetime is set by
the operator's attention, not by the issuer.

## Deviation: the system key's check-then-mint is not atomic

`get_or_create_system_api_key` reads the cache under the mutex and releases it
(`management_api.rs:837-842`). It then revokes every enabled `system` row
(`:844-850`), inserts a fresh one (`:856`), and re-takes the mutex, preferring
a value another thread stored (`:870-874`). The doc comment says "only the
first one through actually mints". That is true only when the calls do not
overlap. Boot mints from `spawn_blocking` (`src-tauri/src/boot/finalize.rs:41-64`)
while the frontend's privileged `get_system_api_key` command and the runner
(`src-tauri/src/engine/runner/mod.rs:1766`) call the same function.

An interleaving model of the two concurrent first calls counted the outcomes of
all 70 orderings of their four steps. Script: this run's scratch, not
committed; it models the order of operations above and nothing else.

- **As written:** 60 of 70 leave a live, never-expiring, `proxy`-scoped key
  that no holder has. The next boot's revoke loop reaps it.
- **As written:** 24 of 70 leave the cache holding a token the other call
  already revoked. The desktop's own management API calls then return 401
  until restart.
- **Mutex held across the mint:** 0 and 0.

The counts are orderings, not probabilities: the overlap window is a few
milliseconds at startup.

## Revocation, for the record

`revoke` (`external_api_keys.rs:184-199`) filters on `id` only, so a second
revoke of a revoked key succeeds and **re-stamps** `revoked_at`, overwriting
the first revocation instant. A missing row is `NotFound`. That is harmless for
the UI's single click. For a caller that retries, it is the non-idempotent
revoke that [idempotent-revoke-and-give-up](../techniques/idempotent-revoke-and-give-up.md)
names. `delete` (`:321-330`) is a hard delete and its command writes no audit
row, where `revoke` does (`external_api_keys.rs` command, `:70-82` vs `:87-94`).

## Applied

Mode: simulation over three real seams and two controls, read in the tree
above. The rule is the one the technique gained in this pass: when the record
is the credential, a failed or expired handout revokes the record.

- Stale approved pairing: an orphan key as written; revoked on prune with the rule.
- Approval after the window: an orphan key as written; refused before the insert with the rule.
- System-key overlap: 60/70 orphans and 24/70 revoked caches as written; 0/0 with the rule.
- Controls: the operator key already complies, and the broker handle's handout
  is its own response.

Verdict: `better`. Code mode was not reached. These seams live in the app and
engine crates, and the change owes a `cargo test` over both. The return
condition is a Personas session with a warm target directory.
