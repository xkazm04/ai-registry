---
layer: application
type: application
subject: seal-and-key-hierarchy
technique: per-tenant-seal-chain
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Sealable namespaces in OpenBao (Go, source tree)

Written against the OpenBao source tree at commit `6b5f82e1` (`go 1.27`).
Per-namespace sealing is landed: the seal manager, the per-namespace
barrier and the namespace store's seal, unseal and load paths are all in
Go, and the RFC that designed them is in the tree beside them.

## Own chain, no double encryption (confirmed)

`website/content/community/rfcs/namespace-sealing.mdx:121-153` draws the
tenant chain: namespace shares recover a namespace KEK, which encrypts a
namespace root, which encrypts a namespace keyring. `:498-504`: data in a
sealable namespace "is encrypted using its own chain of keys ... and not
double encrypted with that of the parent", which is the technique's central
rule and the RFC's own security argument for it. In code every sealable
namespace gets its own `AESGCMBarrier` (`internal/vault/barrier/aes_gcm.go:142`
takes the namespace; `internal/vault/seal_manager.go:106-153`, `SetSeal`,
creates the barrier and the seal per namespace and records both in
`sealByNamespace`), and `barrier.ErrNamespaceSealed` (`barrier.go:22-25`) is
the distinct error a sealed tenant returns, which is the
`failure-not-empty-success` half of the technique. The keyring rotation and
root rotation paths are namespace-scoped by construction:
`SealManager.RotateBarrierKey` and `RotateBarrierRootKey`
(`internal/vault/rotate.go:75-137`) resolve the barrier by namespace path
and return `ErrNotSealable` for a namespace with no chain of its own; the
upgrade entry is written under the namespace barrier's own meta prefix with
the same grace period ("we are using the same key rotate grace period for
all namespaces for now", `rotate.go:121-122`).

## The seal configuration sits under the parent (confirmed)

`namespace-sealing.mdx:155-165`: the parent's keyring encrypts the child's
stored KEK, so "the parent or root namespace needs to be unsealed before a
namespace can be unsealed". `:230` in the storage table: the child's
`shamir-config` / `recovery-config` "is encrypted with the parent
namespace's barrier, as it needs to be readable during unsealing of the
namespace". `internal/vault/storage_access.go:14-19` is the one code path
for both cases, "stored in plaintext for the root namespace and as
ciphertext for sealable child namespaces". `:172`: "OpenBao will not
globally block if a single namespace remains sealed", and auto-unseal of
namespaces is retried periodically (`:160-166`).

## Loading stops at a sealed child; sealing cascades and forgets (confirmed)

`internal/vault/namespace_store.go:212-259` (`loadNamespacesRecursive`):
for each child, read `barrierSealConfigPath` through the child's scoped
view; when it exists, "we can stop recursing this branch as the namespace
isn't unsealed yet, as we would not be able to read any children"
(`:238-250`), register the seal with the seal manager, and return without
descending. The sealed child is entered, not skipped, which is the
`unknown-is-not-a-value` half. `sealNamespaceLocked` at `:1026-1055` walks
the subtree post-order, tears down each unsealed descendant's resources,
seals each descendant's barrier, and deletes the descendants from the
in-memory indexes while retaining the sealed namespace itself: "We want to
forget child namespaces of a namespace which was marked sealed, but retain
the pointer to the sealed namespace itself" (`:1044-1047`). `ListNamespaces`
excludes sealed namespaces unless asked to include them (`:924-946`), and
`DeleteNamespace` refuses a sealed one (`:1282-1283`) while a separate
`DeleteSealedNamespace` (`:1317-1365`) is the explicit path that wipes
ciphertext under a chain nobody will open.

## Unseal is all-or-nothing (taught)

`unsealNamespace` at `namespace_store.go:1126-1180` inserts the namespace,
loads its subtree inside a storage transaction, collects every newly
readable unsealed descendant, and runs post-unseal (mounts, credential
backends, identity, MFA, expiration) for each; the deferred block at
`:1127-1135` re-seals the namespace if any step fails, "to avoid a dirty
partial state". The expiration restore at `:1218-1222` also seals the
namespace back if lease restoration fails. The draft had described sealing
and loading; the atomic unseal-or-reseal is the tree's addition and the
technique now carries it.

## What this realization cannot do

`namespace-sealing.mdx:525` leaves open "how should we handle the case when
the active node goes offline"; namespace-seal failover is unresolved. The
RFC is explicit that it "does not include or describe parallel unsealing of
namespaces" (`:225-227`), so a tenant has one seal, and the invalidation
path notes the consequence on a standby: a child of a sealable namespace
not yet unsealed there is simply unknown and its invalidations are ignored
(`namespace_store.go:279-300`). All tenant key services must be reachable
at restart before their tenants serve; the server does not wait for them.
