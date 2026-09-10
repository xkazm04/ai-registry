---
domain: llm-observability
subject: multi-provider-event-normalization
---

# multi-provider-event-normalization

## 2026-08-28 - /harvest batch 1 + A/B evaluation

Landed: declared two-axis identity paragraph on `provider-family-matching`;
lists-resolve-names-not-shapes bullet + cost-attribute-stability currency
clause on `attribute-precedence-lists` (from the second major span
convention). A/B probe (spend-ledger identity/normalization design) returned
**impact-positive with caveats**, blind 9-6: declared-identity-first was
decisive, but the sender-cost-as-claim rule that also decided it pre-existed
in both arms' packs (arm variance, not the landing), and the landed shapes
clause did NOT transfer into either arm's answer - watch whether its wording
earns its place or needs sharpening at the next sweep.
Evaluation ledger: [[../../harvest/evaluations.md]].

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/multi-provider-event-normalization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:e844695fb7461ff3",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two tenants can submit the same trace and span strings; deduplication must not cross tenant boundaries.",
    "Two spans in one trace with absent span IDs collapse if trace alone is used as the key.",
    "Inclusive input of 100 with 20 cache-write tokens must not price all 100 at base and add the 20-token write charge."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/telemetry-and-data/multi-provider-event-normalization",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://opentelemetry.io/docs/specs/otlp/",
      "scope": "Primary OTLP response and partial-success contract consulted; current GenAI attribute version matrix not fully refreshed."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "scope": "Primary provider pricing page distinguishes hosting/geography pricing, refuting unconditional hosted-family price equivalence."
    }
  ],
  "documents": {
    "multi-provider-event-normalization.md": {
      "disposition": "reverify",
      "reason": "Normalize equivalent facts, preserving unknowns and provenance, but family substring identity is unsafe for billing and hosted prices can differ. OTLP response semantics are not arbitrary native per-item errors. Receipt-time admission cannot prevent already incurred spend. Current convention stability and exact rename claims need version-specific checks; retaining total usage is useful even without a split."
    },
    "techniques/attribute-precedence-lists.md": {
      "disposition": "reverify",
      "reason": "First present requires type/validity and conflict policy; latest name need not be correct or semantically identical under every instrumentation version. Request model and response model are distinct facts. Preserve bounded safe provenance, not every arbitrary losing payload indefinitely. Compatibility retirement can be justified even while old senders remain; coverage depends on semantics, not list length."
    },
    "techniques/deterministic-span-derived-ids.md": {
      "disposition": "clarify",
      "reason": "Repaired span-only fallback as globally unique, missing span with trace-only collision, client IDs as globally trusted and duplicate acknowledgement before content comparison. Deterministic keys need tenant scope, atomic persistence and conflict policy."
    },
    "techniques/per-provider-usage-extractors.md": {
      "disposition": "reverify",
      "reason": "Per-provider adapters are useful but host, API and SDK versions can differ within one family. A declarative generic engine over explicit schemas is legitimate; response sniffing can be explicit validated dispatch rather than guessing. Missing details can leave inclusive totals unknown, and stream accumulation must distinguish deltas from totals. Both server and wrapper can possess raw provider responses."
    },
    "techniques/provider-family-matching.md": {
      "disposition": "clarify",
      "reason": "Repaired hosted-family price equivalence and eager substrings as making totals honest. Preserve host and model identity as pricing dimensions; ambiguous mapping is explicit rather than first-match pricing."
    },
    "techniques/refuse-to-derive.md": {
      "disposition": "reverify",
      "reason": "Do not invent input/output split, but preserve reported total as its own fact. Total minus known component can be valid under a declared complete relationship. Invalid values differ from absent fields and deserve diagnostics. Supported estimates can be stored separately with provenance; gen-AI namespace alone does not prove an inference call."
    },
    "techniques/two-doors-one-pipeline.md": {
      "disposition": "reverify",
      "reason": "Shared semantic pipeline is useful, but authentication, payload limits, content-type and wire validation belong at doors. OTLP partial success, retryable errors and endpoint behavior must follow its protocol. Identical pipeline code cannot prove all callers use it or that retrospective caps prevent upstream spend. Cost and debugging time bases are scoped."
    },
    "applications/process--per-provider-usage-extractors.md": {
      "disposition": "reverify",
      "reason": "Dated provider matrix retained, not fully refreshed. The displayed inclusive-input formula subtracts reads but then adds cache-write cost without subtracting writes, double-pricing writes already in the total. Total may contain other classes; missing fields must not silently become zero. Historical convention claims need version pins."
    },
    "applications/rust--attribute-precedence-lists.md": {
      "disposition": "reverify",
      "reason": "Historical Rust mapper retained, not rerun. First-present then as_u64 can suppress a valid legacy field when the preferred field is malformed; record explicit conflict/error policy. Dropping total loses real evidence. Preserved provider/model metadata alone cannot reconstruct missing token attributes, so full remapping claim is too strong."
    },
    "applications/rust--two-doors-one-pipeline.md": {
      "disposition": "reverify",
      "reason": "Historical Rust architecture retained, not rerun. Native-like 429/per-item semantics may not match OTLP exporter expectations. Shared handler does not prove atomic duplicate accounting, tenant scope or transport validation. Attribute prefixes can include non-inference agent spans, and retrospective telemetry rejection cannot undo paid generation."
    }
  }
}
```
