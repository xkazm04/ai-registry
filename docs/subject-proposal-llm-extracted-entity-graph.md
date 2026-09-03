# Subject proposal — `llm-extracted-entity-graph`

**Status:** **EXECUTED** 2026-09-02/03 by run `intake-lightrag-0902`, in the same session that raised it (intake 2.2.0; front half by an Opus worker that survived a network outage with its anchors marked, subject forged by an Opus worker that re-derived every line number, both reviewed by the director). Four techniques plus one application. Overrides recorded by the drafter: `gleaning-with-a-declared-cap` renamed `recall-passes-with-a-declared-cap` (one implementation's coinage replaced by the concern's name); `dual-store-consistency-without-a-transaction` renamed `recoverable-fan-out-write` (the technique is the two mechanisms replacing the absent transaction, and the tree flushes twelve stores at one barrier, not two). Technique 4 survives contact with chunking-and-indexing's drift rule because a node's description is a function of every passage that ever mentioned it, so repair is a replay ledger and the manifest must precede the write. D1 decided out (it landed in retrieval as `query-decomposition-before-the-lanes`). Provenance decision: required in one axis only (from what), review state permitted and named as the tell that the civic subject applies. Two fetches returned abstract-only metadata; no figures cited. Six deviations recorded, two carried into the source-tree task.
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory **`prompt-and-context`** (see placement note)
**Resolved path:** `knowledge/software-engineering/llm-agent/prompt-and-context/llm-extracted-entity-graph/`
**Raised by:** `/intake`, 2026-09-02, from [`librarian/sources/2026-09-02-lightrag.md`](../librarian/sources/2026-09-02-lightrag.md) (design record entries **C1, C2,
C3**, with **D1** decided into or out of it by the drafter) over `HKUDS/LightRAG` @
`c1248646e4eda4d89054926af2e094730daf23fe`.
**Engine:** `domain-knowledge-forge` — read `docs/forge-brief.md` first; it is the contract.

## Placement, verified against the authority

`knowledge/software-engineering/taxonomy.json` is the authority; **`categories` is a
list**, and the counts below were read from the file this run by walking
`categories[] → subcategories[] → subjects[]` `[V]`, not from the directory tree:

- **`llm-agent.prompt-and-context` holds seven** — `prompt-assembly`, `prompt-safety`,
  `retrieval`, `agent-memory`, `structured-output`, `agent-instruction-files`,
  `context-hierarchy` (the last landed earlier today). **Cap is ten. Three slots free.**
- **`llm-agent.runtime-and-io` holds ten — FULL.** Named because the brief flags it; it
  is not a candidate here, and nothing in this subject is runtime-shaped.
- `llm-agent.orchestration` holds nine (one slot free — `tenant-scoped-agent-runtime`
  took the ninth today). `llm-agent.evaluation-and-cost` five. `llm-agent.companion`
  three.
- `backend-platform.data-layer` four; `backend-platform.work-execution` seven;
  `backend-platform.resilience` nine (`multi-provider-gateway-plane` took the ninth
  today); `backend-platform.platform-observability` four.
- `civic-intelligence.civic-graph-infrastructure` holds two `[V]` — and is the **wrong
  bundle**: this subject is domain-general, and the civic bundle's own golden path draws
  the discriminator against it (below).

**Placement decision: `llm-agent/prompt-and-context`.** The subject's nearest neighbour by
force is `retrieval`, which **consumes exactly what this subject produces**:
`relationship-proximity-lane`'s `use_when` opens with *"the corpus stores typed relations
between items"* `[V]` — and nothing in the corpus owns how those typed relations came to
exist when the only input was prose. `context-hierarchy` landed in this subcategory today
on the same logic (a shape over items `agent-memory` governs). Three slots are free, so
the placement costs nothing scarce. **Append the slug through
`scripts/apply-taxonomy.mjs`; do not edit the tree by hand.**

Link depths, stated so they are not derived wrongly:

- from `llm-extracted-entity-graph/llm-extracted-entity-graph.md` → `../../../_laws.md`
- from `llm-extracted-entity-graph/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling in the same subcategory: `../retrieval/retrieval.md`,
  `../retrieval/techniques/relationship-proximity-lane.md`,
  `../retrieval/techniques/structural-centrality-lane.md`,
  `../retrieval/techniques/chunking-and-indexing.md`,
  `../agent-memory/agent-memory.md`,
  `../agent-memory/techniques/consolidation.md`,
  `../agent-memory/techniques/rollup-compaction.md`,
  `../structured-output/techniques/extraction-strategies.md`,
  `../context-hierarchy/context-hierarchy.md`
- to another subcategory in the same category: `../../evaluation-and-cost/eval-harness/eval-harness.md`
- to another category's subject: `../../../backend-platform/data-layer/data-access/data-access.md`
- to another bundle:
  `../../../../civic-intelligence/civic-graph-infrastructure/civic-knowledge-graphs/civic-knowledge-graphs.md`

## The gap, measured

Concept probes only — never product names, which return zero by construction against the
purity gate — followed by **opening every golden path the map returned** `[V]`:

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| entity and relation extraction into a knowledge graph | `civic-intelligence/.../civic-knowledge-graphs` (29 pts) | a **registry-joined** civic graph. Its § "Things, not strings" *rejects* text-derived identity outright, and lists the mention graph as failure mode #1. Opposite forces, and the discriminator is drawn |
| merging duplicate entities across documents | `recruiting/.../candidate-identity-and-staleness` (18), `grant-funding/.../grant-source-landscape` (13) | `content-addressed-document-identity` and `stable-dedup-key-selection` — dedup where a **stable key exists**. The whole problem here is that it does not |
| graph traversal retrieval | `llm-agent/prompt-and-context/retrieval` (24) | lanes, fusion, floors, budgets, and two structural lanes over a graph **that is already there**. `relationship-proximity-lane` says so in its `use_when` |
| multi pass llm extraction with re-prompting until complete | `structured-output` (10) | parsing **one reply**: rungs, truncation rescue, schema repair. A grep of all eight techniques for gleaning vocabulary returned only truncation and repair remedies |
| summarising accumulated descriptions when they exceed a budget | no subject above 10 pts on the concept | `agent-memory/consolidation` is the real neighbour and is about **beliefs**, not a node's evidence set |

`civic-knowledge-graphs` must be **cited as a boundary, never absorbed**. It owns the
graph whose identity comes from registries and whose every claim is a reviewable ledger
entry, and it is *correct* — where a registry exists, this subject's decision is the
libel engine that subject names. This subject owns what is left when **no identity
authority exists for the corpus**, which is the ordinary case for a document collection,
and its first obligation is to import the civic bundle's claim discipline (method,
source, review state) rather than to restate it.

`retrieval` is the other boundary and the more delicate one, because the two subjects
touch at a single seam: **this subject ends where the graph is written; `retrieval` begins
where a query arrives.** `structural-centrality-lane` already states a related decision
from the far side — *why its graph is derived from content rather than stored as edges*
`[V]` — and the drafter should read that sentence before writing the boundary section,
because it is the corpus's existing opinion about when a stored graph is worth building
at all.

## The subject, in one paragraph

**LLM-extracted entity graph** is the discipline of building and maintaining a typed
entity/relation graph out of unstructured text when **no external authority supplies
identity**. Its unit is one chunk's extraction merged into a graph that many chunks
before it have already written, and its four recurring problems are: choosing an identity
key when the only candidate is a string the model produced, and being honest about the
homonym risk that choice imports; defining a merge operator that is order-independent and
bounded, so re-ingesting a corpus in a different order converges and no entity's
description grows without limit; getting adequate **recall** out of a model that returns
well-formed, incomplete extractions; and keeping a graph store and a vector index
describing the same facts consistent when no transaction spans them.

## Boundaries it must NOT absorb

- `retrieval` owns everything from the query onward — lanes, fusion, floors, budgets, and
  both structural lanes. This subject writes the graph those lanes read, and must not
  restate one word of the query plane. **D1 (query decomposition) lands in `retrieval`,
  not here** — unless the drafter argues otherwise, which is an open question below.
- `civic-knowledge-graphs` owns the registry-joined graph, the claim ledger, the
  deterministic/proposed split, and the review state. Cite the discriminator (*does an
  identity authority exist for this corpus?*) and import the ledger discipline.
- `agent-memory` owns what is stored, what is believed, what decays — including
  `consolidation` and `rollup-compaction`. This subject owns the merge of a **node's**
  accumulated descriptions, and must state why that unit differs.
- `structured-output` owns parsing one reply — rungs, repair, refusals. This subject owns
  only what changes when the reply is *valid and incomplete*.
- `context-hierarchy` owns tiers over a **containment tree**. This graph is not a tree and
  has no leaves; the subject must not inherit its compilation doctrine by analogy.
- `chunking-and-indexing` (in `retrieval`) owns chunk identity and idempotent re-ingest.
  The graph's consistency-with-the-vector-index problem must **compose over** it.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. `surface-form-identity-and-its-risk` — from C1. The normalised name as the node key;
   what normalisation may and may not collapse; the homonym exposure the choice imports
   and how it is disclosed rather than hidden; when to refuse the graph entirely and fall
   back to a flat index.
2. `accumulate-then-threshold-merge` — from C2. Merge as accumulation; why it must be
   associative and order-independent; the threshold that triggers re-expression and why it
   is denominated in the retrieval budget rather than in mention count; what a summarised
   description loses and how that loss is recorded.
3. `gleaning-with-a-declared-cap` — from C3. Recall as the failure mode a well-formed
   extraction hides; the re-prompt loop; why the cap is an operator-priceable knob; the
   fabrication risk that unbounded re-prompting invites.
4. `dual-store-consistency-without-a-transaction` — from the C-system's fourth decision
   (recorded in §8 as untriaged). One fact in a graph store and a vector store, no
   transaction between them; what a partial write leaves behind and how a later pass
   detects it. **The drafter should check first whether this composes over
   `chunking-and-indexing`'s drift-and-rebuild rule rather than earning its own slug.**

## Open questions the drafter decides rather than discovers

- **Is D1 (two-tier query decomposition) this subject's or `retrieval`'s?** The front half
  routed it to `retrieval` as a missing stage. The counter-argument is that the
  decomposition's *tiers are named after this subject's stores* (entities vs relations),
  which makes it a graph-shaped decision wearing a retrieval hat. Decide before drafting
  and cite either way.
- Does technique 4 survive contact with `chunking-and-indexing`? If it reduces to "the
  drift rule, applied to a second index", it is a paragraph there, not a technique here.
- How much of the civic claim discipline is portable? The drafter should decide whether
  this subject *requires* per-claim provenance (making it a weaker sibling of the civic
  subject) or merely *permits* it — and say so in the golden path's opening, because it
  is the sentence a reader will use to choose between the two subjects.

## Instances a reader can open

- `HKUDS/LightRAG` @ `c1248646e4eda4d89054926af2e094730daf23fe` — every anchor in §3,
  System C. Note the `[H]` marking: the line numbers inside `operate.py` (6,889 L) and
  `prompt.py` (900 L) must be re-derived by the scout.
- Fleet: **`politicas`** builds the same object under the opposite identity regime
  (registry-joined, gated, kg_node/kg_edge in PGlite) and is the natural second sighting —
  it is the peer study in §10, and the pair is the discriminator.

## Why proposed rather than written by the intake run

Three design decisions with no corpus home, one shared home, on one plane of the tree —
that is a subject by construction and the routing count says forge, not amendment. It is
proposed rather than executed because the director owns the dispatch, because the boundary
against `civic-knowledge-graphs` inverts across bundles and must be written as a
discriminator rather than a link, and because the `[H]` anchors in System C need a scout's
pass before any technique quotes them.
