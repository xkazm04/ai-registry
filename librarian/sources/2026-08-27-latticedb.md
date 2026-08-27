---
source: web
url: https://latticedb.org/
title: "LatticeDB — embedded property-graph database, and its documentation"
author: single-vendor open-source project (jeffhajewski)
kind: vendor documentation set (marketing surface + four comparison guides), wrapped in an operator dispatch
mined_on: 2026-08-27
words: 1069 (landing) + 721 (vs Kùzu) + 803 (vs SQLite)
skill_version: 0.14.0
extracted: 12
picked: 5
accepted: 5
already_covered: 2
declined: 0
leads: 4
untriaged: 0
dispatched: 0
fetches_spent: 2
---

# LatticeDB, 2026-08-27 — the engine that is strong in every class we measured as "no engine needed"

Run 34. The operator handed over a vendor site and its docs with an evaluative
question attached: *worth considering for some of our projects, or for a
future use case, over other alternatives.* That is an operator dispatch with
three sub-questions riding a vendor source, and per the class file the three
route separately. They did, and the third one carried the run.

## Class: vendor documentation set + operator dispatch

The vendor row predicted the shape exactly. The benchmark claims were the
least useful thing present; **every accepted finding came from the docs'
honest-boundary pages** — "What Kùzu had that LatticeDB does not" and "When
SQLite is the right answer" — and none from the speed table.

Expected yield stated before triage: **moderate**, on the reasoning that the
source authorizes nothing on its own but had located a shape the corpus was
already short of. That held. Corroboration was almost entirely local: one
connected tree had **measured** this engine class on real data, and a second
turned out to be the exact application shape the engine is pitched at.

**A new observation for the ledger, and the run's method finding.** This
source is the anti-vendor-repository: its comparison pages state, *above* the
table rather than in a footnote, which single row was measured head to head on
one machine and which are third-party numbers on hardware it does not control,
then instruct the reader to treat the rest as "worth investigating on your own
data, not as a benchmark result." It devotes a section to what the archived
competitor did better and calls being honest about it more important than the
section above. **A vendor that discloses its measurement provenance per row is
not thereby more adoptable — but it is a much better source**, because the
disclosures are the reusable part. The rule extracted from it (technique 8's
second half) is a rule about reading everyone else's tables.

## The hole, and why it was already half-open

`/intake` run 32 (DuckDB, the same day) had established that `data-layer`'s
four subjects all begin *after* the engine exists, and left
[`docs/subject-proposal-storage-engine-selection.md`](../../docs/subject-proposal-storage-engine-selection.md)
dispatch-ready but unforged. `research-map` over eleven storage terms
reconfirmed it: the only hits were semantically unrelated
(narrative-engine-selection, canvas-graph, motion's `engine-selection`). The
neighbourhood is still empty, so two of this run's findings **folded into that
spec rather than minting a competing subject** — the skill's rule for a
subject-sized gap, and the honest call given that `embedded-db` explicitly
owns one cell of the problem and this is the general case.

The other three landed in `retrieval`, which is forged, live, and was wrong.

## Accepted

### A1 — Relationship proximity is a lane → `retrieval` (new technique)

[`relationship-proximity-lane`](../../knowledge/software-engineering/llm-agent/prompt-and-context/retrieval/techniques/relationship-proximity-lane.md).

The golden path's "No single lane suffices" section enumerates its roster:
lexical, semantic, recency, always-include. **An enumeration is a claim.** All
four are similarity-or-policy matchers over the query, and none of them can
surface the item that *disagrees* with the top hit — the disputing claim is
not lexically or semantically near the claim it disputes, and is frequently
its opposite. A corpus with typed relations can ask a fifth question: *what is
attached to what looks like this?*

The technique's substance is that this lane is **not a peer**, and the three
consequences: it is a function of results rather than of the query, so its
budget is a fan-out cap and not a slice share; reach and path-enumeration are
different questions with different costs; and a dry lane must not look like a
broken one. Plus the per-relation policy — `contradicts` expands disagreement,
`replaces` expands time and often displaces its own seed, `supports` expands
agreement and is the least interesting — and the boundary-crossing rule, since
an edge is a pointer written under one scope and followed under another.

Its opening move is the one that matters for this registry's own question:
**owning edges is not the trigger; enumerate the readers of the relation.**

### A2 — `hybrid-lane-fusion` corrected (amendment)

The technique held that multi-lane convergence is itself evidence and that
rank fusion rewards it automatically. **That has an unstated precondition —
the lanes must be independent — and it is false the moment one lane is seeded
by another.** A neighbour surfaced *because* its seed ranked is not
corroboration; summing both contributions counts one signal twice, hardest
exactly where the seeding lane was most confident. The symptom is not an error
but a slice that has quietly become a depth-first tour of one region while the
query's other senses vanish, and diversity cuts pass it because the items
genuinely differ.

The roster's admission question gains a second half: a lane names the failure
it covers, **and** the lanes it is not independent of.

**This is the run's best finding and the vendor produced it by getting it
wrong.** The site's flagship query is
`WHERE embedding <=> $q < 0.3 AND content @@ "neural networks" … ORDER BY embedding <=> $q`
— text relevance is computed by a BM25 index and then discarded into a boolean
filter, with vector distance alone deciding the order. That is not fusion; it
is one lane ranking while the others act as gates, demonstrated in the
headline example of an engine whose entire pitch is answering the lanes
together. Four runs have now said a source that implements a good idea badly
is worth more than one that implements it well; this is the cleanest instance
yet.

### A3 — Two memory graphs with no request-path reader → application

[`rust--relationship-proximity-lane`](../../knowledge/software-engineering/llm-agent/prompt-and-context/retrieval/applications/rust--relationship-proximity-lane.md).

The negative application, and the structural fact nobody designed. `personas`
implements this subject's roster **faithfully and completely** — four lanes,
the shared-budget rule learned as a scar, RRF with the floor applied before
fusion and a test asserting the order. And it holds two typed relation stores,
neither with a reader on the request path:

- **`companion_edge`** — three-column primary key, plus a **reverse** index on
  `(target_id, rel)`, which is the shape built to walk *inbound* edges. A
  six-name relation vocabulary (`supports | contradicts | replaces |
  derives_from | about | blocks`). And an eight-line module declaring the
  markdown `links:` frontmatter the source of truth and the table "a
  reindex-able cache for fast traversal", ending `Phase 0: stub. Phase 2:
  traverse, add_edge, contradict_scan`. It exports no functions. **No writer,
  no reader.** The design is complete down to the verbs and the phase that
  would have built them did not arrive.
- **`memory_edges`** — genuinely written by the ledger and genuinely read: by
  the portability exporter, the importer, and the markdown render that joins
  edges to nodes to emit vault wikilinks. Every reader is an exporter, an
  importer, or a rendered link view. `memory_recall.rs` never mentions edges,
  and the tree contains no recursive traversal at all.

The pair is the finding, because they fail the same test from opposite sides:
one shows the lane was *designed and had nowhere to land*, the other shows
relations maintained continuously while the machine path that would benefit
never asks. And the project named `contradicts` — the single relation the
roster provably cannot reach by similarity — before anything could consume it.
**That is an argument for the lane, written into a schema by someone who was
not making the argument.**

Because the implementation is faithful, the gap is not an implementation
defect. It is an omission in the standard that the implementation inherited,
which is the only reason this application is evidence rather than a bug
report.

### A4 and A5 — Two techniques folded into the storage-engine spec

Not banked as leads, per the rule for a subject-sized gap arriving in
fragments. The spec now proposes **eight** techniques and records a second
reconciliation tree.

- **7. `a-dataset-is-not-a-workload`** — a workload class is claimed by a
  *reader on the request path*, never by the presence of the data its engine
  would serve. It rests on two trees, and the second is what makes it a rule:
  `politicas` *had* the workload and measured the dedicated engine losing;
  `personas` has the data and no workload at all. Priced by data it is a graph
  workload; priced by readers it is a record. The drafter must also write the
  inverse error, which is worse: concluding a class is absent because nobody
  named it.
- **8. `a-multi-modal-engine-consolidates-seams-not-costs`** — price such an
  engine in seams removed, not latency won, and **read its benchmark suite for
  the class it does not measure.** LatticeDB benchmarks point lookup, bounded
  traversal, similarity and text, and concedes the analytical aggregate as a
  structural property of row orientation. Those first four are precisely the
  classes `politicas` measured as *not* justifying a new engine (R6, R10/R11,
  R12/R13); the conceded fifth is the only one that did (R1, R3, R14, at 43×).
  The engine is strong exactly where the measured answer was "add nothing" and
  structurally weak exactly where it was "add something." Carries the
  per-row-provenance rule as its second half, and the discriminator against
  `recruiting`'s publisher-side subject stated in prose, not linked.

## Cross-repo lane — executed in both, on the operator's instruction

Both commits are pathspec-scoped, on each project's default branch, **not
pushed**.

- **`politicas`** (`929863c`) — a new **Engine watch** section in
  `docs/db-architecture-guide.md`: engines assessed on documentation and
  declined, with the reasoning that made benching unnecessary. Adds R17 (price
  a multi-modal engine in seams; read a comparison table row by row for who
  measured it) and R18 (a dataset is not a workload). **Both marked as method
  rules, not case-backed** — and the guide's own opening contract, "every rule
  here is backed by an experiment", was amended to name that exception rather
  than be quietly broken by it. Records for R15 that Kùzu was archived
  Oct 2025 and the live fork LadybugDB is *columnar*, so R14 would need
  re-testing rather than assuming, if R15 ever fires.
- **`personas`** (`d66dfb477`) — `docs/architecture/memory-graph-and-storage-engine-assessment.md`,
  the decision record: the roster as it runs, the two relation stores and their
  readers, the do-not-adopt verdict with its reason (we have the data, not the
  workload), and a four-step action plan whose first step is to decide
  `companion_edge`'s status explicitly rather than leave an unwritten table
  standing. The plan carries the fusion correction from A2 as a design
  constraint on step 2, because that is the step where it would actually bite.

**Scope was cut deliberately on the `personas` side and the operator should
know why.** That tree has heavy uncommitted work from a parallel session,
including its whole `db` crate mid-refactor with deleted migration modules. A
code change into that is reckless regardless of how small it is, so the
execution there is the decision record only — no Rust touched. `politicas` was
clean and its own `doc-sync` gate passed on the commit.

## Already covered (catches)

- **Single-writer, single-process enforced by a file lock; a second writer
  refused rather than left to corrupt.** `embedded-db/single-writer-holder-discipline`
  says it, and says it better — with the contention cost the vendor page does
  not mention.
- **Durable streams and changefeeds inside the store.** `sync-replication` and
  run 33's picomq findings hold this ground; the vendor's version adds nothing
  the corpus lacks.

## Leads (banked, with return conditions)

- **Database-as-bytes: a tenant is a file, not a row predicate.** `serialize`
  hands back a whole database; a database per case or tenant lives in object
  storage; `:memory:` never touches disk. Genuinely interesting and genuinely
  homeless — nearest prior art is `data-retention/per-tenant-retention-policy`,
  which is about policy, not placement. **Return when** a second independent
  source reaches the same rule, or a connected project has a per-tenant
  isolation problem that a row predicate is failing to solve.
- **Restore replays through the same recovery path as a crash.** One code
  path, exercised twice, so the rarely-run path is the always-run path. Plausible
  as a technique in `embedded-db/journal-and-durability-modes`, uncorroborated
  by anything but this vendor. **Return when** a primary source or a connected
  tree shows the shared-path design and what it caught.
- **A query engine returning silently wrong rows.** Release 0.14.0 fixed
  `ORDER BY` over `count()` sorting before aggregation — wrong rows, no error,
  and `LIMIT` therefore taking a false top N. It corroborates `politicas`'s
  standing cross-engine checksum practice from the failure side, but the
  registry has no subject that owns engine substitution yet. **Return when**
  `storage-engine-selection` is forged; it belongs in its validation technique.
- **Kùzu acquired by Apple and archived October 2025; LadybugDB is the live
  fork.** A dated fact with no corpus clock to reset — the upper layers name no
  products, correctly. **Return when** a connected project declares either
  engine in a product manifest.

## Not done, and deliberately

- **No law proposed.** The mandatory cross-run convergence check was run. A1
  and A2 share a root with run 32's findings only at the level of "the corpus
  models stages after a decision but not the decision" — real, but it is the
  storage spec's open question 1, not a law. Flagged; not asserted.
- **No index/catalog regeneration.** A parallel session is mid-run in this
  checkout with half-landed bidirectional links in `eval-harness` and
  `prompt-assembly`; `build-index` and `build-catalog` regenerate globally and
  would bake its unfinished work into this run's commit. Owed once that session
  lands. My own subject's links were verified clean by the gate.
- **No `personas` code.** See above.
- **Nothing pushed.**

## Class observations, for the ledger

**Vendor documentation set.** The row held with one amendment worth carrying:
the class file says to expect the benchmark claims to be the least useful
thing present and to check the client's types before concluding an engine is
unreadable. Here the engine is open-source, so the types were never the issue —
but the *comparison guides* played the role the class file assigns to the
"things we learned running this" page. **For a vendor whose product competes in
a crowded class, the densest first-party document is the one arguing against
its own product**, and it can be found by name: it is the page titled after the
competitor. Read those before the landing page.

**The operator dispatch's three sub-questions routed to three different
places** and only the third paid, which is the second consecutive run to
confirm the split-at-Phase-3 rule. *Worth considering for our projects* was
answered by two trees, *for a future use case* by a return condition, and
*over other alternatives* carried both spec techniques. Collapsing them into
"mine this source" would have lost the lane that paid.

**Fetch economy: 2 of 3.** Both spent on comparison guides, and both were
extraction rather than corroboration — exactly what the class file predicts for
a source that is a lossy pointer to its own primary. The corroboration itself
cost zero fetches and came from two connected trees, which is now the seventh
consecutive run corroborating locally.
