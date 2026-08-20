---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: evidence-path-finding
status: forged
laws: [deterministic-code-owns-numbers, every-cap-ships-its-population, lead-not-finding]
shared_with: []
use_when: [answering "how is A connected to B" over a civic graph, designing a connection-finder feature, choosing which relations count as evidence]
---

# Evidence path finding

The concern: turn "how is A connected to B" into an answer a reader can check
and repeat — the shortest *documented* connection, with every hop carrying its
relation, source and review status — rather than the graph-theoretic artifact a
naive shortest-path call returns. On a civic graph the naive call is not merely
weak, it is misleading with confidence: it will happily route every pair of
public figures through a party membership and a chamber roster in two hops and
present the triviality as a discovery.

## Not all relations are evidence

The first decision is which edges the traversal may walk, and it is an
ontology-level decision, printed as a rule:

- **Dense statistical relations are excluded.** A pairwise similarity relation
  (co-voting agreement, co-attendance) computed over a full population is a
  matrix wearing a graph's clothes — at typical coverage it approaches the
  complete graph on its kind, so it collapses all distances to ~2 and a path
  through it asserts nothing a random pair would not also "prove". Exclude
  such relations from traversal entirely; they remain first-class for display
  and analysis.
- **What remains is the documentary layer** — membership, sponsorship,
  ownership, supply, amendment: edges where each hop corresponds to a citable
  record. The traversal's output inherits the credibility of its weakest hop,
  which is why the edge set must be principled, not "everything we have".

## Hubs are priced, endpoints are exempt

Even over documentary relations, institutional hubs — parties, large chambers,
ministries — connect nearly everyone. The correction is a degree-based step
cost: entering a node whose evidential degree exceeds a threshold costs two
steps instead of one, so a specific route (person → firm → contract) outranks a
generic one (person → party → person) of equal hop count. Two details carry the
technique:

- **Endpoints are always cheap.** The penalty exists to discourage paths
  *through* the largest nodes, never paths *to* them — a question asked about
  a party must not be taxed for being about a party.
- **Degree is computed over the traversable edge set**, after exclusions —
  a node's density in relations the path may not use is irrelevant.

A bounded total cost doubles as the honest horizon: beyond it, report "no
documented connection within N steps", which is a finding, and a different one
from "no connection".

## The ranking is part of the answer

Among minimum-cost paths, the winner is chosen by a printed, deterministic
tie-break — because ranking is an editorial act, and an unprinted editorial
act is an unaccountable one:

1. **Fewer unverified hops first.** A path of human-verified edges outranks
   one leaning on pending machine matches — per
   [lead-not-finding](../../../_laws.md#lead-not-finding), the system prefers to
   lead with what a human stands behind, and each pending hop is visibly
   marked, never blended.
2. **Then higher documented value** — e.g. the summed amounts of contract
   hops — so the materially larger connection leads when verification ties.
3. **Then a purely technical final key** (the lexicographic path signature),
   guaranteeing a total order.

Determinism is a property, not a promise: the same edge multiset in any input
order must produce the identical result, which in practice means canonical
adjacency ordering, commutative de-duplication of parallel edges (verified
status wins, larger weight wins), and no iteration-order dependence anywhere.
Per
[deterministic-code-owns-numbers](../../../_laws.md#deterministic-code-owns-numbers),
the path, its cost and its ranking are computed by reviewable code — a language
model may *narrate* a found path, never find or rank one.

## Enumerate honestly, cap visibly

Compute exact distances from both endpoints (a two-sided sweep), then
enumerate only edges lying on some optimal path — the enumeration visits real
answers, never the whole neighborhood. Two disclosures per
[every-cap-ships-its-population](../../../_laws.md#every-cap-ships-its-population):

- **Alternatives are equal-cost paths only.** Longer paths are a different
  question ("does a connection exist through more steps"), not worse answers
  to this one; do not pad the list with them.
- **The cap is reported.** Hub combinatorics can make equal-cost paths
  explode; cap the enumeration, and return alongside the winners both the
  count found and whether the cap was hit — "3 of at least 64" and "3 of 3"
  are different answers.

One accounting trap worth naming because it silently corrupts results: with a
two-sided distance sweep under non-uniform node costs, the return-side
distance to a node already includes that node's entry cost. An enumerator that
adds the node's step cost again double-charges exactly the penalized hubs and
wrongly excludes legitimate paths through them. Pin the arithmetic with a
fixture test containing a hub on the true shortest path.

## When not to use it

Path finding answers "what is the shortest documented connection". It does not
answer "is this connection *significant*" — a three-hop path through public
records may be perfectly innocent, and the feature must present it as
structure, not insinuation. Nor is it a substitute for neighborhood analysis
(who surrounds X) or flow analysis (how much money moved) — different
questions, different algorithms. Reach for evidence paths exactly when a
reader has named two entities and asked to see the wiring between them.
