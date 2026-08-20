---
layer: technique
type: technique
subject: knowledge-registry
technique: catalog-as-sync-key
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [consumers need to know whether their copy is current, designing a generated index, choosing a content hash for drift detection]
---

# The catalog as sync key

A consumer of a registry almost never needs the registry's *content* in order to
act. It needs one answer about each item it already has: **am I in sync, stale,
or diverged?** Fetching every item to work that out is expensive, and doing it by
comparing bodies means every consumer implements the comparison differently.

The artifact that answers it is a generated catalog: one row per item, carrying
the item's identity, its location, its declared version, and a short digest of
its content. It is derived, so it names its recomputation
(`_laws.md#derivation-names-recomputation`) — regenerating it from the repository
must reproduce it exactly, and hand-editing it is overwritten by design.

## An envelope, not a bare list

The tempting shape is an array of entries. Use an object that wraps the arrays
and carries, at minimum:

- **A schema identifier and a schema version.** The consumer fetched this from a
  repository it does not control, over a network, possibly through a proxy that
  served something else. Without an identifier it cannot tell a catalog from any
  other structured file that parsed.
- **Who generated it, and which registry it describes.** A catalog that does not
  name its own registry cannot be distinguished from a catalog for a different
  one after it has been copied somewhere.
- **Counts, derived in the same generation as the arrays.** Never carried over
  from a previous run — a count that disagrees with the array beside it is worse
  than no count, because tooling reads the cheap field.

A reader that finds an unrecognized schema identifier must degrade to "no
catalog", never attempt a partial read of a shape it does not know. A reader that
finds a *newer version* of a schema it does know reads the fields it understands
and ignores the rest — the same additive rule the rest of the registry runs on.

## Four states, not two

A comparison that yields match-or-not is not enough, because the two
non-matching cases have opposite remedies:

- **In sync** — the digests agree.
- **Stale** — the consumer holds an older digest the registry once published, or
  an older declared version. The remedy is to pull.
- **Diverged** — the consumer holds a digest the registry has never published.
  Someone edited the local copy. The remedy is a conversation, and pulling would
  destroy their work.
- **Local only** — the consumer holds an item the catalog does not list at all.
  Either it was never published or it was withdrawn, and those are different.

Report the state, not the digests. A consumer that has to derive the state from
two hex strings will derive it four different ways across four tools.

## The digest, and the mistake that makes it lie

Use a prefix of a cryptographic digest — long enough that a collision is not a
practical concern, short enough to read in a diff. Say **in the field's own
documentation** that this is drift detection and not a security boundary, so
nobody builds an authorization decision on a truncated hash.

Two properties have to be pinned down, and both are usually left implicit until
they cause an incident:

**Pin the input scope.** Whether the digest covers the whole file or only the
body beneath its metadata header is a decision, not a detail. Two
implementations that disagree about it produce permanent disagreement with
nothing in the output explaining why.

**Normalize before you hash.** A digest computed over the bytes on disk answers a
question about *the checkout*, not about the content. The same commit checked out
on two platforms with different line-ending normalization yields byte-different
files for a byte-identical artifact, and a consumer on the other platform is told
**diverged** when nothing has diverged — the field is wrong in exactly the case
it exists to detect, and it is wrong for everybody on that platform at once, all
the time. The failure is worse than a missing feature: the consumer's operators
learn that the divergence signal is noise, and they stop reading it before the
first real divergence arrives.

So define the digest over a normalized form: fixed line endings, a fixed policy
on the trailing newline, and an explicit decision about leading and trailing
whitespace. Compute both sides through **one shared function**, not two
implementations of the same description, and state the normalization next to the
field so a third implementation can match it. When a registry already publishes
digests computed the naive way, the normalization is a schema change with a
version bump, because every stored digest changes.

## Serialization is part of the contract

The catalog is committed and read as a diff. Fix the indentation, fix the key
order, end with a newline, and never let a formatter's default drift into the
output. Otherwise a regeneration that changed nothing produces a diff the size of
the registry, and the one field that did change is invisible inside it.

## What belongs in a row, and what does not

A row exists to let a consumer decide whether to fetch. Identity, path, declared
version, digest, and the few fields consumers filter on before fetching — a
category, an applicability hint, the digest of a companion file that travels with
the item. Content does not belong in a row: a catalog that inlines bodies is a
second copy of the registry with its own drift, and it is the thing every
consumer downloads on every check.

Contributed and aggregate numbers may ride along — adopter lists, invocation
counts — but they are the aggregate view of contributed data, not measurements
the catalog makes, and a row must not imply otherwise
(`_laws.md#count-carries-predicate`).

## When not to use this

A registry with a handful of items and one consumer does not need a catalog; the
consumer can read the tree. Introduce one when either number grows — the second
consumer is usually the trigger, because that is when the comparison starts being
implemented twice.
