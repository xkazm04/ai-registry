---
subject: data-access
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# data-access

First touch: [[2026-08-22-2]], external reconcile against `prisma/prisma`
@ `dd6c12b` (8.0.0-rc.4). Gained `node--transactions-and-units-of-work` —
second stack; single-stack debt cleared. Note: the batching hint was stale —
v8's restructured monorepo has no client-side dataloader.

## Open leads (banked, convergence rule applies)

- **Boundary-failure classification**: a failed commit/rollback leaves the
  connection indeterminate; evict-vs-pool is part of the boundary contract, and
  the boundary's own failure must never mask the causing error.
- Session-scoped connection state (roles, set_config) is boundary state:
  reset-or-evict on release.
- "One boundary implementation, or two that agree" — the convenience second
  wrapper is the realistic failure mode.
- Ambient-state discrimination by method presence conflates "already inside a
  transaction" with "cannot transact". SECOND SIGHTING of lifecycle-vs-health
  (with Litestream's `replicating`, same wave).
- Streaming results extend the boundary hazard past commit; mid-stream refusal
  needed, prepared-statement bridges need their own guard.

## Cross-subject proposals (for owning subjects)

- Release-vs-destroy discipline + "prove the connection round-trips before
  pooling" → connection-pooling.
- Cache writes gated on execution scope (read-inside-transaction must not
  populate a shared cache) → the caching subject.

## Applied to the technique layer

- 2026-08-22-3: **shape is not transactional state** applied to `transactions-and-units-of-work` ([[2026-08-22-3]]).
- 2026-08-23-1: **once, or twice in agreement** (one-mechanism family) applied to `transactions-and-units-of-work` ([[2026-08-23-1]]).

## 2026-08-29 — /deepen architecture batch (dry_streak 0)

7→8 techniques (read-models-and-projections, stage: team), 4→9 applications (rust
layering-rules + rust transactions from personas; node batching kp+ascent; node
read-models ascent+pof; Tree B on node transactions). Refuted: single-origin N+1 (three
origins); rollback-per-test disqualification (savepoint redirection). Landed: retryable-
closure unit of work with idempotency key outside the loop; typed-client qualification
(closes 2 of 3 rot modes); mandatory-predicates-belong-to-the-layer (answers the
entity-lifecycle inbound reference); default isolation in cross-driver parity.
Survived: bound-parameters-never-optional, single-statement atomicity,
one-suite-run-twice, mock-the-layer-not-the-engine (strengthened by the ascent negative
specimen). Banked: statement-counter hook (return: any fleet project counts queries in
tests); outbox ownership (return: kp dev_outbox grows). Forecast: applications-only
next pass.

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.

## 2026-09-03 - `/intake` lightrag (run `intake-lightrag-0902`, intake 2.2.0, Opus workers)

Two techniques from a storage abstraction with 18 backends behind 4 interfaces: `capability-declared-in-the-type` (a capability is declared in the type when knowable at construction and checked at runtime only when not; a three-tier ladder - required member / declared data / refusing default; boundary to `cross-driver-invariant-parity`, whose prose list above two drivers does not scale past what one reader holds) and `sequence-token-write-ordering` (heterogeneous durability across stores means ordering rides a sequence token on every write, not a transaction that cannot span them; the token is policy input, not policy). Source-tree application `python--capability-declared-in-the-type` (witness: the CI matrix). Deviations: a declared `required_methods` key nothing evaluates; the capability read reflectively as a string at eight gates so a misspelling reads false forever; the token scoped to two of fifteen backends.

## 2026-09-07 — `unstorage` (intake, `github:unjs/unstorage` @ `7f773be1`)

Amended `capability-declared-in-the-type`; added `node--capability-declared-in-the-type`.
No new technique — the subject already models this ground, which is the honest
reading of a 32-driver storage layer against a 12-technique subject.

**The amendment is a precondition, not a correction.** The technique's
"Declaration is not reflection" rests on a middle clause — a member can be
*inherited* from the refusing default — and that clause is a premise, not a
universal. Where the interface is a plain record of optional function fields
with no base class and no default implementation, a member exists only because
that implementation's author wrote it, so presence is not correlated with
capability, it *is* the declaration, held where it cannot drift from the code.
The discriminating question becomes **whole operation, or option on an
operation that is always present?** — the second is the residue reflection
cannot reach, and it is what a declared-data channel is actually for.

**Two costs came with it, both counted in the tree**, and both are now in the
technique: the residue channel is where the rot concentrates (2 of 32 drivers
declare any flag; of the two flags defined, `ttl` is declared by no driver and
read by no line of the core — a capability existing only in the type), and
presence leaves no room for a refusal, so the absent branch returns and
*unsupported* and *done* get the same spelling. That library's core does exactly
that three times, and documents it as a feature.

**The strongest evidence is negative and structural.** The technique closes by
naming its third conformance assertion — declared-unsupported produces a typed
refusal rather than an empty success — as "the assertion always missing". In
this tree it is not missing but *unrepresentable*: the shared driver suite is
written against the facade that synthesises the absent operations, so every
driver's observable behaviour is uniform by construction and the suite cannot
see a capability difference. 30 of 35 driver test files call it; the one
read-only built-in is tested bespoke, outside it.

**Applied to kp, and the amendment's own verdict there is `not-better` by
design.** kp sits on the excluded side of the new boundary — adapters subclass a
base whose `complete_document` raises a typed refusal, so presence is
uninformative and kp correctly declares a matrix "never probed at call time".
The amendment predicts that and nothing there should change channels. What the
boundary directed instead was the owed third assertion: `missing_capability`
existed once in source and in no test, against five other subtypes that are
asserted. Two tests now derive both directions from the matrix with a floor on
the join; negative control fires and names the defect (kp `3f253853`).
