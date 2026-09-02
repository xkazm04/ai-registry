---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: append-only-keyring-rotation
status: forged
laws: [identity-survives-reuse, deletion-is-not-repair]
shared_with: []
use_when: [rotating the key that encrypts stored objects without re-encrypting the store, deciding which key rotation needs a quorum, a ciphertext must say which key produced it, a proposal to prune old keys from the keyring]
---

# Append-only keyring rotation

The key that encrypts stored objects rotates by **appending**, never by
replacing. The keyring is an ordered list of data keys, each under an integer
term; rotation generates a new key, appends it under the next term, and makes
it the active key for writes. Every earlier term stays in the keyring, and
every object written under it stays as it was. Reads consult the term the
ciphertext names, writes use the active term, and the store is never
re-encrypted.

## Ciphertext carries its term

The first bytes of every stored object are the term that encrypted it, in the
clear, ahead of the nonce and the ciphertext. This is what makes rotation
representable at all: a reader can tell which key to use without trying them
in turn, a migration can be measured as "objects still under term N", and a
wrong-key decrypt is a lookup failure with a name rather than an
authentication failure indistinguishable from corruption. The term is minted
once, at rotation, and carried by every object it produces
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)); it is
never reused, never renumbered, and never inferred from an object's position
or age. The term does not need to ride in the associated data to be safe from
relabelling: an object whose term prefix is rewritten is opened under the
wrong key and fails its tag. What must ride in the associated data is the
object's identity, its storage path, so that a ciphertext moved from one
record to another fails to open; the envelope also carries a version byte
after the term, so that the associated-data rule itself can change without a
big-bang re-encryption.

## Why this layer needs no quorum

The data keys never leave the server. No operator holds one, no share of one
exists, and nothing outside the process can produce one. Rotation is therefore
an operation the server performs on itself, at the request of an authenticated
privileged caller and on its own schedule, and there is nobody whose consent
it needs. This is the property that makes a data-key rotation cheap enough to
happen weekly, and it is the reason the layer exists as a separate layer at
all: the key that must rotate often is the key nobody holds.

The **root key** is the other case. It wraps the keyring and is recovered by
the seals at unseal; it rotates by generating a new root, re-wrapping the
keyring under it, and re-encrypting the new root under every seal's key. Two
distinct operations hide under the one name, and the quorum belongs to only
one of them. Rotating the root alone changes nothing any human holds: each
seal's key, a service's key or the threshold-recovered key the share holders
combine to, re-encrypts the new root exactly as it encrypted the old, and the
shares stay valid. That operation is privileged and authenticated and needs
no ceremony. Rotating the root **together with the shares**, so that a new
share set is issued and the old set stops working, does need the quorum,
because it changes what the holders of the old set hold, and one operator
performing it alone would issue themselves the new set and invalidate
everyone else's. The decision rule: when a rotation re-issues what the
share holders hold, it needs a threshold of the current holders, because the
holders are who the seal is; when a rotation changes only what the server
holds behind the seals, the root included, it needs authentication and
nothing else, because nobody outside holds that key. A design that gates
everything behind the quorum rotates the data key never and the root rarely;
a design that gates nothing lets one administrator re-issue the shares.
The historical shape that conflated the two, one "rekey" verb that rotated
root and shares in one unauthenticated ceremony, was also the shape an
unauthenticated network position could cancel silently; putting every
rotation behind an authenticated door fixed both.

## Old terms are retained, not pruned

Objects that are never rewritten, retired records kept for audit, entries
written once at initialization, remain under the term that wrote them for as
long as they exist. Deleting an old term from the keyring converts every such
object from "encrypted under a key we would rather not use" into "unreadable",
which is data loss described as hygiene
([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair)). The
correct way to retire a term is the one every encryption migration uses:
rewrite the objects still under it, measure that the count under it is zero,
and only then remove the key. A keyring that has grown to a hundred terms
over a decade is a keyring that has been rotated correctly, and the storage
cost of a hundred keys is not a reason to lose one object.

## The keyring is one object under the root

The keyring is stored as a single blob, wrapped by the root key, and rotation
of a data key is a rewrite of that blob. The naive alternative, storing each
term as its own object, spreads the keyring across writes that can partially
land and gives a replica a window in which it holds some terms and not
others. One blob, written atomically, read atomically, means a reader has
either the keyring before rotation or the keyring after and never a keyring
missing the term an object names. The blob also carries the root key itself,
so that the server can re-wrap and rewrite the keyring from the keyring
alone, and so that holding the keyring and holding the root are the same
fact, which the replica bridge in the next technique relies on.

## What rotation does not do

It does not rotate the seal's own key; that is the seal custody's operation,
performed by re-encrypting the root under the seal's new key. It does not
re-encrypt stored objects, and a proposal that it should, "so that the old key
is really gone", is a proposal to make rotation cost the size of the store,
after which rotation stops happening. And it does not run on a replica: the
keyring is written by the leader, and a replica learns a new term through
the transient path described in the subject's next technique, not by being
unsealed again.
