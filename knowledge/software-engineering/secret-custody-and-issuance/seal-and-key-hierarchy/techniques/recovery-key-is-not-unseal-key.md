---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: recovery-key-is-not-unseal-key
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [an automatic seal needs a quorum for privileged operations, someone proposes using recovery shares to unseal when the key service is down, initializing a cluster that must mint no long-lived secret, designing what a threshold of humans is allowed to do]
---

# Recovery key is not unseal key

When the seal is automatic, no human holds a share of anything, and the
server still has operations that must not be performed by one person: rotating
the root key, generating a root-level credential, migrating between seals,
resizing the share set itself. The **recovery key** is the quorum credential
for those operations. It is split into shares by the same threshold scheme as
an unseal key would be, held by the same kind of people, presented through the
same kind of ceremony, and it is a different thing, because it **authorizes
and does not decrypt**.

## What a recovery share does

The server stores a copy of the recovery key, encrypted under the seal like
any other value. When a threshold of recovery shares is presented, the server
reconstructs the key and compares it to the stored copy; a match proves that a
quorum was assembled, and the gated operation proceeds. The gate observes the
actual credential against the actual stored verifier
([gate-sees-target](../../../_laws.md#gate-sees-target)), not a hash of the
shares or a count of presenters, because a recovery ceremony is exactly the
place where a proxy would be accepted by an attacker who has learned to
produce the proxy. The reconstructed key is used for nothing else; it wraps no
keyring and decrypts no object, and its compromise yields no plaintext.

The verifier exists so that recovery shares can be **rotated** without
touching the hierarchy: a new recovery key is generated, split, distributed,
and its copy replaces the stored one; nothing else in the store changes. And it
exists so that an automatic-seal cluster can initialize with **zero** recovery
shares and create them later under an authenticated privileged session.
Bootstrap that returns a recovery share set returns a secret that whoever ran
bootstrap must now store; a declarative provisioner that runs bootstrap has
nowhere safe to put it. Minting the shares later, on request, from an
authenticated door, leaves bootstrap with no long-lived privileged output.

## Why the key must not double as an unseal key

The proposal arrives reliably: the key service is down, the operators hold a
threshold of recovery shares, why not let the recovery key unseal? The answer
is that a key with two functions has the security of its weaker use and the
availability of neither. An unseal key must be able to produce the root, so
the root would have to be stored encrypted under the recovery key, which
makes the recovery share set a **second custody of the root** with none of
the declaration, priority, status and rotation a seal carries. The people who
hold recovery shares were told they hold an authorization credential and
were given custody of the store. The vocabulary has two authorities
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
and every procedure that reasons about "who can open the store" is now wrong
about one of them.

The decision rule: when the operators need a way to unseal without the
automatic seal, declare a break-glass **seal**, a human-held threshold seal
with its own encryption of the root, its own priority and its own entry in the
status, and leave the recovery key as it is; because a custody that exists is
a custody that must be declared, and the alternative is a custody that
exists undeclared. The break-glass seal then falls under the weakest-seal rule
and the operators know what they have added. A recovery key that unseals is
the same addition made silently.

## The operations a recovery quorum gates

Root-credential generation, because that credential can do anything the
server can. Seal migration, because it re-encrypts the root under a custody
the migrator chooses. Recovery-key rotation itself, because the holders of
the old set must consent to being replaced. Root rotation **combined with
re-issuing the shares**, because that invalidates what every other holder
holds; the bare root rotation that leaves the shares as they are is a
privileged authenticated operation and no ceremony, as the keyring technique
argues. Each gated operation is behind an authenticated, privileged endpoint
as well as the quorum, and the two are not redundant: the authenticated door
stops an unauthenticated network position from **cancelling** a ceremony in
progress or racing it, which a quorum alone does not stop, and the quorum
stops a single authenticated administrator from acting alone, which
authentication alone does not stop. A ceremony carries a nonce minted at its
start; every share presented names the nonce, a share presented twice is
refused, and cancelling discards the shares gathered so far and leaves the
prior key set valid.

## When recovery mode has nothing to recover with

A server started in a repair mode that bypasses the ordinary unseal, to fix
a broken store or a lost quorum, still needs the recovery quorum to authorize
the repair credential. A cluster initialized with zero recovery shares that
has not since created them has no such quorum, and repair mode cannot be
entered. This is a consequence to state at initialization, not a surprise for
the incident: an automatic-seal cluster without recovery shares has chosen
that its key service is the only thing that can ever open it, and the choice
should be a logged, deliberate one.
