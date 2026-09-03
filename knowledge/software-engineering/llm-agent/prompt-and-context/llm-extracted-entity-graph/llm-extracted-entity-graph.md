---
layer: golden-path
type: golden-path
subject: llm-extracted-entity-graph
status: forged
use_when: [building a typed entity graph out of prose with no identifier to join on, deciding whether a name is allowed to be a node key, merging what several passages say about one entity, a graph write that fans out to stores no transaction spans]
techniques:
  - surface-form-identity-and-its-risk
  - accumulate-then-threshold-merge
  - recall-passes-with-a-declared-cap
  - recoverable-fan-out-write
---

# LLM-extracted entity graph

An LLM-extracted entity graph is a typed graph of entities and relations built out of
unstructured prose by a model reading it one passage at a time, in a corpus where **no
external authority supplies identity**. Its unit of work is one passage's extraction
merged into a graph that many passages before it have already written, and everything
hard about it follows from a single missing thing: there is no register, no roster, no
citation scheme, nothing to join against. The node's key is a string the model produced.

That absence is the discriminating question, and it must be asked before any of this is
built. **Does an identity authority exist for this corpus?** Another domain of this
registry owns the case where the answer is yes, and it is emphatic about it: the node
exists only under a durable identity that comes from the registries and never from the
text, name similarity is never an edge, and a graph assembled from string-matched
mentions is the first failure mode that standard exists to prevent — because there the
nodes are real people and firms, and a wrong join is an accusation. That judgment is
correct and nothing here softens it. It is a boundary drawn across bundle lines, so it
is stated in prose and carries no link: where an authority exists, use it, and a mention
graph is not a lighter version of the registry-joined graph but a different and worse
object. This subject owns what is left when the honest answer is no — an ordinary
document collection, no identifiers anywhere in it — where refusing to create a node
without an external key means creating no nodes at all.

**Per-claim provenance is required here, in exactly one of its three axes, and the
opening says which because it is the sentence a reader uses to choose between the two
subjects.** The registry-joined discipline stamps three things on every claim: how it was
made, from what, and who stands behind it. Only the second survives the crossing. *From
what* is **required and non-negotiable**: every node and every relation names the
passages it was extracted from, and every description fragment keeps its origin, because
without that the graph cannot be rebuilt, corrected, or reduced when a source is removed.
*How it was made* is **degenerate**: everything here is proposed by a model, there is no
deterministic layer to contrast it with, and a field that holds one value for every row
is an absent signal dressed as a present one. *Who stands behind it* is **permitted and
not required** — and it is the tell. A deployment that finds it needs human review state
on these edges has discovered that its claims are consequential, and consequential claims
about real parties want an identity authority; it has walked into the other subject and
should say so rather than bolt a review queue onto a mention graph.

One claim in the graph has no provenance at all, and naming it is this subject's first
obligation. **That these mentions are one entity is not asserted by any source.** The
merge asserted it, from a string comparison. Every fact about the node inherits that
assertion, and it renders identically to the facts that came from text. A graph that does
not carry its identity decision as an inference — with the normalisation contract that
produced it and a measured estimate of how often it is wrong — is claiming a
correspondence to the world that nothing in the corpus supports.

## Where the neighbours stop and this subject starts

**[retrieval](../retrieval/retrieval.md) begins where a query arrives; this subject ends
where the graph is written.** The seam is that single event, and nothing here restates one
word of the query plane — not lanes, not fusion, not floors, not budgets. Two of that
subject's techniques press against the seam from the far side and both bind here.
[structural-centrality-lane](../retrieval/techniques/structural-centrality-lane.md) holds
the corpus's existing opinion about when a stored graph is worth building at all: where
items reference each other by name, the adjacency is already latent in the content and two
cheap passes recover it, with no model call and no maintenance. **Read that before spending
a model call per passage.** This subject is for corpora whose relations are *stated in
prose and typed by meaning* — an obligation, a contradiction, a role — which no
reference-extraction pass can recover; where the relations are references, the derived
graph is strictly cheaper and this apparatus is unearned.
[chunking-and-indexing](../retrieval/techniques/chunking-and-indexing.md) owns the units
extracted from, their content-addressed identity, and the idempotent re-ingest that
identity buys; everything below **composes over** that and never re-decides it, because a
graph that mints its own passage identity has guaranteed re-ingest duplicates the corpus.
The query-decomposition stage in the retrieval subject is likewise theirs: its tiers are
named after these two stores, which is not an ownership claim — a stage that executes at
query time belongs to the subject that owns query time.

**[agent-memory](../agent-memory/agent-memory.md) owns what is stored, what is believed,
and what decays.** Its distillation pass asks *which belief survives*, because two beliefs
about one subject can contradict, and its answer — supersede, never overwrite; states
close, events accumulate — is a judgment about truth. This subject's merge asks a different
question. Two passages describing one entity do **not** contradict; they are facets of one
thing seen from two places, and the correct operation is to keep both. Nothing here
supersedes, nothing decays, and no fragment is wrong for being old. What the two do share
is the collapse of many items into one, and two rules transplant intact and are imported
rather than restated: a derived summary may never be more certain than the most certain
thing it derives from, and where the reasoner that would write it is unreachable, the
honest output is no summary rather than a mechanical stand-in that then speaks for
everything it replaced. The reachability discipline is theirs too — a record present in one
store and absent from the lane that was its only door is a defect no content check can see
— and the final section here is that discipline in a shape their store does not have.

**[structured-output](../structured-output/structured-output.md) owns parsing one reply**,
and its ladder governs a reply that is *defective*:
[extraction-strategies](../structured-output/techniques/extraction-strategies.md) is
written for the payload that was truncated, torn, or wrapped in prose. This subject owns
only what changes when the reply is **valid and incomplete**, which every one of those
rungs passes cleanly and none of them detects.
**[context-hierarchy](../context-hierarchy/context-hierarchy.md) owns tiers over a
containment tree**, and its compilation doctrine does not carry here by analogy: this graph
has no root, no leaves and no containment, so a node's neighbours are not its children and
no parent's summary is built from theirs. Its warning does carry whole — a compiled
artifact over a store that keeps changing is stale by construction — and applies to a
re-expressed node description exactly as it applies to an overview.

## The key is a string, and the string is a claim

The naive reading normalises the name and hopes. It fails in two directions at once, and
the two failures are not equally bad.

**The split** is one entity arriving under five surface forms — an abbreviation, a
possessive, a title, a translation, a typographic variant — and becoming five nodes.
Each node is *true*: every fragment on it came from a passage that said so. The cost is
recall, distributed: five weak nodes each sit below every relevance floor the query plane
applies, so the entity that the corpus discusses most is the one retrieval reaches least.

**The collision** is two entities normalising to one string. The resulting node's
description is a biography of a person who does not exist, assembled from true sentences
about two real ones, and the graph will assert it with exactly the confidence it asserts
everything else. This is not a recall loss; it is **fabrication**, and it is manufactured
by the system rather than by the model.

Because the errors are that asymmetric, the normalisation contract is conservative by
construction: it may collapse only differences **no writer could have intended as a
distinction** — encoding width, quoting style, stray markup, whitespace. It may not
collapse abbreviation, honorific, legal-form suffix, or letter case, because each of those
is a distinction some corpus really makes. The instinct to add one more aggressive rule
because a split was observed is the instinct that manufactures the collision, and the two
cannot be tuned against each other by taste. Measure the collision rate against a labelled
sample of the corpus's own names before shipping, carry the estimate as the graph's
predicate, and where it cannot be brought low enough — a corpus dominated by common
personal names, or any corpus where a wrong join is an allegation — **do not build the
graph.** A flat index over the same material loses the relations and asserts nothing.
[surface-form-identity-and-its-risk](./techniques/surface-form-identity-and-its-risk.md)
carries the contract, the disclosure, and the refusal.

## The merge accumulates, and the threshold is where evidence stops

Each passage sees one facet. Last-write-wins destroys the facets it did not see;
first-write-wins ignores them. The merge is therefore **accumulation**: a node's
description is the set of fragments contributed by every passage that mentioned it, and a
relation's is the same over its endpoint pair.

Accumulation buys a property worth naming, because it is the only convergence guarantee in
the subject: below the threshold the operator is **associative and order-independent**, so
re-ingesting the corpus in a different order produces the same graph. Two things are
required to keep it. Deduplicate across the *stored* fragments as well as the new ones —
deduplicating only within a batch appends a duplicate on every reprocess, and a store that
grows on every no-op re-ingest has an unbounded description with a bounded corpus. And
resolve every non-set-valued attribute by a rule that does not depend on arrival order; a
majority vote that gives the stored value one vote regardless of how many passages
produced it lets a single new passage flip an attribute a hundred passages established.

Unbounded accumulation has its own failure: the entity the corpus discusses most acquires
the longest description and then dominates every budget it enters, so the graph's best-
attested node crowds out its own neighbourhood. Hence a threshold, past which the
accumulation is **re-expressed** by a model into one description. Denominate that threshold
in the budget the description will be spent from, not in a count of mentions: a count
fires on forty short fragments and never on three long ones, and the constraint being
defended is length. Re-expression is a real loss — after it, the node's stored description
is one fragment and the merge can no longer say what was accumulated — so it is recorded:
the fragment count that produced it, the pass that wrote it, and the fact that
order-independence stops at the threshold, because which fragments were grouped depends on
the order they arrived in. A merge operator that claims convergence for its whole range
when it holds only below the threshold has made a promise it breaks precisely on its
busiest nodes. [accumulate-then-threshold-merge](./techniques/accumulate-then-threshold-merge.md)
carries the operator, the threshold, and what the loss record owes.

## Recall is the failure a well-formed extraction hides

Ask a model to extract the entities from a dense passage and it returns a plausible
handful. The output is well-formed, every field is present, every downstream check passes,
and half the entities are missing. There is no error anywhere and no signal that anything
went wrong — which makes recall the defect class of this subject in the way mixed-model
vectors are retrieval's: nothing fails.

The remedy is a further pass over the same passage with the first pass's output in view,
asking for what was missed. It works, and it is dangerous in proportion to how long it
runs: a model asked repeatedly what else is there will eventually answer, and what it
answers with is invented. So the pass count is **capped, declared, and priced** — the cap
is an operator's knob with a stated cost per passage, not a loop that runs until the model
says it is done, because "I am finished" is exactly the claim the first pass already got
wrong. Two honesty obligations attach. A pass **skipped** because the accumulated prompt
outgrew its budget is not a pass completed, and the passage's extraction says which. And
none of this is measurable from the output: recall is measured against a held-out sample
somebody labelled, or it is not measured at all, and a cap tuned by watching the graph
grow is tuned on the wrong signal.
[recall-passes-with-a-declared-cap](./techniques/recall-passes-with-a-declared-cap.md)
carries the loop, the cap, the fabrication guard, and the skip record.

## One fact, several stores, and nothing spanning them

The write does not land in one place. The node goes to a graph store; an embedding of its
name and description goes to a vector index so a similarity lane can reach it; tracking
rows record which passages contributed. No transaction spans them, and a half-landed write
leaves a node that is correct by every measure above and **unreachable through the door
the query plane uses**.

Two disciplines replace the transaction. **Order the fan-out so the survivable
inconsistency is the repairable one** — the authority first, the derived index second, so
a failure leaves a node without its index entry (fixable) rather than an index entry
without a node (a phantom hit that cannot be joined back). And **flush every store at one
named commit barrier**, so there is a single point at which "this batch is durable"
becomes true, rather than a per-write race whose outcome depends on which backend buffers.

What does not transfer is the retrieval subject's repair. Its drift rule assumes the index
is cheaply re-derivable from a source of truth the system still holds — re-read the unit,
re-embed it. Here a node's description is a function of *every passage that ever mentioned
it*, which is not derivable from the document being written, and re-deriving it means
replaying all of those extractions at model prices. So the fan-out is preceded by a
**durable manifest of what this run is about to touch**, written and flushed before the
first mutation, because the affected set cannot be recovered afterwards from either store.
Deletion is the same problem at its sharpest: removing one source from a node that fifty
other sources also wrote is a **rebuild of that node**, never a delete, and a system that
treats it as a delete loses forty-nine passages' evidence to remove one.
[recoverable-fan-out-write](./techniques/recoverable-fan-out-write.md) carries the
manifest, the ordering rule, the barrier, and the reduction path.

## Failure modes this standard exists to prevent

- **The confident composite** — two entities collapsed by an over-eager normalisation rule,
  their facts merged into a description of nobody, asserted like every other node.
- **The scattered entity** — one entity split across variants, each node too weak to clear
  a floor, so the corpus's central subject is its least reachable one.
- **The unattributed identity** — a graph that carries where each fact came from and not
  the decision that put those facts on one node, so the only claim nothing vouches for is
  the only one that cannot be audited.
- **The description that ate the budget** — unbounded accumulation on a popular node, which
  then crowds out its own neighbours in every slice it enters.
- **The vanished evidence** — re-expression performed in place with no record of how many
  fragments it consumed, so nothing downstream tells a summary of forty passages from a
  sentence that arrived once — and a merge that keeps claiming convergence above the
  threshold where it stopped holding.
- **The satisfied extractor** — one pass, well-formed output, half the entities missing, no
  instrument that could notice; and its mirror, re-prompting past diminishing returns until
  the model supplies entities the passage does not contain.
- **The unreachable node** — a correct node absent from the index that was its only door,
  because the fan-out half-landed and nothing compares the stores.
- **The delete that was a rebuild** — one source removed, and with it every other source's
  contribution to the nodes they shared.

## The techniques

- [surface-form-identity-and-its-risk](./techniques/surface-form-identity-and-its-risk.md)
  — the normalised name as the node key: what normalisation may and may not collapse, the
  asymmetry between splitting and colliding, the disclosure the choice owes, and when to
  refuse the graph.
- [accumulate-then-threshold-merge](./techniques/accumulate-then-threshold-merge.md) — merge
  as accumulation, dedup across stored and new, order-independent attribute resolution, the
  budget-denominated re-expression threshold, and the loss record.
- [recall-passes-with-a-declared-cap](./techniques/recall-passes-with-a-declared-cap.md) —
  the further pass over one passage, the cap as a priced knob, the fabrication guard, a
  skipped pass that says so, and measuring recall against a labelled sample.
- [recoverable-fan-out-write](./techniques/recoverable-fan-out-write.md) — the pre-mutation
  manifest, the ordering rule that makes the surviving inconsistency repairable, one named
  commit barrier, and reduction rather than deletion when a source is withdrawn.
