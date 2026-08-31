---
layer: technique
type: technique
subject: retrieval
technique: structural-centrality-lane
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [the corpus's own structure carries relevance the query cannot express, a curated importance field has gone constant, ranking a corpus whose items reference each other by name, a seat for the item every other item depends on, deciding whether relevance requires a query at all]
---

# Structural centrality as a lane

Every lane in [hybrid-lane-fusion](./hybrid-lane-fusion.md) is a function of
the query — *what looks like this?* —
and [relationship-proximity-lane](./relationship-proximity-lane.md) adds one
that is a function of the results — *what is attached to what looks like
this?* Both need something to start from.

There is a third question, and it needs neither: **what does this corpus
revolve around?** An item can be the one worth handing over because everything
else in the corpus depends on it, and importance in that sense is a property
of the corpus's own shape. It is computable before any query exists, and the
items it finds are systematically the ones the other lanes miss: the base
class no one names because everyone inherits it, the schema every feature
document quotes a column from, the decision six later decisions were made
under. These score near zero on term overlap with a task that is *about* them,
because a task says what it wants changed, not what that thing rests on.

That is the seat's price paid: a distinct failure mode, covered by no other
lane. What follows is how the lane is built, why it is not a curated
importance field, and the one lane it is not independent of.

## The graph is derived from content, not stored as edges

The prerequisite looks like an edge table, and reaching for one is the
expensive mistake. Proximity's warning — *concluding there is no relational
signal because there is no edge table* — has a sharper form here: the relations
this lane needs are **already latent in the items**, because a corpus whose
items reference each other by name has written its own adjacency down. Two
passes over the content produce it:

- **Definitions.** What each item introduces under its own name — the symbol
  it declares, the heading it sits under, the term it is the authority on.
- **References.** What each item mentions that some other item defines.

An edge runs from the referencer to the definer, weighted, and the graph is
whatever those two sets intersect on. Nothing was curated, nothing was
maintained, and no author was asked to describe their document's neighbours —
which matters because the alternative always decays (below).

This makes the graph a **derived value in the
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
sense**: it names how it is rebuilt, it is invalidated by content changes and
not by a schedule, and it is cheap enough to be rebuilt rather than migrated.
Cache it per item keyed by content hash — the same identity
[chunking-and-indexing](./chunking-and-indexing.md) already computes — so a
rebuild costs only the items that changed. It is emphatically *not* an
embedding: no model version, no dimension, no comparability trap, and a
corpus with no embedder available can still run this lane.

## Rank the corpus; let the query steer, not filter

With a graph in hand the naive move is to score items by degree — how many
things point at them. Degree is a local count and it is gameable by
boilerplate: the utility every file imports outranks the module the system is
about. What is wanted is the **stationary distribution**: rank flows along
edges and settles, so an item pointed at by important items outranks one
pointed at by many trivial ones. That is an eigenvector computation over the
weighted graph, run to convergence, and it is the whole lane's arithmetic.

The query enters, and here is the move that makes this a lane rather than a
static popularity list: the query's terms become the **personalization
vector** — the distribution the walk restarts from — rather than a filter over
the results. The difference is not cosmetic:

- **Filtering** ranks globally and then keeps what matches, so it can only
  ever return items the query already described. It cannot surface the
  unnamed dependency, which is the entire failure this lane exists to cover.
- **Personalizing** re-solves the whole graph with mass injected at the
  query's items, so rank flows *outward from them* along real edges. Items the
  query never mentioned rise because they are structurally close to what it
  did mention, and the same corpus produces a different order for every query.

A query naming nothing in the corpus degrades to the uniform restart — global
centrality, which is a defensible order and never an error. **The lane
therefore always has an answer, which makes its
[floor](./relevance-floors.md) the operator's job, not the mechanism's**: it
will happily rank a corpus that contains nothing relevant, exactly as
nearest-neighbour search returns k results from an empty neighbourhood.

## Weight edges by discrimination, or the hubs win

Unweighted, the graph is dominated by whatever every item mentions. The
weighting is an inverse-frequency judgment applied to references, and four
adjustments carry most of the value:

- **Down-weight the ubiquitous.** A name defined in many places identifies
  nothing; it is the corpus's connective tissue, not its content. This is the
  single most important term — without it, the framework's own vocabulary
  outranks the domain.
- **Up-weight the specific.** Long multi-word names are chosen deliberately
  and are far likelier to name a real thing than a short common word that
  collides with prose.
- **Down-weight the private.** A name marked as internal by convention is
  reachable from fewer places and should carry proportionally less rank.
- **Compress reference counts.** A referencer that mentions a name forty times
  is not forty times the evidence of a referencer that mentions it twice —
  it is usually one tight loop. Take a square root, or any concave transform,
  so high-frequency mentions cannot dominate.

Every one of these is a knob, and every knob is an
[evaluation](./retrieval-evaluation.md) question rather than a taste question.
Tune them against a labeled set or do not tune them at all.

## Rank the nodes, but emit what the consumer reads

The graph's nodes are usually coarser than the unit the consumer wants: files
ranked, but definitions emitted; documents ranked, but sections emitted. Cutting
the top-ranked *nodes* and handing over whole items wastes most of the budget
on the uninteresting parts of interesting items.

The step that fixes it is small and easy to miss: **push each node's rank back
out along its own out-edges, in proportion to their weights, and accumulate at
the (target, name) pair.** Now every individual definition carries a score
derived from the importance of everything that referenced it, the emitted unit
is rankable, and the cut in
[ranking-budgets](./ranking-budgets.md) has something item-sized to cut. A lane
that ranks one granularity and emits another has not finished.

## It is not independent of the proximity lane

The roster's admission question has a second half — name the lanes you are not
independent of — and this lane owes an answer: **it reads the same relations
[relationship-proximity-lane](./relationship-proximity-lane.md) reads.**
Proximity traverses them locally, one hop from a seed; centrality solves them
globally with no seed at all. Different questions, same edges, and a hub scores
high in both by construction.

Fused as peers they double-count exactly the items most likely to be
over-represented already. Fuse them as one relational contribution — take the
max, or attribute the item to whichever lane found it first and let the other
lane's agreement register as
[convergence](./hybrid-lane-fusion.md)
rather than as additional score. Against the query lanes it is genuinely
independent: it consults no term index and no vector, and it will disagree with
both, which is the point.

## When a curated importance field already exists, check whether it still varies

The reason to reach for this lane is usually that a hand-maintained importance
or priority field is already in the schema and is supposed to be doing this
job. Before building anything, **measure that field's distribution over the
items it ranks.**

Such fields decay in one characteristic direction. They are declared
`NOT NULL DEFAULT <middle value>`, every write path takes the default because
supplying a real judgment requires a judgment, and the column converges on
constant. The tie block then swallows the tier: a "top N by importance" query
over a field where nearly everything holds the default is returning an
arbitrary N, ordered by whatever the index happened to scan, and it looks like
a ranking at every layer above it.

This is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
wearing a schema default. "Nobody has judged this item" and "somebody judged
this item to be of middling importance" are different claims, and a
`DEFAULT 3` renders them identically — so the ranking cannot separate them and
nothing anywhere reports that it can't. The diagnostic is one query and it
belongs in the eval suite, not in a migration:

> Over the items this field ranks, how many distinct values does it take, and
> what share sits in the largest tie block?

Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate),
the answer travels with what was counted. A field holding one value for the
great majority of its rows is not a weak signal to be blended in; it is an
**absent** one, and a derived structural signal is strictly better than it
because it discriminates without asking anyone to maintain it.

## When this lane earns no seat

- **The items do not reference each other.** Independent records — support
  tickets, transactions, unrelated user notes — have no latent graph, and two
  passes will find an edge alphabet near zero. Measure the intersection of
  defined and referenced names before building; a near-empty intersection is
  the answer.
- **The corpus is flat and small.** Centrality needs enough structure to have
  a shape. A few dozen items are better browsed, per the same scale-honesty
  check the golden path applies to retrieval as a whole.
- **Recency dominates the domain.** Where the valuable item is nearly always
  the newest, centrality is actively wrong: a new item has no in-edges yet and
  ranks last precisely when it matters most. This lane ranks what the corpus
  has settled on, which is the opposite bias to the recency lane's, and a
  domain that wants only the second one should not buy the first.
