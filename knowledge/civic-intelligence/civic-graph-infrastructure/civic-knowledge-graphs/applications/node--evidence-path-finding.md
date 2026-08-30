---
layer: application
type: application
subject: civic-knowledge-graphs
technique: evidence-path-finding
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: "Connect two points" over a parliamentary money-and-law graph

How the Czech accountability app *politicas* realizes evidence path finding —
`features/graph/trailPath.ts`, a pure DOM-free module tested on fixture graphs
(`trailPath.test.ts`), feeding the forensic display layer in
`features/graph/forensicView.ts`.

## The printed rule (trailPath.ts:8-22, constants :31-42)

The module header states the ranking rule the UI prints to the reader:

1. Shortest path over *evidence* edges. `EXCLUDED_RELS = ["co_votes_with"]` —
   the co-voting relation sits at 96% pair density ("a matrix, not a network";
   20,496 edges over 207 MPs) and would make every path a meaningless 2-hop.
   Hub pricing: a node with ≥ `HUB_DEGREE = 120` evidence edges costs 2 steps
   to enter, "otherwise a path would lead from everywhere to everywhere
   through parties and large organs and say nothing". `MAX_COST = 6` caps the
   horizon.
2. Equal length → fewer `pending_review` hops wins ("verified beats a
   machine's proposal" — the lead-not-finding law as a sort key).
3. Then higher documented value: summed weights of `supplies` contract hops,
   in CZK (`moneyCzk`, trailPath.ts:227-233).
4. Then alphabetical path signature (`signatureOf`, :183) — the purely
   technical total-order key.

Alternates are *equally short* paths only (`ALTERNATES = 3`); longer paths are
declared a different question (:20-22). Enumeration is capped at
`ENUM_CAP = 64` with `capped: true` returned so the UI can say "3 of ≥64"
(every-cap-ships-its-population, mechanized).

## Determinism as a property (trailPath.ts:115-151)

`buildAdjacency` merges duplicate `src|rel|dst` edges commutatively — verified
wins (`prev.pending = prev.pending && e.pending`), higher weight wins — and
sorts every neighbour list, so identical edge sets in any input order produce
identical results. Endpoints are exempt from the hub penalty (:204-207):
"the penalty is to prevent paths THROUGH the biggest nodes, not paths TO
them". Degree is computed after exclusions (Adjacency.degree, :64-68).

The algorithm is bucket Dijkstra (integer costs, no heap) from both ends, then
a DFS only over edges satisfying `g[u] + h[v] + 1 === best` — enumerating real
optimal paths, never the search space. The comment at :214-218 pins the
double-charge trap this technique warns about: `h[v]` already contains v's
entry cost, so the forward cost of hop u→v is exactly `d(u) + h[v] + 1`;
"adding stepCost(v) a second time would disqualify hubs on the path twice."
This is exactly the arithmetic a fixture test with a hub on the true shortest
path must pin.

## The display contract (forensicView.ts:1-53, 62-114)

The forensic default renders human-verified edges only, but `forensicEdges`
takes a `keep` set of lens-requested edge keys — the computed path's hops —
that are **never filtered**: "a requested answer with omitted steps would be a
lie" (:9-12). Kept-pending hops stay dashed and are counted separately
(`keptPending`) from the silently hidden (`hiddenPending`). The edge key
`src|rel|dst` is defined once (`edgeKey`, :22) and re-exported by the canvas
stage "so the lens and the filter speak the same language". Hover cards
(`hoverCardModel`, :82-114) count verified/pending from the **unfiltered**
edge list — "the card tells the truth about the record, not about what is
currently visible" — with a per-relation breakdown capped at `MAX_ROWS = 4`
plus a `more` count for what didn't fit.

## Transplant notes

Keep the path module pure and constant-driven: the five rule constants are
exported, the UI prints them, and the tests nail them — so the editorial rule
cannot drift from the rendered explanation. Tune `HUB_DEGREE` to your graph's
degree distribution (politicas chose 120 against party/organ degrees in the
hundreds), and derive the excluded-relation list from ontology metadata
(relation density) rather than hardcoding, if your ontology grows dense
relations regularly.
