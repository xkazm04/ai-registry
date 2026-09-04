---
layer: golden-path
type: golden-path
subject: data-access
status: reconciled
techniques:
  - query-construction
  - row-mapping
  - layering-rules
  - transactions-and-units-of-work
  - batching-and-n-plus-one
  - repo-testing
  - cross-driver-invariant-parity
  - read-models-and-projections
  - capability-declared-in-the-type
  - sequence-token-write-ordering
  - operator-defined-tables
  - localized-record-identity
---

# Repository & data-access layering

Data access is the seam between two worlds that disagree about almost
everything. Below the seam: a store that thinks in tables, rows, and untyped
tuples, speaks a query language the host compiler cannot read, and holds the
only durable copy of the user's state. Above it: application code that thinks
in typed domain records and assumes invariants the store has never heard of.
The subject exists because this seam does not stay healthy by default — it
degrades in a specific, predictable way, and the whole doctrine is the set of
structural moves that prevent that degradation rather than reviewing for it.

## How the seam rots

The degenerate form is always the same: **query strings scattered through
handlers.** Each handler assembles its own statement, binds (or interpolates)
its own values, decodes its own rows. It works, it ships, and it has already
lost three properties that only become visible later:

- **The consumers of the schema are no longer enumerable.** Queries are
  strings; the compiler has no opinion about whether the columns they name
  still exist. When a table changes shape, the only way to find every
  affected statement is a text search across the whole codebase — and text
  search misses statements assembled from fragments. Every schema evolution
  now carries an unknown blast radius.
- **Injection safety becomes a per-callsite review item.** With a hundred
  independent assembly sites, "we always bind parameters" is a discipline,
  and discipline is the thing that fails on the hundred-and-first site. The
  vulnerability is not any one string concatenation; it is the *architecture
  that makes string concatenation available everywhere*.
- **The store's invariants have no door.** Validation, normalization,
  timestamps, defaulting — each writer re-implements or forgets them
  independently. Validation sprinkled across N call sites is validation
  minus the site added next quarter
  ([one-validation-door](../../../_laws.md#one-validation-door)).

None of these rot modes announce themselves. Each individual scattered query
is locally fine; the loss is a system property, which is why it survives code
review indefinitely.

One honest qualification, because it changes what the layer is *for*. A
typed query client checked against the schema at build time — generated
from the schema, or verifying each statement against a schema snapshot
during compilation — closes the first two rot modes by itself: a renamed
column is a compile error at every consumer, and a client that only accepts
bound values has no interpolating spelling to review. Where such a client is
the only road to the store, "queries scattered through handlers" loses two
of its three teeth. It keeps the third, and the third is the one the
compiler cannot see: the store's invariants still have no door, the
transaction boundary still has no owner, and the layer still cannot be
tested alone. So the argument for the layer does not disappear under a
typed client; it narrows to the properties below that are about *who may
write and under what policy* — and a team that adopts the client and skips
the layer should know exactly which guarantees it kept and which it gave
up.

## The repository: an enumerable surface

The repair is structural: **one layer owns the store, and everything above it
speaks in named operations.** Call it a repository, a store module, a data
access layer — the name matters less than the properties:

1. **Every statement the system can ever issue lives in one place.** Not
   "most", not "by convention" — the query language appears in exactly one
   module tree, and an import boundary (enforced, not requested) keeps it
   there. This single property is what makes the other guarantees auditable:
   the injection review has a finite surface, the schema-change sweep has a
   finite surface, and "what writes to this table?" is a directory listing,
   not an investigation.
2. **Operations are named for intent, not mechanics.** The surface exposes
   *find the active records for this owner*, *record a completed attempt* —
   not *run this statement*. A repository whose functions take query
   fragments as arguments has re-scattered the queries with extra steps.
3. **The surface returns domain types, not rows.** Decoding happens at the
   seam, once, under a single policy (the
   [row-mapping](./techniques/row-mapping.md) technique). Callers never see
   column tuples, never re-parse serialized fields, never learn the store's
   nullability quirks. "Domain types" is the rule for reads whose result
   will be handed back to the store; a read that exists to be displayed or
   exported returns a projection shaped for its consumer — still decoded at
   the seam, still typed, but not the aggregate (the
   [read-models-and-projections](./techniques/read-models-and-projections.md)
   technique draws that line).
4. **The surface is honest about writes.** Insert, update, delete, and
   upsert operations are distinguishable in the function inventory. The set
   of functions that can mutate a given table *is* the answer to "who writes
   here" — which is exactly the enumerable-writers property that the
   one-door law demands of any mutable store.

What the repository is **not**: a mechanical one-function-per-statement
mirror, or a generic pass-through that accepts arbitrary predicates from
above. Both extremes destroy the point. The first buries intent under
boilerplate until people route around it; the second turns the enumerable
surface back into a query construction kit for callers. The surface grows
one named operation per genuine access pattern, and access patterns are
finite because the application's jobs are finite.

## Injection safety is a property of construction, not of review

The safe posture is not "we check for injection"; it is "the way queries are
built makes injection unrepresentable in ordinary code":

- **Values are always bound parameters.** No exceptions for values "known to
  be numeric", no exceptions for internal callers. The exception is the
  habit, and the habit is the vulnerability.
- **Identifiers go through allowlists.** Column and table names cannot be
  bound as parameters in any mainstream engine, and dynamic identifiers are
  a legitimate need (user-chosen sort columns, filter fields). The safe form
  is a closed map from external token to internal identifier — a vocabulary
  with one authoritative definition
  ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
  where an unknown token is a loud error, never a pass-through.
- **Escaping is hoisted to one audited place.** Pattern-match wildcards,
  quoting rules, fragment assembly — each has exactly one implementation,
  and everything else calls it. A second implementation of escaping is a
  second chance to get it wrong, discoverable only by exploit.
- **Dynamic assembly goes through a builder that owns the bookkeeping.**
  Hand-maintained placeholder numbering across optional predicates is a
  classic off-by-one factory; a builder that appends the predicate and its
  value in one motion makes the index arithmetic mechanical and the unsafe
  spelling unavailable.

The mechanics — builders, allowlist shapes, the raw-string escape hatch and
how to mark it — are the [query-construction](./techniques/query-construction.md)
technique.

## The layering direction

Dependencies at this seam point in exactly one direction: **the data layer
depends on the domain's types and on nothing above them.** Application
logic, transport handlers, orchestration — all of it may call down into the
repository; the repository imports none of it. This is not aesthetics:

- A data layer that imports application modules can no longer be compiled,
  tested, or reasoned about alone — and "testable alone against a real
  store" is one of the layer's chief assets
  ([repo-testing](./techniques/repo-testing.md)).
- The layer that everything trusts must be the layer with the fewest
  reasons to change. Upward imports subscribe it to every fashion above it.

Real systems do need the arrow to *appear* to point up sometimes — the data
layer detects something the application must react to (an integrity repair,
a lifecycle event worth broadcasting). The answer is never an import; it is
a hook injected from above at composition time. The direction rule, the
one-module-owns-the-query-language rule, and the hook pattern are the
[layering-rules](./techniques/layering-rules.md) technique.

## The honesty contract: when a row is corrupt

Stores accumulate damage: a crashed write, a bug three releases ago, a hand
edit by a support tool. Sooner or later a query returns a row that does not
decode — a mangled serialized field, an enum variant nothing recognizes, a
null where the domain type has no room for one. What the data layer does at
that moment is a *contract*, decided once, not an accident per call site:

- **A collection read has exactly two legal answers, and silence is
  neither.** Either the read *fails whole* — one corrupt row aborts the
  list, because for this consumer a silently short list is a lie it will
  act on — or it *degrades visibly*: the healthy rows return and the skip
  is recorded with the row's identity, counted, surfaced where a human can
  see it. Which of the two is right is decided per read by who consumes it
  (an interactive list a user can retry tolerates whole-failure; a
  background sweep must not drop a work item into a log nobody reads —
  or the reverse, in another system's economics). What is banned is the
  third option every codebase drifts into: skipping *silently*, which
  converts data corruption into data that "never existed" — the most
  expensive lie in this subject
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
- **A single-record read fails loud.** When the caller asked for exactly
  one record by identity, "absent" and "present but unreadable" are
  different facts and must not share the empty answer. Returning
  nothing-found for a corrupt row invites the caller to recreate the
  record — now the identity is claimed twice and the corruption has bred.
- **Deleting the corrupt row is not the fix**
  ([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair)). The row
  is the evidence. Quarantine and repair are decisions for a layer that
  knows what the data means; the access layer's job is to make the damage
  *visible* without amplifying it.

The decode seam where this contract lives — and why hand-written per-query
mapping guarantees the contract will be applied inconsistently — is the
[row-mapping](./techniques/row-mapping.md) technique.

## Units of work and the shape of the surface

Two forces try to pull the repository surface out of shape, and both get
their own discipline:

- **Multi-write invariants.** "Create the parent and its first child", "move
  value from here to there" — correctness spans several statements, and the
  transaction boundary must live with the code that knows the invariant,
  while individual repository operations stay composable underneath it. Who
  owns the boundary, how nested calls behave, and why side effects must wait
  for commit are
  [transactions-and-units-of-work](./techniques/transactions-and-units-of-work.md).
- **Access patterns that multiply.** A surface that only offers
  fetch-one-by-id *causes* the loop-of-queries defect in its callers; the
  N+1 shape is an API design failure before it is a caller bug. Set-shaped
  endpoints, safe membership-list construction, and detection by counting
  are [batching-and-n-plus-one](./techniques/batching-and-n-plus-one.md).

## Two surfaces in one layer

The surface described above is shaped by consistency: one module per
aggregate, reads that return the whole record because a write will hand it
back, writes through one door. A product's *questions* — the list screen
that needs three columns from three aggregates, the dashboard count, the
export — do not fit that shape, and forcing them through it produces the
two failures that get the pattern abandoned: whole aggregates loaded to
render a name, and a repository that grows a method per screen. The repair
is a second surface in the same layer, returning read-only projections
shaped for their consumers, with one iron rule — a projection is never
written back — and, for the projections too expensive to compute on every
read, a stored read model whose recomputation is named and checked. That is
[read-models-and-projections](./techniques/read-models-and-projections.md).

## When two engines sit behind one surface

The enumerable surface makes a second backend cheap to add — implement the
interface, choose the driver at composition time, change no call site. What
it does not make cheap is keeping the two honest, because the surface
constrains shape while a caller depends on *behaviour*. Most operations port
without incident; the exceptions are the handful of guarantees one engine
states declaratively and the other has no vocabulary for at all, which is
also the handful the money and identity paths were built on. Holding those
equal — naming the invariants above both drivers, substituting a derived
identity where a constraint cannot exist, and refusing to let the two
engines' opposite failure shapes reach callers — is
[cross-driver-invariant-parity](./techniques/cross-driver-invariant-parity.md).

## When there are more than two, and they disagree about durability

Past a handful of implementations, two of that section's assumptions quietly
expire. The first is that every implementation can do everything the surface
names: at scale some cannot, several arrive from people who do not own the
interface, and the parity list — prose, above the drivers — is enforced by
whoever remembers to read it. The claim has to move somewhere a machine
checks it, which means declaring each capability where it can be known: as a
required member when a missing operation should make the implementation
unconstructable, and as declared data read before dispatch when absence is
legal and has a degraded path
([capability-declared-in-the-type](./techniques/capability-declared-in-the-type.md)).

The second assumption is that the implementations agree about durability.
When one side of the family is a transactional engine and another is a file
on a disk, an ordering guarantee expressed as a transaction exists in some
deployments and not others — which makes it not a guarantee. Order then has
to be carried above the stores, as a monotonic token stamped on every write
by the one door that writes, so that "which of these is newer" is answered
identically in every topology
([sequence-token-write-ordering](./techniques/sequence-token-write-ordering.md)).

## When the schema is not a constant

Everything above assumes the shape of the store is decided by the people who
write the code and changes when they ship. Two families of product break that
assumption, and both push work back into this layer rather than into the one
above it.

The first is a product whose **data model is an operator's runtime input** —
someone without a deploy pipeline decides there is now a record type with
these fields, and expects it live immediately. The two reflexes both fail:
schema in code cannot be changed without a release, and a universal
key-value or single-document store buys the flexibility by permanently
surrendering indexes, foreign keys and the engine's own inspection tooling.
The third substrate keeps the definitions as ordinary rows and materializes
each record type as a real table with typed columns, created and altered by
the host at runtime — which works only under a strict two-tier field rule
that says out loud which fields are queryable and which are opaque, and only
if every operator-typed identifier passes one validation door before it
reaches a schema statement
([operator-defined-tables](./techniques/operator-defined-tables.md)).

The second is a product whose **records exist in several languages**.
Translating the interface is a catalog problem and belongs elsewhere; a
translated record is not a value of a key but another record with its own
address, lifecycle and revision history. The identity model that survives —
one row per language, linked by a shared group identifier, uniqueness scoped
to address-and-language — is chosen by two requirements that eliminate the
alternatives, and it leaves behind a question every later feature must answer
about whether a new field belongs to one translation or to all of them
([localized-record-identity](./techniques/localized-record-identity.md)).

## When the full pattern is the wrong tool

The doctrine above is calibrated for an application's operational store —
the data the product reads and writes as part of its job. Two neighbors
deserve different treatment, and forcing them through the repository is
cargo cult:

- **Ad-hoc analytics and one-off reporting.** Exploratory queries, run by
  people, against a replica or export. Wrapping each in a named operation
  adds ceremony and no safety; keep them out of the application's surface
  entirely instead.
- **Tiny tools with one table and three queries.** The pattern's value
  scales with the number of writers and the lifetime of the schema. A
  throwaway with one author can inline its three statements — *knowing*
  that the moment it stops being throwaway, the migration into a proper
  layer is the first refactor, not the last.

What is never optional, at any scale: bound parameters, and one place that
owns escaping. Those cost nothing and their absence is how tiny tools end up
in incident reports.

## The techniques

- [query-construction](./techniques/query-construction.md) — builders that own
  placeholder bookkeeping, identifier allowlists, escaping hoisted to one
  place, and the marked escape hatch.
- [row-mapping](./techniques/row-mapping.md) — the single decode seam:
  declared shapes, generated mappers, and the corrupt-row policy applied
  uniformly.
- [layering-rules](./techniques/layering-rules.md) — the dependency direction,
  one module owns the query language, hooks for upward signals.
- [transactions-and-units-of-work](./techniques/transactions-and-units-of-work.md)
  — invariant-owned boundaries, composable operations, side effects deferred
  to commit.
- [batching-and-n-plus-one](./techniques/batching-and-n-plus-one.md) —
  set-shaped surfaces, membership-list construction, chunking, and
  query-count detection.
- [repo-testing](./techniques/repo-testing.md) — real engine over mocks,
  per-test isolation, fixtures through the front door, corruption drills.
- [cross-driver-invariant-parity](./techniques/cross-driver-invariant-parity.md)
  — two backends, one promise: invariants named above the drivers, constraint
  substitution by derived identity, one parity suite run twice, and what a
  hand-written double must enforce to be worth trusting.
- [read-models-and-projections](./techniques/read-models-and-projections.md)
  — the aggregate surface and the projection surface, the projection that
  is never written back, and stored read models with a named recomputation
  and a declared propagation contract.
- [capability-declared-in-the-type](./techniques/capability-declared-in-the-type.md)
  — the three tiers of declaring what an implementation can do, the
  conservative default, admission at construction, and the typed refusal.
- [sequence-token-write-ordering](./techniques/sequence-token-write-ordering.md)
  — order carried as data when no transaction spans the stores: allocation,
  the stamping door, ties as answers, and what the token does not buy.
- [operator-defined-tables](./techniques/operator-defined-tables.md) — the
  model as runtime data: definitions as rows and record types as real tables,
  the two-tier field rule that keeps the queryable set honest, identifier
  validation as the only defence at a schema statement, and discovery of
  tables no query can see.
- [localized-record-identity](./techniques/localized-record-identity.md) —
  one row per language linked by a group identifier: what the three candidate
  models each cost, the per-language-or-per-group question every later field
  must answer, why fallback belongs to lookup and never to enumeration, and
  the language predicate nothing enforces.
