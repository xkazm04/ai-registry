---
layer: technique
type: technique
subject: retrieval
technique: relationship-proximity-lane
status: forged
laws: [identity-survives-reuse, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [the corpus stores typed relations between items, deciding whether an edge table earns a place in recall, a stored graph that nothing queries at request time, expanding a candidate set along relations, choosing between a relation store and relations inside the existing store]
---

# Relationship proximity as a lane

The roster in [hybrid-lane-fusion](./hybrid-lane-fusion.md) is built from
matchers that take the query and return candidates: lexical, semantic,
recency, and a pinned tier that ignores the query on purpose. All four ask
the same question in different vocabularies — *what looks like this?*

There is a fifth question, and a corpus that stores relations can ask it:
*what is attached to what looks like this?* An item that shares no terms with
the query and sits nowhere near it in embedding space can still be the thing
the reader needed, because it is one typed edge from something that does
match. A decision and the constraint that forced it, a fact and the episode
that produced it, a claim and the claim that contradicts it — none of those
pairs is guaranteed to be lexically or semantically close, and several are
valuable *precisely* when they are not.

That is a distinct failure mode, which is the roster's admission price. What
follows is the case for the seat, and the four ways this lane is not like the
others.

## Owning edges is not the trigger — enumerate the readers

The cheapest mistake here is inferring a workload from a schema. A relation
table is not evidence that anything traverses it, and applications accumulate
edges for reasons that have nothing to do with recall: portability exports,
audit trails, a rendered link view, a reindex cache, a vocabulary someone
specified before the feature that would consume it.

**Enumerate the readers of the edge relation and classify each one.** If they
are all exporters, importers, admin views and rebuild jobs, the graph is a
*record* — a thing the system keeps — and a record needs no lane. The lane is
earned by a reader on the request path, and if none exists the honest finding
is that the edges are currently write-only, which is worth knowing on its own
before anyone prices a store that traverses them faster.

The reverse error is rarer and worse: concluding there is no relational
signal because there is no edge table. Relations are frequently implicit in
foreign keys, in a path hierarchy, in a shared provenance row. The question
is whether a *traversable* relation exists, not whether someone has named it.

## It has no query form, so it is not a peer lane

Every other lane is a function of the query. This one is a function of
*results*: it needs a seed set before it can do anything, which means it
cannot run alongside the others in the way the roster's "run in parallel and
union" shape assumes. It runs after them, over what they returned.

Three consequences follow, and each one breaks a rule the peer lanes live by.

- **Its budget is not a share of the slice, it is a fan-out cap.** A peer
  lane asked for its best k. An expansion lane asked for k neighbours *per
  seed* produces k × |seeds| candidates before any cut, and on a dense
  relation that is the whole corpus at depth two. Cap the seeds first, then
  the neighbours per seed, and state both.
- **Depth is a different question from reach.** Most retrieval expansions
  want the *set* of items within n hops, not the paths that reach them. Those
  have wildly different costs — the set deduplicates at every level, the path
  enumeration multiplies by degree at every level — and reaching for the
  second when you needed the first is the standard way this lane becomes the
  slowest thing in the pipeline. Ask for the set unless a path is what the
  consumer will read.
- **A dry lane is not a broken one.** Per
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
  a corpus with no edges yet and an edge index that failed to open must not
  produce the same empty. The first is a normal slice; the second is a
  degraded one and owes the label.

## Its hits are not independent evidence

This is the sharp one, and it is a genuine correction to the fusion rule
rather than an addition to it.

[hybrid-lane-fusion](./hybrid-lane-fusion.md) holds that multi-lane
convergence is itself evidence: an item surfaced by both the lexical and the
semantic lane is likelier relevant than either lane's score implies, and rank
fusion rewards that automatically by summing contributions. **That property
depends on the lanes being independent**, and an expansion lane is by
construction not independent of the lane that seeded it. A neighbour of a
top-ranked hit was surfaced *because* that hit ranked, so summing the two
contributions counts one piece of evidence twice, and it does so hardest
exactly where the seed lane was most confident.

The failure is quiet and self-reinforcing: a strong seed drags its whole
neighbourhood into the slice, the neighbourhood's presence looks like
corroboration, and the slice ends up describing one region of the corpus in
depth while the query's other senses go unrepresented. Diversity cuts do not
catch it, because the items genuinely differ.

Two honest treatments:

- **Fuse the expansion as a tier, not as a peer.** Neighbours fill seats the
  query-driven lanes left empty, after them, and never outrank their own seed.
- **Or attribute the neighbour to its seed and fuse once.** The seed carries
  a single contribution; its neighbours ride along as attached context that
  spends budget without spending rank.

Either way the fused entry records what reached it, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate):
"reached by expansion from *X*, depth 1, relation `supports`" is a different
claim from "matched semantically", and the consumer that has to explain the
slice needs the difference. Dedup against the seed set on durable identity —
per [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse),
a neighbour is very often already a hit.

## Relations are typed, and the type decides what expansion means

A lane that walks every edge uniformly has rebuilt the vocabulary problem it
was supposed to solve. Typed relations do not all mean "more like this":

- **Supporting and derivational** relations expand *agreement*. They are the
  safe default and the least interesting, because a semantic lane often
  reaches them anyway.
- **Contradicting** relations expand *disagreement*, and they are the reason
  to build the lane at all. Nothing else in the roster can surface the item
  that disputes the top hit — the lexical and semantic lanes are both
  similarity matchers, and similarity is the wrong instrument for finding an
  objection. A slice that presents a claim without the claim that contradicts
  it is confidently wrong in the one way retrieval is supposed to prevent.
- **Superseding** relations expand *time*, and they invert the usual
  direction: when a matched item has been replaced, the replacement belongs
  in the slice and frequently the match does not.

So the lane's configuration is not a depth and a cap alone; it is a **per
relation policy** saying which types expand, in which direction, and whether
the neighbour joins the seed or displaces it. A relation with no stated policy
should not be traversed — the default of "walk everything" is how a
contradiction and a footnote end up weighted alike.

## The edge is a boundary crossing

Per the fusion technique's rule on blind predicates, every lane must have its
un-expressible predicates re-imposed downstream — and an expansion lane is the
most dangerous case in the roster, because an edge is a pointer that was
written under one scope and is being followed under another. The neighbour of
an in-scope item is not necessarily in scope: relations outlive the tenancy,
conversation and visibility rules that governed the items they connect, and
following one is exactly how a slice acquires an item the consumer was never
entitled to see.

Re-impose the scope predicate **after the traversal returns and before
fusion**, on the neighbour's own attributes — never by trusting that the seed
was in scope. This is the same discipline the nearest-neighbour lane needs for
the same reason, one degree more exposed.

## When the answer is that the lane does not pay

Stated plainly, because the roster's other seats are cheap and this one is
not:

- The corpus has relations, but every one of them is reachable by a filter
  the consumer already applies. An expansion that reproduces a `WHERE` clause
  is a slower `WHERE` clause.
- The relations are dense and untyped. Expansion on a near-complete graph
  returns most of the corpus at depth two, and the cut that follows is doing
  all the work — the lane contributed noise and latency.
- The corpus is small enough that
  [the scale-honesty check](../retrieval.md) has already said retrieval is the
  wrong tool. A graph over four hundred documents is a browsable index.

None of those is an argument against storing the relations. They are
arguments against *querying* them at request time, and the distinction is the
whole technique: a system can be right to keep a graph it never traverses,
and it should say so deliberately rather than discover it in a schema years
later.
