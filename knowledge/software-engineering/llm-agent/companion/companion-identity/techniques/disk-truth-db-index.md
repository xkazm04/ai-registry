---
layer: technique
type: technique
subject: companion-identity
technique: disk-truth-db-index
status: forged
laws: [derivation-names-recomputation, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [choosing where a companion's durable self lives, designing export and import of an agent's accumulated identity, a database and a folder of notes both claim to be the source of truth]
---

# Disk as truth, database as index

A companion's durable self — its constitution, its self-model, its consolidated
knowledge, its episodes — is stored as a folder of plain documents. Any database
over that folder is a **derived index**: it exists for speed and for relational
queries, it is rebuilt from the documents, and when the two disagree the
documents are right.

This is the inverse of the ordinary instinct, which makes the database
authoritative and treats files as an export format. The inversion is deliberate
and it is bought with real cost — writes are slower, atomicity is weaker,
concurrent access needs care. What it buys is worth more.

## What the inversion buys

- **Shared custody.** The person opens the same folder in any editor and reads
  exactly what their companion believes about them, in prose, with no
  application in the way. They correct it by typing. A companion whose beliefs
  about someone are only legible through the software that holds them is asking
  for a trust the person has no instrument to verify.
- **Survivability.** A corrupted index is a rebuild. A corrupted authoritative
  database is a loss — and the loss is of the one asset in the system that took
  years to produce and cannot be regenerated from anything.
- **Portability, nearly for free.** The whole of the next section.
- **Longevity.** Plain documents outlive the application, the schema, the
  storage engine and the vendor. The identity is expected to last longer than
  any of them, which makes any of them a poor place to keep it.

The cost is honestly stated too: this is a store whose engine is a filesystem
and whose concurrent writers include a human with a text editor. The write side
must be disciplined — escape everything, round-trip test the emit-then-parse
path — and the read side tolerant of documents it did not write.

## The index names its rebuild

The index is a stored derived value, and like every stored derived value it must
name how it is recomputed
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Concretely, four properties:

- **A rebuild command exists, is invokable by the person, and is the documented
  answer to every class of index inconsistency.** Not a maintenance script
  somebody wrote once; a first-class operation.
- **The rebuild is total, not incremental-only.** An incremental sync that has
  never been checked against a full rebuild is a hypothesis. Full rebuild is the
  ground truth path, and incremental sync is the optimisation that must agree
  with it.
- **The rebuild is idempotent and safe to run at any time**, including on a
  partially-written folder, because that is when it will actually be run.
- **Writing the index is part of the write, not an afterthought.** Every writer
  that creates a durable item also populates every lane of the index that item
  must be findable through. A record type whose author forgot one lane is
  *stored, correct, and permanently invisible to search* — the worst failure the
  substrate has, because nothing about it looks broken from any surface. The
  index membership is a contract on the write door, not an optimisation applied
  where somebody remembered.
- **Index-only state is forbidden.** The moment something exists in the index
  that is not derivable from the documents — a flag, a counter, a relationship
  the files do not encode — the index has become a second source of truth, and
  the rebuild silently destroys data. Anything that must persist goes in a
  document.

## Every check reads the documents

A gate that inspects the derived copy passes exactly when the copy has diverged
from the source, which is the situation it existed to catch
([gate-sees-target](../../../../_laws.md#gate-sees-target)). So: integrity checks,
export verification, and "does this companion still have its constitution" checks
read the **folder**, not the index. Counting rows to prove the identity is intact
proves only that the index is populated, and a populated index over a deleted
folder is the exact failure the check was for.

The same reasoning applies to the companion's own reading path at boot: it loads
identity from the documents and uses the index for search. A companion that
boots its self-description out of the index is running on a cache with no
invalidation story.

## Identity survives the round trip

Every durable item carries an id minted at creation and stored in the document
itself — not the filename, not the folder position, not a database row id
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). Humans
rename files, titles collide, and a rebuild reassigns every row id it generates.
An item whose identity is its database row cannot survive the rebuild that the
whole design depends on, and links between items become dangling on the first
maintenance operation.

The test is blunt: rebuild the index from scratch and confirm every cross-
reference still resolves. If it does not, the identity is living in the derived
layer.

## Export and import are the capability, not the support tool

Treat "take my companion elsewhere" as a first-class, tested, user-reachable
capability. It is the only way the promise of a long-lived identity is
verifiable — a person cannot check that their years of accumulated relationship
are theirs until the day they try to move it, and the day they try is usually
the day something went wrong.

Because truth is a folder, the export is close to a copy, and the discipline is
mostly about completeness and honesty:

- **Export the truth, not the index.** The archive contains documents; the
  receiving host rebuilds the index. Shipping a database dump reintroduces every
  coupling the design removed, and makes the export unreadable by anything but
  the exact version that wrote it. The corollary is that everything arrives
  unfindable and the import is not complete until the rebuild has run — which
  makes the rebuild path a hard dependency of portability rather than a
  maintenance convenience.
- **Every path in the archive is relative to the store's root.** A stored
  absolute path names a directory on the machine that produced the bundle, and
  an importer that honours it will create that directory on a machine where it
  means nothing. Paths are de-anchored on the way out and validated as plain
  relative names on the way in — the archive is the one place where a path
  crosses a trust boundary between two filesystems.
- **The archive is self-describing.** It states what it contains, when it was
  taken, and what produced it, so a person who finds it in three years can read
  it without the software.
- **What deliberately does not travel is enumerated and gated.** Machine-local
  pointers, rebuildable derived material, and anything the receiving host will
  regenerate are excluded on purpose — and the exclusion list is asserted by
  name in a test, so a field added next quarter cannot quietly widen the
  payload. An export that grows by accident is the same defect as one that
  shrinks by accident, in the direction that leaks.
- **Import is explicit about collision.** Merging one identity into a host that
  already has one is not a file copy; the receiving side states whether it
  replaces, merges, or refuses, and refusing is a legitimate answer.
- **A partial export presented as complete is a failed export.** An archive
  missing a category is worse than no archive, because it will be discovered as
  complete and trusted. Every drop — an unreadable document, an oversize file, a
  cap reached, a store that was not reachable in this context — is reported, and
  the report **travels inside the bundle** rather than scrolling past in a log.
  A memory silently missing from an archive is indistinguishable from a memory
  that never existed, and the person who eventually notices will be reading the
  bundle, not the export session.

## When not to use this

Two situations where the ordinary database-first design is correct. **High-volume
operational data** — telemetry, per-token cost rows, streaming event logs — is
not identity and does not want to be a folder; keep it in a database, and let the
identity documents reference it. And **multi-writer, multi-machine deployments**,
where several hosts write concurrently to the same store: filesystem semantics do
not survive that, and a companion serving a team needs a real transactional store
with the documents as an export. The technique is at its strongest exactly where
companions live — one person, one store, local, long-lived.
