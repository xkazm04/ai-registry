---
layer: technique
type: technique
subject: context-hierarchy
technique: per-node-summary-tiers
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding which nodes of a corpus tree get generated summaries, choosing size ceilings for an embedded summary versus a navigational one, a rebuild of the index changed retrieval results without any content change, summarising every file has become the dominant ingest cost]
---

# Per-node summary tiers

A containment tree gives a corpus its levels for free. What it does not give is
something to *match against* at each level — a folder has a name, and a name is not a
summary. This technique decides where generated summaries live in the tree, how many
sizes there are, what each size is for, and what is allowed into the text that gets
embedded.

## The seat is the interior node, and the leaf gets nothing

The naive design generates a summary per file, because files are what the ingest
pipeline iterates over. It costs one model call and one index row per file, and it
serves a tier nobody descends *from*: a consumer that has matched a file's summary
opens the file, so the summary bought one hop of nothing. Worse, a corpus of ten
thousand files now has ten thousand summary vectors competing with the interior nodes'
vectors in the same index, and the global seed search that
[seeded-descent-retrieval](./seeded-descent-retrieval.md) depends on is drowned in
leaf-shaped noise.

The rule: **a node earns its own tiers when a consumer might stop there.** An interior
node qualifies because "this area is relevant, now look inside it" is a real decision
with a real cost saved. A leaf never qualifies — there is nothing below it to be saved
from reading. Per-file summaries are still generated, because the containing node's
overview is built out of them, but they are consumed as inputs to that overview and
not stored as retrieval units of their own. When a leaf is so large that a consumer
genuinely might want a summary of it instead of it, the correct move is to split it
into a node with children, not to grant it a sidecar.

## Two tiers above the leaf, chosen by purpose

Two generated sizes are enough, and each is sized by what it is for rather than by
taste:

- **The abstract** is the embedded tier. Its job is to answer "is anything under here
  worth my time" from a single read and a single vector. Its ceiling is set by the
  embedding model's ability to hold one meaning in one vector — in practice on the
  order of a hundred tokens or a few hundred characters. Past that ceiling the vector
  drifts toward the text's opening and stops representing the node. Below a sentence
  it represents the name, which the tree already had.
- **The overview** is the navigational tier. Its job is to tell a consumer what the
  children are, what each covers, and which to open next; a reranker reads it to
  confirm scope, and a consumer reads it to decide the next descent. Its ceiling is what
  can be read whole while deciding — on the order of a few thousand tokens — and it is
  structured, with the children listed by name, because a consumer navigates by name.

The abstract is **extracted from the overview**, not generated beside it: the lead
paragraph of the overview, before its first heading, is the abstract. This is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary) at the
scale of one node — two independently generated summaries of the same node drift, and
they drift precisely when one is regenerated and the other is not. One generation
produces the overview; the abstract falls out of it deterministically; a reader who
finds them disagreeing has found a bug, not a judgment call.

Either tier may exist without the other. A node created by hand and never summarised
carries an abstract that is its name or its author's one-line description, and no
overview; a reader handles the absent tier as absent, never as empty. What may not
happen is a node with an overview and an abstract that was not extracted from it.

## The overview is aggregated from the children's abstracts

Generation is bottom-up: file summaries feed the leaf-most node's overview; that
overview's lead becomes its abstract; the parent's overview is aggregated from its
children's *abstracts*; and so on to the root of the summarised region. Two decisions
are hidden in that sentence and both matter to the technique that keeps the tree
current.

First, a parent consumes its children's abstracts and nothing else — not their
overviews, which would blow the parent's input past its ceiling by the branching
factor, and not their metadata. This makes "what changed that the parent can see"
a precise question with a precise answer, and
[digest-gated-upward-refresh](./digest-gated-upward-refresh.md) is built on it.

Second, a parent with more children than the summariser can read consumes a sample of
them, and [stable-sampling-for-wide-nodes](./stable-sampling-for-wide-nodes.md) owns
how that sample is chosen and disclosed.

Both tiers are derived values in the
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
sense: each carries, in its own metadata, what generated it and on what trigger, and
the recomputation path is the bottom-up pass over the node, invokable by name. A tier
that cannot say how it is rebuilt is a future disagreement with no arbiter.

## What may enter the embedding, and why the answer is almost nothing

A summary file carries metadata alongside its body: which node it describes, where the
content was imported from, what generated it, how fresh it is. The temptation is to
embed the whole file, and the failure is precise: a rebuild that touched no content —
a reindex, a freshness counter reset, a provenance field added by a migration —
changes the embedding input, moves the node in vector space, and changes retrieval
results with no content change anywhere. The evaluation suite records a regression and
nobody can find the edit, because there was none.

So the embedding input is the **body plus an explicit whitelist**, and the initial
whitelist is the node's own address and nothing else. Provenance, generator identity
and freshness are excluded by construction, and the ordinary vectorisation path and the
administrative reindex path build their input through the same function, so rebuilding
the index cannot change what was embedded. The same exclusion applies to the
summarisation prompt: a parent's overview is generated from its children's abstract
*bodies*, and a freshness counter is not a fact about the child's content.

Unknown metadata fields are dropped on write rather than preserved, for the same
reason: a field nobody declared is a field nobody whitelisted, and preserving it makes
it available to a future path that forgets the whitelist.

## Decision rules

- When a node might be a consumer's stopping point, give it both tiers; when it is a
  leaf, give it none — split it if a summary of it is genuinely wanted.
- When choosing the abstract's ceiling, size it to the embedding model's one-meaning
  capacity, not to what reads nicely; when choosing the overview's, size it to what a
  reranker or a consumer reads whole.
- When the abstract and overview are both present, the abstract is the overview's
  lead, extracted, never separately generated.
- When building a parent's overview, consume the children's abstracts only; when
  building any tier's embedding, consume the body plus the whitelist only.
- When a tier is absent, report it absent; do not synthesise an empty body and embed
  it.

## When not to use it

A corpus that is small enough to browse — a few hundred leaves under a handful of
nodes — needs the tree and does not need the tiers; a listing with one-line
descriptions is the overview, and a consumer reads it directly. The retrieval subject's
scale-honesty check applies unchanged: generated summaries earn their cost when the
tree outgrows a reader's ability to scan a node's children, not before.

A corpus with no natural containment — independent records, transactions, a flat
stream of notes — has no interior nodes to summarise, and clustering it into synthetic
ones is a different technique with its own literature. This one assumes the tree was
given.
