---
layer: technique
type: technique
subject: llm-extracted-entity-graph
technique: recoverable-fan-out-write
status: forged
laws: [derivation-names-recomputation, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [one fact written to a graph store and a vector index with no transaction, a node present in the store and unreachable through the lane, deciding what a crashed ingest left behind, removing one source from a node many sources wrote]
---

# The recoverable fan-out write

Merging one entity produces writes to several places at once: the node to a graph store, an
embedding of its name and description to a vector index so a similarity lane can reach it,
tracking rows recording which passages contributed. Nothing spans them. Each store has its
own client, its own buffering, its own failure modes, and no two of them can be made to
commit or not commit together.

The failure this permits is the quiet one. A node written to the graph and missing from the
index is **correct by every measure the rest of this subject defines and unreachable
through the door the query plane uses.** Every content check passes, because the node is in
the store's contents; every count is right; the only symptom is answers that are missing
something, months later, with nothing to attribute it to.

## Order the fan-out so the survivor is repairable

The first discipline costs nothing and decides which inconsistency a crash can leave.

**Write the authority first and everything derived from it second.** The graph node is the
authority — it holds the accumulated fragments, the provenance, the attributes. The index
entry is a derivation of it. A failure between the two therefore leaves a node with no
index entry, which is invisible but *repairable from what survives*: the node contains
everything needed to rebuild its entry. Reverse the order and a failure leaves an index
entry with no node — a phantom that matches queries and cannot be joined back to anything,
per [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) presenting
itself as a hit rather than as damage.

Two corollaries. **Build and validate every payload before the first mutation.** A
derived payload that is malformed — over-length content, an attribute the index refuses —
is a deterministic failure that will recur on every retry, and discovering it *after* the
graph write converts a clean rejection into a half-written entity. Construct all of them,
check them, then mutate. And **retry the derived write rather than rolling back the
authority**: rollback across stores with no transaction is a second distributed write with
the same problem, whereas the authority's row is exactly the input a retry needs.

## One named commit barrier

Storage backends buffer. A write accepted by a client is not durable, and different
backends become durable at different moments — some per call, some at a flush, some when a
file is rewritten. Left implicit, "this document is indexed" is true at a different instant
in every store, and the window in which it is true in some and not others is unbounded and
undocumented.

The discipline is a **single named commit point that flushes every store together**, called
once per batch, after which the batch's writes are durable everywhere or the barrier
reported a failure. It buys three things. Readers get one instant to reason about. A crash
before the barrier has a well-defined meaning — the batch is not committed — instead of a
per-store lottery. And the failure has one name and one place to be caught, so a batch that
could not flush aborts as a batch rather than being misattributed to whichever document
happened to trigger the flush.

The barrier is not atomicity and must not be described as it. Flushes run against
independent stores and some can succeed while others fail; what the barrier provides is
that the *outcome is known and named*, not that it is all-or-nothing. What makes the
partial outcome safe is the next section.

## The manifest, written before the first mutation

Here is where this technique parts company with the ordinary derived-index discipline, and
the reason is worth stating precisely, because on the surface the two look identical.

A derived index over a corpus is repaired by re-reading the source: the unit still exists,
its content is unchanged, re-derive and re-write. That works because **the index entry is a
function of one durable input the system still holds.** A node here is not. Its description
is a function of *every passage that ever mentioned it*, most of them in documents this run
never touched, and the model calls that produced those fragments are long gone. Re-deriving
one node means replaying every one of those extractions at model prices, or from a cache
that may have been evicted. And the affected set is not recoverable from the document
either — this document's passages mention entities that fifty other documents also wrote,
and after a crash neither store can say which of them this run was in the middle of
touching.

So the run **declares its intentions before it acts**: the full candidate set of entities
and relations this batch is about to merge is written to durable storage and flushed
*before the first graph mutation*, alongside a marker on the document saying that from this
point it may have touched the graph. Both are cheap, both are written even when empty, and
a failure to persist them aborts the batch before it mutates anything — an anchor that can
fail open is not an anchor.

What the manifest buys is the ability to answer, after any crash, the one question neither
store can: **what was this run in the middle of doing?** Recovery enumerates the manifest,
compares it against both stores, and repairs or re-runs the difference — bounded by the
batch rather than by the corpus. This is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation) with
its input made explicit: the stored derivation names how it is recomputed, and the
recomputation path here is a *replay of the named extractions*, so the thing that must be
durable is the list of what to replay.

Recovery is then made safe by idempotence rather than by rollback. A partially merged batch
is re-run in full; accumulation deduplicates across stored and new fragments, so replaying
a merge that already landed is a no-op. **The merge operator's idempotence is what makes
in-store rollback unnecessary**, which is the strongest practical argument for the
accumulate-and-deduplicate design one stage upstream.

## Concurrency: the critical section is the node

The read-modify-write shape of the merge — read the stored fragments, add the new ones,
possibly re-express, write back — is not safe under concurrent ingest without a lock, and
two documents mentioning the same entity is the normal case rather than the edge one. Two
concurrent merges both read the pre-existing fragment set and the second write erases the
first's contribution, silently and with no conflict anywhere.

Take the lock **on the entity key**, not on the store: a global write lock serialises an
ingest that is otherwise embarrassingly parallel, and a lock per document does not protect
anything, since the collision is between documents. For relations the lock is on the
*sorted* endpoint pair, so that two passages phrasing an undirected relation in opposite
directions contend rather than interleave.

## Removing a source is a reduction, never a delete

The sharpest case, and the one that gets built wrong first. A source is withdrawn — a
document deleted, a version superseded — and its contribution must leave the graph. The
node it touched was also written by fifty other passages.

**Deleting the node destroys forty-nine sources' evidence to remove one.** The correct
operation is a *reduction*: recompute the node from its surviving passages, which means
replaying their extractions from the cache the manifest points at, re-accumulating, and
re-expressing if the threshold still trips. A node whose last surviving passage is gone is
then deleted, and only then. Per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper), whoever creates the
node's index entry and its tracking rows owns the code path that removes them; reduction
that updates the graph and orphans the index entry produces the phantom the ordering rule
above exists to prevent, arriving through the back door.

Two honesty obligations attach to a reduction that cannot complete. Where the replay
material for a surviving passage is missing, the node cannot be faithfully rebuilt — and
the choice between rebuilding it from what remains and refusing is a policy the operator
sets, not a default the code picks. Either way the outcome is reported per node, because a
reduction that silently degraded a hundred nodes and one that cleanly removed one source
are the same green result and opposite instructions.

## The boundary against index drift

[chunking-and-indexing](../../retrieval/techniques/chunking-and-indexing.md) already owns
the general rule and it is not restated here: writes reach every index or none, deletions
are index events, drift between source and index is detected by a standing comparison and
repaired by a named, invokable rebuild. Every word of that binds. This technique
**composes over it** rather than replacing it, and the composition is the point of having
both.

Two things differ, and both come from the same fact — that a node is not derived from any
single durable unit. Its *repair input* is a replay ledger rather than the corpus, so the
rebuild that subject requires must be built here against the manifest and the extraction
cache, and a rebuild path that assumes it can re-read the source will find nothing to read.
And its *scope* cannot be derived after the fact, so the manifest must exist before the
write rather than being reconstructable from either store afterwards. Where a chunk index
can be repaired by a sweep over the corpus at any later time, this graph can only be
repaired against a record it decided to keep in advance — which is why the manifest is a
technique here and a paragraph there.
