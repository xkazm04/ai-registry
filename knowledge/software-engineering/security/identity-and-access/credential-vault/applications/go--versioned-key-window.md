---
layer: application
type: application
subject: credential-vault
technique: versioned-key-window
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Versioned key window in OpenBao's transit key policy (Go, source tree)

Reconciled against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (`go.mod` declares `go 1.27.0`).
The technique's policy is `keysutil.Policy` in `sdk/helper/keysutil/policy.go`,
shared by the transit secrets engine (`internal/builtin/logical/transit/`) and
every other engine that serves versioned keys. Every line below was re-opened
at the pinned commit.

## The four ordinals and where the window is checked

The policy carries `MinAvailableVersion`, `MinDecryptionVersion`,
`MinEncryptionVersion` and `LatestVersion`, and the relation between them is
enforced in `handleArchiving` (`sdk/helper/keysutil/policy.go:607-686`),
which `Persist` calls on every write (`:689-716`). The sanity switch at
`:621-636` refuses a persist when minimum decrypt is below 1, latest is below
1, minimum encrypt is set and below minimum decrypt, or minimum decrypt
exceeds latest — so the decrypt-encrypt-latest chain is validated at the
policy's one write door regardless of which endpoint mutated it. The
comment on `handleArchiving` (`:604-606`) is explicit that it runs only from
`Persist`.

The transit config endpoint (`internal/builtin/logical/transit/path_keys_config.go:126-179`)
validates each floor against latest as it is set, then re-checks the
"final picture after the logic on each individually" (`:173-179`) — the
technique's rule that a partial update of one fact is not a state with a
name, written as code.

**Deviation, and the finding.** The *available* floor's relation to the
others is not in the policy-level door. It is checked at the two endpoints
that can move the ordinals: the config handler refuses to persist when
minimum available exceeds minimum encrypt or minimum decrypt
(`path_keys_config.go:243-247`), and the trim handler refuses the reverse
(`path_trim.go:84-95`). The window is therefore enforced across two doors,
not one, and a third caller of `Persist` that moved the available floor
would not be caught by `handleArchiving`. The standard stays.

## Ciphertext carries its version; too old and too new are both refusals

`DecryptWithFactory` (`policy.go:1080-1125`) parses the configurable prefix
(`DefaultVersionTemplate = "vault:v{{version}}:"`, `:94`), rejects a missing
prefix and a malformed field count as invalid ciphertext, decodes the
version, and then judges it: `ver > p.LatestVersion` returns "version is too
new" (`:1112-1114`) and `ver < p.MinDecryptionVersion` returns `ErrTooOld`
(`:85-87`, `:1116-1118`). The cipher is never asked about a version outside
the window. One compatibility rule the technique does not carry: a version of
0 is read as 1 (`:1106-1110`), because the initial implementation numbered
keys from zero, and the config endpoint likewise forces a minimum decryption
version of 0 up to 1 with a warning (`path_keys_config.go:137-140`).

## Rotate mutates in memory, persists, restores

`Rotate` (`policy.go:1886-1920`) snapshots `LatestVersion`,
`MinDecryptionVersion` and a copy of the `Keys` map, defers their restoration
on any non-nil return (`:1901-1908`), calls `RotateInMemory` (`:1922`; latest
is incremented and the new entry attached at `:2049-2058`), and only then
`Persist`. `Persist` itself snapshots `ArchiveVersion` and `Keys` again and
restores them on failure (`:696-711`), with a comment conceding the double
snapshot is belt-and-braces. The trim handler follows the same shape by hand:
it sets `MinAvailableVersion`, persists, and on error puts the original back
"to ensure that cache doesn't get corrupted" (`path_trim.go:96-100`).

## Two tiers of retirement, and the archive-then-prune order

The reversible tier is in `handleArchiving`: when the live map no longer
contains the minimum decryption version, keys are copied *from* the archive
back into the live set (`:643-648`); otherwise every version up to latest is
copied *into* the archive (`:661-666`), and the comment at `:611-613` states
the policy — "we never delete keys from the archive even when we move them
back". The live-set prune runs **after** `storeArchive` succeeds
(`:673-684`), with the reason written down: "so that if there is an error
saving we haven't messed with the current policy".

The destroying tier is `MinAvailableVersion`: when it exceeds the archive's
own floor, the archive slice is cut (`:668-671`) — the one place archived
material is discarded. The trim endpoint is correspondingly strict:
minimum available "cannot be decremented" (`path_trim.go:84-86`), cannot be
set unless both the encrypt and decrypt floors are already set (`:87-90`),
and cannot exceed either (`:91-94`); its field description says the versions
below it "will be permanently deleted" (`:31-33`). This is the tree's upward
lesson to the draft: retirement is two operations with opposite
reversibility, and the technique was rewritten to say so.

## Soft delete in the record, tombstone in the cache

`SoftDeleted` is a persisted policy field (`policy.go:533`), set and cleared
by dedicated transit endpoints (`path_keys.go:580-581`, `:624-625`), and
checked with `ErrSoftDeleted` (`:89-91`) at every operation entry point:
`GetKey` (`:860`), `DeriveKey` (`:881`), `DecryptWithFactory` (`:1081`),
`HMACKey` (`:1243`), `SignWithOptions` (`:1291`), `VerifySignatureWithOptions`
(`:1526`), `ImportPublicOrPrivate` (`:1765`), `Rotate` (`:1887`),
`RotateInMemory` (`:1923`), `Backup` (`:2083`), `SymmetricEncryptRaw`
(`:2187`), `SymmetricDecryptRaw` (`:2279`), `EncryptWithFactory` (`:2341`),
`ImportPrivateKeyForVersion` (`:2532`), `WrapKey` (`:2760`), and export
(`path_export.go:122-123`). Sixteen sites, one predicate, one error string.

The in-memory tombstone is `deleted atomic.Bool` (`:448-451`), whose comment
names the exact race the technique describes: "a guard for operations that
may write data, e.g. if one request rotates and that request is served after
a delete". `DeletePolicy` (`lock_manager.go:529-570`) takes the per-key lock
and the cached policy's own lock, sets the tombstone (`:565`), drops the cache
entry, then deletes storage; `Persist` refuses when the tombstone is set
(`policy.go:690-692`), and `GetPolicyWithLockType` returns nil for a cached
policy whose tombstone is set, both before and after taking the global lock
(`lock_manager.go:300-303`, `:337-340`). Confirmed, with a nuance the draft
lacked: the two marks serve different readers, and the technique now states
both.

## Reconciliation summary

Confirmed: decrypt-encrypt-latest window validated at the policy's write
door on every persist; version-prefixed ciphertext refused as too old and as
too new before the cipher is consulted; rotate as snapshot, mutate, persist,
restore; archive written before the live set is pruned; soft-delete checked
at sixteen entry points; an in-memory tombstone closing the
rotation-after-delete race. Upward lessons: retirement is two tiers with
opposite reversibility, the available floor is monotone and gated on the
other two; the delete guard is a persisted flag plus a cache tombstone.
Deviation: the available floor's window relation is enforced at two
endpoints rather than at the policy's single write door.
