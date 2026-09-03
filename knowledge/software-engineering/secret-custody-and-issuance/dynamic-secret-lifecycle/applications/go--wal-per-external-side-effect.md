---
layer: application
type: application
subject: dynamic-secret-lifecycle
technique: wal-per-external-side-effect
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# A write-ahead entry per remote mutation, rolled back by connecting (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`. The plugin framework in
`sdk/framework` supplies the WAL primitive and the rollback sweep; the
database secrets engine uses it for root-credential rotation and for
managed static-account rotation. The tree confirms the technique's three
rules and taught it two of its paragraphs.

## The primitive and the sweep

`sdk/framework/wal.go:42-60` writes a `WALEntry{Kind, Data, CreatedAt}`
under a UUID key; entries cannot be modified, only added and deleted.
`sdk/framework/backend.go:78-85` declares the contract: `WALRollback` is
called with each entry's data, and `WALRollbackMinAge` "should be longer
than the maximum time it takes to successfully create a secret" - the
technique's minimum-age rule in the framework's own words. The sweep at
`backend.go:621-679` lists entries, defaults the age to ten minutes when
unset (637-640), skips any entry younger than that (657-659), runs the
rollback, and deletes the entry only when the rollback returned no error
(666-668). An operator can force every entry regardless of age with an
`immediate` flag (642-644) - the escape hatch the technique does not name
and should: the sweep's age rule is for the automatic path, and a human
who knows no request is in flight may override it.

## Root-credential rotation

`internal/builtin/logical/database/path_rotate_credentials.go:141-150`
writes the entry - connection name, root username, old password, new
password - before `UpdateUser` changes the password at the remote (162);
`storeConfig` persists the new password (175); `DeleteWAL` runs last (180),
with a failure to delete logged as a warning rather than returned, which is
correct because a leftover entry is reconciled by the sweep as "nothing to
roll back". The engine sets the age to one minute
(`internal/builtin/logical/database/backend.go:33,117`).

`internal/builtin/logical/database/rollback.go:33-77` is the rollback
decision the technique states. If the stored password already equals the
entry's new password, the rotation completed and only the delete was lost:
return nil (72-76). Otherwise clear the cached connection and try to
connect with the stored configuration (57-67); success means the remote
never changed and the entry is discarded. Failure means the remote changed
before storage did, and `rollbackDatabaseCredentials` (83-116) connects
*with the new password* and sets the remote back to the old one. That
direction - the remote is made to match the store, not the store the remote
- is the upward lesson the technique's rotation paragraph took from this
file; the draft had the store follow the remote. A plugin that cannot change
its own root password (`codes.Unimplemented`, `ErrPluginStaticUnsupported`)
returns nil at 112-115, which the standard would rather surface than
swallow: the issuer is locked out at that point and the sweep has just
deleted the only record saying so. Recorded as a deviation.

## Static-account rotation, and the reader on restart

`internal/builtin/logical/database/rotation.go:478-482` writes the entry
carrying the *generated* new password (or public key) before `UpdateUser`
at 485, stores the role at 495-500, deletes the entry at 506. The retry
path is what makes the generated value matter: when rotation fails,
`rotation.go:249-252` re-queues the item with the WAL id preserved so the
next attempt reuses the same password rather than minting another, which
is the technique's "the witness carries the generated value" rule and the
second thing this file taught the draft.

The loader at `rotation.go:75-98` classifies each surviving entry against
the role in storage exactly as the technique's restart paragraph now states:
an entry whose `LastVaultRotation` is zero belongs to a role never
successfully created and is deleted (78-87); an entry older than the role's
own last rotation is outdated and is deleted (88-94); anything else is live
and is queued for immediate processing with its WAL id (95-98). The
read-only probe that precedes this loader is recorded under
[persist-before-provision](./go--persist-before-provision.md).

## What the tree does not do with a WAL

The dynamic-credential create path (`path_creds_create.go`) writes no WAL
entry before its remote create; the lease itself is the witness, and the
gap between the remote's success and the lease registration is the
deviation recorded under persist-before-provision. The standard's
generalisation - a witness per remote mutation, creation included - is
wider than the tree's practice, which reserves the WAL for the two
mutations whose retry would otherwise generate a second value.
