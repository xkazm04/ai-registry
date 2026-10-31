---
subject: data-access
domain: software-engineering
last_touched: 2026-10-15
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

### 2026-09-17 - `/harvest backlog` wave 2, one technique

`existence-authority-written-last`, from [[2026-08-31-tigerbeetle-blog]] and [[2026-09-03-rowboat]]. Two stores with no shared transaction: the store readers treat as proof that a thing exists is written last and removed first, and a payload is staged outside it. The rule reconciles two orders the corpus already held from opposite sides - agent-memory's `lane-reconciliation` (name the survivable half-state and make it the only reachable one) and priced-authority's `secondary-index-before-primary` (index before record) - by asking which store the readers treat as the authority; both now point here. The source slogan 'referent before reference' was refuted as a general rule by the very seam that confirmed authority-last: gravitone's ingest wrote the file a row points at first, and leaked 4 phantom voices, because readers find voices by listing files. Also owned here, beside `record-precedes-effect`: a rollback ledger only sees half-states it was told about.

## 2026-10-06 - /intake deer-flow --delta (run `intake-deer-flow-1006-v3`, cloud dispatch)

Source [[../../sources/2026-10-06-deer-flow-v3]]. `python--layering-rules` re-pinned `08b27aef -> 53df22bd`. Three anchors, content unchanged (the dependency rule now at `backend/AGENTS.md:201`). No claim moved.

## 2026-10-15 - intake `mcp_agent_mail_rust` (run dle-002-1015, practitioner series DLE-002)

Source note [[2026-10-15-mcp-agent-mail-rust]]. New application
`rust--existence-authority-written-last--agent-mail`: a claim written to a database and a
file read by two different enforcers. The technique's rule holds per reader; with two
readers trusting opposite stores no single order hides the half-state from both, and for
an exclusion record "authority absent" means permission, so the create half-state is a
false allow bounded by a synchronous write and swept by a background worker, while
release is ordered to over-restrict. Candidate amendment banked untriaged (U2). The
predecessor's in-memory compensation is the technique's retraction without a sweep.

## 2026-10-31 - architecture review (subject-review worker)

First architecture-review record for this subject. Baseline `1061e8d64`. Trigger: subject pending in review coverage. Intended benefit: a decision on every document against current bytes, and the four small inconsistencies below fixed in place. Failure if ignored: a reader sizing a chunk floor from "two orders of magnitude", or a section reference that points at the wrong rule. Boundary: wording and counts only; no claim about a connected project was re-checked, and no verification date moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/data-access",
  "date": "2026-10-31",
  "baseline": "1061e8d64",
  "digest": "sha256-b2:2dba94be6400dea1",
  "disposition": "clarify",
  "coverage": "All 26 current documents (golden path, 13 techniques, 12 applications) read in full. Source checks covered the numerically load-bearing claims only: engine parameter ceilings, transaction-scoped session settings in PostgreSQL, and Firestore transaction retry semantics. Not evaluated: any connected-project tree (personas, kp, ascent, pof, grant-writing-nonprofits), the external trees at their pins (Prisma, LightRAG, unstorage, deer-flow, the agent-mail server), and any runtime behaviour. No verification date was refreshed.",
  "counterexamples": [
    "A typed query client checked against the schema at build time closes the column-rename and injection rot modes without a repository layer; only the invariant door, boundary ownership and isolated testing remain arguments for the layer (stated in the golden path).",
    "A throwaway tool with one author and three statements can inline them; bound parameters and one escaping function remain mandatory.",
    "Against SQLite 3.32.0 or later the parameter cap is 32,766, so a 999-sized floor is defence in depth, not a legality requirement.",
    "Two per-process sequence allocators can mint equal tokens; within one allocator max(clock, last+1) never ties.",
    "For an exclusion record (a lease) read by two enforcers over two stores, no single write order hides the half-state from both; the agent-mail application bounds and sweeps it instead."
  ],
  "sources": [
    {
      "url": "https://www.sqlite.org/limits.html",
      "result": "SQLITE_MAX_VARIABLE_NUMBER \"defaults to 999 for SQLite versions prior to 3.32.0 (2020-05-22) or 32766 for SQLite versions after 3.32.0\". Supports the batching technique's 2020 claim and the kp application's 999/32,766 figures; makes the \"almost two orders of magnitude\" phrase hold only against the old default."
    },
    {
      "url": "https://learn.microsoft.com/en-us/sql/sql-server/maximum-capacity-specifications-for-sql-server",
      "result": "\"Parameters per stored procedure | 2,100\" and \"Parameters per user-defined function | 2,100\". Supports \"around two thousand on one widely used server\"."
    },
    {
      "url": "https://www.postgresql.org/docs/current/protocol-message-formats.html",
      "result": "Bind message: \"Int16 The number of parameter values that follow\". An Int16 count caps parameters at 65,535, supporting \"sixty-five thousand on another\"."
    },
    {
      "url": "https://www.postgresql.org/docs/current/functions-admin.html",
      "result": "set_config: \"If is_local is true, the new value will only apply during the current transaction. If you want the new value to apply for the rest of the current session, use false instead.\" Supports layering-rules' per-transaction, never per-connection, identity rule for row policies on pooled connections."
    },
    {
      "url": "https://firebase.google.com/docs/firestore/manage-data/transactions",
      "result": "\"In the case of a concurrent edit, Cloud Firestore runs the entire transaction again\" and \"Read operations must be executed before write operations.\" Supports the cross-driver application's contention gap and the double's reads-before-writes contract."
    },
    {
      "source": "Internal consistency of the subject documents",
      "result": "Found four wording or count errors (read-models section reference, sequence-token total-order scope and tie-break, python application's eight versus a dozen sites, batching magnitude phrase). Checked and found consistent: the rust layering file counts (171 + 15 = 186), the python application's ten opt-in sites, and the golden path's technique list against the directory."
    }
  ],
  "documents": {
    "data-access.md": {
      "disposition": "keep",
      "reason": "The golden path states the three rot modes, the typed-client qualification, the four repository properties, construction-time injection safety, the layering direction, the corrupt-row contract and the later sections (two surfaces, two engines, many engines, runtime schema, localized records) in a consistent order, and every technique it lists has a matching file and section. No product names; the exits (analytics, tiny tools) and the never-optional floor are stated."
    },
    "techniques/query-construction.md": {
      "disposition": "keep",
      "reason": "Values-versus-identifiers, the builder invariant (predicate and value appended in one call), escaping hoisted to one function, and the marked hatch that still binds values are sound and internally consistent. The claim that no mainstream engine binds identifiers is standard and uncontested."
    },
    "techniques/row-mapping.md": {
      "disposition": "keep",
      "reason": "One declaration with derived mapper, decode decisions at the seam, the two honest collection policies chosen by consumer with silent skip banned, loud single-record reads, no write-back laundering, and statement-level errors kept out of the skip policy. Consistent with the golden path and with the rust application."
    },
    "techniques/layering-rules.md": {
      "disposition": "keep",
      "reason": "Direction rule, hooks-not-imports with its three rules, no live cursors on the surface, and mandatory predicates owned by the layer. The load-bearing claim that an engine row policy identity must be set per transaction, never per connection, matches the PostgreSQL documentation for set_config (is_local true lasts only for the current transaction, false for the rest of the session)."
    },
    "techniques/transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Boundary owned by the invariant, three composability fixes, once-or-twice-in-agreement, shape is not transactional state, errors reach the boundary, retryable closure with the idempotency key minted outside the loop, side effects after commit, short boundaries, read-modify-write and the conditional write whose verdict is read. Each rule is witnessed by an application in this subject (Prisma runtime, ascent credits, personas lab_crud)."
    },
    "techniques/batching-and-n-plus-one.md": {
      "disposition": "clarify",
      "reason": "The parameter-ceiling sentence says the caps \"differ by almost two orders of magnitude\". Checked: SQL Server allows 2,100 parameters, the PostgreSQL Bind message carries an Int16 count (65,535), and SQLite's default was 999 before 3.32.0 (2020-05-22) and 32,766 since. 999 to 65,535 is about 1.8 orders, so the phrase holds only against the pre-2020 embedded default the same sentence calls superseded; the current spread is about 31x. Reword so the magnitude claim matches the numbers."
    },
    "techniques/repo-testing.md": {
      "disposition": "keep",
      "reason": "Real engine over mocks, schema by the production road, three isolation levels with the savepoint-redirection qualification (which retracted an earlier disqualification), fixtures through the front door with the licensed raw hatch for corruption drills, and the yield-ordered assertion list."
    },
    "techniques/cross-driver-invariant-parity.md": {
      "disposition": "keep",
      "reason": "Invariants named above both drivers, constraint substitution by derived identity with one authoritative derivation, refuse-versus-absorb hidden behind one outcome vocabulary, one suite run twice, and the hand-written double that must enforce contracts and admits it does not model contention. The contention gap matches Firestore's documented behaviour: \"In the case of a concurrent edit, Cloud Firestore runs the entire transaction again\", and \"Read operations must be executed before write operations\"."
    },
    "techniques/read-models-and-projections.md": {
      "disposition": "clarify",
      "reason": "Content is sound. Internal reference error: the closing paragraph says a loaded-edited-written projection \"is the defect in §3\", but the projection-written-back defect is the second H2 (\"The projection is not the record\"); the third H2 is stored read models. Name the section instead of numbering it."
    },
    "techniques/capability-declared-in-the-type.md": {
      "disposition": "keep",
      "reason": "Three-tier ladder chosen by knowability, conservative default with polarity chosen for the default, the presence precondition amendment (whole operation versus option on an always-present operation), the unread declaration, the typed refusal, and admission at construction with the three-assertion conformance suite. Both the node and python applications witness each part."
    },
    "techniques/sequence-token-write-ordering.md": {
      "disposition": "clarify",
      "reason": "Two internal tensions. (1) The read side calls the sequence \"a total order, not a dense counter\", while the same document says equal tokens are \"not ordered\" and that tokens from two per-process allocators are \"comparable but not totally ordered\". One allocator using max(clock, last+1) does give a strict order, so the sentence should be scoped to one allocator. (2) The read side asks readers to sort \"with a deterministic tie-break\", while the tie rule says forcing a total order hides an unordered pair behind an arbitrary winner. Say that a deterministic tie-break makes the sort stable without claiming the tied pair is ordered."
    },
    "techniques/existence-authority-written-last.md": {
      "disposition": "keep",
      "reason": "Authority found by reading the readers, the per-operation order (create last, delete first, replace under a new identity, stage outside), every-reader half-state check, idempotency as precondition, and the rollback-ledger window. The two-enforcer departure recorded in the agent-mail application is a candidate amendment banked untriaged (U2) in this note; it is not adopted here and the technique states its one-authority assumption honestly."
    },
    "techniques/operator-defined-tables.md": {
      "disposition": "keep",
      "reason": "Definitions as rows and types as real tables, the two-tier field rule with definition-time refusal, a total field-type-to-column mapping, opt-in indexes, one identifier validation door with named looser variants, reserved namespaces as a migration question, bidirectional orphan discovery without auto-drop, and the deploy-ability discriminator. No product names."
    },
    "techniques/localized-record-identity.md": {
      "disposition": "keep",
      "reason": "The three models with the requirement that kills each, group identifier minted at creation and never a pointer to a privileged member, per-language versus per-group rule with worked consequences, asymmetric fallback (lookup yes, enumeration never), and the unenforced language predicate with a strongest-first enforcement list."
    },
    "applications/rust--row-mapping.md": {
      "disposition": "keep",
      "reason": "Dated reconciliation (2026-08-18 and a 2026-08-22 addendum) of the personas data crate: row_mapper!, collect_rows, the [opt]/opt_str hazards and the positional-to-named conversion with its census corollary. Internally consistent; private tree not reopened, verified_on unchanged."
    },
    "applications/rust--query-construction.md": {
      "disposition": "keep",
      "reason": "QueryBuilder, escape_like and where_raw map onto the technique, with the advisory order_by and the triplicated raw predicate stated as gaps. Private tree not reopened; verified_on unchanged."
    },
    "applications/rust--layering-rules.md": {
      "disposition": "keep",
      "reason": "Five-crate workspace at 58cf9557f: the crate boundary waived by a wholesale re-export (171 + 15 = 186 files, arithmetic consistent), CdcHooks done right for two consumers and a UI import for the third. Private tree not reopened."
    },
    "applications/rust--transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Hand-written CAS with verdict read versus the macro-generated unguarded twin, with the 2026-08-29 resolution banner preserving the specimen. Private tree not reopened."
    },
    "applications/python--layering-rules.md": {
      "disposition": "keep",
      "reason": "deer-flow harness-under-gateway with the CI-gated import direction, re-pinned to 53df22bd on 2026-10-06; the realization limit (dynamic import strings pass the gate) is stated. Not re-opened this run."
    },
    "applications/node--batching-and-n-plus-one.md": {
      "disposition": "keep",
      "reason": "kp and ascent at their 2026-08-29 pins: getJobsByIds built correctly and looped beside, the handoff route's read batched and write looped, and the org-nav count as the counterexample. Its chunk-floor statement (999 pre-2020, 32,766 now) agrees with the SQLite limits page. Trees not reopened."
    },
    "applications/node--read-models-and-projections.md": {
      "disposition": "keep",
      "reason": "ascent scanCredits/CreditLedger with a parity read but no parity check, the team-standing snapshot, and pof's recount-in-the-writer's-transaction; the common gap (no comparison runs) is stated. Trees not reopened."
    },
    "applications/node--transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Prisma 8.0.0-rc.4 runtime at dd6c12b (scope as value, callback boundary, boundary-failure eviction, mid-stream refusal, scope-gated cache, the weaker second wrapper and the shape-discriminated ambient join) plus ascent's retryable closure and the 2026-08-30 CAS-across-layers update. The pin is held in prose by design. Not re-resolved this run."
    },
    "applications/node--capability-declared-in-the-type.md": {
      "disposition": "keep",
      "reason": "unstorage presence-as-declaration against the kp adapter family's declared matrix, the residue-channel rot (2 of 32 drivers declare a flag; ttl declared and read by none) and the suite that cannot express a read-only driver; verdict not-better is argued. Trees not reopened."
    },
    "applications/python--capability-declared-in-the-type.md": {
      "disposition": "clarify",
      "reason": "LightRAG tiers 1-3, admission, the negative-branch suite and write_seq are consistent with the techniques; the ten opt-in sites listed do number ten. One internal count error: the paragraph enumerates exactly eight getattr gate sites, then says the vocabulary is \"spelled as a literal a dozen times\". Change to eight. Tree not reopened; verified_on unchanged."
    },
    "applications/rust--existence-authority-written-last--agent-mail.md": {
      "disposition": "keep",
      "reason": "Pinned at a full commit with quoted anchors (2026-10-15); records the two-enforcer departure, the deliberate release order and the stale contract. Not re-opened this run."
    },
    "applications/node--cross-driver-invariant-parity.md": {
      "disposition": "keep",
      "reason": "grant-writing-nonprofits at fa0764e: inventory inside the substituting driver, partial and composite index substitution, reclaimRefFor as one authority, both drivers pre-empting by read, the double with positive controls, and the two deviations (two suites; no contention model). Its claim that real Firestore retries on contention matches the Firebase transactions page quoted in the technique entry. Tree not reopened."
    }
  }
}
```

Phase B applied the four clarify items from the record above (batching magnitude phrase, read-models section reference, sequence-token total-order scope and tie-break, python application count). The record below is against the new digest.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/data-access",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:e64392f062530fdb",
  "disposition": "keep",
  "coverage": "Second record of 2026-10-31, against the digest after Phase B. The four clarify items from the first record were applied in place, each a minimal wording change; no other document changed. Every other disposition and the source checks carry over unchanged from the first record. No verification date was refreshed.",
  "counterexamples": [
    "A typed query client checked against the schema at build time closes the column-rename and injection rot modes without a repository layer; only the invariant door, boundary ownership and isolated testing remain arguments for the layer (stated in the golden path).",
    "A throwaway tool with one author and three statements can inline them; bound parameters and one escaping function remain mandatory.",
    "Against SQLite 3.32.0 or later the parameter cap is 32,766, so a 999-sized floor is defence in depth, not a legality requirement.",
    "Two per-process sequence allocators can mint equal tokens; within one allocator max(clock, last+1) never ties.",
    "For an exclusion record (a lease) read by two enforcers over two stores, no single write order hides the half-state from both; the agent-mail application bounds and sweeps it instead."
  ],
  "sources": [
    {
      "url": "https://www.sqlite.org/limits.html",
      "result": "SQLITE_MAX_VARIABLE_NUMBER \"defaults to 999 for SQLite versions prior to 3.32.0 (2020-05-22) or 32766 for SQLite versions after 3.32.0\". Supports the batching technique's 2020 claim and the kp application's 999/32,766 figures; makes the \"almost two orders of magnitude\" phrase hold only against the old default."
    },
    {
      "url": "https://learn.microsoft.com/en-us/sql/sql-server/maximum-capacity-specifications-for-sql-server",
      "result": "\"Parameters per stored procedure | 2,100\" and \"Parameters per user-defined function | 2,100\". Supports \"around two thousand on one widely used server\"."
    },
    {
      "url": "https://www.postgresql.org/docs/current/protocol-message-formats.html",
      "result": "Bind message: \"Int16 The number of parameter values that follow\". An Int16 count caps parameters at 65,535, supporting \"sixty-five thousand on another\"."
    },
    {
      "url": "https://www.postgresql.org/docs/current/functions-admin.html",
      "result": "set_config: \"If is_local is true, the new value will only apply during the current transaction. If you want the new value to apply for the rest of the current session, use false instead.\" Supports layering-rules' per-transaction, never per-connection, identity rule for row policies on pooled connections."
    },
    {
      "url": "https://firebase.google.com/docs/firestore/manage-data/transactions",
      "result": "\"In the case of a concurrent edit, Cloud Firestore runs the entire transaction again\" and \"Read operations must be executed before write operations.\" Supports the cross-driver application's contention gap and the double's reads-before-writes contract."
    },
    {
      "source": "Internal consistency of the subject documents",
      "result": "Found four wording or count errors (read-models section reference, sequence-token total-order scope and tie-break, python application's eight versus a dozen sites, batching magnitude phrase). Checked and found consistent: the rust layering file counts (171 + 15 = 186), the python application's ten opt-in sites, and the golden path's technique list against the directory."
    }
  ],
  "documents": {
    "data-access.md": {
      "disposition": "keep",
      "reason": "The golden path states the three rot modes, the typed-client qualification, the four repository properties, construction-time injection safety, the layering direction, the corrupt-row contract and the later sections (two surfaces, two engines, many engines, runtime schema, localized records) in a consistent order, and every technique it lists has a matching file and section. No product names; the exits (analytics, tiny tools) and the never-optional floor are stated."
    },
    "techniques/query-construction.md": {
      "disposition": "keep",
      "reason": "Values-versus-identifiers, the builder invariant (predicate and value appended in one call), escaping hoisted to one function, and the marked hatch that still binds values are sound and internally consistent. The claim that no mainstream engine binds identifiers is standard and uncontested."
    },
    "techniques/row-mapping.md": {
      "disposition": "keep",
      "reason": "One declaration with derived mapper, decode decisions at the seam, the two honest collection policies chosen by consumer with silent skip banned, loud single-record reads, no write-back laundering, and statement-level errors kept out of the skip policy. Consistent with the golden path and with the rust application."
    },
    "techniques/layering-rules.md": {
      "disposition": "keep",
      "reason": "Direction rule, hooks-not-imports with its three rules, no live cursors on the surface, and mandatory predicates owned by the layer. The load-bearing claim that an engine row policy identity must be set per transaction, never per connection, matches the PostgreSQL documentation for set_config (is_local true lasts only for the current transaction, false for the rest of the session)."
    },
    "techniques/transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Boundary owned by the invariant, three composability fixes, once-or-twice-in-agreement, shape is not transactional state, errors reach the boundary, retryable closure with the idempotency key minted outside the loop, side effects after commit, short boundaries, read-modify-write and the conditional write whose verdict is read. Each rule is witnessed by an application in this subject (Prisma runtime, ascent credits, personas lab_crud)."
    },
    "techniques/batching-and-n-plus-one.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the parameter-ceiling sentence now separates the current spread (about 2,100 to 65,535, more than an order of magnitude) from the almost-two-orders spread that held only against the embedded engine's pre-2020 default of 999."
    },
    "techniques/repo-testing.md": {
      "disposition": "keep",
      "reason": "Real engine over mocks, schema by the production road, three isolation levels with the savepoint-redirection qualification (which retracted an earlier disqualification), fixtures through the front door with the licensed raw hatch for corruption drills, and the yield-ordered assertion list."
    },
    "techniques/cross-driver-invariant-parity.md": {
      "disposition": "keep",
      "reason": "Invariants named above both drivers, constraint substitution by derived identity with one authoritative derivation, refuse-versus-absorb hidden behind one outcome vocabulary, one suite run twice, and the hand-written double that must enforce contracts and admits it does not model contention. The contention gap matches Firestore's documented behaviour: \"In the case of a concurrent edit, Cloud Firestore runs the entire transaction again\", and \"Read operations must be executed before write operations\"."
    },
    "techniques/read-models-and-projections.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the closing reference \"the defect in §3\" now names its section (\"The projection is not the record\"), which is the second H2, not the third."
    },
    "techniques/capability-declared-in-the-type.md": {
      "disposition": "keep",
      "reason": "Three-tier ladder chosen by knowability, conservative default with polarity chosen for the default, the presence precondition amendment (whole operation versus option on an always-present operation), the unread declaration, the typed refusal, and admission at construction with the three-assertion conformance suite. Both the node and python applications witness each part."
    },
    "techniques/sequence-token-write-ordering.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"a total order, not a dense counter\" now reads as an order within one allocator, not a dense counter, so it no longer contradicts the tie and scope rules; and the read-side tie-break is stated as sort stability that does not make a tied pair ordered."
    },
    "techniques/existence-authority-written-last.md": {
      "disposition": "keep",
      "reason": "Authority found by reading the readers, the per-operation order (create last, delete first, replace under a new identity, stage outside), every-reader half-state check, idempotency as precondition, and the rollback-ledger window. The two-enforcer departure recorded in the agent-mail application is a candidate amendment banked untriaged (U2) in this note; it is not adopted here and the technique states its one-authority assumption honestly."
    },
    "techniques/operator-defined-tables.md": {
      "disposition": "keep",
      "reason": "Definitions as rows and types as real tables, the two-tier field rule with definition-time refusal, a total field-type-to-column mapping, opt-in indexes, one identifier validation door with named looser variants, reserved namespaces as a migration question, bidirectional orphan discovery without auto-drop, and the deploy-ability discriminator. No product names."
    },
    "techniques/localized-record-identity.md": {
      "disposition": "keep",
      "reason": "The three models with the requirement that kills each, group identifier minted at creation and never a pointer to a privileged member, per-language versus per-group rule with worked consequences, asymmetric fallback (lookup yes, enumeration never), and the unenforced language predicate with a strongest-first enforcement list."
    },
    "applications/rust--row-mapping.md": {
      "disposition": "keep",
      "reason": "Dated reconciliation (2026-08-18 and a 2026-08-22 addendum) of the personas data crate: row_mapper!, collect_rows, the [opt]/opt_str hazards and the positional-to-named conversion with its census corollary. Internally consistent; private tree not reopened, verified_on unchanged."
    },
    "applications/rust--query-construction.md": {
      "disposition": "keep",
      "reason": "QueryBuilder, escape_like and where_raw map onto the technique, with the advisory order_by and the triplicated raw predicate stated as gaps. Private tree not reopened; verified_on unchanged."
    },
    "applications/rust--layering-rules.md": {
      "disposition": "keep",
      "reason": "Five-crate workspace at 58cf9557f: the crate boundary waived by a wholesale re-export (171 + 15 = 186 files, arithmetic consistent), CdcHooks done right for two consumers and a UI import for the third. Private tree not reopened."
    },
    "applications/rust--transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Hand-written CAS with verdict read versus the macro-generated unguarded twin, with the 2026-08-29 resolution banner preserving the specimen. Private tree not reopened."
    },
    "applications/python--layering-rules.md": {
      "disposition": "keep",
      "reason": "deer-flow harness-under-gateway with the CI-gated import direction, re-pinned to 53df22bd on 2026-10-06; the realization limit (dynamic import strings pass the gate) is stated. Not re-opened this run."
    },
    "applications/node--batching-and-n-plus-one.md": {
      "disposition": "keep",
      "reason": "kp and ascent at their 2026-08-29 pins: getJobsByIds built correctly and looped beside, the handoff route's read batched and write looped, and the org-nav count as the counterexample. Its chunk-floor statement (999 pre-2020, 32,766 now) agrees with the SQLite limits page. Trees not reopened."
    },
    "applications/node--read-models-and-projections.md": {
      "disposition": "keep",
      "reason": "ascent scanCredits/CreditLedger with a parity read but no parity check, the team-standing snapshot, and pof's recount-in-the-writer's-transaction; the common gap (no comparison runs) is stated. Trees not reopened."
    },
    "applications/node--transactions-and-units-of-work.md": {
      "disposition": "keep",
      "reason": "Prisma 8.0.0-rc.4 runtime at dd6c12b (scope as value, callback boundary, boundary-failure eviction, mid-stream refusal, scope-gated cache, the weaker second wrapper and the shape-discriminated ambient join) plus ascent's retryable closure and the 2026-08-30 CAS-across-layers update. The pin is held in prose by design. Not re-resolved this run."
    },
    "applications/node--capability-declared-in-the-type.md": {
      "disposition": "keep",
      "reason": "unstorage presence-as-declaration against the kp adapter family's declared matrix, the residue-channel rot (2 of 32 drivers declare a flag; ttl declared and read by none) and the suite that cannot express a read-only driver; verdict not-better is argued. Trees not reopened."
    },
    "applications/python--capability-declared-in-the-type.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"spelled as a literal a dozen times\" now reads \"eight times\", matching the eight gate sites the same paragraph enumerates."
    },
    "applications/rust--existence-authority-written-last--agent-mail.md": {
      "disposition": "keep",
      "reason": "Pinned at a full commit with quoted anchors (2026-10-15); records the two-enforcer departure, the deliberate release order and the stale contract. Not re-opened this run."
    },
    "applications/node--cross-driver-invariant-parity.md": {
      "disposition": "keep",
      "reason": "grant-writing-nonprofits at fa0764e: inventory inside the substituting driver, partial and composite index substitution, reclaimRefFor as one authority, both drivers pre-empting by read, the double with positive controls, and the two deviations (two suites; no contention model). Its claim that real Firestore retries on contention matches the Firebase transactions page quoted in the technique entry. Tree not reopened."
    }
  }
}
```
