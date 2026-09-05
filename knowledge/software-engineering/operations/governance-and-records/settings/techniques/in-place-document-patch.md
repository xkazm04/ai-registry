---
layer: technique
type: technique
subject: settings
technique: in-place-document-patch
status: forged
laws: [unknown-is-not-a-value, identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [a round trip through an older build silently deleted configuration the newer build had written, the settings surface stopped updating after a reload because the object it was bound to was swapped out, deciding whether a load replaces the runtime settings object or patches it, a machine-generated map inside the settings document accumulates entries nobody prunes, deciding whether comments and hand formatting must survive a settings round trip]
---

# In-place document patch

Most of this subject assumes many rows, one per key: a write touches one row,
a read touches one row, and the store's granularity is the key
([key-registry](./key-registry.md)). A large class of settings does not live
that way. The whole space is **one stored structural document** — a nested
tree of named members — loaded whole at startup and written whole on save.
That substrate is the right choice often enough to be worth getting right: it
is one file an operator can copy, diff, and hand to support, and it is the
only shape in which a person can edit their configuration without the
application running.

It also makes two facts true that the row store never had to think about. The
running build reads a document **it did not necessarily write**, and
everything that consumes settings holds a reference to **one runtime object**.

The naive load ignores both. Deserialize the document into a fresh object
graph, install it in place of the old one, done — one line, obviously
correct, and it destroys information twice: once in the document, once in the
running process.

## The document outlives the build that reads it

A payload is produced and consumed at two ends of one version contract and
discarded. A settings document is nothing like that. It is long-lived, edited
by hand, carried across upgrades, and read by more than one build — the newer
one the user is trying, the older one they rolled back to, the second
installation sharing a synced profile.

Whole-graph replacement makes the reading build's schema the whole truth.
Every member the deserializer did not recognize is absent from the new graph,
and the next save writes the new graph. The user's configuration for
everything the *other* build owns is gone — with no error, no prompt, and no
record, because from inside the process nothing failed. It is usually reported
as a feature having broken rather than as data loss, which is why it survives
so long.

This is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
at the member level. A key this build's schema does not name is **unknown**,
not absent, and dropping it renders unknown as a definite claim — *this
installation has no such setting* — at exactly the boundary where nothing
downstream can doubt it.

So the commitment is the inversion of the naive load: **the stored document is
the source of truth, and the load patches the runtime object from it rather
than rebuilding the object from it.** What the build understands is applied.
What it does not understand stays where it already is — in the document,
untouched, because the document is the thing that persists and the object is
not.

## Replacement also breaks the identity the observers hold

The second loss is in the process. Everything that reads settings holds a
reference to the settings object: the presentation layer's bindings, change
subscriptions, computed values derived from a key. Swap the graph and every
one of those is attached to an object nothing writes to any more. Nothing
throws; the surface simply stops moving, and it stops moving only after a
reload, which is the least-tested path in the store.

The usual repair is a re-attachment pass after every load, which is a
discipline every new observer must remember, and disciplines decay. Patching
removes the need for it. The object is minted once, at startup, and every
subsequent load is a **mutation of that object**
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)):
identity survives the reload, so the bindings do.

The same rule applies one level down, and this is the half implementations
skip. A collection is not rebuilt from the document's list — the collection
instance is kept and its items are **synchronized in place**, added, removed
and updated against what the document now says, because the observers are
attached to the collection itself and not to the member that holds it. A patch
that preserves the root object and rebuilds every collection beneath it has
done the easy half and left the visible failure exactly where it was.

The runtime object is a derived copy of the document, so it must name how it
is recomputed
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
"Patch from the document" is that path, and stating it has a consequence
worth taking: the path must be **invokable at any time**, not only at startup.
An external edit, a restore, a change arriving from another installation all
reload through the same door — and a design where reload is only reachable by
restarting has a recomputation path it cannot invoke.

## Preservation is the default; pruning is opt-in per subtree

Keeping unknown members is the default and needs no justification per section.
**Removing** them does, and the declaration is made per subtree, in the same
place the subtree's schema is declared, so anyone reading the schema can see
which sections are lossy. Three shapes earn it:

- **Machine-owned generated maps.** A subtree the application writes and no
  person edits — derived positions keyed by item, per-entity bookkeeping
  whose keys come and go. There is no author's intent to respect, and without
  pruning the subtree grows for the lifetime of the installation.
- **Switch dictionaries where a stale entry is actively harmful.** An entry
  the current build no longer recognizes is still read by the older build
  beside it, and there it re-enables a path that was retired for a reason.
  Preservation here preserves a hazard rather than a preference.
- **Strict-schema sections** whose contract is *exactly these members*, so a
  foreign member is evidence the section was written by something whose
  meaning cannot be reconciled rather than extended.

And the negative rule, which is the one that matters: **pruning is never the
default for a section a person edits.** The asymmetry is deliberate and it is
not close. The cost of keeping a member nobody needs is a slightly larger
file. The cost of dropping a member somebody needed is their configuration,
silently, with nothing to restore it from except a backup they have to know
exists.

## The write is the same traversal in reverse

A runtime change does not re-serialize the graph. It resolves to a **path**
in the document, serializes only the subtree that path names, replaces that
subtree, and leaves every sibling untouched — including the siblings it cannot
interpret. The writer's authority is exactly the region its schema covers, on
the way out as on the way in.

The file half of the save is already owned in this subject and is not
restated: the write is debounced so a continuous control does not produce a
write per movement ([save-experience](./save-experience.md)), and it lands
atomically over a bounded rotation, with a restore surface at the point of
load failure ([config-backup-and-restore](./config-backup-and-restore.md)).
Two details are specific to this substrate and belong here. Serialize to
**memory first** and only then write and replace, so a serialization failure
in one subtree cannot leave a truncated document behind. And the debounce must
flush before the process exits: with one document per space, a lost flush
loses every change since the last save, not one key.

## What this does not buy

A structural document model preserves **members**, not **text**. A round trip
through it will drop comments, collapse duplicate properties to whichever one
the reader kept, and reformat the file to the serializer's conventions;
member ordering survives only if the model was built to carry it. Anyone who
annotated their configuration by hand loses the annotations on the first save
the application performs.

If comments and formatting must survive, the requirement is not a better
document model — it is a **text-editing capability**: a parser that retains
the source text and applies each change as a minimal edit over it, with the
structural view as a projection rather than the substrate. That is a
materially larger commitment. Every write becomes a span computation,
formatting becomes a product decision the application now owns, and the
failure modes move from "a member was dropped" to "the file no longer parses".

Say which of the two the product bought, in the place the file format is
documented. A user who loses their comments has learned the same thing as a
user who loses a key: that the file is not really theirs.

> **The decision rule.** Where a settings space is one stored document that
> outlives the build reading it, patch the runtime object from the document
> and preserve every member the schema does not name; prune only inside
> subtrees explicitly declared prunable; write by replacing the named subtree,
> never the document. Where comments and formatting must survive too, this
> mechanism is insufficient and a text-span editor is the actual requirement.

## Boundaries

- **The closed key space still holds — for this build's own keys.** The
  registry governs what this build may write, and its orphan check is a set
  difference over the keys this build registered, never over every member of
  the document ([key-registry](./key-registry.md)). A reaper that treats an
  unrecognized member as an orphan has re-implemented whole-graph replacement
  one deletion at a time.
- **Not the read cache.** [read-batching](./read-batching.md) prefers coarse
  invalidation — drop the whole map, re-read on next access — and that is
  correct there for the reason it is wrong here: nothing holds a reference to
  that map, because it sits behind the typed door. Replacement is cheapest
  where there is no identity to preserve; patching is required where there is.
- **Not a migration.** A member whose *shape* changed is the version chain's
  problem
  ([persistence-and-migration](../../../../client-architecture/client-state/techniques/persistence-and-migration.md));
  a member whose shape this build simply does not know is this technique's.
  Preservation is not an excuse to skip the chain, and the chain must migrate
  what it recognizes without flattening what it does not.
- **Not a defaults ledger.** [applied-defaults-ledger](./applied-defaults-ledger.md)
  answers whether a shipped entry should be applied again — a question about
  names the build knows. This answers what happens to members the build has
  never heard of. One collection can need both, and they do not interfere.
- **Not a source chain.**
  [cross-source-precedence-chain](./cross-source-precedence-chain.md) composes
  several sources at boot and asks which of them wins a key. Here there is one
  document, and the question is what survives a round trip through a schema
  narrower than it.

## Testing for the property

Each case is a load, a change, a save, and a re-read:

- **A foreign member survives.** Load a document carrying a member no schema
  names, change one unrelated setting, save. The member is present and
  byte-identical.
- **Round trip under version skew.** Write with the full schema, load and save
  with a narrower one, reload with the full schema. Every value the first
  wrote is intact.
- **Identity holds across reload.** Attach an observer, reload from a modified
  document, and assert it both fired and is still attached — then repeat for
  an item inside a collection, which is the case that fails when only the root
  was patched.
- **Pruning is confined.** Place an identical stale member inside a prunable
  subtree and inside a neighbouring one. After a save the first is gone and
  the second is not.
- **A failed serialization leaves the document intact.** Force a failure part
  way through the write and assert the stored file is the previous complete
  content, not a prefix of the next one.

A store that passes the first case and fails the third preserves the user's
data and breaks their surface; a store that passes the third and fails the
first does the reverse. Both are the same bug, caught at different ends.
