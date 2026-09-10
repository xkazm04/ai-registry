---
subject: analytics-store-design
domain: llm-observability
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# analytics-store-design

First touch: [[2026-08-27-duckdb-changing-physics-of-analytics]] — an `/intake` run
aimed at a different bundle that found this subject's enumeration one item short.

## State

6 techniques, 4 applications (process, rust, sql). Golden path is strong — the
three-adjective contract (fast / portable / honest) and the parity-or-refusal
discipline are among the better-argued things in the bundle.

## 2026-08-27 — the enumeration was one quadrant short

**The catch was an enumeration, found by the rule that an enumeration is a claim.** The
golden path listed its portability targets as four — embedded relational, networked
relational, document, analytical warehouse — and that 2x2 has exactly one hole: the
*embedded analytical* engine. Both statements of the four-item list were corrected
(golden path §Three adjectives and §Heterogeneous backends).

**The sharper half is the amendment to `analytical-copy-partitioning`: the copy does not
have to be a warehouse.** The technique priced the fork as a warehouse decision, which
made its trigger a *scale* question and left exactly two answers beneath it — better
composite indexes, or client-side summation at O(matched rows). An in-process columnar
engine over an exported file is a third. Every structural rule in the technique survives
the substitution unchanged, because they are rules about the **role** (receives, never
originates; never enforces; mirrors the logical schema) and not about the topology.

Consequence, and the reason it matters: **the trigger drops.** A deployment that
correctly refused a warehouse may still be well past the point where scanning in the
service is the wrong answer. The amendment also notes that partition grain stops being a
pricing decision where nothing is billed by bytes scanned.

Discriminator recorded for future runs: **a warehouse earns its keep when the copy must
be queried by people and systems outside this service** — shared SQL access, other
teams' tooling, multi-year retention, volumes past what one host should scan. Below
that, the copy has one consumer, and a consumer that links the engine needs no service
to talk to.

## Open leads (banked, with return conditions)

- **`fixed-width-timestamp-encoding` still enumerates three backends** ("an embedded
  relational store, a networked relational store, and a document store") and separately
  handles the warehouse's native temporal type. Not corrected this run — the embedded
  analytical engine's type system was not verified, and guessing at it would be the
  phantom-fix failure. Return when a connected project runs the hybrid and the encoding
  can be checked rather than assumed.
- **`capability-flags-and-refusal` has not been re-read against the fifth backend.** Its
  refusal vocabulary was designed around a document store that cannot aggregate; the
  embedded analytical engine's refusals are the mirror case (aggregates brilliantly,
  should never serve point reads or enforce). Likely an amendment, not a technique.

## Cross-bundle boundary (do not link)

`software-engineering/backend-platform/data-layer/embedded-db/techniques/analytical-reads-off-the-serving-store`
holds the same fork from the other end: it decides which reads leave a serving store,
this subject shapes the copy they land in. Same fork, opposite ends. The discriminator is
stated in prose on each side and neither absorbs the other — cross-bundle links are
forbidden, and a later run should recognise the shape rather than re-litigate it.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/analytics-store-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:85d13aa9b47efb29",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A JSON field with a supported expression index need not be promoted merely to become indexed.",
    "Strings under different collations or signed extended-year formats need not sort chronologically.",
    "An ingestion-date partition still returns late data correctly when event-time filtering scans all necessary arrival partitions.",
    "An event without reported usage is not evidence of zero tokens."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/analytics-store-design",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://firebase.google.com/docs/firestore/query-data/aggregation-queries",
      "scope": "Official count/sum/average support narrows the no-aggregation claim."
    },
    {
      "url": "https://www.postgresql.org/docs/16/datatype-json.html",
      "scope": "Official JSON index support contradicts indexes-only-columns doctrine."
    },
    {
      "url": "https://langfuse.com/resources/engineering/clickhouse-at-agent-scale",
      "scope": "Primary architecture description checked: workload-specific migration, monthly partitions, derived materialized table and payload indexes. Other survey claims not exhaustively refreshed."
    }
  ],
  "documents": {
    "analytics-store-design.md": {
      "disposition": "reverify",
      "reason": "Wide events are a useful design, not the universal end state. Index seeks are not the right plan for every aggregate; document stores can aggregate and warehouses can serve point reads. Native timestamps can preserve portable semantics. Accounting requires atomic reservations/transactions, not a clock column alone; traces must be tenant scoped. Hardware/workload evidence cannot establish a universal ingest ceiling."
    },
    "techniques/analytical-copy-partitioning.md": {
      "disposition": "clarify",
      "reason": "Repaired universal scale/economics claims, partition correctness, replay/correction/deletion semantics, freshness and embedded-engine overhead. Analytical routing follows measured workload and consistency requirements."
    },
    "techniques/backend-parity-as-contract.md": {
      "disposition": "reverify",
      "reason": "Reference behavior needs an independently stated contract and can encode a bug. Unsupported analytics must be absent with explicit coverage, not numeric zero plus a caveat. Partial listings can be valid with pagination or declared coverage; resource limits and performance guarantees can be part of a contract. Tests cover specified cases, not all semantics."
    },
    "techniques/capability-flags-and-refusal.md": {
      "disposition": "reverify",
      "reason": "Unsupported is scoped to implementation/version/query, not permanent physics. Retry only retriable failures; an outage is not the only failure. Protocol code depends on the API contract and flags must express predicate combinations sufficiently. Refusal tests do not make a backend immune to every regression."
    },
    "techniques/dashboard-driven-composite-indexes.md": {
      "disposition": "reverify",
      "reason": "Equality-first is a common B-tree strategy, not iff; include unique cursor tie-breaker and verify plans. Grouping indexes still scan matching rows; residual filtering is not free. JSON/expression indexes can be valid, partial indexes retain structure, and backend/statistics/write costs govern useful composites."
    },
    "techniques/fixed-width-timestamp-encoding.md": {
      "disposition": "clarify",
      "reason": "Repaired collation, supported year/precision range, parsing versus canonical storage and cursor tie ordering. Source grep is a guard, not proof that all external writers or encoders conform."
    },
    "techniques/flat-events-plus-json-linkage.md": {
      "disposition": "clarify",
      "reason": "Repaired zero-default token assumptions, JSON index/constraint impossibility, flat-only doctrine and migration/materialization boundaries. Preserve tenant scope, idempotency, source authority and dual-write consistency."
    },
    "applications/process--analytical-copy-partitioning.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained. Primary Langfuse page supports its own migration and throughput story but also explicitly uses a materialized derived table and payload text indexes, contradicting blanket doctrine. Monthly partition count depends on time span, not row count alone. Other platform volumes, storage prices, sampling rates and survey-wide convergence remain unverified; no benchmark rerun."
    },
    "applications/rust--backend-parity-as-contract.md": {
      "disposition": "reverify",
      "reason": "Historical code/version/date retained, not rerun. Required check names do not prove branch protection, and assertions can miss uncovered semantics. Test isolation also needs cleanup and resource policy on shared stores; fresh project ids do not make all effects safe. Existing note already identifies partial matrix and skip risks."
    },
    "applications/rust--capability-flags-and-refusal.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. Firestore supports count/sum/average aggregation; inability to serve this GROUP BY/HAVING contract is narrower than no aggregation. Bounded O(matched-docs) needs an enforced bound. Empty cost defaults remain unknown costs, not zero, even with external documentation."
    },
    "applications/sql--dashboard-driven-composite-indexes.md": {
      "disposition": "reverify",
      "reason": "Historical schema/version/date retained, not rerun. Query plans and latency were not measured. Need stable tie ids for keyset, tenant isolation for trace fetch, and honest legacy receipt-time fallback. Expression/index benefits and warehouse pruning depend on actual predicates and distribution."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

All eleven documents read in full at restored bytes: golden path, six techniques,
four applications. Nothing under `knowledge/` was edited.

The subject's organizing move — that an operator-side analytics store serves
unknown future queries by third parties, so every schema decision is a product
decision — is the right frame and it carries the whole design. The three
adjectives pulling against each other (fast, portable, honest) and the resolution
by explicit per-surface negotiation rather than by lowest-common-denominator is
correct, and the two-clocks section is stated at the strength it deserves: not a
modelling preference but "the single most consequential modeling error in the
domain", with the index families and the partitioning rule both derived from it
downstream. `dashboard-driven-composite-indexes` is the best-worked technique
here — the equality-first-range-last rule is stated with the silent failure it
prevents ("on the dev database this is indistinguishable from correct"), and the
expression-index subtlety about coalesced migrated columns is the kind of detail
that only comes from having been bitten.

**One claim wrong at the concrete backend the subject uses.** The golden path
describes "a document store that cannot aggregate server-side", and
`techniques/capability-flags-and-refusal.md` repeats it as "genuine physics (a
backend that *cannot* aggregate)". Firestore — the document-store port both Rust
applications are written against — has supported server-side aggregation for some
years: COUNT, and subsequently SUM and AVG. What Firestore genuinely lacks is
grouped aggregation with aggregate predicates, which is exactly what
`applications/rust--capability-flags-and-refusal.md` says, and says precisely: "a
`GROUP BY trace_id` with aggregate `HAVING` predicates and an `(ended, trace_id)`
keyset — the one rollup that cannot be reconstructed client-side within a bounded
read." So the application is right and the two layers above it overstate. The
overstatement matters because "cannot aggregate" is the premise the refusal is
justified from, and a reader who checks it will find it false and discount the
refusal doctrine along with it. Narrow both to grouped-aggregation-with-predicates.

**One number wrong in the direction that weakens its own argument.**
`applications/process--analytical-copy-partitioning.md` prices the retention
ladder as "hot SSD tier at full resolution (days to a month), warm, then cold
object storage at ~$0.023/GB-month versus $1.50–3.00/GB ingested at observability
SaaS list price." Checked against current AWS pricing: $0.023/GB-month is the
**S3 Standard** first-tier rate — the hot tier — while genuine cold classes are
roughly $0.004/GB-month for Glacier Instant Retrieval and under a tenth of a cent
for Deep Archive. The tiering economics the paragraph exists to argue are
understated by around six-fold. Either quote a real cold-tier rate or relabel the
figure as standard-tier object storage.

**One boundary the guard technique claims wider than it can hold.**
`techniques/fixed-width-timestamp-encoding.md` makes its invariant structural with
a build-time check that "scans every source file in the workspace", and then
extends the claim: "It covers clients and tools, not just the server: an SDK that
formats client event time variably poisons the store from outside." A workspace
grep covers the workspace. An SDK that lives in another repository — which is
precisely the population named as the poisoning risk, and precisely the population
a store with third-party callers has most of — is outside its writ. The technique
should say what the guard bounds (this workspace's copies of the formatter) and
what it cannot (any writer built elsewhere), because the current phrasing invites
a team to believe the invariant is enforced when it is enforced on one side.

**One gap the parity technique leaves open.** Blast radius routes analytical
degradation to "disclosed in the payload — a caveat field the rendering surface
can show". Nothing obliges the renderer to show it, and
`applications/rust--capability-flags-and-refusal.md` documents exactly that state
in the repo: the parity matrix is truthful and lives in the docs, so a reader of
the rendered trend chart still cannot tell a zero-cost series from a free month.
The technique names the disclosure location correctly and stops one layer short of
the surface where the lie is actually told.

The two Rust applications are the strongest in my group. `rust--backend-parity-as-contract`
is a complete loop — a contract that is a function, both permitted states asserted
in the same suite, the forbidden quiet default caught from both directions, and
three separate required checks because an env-gated suite that silently skips is
not evidence — and it is honest that "required" is a branch-protection setting the
workflow can only request, which no test can hold.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/analytics-store-design",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:ee9ee6c2e2807660",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes: golden path, 6 techniques, 4 applications. Primary-source check performed on the object-storage price figure in the field survey (current AWS S3 storage-class pricing read). The document-store aggregation claim was checked against known Firestore aggregation support and cross-read against the subject's own Firestore application. Not evaluated: the LightTrack schema and conformance-suite line anchors, any query plan or latency measurement, the survey's platform-throughput and dashboard-speedup figures, and any application maturity or verified_on refresh. No knowledge/ file was edited.",
  "counterexamples": [
    "Firestore serves COUNT, SUM and AVG server-side, so 'a document store that cannot aggregate server-side' is false of the very backend this subject's applications refuse traces on; only grouped aggregation with aggregate predicates is genuinely out of reach.",
    "A rendering surface that receives a caveat field and does not display it satisfies 'the disclosure belongs in the payload' while still showing a zero-cost series that reads as a free month.",
    "A client SDK maintained in a separate repository formats a timestamp inline; the workspace-scoped guard test passes and every backend inherits the width drift anyway.",
    "On an analytical warehouse with a native temporal type the fixed-width string contract is explicitly waived, and the partitioning technique's mirror-the-logical-schema rule then requires the two stores to disagree about time's type by design — a mapping stated once, and a place where 'same columns, same names, same meanings' is not literally true.",
    "An additive default that a backend still inherits is forbidden as a quiet default and permitted as a documented degradation, and the same code produces both — the distinction lives entirely in whether someone wrote a matrix row, which no build can check."
  ],
  "sources": [
    {
      "url": "https://www.cloudzero.com/blog/s3-pricing/",
      "result": "Established current AWS S3 storage-class rates: $0.023/GB-month is S3 Standard (the hot tier), S3 Glacier Instant Retrieval is about $0.004/GB-month, and Deep Archive is roughly a tenth of that, with retrieval fees separate. This refutes the field survey's use of $0.023/GB-month as the cold-tier rate in its retention-ladder argument. It did not establish the $1.50-3.00/GB observability SaaS ingest figure, which remains unverified."
    },
    {
      "path": "knowledge/llm-observability/telemetry-and-data/analytics-store-design/applications/rust--capability-flags-and-refusal.md",
      "result": "Read as a cross-check on the golden path and the refusal technique. Established that the application states the Firestore limitation precisely (a GROUP BY with aggregate HAVING and a keyset, not aggregation in general) while the two layers above it generalize to 'cannot aggregate', and that the same application already documents the payload-versus-docs disclosure gap the parity technique leaves open. It did not establish the current state of the LightTrack tree."
    }
  ],
  "documents": {
    "analytics-store-design.md": {
      "disposition": "clarify",
      "reason": "The unknown-future-queries frame, the three pulling adjectives, the two-clocks section and the failure-mode catalogue all hold. One factual overstatement: 'a document store that cannot aggregate server-side' is false of Firestore, the concrete document store the subject's own applications are written against, which serves COUNT/SUM/AVG but not grouped aggregation with aggregate predicates. Narrow the claim; the refusal doctrine it justifies survives the narrowing intact."
    },
    "techniques/flat-events-plus-json-linkage.md": {
      "disposition": "keep",
      "reason": "The column-versus-JSON boundary is given a testable criterion rather than a taste, the additive-promotion procedure names the migration-ordering trap that only breaks on existing deployments, and the derived-views-stay-derived rule carries its own field-observed boundary (identity attributes denormalized at columnar scale) rather than pretending the rule is unqualified."
    },
    "techniques/fixed-width-timestamp-encoding.md": {
      "disposition": "clarify",
      "reason": "The invariant, the canonical form and the three query families it makes correct are exactly right, as is the diagnosis of why the bug is the worst kind (rare, data-dependent, invisible against full-precision test clocks). The guard's claimed reach is not: a build-time scan over the workspace cannot cover an SDK maintained in another repository, which is the population the technique itself names as the outside poisoning risk. State what the guard bounds and what it does not."
    },
    "techniques/dashboard-driven-composite-indexes.md": {
      "disposition": "keep",
      "reason": "The best-worked technique in the subject. Equality-first-range-last is stated with the silent failure it prevents and the reason it survives a dev database; the derivation procedure prunes as much as it mints; the two-clock index families identify the accounting composite as the hot-path one; and the expression-index clause about coalesced migrated columns is a detail that does not come from theory."
    },
    "techniques/capability-flags-and-refusal.md": {
      "disposition": "clarify",
      "reason": "Refusal as a typed outcome distinct from failure, per-predicate granularity, flags derived from the same place as the behavior, and the refusal-under-test clause are all correct and the last is rightly called the highest-leverage rule here. The physics example generalizes further than it should: 'a backend that cannot aggregate' misdescribes Firestore, which the subject's own application characterizes precisely. Fix the example, keep the rule."
    },
    "techniques/backend-parity-as-contract.md": {
      "disposition": "clarify",
      "reason": "The reference backend, the three permitted states, the named forbidden fourth, and the blast-radius decision rule are the right architecture, and the matrix-as-review-gate clause is what keeps a matrix true. One gap: analytical degradation is routed to 'disclosed in the payload — a caveat field the rendering surface can show', with nothing obliging the surface to show it. The subject's own Firestore application documents that exact state as shipped. Close the rule at the surface, not at the payload."
    },
    "techniques/analytical-copy-partitioning.md": {
      "disposition": "keep",
      "reason": "Sink-not-peer is stated as three separate obligations rather than a slogan, partitioning is correctly placed on event time with the consequence for accounting reads drawn out, the fork trigger is a query class rather than a row count, and the inversion boundary and the in-process-columnar amendment both revise the technique's own economics rather than defending them. The discriminator for warehouse versus linked engine (whether the copy has consumers outside this service) is the useful sentence."
    },
    "applications/process--analytical-copy-partitioning.md": {
      "disposition": "reverify",
      "reason": "One checkable number is wrong: '$0.023/GB-month' is quoted as the cold object-storage rate in the retention-ladder argument, and that is the S3 Standard hot-tier rate — genuine cold classes are around $0.004 and below, so the survey understates its own case roughly six-fold. Separately, the Langfuse redesign figures (initial loads seconds to tens of milliseconds, dashboards at least 10x faster) and the throughput ceiling are vendor engineering-blog self-report rather than independent measurement, and the counter-evidence lane's platform-convergence claim rests on three vendors. refresh_by 2026-11-20 is still in force."
    },
    "applications/rust--backend-parity-as-contract.md": {
      "disposition": "reverify",
      "reason": "The strongest application in this group and a complete loop: a contract that is a function, refusal and quiet-default both asserted in one suite, and three separate required checks because an env-gated suite that silently skips proved only that SQLite conformed. It is honest that 'required' is a branch-protection setting the workflow can only request and that the parity matrix covers one surface. Not re-executed and the line anchors were not checked."
    },
    "applications/rust--capability-flags-and-refusal.md": {
      "disposition": "keep",
      "reason": "The most precisely scoped document in the subject, and the one the two layers above it should be narrowed to match: it names the exact rollup Firestore cannot serve rather than claiming Firestore cannot aggregate, and it shows the same backend implementing where a bounded client-side reconstruction is honest. Its documented tension — matrix truthful, disclosure in docs rather than payload — is the counter-case the parity technique needs and does not resolve."
    },
    "applications/sql--dashboard-driven-composite-indexes.md": {
      "disposition": "reverify",
      "reason": "The three-backend derivation (b-tree composites, expression index over the coalesced accounting column, partition-plus-cluster in the warehouse) is a clean demonstration that one query surface produces two physics, and the rationale-as-comment discipline is applied literally. No query plan or latency was measured here or there, so the 'degraded to a residual scan' incident and the partial-index payoff are reported rather than shown; frontmatter reads verified_against sql@16, which names an engine version without naming the engine."
    }
  }
}
```
