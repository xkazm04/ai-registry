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

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 13
owned documents read in full: the golden path, six techniques, six applications.
Three primary sources were resolved this run, and two cited seams were opened in
the local tracklight tree.

**Retraction.** The earlier 2026-09-10 record's repairs were part of the pass
reverted the same day; its dispositions are retracted as an outstanding work
list and retained above as history. The reverted text answers most of what that
record asked for in its own words — `nullable-cost-never-zero` already carries
the three-grade provenance argument and the explicit "a zero cost is storable"
carve-out; `token-usage-quadruple` already states the defaulted-zero weakness of
the mandatory pair and names the fix (a status flag, not nullable counters).

**Sources checked (read, not executed).** The Anthropic prompt-caching
documentation confirms, field by field, what `process--token-usage-quadruple`
attributes to it: `input_tokens` excludes cache traffic (it is the tokens after
the last cache breakpoint, with `total = cache_read + cache_creation + input`),
cache reads bill at 0.1×, 5-minute writes at 1.25× and 1-hour writes at 2.0×,
and the response carries a `cache_creation` breakdown per TTL
(`ephemeral_5m_input_tokens` / `ephemeral_1h_input_tokens`). One currency drift
found, inside the application's `refresh_by: 2026-11-20` window: cache reads now
bill at 0.025× on two newer model lines, so "~0.1× the input rate" is no longer
uniform.

The OpenTelemetry GenAI semantic conventions have moved to their own repository
since the survey was written; resolved there, the attribute registry confirms
the claim verbatim — `gen_ai.usage.input_tokens` "SHOULD include all types of
input tokens, including cached tokens", with `gen_ai.usage.cache_read.input_tokens`
beside it. Two facts the survey predates and which strengthen rather than
contradict it: `gen_ai.usage.cache_write.input_tokens` now exists as a registry
attribute — the fifth counter `token-usage-quadruple` says "a schema drawn today
should reserve", now reserved by the normalization target itself — and the
registry has gone per-modality on the cache side
(`gen_ai.usage.text/image/audio.cache_read.input_tokens`). The technique's
counter bar ("the day one of *your* providers prices it distinctly, not the day
it appears in someone's API reference") is unchanged by that, and correctly so;
but its "resist per-modality expansion" rule is now arguing against a shape the
standard has adopted, which the reader deserves to know.

**Tree checks.** `crates/core/src/event.rs` carries `received_at` as
`#[serde(skip_deserializing, default = "Utc::now")]` with the doctrine in its
doc-comment and the outside-in test
`received_at_is_server_owned_and_ignores_the_client`; `crates/api/src/events.rs`
has `prepare_event` calling `normalize_ids`, `stamp_api_key` and
`mark_cost_source` in the order the technique prescribes. Cited line numbers have
drifted (the event type has grown by ~70 lines since 2026-08-20) but every
property held.

**No finding rises to a required content change.** The nearest thing is a naming
tension the subject already discloses: the technique is called
`token-usage-quadruple` and its own body argues the class list has moved past
four, with the golden path agreeing that "the durable invariant is not the count
four but the rule behind it". A reader who takes the name as the specification
ships four counters and folds cache writes; a reader who reads the body does
not. That is a hazard of the name, not a wrong claim, and renaming a technique
is a heavier act than this review should recommend on its own.

**Not evaluated.** No ingest run, no serialization round-trip executed, no
provider API called. The `node--metadata-attribution-keys` and
`node--token-usage-quadruple` trees (`grant`, and the agent harness at commit
`7801005`) were not opened; the second's central claim — that the TypeScript
emitter drops the cache-creation field and that no TypeScript test asserts the
persisted cost — rests on a search this review did not repeat. The
`python--server-owned-fields` tree (deer-flow at `08b27aef`) was not opened.

**Frontmatter note, not a content finding.**
`applications/python--server-owned-fields.md` carries no `status:` key, and
`applications/node--token-usage-quadruple.md` carries `proof: structural-only`
without the `applied:` / `ab_verdict:` pair that convention puts beside it.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/llm-call-telemetry-model",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:691abe9c064cf12e",
  "disposition": "keep",
  "coverage": "All 13 owned documents read in full against the reverted bytes. Three primary sources resolved by reading (Anthropic prompt-caching docs; OpenTelemetry GenAI attribute registry, at its new repository; the moved OTel metrics page). Two cited seams opened in the local tracklight tree. Not evaluated: any ingest run, serialization round-trip or provider call; the grant, agent-harness and deer-flow trees the node and python applications cite.",
  "counterexamples": [
    "A provider that reports a cache-write counter the schema does not model leaves the technique's own advice ambiguous under its title: the name says four counters, the body says reserve a fifth.",
    "An emitter that sends no client timestamp at all (the grant application's own case) collapses the dual clock to receipt time for that producer, so the debugging-reads guarantee the technique promises does not hold fleet-wide — the golden path states the split as if both clocks always arrive.",
    "A call whose usage block never arrives (an aborted stream) is stored with mandatory counters defaulted to 0, indistinguishable from a measured zero — named as a known weakness, but it means the model's own absent-vs-zero doctrine has a sanctioned exception on its two most load-bearing fields."
  ],
  "sources": [
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "Read (not executed). Confirms input_tokens excludes cache traffic, total = cache_read + cache_creation + input, 0.1x reads, 1.25x 5-minute writes, 2.0x 1-hour writes, and a per-TTL cache_creation breakdown. Establishes one drift: read pricing is 0.025x on two newer model lines, so the survey's uniform '~0.1x' has an exception."
    },
    {
      "url": "https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/registry/attributes/gen-ai.md",
      "result": "Read (not executed). Confirms gen_ai.usage.input_tokens 'SHOULD include all types of input tokens, including cached tokens' and gen_ai.usage.cache_read.input_tokens. Establishes two facts the survey predates: gen_ai.usage.cache_write.input_tokens now exists, and per-modality cache_read counters (text/image/audio) have been added. Does not establish anything about how any particular platform stores these."
    },
    {
      "url": "https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/",
      "result": "Read (not executed). Establishes only that the GenAI conventions have moved to a separate repository; the metrics document itself defines gen_ai.client.token.usage with an input/output token-type attribute and carries no cache guidance. The survey's claim had to be resolved in the attribute registry instead — a citation the application should point at directly."
    },
    {
      "path": "C:/Users/kazda/kiro/tracklight",
      "result": "Read at d398835. Confirms received_at as skip_deserializing with a default, the named outside-in test, and prepare_event's normalize_ids / stamp_api_key / mark_cost_source ordering. Cited line numbers have drifted since 2026-08-20. Nothing was built or executed."
    }
  ],
  "documents": {
    "llm-call-telemetry-model.md": {"disposition": "keep", "reason": "The five field families, the constitution property (one function, before storage) and the absence-is-disclosed posture hold, and the token-family paragraph already states the durable invariant as the rule rather than the count four. The dual-clock section assumes both clocks arrive; one of the subject's own applications documents an emitter that sends no client timestamp."},
    "techniques/dual-clock-event-time.md": {"disposition": "keep", "reason": "Two owners, two jobs, the decision rule for an ambiguous read, enforcement at the deserialization boundary and the documented backfill sentinel are each stated with the failure they prevent. The refusal to add a third clock is the right boundary and is argued, not asserted."},
    "techniques/ingest-skew-rejection.md": {"disposition": "keep", "reason": "The asymmetric bounds are justified by the honest population each direction admits, and the tuning rule ('which honest emitter would this reject?') is operational. Reject-not-clamp, per-item batch rejection, codes-are-contract and count-what-you-refuse are all consistent with the golden path's one-door rule."},
    "techniques/metadata-attribution-keys.md": {"disposition": "keep", "reason": "The map-not-columns trade is stated with the cost accepted (un-indexed residual predicates) and a promotion rule on evidence. The three discipline rules and the four production edge rules — including non-object metadata being left alone and the served-tier witness overriding a requested lane — are concrete and internally consistent."},
    "techniques/nullable-cost-never-zero.md": {"disposition": "keep", "reason": "The null-vs-zero argument, the aggregates-disclose-their-unpriced-count corollary, the three provenance grades and the price-at-ingest-once rule are coherent, and the zero-as-fact carve-out prevents the doctrine from over-reaching. The scope limit at the end (do not extend nullability to fields where substitution cannot corrupt an accounting outcome) is what keeps it usable."},
    "techniques/server-owned-fields.md": {"disposition": "keep", "reason": "The canonical set, the membership rule, and the stamp-and-strip mechanism (including the unauthenticated bypass lane, which is the half most implementations miss) are realized in the tree as written. The closing 'when not to server-own' draws the line correctly: stamping what you cannot verify destroys data and signs your name to it."},
    "techniques/token-usage-quadruple.md": {"disposition": "keep", "reason": "Every provider-facing claim was corroborated against the Anthropic docs and the OTel registry this run, including the cache-write premium tiered by TTL and the inclusive-totals-with-sub-counts normalization target. Two currency notes for the next pass: cache_write is now a registry attribute, and the registry has gone per-modality on cache reads, which the technique's 'resist per-modality expansion' rule now argues against rather than merely predating."},
    "applications/node--metadata-attribution-keys.md": {"disposition": "keep", "reason": "Reads the technique from the producer's seat and adds a genuine discipline (ambient attribution via async context, with its cost stated: a missing parameter becomes a missing key). Its own deviation is named — nothing on the emitting side measures the untagged bucket. The grant tree was not opened this run."},
    "applications/node--token-usage-quadruple.md": {"disposition": "keep", "reason": "The finding — one userspace counts cache writes, the other discards them at the boundary, and the parity the design document claims is tested on one side only — is exactly the shape the technique predicts, and the document is careful that the field is dropped at ingest and therefore unrecoverable. Not re-searched this run; carries proof without the applied/ab_verdict pair."},
    "applications/process--dual-clock-event-time.md": {"disposition": "keep", "reason": "Records the contract-travels-with-the-schema realization: each timestamp row names its owner and enumerates its readers, with the skew bound inline and the backfill sentinel stated. Consistent with what the tree still shows, at drifted line numbers."},
    "applications/process--token-usage-quadruple.md": {"disposition": "keep", "reason": "Its two most checkable claims were re-resolved this run and held: the Anthropic per-call fields and multipliers, and the OTel inclusive-totals convention. Two updates owed at its refresh date rather than now — the 0.025x cache-read tier, and the registry's new cache_write and per-modality attributes. Its OTel citation should point at the attribute registry in the new repository, where the sentence actually lives."},
    "applications/python--server-owned-fields.md": {"disposition": "keep", "reason": "Transplants the stamp-and-strip door to a run request rather than a telemetry event and adds the unconditional-stamping rule ('a fact whose presence depends on whether an observer is installed is not a fact'), with an honest ceiling: the server-owned set is a list, and a forgetful middleware yields no provenance rather than wrong provenance. Tree not opened; carries no status frontmatter key."},
    "applications/rust--server-owned-fields.md": {"disposition": "keep", "reason": "The two seams cited were opened this run and match: skip_deserializing with a default plus the outside-in test, and one preparation function stamping project, receipt time, ids, credential and cost provenance in order. The four-arm stamp_api_key including the strip-on-no-credential branch is the load-bearing half and is present."}
  }
}
```
