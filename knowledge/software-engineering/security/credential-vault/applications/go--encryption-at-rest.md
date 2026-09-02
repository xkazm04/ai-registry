---
layer: application
type: application
subject: credential-vault
technique: encryption-at-rest
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
proof: structural-only
---

# A server-side barrier over untrusted storage (Go, source tree)

This application is written against the source tree of an open-source
secrets-management server, not against a fleet project: the registry's
design read of that tree (intake 2.0.0, 2026-09-02) found that this is the
one design decision of seven whose forces the corpus already models, and a
source-tree application is where the tree's own extension of the standard
is recorded.

## The decision, in the tree's terms

Every byte leaving the server passes a *barrier*: AES-256-GCM with a random
96-bit nonce per stored object and the tag verified on read. The barrier is
keyed by a keyring; the keyring is wrapped by a root key; the root key is
never stored in plaintext and is recovered only by *unsealing* - by default
from a Shamir split (5 shares, threshold 3), or from an external KMS/HSM
"auto-unseal" wrapper, or from a static key in the environment. Sealing
discards the root key and keyring from memory and leaves the server able
to answer only unseal and status.

The forces are the technique's own: the storage backend and the transport
to it are untrusted by design, so confidentiality comes from the cipher
alone, and no single stored object or single person may yield the root
key. The tree's threat model states the boundary in both directions -
arbitrary *control* of the backend (deletion, rollback) and memory
analysis of the running process are out of scope, and the second is made
concrete by the removal of memory locking.

## Where the tree extends the standard

Three things the technique does not say, each testable:

- **Rotation is split by layer, and only one layer needs a quorum.** The
  keyring rotates online by *appending* a key - old values still decrypt
  under retained keys, new writes use key N+1, nothing is re-encrypted -
  and it needs no key holders because operators never hold the barrier
  key. The root key rotates by re-wrapping the keyring and does need the
  unseal or recovery quorum, "to prevent a single malicious operator from
  performing a rotation and invalidating the existing root key". The
  rotation guidance ties keyring rotation to the cipher's own limit (AES-GCM
  before ~2^32 encryptions), and the operator estimates the count from four
  metrics rather than the server counting for them.
- **Standbys survive rotation through a short-lived upgrade entry.** When
  rotation installs N+1, the active node writes an "upgrade" key - N+1
  protected by N - that lives for a few minutes, so a standby unsealed with
  N picks up N+1 and can take leadership without a fresh unseal. The
  technique's "one seal/unseal door" is kept: the upgrade key is the door
  opening once more, under the old key, for a bounded window.
- **Rotation moved behind authentication, and bootstrap may mint no
  long-lived privileged secret at all.** The unauthenticated rekey
  endpoints let an attacker cancel a rotation silently; the replacement
  `sys/rotate/*` family is authenticated and sudo-gated, and an auto-unseal
  cluster may initialize with zero recovery shares and create them later
  under a sudo token, so that declarative provisioners never have to store
  a secret produced as a side effect of init.

## Anchors

`website/content/docs/internals/security.mdx` (threat model, out of scope),
`docs/concepts/seal.mdx` (why, Shamir, sealing), `docs/internals/rotation.mdx`
(rotate/root, rotate/keyring, the upgrade key, NIST guidance),
`website/content/community/rfcs/authenticated-rekey.mdx` (problem statement,
`SealConfig.ValidateRecovery()`), `community/rfcs/parallel-unseal.mdx`
"Existing Design" (storage paths `core/keyring`, `core/master`,
`core/shamir-kek`, `core/hsm/barrier-unseal-keys`).

## What this realization cannot do

It defends nothing against an attacker who controls the backend or reads
process memory, and says so. It is one custody chain per server; the same
tree's plural-seal and per-tenant designs are recorded in the registry's
design record for this source and are *not* modelled by this technique -
they are the handoff's first candidate subject.
