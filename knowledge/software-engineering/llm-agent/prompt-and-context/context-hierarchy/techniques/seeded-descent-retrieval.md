---
layer: technique
type: technique
subject: context-hierarchy
technique: seeded-descent-retrieval
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [retrieving over a tree whose interior nodes carry summaries, deciding whether to return a node or its children, a consumer asks which branches are relevant without wanting leaves, a tree search that never terminates or always returns the root's children, choosing whether a parent's score should influence its children]
---

# Seeded descent retrieval

A summarised tree can be searched two ways, and the obvious one is the worse one. This
technique fixes the search's shape: where it starts, how it walks, when it stops, what
it hands over, and which of its knobs should be left alone until somebody measures
them.

## Seed globally, then descend

A **rooted walk** — score the root's children, take the best, score *its* children,
repeat — is what the tree's shape suggests. It fails for two reasons that were
measured before this subject existed. It commits to one branch at each level before it
has seen the others, so a question whose answer spans two siblings gets one of them.
And it returns a constant mix of levels regardless of the question: the walk visits
one node per level, so a question that wanted three leaves and a question that wanted
one overview receive the same-shaped slice. Searching all levels at once — every
summary node and every leaf in one flat candidate set — beat the walk because it let
the question pick its own granularity.

A **flat search** over everything is the other extreme, and it throws away the tree:
the best leaf's siblings, which the tree says are about the same thing, are found only
if their own text happens to match.

The synthesis is **seed globally, then descend locally**. One search over the abstract
and overview tiers of the whole tree — a flat search, run by the machinery the
retrieval subject already owns — returns the nodes whose summaries resemble the
question. Those nodes, plus the explicit roots the consumer scoped the query to, are
the starting points of a priority queue keyed by score. Then:

1. Pop the highest-scoring unvisited node. Mark it visited; a tree with symlinks or a
   queue with duplicates otherwise walks forever.
2. Search its children with the same query — a bounded fetch, a small multiple of the
   final limit, per the overfetch rule in
   [ranking-budgets](../../retrieval/techniques/ranking-budgets.md).
3. Score the children. Where a reranker is configured and the query mode permits it,
   rerank the children's abstracts; otherwise the vector score stands.
4. Admit every child above the floor into the collected set, deduplicated by address
   with the higher score kept. Push interior children onto the queue; leaves are
   terminal.
5. After each round, compare the collected set's top-k to the previous round's. Stop
   when it has been unchanged for a stated number of rounds, or when the collected
   pool has stopped growing for that many rounds.

Several nodes can be popped and their children searched in parallel per round; the
convergence check runs once per round, not once per node, so parallelism changes
latency and not the stop.

The decision rule that keeps the descent from becoming a crawl: **descend only when
the seed's tier says the answer is below.** A seed whose abstract already answers the
question — "which areas cover authentication" — is the answer, and a level filter
(below) returns it without a single child search.

## Two surfaces, and the cheap one has no descent

A hierarchy serves two kinds of caller, and giving them one path overcharges one of
them.

The **query-only surface** takes a string and a scope, runs the global search across
whatever tiers the caller asked for, applies the floor, and returns — no model call,
no rerank, no descent. Its latency is one vector search. It exists for the caller that
wants to know what is there, for the lookup embedded in a larger tool, and for any
caller that cannot pay for a model on the request path.

The **full surface** takes a session and a task. A planning model reads the recent
turns and produces zero to a handful of typed sub-queries — one per kind of thing the
task might need, each phrased in that kind's own style, each with a priority — and
each sub-query runs the seeded descent above with rerank enabled. Zero sub-queries is
a legitimate output: it is the retrieval subject's *skip*, and it is not an empty
result.

The rule: the full surface is for a task, the query-only surface is for a question.
A system that routes every call through intent analysis and descent has priced its
cheapest caller out; a system with only the cheap path has no answer for the task
that needs three kinds of context at once.

## Propagation and dominance: two knobs, both off until measured

Two questions arise inside the descent, and both are answered by a number a team will
be tempted to tune by feel.

**Should a parent's score colour its children's?** The descent computes each child's
final score as a blend: the child's own score weighted by a factor, plus the parent's
score weighted by the remainder. A factor of one means the parent has no say. The
argument for propagation is that a child of a strongly relevant parent deserves a
boost; the argument against is that the parent's relevance is already spent — it got
the child *searched* — and spending it again double-counts the tree. A tree whose
default factor is one is recording that propagation has not been shown to help, and
the decision rule follows: **leave propagation off until an evaluation on a labeled
set shows it moving a ranking metric, and treat any other setting as an experiment.**
The corpus holds no measurement in either direction; that absence is a lead, not a
license.

**Should a node be handed over instead of its children?** A node can be about the
topic while each of its children is about a fragment; returning the children spends
several seats on one answer, and returning the node spends one. The test is
dominance: return the node when its score exceeds the best child's by a stated ratio.
The rule has the same shape as propagation — declare the ratio, default it off, and a
tree that declares the constant and never applies it has told you what it measured.
Until it is applied, the consumer receives nodes and leaves in one order and the cut
in ranking-budgets decides.

## Level-addressed search

Because the tiers are indexed with their level, a search can be **addressed to a
level**: abstracts only, overviews only, leaves only, or any subset. This is the
mechanism behind the decision rule above. "Which branches are relevant" is a search
addressed to the abstract tier with no descent; "confirm the scope of these three
branches" is a search over overviews; and the full descent is a search whose collected
set is filtered by the levels the caller asked for while the walk still traverses
interior nodes regardless — a walk that refused to *enter* an interior node because the
caller did not want it *returned* would never reach the leaves under it.

One boundary forces a second search rather than a filter. Where access control applies
per leaf and not per node, the summary tiers cannot carry the caller's permission —
a parent's abstract describes children the caller may not see — so the leaf tier is
searched separately under the caller's scope and merged into the candidate set. This
is not a fusion of two lanes in the retrieval subject's sense; it is one lane run
twice because the tree's tiers and the permission model have different granularity.

## What the result carries

Every returned item names its level, and the result names what it searched. Per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), "five results"
from a descent means nothing until the consumer knows which tiers were eligible, which
roots were scoped, and whether the reranker ran. And per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), a descent
whose reranker failed and fell back to vector scores is a different result from one
whose reranker ran; the fallback is a legitimate degraded mode, and it is reported as
one rather than folded into the score. The same holds for a descent that stopped on the
round cap rather than on convergence: "the top-k settled" and "we ran out of rounds"
produce identical slices and different confidence.

## Decision rules

- When a query names a topic or an area, seed from the summary tiers and descend;
  when it names an identifier or an exact phrase, the retrieval subject's lexical lane
  over leaves is the right tool and no descent is owed.
- When the seed's abstract answers the question, address the search to that level and
  return without descending.
- When the caller cannot pay for a model on the request path, give it the query-only
  surface; when the caller has a task and a session, give it the full one.
- When tuning propagation or dominance, do it on a labeled set through the
  retrieval subject's evaluation discipline, and ship the default off.
- When the descent stops, say why — converged, stagnant, or capped — and whether the
  reranker ran.

## When not to use it

A tree with no summary tiers has nothing to seed from; a descent over bare folder
names is a rooted walk with extra steps. Build the tiers first, or search flat.

A query that is exact — an error code, a symbol, a quoted phrase — does not want a
descent. The summary tiers were built to abstract, and abstraction is exactly what
hides an identifier. Route it to the lexical lane over leaves and let the fusion in the
retrieval subject decide whether the descent's candidates deserve a seat beside it.

And a small tree — a few dozen nodes — is browsed, not descended. The consumer reads
the root overview and opens what it names; the queue, the convergence check and the
rerank round-trips buy nothing a listing did not.
