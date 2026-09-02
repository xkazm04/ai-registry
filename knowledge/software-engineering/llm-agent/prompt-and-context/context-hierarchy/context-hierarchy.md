---
layer: golden-path
type: golden-path
subject: context-hierarchy
status: forged
use_when: [a corpus is organised as a tree the consumer can browse, deciding whether to return a folder or its files, generated summaries lag the content they describe, a summary must be rebuilt for a node with hundreds of children]
techniques:
  - per-node-summary-tiers
  - seeded-descent-retrieval
  - digest-gated-upward-refresh
  - stable-sampling-for-wide-nodes
---

# Context hierarchy

A context hierarchy is a corpus organised as a **containment tree** — folders holding
folders holding leaves — in which every interior node carries **generated summaries at
more than one size**, so that a consumer can decide *relevance* from the cheapest tier,
*scope* from the middle one, and pay for the leaf only after both said yes. The tree is
an interface, not a storage layout: the consumer can survey it, list a node's siblings,
and know how much it has not looked at. Retrieval **descends** it from seeded starting
points instead of ranking a flat candidate set, and every tier above the leaf is a
derived artifact that somebody has to keep honest.

The subject has two halves, and the second is the one that gets skipped. The first half
is the shape: what a tier is, what each one is for, and how a query walks the tree. The
second half is the **compilation discipline**: which child changes are allowed to reach
a parent, when a wide node's summary may lag, and what a read gets while a branch is
being rebuilt. A hierarchy with only the first half is a demo; it is correct on the day
it was built and quietly wrong from the first edit onward.

## Where the neighbours stop and this subject starts

The [agent-memory](../agent-memory/agent-memory.md) golden path draws this boundary
itself. Its shape hedge — expect recall quality to come from the transitions, not the
topology — holds where the topology was consumed *through a retrieval call*. It then
names the other object: a shape the consumer can survey, browse, and know the extent of,
which has been measured to carry recall quality further than the transitions do, and
which carries a second cost the hedge never priced — such a structure is compiled, and
a compiled structure over a store that keeps changing is stale by construction rather
than by failure. That paragraph is the force. This subject owns the mechanisms that
answer it. Agent memory keeps ownership of what is stored, what is believed, what
decays; the hierarchy is a shape over items that subject already governs and says
nothing about their truth or their lifetime. The rule for the reader: if the question
is *what should be in the store*, go next door; if the question is *how a store the
consumer can browse is summarised, walked and kept current*, it is here.

[retrieval](../retrieval/retrieval.md) owns lanes, fusion, floors and budgets over a
flat candidate set. Its two structural lanes read a graph's edges as a relevance signal
— [structural-centrality-lane](../retrieval/techniques/structural-centrality-lane.md)
solves for what the corpus revolves around, with no seed at all — but neither lane
descends a containment tree, decides when to hand over a node instead of its children,
or stops a descent. The descent here *produces* candidates; the cut in
[ranking-budgets](../retrieval/techniques/ranking-budgets.md) spends them, and nothing
in this subject re-derives that cut. The staleness *doctrine* — accumulated input, not
the clock, as the recompilation trigger; the clock only as a floor and a release; say
what a read gets during a recompile — belongs to
[lane-reconciliation](../agent-memory/techniques/lane-reconciliation.md), and the third
technique here applies it rather than restating it. Instruction files discovered by
walking *up* a path are [agent-instruction-files](../agent-instruction-files/agent-instruction-files.md);
allocating the window the survivors land in is
[prompt-assembly](../prompt-assembly/prompt-assembly.md).

## Why tiers, and why at the node

Retrieval over a flat chunk set has one granularity, chosen at ingest, and every query
pays for it: a question about a whole area retrieves a handful of chunks that happen to
mention its name, and a question about one fact retrieves a chunk that also carries
nine hundred tokens of neighbours. Recursive summarisation was the published answer —
build a tree of summaries over the chunks, embed every level, and let the query match
at whichever level its granularity lives. The measurement behind it is the reason this
subject exists: across three long-document question sets, between a fifth and more
than half of the nodes that contributed to correct answers were **summary nodes, not
leaves**. The consumer needed the abstraction, and a flat index could not offer it
because a flat index has nothing to abstract *to*.

A containment tree already has the levels; the summaries just have to be generated at
the right seat. That seat is the **interior node**, and the tiers are chosen by what
each one is *for* rather than by a size taste:

- The **abstract** exists to be embedded and to answer "is anything below here worth my
  time" in one read. Its ceiling is what the embedding model can hold as one meaning —
  on the order of a hundred tokens — and past that ceiling it stops being a vector of
  the node and becomes a vector of its first paragraph.
- The **overview** exists to be *navigated*: it tells the consumer what the node's
  children are, what each covers, and therefore which one to open next. Its ceiling is
  what a reranker or a consumer can read whole while deciding — on the order of a few
  thousand tokens — and the abstract is extracted from its lead so the two cannot
  disagree.
- The **leaf** is the original, untouched, loaded only after the tiers above it said
  yes. Nothing is generated for it, because a leaf is where the consumer stops; a
  summary of the thing you are about to read is a cost with no decision behind it.

Per-file summaries are still produced — they are the *inputs* to the containing node's
overview — but they are not sidecars of their own. The rule: **a node earns its own
tiers when a consumer might stop there.** A leaf never does. This is what separates
the hierarchy from the naive reading, which summarises every file "for retrieval" and
pays one model call and one index row per file for a tier nobody ever descends from.
[per-node-summary-tiers](./techniques/per-node-summary-tiers.md) carries the ceilings
as forces, the extraction rule, and the metadata whitelist that keeps bookkeeping out
of the embedding.

## Descent is seeded, not rooted

The wrong way to search a tree is from the root: score the root's children, take the
best, score its children, and so on down. It is cheap and it is what the shape
suggests, and the recursive-summary literature measured it against the alternative and
lost — a strict traversal commits to one branch at each level before it has seen the
others, and it returns a constant mix of levels regardless of what the question
wanted. Searching every level at once, collapsed into one candidate set, retrieved
information at the granularity the question actually had.

The synthesis this subject holds is **seed globally, then descend locally**. One
search over the abstract and overview tiers of the whole tree — a flat search, and the
retrieval subject's machinery is exactly right for it — finds the nodes whose summaries
already resemble the question. Those become the starting points of a priority queue.
The descent pops the best node, searches its children, scores them, admits the ones
above the floor, pushes the interior ones back onto the queue, and repeats until the
top of the collected set has stopped changing. The seed step means the descent starts
where the answer probably is; the descent step means the seed's neighbours and
children get examined, which the flat search alone would have ranked below the floor.
The decision rule that keeps it honest: **descend only when the seed's tier says the
answer is below, never because the tree is there.** A query whose answer is "which
branches" is answered by the abstracts and should stop at them.

Two questions inside the descent are decided by knobs, and both default the same way:
off until measured. Whether a parent's score should colour its children's — score
propagation — is a blend weight, and a tree whose default gives the parent no say is
recording that propagation has not been shown to help. Whether a node should be handed
over *instead of* its children — because it is about the topic and its children are
each about a fragment — is a dominance test, and a tree that declares the ratio and
never applies it is recording the same thing.
[seeded-descent-retrieval](./techniques/seeded-descent-retrieval.md) carries the
queue, the stop, the two surfaces (a query-only path with no model call and no descent,
and a full path with typed sub-queries and a reranker), and the level filter that lets
a consumer ask for branches without paying for leaves.

## The tiers are compiled, and compiled is stale

Every tier above the leaf is derived from content that changes. The published summary
tree has no update story at all — the canonical description scales its build linearly
and says nothing about maintenance, and its reference implementation's own issue
tracker carries "incremental addition is referenced but not implemented" and an
unanswered question about deletion. That is not a criticism of a research artifact; it
is the statement of the second half of this subject. A hierarchy in production is
edited every hour, and a parent overview that describes children that no longer exist
is *followed*, not read — the consumer descends into it on the strength of a sentence
that was true last month.

The naive fix is to regenerate every ancestor after every change, and it is wrong in
the direction that costs money: one edit at depth six regenerates six overviews, and a
hot directory with a hundred edits a day regenerates its ancestors a hundred times for
summaries that mostly come out identical. The disciplined fix asks, at each level, **did
the input this parent actually consumes change?** A parent's overview is built from its
children's abstracts — not their overviews, not their metadata. So a child whose
regenerated abstract hashes to the same normalised text as before has changed nothing
the parent can see, and propagation stops there. A child whose abstract did change
marks the parent as carrying pending changes; a small parent refreshes at once, and a
wide parent — more children than its summariser reads — accumulates until the pending
fraction crosses a threshold. Each level halts propagation independently. This is the
lane-reconciliation doctrine with its mechanism filled in: accumulated input is the
trigger, and *what counts as input at each level* is the abstract digest of the
children. [digest-gated-upward-refresh](./techniques/digest-gated-upward-refresh.md)
carries the decision table, the three outputs a refresh request can return, and the
failure the ratio gate admits — a node with three changed children of a hundred and
sixty-one can stay stale indefinitely, and a first version is allowed to say so out
loud rather than bolt on a clock it cannot yet justify.

## A wide node is summarised from a sample, and the sample must be boring

A node can have more children than any summariser can read in one call. The overview
is then built from a sample, and a sample chosen by time, by randomness, or by "the
first thirty-two" fails in a specific way: an unchanged tree produces a *different*
overview on every refresh. Every refresh then looks like a change, the digest gate
above admits it, the parents regenerate, and the whole hierarchy churns on nothing.

The sample is therefore a **pure function of the child list** — deterministic,
order-preserving, spanning the list rather than truncating it — and the overview's own
metadata records how many children there were, how many were read, and how many were
not. A consumer reading an overview built from thirty-two of a hundred and sixty-one
children is entitled to know the number, because the overview is a claim about the
node and the count is that claim's predicate. The sample is also taken *before* the
expensive work, so children outside it are not summarised merely to be discarded.
[stable-sampling-for-wide-nodes](./techniques/stable-sampling-for-wide-nodes.md)
carries the function, the metadata contract, and why sample membership must never
become a scheduling input.

## Failure modes this standard exists to prevent

- **The per-file sidecar farm** — a summary and an index row for every leaf, paid for
  by one model call each, serving a tier no consumer ever stops at.
- **The rooted walk** — descent from the root that commits to one branch per level and
  returns a constant mix of tiers whatever the question wanted.
- **The summary that is followed, not read** — an overview describing children that
  moved or were deleted, sending the consumer down a branch on last month's sentence.
- **Write amplification up the hot path** — every leaf edit regenerating every
  ancestor, most of them to byte-identical bodies.
- **The churning sample** — a wide node whose summary changes on every refresh of an
  unchanged tree, so the digest gate sees change where there is none.
- **Bookkeeping in the vector** — provenance and freshness fields entering the
  embedding, so that a rebuild that touched no content moves the node in vector space.
- **The tree consumed only through search** — a hierarchy built for surveyability
  whose consumer never lists, never browses, and pays the compilation cost for a shape
  it uses as a flat index.
- **The clock as the only trigger** — summaries refreshed on a schedule, current as of
  a date nobody recorded, and the schedule set by whoever last got paged.

## The techniques

- [per-node-summary-tiers](./techniques/per-node-summary-tiers.md) — an embeddable
  abstract and a navigational overview at every interior node, extracted one from the
  other, with the leaf left original and a whitelist on what may enter the embedding.
- [seeded-descent-retrieval](./techniques/seeded-descent-retrieval.md) — global search
  over the summary tiers seeds a priority-queue descent; convergence stops it;
  propagation and dominance are knobs that default to off; a level filter answers
  "which branches" without leaves.
- [digest-gated-upward-refresh](./techniques/digest-gated-upward-refresh.md) — a
  child's change reaches its parent only when the input the parent consumes changed;
  small nodes refresh now, wide nodes accumulate to a ratio; the request reports
  whether it refreshed, marked, or did nothing.
- [stable-sampling-for-wide-nodes](./techniques/stable-sampling-for-wide-nodes.md) —
  a deterministic, spanning sample taken before the expensive work, with total, sampled
  and unsampled counts carried in the summary's own metadata.
