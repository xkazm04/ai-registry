---
layer: application
type: application
subject: retrieval
technique: relationship-proximity-lane
stack: rust
verified_on: 2026-08-27
verified_against: rust@1.80.0
---

# Two memory graphs with no request-path reader (Rust, Tauri + SQLite)

A negative application, and the more useful kind. The tree implements this
subject's lane roster faithfully and completely — and it holds two typed
relation stores that no lane reads. Nothing here is a defect the repository
introduced: it implemented the standard it consumes, and the standard had no
seat for the fifth lane until this technique was written. The gap fell out of
the structure rather than out of anyone's decision, which is what makes it
worth recording.

## The roster is complete, and it is the roster this subject specifies

`src-tauri/src/companion/brain/retrieval.rs` opens by enumerating its lanes,
and the enumeration matches this subject's roster item for item:

1. **Keyword (BM25)** over a `companion_fts` virtual table — ungated, so it
   runs in every build, including the non-ml one that ships.
2. **Vector (vec0 KNN)** — feature-gated behind `ml`, layered on the keyword
   lane rather than replacing it.
3. **Always-include tiers** — top facts and procedurals by importance, active
   goals, open backlog; query-independent on purpose.
4. A **recency tail**, sized from what the other lanes actually returned.

Its module doc also states the budget rule this subject teaches, and states it
as a scar: the episode window is a shared budget, not a per-lane quota,
because an earlier version hard-coded a five-turn recency tail on the
assumption the vector lane would supply about twelve more — and with zero
embedded episodes it supplied zero, so the richer build delivered *fewer*
memories than the leaner one. Sizing the tail from the other lanes' real
output makes that asymmetry structurally impossible instead of a tuning
coincidence. That is [ranking-budgets](../techniques/ranking-budgets.md) and
the strict-addition rule from the golden path, both learned the hard way.

The knowledge-base path is the second realization, with reciprocal-rank
fusion over vector and BM25 in
`src-tauri/src/commands/credentials/vector_kb.rs` (`rrf_rerank`, `RRF_K = 60`),
and a distance floor applied to the vector pool **before** fusion so a lexical
hit cannot resurrect an item the floor rejected — the ordering is asserted by
a named test.

So this is not a thin implementation. It is a careful one, which is precisely
what makes the next section evidence rather than an oversight.

## Run the technique's reader enumeration, and it answers "record" twice

The tree stores typed relations in two places, for two different memory
systems. Enumerating the readers of each — the test this technique proposes
before a relation store is priced — returns no request-path consumer in
either case.

**`companion_edge`** — the companion brain's relation store. The schema in
`src-tauri/db/src/lib.rs` is not a sketch: a three-column primary key over
`(source_id, target_id, rel)`, plus `idx_companion_edge_target` on
`(target_id, rel)`, which is a **reverse** index — the shape you build to
traverse *inbound* edges, and one nothing in the tree currently needs. The
relation vocabulary is specified in `src-tauri/src/companion/brain/graph.rs`:
`supports | contradicts | replaces | derives_from | about | blocks`. That
module is eight lines long, declares the markdown frontmatter `links:` field
the source of truth and the SQL table "a reindex-able cache for fast
traversal", and ends:

> `Phase 0: stub. Phase 2: traverse, add_edge, contradict_scan.`

It exports no functions. The table has no writer and no reader anywhere in the
tree beyond an entry in the data-portability table list. The design is
complete down to the verbs — `traverse`, `contradict_scan` — and the phase
that would have built them did not arrive.

**`memory_edges`** — the developer-memory ledger's relation store, and the
live one. It is genuinely written, by `memory_ledger.rs`, and genuinely read:
by the portability exporter and importer, and by the ledger's own markdown
render, which joins edges to nodes to emit wikilinks into a vault. Classify
those readers by the technique's rule and every one of them is an exporter,
an importer, or a rendered link view. `memory_recall.rs` — the module that
actually assembles recall — does not mention edges, and the tree contains no
recursive traversal at all.

Both stores are therefore *records*: things the system keeps, exports and
renders. Neither is an index the request path consults.

## What the shape proves that no benchmark would have

The two stores fail the same test for opposite reasons, and the pair is the
finding.

`companion_edge` shows that **the lane was designed and then had nowhere to
land**. Somebody specified typed relations, chose six relation names including
`contradicts`, built the reverse index for traversal, and named the three
functions — then stopped. There is no seat in the roster for what those
functions would have produced, so the work had no destination and the schema
outlived its motivation.

`memory_edges` shows the same absence from the other side: relations that are
maintained continuously, survive export and re-import, and are rendered for a
human to click — while the machine path that would benefit never asks.

The relation `contradicts` is the sharpest part. This subject's roster is two
similarity matchers, a clock, and a pin; **none of them can surface an item
that disagrees with the top hit**, and similarity is the wrong instrument for
finding an objection. The repository named that relation years before anything
could consume it. That is an argument for the lane written into a schema by
someone who was not making the argument.

## What this realization cannot do, and what it should not be read as

- **It does not measure the lane.** No traversal runs, so there is no evidence
  here that expansion would improve recall — only that the corpus can support
  it and the roster gave it no seat. Any adoption starts with the cheap test:
  seed from the existing lanes, expand one hop over `contradicts` and
  `replaces` only, and evaluate against a labeled query set per
  [retrieval-evaluation](../techniques/retrieval-evaluation.md). If it does not
  move a metric, the correct outcome is to keep the relations as a record and
  write that down.
- **It does not justify a relation store.** The relations here live in the
  same embedded file as everything else, which is where this scale belongs.
  The lane's cost is a policy and a fan-out cap, not an engine.
- **The two systems are not interchangeable.** The companion brain and the
  developer-memory ledger have different owners, different scopes and
  different lifecycles; a lane built for one does not transfer to the other
  without re-deriving the scope predicate the technique insists on
  re-imposing after traversal.
- **The stub is not dead code to delete.** Per
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair), an
  eight-line module recording a design decision and the vocabulary it chose is
  cheaper to keep than to reconstruct, and this document is the argument for
  why it was right to write it down.
