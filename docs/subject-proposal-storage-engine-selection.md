# Subject proposal — `storage-engine-selection`

**Status:** proposed, dispatch-ready. This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `backend-platform` → subcategory `data-layer`
**Resolved path:** `knowledge/software-engineering/backend-platform/data-layer/storage-engine-selection/`
**Raised by:** `/intake`, 2026-08-27, from
[`librarian/sources/2026-08-27-duckdb-changing-physics-of-analytics.md`](../librarian/sources/2026-08-27-duckdb-changing-physics-of-analytics.md)
**Extended:** `/intake`, 2026-08-27, from
[`librarian/sources/2026-08-27-latticedb.md`](../librarian/sources/2026-08-27-latticedb.md)
— techniques 7 and 8, and a second reconciliation tree. The second source is an
independent vendor with the opposite storage layout to the first, which is why
technique 8 could be written as a boundary rather than as either one's pitch.
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Placement, verified against the authority

`taxonomy.json` is the authority, not a directory count.
`backend-platform.data-layer` currently holds **four** subjects — `data-access`,
`embedded-db`, `migrations`, `sync-replication` — against a cap of ten, and it
already holds subjects directly rather than sub-subcategories. A fifth flat
subject is legal and requires no restructuring.

Link depths the forger will need, stated so they are not derived wrongly:

- from `storage-engine-selection/storage-engine-selection.md` → `../../../_laws.md`
- from `storage-engine-selection/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject, e.g. `../embedded-db/embedded-db.md`

## The gap, measured

The bundle carries **149 subjects**, and `data-layer`'s four all begin *after*
the engine exists:

| subject | what it presupposes |
| --- | --- |
| `data-access` | a store, and the seam above it |
| `embedded-db` | an embedded engine, already chosen, and transactional |
| `migrations` | a schema, in a store |
| `sync-replication` | two stores that must converge |

Nothing owns the decision that produces them. `sync-replication` is the only
one of the four that states a selection rule at all ("that definition decides
when *not* to build sync"), and it is about replication topology, not about
the engine.

Two further checks, because a near-empty prior-art result is more dangerous
than an empty one:

- `research-map` over `olap`, `columnar storage`, `query engine`, `single node`
  and `workload topology` returned semantically unrelated hits — narrative
  engine selection, canvas graph nodes, asset scale. There is no subject to
  correct here; the neighbourhood is empty.
- The concept-level term `olap` returns **zero** hits corpus-wide. Product
  names returning zero (`postgres`, `sqlite`) is correct and expected — the
  purity floor forbids them in the upper layers. A *concept* returning zero is
  the finding.

## What has already been landed, and must not be re-forged

This run landed one technique in the neighbouring subject. **The forger must
read it and write around it, not over it:**
[`embedded-db/techniques/analytical-reads-off-the-serving-store.md`](../knowledge/software-engineering/backend-platform/data-layer/embedded-db/techniques/analytical-reads-off-the-serving-store.md).

It owns exactly one cell of the problem: an application that *already has* an
embedded transactional store and is deciding whether an analytical read should
leave it. Its argument — form factor and workload shape are independent axes,
and contention is the uncounted cost — is the special case. **This subject owns
the general case**, of which that is one route through the decision.

## Proposed techniques

Eight, with the decision rule each must carry. The first two are the fragments
this run's source produced that were deliberately not banked separately.

### 1. `single-host-baseline-before-distribution`

**Rule:** before adopting a distributed engine, implement and measure the
competent single-host baseline, and state the configuration at which the
distributed option overtakes it.

The literature this comes from is *Scalability! But at what COST?* (McSherry,
Isard & Murray, HotOS XV, 2015), which names the metric: the hardware
configuration required before a scalable system beats a competent single
thread. The finding that makes it a technique rather than a slogan is the
**mechanism** — scalability is frequently bought by introducing overheads the
baseline never pays (partitioning, coordination, fault-tolerance materialisation,
data structures on the critical path, and a programming model that forecloses
better algorithms), so a published speedup curve can measure recovery from
self-inflicted cost rather than genuine capability. A system can therefore have
an *unbounded* COST: it never beats one thread at any scale.

The technique must survive the strip test — write the metric and the mechanism,
not the paper's 2015 core counts, which are a dated fact about dated hardware.

### 2. `constraint-dating`

**Rule:** a topology decision cites the constraint that forced it and the date
the constraint was measured; re-measuring is scheduled, not incidental.

Distributed processing answered a real constraint — a single host could not
read the dataset fast enough. That constraint moves: per-host cores, memory
bandwidth and I/O have grown by a large multiple over the span in which most
teams' architectural instincts formed, while dataset growth is a *distribution*
whose tail is exponential and whose body scales with human-sized quantities
(customers, transactions, employees). A topology inherited from a benchmark
nobody has re-run is an undated fact governing a current decision.

The second half is the more interesting one and the drafter should keep it:
**a remote topology trains expectations that outlive it.** Teams that spent
years dispatching jobs to a cluster learn to expect a wait, to batch work that
did not need batching, and to treat interactive analysis as impossible — and
those expectations persist as design constraints after the physical one is
gone. Name the tell: an architecture whose latency budget nobody has questioned
since the constraint that set it was removed.

### 3. `workload-class-inventory`

**Rule:** enumerate the workload classes the application actually has —
point/range transactional, analytical aggregate, graph traversal, full-text,
vector similarity — and choose per class, not per application.

This is the subject's spine and the thing that makes the rest decidable. The
drafter must supply the discriminating question for each class and the
*negative* rule: which classes do **not** justify a dedicated engine at
ordinary scale. See the reconciliation tree below, which has measured four of
the five and found dedicated engines unjustified in two of them.

### 4. `deferred-storage-commitment`

**Rule:** prefer the engine whose form factor spans prototype, feature and
report, so the storage commitment is made late and on evidence.

The claim the source makes for this — the same engine and the same query
language at every stage means day-one decisions about what the data will become
are avoidable — is real but is also the vendor's pitch, and the drafter must
supply the discriminator it lacks: **when is deferral wrong?** At minimum,
where the commitment is cheap and reversible anyway, and where deferring hides
a schema decision that gets harder rather than easier. A technique that only
recommends deferral is a slogan.

### 5. `open-format-as-the-interop-boundary`

**Rule:** where more than one engine will read the same data, the durable
decision is the *format*, not the engine; commit to a format with an
independent specification and let the engine be replaceable.

Thin from this run's source — flag it as the least-corroborated of the six, and
let the forger demote it to a section of technique 3 if the hardening pass does
not support a standalone document.

### 6. `evaluate-without-adopting`

**Rule:** an engine under evaluation is installed in an isolated manifest with
its own lockfile, outside the product's dependency tree and CI.

This one is not from the source; it is from the reconciliation tree, and it is
the most immediately copyable thing in this proposal. It is what lets a team
benchmark native engines at full fidelity without the evaluation becoming an
adoption by accident — and it is what makes a later "we measured it and did not
land it" checkable from outside, because the product manifest still declares
only what actually runs.

### 7. `a-dataset-is-not-a-workload`

**Rule:** a workload class is claimed by a *reader on the request path*, never
by the presence of the data its engine would serve. Enumerate the readers of
the relation, the vector column, the text column; classify each as request
path, offline job, export, or admin view. A class with no request-path reader
is a record the system keeps, not a workload it has.

This is the negative half technique 3 needs to be decidable, and it is the
test that most cheaply prevents the expensive mistake in this subject. Owning
the data an engine is good at feels like having its workload, and a schema is
the most persuasive possible argument for a decision nobody has actually made.

It rests on two trees, and the second one is what makes it a rule rather than
an observation. The reconciliation tree below *had* the workload — a real
graph, real traversal queries — and measured the dedicated engine losing. The
second tree (`personas`, written up as an application in the `retrieval`
subject, 2026-08-27) has the opposite shape: **two typed relation stores,
neither with a request-path reader.** One of them carries a table, a reverse
index built for inbound traversal, a six-name relation vocabulary and an
eight-line module ending `Phase 0: stub. Phase 2: traverse, add_edge,
contradict_scan` — and no writer and no reader anywhere in the tree. Priced
by data, it is a graph workload; priced by readers, it is a record.

The drafter must also write the inverse error, which is rarer and worse:
concluding a class is absent because nobody named it. Relations hide in
foreign keys and path hierarchies; analytical shapes hide in offline scripts.
The question is whether the *query* exists, not whether someone built the
schema for it.

### 8. `a-multi-modal-engine-consolidates-seams-not-costs`

**Rule:** when one engine claims several workload classes, price the change as
seams removed, not as latency won — and read its benchmark suite for the class
it does **not** measure, because that omission follows from its storage layout
and is not a gap in its marketing.

An engine spanning transactional, relational-traversal, text and similarity
retrieval in one query language is a real reduction in assembled machinery:
without it those are separate indexes with separate syntaxes, combined either
in several round trips or in a query nobody wants to maintain. That is the
genuine claim and it is about *seams*.

What it is not is a performance argument, and the reason is structural. The
classes such an engine consolidates are, at ordinary application scale, mostly
the classes where every candidate was already fast enough — the reconciliation
tree measured exactly that outcome in three of its five classes and recorded a
rule against adding an engine in each. The class that *did* justify a second
engine there was the analytical aggregate, and a row-oriented multi-modal
engine cedes it: a query touching most of the data will lose to a columnar
layout, which is a property of the layout and not a tuning problem. A
benchmark suite covering point lookup, bounded traversal, similarity and text
while omitting the aggregate is therefore honest and complete about what the
engine is, and silent about the only class that moved the decision.

Two further rules the drafter should carry, both cheap:

- **The combining query is the one no per-class benchmark measures.** Every
  published figure isolates a class. If the reason to adopt is that one query
  spans three of them, the number that decides is a number nobody publishes,
  and the evaluation has to produce it locally.
- **Read a comparison table for its per-row measurement provenance.** The
  originating source for this technique states, above its own table, which
  single row was measured head to head on one machine and which rows are
  third-party figures on hardware it does not control — and says to treat the
  rest as "worth investigating on your own data", not as a result. That
  disclosure is the exception; its absence elsewhere is the default, and a
  table without it is a set of numbers from different machines in one grid.
  This belongs here rather than in a measurement-presentation subject because
  it is the *reader's* obligation, and cross-bundle links are forbidden — the
  `recruiting` bundle holds the publisher's side of the same boundary. State
  the discriminator in prose; do not link.

## The reconciliation tree

**This is what makes the dispatch cheap, and the forger must open it.**

The `politicas` project (`docs/db-architecture-guide.md`, 392 lines, commit
`68f10e4`) is a measured decision guide of exactly this subject's shape: five
workload classes, five engine candidates, four dated experiment cases over real
datasets, cross-engine correctness checksums on every case, and fifteen
numbered rules each citing the case that backs it. Its harness is
`scripts/db-bench/`, and its evaluation sandbox is the pattern behind proposed
technique 6.

Two properties make it unusually good evidence, and the forger should preserve
both in whatever lands:

- **It contains negative results.** A native graph engine lost every workload
  it was benchmarked on and the guide records that as a rule against adopting
  one at that scale; a dedicated vector store was measured and found premature.
  A guide that only ever says yes is a shopping list.
- **It separates "measured" from "adopted".** Its own rule R3 recommends a
  hybrid and names the workload; that workload is still running on the
  incumbent engine. The gap is written up in this run's application document,
  and it is the single most transferable finding here — a decision recorded in
  a document and a decision present in the import graph are different states,
  and only the second one runs.

## Boundaries this subject must NOT absorb

- **Operating an embedded engine** — `embedded-db` owns it, including the
  analytical-quadrant boundary this run landed there. This subject decides;
  that subject operates.
- **The seam above the store** — `data-access`. Choosing an engine does not
  license opinions about repository layering.
- **Schema evolution** — `migrations`.
- **Keeping two stores converging** — `sync-replication`. Note the genuine
  adjacency: an exported analytical copy is *not* sync, because the copy is
  derived and never originates, and `sync-replication`'s own opening already
  excludes it ("when one side is a cache, not a peer"). Say so; do not build
  merge machinery for a projection.
- **Telemetry store schema design** — this lives in the `llm-observability`
  bundle and cross-bundle links are forbidden. That bundle holds the same fork
  from the other end and was amended this run to carry the embedded-analytical
  destination. State the discriminator in prose; do not link, and do not
  restate its material.

## Open questions the forger must decide, not discover

1. **Is `workload-class-inventory` the golden path rather than a technique?**
   It may be the spine of the subject document itself, with the per-class rules
   as its sections. Decide before drafting; the answer changes the shape of
   everything else.
2. **Does technique 1 belong here at all, or in an operations subject?** The
   single-host-baseline rule is about capacity and topology, and this bundle
   has an operations category. Argue the placement rather than assuming it.
3. **How much of the measured guide can survive the strip test?** Its rules
   name engines and cite ratios from one machine and one dataset. The upper
   layers carry neither. Decide what the rules become when the product names
   and the numbers are removed — and if the answer for a given rule is
   "nothing", that rule is an *application*, not a technique, and should be
   written as one.
4. **Is a decision-record obligation part of this subject?** The reconciliation
   tree's failure mode is that the decision was made, documented and not
   landed. A rule that a storage decision names its implementing call site
   would catch it — but it may belong to an engineering-process subject
   instead.

## Override the brief and say so

Both workers dispatched from a prior proposal overrode their briefs and both
were right. The placement in this document is verified against `taxonomy.json`
and the boundaries are argued, but the technique list is a proposal from one
source plus one tree. If the neighbouring subjects' stated scopes exclude a
piece of this, or if the hardening pass contradicts a proposed rule, **change
it and explain the reasoning in the report** — a brief that reads as
non-negotiable only buys compliance with its own mistakes.

## Provenance and its limits

The originating source is a first-party practitioner account by an engineering
leader at a vendor that had, in the same post, announced acquiring the team
behind the engine it argues for. That is not disqualifying — the post's
systems-design argument is independently sound and largely predates the
commercial relationship — but it is exactly the provenance that should not be
allowed to author a standard alone, and it has not been: technique 1 rests on
peer-reviewed literature and the author's own independent write-up, and
techniques 3 and 6 rest on the measured tree. **Technique 5 rests on the
post alone and is marked accordingly.**
