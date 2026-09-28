---
layer: application
type: application
subject: dynamic-secret-lifecycle
technique: persist-before-provision
stack: go
status: forged
verified_on: 2026-09-26
verified_against: go@1.27
---

# Refusing the remote create on a node that cannot persist the lease (Go, source tree)

Written against the OpenBao source tree at commit
`6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38` (module `github.com/openbao/openbao/v2`),
where the database and RabbitMQ secrets engines create users in a remote
system and the core registers the lease afterwards. The tree confirms the
technique's ordering as a class check, extends it with a write-probe at
startup, and falls short of it at one seam in the core. The expiry buffer and
the TTL ladder that the same create path exercises are recorded here too,
because they are three lines apart in the same function.

## Confirmed: the class check before the remote call

`internal/builtin/logical/database/path_creds_create.go:114-120` is the
technique verbatim, comment included: after role and connection validation
and before `GetConnection`, the handler checks
`b.System().ReplicationState().HasState(consts.ReplicationPerformanceStandby)`
and returns `logical.ErrReadOnly` - "before we actually connect to the
database lets check, if we can even persist the lease in the end". The
RabbitMQ engine carries the identical check and comment at
`internal/builtin/logical/rabbitmq/path_role_create.go:88-91`. The
sentinel is what the forwarding middleware keys on, so a create issued to a
read-serving replica forwards to the leader rather than creating a remote
user the replica could never record.

The lease carries what the revoke needs. The response's internal data at
`path_creds_create.go:232-237` stores `username`, `role`, `db_name` and
`revocation_statements`; the revoke at
`internal/builtin/logical/database/secret_creds.go:137-160` falls back to
the embedded `db_name` and statements when the role no longer exists,
which is the technique's rule that a lease must not depend on live
configuration to be revocable.

## Extended: the proof is a write, at startup

The technique argues that a probe is weaker than a write. The tree's
rotation queue agrees: `internal/builtin/logical/database/rotation.go:536-556`
polls `framework.PutWAL` with a throwaway entry until the call stops
returning `logical.ErrSetupReadOnly`, deleting the entry on success, before
it loads the WAL entries from any failed rotations. The comment gives the
reason - the loader must be able to delete from storage - and the shape is
the technique's: prove writability with a real write, not a status read.

## The event case: compensated inside Register, armed late

The backend's check covers the class case (a node that cannot write at all).
The event case - the remote create succeeded and the lease write then fails
- reaches `internal/vault/request_handling.go:1552-1557`, which logs and
returns `ErrInternalError`. The revoke happens one call deeper.
`ExpirationManager.Register` (`internal/vault/expiration.go:1483`) installs a
deferred rollback at `:1543-1567`: on any error it routes a `RevokeRequest`
for the just-generated secret, deletes the lease entry and its token index,
and appends any cleanup failure to the returned error. That is the standard's
rule - revoke immediately with the identity in hand, then error - applied by
the core for every backend. Token registration does the same at its own call
sites (`request_handling.go:1637-1645`, `2500-2505`, `tokenStore.revokeOrphan`).

The residue is narrower than a missing compensation. The defer is armed only
after four early returns (`expiration.go:1486-1511`): no token entry on the
request, `Secret.Validate()` failing, the lease-id random draw failing, and no
namespace in the context. Each of them returns an error after the backend has
already created the remote user, and none of them revokes it. The request's
storage transaction (`path_creds_create.go:76-80`, `EndTxStorage` at line 242)
rolls back the backend's own writes but cannot reach the remote.

*Corrected 2026-09-26.* This section previously said the secret path does not
revoke on a failed lease write. At this same commit it does, inside
`Register`. The earlier reading stopped at the call site.

The RabbitMQ engine handles its own partial failure the standard's way:
`path_role_create.go:136-150` defers a `DeleteUser` that runs unless
`success` is set at line 209, so a user whose permission grants failed
midway is removed "due to permissions being in an unknown state" rather than
left half-configured.

## Adjacent, in the same function: buffer and ladder

`path_creds_create.go:131-134` sets the remote user's expiration to
`now + ttl + 5s`, with the comment that the TTL "will be calculated again
after this call ... to ensure the database credential does not expire before
the lease"; the renew path at `secret_creds.go:67-75` recomputes the TTL from
`req.Secret.IssueTime` and pushes the remote's `VALID UNTIL` forward by the
same buffer through `UpdateUser` (line 86). That is
[expiry-buffer-beyond-lease](../techniques/expiry-buffer-beyond-lease.md)
at its floor - the buffer covers the issuer's own recomputation gap, which is
the upward lesson the technique took from this line - and the tree's posture
is the seconds-wide one, which is why the revoke in the next paragraph must
be idempotent.

The TTL at line 110 and at `secret_creds.go:67` comes from
`sdk/framework/lease.go:37-110`, the one function every backend calls:
effective max is the mount's `MaxLeaseTTL` narrowed by the backend's and
the explicit max (lines 50-56); a period is capped to that max with a
warning and an explicit max still bounds it from `startTime` (65-77);
otherwise increment, then backend TTL, then `DefaultLeaseTTL` (80-85);
`maxValidTime` is anchored at `startTime`, which the renew path sets to the
issue time; past it the function returns "past the max TTL, cannot renew"
(99), and inside it a TTL beyond the remaining window is capped with a
warning (104-108). The backend discards the warnings it receives
(`path_creds_create.go:110`, `secret_creds.go:67`) because the core's
recomputation of the same function (`internal/vault/request_handling.go:1543`
at create, `internal/vault/expiration.go:1308` at renew) is the one that
reaches the response -
the ladder stated once, in [ttl-ladder-derivation](../techniques/ttl-ladder-derivation.md)'s
terms, with the framework function as its single authority.

## Where the tree's revoke is and is not idempotent

`secret_creds.go:174-184` issues `DeleteUser` with the role's revocation
statements and returns any error; whether an absent user is success depends
on the statements the role configures (the documented example at
`path_roles.go:878` is `DROP ROLE IF EXISTS`, which is idempotent; a role
written without the `IF EXISTS` form is not).
`rabbitmq/secret_creds.go:68` returns any `DeleteUser` error as failure
without distinguishing a missing user - not verified past the call site
into the client library, but nothing at the call site makes the absent case
succeed. Against the seconds-wide buffer above, that is the combination
[idempotent-revoke-and-give-up](../techniques/idempotent-revoke-and-give-up.md)
names as the failure: a revoke that errors on absent, behind a backstop that
routinely fires first.
