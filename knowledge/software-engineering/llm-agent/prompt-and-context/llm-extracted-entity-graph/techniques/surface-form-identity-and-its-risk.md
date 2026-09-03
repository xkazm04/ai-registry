---
layer: technique
type: technique
subject: llm-extracted-entity-graph
technique: surface-form-identity-and-its-risk
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [choosing a node key when the only candidate is a name, deciding whether a normalisation rule may collapse two spellings, a popular entity that retrieval never reaches, deciding whether this corpus should have a graph at all]
---

# Surface-form identity, and its risk

The node key is a normalised name the model produced, and two mentions are the same entity
if and only if they normalise to the same string. This is the decision the whole subject
rests on, it violates the corpus's own identity law on purpose, and the discipline is
entirely about being honest that it does.

[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) says identity is
minted once at creation and carried, and that name-equality breaks under the operations
real collections undergo. The law is right. There is simply nothing to mint from: the
entity was not created by this system, it was *mentioned* by a document, and no identifier
accompanies it. So the key is derived rather than minted, and the cost the law predicts is
paid rather than avoided — which makes measuring and disclosing that cost the technique,
not an optional extra on top of it.

## The two errors, and why they are not symmetric

**A split** is one entity keyed under several strings. Every resulting node is true: each
carries only fragments from passages that said so. The damage is a recall loss, spread
thin — the entity the corpus discusses most becomes five nodes, none of which clears a
relevance floor, none of which carries the relation that mattered.

**A collision** is two entities keyed under one string. The node's description is a
composite of true sentences about two real subjects, describing a third that does not
exist, and the graph renders it exactly like everything else. This is fabrication with a
database row, and per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) it is the specific
laundering the law names: *we do not know whether these are the same* has been written down
as *they are the same*, at the boundary where a string comparison met a graph write.

**The decision rule follows from the asymmetry: when a normalisation rule would fix a
split at the risk of a collision, do not add it.** A split degrades an answer; a collision
manufactures one. Teams reach for the aggressive rule because splits are the visible
symptom — somebody notices five nodes for one company — while collisions are invisible by
construction, since the merged node looks healthier than either of its parents.

## What normalisation may collapse

One rule decides membership: **a normalisation step may collapse only differences no
writer could have intended as a distinction.**

Permitted, because they are artifacts of transport rather than of authorship: character
width and encoding variants, quotation-mark style, stray markup that survived parsing,
leading and trailing whitespace, and the collapse of runs of whitespace inside a name.

Refused by default, because each is a distinction some corpus really makes: abbreviation
and expansion (the same three letters name a different body in another field), honorifics
and titles, legal-form suffixes (two entities in one group differ by exactly that suffix
and their obligations differ with it), possessives, and **letter case** — which
discriminates between a common noun and the product named after it in most technical
corpora. Where a specific corpus can show one of these is safe, it is admitted as a
*declared* exception with the observation that justified it, never as a default nobody
argued for.

Two structural rules complete the contract. **Normalisation is one door**, per
[one-validation-door](../../../../_laws.md#one-validation-door): the same function
produces the key at extraction, at merge, at manual correction and at every import path.
The failure this prevents is the ordinary one — a second call site that normalises
slightly differently mints a shadow node that is invisible until somebody counts. And
**the contract cannot be delegated to the extraction instructions.** Telling the model to
name entities consistently is a request, not a rule; it holds for most passages and fails
on the ones that matter, and a key whose stability depends on a model's compliance is not
a key. Whatever the instructions ask for, the code enforces.

## Rejected: the aggressive resolver

The alternative that looks obviously better is to resolve entities properly — compare
candidates by string distance, or by embedding proximity, or by asking a model whether two
nodes are the same, and merge the ones that pass a threshold. It is rejected here, and the
forces are worth stating because the rejection is not "it is hard".

- **It moves the error into the direction that fabricates.** A threshold-based merge trades
  splits for collisions by design, and the trade is only sound when a wrong merge is cheap.
  Here it is the most expensive thing the system can do.
- **It has no arbiter.** Identifier-joined resolution can be wrong and be *shown* to be
  wrong, because the register settles it. A similarity merge over a corpus with no
  authority has nothing to check itself against; the same absence that forced the surface
  key forbids the resolver that would fix it.
- **It is unbounded and order-dependent.** Pairwise candidate comparison over a growing
  node set is quadratic, and merges applied in arrival order produce different graphs from
  the same corpus — surrendering the one convergence property
  [accumulate-then-threshold-merge](./accumulate-then-threshold-merge.md) provides.

What is *not* rejected is resolution as a **proposal surface**: candidate pairs surfaced
for a human, merged only on a decision, with the decision recorded. That is a review lane,
and a system that needs one has usually acquired the conditions for identifier-joined
identity and should be asked whether an authority exists after all.

## Disclose the exposure, and price it before shipping

The graph carries an identity risk whether or not anyone measures it, so the deliverable is
a number rather than a caveat. Draw a sample of the corpus's own names, label the ones that
collide under the proposed contract and the ones that split, and state both rates with what
they were measured over. That estimate is the graph's predicate: every count of nodes,
every path, every claim that two things are connected inherits it. Re-measure when the
corpus changes character — a merger, a new source, a second language — because the rates
are properties of the *names in this corpus*, not of the normalisation function.

Carry the identity decision on the node as well, not only in the report: the contract
version that produced the key, and the fact that the key is inferred. A consumer rendering
a node is then able to say *these mentions were treated as one entity*, which is the truth,
instead of *this is an entity*, which is a claim nothing supports.

## When to refuse the graph

Stated plainly, because the rest of this subject is expensive and the refusal is the
cheapest correct answer available:

- **A wrong join would be an allegation.** People, firms, contracts, anything where
  attaching A's conduct to B is a harm rather than a bad search result. Refuse; the
  registry-joined discipline in the civic domain of this registry owns that case, and its
  first-named failure mode is exactly the graph this technique describes.
- **The names are dominated by common personal names.** Measure first; a corpus whose
  entity population is mostly surnames has a collision rate no contract fixes.
- **The relations are references, not meanings.** Where items cite each other by name, the
  adjacency is latent in the content and
  [structural-centrality-lane](../../retrieval/techniques/structural-centrality-lane.md)
  recovers it with two cheap passes, no model call, and no identity decision at all.
- **The corpus is small enough to browse.** The same scale-honesty check the
  [retrieval](../../retrieval/retrieval.md) golden path applies to itself applies harder
  here, because this graph costs a model call per passage before it answers anything.

## The boundary against content-addressed identity

The neighbouring identity scheme in this corpus is the one
[chunking-and-indexing](../../retrieval/techniques/chunking-and-indexing.md) specifies: a
unit's key is a hash of its content plus its source, which makes re-ingest an idempotent
upsert. That scheme is correct and this subject depends on it — the passages extracted from
are keyed exactly that way, and a graph that mints its own passage identity duplicates the
corpus on every re-run.

It does not extend to the node, and the reason is structural rather than a matter of
effort. A unit *has* content of its own to hash. A node has none: its description is
assembled from every passage that mentioned it, so hashing it produces a key that changes
every time a new passage arrives — the one thing a key may never do. The node's identity
must therefore come from something stable across merges, and the only stable thing
available is the name. Content addressing survives one layer down and stops at the node,
and that is where the risk this technique manages enters the system.
