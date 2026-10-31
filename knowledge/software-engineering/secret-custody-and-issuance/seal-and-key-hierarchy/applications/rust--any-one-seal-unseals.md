---
layer: application
type: application
subject: seal-and-key-hierarchy
technique: any-one-seal-unseals
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1
applied: simulation
ab_verdict: better
---

# Personas' master key: two custodies of one root, and a policy that governs only one of them (Rust, desktop)

Personas' Rust core seals every stored credential field under one 32-byte
master key. `src-tauri/core/src/crypto.rs`, read at `5d2ac437e`, toolchain
`1.96.1`; anchors re-checked at `22260d77` on 2026-10-31. The key has no keyring above or below it: `get_cipher`
(`:1251-1267`) builds one AES-256-GCM cipher straight from it, and
`encrypt_for_db` (`:1271-1283`) seals under it with a fresh 12-byte nonce. So
in this tree the root *is* the data key, and the only part of the hierarchy
present is the seal layer. That layer has two custodies, and reading it as
the technique's N-seal form finds the gap the credential vault's own
application does not name.

## Two seals, both written, one declared

`try_keychain` (`:581-630`) is the primary custody: the OS keychain entry
`personas-desktop / credential-master-key`, holding the key base64-encoded.
The second custody is a local file, `master.key` in the app-data directory
(`local_fallback_key_path`, `:666-672`), holding the same key wrapped by
DPAPI on Windows and, elsewhere, by AES-256-GCM under a key derived with
HKDF from a random `local.secret` file in the same directory plus the
machine id and uid (`derive_unix_local_key`; `machine_secret_path`,
`:1005-1012`).

The file is not only a fallback. On a first run, when the keychain has no
entry, the key is generated and `save_local_fallback_key(&key)?` runs at
`:616`, **before** the keychain write at `:618-622`, and unconditionally.
When the keychain has no entry but the file exists, the file is read and
backfilled into the keychain (`:603-609`); that is the live seal migration,
while the explicit `try_upgrade_to_keychain` (`:861-882`) carries
`#[allow(dead_code)]` and has no caller. So every desktop install that ever
generated its key holds two independent encryptions of the root, one per
custody. The technique's layout, reached by accident. On the operator's own
Windows install, a `master.key` file sits beside the database while the
keychain holds the key.

## The fail-closed policy governs availability, not confidentiality

`FallbackPolicy` (`:462-483`) makes the file opt-in. When the keychain is
unreachable, `get_master_key` refuses to operate unless
`PERSONAS_ALLOW_FALLBACK_KEY=1` is set (`:530-545`). The log line calls the
file "weaker than keychain-bound protection". The weakest-seal rule says
what that policy buys. An attacker does not run the policy branch; they read
the file. Confidentiality of the store is the confidentiality of the weakest
custody that **exists**, and the policy decides only whether the process
will *use* the weaker one. On Unix the file's wrapping key is derived from a
secret stored in the same directory as the file, plus a machine id that is
world-readable (or, failing that, the hostname). So a copy of that one
directory opens the root with no keychain involved. On Windows both
custodies sit behind the user's DPAPI master key: Credential Manager's
generic credentials are themselves DPAPI blobs readable by any same-user
process. There the second seal adds little exposure. The training-data lane
reached the same split independently, at medium confidence on the Windows
half. The honest statement of this design is: one availability seal and one
convenience seal, with the store's confidentiality set by the convenience
seal on Unix. The fix the technique implies is to stop writing the file when
the keychain write succeeds, or to declare it as the seal it is.

## Status names the seal that unsealed, not the seals that exist

`KeySource` (`:423-437`) records which custody produced the key.
`key_source_label` (`:1234-1241`) renders it, and `vault_status`
(`src-tauri/src/commands/credentials/crud.rs:456-496`) surfaces it to the
trust badge as `key_source`. A keychain-sourced install reports `"keychain"`
while the file custody sits on disk, so the status hides the fact the
technique makes per-seal. This is the one-boolean status the technique
warns against, at the custody layer.

## Removing a seal must not be the repair

`load_local_fallback_key` deletes the key file when it cannot be read after
a permission repair, and returns "no key" (`:687-712`, "removing stale
file"). The caller then generates a fresh root (`:611-623`). When the
keychain holds the key, that deletes the redundant custody and is merely
lossy. When the keychain has no entry, which is exactly when the file is
being read, it deletes the only custody of the root. Every credential sealed
under it becomes ciphertext under a key that no longer exists, and the log
says a new key was generated. On Unix, `load_or_create_machine_secret`
(`:1018-1075`) regenerates `local.secret` on a read error or a wrong length.
That orphans the wrapped file the same way, loudly this time, because the
next unwrap fails. The technique's reaper rule governs *declared* removal.
These are undeclared removals of a custody, and the deletion-is-not-repair
law is the one they break: quarantine the unreadable file under a new name
and fail loud, never delete it and mint a successor root.

## What this realization cannot do

No term, no keyring, no key identity on ciphertext (the credential-vault
application measured this). So there is no rotation of the root at all, and
the any-one-seal rotation rules have nothing to act on. The count-trigger
technique does not apply either. See `usage-triggered-rotation`'s
condition: this store held 535 live ciphertexts under the one key on
2026-09-26, read-only from the operator's install.

Re-checked 2026-10-31 at personas@`22260d77`: every construct above still
holds as described; only line numbers moved. Two wording details changed.
The "weaker than keychain-bound protection" phrase now lives in a code comment
on the refusal branch (`:531`), not in a log line; the logs say "not
keychain-bound". And `VaultStatus` (`crud.rs:461-481`) now carries
`#[serde(rename_all = "camelCase")]`, so the field reaches the trust badge as
`keySource` on the wire, against its own doc comment's "deliberately
snake_case". Neither changes the verdict: the file custody is still written
unconditionally on first run, and the status still names only the seal that
unsealed.
