---
subject: llm-call-telemetry-model
domain: llm-observability
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# llm-call-telemetry-model

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.

Cross-bundle placement question recorded in the replication note (Q3): the agent gateway realises `server-owned-fields` with message metadata in place of billing attribution; whether llm-agent may share the technique across bundles or must mint a sibling is a registry rule, not decided here.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Application `node--token-usage-quadruple`** (negative), from an agent harness
that computes cost in **two userspaces** because the model call can be made from
either of two executors. Its design document states this subject's rule with the
right reason - the two cache buckets are kept separately because reads and writes
bill at different rates, so a collapsed number cannot be re-derived. One userspace
implements it. The other - the default harness - reads the cache-*read* token
field and never reads cache-*creation*, so the number is discarded at the
provider-usage boundary before any pricing runs, and the persisted record carries
no latency either.

The consequence is this technique's own sentence realised: *folding writes into
input under-prices exactly the traffic engineered for reuse* - aggravated, because
the writes are not folded, they are dropped to zero, and because the field is
discarded at ingest rather than at pricing, re-pricing cannot recover it. That
defeats the store's own stated property that cost is re-derivable from tokens.

**The part worth keeping** is the claimed test. The design document specifies
exactly the coverage that would have caught this - assert the persisted cost
"through a Rust executor **and** through the TypeScript path, so coverage is
pinned on both userspaces". Searching every TypeScript test in the tree for an
assertion on the persisted cost field returns **zero**; the other side asserts it
in three places. So the parity a reader was told is pinned is pinned on one side.
The rule this sharpens: where a telemetry schema has more than one emitter, the
schema is not the contract - the emitters are, and a field is only as real as the
least complete one. A shared type carrying the right shape is not enforcement.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/llm-call-telemetry-model",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:4a31e1a34c0d7488",
  "disposition": "reverify",
  "coverage": "All 13 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A paid stream fails before final usage; default zero tokens makes a book lookup fabricate a free call.",
    "A scalar metadata value cannot hold api_key_id, leaving a credential-authenticated row unattributed.",
    "A buffered call from last month arrives today: service-period reporting and receipt-window admission legitimately use different clocks.",
    "received_at equals event time for both a genuine immediate event and a backfilled row, so equality is not a unique provenance sentinel."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/llm-call-telemetry-model",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
      "scope": "Primary documentation confirms input excludes cache reads/writes, separate usage fields, TTL-specific write pricing and model-specific read-rate exceptions. Other provider and platform survey facts not refreshed."
    }
  ],
  "documents": {
    "llm-call-telemetry-model.md": {
      "disposition": "reverify",
      "reason": "A normalized row supports accounting but cannot prove completeness or truthful client quantities. Event identity must distinguish call, attempt and delivery for deduplication. Receipt-time admission is separate from service-period reporting and hard pre-call reservation. Missing mandatory usage cannot honestly become measured zero; canonicalization must respect the ID format. Non-object metadata must not disable required credential attribution."
    },
    "techniques/dual-clock-event-time.md": {
      "disposition": "clarify",
      "reason": "Repaired every-money-read receipt-time rule, receipt as sufficient enforcement, ambiguous backfill equality and blanket third-clock prohibition. Distinguish accepted-event windows, service periods and timestamp provenance; monitor server clocks and preserve first receipt on retries."
    },
    "techniques/ingest-skew-rejection.md": {
      "disposition": "reverify",
      "reason": "Skew bounds are operational policy, not proof that old/future events are nonsense. Server clock faults can cause valid rejections and need monitoring; timestamp validity can affect security/retention. Explicit historical-import paths and quarantine can be legitimate. Partial versus atomic batch semantics must be declared, and rejected paid usage remains an accounting coverage gap."
    },
    "techniques/metadata-attribution-keys.md": {
      "disposition": "clarify",
      "reason": "Repaired scalar metadata as acceptable attribution omission, client customer IDs as enforcement authority and maps as necessarily unindexed. Server-owned provenance needs a separate validated envelope or object-only schema; provider data relayed by an untrusted client is still a claim."
    },
    "techniques/nullable-cost-never-zero.md": {
      "disposition": "clarify",
      "reason": "Repaired universal book-over-biller trust hierarchy, all missing usage as priced zero, null as automatically forcing consumer honesty and prohibition of auditable corrections. Coverage is needed beyond unpriced stored rows, and partial sums may use zero internally if full missingness semantics survive."
    },
    "techniques/server-owned-fields.md": {
      "disposition": "reverify",
      "reason": "Stamp-and-strip is sound but shared code alone does not prove all paths call it. Server-clock, deserialization and trusted-import semantics require separate input/storage DTOs. Authenticated relay and original caller identities differ. Historical attribution can be corrected from trustworthy evidence with explicit provenance; not every nonreplayable hash is categorically unsafe. Scalar metadata omission remains a bypass unless repaired at the schema boundary."
    },
    "techniques/token-usage-quadruple.md": {
      "disposition": "clarify",
      "reason": "Repaired missing input/output as measured zero, overlapping billing classes, four-counter universality and never-stored total rule. Usage validity must gate pricing; provider totals may be preserved as evidence and validated. Types or validated maps can both enforce a pricing contract."
    },
    "applications/node--metadata-attribution-keys.md": {
      "disposition": "reverify",
      "reason": "Historical Node producer and incident retained, not rerun. Person-level cost/revenue joins do not automatically establish org economics. Missing event time should disclose receipt fallback. Best-effort swallowed errors and HTTP success can permanently lose paid usage/revenue; deterministic order/refund IDs need account scope, cumulative-update semantics and ordering, not merely distinct prefixes."
    },
    "applications/node--token-usage-quadruple.md": {
      "disposition": "reverify",
      "reason": "Historical structural cache-write omission retained at cited commit, not rerun. Per-emitter persisted fixtures are valuable, but search absence is scoped to searched tests and shared types remain part of the contract. Equal normalizers do not prove provider usage completeness; missing usage and TTL-specific pricing require coverage."
    },
    "applications/process--dual-clock-event-time.md": {
      "disposition": "reverify",
      "reason": "Historical field contract retained, not rerun. The shown client-time cost/use-case rollups contradict the universal every-money-read receipt doctrine but may be correct for service-period reporting. Equal timestamps do not uniquely identify backfill and prose cannot prevent implementation drift. Default skew intervals are local policy."
    },
    "applications/process--token-usage-quadruple.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained, not fully refreshed. Anthropic primary documentation confirms exclusive input plus separate read/write counts and TTL pricing; current read multipliers have model exceptions, so universal ratios are unsafe. OpenTelemetry conventions URL moved and current normative convention was not verified here. Other provider/platform capabilities and pricing remain unrefreshed; missing usage must not become zero."
    },
    "applications/python--server-owned-fields.md": {
      "disposition": "reverify",
      "reason": "Historical deer-flow source/AGENTS observations retained, not rerun. Documentation and a key list do not establish every enforcement path. Trace correlation supplied by callers can be valid when explicitly treated as untrusted correlation distinct from trusted request identity. Producer conventions do not guarantee middleware coverage or accounting completeness."
    },
    "applications/rust--server-owned-fields.md": {
      "disposition": "reverify",
      "reason": "Historical Rust snippet retained, not rerun. Scalar/array metadata avoids api_key_id stamping and can evade per-key accounting if consumers omit unattributed rows. A skipped deserialization field with default-now can also rewrite stored receipt time when the same DTO is used for reads; separate paths need verification. Year greater than 2020 does not test freshness tightly. Cost-source stripping for null cost and batch parity remain unproven."
    }
  }
}
```
