---
layer: technique
type: technique
subject: credential-vault
technique: versioned-key-window
status: forged
laws: [one-validation-door, deletion-is-not-repair, unknown-is-not-a-value]
shared_with: []
use_when: [a key the vault owns must rotate without re-encrypting what it sealed, deciding which key versions may still open ciphertext and which may still seal, trimming old key versions from a live policy, a deleted key keeps answering because a rotation raced the delete]
---

# Versioned key window

[rotation-and-remediation](./rotation-and-remediation.md) says *when* a key
rotates and how the overlap is run; [encryption-at-rest](./encryption-at-rest.md)
says the envelope carries a version byte so a ciphertext can name the key that
sealed it. This technique is what sits between the two once the vault owns a
key it can re-mint on demand — a data key, a sealing key served to callers as
a service — and the key stops being a value and becomes a **family of
versions**. The seam with rotation-and-remediation is the mintability: a
foreign credential rotates by that technique's four-step overlap because the
vault cannot mint its successor; a key the vault mints rotates by appending a
version, and the questions become which versions may still open, which may
still seal, which may be forgotten, and what a version the policy has never
seen means.

## Four ordinals, one invariant

A key policy carries four version ordinals and they are ordered:

> **minimum available ≤ minimum decrypt ≤ minimum encrypt ≤ latest**

*Minimum available* is the oldest version the policy still holds material
for; below it, nothing can be done at all. *Minimum decrypt* is the oldest
version permitted to open ciphertext — raising it is how an operator retires
old ciphertext by refusing it rather than by hunting it down. *Minimum
encrypt* is the oldest version permitted to seal — a floor under rewrap and
under callers who pin a version, so that "re-encrypt under a current key"
cannot quietly choose a version already scheduled for retirement. *Latest* is
the version new writes use when they name none.

The invariant is enforced **at every write of the policy**, through one
validation door, not per endpoint
([one-validation-door](../../../_laws.md#one-validation-door)). The naive
shape gives each of the four ordinals its own configuration endpoint, each
checking its own value against latest, and the window silently inverts: an
operator raises minimum decrypt above minimum encrypt, rewrap now seals under
a version decrypt refuses, and the next read of anything rewrapped fails with
an error that looks like corruption. When any ordinal changes, revalidate the
whole chain and refuse the write that breaks it, because the ordinals are one
fact stated four times and a partial update of one fact is not a state the
system has a name for.

## Ciphertext carries its version, and the policy judges it

Every ciphertext the policy produces is prefixed with the version that sealed
it. The prefix is not decoration for future migration; it is the input to a
decision the policy makes on every open. Below minimum decrypt, the policy
refuses — that ciphertext was retired deliberately and the refusal is the
retirement working. Above latest, the policy also refuses: a version it has
not minted is either a blob replicated from a node that has rotated further,
or a forgery, and in neither case is "try the newest key I have" an answer.
The naive fallback — treat an unknown version as latest — turns a
version-mismatch into an authentication failure at the cipher, which is
indistinguishable from corruption exactly when custody has changed
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). A
version outside the window is a *named* refusal with the version in the
message; the cipher is never asked.

The same prefix is what makes a rewrap honest: rewrap reads the version from
the ciphertext, opens under it, and seals under latest — or under the caller's
pinned version, floored at minimum encrypt. A rewrap that cannot tell which
version sealed the input has to try them in order, and a key family with
thirty versions turns every rewrap into thirty authentication attempts, the
last twenty-nine of which are indistinguishable from an attack in the audit
trail.

## Rotation mutates, persists, and restores on failure

Appending a version is three steps in a fixed order: derive the new version
and attach it to the in-memory policy with latest advanced; persist the
policy; and, **if the persist fails, restore the in-memory policy to what it
was before the derivation**. The order matters in both directions. Persisting
before mutating means a crash between the two leaves storage ahead of memory,
and the running process serves a stale latest while replicas have moved on.
Mutating without restoring on a failed persist is worse: the process now
seals under a version that exists nowhere durable, and every ciphertext it
produces until restart is unreadable after restart. The rule is that a
rotation whose witness did not land did not happen, and the in-memory state
must agree — the same coupling rotation-and-remediation demands of its
ledger, applied here to the key material itself.

Rotation is serialized per key under the same lock the policy's other writes
take, because two rotations interleaving produce two "latest" values and one
of them loses its material on the second persist.

## Retirement has two tiers, and only the second destroys

Raising minimum decrypt retires ciphertext; it does not retire key material.
Versions that fall below the decrypt floor leave the live policy and move to
an **archive** record keyed by the policy — a cold copy that the live set is
pruned from **only after the archive write is durable**, and that a later
lowering of the floor restores from. The archive is never shrunk by this
movement, including when versions move back out of it. This tier is
reversible by construction, which is what makes it cheap to allow: the
operator is moving material from a hot record to a cold one, and the decision
needs no ceremony beyond the window check.

Raising minimum available is the second tier, and it is the one that
destroys: versions below it are cut from the archive too, and nothing below
that floor can be recovered. So the available floor is **monotone** — it can
be raised and never lowered — and it may be set only once both the decrypt
and encrypt floors are set, and never above either of them, because a
destruction that outruns the retirement it was supposed to follow deletes
material ciphertext still names. Two tiers, stated separately, are how an
operator can be offered a cheap reversible retirement and an expensive
irreversible one without the first quietly being the second.

Order inside a write is the rest of the discipline. Prune the live set first
and archive second, and a failed archive write deletes key material that
ciphertext in the wild still names; that ciphertext is now permanently
unreadable, and the operation that did it was called "trim" and reported
success ([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair) —
removing versions to shrink a policy is housekeeping, and housekeeping that
can destroy data is not housekeeping). Archive first, prune after, and restore
the in-memory set if the archive write fails.

## A deleted key refuses through one guard

Deleting a key family is a **soft delete**: the policy is marked deleted and
kept, and one predicate — *is this policy deleted* — is checked at every
entry point that would use it: encrypt, decrypt, sign, verify, rewrap,
rotate, export, trim, configure. The predicate is one function; the entry
points are enumerable; a new entry point that forgets it is a review finding,
not a silent hole.

The case that proves the guard has to be a state of the policy and not an
absence from a map is the rotation that was already in flight when the delete
landed. A rotation holding a reference to the policy, served after the delete
but built from a copy taken before it, would happily append a version to a
key that no longer exists, persist it, and resurrect the key. With deleted as
a state the rotation re-reads the predicate and refuses. With deleted as
absence, the rotation's persist is an upsert and the key is back, with a
fresh latest and no operator who asked for it. When a key is deleted, mark
it and keep the mark, because the next writer to hold a reference will
otherwise recreate it from its own stale copy.

The mark therefore lives in two places when the vault caches policies in
memory, and the two are not redundant. The **soft-delete flag is persisted**
in the policy record and is what every operation checks, so that a restore
can clear it and the key returns with its configuration intact. The
**in-memory tombstone** is set on the cached object at the moment of delete,
before the cached entry is dropped and storage is cleared, so that any
request still holding that object — the in-flight rotation — sees it on its
next persist and refuses. Persist checks the tombstone; the operations check
the flag; a hard delete sets the tombstone and a soft delete sets the flag,
and neither path relies on the other reader having already forgotten the
key.

## When not to use it

A single-version key with no rewrap path and no callers pinning versions
needs the envelope's version byte and nothing here. A foreign credential the
vault cannot re-mint rotates by overlap, not by window, and forcing it into
this shape produces a policy whose "latest" is whatever the provider last
handed over — a description, not a control. And a window is only as good as
the guard at the door: a policy whose ordinals are validated in one code path
and bypassed by an import or a restore path has an invariant on paper.
