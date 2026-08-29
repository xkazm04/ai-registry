---
layer: technique
type: technique
subject: data-access
technique: batching-and-n-plus-one
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a caller holds many ids and only fetch-one exists, deciding join versus fetch-and-stitch, batch works in tests dies at four thousand ids, a per-field resolver cannot take a list]
---

# Batching and N+1

The N+1 defect is one query for a list of N parents, then one more query per
parent for its details — N+1 round trips to answer one question. It is the
most common data-access performance defect in existence, and the reason is
structural, not carelessness: **the code that loops is correct, readable,
and locally optimal.** Each iteration calls a well-named single-record
operation; nothing at any single call site is wrong. The defect exists only
in aggregate, which is exactly where nobody is looking.

## The surface causes it before the caller commits it

Trace an N+1 backward and you find one of three origins. The commonest in
hand-written layers: a repository surface that offered `fetch one by id`
and nothing else, so a caller with a list of ids did the only thing the
API made possible. The commonest in mapped layers: an association loaded
*lazily* by the mapper's default, so touching a field on each parent
issues the child query without any call site that reads as a query. And
the one no surface designed: a per-item resolver — a graph API field, a
plugin invoked per row — whose shape is decided by the caller's caller and
cannot be changed to take a list. The first two reframe the
responsibility: **a repository that exposes single-record reads for data
that is ever displayed in lists, or a mapper that defaults to on-touch
loading, has designed the N+1 in**; the loop is just where it becomes
visible. The third gets its own countermeasure below.

The countermeasure is to make the set-shaped operation exist *first*:

- **Membership reads**: for any `fetch by id` on the surface, ask whether a
  caller will ever hold many ids — and if so, ship `fetch all by ids`
  returning a keyed map, in the same change. A map, not a list: the caller's
  next move is always association back to the parents, order from the store
  is an accident, and some ids legitimately match nothing — a map makes
  "missing" explicit per key instead of leaving the caller to zip two lists
  of different lengths.
- **Child-of-parent reads**: alongside `children of parent`, ship `children
  of parents`, grouped by parent key on the way out. Grouping in the layer,
  once, beats every caller re-implementing the bucketing loop.
- **Aggregate summaries**: when the callers' loop exists only to compute a
  count or latest-of per parent, the honest operation is the grouped
  aggregate query — one round trip, and the store does what stores are for.

And the set-shaped operation must then be *used*: a layer that ships
`fetch all by ids` beside `fetch by id` and lets a route named "bulk" keep
looping the singular has built the cure and not administered it. The
detection counter below is what turns the batch endpoint from an offer
into a requirement.

## When the caller's shape cannot change: the coalescing loader

Where the access pattern is dictated from above — one resolver per field,
one handler per row — the caller will keep asking for one key at a time,
and the fix moves into the layer as a **request-scoped coalescing loader**:
single-key loads issued during one execution pass are collected, deduplicated,
and dispatched as one keyed batch when the pass has no more ready work; each
caller receives its own key's value from the shared result. The batch
function under it is the set-shaped operation from above, with a contract
the loader depends on — one result *or one error* per requested key, in
key order, so a missing key is an explicit absence and a failing key does
not fail its neighbours.

Two rules make the loader safe rather than merely fast. **It lives for one
request and dies with it.** The loader caches what it loaded, which is what
makes deduplication free; a loader shared across requests serves one
user's rows to the next and turns an optimisation into a data leak. And
**it batches reads only.** A write coalesced with other callers' writes has
lost its transaction boundary; writes go through the unit-of-work
discipline, never through the loader.

## Building the membership list safely

The `IN`-list is where batching meets query construction, and it is the one
place even disciplined codebases interpolate — because the placeholder count
varies with the list length. The rules:

- **Placeholders are generated, values are bound.** The construction
  machinery emits one placeholder per element and binds each value; the
  list's *shape* is dynamic, its *contents* never enter the query text.
  This belongs in one shared helper, not at call sites.
- **Empty is answered, not sent.** An empty membership list is a decision
  point, not a degenerate case to pass through: an empty `IN ()` is a
  syntax error on some engines and a surprise on the rest. Two honest
  spellings exist — return early without touching the store (natural when
  the membership test is the whole query), or emit an always-false
  predicate in its place (natural when the test is one conjunct among
  several and the query must still compose). Either way the decision
  lives in the helper, so no call site can forget it.
- **Chunk under the engine's parameter ceiling.** Every engine caps bound
  parameters per statement, and the caps differ by almost two orders of
  magnitude — around two thousand on one widely used server, sixty-five
  thousand on another, and under a thousand on one embedded engine until
  a 2020 release raised it — with client drivers sometimes capping below
  the engine they speak to. A batch endpoint that works in tests and dies
  at four thousand ids in production hit whichever of those it was never
  measured against. The helper chunks transparently under a floor chosen
  for the *lowest* engine the layer may run on, merges result maps across
  chunks — and for *writes*, the chunks run inside one transaction so the
  batch stays one fact. Where the engine accepts an array-typed parameter
  for membership, the list becomes one bound value and the ceiling moves
  from legality to plan quality and result size; the chunking decision
  survives, now made on rows returned rather than placeholders spent.

## Join versus fetch-and-stitch

Set-shaped access has two implementations, and neither dominates:

- **One joined query** wins when the child adds few columns and the
  relationship is narrow. Its cost is duplication: a parent with thirty
  children arrives thirty times, and a wide parent row times a deep join
  multiplies transferred bytes fast.
- **Two queries and an in-memory stitch** — fetch parents, collect ids,
  batch-fetch children, associate by key — wins when rows are wide,
  children are many, or the two halves have different cache lives. Its
  cost is two round trips and the stitch code (which the repository owns,
  once).

The decision is measurable, not stylistic: rows transferred and bytes moved
under each shape, at the real data's fan-out. What is *not* acceptable is
the third option that emerges by default — the loop.

## Detection: count queries, not milliseconds

N+1 hides from latency-based observation by construction: in development
the dataset is ten rows and the loop costs nothing; the defect scales with
production data you do not have on your laptop. Latency is a proxy, and the
proxy diverges from the target exactly where the defect lives
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The observable that
sees the defect itself is the **query count per operation** — which is flat
for healthy code and linear in N for the defect, at any dataset size,
including tiny test fixtures.

Two places to wire the counter:

- **In tests**: the layer exposes a statement counter (a test hook counting
  executions); a test renders the list operation over a fixture of, say,
  twenty parents and asserts the query count is a small constant. Assert
  the *predicate*, not a magic number — "constant in N, measured at two
  fixture sizes" is the honest form of the assertion
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
  and for a chunked batch the predicate is "bounded by the chunk count plus
  a constant", stated as such so the assertion does not fail the day a
  fixture crosses the chunk size; a bare `assert count == 3` rots into
  ritual the first time someone bumps it to 4 to make a build pass.
- **In production telemetry**: queries-per-request as a distribution. The
  linear-in-N endpoints appear at the top the moment real data arrives,
  long before they appear in latency percentiles.

## Batching has a boundary too

Two cautions keep the technique from over-rotating:

- **Do not pre-batch speculatively.** Fetching children for a thousand
  parents because "the caller might need them" replaces N+1 with 1 query
  that moves a thousand times the data. Set-shaped endpoints answer the
  access patterns callers *have*, driven by the same evidence (the query
  counter) that found the loops.
- **Unbounded batches are the transaction-scope defect in a new costume.**
  `fetch all by ids` with a hundred thousand ids is a batch job, not a
  query; the chunking helper keeps statements legal, but the *operation*
  above it needs pagination or a job-shaped design. A batch endpoint's
  contract states what size it is designed for, and something enforces it.
