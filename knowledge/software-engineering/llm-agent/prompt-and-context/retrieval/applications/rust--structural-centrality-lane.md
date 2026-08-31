---
layer: application
type: application
subject: retrieval
technique: structural-centrality-lane
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The relation signal was in the corpus, not in the edge table (Rust, Tauri + SQLite)

A sibling application on this same tree
([relationship-proximity-lane](./rust--relationship-proximity-lane.md),
2026-08-27) enumerated the readers of its two typed-relation stores and found
none on the request path — the edges were a record, not a lane. This is the
next question asked of the same tree, and the answer inverts the conclusion:
the store is not merely unread, it is **empty**, and the relational signal the
lane wants was in the corpus the whole time without it.

Measured against the live corpus, read-only, at `dd95173`.

## The stored graph is empty, and the ranking it was meant to inform is constant

Two counts over the running database, `companion_node` and `companion_edge`:

| | rows |
| --- | --- |
| `companion_node` | 1,630 |
| `companion_edge` | **0** |

So the previous finding understates it. `idx_companion_edge_target`, the
reverse index built for inbound traversal, indexes nothing; `graph.rs` is
still the eight-line stub that declares the six-relation vocabulary and
promises traversal in "Phase 2". No lane reads the edges because there are no
edges to read.

Meanwhile the tier that was supposed to carry query-independent relevance —
`retrieval.rs`'s "top facts / procedurals by importance" — ranks on
`companion_node.importance`, declared `INTEGER NOT NULL DEFAULT 3`. Over the
510 nodes in that tier:

- **5 distinct values** (0, 1, 2, 3, 4)
- **478 of 510 — 93.7% — hold the default `3`**

That is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
in a schema default. "Nobody scored this node" and "somebody scored this node
as middling" are stored identically, so `ORDER BY importance DESC LIMIT n` over
this tier is returning an arbitrary n from a 478-row tie, ordered by whatever
the index scan produced. Nothing above it can tell, and no metric reports it.
The predicate matters here per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): this
is 510 nodes of kind `fact`, `procedural` or `doctrine`, the exact population
the always-include tier draws from — not the whole 1,630-node corpus.

## Arm A vs Arm B, same corpus, same tier

The technique's claim is that a graph derived from content beats a curated
field that has gone constant, and that the derivation needs no stored edges.
Both arms were run over the live corpus by a read-only script; no product code
was changed, which is why this is recorded as `experiment` rather than `code`.

- **Arm A — rank by `importance`.** The tier as the tree ranks it today.
- **Arm B — rank by derived structural centrality.** Two passes over node
  content: a node *defines* the identifiers in its heading and path anchor, and
  *references* the identifiers in its body (backticked code spans, which this
  corpus is dense with — it is documentation about a codebase). Edges run
  referencer → definer, weighted by the technique's four discrimination rules,
  then personalized PageRank to convergence and rank redistributed across
  out-edges.

| | Arm A (`importance`) | Arm B (derived centrality) |
| --- | --- | --- |
| edges available | 0 stored | **3,523 derived** |
| distinct rank levels over the 510-node tier | 5 | 44 |
| largest tie block | 478 (93.7%) | — |
| top-10 overlap with the other arm | \- | **0 / 10** |

The two orders do not merely differ, they are disjoint at the top. Arm A's
own highest-ranked item — one of only two nodes anyone ever raised to
`importance = 4` — sits at centrality rank **470 of 510**. Arm B's top item is
a `fact` node at the default importance, which Arm A therefore cannot
distinguish from 477 others.

The derived edge alphabet is 346 identifiers (the intersection of 1,927
defined and 2,627 referenced names). That intersection is the number the
technique says to measure before building: a corpus of independent records
would score near zero here and the lane would not be worth its seat. This one
scores 346, which is why the lane applies.

## What the tree proves that nobody designed it to prove

The strongest evidence here is structural rather than measured. This tree was
built by a team that implemented the lane roster faithfully — the sibling
application documents that in detail. They also specified a relation
vocabulary, wrote the schema, built the *reverse* index for inbound traversal,
and named the markdown `links:` frontmatter as the source of truth. Every
piece of the intent is present. Then the population step was left for a later
phase, and the table has stood at zero rows through a 1,630-node corpus.

That is the technique's central claim arriving as an accident: **the curated
path did not decay, it never started**, and the same corpus that failed to
produce a single curated edge yields 3,523 derived ones from content it had
already stored. The cost asymmetry is the whole argument for deriving. Nobody
was ever going to hand-author `links:` for 1,630 nodes, and the `importance`
column shows what happens when a system asks them to — 93.7% default.

## What this does not show

- **Retrieval quality was not measured**, only ranking discrimination and
  disagreement. Whether Arm B's order produces better answers needs a labeled
  query set, which this tree does not have for the companion path; that is
  [retrieval-evaluation](../techniques/retrieval-evaluation.md)'s bar and it
  is unmet here. The verdict `better` is claimed on the narrow ground the
  experiment can support: a signal with 44 levels and no maintenance burden
  strictly dominates one with 5 levels of which one holds 93.7% of the rows.
- **The def/ref extraction is corpus-shaped.** It works here because the
  documentation quotes code identifiers in backticks. A prose corpus with no
  such convention needs a different definition pass, and the edge-alphabet
  count is the check that tells you before you build.
- **Personalization was exercised only at the uniform restart** for the table
  above, so what is measured is global centrality. Per-query personalization
  is the lane's other half and remains unmeasured on this tree.
