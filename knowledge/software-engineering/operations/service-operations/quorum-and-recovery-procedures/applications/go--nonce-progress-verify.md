---
layer: application
type: application
subject: quorum-and-recovery-procedures
technique: nonce-progress-verify
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Rekey, recovery-key rotation and root generation as nonce-bound rituals (Go, source tree)

Written against the source tree of OpenBao (commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`),
an open-source secrets-management server. The tree carries three threshold rituals
that share one shape - barrier rekey (`sys/rotate/root/*`), recovery-key rotation
(`sys/rotate/recovery/*`) and root-token generation (`sys/generate-root/*`) - and the
CLI wrappers under `internal/command/operator_{rekey,rotate_keys,generate_root}.go`.
This application also records where the tree confirms the sibling techniques
`cancel-leaves-prior-state-valid` and `unauthenticated-ritual-is-a-vulnerability`,
because the same files carry all three.

## The nonce (confirmed)

`Core.BarrierRekeyInit` (`internal/vault/rekey.go:167-222`) refuses a second init while
`c.rootRotationConfig` is non-nil ("rekey already in progress"), clones the requested
seal configuration, and mints a UUID nonce into it (`rekey.go:213-217`); the log line
at `rekey.go:219` records nonce, shares, threshold and whether verification is
required. `RecoveryRekeyInit` (`rekey.go:224-265`) is the same for the recovery share
set. Every update checks the nonce before the share: `BarrierRekeyUpdate` returns
"incorrect nonce supplied; nonce for this rekey operation is %q" at `rekey.go:332-333`,
and the recovery variant at `rekey.go:569-570`. The CLI insists on it: in
`operator_rekey.go:495-527` a share read from stdin or passed as an argument requires
`-nonce`, and the interactive prompt prints "Rekey operation nonce:" before asking for
the key so the operator can confirm it out of band.

## Duplicate shares refused in constant time (confirmed; upward lesson)

`rekey.go:337-340` compares each submitted share against `RotationProgress` with
`subtle.ConstantTimeCompare` and rejects a repeat with "given key has already been
provided during this generation operation"; the verify path does the same at
`rekey.go:760-763`. The draft technique did not carry the duplicate check; it does now.

## Progress as k-of-t (confirmed)

`Core.RekeyProgress` (`rekey.go:98-127`) returns started, progress and the threshold
without consuming a share; the CLI's `-status` flag (`operator_rekey.go:130-136`)
prints "the status of the current attempt without providing an unseal or recovery
key", and `operator_rekey.go:442-457` reads `Started` and `Nonce` from either the
rotation status or the verification status before deciding whether an attempt exists
("No rekey is in progress. Start a rekey process by running ..." at `operator_rekey.go:462-467`).

## Threshold reached is not done (confirmed)

When `VerificationRequired` is set, `BarrierRekeyUpdate` stops at the threshold: it
mints a separate verification nonce, parks the computed material in
`VerificationKey`, and returns without touching the barrier (`rekey.go:451-462`);
only `performBarrierRekey` (`rekey.go:500-520`) writes the new seal key and clears
`VerificationKey` and `Nonce`. `Core.RekeyVerify` (`rekey.go:717-828`) checks the
*verification* nonce (`rekey.go:755-756`), collects new shares, and on a failed
reconstruction drops `VerificationProgress` and mints a fresh verification nonce in a
deferred block (`rekey.go:776-788`) - the soft failure the technique describes.
`RekeyVerifyRestart` (`rekey.go:853-890`) exposes the same restart explicitly. The CLI
prints the standard's warning verbatim at `operator_rekey.go:698-740`: "these key
shares are _not_ valid until verification is performed. Do not lose or discard your
current key shares until after verification is complete ... If you cancel the rekey
process or seal OpenBao before verification is complete the new shares will be
discarded and the current shares will remain valid."

Two deviations from the technique's default, both stated by the tree: verification is
opt-in (`require_verification`), not opt-out; and when the barrier key is wrapped by
an auto-unseal mechanism rather than shares, `BarrierRekeyInit` refuses verification
outright at `rekey.go:169-181` because no shares exist to verify with - the case the
technique now names.

## Delivery fallback (upward lesson)

When shares are PGP-encrypted and `backup` is requested, the encrypted shares are
written to storage under a backup path before the result is returned
(`rekey.go:440-447`), retrievable and deletable through `RekeyRetrieveBackup` and
`RekeyDeleteBackup` (`rekey.go:892-960`); `operator_rekey.go:686-696` tells the
operator the backup is not removed automatically. The draft had no answer for a
share lost in delivery; the technique now carries this one as an operator choice.

## Cancel and seal (confirms `cancel-leaves-prior-state-valid`)

`Core.RekeyCancel` (`rekey.go:830-851`) sets the rotation config to nil and nothing
else - there is nothing else, because nothing was persisted. The CLI's `-cancel` usage
text at `operator_rekey.go:121-126` reads "Reset the rekeying progress. This will
discard any submitted unseal keys, recovery keys, or configuration"; the root-token
CLI carries the same sentence at `operator_generate_root.go:101-108`. Sealing clears
both rotation configs in `preSeal` (`internal/vault/core.go:2465-2466`).

## The emergency credential ritual (confirmed)

Root-token generation uses the same shape with an OTP instead of verification:
`operator_generate_root.go:79-114` documents `-generate-otp`, `-init -otp=...`, and
submission with the nonce; `GenerateRootInit` (`internal/vault/generate_root.go:240-256`)
stores the nonce, OTP and strategy and logs "root generation initialized" with the
nonce; completion logs the nonce and deletes the in-memory generation
(`generate_root.go:395-415`).

## Authentication (confirms `unauthenticated-ritual-is-a-vulnerability`)

The RFC `website/content/community/rfcs/authenticated-rekey.mdx` states the incident
that produced the design: an unauthenticated attacker "could effectively disable rekey
without notification to a server operator", and rejects the upstream nonce-on-cancel
patch because "the initialization endpoint remains unauthenticated". The tree's
answer is the `sys/rotate/(root|recovery)/{init,update,verify}` paths registered on
the authenticated system backend (`internal/vault/logical_system_rotate.go:198,252,285`,
with `cancel` as a delete verb at `:236` and `:340`), while the bare `rotate/root` -
the no-share path - is in the sudo list at `internal/vault/logical_system.go:74-76`
(`logical_system_rotate.go:173-177` says why). The legacy unauthenticated `rekey/*`
handlers are registered only when a listener's `disable_unauthed_rekey_endpoints` is
explicitly `false` (`internal/http/handler.go:181-195`; the comment at
`logical_system.go:105-116`). The tree therefore *deviates* from the draft's
"highest privilege on every ritual endpoint" and taught the technique its present
form: policy on the share-driven paths, sudo on the path that bypasses the shares.

Zero recovery shares at init: `SealConfig.ValidateRecovery` (`internal/vault/seal.go:367-368`)
relaxes the share minimum for the recovery configuration, `initializeInternal` calls
it at `internal/vault/init.go:222`, and when `SecretShares == 0` the node unseals
itself immediately after init because "the caller has no option but to restart the
service" (`init.go:173-182`). `RecoveryRekeyInit` deliberately validates with the
strict `Validate()` (`rekey.go:224-231`) so the authenticated ritual cannot re-create
an empty set.
