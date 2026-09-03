---
layer: technique
type: technique
subject: llm-extracted-entity-graph
technique: accumulate-then-threshold-merge
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [a second passage describes an entity the graph already holds, a node's description grows without limit, re-ingest in a different order produces a different graph, deciding when to collapse a node's accumulated evidence]
---

# Accumulate, then merge at a threshold

When a passage produces an entity or relation the graph already holds, the merge operator
decides what happens to what is already there. Three answers are available and only one
survives: overwrite discards the facets earlier passages saw, first-write-wins discards
the ones later passages see, and **accumulation keeps both**. A node's description is the
set of fragments contributed by every passage that mentioned it; a relation's is the same
over its endpoint pair.

Accumulation is chosen for a reason stronger than not losing data. It is the only operator
here that is **associative and order-independent**, which is what makes re-ingesting the
corpus in a different order — after a crash, a re-parse, a source arriving late — produce
the same graph. That property is the merge's whole contract with the rest of the system,
and everything below is either protecting it or being honest about where it stops.

## Deduplicate across stored and new, or the store grows on a no-op

The fragment set is a set, and the deduplication has to span both sides of the merge. A
pass that deduplicates only within the incoming batch appends a fragment that is already
stored, so every reprocess of an unchanged document lengthens every node it touches, and a
corpus re-ingested weekly has descriptions growing linearly in *time* rather than in
content. The visible symptom arrives much later, as popular nodes that have quietly
crowded out their own neighbourhood, and by then nothing in the store distinguishes a
fragment that arrived four times from four passages that agreed.

Compare fragments after the same cleaning the stored ones went through, not before.
Stored fragments were sanitised on the way in; a freshly extracted one has not been, so a
raw-against-clean comparison misses the duplicate exactly when cleaning changed the string
— and the fragments that survive that gap are the malformed ones, which then accumulate
forever.

## Every non-set attribute needs an order-independent rule

The description is a set, so it composes. A node's other attributes do not: its type, its
weight, its canonical label are single-valued, and each one needs a resolution rule that
two orderings agree on.

The rule that looks obvious and is not: **majority vote over the incoming mentions plus the
stored value**. It gives the stored value exactly one vote no matter how many passages
produced it, so a node whose type a hundred passages established is flipped by two new
passages that disagree, and flipped back on the next document. Either weight the stored
value by the evidence behind it — the fragment count it was derived from — or resolve
attributes by a rule that does not vote at all: first non-empty wins, with disagreement
recorded rather than arbitrated. Whichever is chosen, **state that it is order-independent
and test it by ingesting the same corpus twice in different orders**; the property is
cheap to assert and cheap to check, and it is the only end-to-end test this subject has.

Relations need one more: if the relation type is undirected, the key is the *unordered*
endpoint pair. Keying on the ordered pair mints two edges for one relation, splits its
evidence across both, and leaves the query plane traversing whichever one the extraction
happened to phrase first.

## The threshold, denominated in the budget it defends

Unbounded accumulation has a failure of its own. The entity the corpus discusses most
acquires the longest description, and length is what the retrieval budget spends, so the
best-attested node in the graph crowds its own neighbours out of every slice it enters.
Past some size the accumulation is **re-expressed** by a model into a single description.

**Denominate the threshold in the budget the description will be spent from — its length —
not in a count of mentions.** A count threshold fires on forty short fragments that were
never a problem and never fires on three long ones that are, because the constraint being
defended is size and the count is only a proxy for it. Where a count is used at all, it is
a second, conjunctive trigger for the pathological case a length test misses (very many
tiny fragments, each below every cap, together unreadable), and its value is stated with
the observation that justified it so the next person to tune it knows what moving it costs
in both directions.

Two obligations on the re-expression call itself. It reads the fragments under a bound, and
**a fragment dropped because the input did not fit is a dropped fragment, not a summarised
one** — if the input is truncated, the resulting description is a summary of a subset and
must say so, or the node quietly loses evidence with no record anywhere that it had it.
And where the reasoner is unreachable, the pass produces no re-expression and leaves the
accumulation intact; a mechanical stand-in — concatenation, first sentences, longest
fragment — mints a description that then speaks for everything it replaced, which is the
one place a store poisons itself worst.

## The re-expressed description is a derivation, and it names what it consumed

After re-expression the node's stored description is one fragment, and everything that
produced it is gone from the store. That is a real loss, so it is recorded rather than
absorbed: the count of fragments consumed, the pass that wrote it, and the passages the
node draws on — which survive independently as the node's provenance and are what a rebuild
replays. This is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to a description: the stored value names how it is recomputed, and here the
recomputation path is a replay of the cited passages' extractions, not a re-read of any
single document.

The count travels because of
[count-carries-predicate](../../../../_laws.md#count-carries-predicate). "Derived from
thirty-one fragments across nine sources" and "one sentence that arrived once" are
different claims about the same field, and a consumer weighing a node — or an operator
diagnosing a bad answer — cannot tell them apart from the text. Where the store can afford
it, keep the fragments beside the summary rather than in place of it; where it cannot, the
count is the minimum that must survive.

## Where order-independence stops, and saying so

The convergence guarantee is real **below** the threshold and false above it. Once
re-expression fires, which fragments were grouped into which call depends on the order they
arrived in, and a model summarising the same set in two groupings produces two different
descriptions. Nothing recovers this: the operator is order-independent up to the point
where it stops being, and that point is exactly the busiest nodes in the graph.

State the boundary rather than claiming convergence for the whole range. A system that
advertises "re-ingest converges" and is asked to prove it on its top hundred nodes will
fail the check it invited, and the fix is not a better summariser — it is a smaller claim.
The honest version: **below the threshold, identical; above it, the same evidence set and a
differently-worded description**, with the fragment count identical either way. That second
half is checkable and worth checking.

## The boundary against belief consolidation

The nearest neighbour is the distillation pass in
[agent-memory](../../agent-memory/agent-memory.md), and the two look alike from a distance:
both compare texts, both collapse many into one, both worry about a summariser inventing.
They diverge on the question being asked.
[consolidation](../../agent-memory/techniques/consolidation.md) asks *which belief
survives*, because two beliefs about one subject can contradict, and it answers with
supersedence, validity windows and confidence adjustment — machinery for adjudicating
truth. Its similarity measure is directional for exactly that reason: a short sharp
correction must outrank the long belief it corrects.

Nothing here adjudicates. Two passages describing one entity are **facets, not
competitors**; neither is wrong, neither supersedes, and a merge that let one close the
other would be discarding evidence to resolve a conflict that does not exist. The
collapse here is in-place, mandatory once the threshold trips, and driven by a budget
rather than by a judgment about truth — which is also why
[rollup-compaction](../../agent-memory/techniques/rollup-compaction.md)'s shape does not
transfer whole: that pass finds families across independent items and *proposes*, this one
operates on a single node's own evidence and *acts*. What does transfer, and is imported
rather than restated, is its confidence ceiling — a derived description may never be more
certain than the most certain thing it derives from — and its refusal to write anything at
all when the reasoner is unavailable.
