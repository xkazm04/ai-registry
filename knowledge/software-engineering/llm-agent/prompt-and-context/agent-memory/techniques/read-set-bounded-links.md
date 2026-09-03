---
layer: technique
type: technique
subject: agent-memory
technique: read-set-bounded-links
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, deletion-is-not-repair]
shared_with: []
use_when: [letting a model write links between memories, links break when a memory is renamed or moved, a relink forces a re-embed, deciding whether links live in the body or beside it, auditing a store for dangling references the model authored]
---

# Read-set-bounded links

When consolidation lets the model relate one memory to another — this event
evolved from that preference, this fact contradicts that one — it is letting
the model author **references**, and a reference authored by a model has two
ways to be wrong that a reference authored by code does not. It can point at
nothing, because the model named a target from its training rather than from
the store; and it can point at the wrong thing, because names are not
identities and two memories can share a title. Both failures are silent: a
dangling link is followed, not read, so the reader finds an absence and cannot
tell whether the memory was deleted, renamed, or never existed.

## The model names, code resolves

The mechanism that removes the first failure entirely is a **request-local
identity map**. Before the distillation pass, every memory the pass reads in —
prefetched, searched, opened — is assigned a small integer, and the model is
told to refer to existing memories only by that integer. Memories the pass is
about to create get integers from a disjoint range, assigned as the model
emits them. After the pass, and only then, code resolves every integer back to
a durable address and writes the links. The integers are never persisted; they
are the vocabulary of one pass and mean nothing outside it.

The property this buys is stronger than validation: **a link can only target a
memory that was read in or is about to be written**, so a dangling link cannot
be produced, and no background audit for dead links is required. The
alternative designs each pay for the property they lack — a regex that
auto-links entities in the body cannot verify a target exists; a compile-time
backlink pass goes stale after any hand edit; a free-text target slug is a
guess dressed as a reference.

The disjoint ranges matter. A model that can emit a new memory and refer to it
in the same pass needs the reference to be unambiguous before the memory has an
address, and "1-99 exist, 100 and up are being minted" is the whole rule.

## Links are metadata, rendered at read time

The second decision is *where the link lives*. A link written into the body —
a wiki-style bracket, a relative path — is subject to everything the body is
subject to: it breaks when the target is renamed, and it forces a re-embed of
the source every time it is retargeted, because the body changed. Stored
**beside** the body, as a typed record with the target's identity, an optional
weight and a short reason, the link survives a rename by construction and a
retarget touches metadata only, so the write stays idempotent and the
embedding stays valid. Whatever prose the model wrote to introduce the link is
kept as the link's *match text* and substituted into the body only on
user-facing surfaces — never into what gets embedded, prefetched, or fed to a
later consolidation pass, which read the raw body.

Write every link on both ends: the same record under the source's `links` and
the target's `backlinks`. Bidirectionality is what makes deletion honest — the
[decay-and-forgetting](./decay-and-forgetting.md) rule that a deletion must
know what it orphans is only answerable if the target already lists who points
at it.

## What this does not decide

A typed, weighted link is a relationship, and whether relationships earn a
place in *recall* is the retrieval subject's question, not this one's; the
store may hold a graph nobody traverses at query time and still want the
links for audit and supersedence. Nor does bounding the read set bound the
*truth* of a link: the model can relate two memories that were read in and
still be wrong about how. That error is caught where every other belief is —
by [consolidation](./consolidation.md)'s judgment and by provenance — and a
link should carry the same provenance a memory does: which pass wrote it, from
what evidence.

## When not to use it

A store whose links are all written by code from known identities — a
consolidation writer stamping "derived from these three sources" from the
batch it was handed — already has the property, because the writer's inputs
*are* the read set. Do not add a model-facing identity map to a path the model
does not author. The technique is for the moment the model is allowed to say
"this is related to that", and it should arrive with that permission, not
after the first audit finds references to memories that never existed.
