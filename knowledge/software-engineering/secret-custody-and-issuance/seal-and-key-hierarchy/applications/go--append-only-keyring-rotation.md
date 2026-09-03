---
layer: application
type: application
subject: seal-and-key-hierarchy
technique: append-only-keyring-rotation
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The barrier keyring in OpenBao: terms, upgrade entries and the operation count (Go, source tree)

Written against the OpenBao source tree at commit `6b5f82e1`, module
`github.com/openbao/openbao/v2`, `go 1.27` per `go.mod`. This application
covers the three data-key-layer techniques of the subject at once, because
the tree realizes them in one package: `append-only-keyring-rotation`,
`transient-upgrade-entry` and `usage-triggered-rotation`. It extends the
registry's earlier `credential-vault/go--encryption-at-rest` application,
which recorded that rotation is split by layer; here the mechanisms are
cited line by line, with two deviations and one correction to the draft.

## Terms and the append (confirmed)

`internal/vault/barrier/keyring.go:24-36` states the design in its own
words: keys carry a sequential term, "the term used to encrypt a key is
prefixed to the key written out", all data is encrypted with the latest key,
and old keys are stored so that older values still decrypt. The keyring is
one serialized blob (`EncodedKeyring`, `:43-47`) that carries the root key
(`RootKey []byte`, JSON-tagged `MasterKey`) alongside the term keys, exactly
the "keyring carries the root" property the technique relies on. Rotation is
`AESGCMBarrier.Rotate` at `internal/vault/barrier/aes_gcm.go:571-612`:
generate a key, `newTerm := term + 1`, `keyring.AddKey`, `persistKeyring`,
then swap in memory and zero the encryption counters. `Keyring.AddKey`
(`keyring.go:103-137`) refuses a conflicting key for an existing term and
advances `activeTerm` only if the new term is higher.

The ciphertext layout is `encrypt` at `aes_gcm.go:1016-1050`: four bytes of
term, one version byte, then the AEAD output from
`cipher.NewGCMWithRandomNonce` (`:1000-1014`, so the 96-bit nonce is
generated and prefixed by the standard library, never by the barrier).
Under version 2 the associated data is the storage path (`:1040-1046`), and
`decrypt` at `:1062-1087` opens with the same path. Reads look the term up
first: `lockSwitchedGet` at `:876-888` reads the four-byte term, calls
`aeadForTerm`, and returns `no decryption key available for term %d` when
the keyring lacks it, a named lookup failure rather than a tag failure. This
corrected the draft, which had the term itself in the associated data; the
tree binds the path, and relabelling a term fails the tag under the wrong
key anyway.

Retention: `Keyring.RemoveKey` exists at `keyring.go:139-155` and refuses
the active term, but no non-test caller in `internal/` invokes it; the tree
never prunes a term. Confirms.

## The root rotates without a ceremony; the shares rotate with one (taught)

`SealManager.RotateBarrierRootKey` at `internal/vault/rotate.go:75-99`
generates a new root, re-encrypts it under the seal (`seal.SetStoredKeys`)
and calls `barrier.RotateRootKey` (`aes_gcm.go:746-766`: re-wrap and persist
the keyring, swap, zeroize the old). Its doc comment says it "doesn't
require reconstruction of the unseal key". It is reached from the bare
`POST sys/rotate/root` handler at
`internal/vault/logical_system_rotate.go:524-547`, a sudo-gated endpoint
taking no shares. The share-issuing form is the `InitRotation` /
`UpdateRotation` ceremony at `rotate.go:144-239`: a nonce is minted at
init (`:154-160`), each presented share must carry it and may not repeat
(`progressRotation`, `:244-283`), the threshold is counted against the
existing config, and under an auto-seal the combined key is verified against
the stored recovery key before anything rotates (`:228-233`). The RFC
`website/content/community/rfcs/authenticated-rekey.mdx:84-89` names the
split, and `:124-127` says the historical endpoint "performs both rotations
(the root key and the Shamir shares), conflating concerns". This taught the
draft: the quorum belongs to re-issuing the shares, not to the root as such.
The dispatch's phrasing, "the root ... does need the quorum", is narrowed
accordingly in the technique.

## The transient upgrade entry (confirmed, and taught)

`barrier.go:50-59` documents `KeyringUpgradePrefix = "core/upgrade/"`:
"When key N+1 is installed, we create an entry at prefix/N which uses
encryption key N to provide the N+1 key ... The upgrade keys are deleted
after a few minutes". `CreateUpgrade` (`aes_gcm.go:615-651`) serializes the
new term's key and encrypts it with `aeadForTerm(prevTerm)` under the name
`core/upgrade/<prevTerm>`; `CheckUpgrade` (`:660-722`) looks for an entry
addressed to the barrier's own active term and `AddKey`s it. The standby
loop at `internal/vault/ha.go:1343-1356` (`checkKeyringUpgrade`) loops
`CheckUpgrade` until it returns false, which is the chaining rule; the
periodic call is at `ha.go:1314`. The grace period is two minutes
(`internal/vault/core.go:1006`), the deletion is scheduled with
`time.AfterFunc` at rotation time (`rotate.go:130-136`), and a node taking
leadership lists surviving entries and schedules their deletion at the same
period (`scheduleUpgradeCleanup`, `ha.go:1410-1435`, "if a leader failover
takes place"). Rotation only creates the entry when HA is on and the grace
period is positive (`rotate.go:123-124`).

What the tree taught: the upgrade entry is a **term** bridge, and the
**root** is bridged separately and permanently. `barrier.go:61-72`
(`RootKeyPath = "core/root-key"`): the root key "is encrypted by the latest
key in the keyring ... This key can be decrypted if you have the keyring to
discover the new root key. The new root key is then used to reload the
keyring itself." `performKeyUpgrades` at `ha.go:1383-1407` runs the fixed
order the technique now states: `checkKeyringUpgrade`, then
`ReloadRootKey` (`aes_gcm.go:443-500`, constant-time compare, swap, zeroize
the old keyring), then `ReloadKeyring`. The draft had described the
transient entry as root N+1 under root N; the tree's shape is the one the
technique now teaches, with the transient/permanent distinction argued from
which layer's reach each entry extends.

## Counting and the three triggers (confirmed, with one deviation)

`keyring.go:17-22`: `AbsoluteOperationMaximum = 3_865_470_566`, commented
"10% shy of the NIST recommended maximum, leaving a buffer to account for
tracking losses"; `AbsoluteOperationMinimum = 1_000_000`;
`MinimumRotationInterval = 24h`. The configuration endpoint rejects values
outside `[minimum, maximum]` and intervals under a day
(`logical_system_rotate.go:506-512`), and `KeyRotationConfig.Sanitize`
(`keyring.go:251-261`) clamps anything that reaches the keyring. Every
encryption goes through `encryptTracked` (`aes_gcm.go:1187-1198`), which
increments an unaccounted counter and a metric labelled by term.
`CheckBarrierAutoRotate` (`:1205-1248`) is the three-way switch: a term
with `Encryptions == 0` older than `oneYear` rotates for the "legacy
rotation" reason (`:1220-1222`, the unknown-count trigger the draft lacked
and now carries), `encryptions() > MaxOperations` (`:1223`), and
`time.Since(InstallTime) > Interval` (`:1225`). It runs on the leader's
five-minute ticker (`AutoRotateCheckInterval`, `aes_gcm.go:40`;
`autoRotateBarrierLoop`, `core.go:3090-3101`), and the rotation it triggers
is `RotateBarrierKey`, which is the same append plus upgrade entry as a
manual rotation.

The persist counts itself. `persistEncryptions` at `aes_gcm.go:1250-1271`:
"Since persistence performs an encryption, perversely we zero out after
persistence and add 1 to the count", `newEncs := upe + 1`, written through
`persistKeyringBestEffort` (`:248-253`, "for non critical keyring writes")
so a failed persist never fails an encryption. `encryptions()` at
`:1275-1283` is persisted-plus-unaccounted, the floor the technique argues
from.

Deviation: the standard keeps each retired term's final count for audit.
`Keyring.AddKey` at `keyring.go:128-133` zeroes `Encryptions` on every
non-active term when a new term is installed, so the tree discards the
history it had. Deviation, second: `AddRemoteEncryptions` (`aes_gcm.go:
1180-1185`) has no caller outside tests, so no standby count is rolled up;
in this tree that is safe only because storage writes are forwarded to the
active node, which is where the counting happens, and the technique's
"cluster-wide" is met by construction rather than by aggregation.

## What this realization cannot do

It offers no term pruning path with a measured count, and it no longer
holds the count that would drive one. Root-key rotation across several
seals is designed (`community/rfcs/parallel-unseal.mdx`, "Barrier and Root
Key Rotation") but the `core/seals/<name>/` layout does not appear in Go
code at this commit; see the subject's `go--any-one-seal-unseals`
application.
