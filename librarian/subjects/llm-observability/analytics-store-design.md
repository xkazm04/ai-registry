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
