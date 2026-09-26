---
layer: application
type: application
subject: seal-and-key-hierarchy
technique: any-one-seal-unseals
stack: go
status: forged
verified_on: 2026-09-26
verified_against: go@1.27
refresh_by: 2026-12-26
---

# Seals in OpenBao: what is landed, what is accepted design (Go, source tree)

Written against the OpenBao source tree at commit `6b5f82e1` (`go 1.27`).
This application covers `any-one-seal-unseals` and
`recovery-key-is-not-unseal-key`. The honest headline is that the plural
seal is at this commit an **accepted design, not landed code**: the string
`core/seals` occurs in no Go file under `internal/`, while the recovery
verifier, the plaintext seal configuration, the static seal and the
before-storage plugin boundary are in the tree. Each claim below says which.

## The seal boundary is plaintext and precedes storage (confirmed)

`internal/vault/seal.go:28-42`: `barrierSealConfigPath = "core/seal-config"`
"is stored in plaintext, since we must be able to read it even with the
Vault sealed"; `recoverySealConfigPath` likewise "so that we can perform
auto-unseal"; `recoveryKeyPath = "core/recovery-key"` and
`StoredBarrierKeysPath = "core/hsm/barrier-unseal-keys"` (the root
encrypted under the auto-seal). `internal/vault/storage_access.go:14-19`
names the dispatch the tenant technique relies on: the same code operates
on raw storage for the root namespace's seal configuration and on the
parent's barrier for a sealable child's; `internal/vault/logical_raw.go:
80-90` is the dispatch. `website/content/community/rfcs/auto-unseal-plugins.mdx:92-99`:
KMS plugins "can only be registered declaratively via the server
configuration file ... Since Auto Seals naturally must initialize before
unsealing, following the legacy API/storage-driven plugin lifecycle is not
feasible"; `:176-181` lists the consequences (download before unseal, never
register into storage, start the process before core is created); `:214-216`
records that a panicking plugin does not take the server down. The golden
path's "seal exists before storage is readable" paragraph is this.

`community/rfcs/static-auto-unseal.mdx:12-15, 25`: a static key from the
environment is "of equivalent security" to a KMS whose credential lives in
the same platform store, and `:63-64` notes keys "are not reloaded on
SIGHUP". The technique's warning about a convenience seal beside a hardware
seal is the same arithmetic run the other way.

## Recovery shares verify, they do not decrypt (confirmed)

`internal/vault/seal_manager.go:395-467` (`getUnsealKey`): shares are
collected per namespace under a nonce (`recordUnsealPart`, `:366-393`),
combined with `shamir.Combine` once the threshold from the stored config is
met (`:437-455`), and, when the seal supports recovery keys, the combined
key is passed to `seal.VerifyRecoveryKey` (`:461-465`). The verifier is
`internal/vault/seal_autoseal.go:372-384`: read the stored recovery key,
`subtle.ConstantTimeCompare`, error on mismatch. Nothing is decrypted with
the recovered value; the Shamir `defaultSeal` returns "recovery not
supported" from every recovery method (`seal.go:246-263`). In the rotation
ceremony the same verification gates the root-and-shares form under an
auto-seal (`internal/vault/rotate.go:228-233`).

The rejected design is in the tree as prose: `community/rfcs/emergency-seal.mdx:251-283`,
"Alternative: Allow recovery keys to unseal", declined for "Overloading key
functions: it gives a single set of keys different functionalities" and for
creating a "linked" special seal type. `community/rfcs/parallel-unseal.mdx:348`
says why it cannot work mechanically: recovery shares "do not combine to form
a copy of the root key encrypting the barrier keyring and instead form an
alternative recovery object".

Zero recovery shares at init: `community/rfcs/authenticated-rekey.mdx:55-58`
lets `sys/init` take `0` shares under an auto-seal, and `rotate.go:168-172`
(`InitRotation`) returns keys immediately from `sys/rotate/recovery/init`
when none exist. `:103-106` names `SealConfig.ValidateRecovery()` as the
validator without the share and threshold floors of the main config.

## N seals, priority, weakest link (designed, not landed)

`community/rfcs/parallel-unseal.mdx:183-256` ("New Storage Layout"): per
seal, `core/seals/<name>/encrypted-root` (raw storage, encrypted by the
seal's key), `shamir-config` or `recovery-config` (raw), and for
auto-seals the catch-up copies `barrier-keyring`, `current-root` and
`latest-root` (barrier-encrypted) that let an offline seal follow a root
rotation; "there will still be only a single root key for all unseal
mechanisms". `:257-265`: `name` and `priority`, priority "a local-only
parameter and does not affect other nodes", which is where the technique's
per-node order comes from. `:270-283` ("New Unseal Process"): automatic
seals are tried in priority order without blocking, Shamir seals are
skipped, a failed auto-unseal falls through to waiting for shares while
"periodically retrying auto-unseal mechanisms", and a share without a seal
name goes to the highest-priority Shamir seal. `:358` states the weakest-link
property and that there is "no m-of-n requirement on unsealing".
`community/rfcs/emergency-seal.mdx:161-170` is the simple form the technique
calls "refuse": root rotation "will be blocked if the primary auto seal is
offline", so that every seal's entry stays current without a catch-up
mechanism; `:87-160` shows the two-seal storage as a subset of the N-seal
layout. Neither RFC's storage layout is in Go at this commit; the landed
seal manager (`seal_manager.go:61-83`, `sealByNamespace`) holds one seal per
namespace. A consumer citing this application for the plural seal is citing
a design, and `verified_against` names the runtime the design targets, not
code that runs it.

## Re-checked 2026-09-26: still designed, and landed elsewhere

OpenBao's `CHANGELOG.md` through 2.7.0 (September 23, 2026) carries no
entry for parallel unseal or the emergency seal. Both RFCs merged as
documents, and neither has landed code. The release that did move the seal
boundary is 2.7.0 itself: "The `pkcs11`, `alicloudkms`, `awskms`,
`azurekeyvault`, `gcpckms` and `ocikms` seals are no longer built-in and
must be installed as external plugins" (GH-3337). The golden path's "a
custody mechanism that runs as a separate process must be fetched and
started before the store is opened" is now the default path for every
key-service seal. The root-only rotation had a shipped defect under a
Shamir seal, fixed in the March 25, 2026 release: "`/sys/rotate/root` call
rotating both root key and unseal key when using a Shamir Seal, losing all
key shares" (GH-2619). The keyring technique's test ("the old shares still
unseal afterward") is taken from it.

The plural seal has landed in HashiCorp Vault Enterprise as Seal HA,
documented at developer.hashicorp.com `vault/docs/concepts/seal` and
`.../configuration/seal/seal-ha`. It is documentation, not a tree we read.
Its constraints correct the technique's draft: "Shamir seals cannot be used
in a Seal HA setup", "You cannot mix Shamir and auto seals", and "You can
configure a maximum of three seals". So the automatic-plus-threshold pair
the technique had called common is shipped by nobody. Its handling of an
unhealthy seal is the third rotation design the technique now carries:
"When seals are unhealthy, Vault keeps track of values that could not be
fully wrapped and will re-wrap them once seals become healthy again. Note,
however, that it is not possible to rotate the data encryption key nor the
recovery keys" while seals are unavailable. The size cost is quoted too:
"Vault multiplies the size of the entry by the number of seals". The
weakest-link property is not stated in Vault's pages; the OpenBao RFC above
remains its source. On the recovery technique, the same concepts page
confirms "Recovery keys cannot decrypt the root key". For auto-to-Shamir
migration it also says: "Once you enter the required threshold of recovery
keys, Vault migrates the recovery keys that it will use as unseal keys".
That is the sanctioned crossing the technique now names. The two Vault
pages disagree on which end of `priority` is tried first, so no direction
is cited.

## What this realization cannot do

At this commit a node has one seal per namespace; a second custody of the
global root is a configuration the RFCs describe and the tree does not yet
read. The threat model the whole hierarchy sits under is
`website/content/docs/internals/security.mdx:43-70`: arbitrary control of
the storage backend and memory analysis of the running process are out of
scope, and so nothing here defends against either.
