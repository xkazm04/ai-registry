---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: per-tenant-seal-chain
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a tenant wants control of its own availability independent of the operator, a tenant must hold data the operator's root cannot open, sealing one tenant without sealing the server, loading a tenant tree with a sealed subtree in it]
stage: fleet
---

# Per-tenant seal chain

A server hosting many tenants under one root gives each tenant exactly the
operator's posture: when the operator seals, every tenant is sealed, and
whatever the operator's root can open, it opens for every tenant. A tenant
that wants its own control of availability, or that must be able to say the
operator cannot read its data, needs a **chain of its own**. The technique
gives a sealed tenant its own key-encryption key, its own root and its own
keyring, and encrypts the tenant's data only under that chain.

## The chain

The tenant's key-encryption key is the tenant's seal: it is held by the
tenant's own custody, a key service the tenant controls, a hardware module,
or a threshold of shares the tenant's people hold, and it is the analogue of
the server's seals one level down. The tenant's root is encrypted under it.
The tenant's keyring is wrapped by the tenant's root, and rotates by the same
append-only mechanism the server's keyring does, with its own terms and its
own operation count. The tenant's stored objects are encrypted under the
tenant's active term, under the tenant's keyring, under the tenant's root,
under the tenant's key-encryption key, and at no point under the server's.

That last clause is the point and it is where the naive design fails. The
tempting shape is double encryption: the tenant's chain inside the operator's
chain, so that the tenant's data is protected by both and the operator's
tooling keeps working. It gives the tenant a lock and leaves the operator
holding a key to the lock, because a value that must be decrypted under the
operator's chain before the tenant's is a value the operator's chain can
reach. The decision rule: when a tenant must be able to deny the operator
access, the tenant's chain is the **only** chain over its data, because
confidentiality against a party is the property of having no path through
that party's keys, and no amount of encrypting inside the party's envelope
adds it. The server's global root then provably cannot decrypt the tenant.

## Sealing cascades down; loading stops at a seal

A tenant tree has children. Sealing a tenant seals every descendant, because
a child's chain is reached through its parent's storage and a child whose
parent cannot be read cannot be read either. The cascade is a property of the
layout, not a policy that has to be enforced, and a design where a child
stays open while its parent is sealed has stored the child somewhere the
parent's seal does not cover, which is a second copy nobody intended.

Sealing is also the moment the parent **forgets** the descendants: their
in-memory records, mounts and routes are torn down, post-order, so that no
handle to a child's storage survives its parent's seal, while the sealed
tenant's own record is retained, so that its name still resolves to
"sealed". Unsealing is the reverse walk and it is atomic in effect: the
tenant's chain is opened, its subtree is loaded and every mount and
credential store beneath it is brought up, and if any step fails the tenant
is sealed again rather than left half-loaded, because a tenant that is
readable but not fully served is a state no caller can reason about.

Loading the tree at unseal, and at every walk of it afterward, proceeds from
the root tenant down and **stops** at a sealed child. The child is entered
into the tree as sealed, its descendants are not visited, and the walk
continues with the next sibling. The two ways this goes wrong are both about
what a sealed child is rendered as. Rendered as absent, a sealed tenant
disappears from listings and its paths become "not found"; a caller that
creates a tenant of the same name has now shadowed a sealed one, and the
tenant's data is orphaned under a chain nobody will unseal. Rendered as empty,
a sealed tenant's mounts, policies and identities read as none, and a
reconciler that "fixes" the empty tenant by re-creating its defaults has
written under a chain it does not hold. A sealed tenant is a value with a
name ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)):
it exists, it has a path, it is sealed, and every operation against it
returns a sealed error that the caller can distinguish from empty
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## Order of unseal

A tenant's parent must be unsealed before the tenant can be, because the
tenant's seal configuration, the thing that says how many shares or which
service opens it, is encrypted under the parent's chain, and the tenant's
encrypted root and keyring are reached through the parent's names. The one
place the layout differs from the server's own is exactly here: the
server's seal configuration is plaintext, because nothing is readable before
it, while a tenant's is ciphertext under its parent, because the parent is
readable first. The same code path serves both, dispatching to raw storage
for the root tenant and to the parent's barrier for a child, and a design
that stores every tenant's seal configuration in plaintext has published the
shape of every tenant's custody to whoever holds the disk. Unsealing the tenant is
presenting its key-encryption key, or its threshold of shares, to a door
scoped to that tenant, and it produces the tenant's root in memory and
nothing else. Unsealing the server does not unseal a sealed tenant, and a
restart leaves every sealed tenant sealed until its own custody is presented;
where that custody is automatic, every tenant's key service must be reachable
at restart before that tenant serves, and the server as a whole must not wait
for them. Each tenant comes up when its chain does.

## Rotation and recovery per tenant

The tenant's keyring rotates by append under the tenant's own triggers. The
tenant's root rotates by re-wrapping the tenant's keyring and re-encrypting
under the tenant's key-encryption key, and it needs the tenant's quorum, not
the operator's, for the same reason the server's root needs the server's: the
people who hold the custody are the people who consent to changing it. A
tenant with a threshold custody holds its own recovery shares, and they are,
as at the server level, an authorization credential and not an unseal path.

## What the technique does not give

It does not give the tenant a failover story the server does not have; a
tenant whose key service is unreachable is sealed until it is reachable,
and the operator cannot help, which is what the tenant asked for. It does not
protect the tenant from the operator's control of the storage, who can still
delete or roll back the tenant's ciphertext, and it does not protect against
a reader of the process's memory while the tenant is unsealed. It is
confidentiality against the operator's keys, and it should be sold as
exactly that.
