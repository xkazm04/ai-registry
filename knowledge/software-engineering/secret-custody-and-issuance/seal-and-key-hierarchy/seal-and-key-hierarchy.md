---
layer: golden-path
type: golden-path
subject: seal-and-key-hierarchy
status: forged
use_when: [designing how a secrets server protects its own storage, adding a second custody or a break-glass path to a root key, deciding what rotates by appending and what rotates by a quorum, giving a tenant its own key chain]
techniques:
  - any-one-seal-unseals
  - recovery-key-is-not-unseal-key
  - append-only-keyring-rotation
  - transient-upgrade-entry
  - usage-triggered-rotation
  - per-tenant-seal-chain
---

# Seal and key hierarchy

A seal and key hierarchy is the structure by which a server that stores secrets
protects **its own store** from the storage it sits on. The storage engine, the
transport to it, the backup that copies it and the operator who can read the
volume are all untrusted by design; the only thing between them and every value
the server holds is a cipher and the custody of one key. The subject is the
shape of that custody: how many layers of keys stand between the root and the
ciphertext, which layer rotates by which mechanism, how many independent
parties or devices can each open the store on their own, what a break-glass
credential is allowed to do, and whether a tenant of the server can hold a
chain the server's own operators cannot open.

The principal-engineer stance is that a key hierarchy is a **state machine with
a boundary**, not an encryption setting. A server with this hierarchy is at
every moment either sealed or unsealed. Sealed, it holds no key material in
memory, can read nothing from its storage, and answers exactly two questions:
what is your status, and here is a piece of key material, try to unseal.
Unsealed, it has recovered the root key from somewhere outside the store and
from it the keys that open everything else. Every design decision in the
subject is a decision about what that boundary requires, who can cross it, and
what survives on either side of it.

## The three layers, and why each rotates differently

The load-bearing structure is three keys, not two. At the bottom, a **data
key** encrypts every object that goes to storage, under an authenticated cipher
with a fresh nonce per object, so that the raw store yields ciphertext whose
tags verify and nothing else. Above it, a **keyring** holds every data key that
has ever been active, each under a small integer *term*, and the ciphertext of
every stored object begins with the term that produced it. Above the keyring, a
**root key** wraps the keyring and is itself never stored in plaintext
anywhere. Above the root sits the **seal**: whatever custody recovers the root
key at unseal time, whether a threshold of human-held shares, an external key
service that decrypts on request, a hardware module, or a static key handed to
the process by its environment.

Three layers exist because three different things have to rotate, and each has
a different cost. The data key must rotate often, because an authenticated
cipher has a hard operation budget per key and a busy server spends it in
weeks; so its rotation must be cheap, online, quorum-free, and must never touch
existing ciphertext. That is [append-only-keyring-rotation](./techniques/append-only-keyring-rotation.md):
add a term, start writing under it, keep every old term for reads. The root key
rotates rarely, because it is the key an operator would need to steal to open
the store, and its rotation means re-wrapping the keyring under a new root and
re-encrypting the new root under each seal's key; that is a privileged
authenticated operation and no ceremony, because nobody outside the server
holds the root. The seal's own key rotates by whatever the custody offers,
and where the custody is a threshold of human-held shares, re-issuing the
shares is the one rotation that needs a threshold of the current holders,
because it changes what they hold and a single operator must not be able to
issue themselves the new set. A design with two layers forces one of these
rotations to pay the cost of another: either every data-key rotation becomes
a ceremony, or every root rotation re-encrypts the corpus. The naive reading,
"rotation means re-encrypting", is the reading that makes rotation so
expensive that it never happens.

Rotation is triggered by measurement, not by calendar alone. The server counts
the cipher operations it performs cluster-wide and rotates the data key before
the count reaches the cipher's published limit; it also rotates on an interval
and on age, whichever comes first. The count is itself persisted through the
barrier, so the write that saves the count is a cipher operation that has to be
counted. The whole discipline is [usage-triggered-rotation](./techniques/usage-triggered-rotation.md);
its failure mode is the operator estimating the count from request metrics and
being wrong by the writes the metrics never saw.

## Replicas cross the rotation without a fresh unseal

A replica holds the keys it had when it unsealed. When the leader appends
term N+1, the replica cannot read anything written under it; when the leader
rotates the root, the replica cannot read the keyring at all; and if the
leader fails in either window, the replica cannot lead. The answer is not to
re-unseal every replica, which reintroduces the human or the key service
into a path that must be automatic. It is a **transient entry**: the leader
publishes term N+1 encrypted under term N for a bounded window, replicas
read it under the key they already hold, and the entry is deleted once the
window closes; the new root is bridged the same way but permanently, under
the keyring's newest term, because a party holding the keyring holds the
root already. This is [transient-upgrade-entry](./techniques/transient-upgrade-entry.md).
The transient entry is an opening of the seal door under a retired key,
once, with a named lifetime, and its deletion is part of its creation.

## N custodies of one root, and the weakest one decides

A single custody of the root key is a single lifecycle dependency on that
custody. When the custody is an external key service and the service's key is
deleted, or the region is unreachable, or the account is closed, the store is
unrecoverable, and it is unrecoverable from every backup too, because every
backup is ciphertext under the same root. The design that survives this holds
**N independent encryptions of the one root**, one per seal, unsealed in a
declared priority order: the first seal that can produce the root wins, and
the others are never consulted. The two-seal form, an automatic primary with a
human-held threshold behind it, is a strict subset of the N-seal form, and a
design that special-cases two seals will be rewritten when the third arrives.
The rule that governs the choice of seals is that they must fail
independently, because the store's confidentiality is exactly that of its
**weakest** seal: an attacker needs any one of them, not all of them. This is
[any-one-seal-unseals](./techniques/any-one-seal-unseals.md).

## A break-glass credential authorizes; it does not decrypt

When the primary seal is an external service, the operators still need a
credential for the privileged operations the server gates behind a quorum:
generating a root-level token, migrating between seals, re-issuing the share
set itself. That credential is the **recovery** share set. The recovery shares are verified
against a stored copy of the recovery key; presenting a threshold of them
proves the quorum was assembled, and that is all it proves. They never decrypt
anything and cannot unseal the store. The rejected design is to let the
recovery key double as an unseal key when the primary service is down, which
sounds like resilience and is in fact a second, weaker custody of the root
added by accident. A break-glass unseal path is a *seal*, declared as one,
holding its own encryption of the root, and subject to the weakest-seal rule
above. This is [recovery-key-is-not-unseal-key](./techniques/recovery-key-is-not-unseal-key.md).

## The seal exists before storage is readable

Everything the server needs to reach the unsealed state must be available
while it is sealed: the seal configuration, the identity of the seals and their
priority, the address and credential of an external key service, the code
that speaks to that service. None of it can live behind the barrier, because
the barrier is what it opens, and none of it can live in a catalog that storage
serves, because storage is unreadable until it is open. It lives in the
process's configuration and in plaintext, and it is loaded before the storage
layer is initialized. The consequence for extensibility is that a custody
mechanism is declared to the process at start, never registered through the
API, and a mechanism that runs as a separate process must be fetched and
started before the store is opened. A design that puts seal definitions
anywhere storage-backed discovers the circularity on the first restart after
the key service moves.

## A tenant can hold a chain the operator cannot open

A server that hosts many tenants under one root key gives every tenant the
availability of the whole: sealing the server seals everyone, and the
operator's root opens everyone. A **sealed tenant** has its own
key-encryption key, its own root and its own keyring, with the tenant's data
encrypted only under its own chain; the global root cannot decrypt it. Sealing
a tenant cascades to its children, and loading the tenant tree stops at a
sealed child, which is reported as sealed and never as empty. A tenant's parent
must be unsealed before the tenant can be, because the tenant's chain is
reached through the parent's. This is [per-tenant-seal-chain](./techniques/per-tenant-seal-chain.md).
The rejected design is double-encryption under the parent's chain, which
gives the tenant a lock but leaves the operator holding a key to it.

## Boundary with the credential vault

The [credential vault](../../security/identity-and-access/credential-vault/credential-vault.md)
holds **other people's secrets**: credentials issued by external authorities,
on loan, walked through acquisition, brokered use, refresh, rotation and
retirement. Its encryption-at-rest technique models the envelope over those
values, one master key in one custody chosen per deployment posture, and one
seal/unseal door that every writer passes through. This subject owns what
that technique holds constant: **the server's own hierarchy** above the
master key, the plurality of custodies over one root, rotation split by layer
and by mechanism, the replica's path across a rotation, the recovery quorum as
a distinct thing from a custody, and the tenancy of whole chains. The rule a
reader uses to pick is the question being asked. When the question is how a
foreign value is sealed, used and retired without ever leaving the process
that holds it, read the credential vault. When the question is who can open
the store itself, how many custodies can, what happens when one of them is
gone, and whether a tenant can hold a key the operator cannot, read here. The
one door the vault prescribes is assumed by this subject and not restated; the
hierarchy sits behind that door and decides what the door is keyed with.

## The failure modes of the naive reading

"Encrypted at rest" read as "safe" ignores that the threat model is the store
without the process; it says nothing about an attacker who controls the
backend, who can delete or roll back ciphertext, and it says nothing about a
reader of process memory. The subject states both exclusions and does not
pretend to cover them. "One key service is enough" read as an availability
choice is a lifecycle choice: the service's key becomes the one artifact whose
loss is total. "Recovery keys are backup unseal keys" adds a custody nobody
designed. "Rotate by re-encrypting" makes rotation an event instead of a
habit. "Count from the metrics" undercounts by exactly the writes the server
does on its own behalf. Each of these is what a competent team does when it
reads the hierarchy as a setting instead of as a boundary, and each of the six
techniques exists because one of them was paid for.

## The techniques

- [any-one-seal-unseals](./techniques/any-one-seal-unseals.md) - one
  independent encryption of the root per seal, tried in priority order; the
  store's security is the weakest seal's; the two-seal form is a subset of N.
- [recovery-key-is-not-unseal-key](./techniques/recovery-key-is-not-unseal-key.md) -
  recovery shares authorize privileged operations against a stored
  verifier and never decrypt; a break-glass unseal is a seal, not a recovery.
- [append-only-keyring-rotation](./techniques/append-only-keyring-rotation.md) -
  the data key rotates by appending a term, ciphertext carries its term,
  nothing is re-encrypted and no quorum is needed; the root rotates by
  re-wrapping the keyring under authentication, and only re-issuing the
  shares needs the quorum.
- [transient-upgrade-entry](./techniques/transient-upgrade-entry.md) - term
  N+1 published under term N for a bounded window so a replica can lead
  without a fresh unseal, deleted after the window; the root bridged
  permanently under the keyring's newest term.
- [usage-triggered-rotation](./techniques/usage-triggered-rotation.md) -
  count cipher operations cluster-wide; rotate on a maximum below the
  cipher's limit, on an interval, or on age; count the write that persists
  the count.
- [per-tenant-seal-chain](./techniques/per-tenant-seal-chain.md) - a sealed
  tenant owns its key-encryption key, root and keyring; the global root cannot
  open it; sealing cascades down; loading stops at a sealed child.
